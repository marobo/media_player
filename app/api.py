"""FastAPI application: JSON API, media streaming and static frontend."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import Any, Literal

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import FileResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from .config import AUDIO_EXTENSIONS, VIDEO_EXTENSIONS, Settings, detect_lan_ip, settings
from .library import HAVE_MUTAGEN, Library
from .store import Store
from .streaming import range_file_response, safe_resolve

log = logging.getLogger("media.api")


# --------------------------------------------------------------------------- models
class PlaylistCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    items: list[str] = Field(default_factory=list)


class PlaylistUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=120)
    items: list[str] | None = None


class ItemIds(BaseModel):
    ids: list[str] = Field(min_length=1)


class ItemId(BaseModel):
    id: str = Field(min_length=1)


# --------------------------------------------------------------------------- app factory
def create_app(cfg: Settings = settings) -> FastAPI:
    cfg.ensure_dirs()
    library = Library(cfg)
    store = Store(cfg.data_dir)

    @asynccontextmanager
    async def lifespan(_: FastAPI):
        await run_in_threadpool(library.scan)
        yield

    app = FastAPI(title="Local Media Server", version="1.0.0", lifespan=lifespan, docs_url="/api/docs", redoc_url=None, openapi_url="/api/openapi.json")
    app.state.library = library
    app.state.store = store
    app.state.settings = cfg

    # ----------------------------------------------------------------- helpers
    def paginate(items: list[dict[str, Any]], offset: int, limit: int) -> dict[str, Any]:
        page = items[offset : offset + limit]
        return {
            "total": len(items),
            "offset": offset,
            "limit": limit,
            "items": [library.public(i) for i in page],
        }

    def filter_query(items: list[dict[str, Any]], q: str | None) -> list[dict[str, Any]]:
        if not q:
            return items
        ql = q.lower().strip()
        return [
            i for i in items
            if ql in (i["title"] or "").lower()
            or ql in (i["artist"] or "").lower()
            or ql in (i["album"] or "").lower()
            or ql in i["filename"].lower()
        ]

    def sort_items(items: list[dict[str, Any]], sort: str) -> list[dict[str, Any]]:
        if sort == "title":
            return sorted(items, key=lambda i: (i["title"] or "").lower())
        if sort == "recent":
            return sorted(items, key=lambda i: -i["mtime"])
        if sort == "duration":
            return sorted(items, key=lambda i: -(i["duration"] or 0))
        return items  # default library order (artist/album/track)

    def playlist_view(playlist: dict[str, Any]) -> dict[str, Any]:
        items = [library.public(i) for i in library.get_many(playlist["items"])]
        return {
            **playlist,
            "items": items,
            "count": len(items),
            "duration": sum((i["duration"] or 0) for i in items),
            "art_url": next((i["art_url"] for i in items if i["art_url"]), None),
        }

    # ----------------------------------------------------------------- status / scan
    @app.get("/api/status")
    def status() -> dict[str, Any]:
        counts = library.counts()
        return {
            "ok": True,
            "music": counts["music"],
            "videos": counts["videos"],
            "scanning": library.scanning,
            "last_scan": library.last_scan,
            "scan_duration": library.last_scan_duration,
            "scan_errors": library.errors,
            "lan_ip": detect_lan_ip(),
            "port": cfg.port,
            "music_dir": str(cfg.music_dir),
            "video_dir": str(cfg.video_dir),
            "music_dir_exists": cfg.music_dir.is_dir(),
            "video_dir_exists": cfg.video_dir.is_dir(),
            "metadata": HAVE_MUTAGEN,
        }

    @app.post("/api/scan")
    async def scan() -> dict[str, Any]:
        result = await run_in_threadpool(library.scan)
        return {**result, **library.counts()}

    # ----------------------------------------------------------------- library
    @app.get("/api/media")
    def media(
        type: Literal["all", "music", "video"] = "all",
        q: str | None = None,
        sort: str = "default",
        offset: int = Query(0, ge=0),
        limit: int = Query(50, ge=1, le=500),
    ) -> dict[str, Any]:
        items: list[dict[str, Any]] = []
        if type in ("all", "music"):
            items += library.music()
        if type in ("all", "video"):
            items += library.videos()
        return paginate(sort_items(filter_query(items, q), sort), offset, limit)

    @app.get("/api/music")
    def music(
        q: str | None = None,
        artist: str | None = None,
        album: str | None = None,
        sort: str = "default",
        offset: int = Query(0, ge=0),
        limit: int = Query(50, ge=1, le=500),
    ) -> dict[str, Any]:
        items = library.music()
        if artist:
            al = artist.lower()
            items = [i for i in items if (i["artist"] or "Unknown Artist").lower() == al or (i["album_artist"] or "").lower() == al]
        if album:
            abl = album.lower()
            items = [i for i in items if (i["album"] or "").lower() == abl]
        return paginate(sort_items(filter_query(items, q), sort), offset, limit)

    @app.get("/api/videos")
    def videos(
        q: str | None = None,
        sort: str = "default",
        offset: int = Query(0, ge=0),
        limit: int = Query(50, ge=1, le=500),
    ) -> dict[str, Any]:
        return paginate(sort_items(filter_query(library.videos(), q), sort), offset, limit)

    @app.get("/api/artists")
    def artists() -> dict[str, Any]:
        result = library.artists()
        return {"total": len(result), "items": result}

    @app.get("/api/albums")
    def albums() -> dict[str, Any]:
        result = library.albums()
        return {"total": len(result), "items": result}

    @app.get("/api/items/{item_id}")
    def item(item_id: str) -> dict[str, Any]:
        found = library.get(item_id)
        if not found:
            raise HTTPException(404, "Item not found")
        return library.public(found)

    @app.get("/api/search")
    def search(q: str = Query("", max_length=200), limit: int = Query(25, ge=1, le=100)) -> dict[str, Any]:
        return library.search(q, limit)

    @app.get("/api/home")
    def home() -> dict[str, Any]:
        music_items = library.music()
        video_items = library.videos()
        recent_ids = [r["id"] for r in store.recent()]
        recent = [library.public(i) for i in library.get_many(recent_ids)][:12]
        newest_music = sorted(music_items, key=lambda i: -i["mtime"])[:12]
        newest_videos = sorted(video_items, key=lambda i: -i["mtime"])[:8]
        return {
            "recent": recent,
            "new_music": [library.public(i) for i in newest_music],
            "new_videos": [library.public(i) for i in newest_videos],
            "artists": library.artists()[:12],
            "albums": library.albums()[:12],
            "counts": library.counts(),
        }

    # ----------------------------------------------------------------- playlists
    @app.get("/api/playlists")
    def playlists() -> dict[str, Any]:
        result = [playlist_view(p) for p in store.playlists()]
        return {"total": len(result), "items": result}

    @app.post("/api/playlists", status_code=201)
    def create_playlist(body: PlaylistCreate) -> dict[str, Any]:
        valid = [i["id"] for i in library.get_many(body.items)]
        return playlist_view(store.create_playlist(body.name, valid))

    @app.get("/api/playlists/{playlist_id}")
    def get_playlist(playlist_id: str) -> dict[str, Any]:
        playlist = store.get_playlist(playlist_id)
        if not playlist:
            raise HTTPException(404, "Playlist not found")
        return playlist_view(playlist)

    @app.put("/api/playlists/{playlist_id}")
    def update_playlist(playlist_id: str, body: PlaylistUpdate) -> dict[str, Any]:
        items = None
        if body.items is not None:
            items = [i["id"] for i in library.get_many(body.items)]
        playlist = store.update_playlist(playlist_id, name=body.name, items=items)
        if not playlist:
            raise HTTPException(404, "Playlist not found")
        return playlist_view(playlist)

    @app.delete("/api/playlists/{playlist_id}", status_code=204)
    def delete_playlist(playlist_id: str) -> Response:
        if not store.delete_playlist(playlist_id):
            raise HTTPException(404, "Playlist not found")
        return Response(status_code=204)

    @app.post("/api/playlists/{playlist_id}/items")
    def add_playlist_items(playlist_id: str, body: ItemIds) -> dict[str, Any]:
        valid = [i["id"] for i in library.get_many(body.ids)]
        if not valid:
            raise HTTPException(400, "No valid media ids supplied")
        playlist = store.add_to_playlist(playlist_id, valid)
        if not playlist:
            raise HTTPException(404, "Playlist not found")
        return playlist_view(playlist)

    @app.delete("/api/playlists/{playlist_id}/items/{item_id}")
    def remove_playlist_item(playlist_id: str, item_id: str) -> dict[str, Any]:
        playlist = store.remove_from_playlist(playlist_id, item_id)
        if not playlist:
            raise HTTPException(404, "Playlist not found")
        return playlist_view(playlist)

    # ----------------------------------------------------------------- favorites
    @app.get("/api/favorites")
    def favorites() -> dict[str, Any]:
        ids = store.favorites()
        items = [library.public(i) for i in library.get_many(ids)]
        return {"total": len(items), "ids": ids, "items": items}

    @app.post("/api/favorites", status_code=201)
    def add_favorite(body: ItemId) -> dict[str, Any]:
        if not library.get(body.id):
            raise HTTPException(404, "Item not found")
        store.add_favorite(body.id)
        return {"id": body.id, "favorite": True}

    @app.delete("/api/favorites/{item_id}")
    def remove_favorite(item_id: str) -> dict[str, Any]:
        store.remove_favorite(item_id)
        return {"id": item_id, "favorite": False}

    # ----------------------------------------------------------------- recently played
    @app.get("/api/recent")
    def recent(limit: int = Query(50, ge=1, le=100)) -> dict[str, Any]:
        entries = store.recent()
        played_at = {r["id"]: r["played_at"] for r in entries}
        items = library.get_many([r["id"] for r in entries])[:limit]
        return {
            "total": len(items),
            "items": [{**library.public(i), "played_at": played_at.get(i["id"])} for i in items],
        }

    @app.post("/api/recent", status_code=201)
    def add_recent(body: ItemId) -> dict[str, Any]:
        if not library.get(body.id):
            raise HTTPException(404, "Item not found")
        store.add_recent(body.id)
        return {"id": body.id}

    @app.delete("/api/recent", status_code=204)
    def clear_recent() -> Response:
        store.clear_recent()
        return Response(status_code=204)

    # ----------------------------------------------------------------- artwork
    @app.get("/api/art/{art_id}")
    def art(art_id: str) -> Response:
        path = library.resolve_art(art_id)
        if not path:
            raise HTTPException(404, "No artwork")
        return FileResponse(path, headers={"Cache-Control": "public, max-age=604800"})

    @app.get("/api/thumb/{item_id}")
    def thumb(item_id: str) -> Response:
        path = library.resolve_thumb(item_id)
        if not path:
            raise HTTPException(404, "No thumbnail")
        return FileResponse(path, media_type="image/jpeg", headers={"Cache-Control": "public, max-age=86400"})

    # ----------------------------------------------------------------- streaming
    @app.api_route("/media/music/{path:path}", methods=["GET", "HEAD"])
    def stream_music(path: str, request: Request) -> Response:
        file_path = safe_resolve(cfg.music_dir, path, AUDIO_EXTENSIONS)
        return range_file_response(request, file_path)

    @app.api_route("/media/videos/{path:path}", methods=["GET", "HEAD"])
    def stream_video(path: str, request: Request) -> Response:
        file_path = safe_resolve(cfg.video_dir, path, VIDEO_EXTENSIONS)
        return range_file_response(request, file_path)

    # ----------------------------------------------------------------- frontend
    @app.get("/", include_in_schema=False)
    def index() -> Response:
        index_file = cfg.web_dir / "index.html"
        if not index_file.is_file():
            return JSONResponse({"error": "web/index.html is missing"}, status_code=500)
        return FileResponse(index_file, headers={"Cache-Control": "no-cache"})

    if cfg.web_dir.is_dir():
        app.mount("/static", StaticFiles(directory=cfg.web_dir), name="static")

    @app.exception_handler(Exception)
    async def unhandled(_: Request, exc: Exception) -> JSONResponse:
        log.exception("Unhandled error: %s", exc)
        return JSONResponse({"detail": "Internal server error"}, status_code=500)

    return app
