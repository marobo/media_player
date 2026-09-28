"""Media library: scanning, metadata extraction, caching and lookups."""

from __future__ import annotations

import hashlib
import json
import logging
import os
import re
import shutil
import subprocess
import threading
import time
from pathlib import Path
from typing import Any, Iterable
from urllib.parse import quote

from .config import AUDIO_EXTENSIONS, VIDEO_EXTENSIONS, Settings

log = logging.getLogger("media.library")

try:  # mutagen is optional; the library works (with less metadata) without it
    import mutagen
    from mutagen.flac import FLAC, Picture
    from mutagen.id3 import ID3
    from mutagen.mp4 import MP4, MP4Cover
    from mutagen.oggopus import OggOpus
    from mutagen.oggvorbis import OggVorbis

    HAVE_MUTAGEN = True
except Exception:  # pragma: no cover - depends on environment
    mutagen = None
    HAVE_MUTAGEN = False

FOLDER_ART_NAMES = ("cover", "folder", "front", "album", "artwork", "art")
IMAGE_EXTENSIONS = (".jpg", ".jpeg", ".png", ".webp")
TITLE_SEPARATORS = (" — ", " – ", " - ", " _ ")
TRACK_PREFIX_RE = re.compile(r"^\s*\d{1,3}\s*[-._)]\s*")
FFMPEG = shutil.which("ffmpeg")
FFPROBE = shutil.which("ffprobe")

CACHE_VERSION = 3


def make_id(kind: str, rel_path: str) -> str:
    return hashlib.sha1(f"{kind}:{rel_path}".encode("utf-8")).hexdigest()[:16]


def _clean(value: Any) -> str | None:
    if value is None:
        return None
    if isinstance(value, (list, tuple)):
        value = value[0] if value else None
    if value is None:
        return None
    text = str(value).strip().strip("\x00")
    return text or None


def _parse_track(value: Any) -> int | None:
    text = _clean(value)
    if not text:
        return None
    match = re.match(r"\d+", text)
    return int(match.group()) if match else None


def _parse_year(value: Any) -> int | None:
    text = _clean(value)
    if not text:
        return None
    match = re.search(r"\d{4}", text)
    return int(match.group()) if match else None


def _guess_from_path(root: Path, file_path: Path) -> dict[str, Any]:
    """Derive title/artist/album from filename and folder structure."""
    rel = file_path.relative_to(root)
    parts = rel.parts
    stem = TRACK_PREFIX_RE.sub("", file_path.stem).strip() or file_path.stem
    guess: dict[str, Any] = {"title": stem, "artist": None, "album": None}

    if len(parts) >= 3:  # music/Artist/Album/Song
        guess["artist"] = parts[0]
        guess["album"] = parts[-2]
    elif len(parts) == 2:  # music/Artist/Song
        guess["artist"] = parts[0]

    if not guess["artist"]:
        for sep in TITLE_SEPARATORS:
            if sep in stem:
                artist, title = stem.split(sep, 1)
                if artist.strip() and title.strip():
                    guess["artist"] = artist.strip()
                    guess["title"] = title.strip()
                break
    return guess


class Library:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._lock = threading.RLock()
        self._scan_lock = threading.Lock()
        self._items: dict[str, dict[str, Any]] = {}
        self._music: list[dict[str, Any]] = []
        self._videos: list[dict[str, Any]] = []
        self._cache: dict[str, dict[str, Any]] = {}
        self._cache_path = settings.data_dir / "library_cache.json"
        self.scanning = False
        self.last_scan: float | None = None
        self.last_scan_duration: float = 0.0
        self.errors: list[str] = []
        self._load_cache()

    # ------------------------------------------------------------------ cache
    def _load_cache(self) -> None:
        try:
            if self._cache_path.exists():
                data = json.loads(self._cache_path.read_text("utf-8"))
                if data.get("version") == CACHE_VERSION:
                    self._cache = data.get("entries", {})
        except Exception as exc:
            log.warning("Could not load metadata cache: %s", exc)
            self._cache = {}

    def _save_cache(self) -> None:
        try:
            self.settings.data_dir.mkdir(parents=True, exist_ok=True)
            tmp = self._cache_path.with_suffix(".tmp")
            tmp.write_text(json.dumps({"version": CACHE_VERSION, "entries": self._cache}), "utf-8")
            os.replace(tmp, self._cache_path)
        except Exception as exc:
            log.warning("Could not save metadata cache: %s", exc)

    # ------------------------------------------------------------------ scanning
    def scan(self) -> dict[str, Any]:
        if not self._scan_lock.acquire(blocking=False):
            return {"status": "already_scanning"}
        started = time.time()
        self.scanning = True
        errors: list[str] = []
        try:
            music = self._scan_dir(self.settings.music_dir, "music", AUDIO_EXTENSIONS, errors)
            videos = self._scan_dir(self.settings.video_dir, "video", VIDEO_EXTENSIONS, errors)

            music.sort(key=lambda i: ((i["artist"] or "").lower(), (i["album"] or "").lower(), i["track"] or 0, (i["title"] or "").lower()))
            videos.sort(key=lambda i: (i["title"] or "").lower())

            with self._lock:
                self._music = music
                self._videos = videos
                self._items = {i["id"]: i for i in music + videos}
                # Drop cache entries for files that no longer exist
                live_keys = {i["_cache_key"] for i in music + videos}
                self._cache = {k: v for k, v in self._cache.items() if k in live_keys}
                self.errors = errors[:50]
                self.last_scan = time.time()
                self.last_scan_duration = round(self.last_scan - started, 3)
            self._save_cache()

            if FFMPEG:
                threading.Thread(target=self._generate_thumbnails, args=(list(videos),), daemon=True).start()

            log.info("Scan complete: %d songs, %d videos in %.2fs (%d errors)", len(music), len(videos), self.last_scan_duration, len(errors))
            return {"status": "ok", "music": len(music), "videos": len(videos), "errors": len(errors), "duration": self.last_scan_duration}
        finally:
            self.scanning = False
            self._scan_lock.release()

    def _scan_dir(self, root: Path, kind: str, extensions: set[str], errors: list[str]) -> list[dict[str, Any]]:
        items: list[dict[str, Any]] = []
        if not root.exists() or not root.is_dir():
            log.warning("%s directory does not exist: %s", kind, root)
            return items

        folder_art_cache: dict[Path, str | None] = {}
        for dirpath, dirnames, filenames in os.walk(root):
            dirnames[:] = sorted(d for d in dirnames if not d.startswith("."))
            directory = Path(dirpath)
            for name in sorted(filenames):
                if name.startswith(".") or name.startswith("._"):
                    continue
                path = directory / name
                if path.suffix.lower() not in extensions:
                    continue
                try:
                    item = self._build_item(root, path, kind, folder_art_cache)
                    if item:
                        items.append(item)
                except Exception as exc:  # never let one bad file kill the scan
                    msg = f"{path.relative_to(root)}: {exc}"
                    log.warning("Skipping %s", msg)
                    errors.append(msg)
        return items

    def _build_item(self, root: Path, path: Path, kind: str, folder_art_cache: dict[Path, str | None]) -> dict[str, Any] | None:
        try:
            stat = path.stat()
        except OSError:
            return None
        if stat.st_size == 0:
            return None

        rel_path = path.relative_to(root).as_posix()
        cache_key = f"{kind}:{rel_path}"
        cached = self._cache.get(cache_key)
        if cached and cached.get("mtime") == stat.st_mtime and cached.get("size") == stat.st_size:
            meta = dict(cached["meta"])
        else:
            meta = self._read_metadata(root, path, kind)
            if kind == "music" and not meta.get("art_id"):
                meta["art_id"] = self._folder_art(path.parent, folder_art_cache)
            self._cache[cache_key] = {"mtime": stat.st_mtime, "size": stat.st_size, "meta": meta}

        item_id = make_id(kind, rel_path)
        url_prefix = "/media/music/" if kind == "music" else "/media/videos/"
        item: dict[str, Any] = {
            "id": item_id,
            "type": kind,
            "path": rel_path,
            "filename": path.name,
            "ext": path.suffix.lower().lstrip("."),
            "size": stat.st_size,
            "mtime": int(stat.st_mtime),
            "title": meta.get("title") or path.stem,
            "artist": meta.get("artist"),
            "album": meta.get("album"),
            "album_artist": meta.get("album_artist"),
            "genre": meta.get("genre"),
            "track": meta.get("track"),
            "year": meta.get("year"),
            "duration": meta.get("duration"),
            "width": meta.get("width"),
            "height": meta.get("height"),
            "stream_url": url_prefix + quote(rel_path),
            "art_url": None,
            "_cache_key": cache_key,
        }
        if kind == "music":
            if meta.get("art_id"):
                item["art_url"] = f"/api/art/{meta['art_id']}"
        else:
            if (self.settings.thumb_dir / f"{item_id}.jpg").exists():
                item["art_url"] = f"/api/thumb/{item_id}"
        return item

    # ------------------------------------------------------------------ metadata
    def _read_metadata(self, root: Path, path: Path, kind: str) -> dict[str, Any]:
        meta: dict[str, Any] = {}
        if kind == "music":
            meta.update(_guess_from_path(root, path))
        else:
            meta["title"] = TRACK_PREFIX_RE.sub("", path.stem).strip() or path.stem

        if HAVE_MUTAGEN:
            try:
                self._read_with_mutagen(path, kind, meta)
            except Exception as exc:
                log.debug("mutagen failed for %s: %s", path.name, exc)

        if kind == "video" and FFPROBE and (meta.get("duration") is None or meta.get("width") is None):
            try:
                self._read_with_ffprobe(path, meta)
            except Exception as exc:
                log.debug("ffprobe failed for %s: %s", path.name, exc)
        return meta

    def _read_with_mutagen(self, path: Path, kind: str, meta: dict[str, Any]) -> None:
        easy = mutagen.File(path, easy=True)
        if easy is None:
            return
        info = getattr(easy, "info", None)
        if info is not None:
            length = getattr(info, "length", None)
            if length:
                meta["duration"] = round(float(length), 2)
            for attr, key in (("width", "width"), ("height", "height")):
                value = getattr(info, attr, None)
                if value:
                    meta[key] = int(value)

        tags = easy.tags if easy.tags is not None else {}
        title = _clean(tags.get("title"))
        artist = _clean(tags.get("artist"))
        album = _clean(tags.get("album"))
        if title:
            meta["title"] = title
        if artist:
            meta["artist"] = artist
        if album:
            meta["album"] = album
        if kind == "music":
            meta["album_artist"] = _clean(tags.get("albumartist")) or meta.get("album_artist")
            meta["genre"] = _clean(tags.get("genre"))
            meta["track"] = _parse_track(tags.get("tracknumber"))
            meta["year"] = _parse_year(tags.get("date") or tags.get("originaldate"))
            art = self._extract_art(path)
            if art:
                meta["art_id"] = self._store_art(*art)

    def _read_with_ffprobe(self, path: Path, meta: dict[str, Any]) -> None:
        cmd = [FFPROBE, "-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", str(path)]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=20, check=False)
        if result.returncode != 0:
            return
        data = json.loads(result.stdout or "{}")
        fmt = data.get("format", {})
        if fmt.get("duration"):
            meta["duration"] = round(float(fmt["duration"]), 2)
        tags = fmt.get("tags") or {}
        title = _clean(tags.get("title"))
        if title:
            meta["title"] = title
        for stream in data.get("streams", []):
            if stream.get("codec_type") == "video":
                if stream.get("width"):
                    meta["width"] = int(stream["width"])
                if stream.get("height"):
                    meta["height"] = int(stream["height"])
                break

    # ------------------------------------------------------------------ artwork
    def _extract_art(self, path: Path) -> tuple[bytes, str] | None:
        """Return (bytes, mime) for embedded artwork if present."""
        try:
            audio = mutagen.File(path)
        except Exception:
            return None
        if audio is None:
            return None
        try:
            if isinstance(audio.tags, ID3):
                pics = audio.tags.getall("APIC")
                if pics:
                    pics.sort(key=lambda p: 0 if getattr(p, "type", 0) == 3 else 1)
                    return bytes(pics[0].data), pics[0].mime or "image/jpeg"
            elif isinstance(audio, MP4):
                covers = audio.tags.get("covr") if audio.tags else None
                if covers:
                    cover = covers[0]
                    fmt = getattr(cover, "imageformat", MP4Cover.FORMAT_JPEG)
                    return bytes(cover), "image/png" if fmt == MP4Cover.FORMAT_PNG else "image/jpeg"
            elif isinstance(audio, FLAC):
                if audio.pictures:
                    pic = audio.pictures[0]
                    return bytes(pic.data), pic.mime or "image/jpeg"
            elif isinstance(audio, (OggVorbis, OggOpus)):
                import base64

                blocks = audio.get("metadata_block_picture") or []
                if blocks:
                    pic = Picture(base64.b64decode(blocks[0]))
                    return bytes(pic.data), pic.mime or "image/jpeg"
        except Exception as exc:
            log.debug("artwork extraction failed for %s: %s", path.name, exc)
        return None

    def _store_art(self, data: bytes, mime: str) -> str | None:
        if not data or len(data) < 64:
            return None
        ext = {"image/png": "png", "image/webp": "webp", "image/gif": "gif"}.get((mime or "").lower(), "jpg")
        digest = hashlib.md5(data).hexdigest()
        art_id = f"{digest}.{ext}"
        target = self.settings.art_dir / art_id
        if not target.exists():
            try:
                self.settings.art_dir.mkdir(parents=True, exist_ok=True)
                target.write_bytes(data)
            except OSError as exc:
                log.warning("Could not write artwork cache: %s", exc)
                return None
        return art_id

    def _folder_art(self, directory: Path, cache: dict[Path, str | None]) -> str | None:
        if directory in cache:
            return cache[directory]
        art_id = None
        try:
            for entry in directory.iterdir():
                if entry.suffix.lower() in IMAGE_EXTENSIONS and entry.stem.lower() in FOLDER_ART_NAMES:
                    mime = "image/png" if entry.suffix.lower() == ".png" else "image/jpeg"
                    art_id = self._store_art(entry.read_bytes(), mime)
                    break
        except OSError:
            pass
        cache[directory] = art_id
        return art_id

    def resolve_art(self, art_id: str) -> Path | None:
        if not re.fullmatch(r"[a-f0-9]{32}\.(jpg|png|webp|gif)", art_id):
            return None
        path = self.settings.art_dir / art_id
        return path if path.is_file() else None

    def resolve_thumb(self, item_id: str) -> Path | None:
        if not re.fullmatch(r"[a-f0-9]{16}", item_id):
            return None
        path = self.settings.thumb_dir / f"{item_id}.jpg"
        return path if path.is_file() else None

    def _generate_thumbnails(self, videos: list[dict[str, Any]]) -> None:
        if not FFMPEG:
            return
        self.settings.thumb_dir.mkdir(parents=True, exist_ok=True)
        for item in videos:
            target = self.settings.thumb_dir / f"{item['id']}.jpg"
            if target.exists():
                continue
            source = self.settings.video_dir / item["path"]
            duration = item.get("duration") or 0
            seek = max(0.0, min(duration * 0.1, 10.0)) if duration else 1.0
            cmd = [
                FFMPEG, "-v", "error", "-y", "-ss", f"{seek:.2f}", "-i", str(source),
                "-frames:v", "1", "-vf", "scale=480:-2", "-q:v", "4", str(target),
            ]
            try:
                subprocess.run(cmd, capture_output=True, timeout=30, check=False)
            except Exception as exc:
                log.debug("thumbnail failed for %s: %s", item["path"], exc)
                continue
            if target.exists() and target.stat().st_size > 0:
                with self._lock:
                    live = self._items.get(item["id"])
                    if live is not None:
                        live["art_url"] = f"/api/thumb/{item['id']}"
            elif target.exists():
                target.unlink(missing_ok=True)

    # ------------------------------------------------------------------ lookups
    @staticmethod
    def public(item: dict[str, Any]) -> dict[str, Any]:
        return {k: v for k, v in item.items() if not k.startswith("_")}

    def get(self, item_id: str) -> dict[str, Any] | None:
        with self._lock:
            return self._items.get(item_id)

    def get_many(self, ids: Iterable[str]) -> list[dict[str, Any]]:
        with self._lock:
            return [self._items[i] for i in ids if i in self._items]

    def music(self) -> list[dict[str, Any]]:
        with self._lock:
            return list(self._music)

    def videos(self) -> list[dict[str, Any]]:
        with self._lock:
            return list(self._videos)

    def counts(self) -> dict[str, int]:
        with self._lock:
            return {"music": len(self._music), "videos": len(self._videos)}

    def artists(self) -> list[dict[str, Any]]:
        groups: dict[str, dict[str, Any]] = {}
        for item in self.music():
            name = item["artist"] or "Unknown Artist"
            group = groups.setdefault(name.lower(), {"name": name, "count": 0, "art_url": None, "albums": set()})
            group["count"] += 1
            if item["album"]:
                group["albums"].add(item["album"])
            if not group["art_url"] and item["art_url"]:
                group["art_url"] = item["art_url"]
        result = []
        for group in groups.values():
            group["albums"] = len(group["albums"])
            result.append(group)
        result.sort(key=lambda g: g["name"].lower())
        return result

    def albums(self) -> list[dict[str, Any]]:
        groups: dict[tuple[str, str], dict[str, Any]] = {}
        for item in self.music():
            if not item["album"]:
                continue
            artist = item["album_artist"] or item["artist"] or "Unknown Artist"
            key = (item["album"].lower(), artist.lower())
            group = groups.setdefault(key, {"name": item["album"], "artist": artist, "count": 0, "year": item["year"], "art_url": None})
            group["count"] += 1
            if not group["art_url"] and item["art_url"]:
                group["art_url"] = item["art_url"]
        result = list(groups.values())
        result.sort(key=lambda g: (g["artist"].lower(), g["name"].lower()))
        return result

    def search(self, query: str, limit: int = 25) -> dict[str, Any]:
        q = query.strip().lower()
        if not q:
            return {"query": query, "songs": [], "artists": [], "albums": [], "videos": []}
        terms = q.split()

        def score(*fields: str | None) -> int:
            best = 0
            haystack = " ".join(f.lower() for f in fields if f)
            if not haystack:
                return 0
            if not all(t in haystack for t in terms):
                return 0
            for f in fields:
                if not f:
                    continue
                fl = f.lower()
                if fl == q:
                    best = max(best, 100)
                elif fl.startswith(q):
                    best = max(best, 60)
                elif q in fl:
                    best = max(best, 30)
            return best or 10

        songs = []
        for item in self.music():
            s = score(item["title"], item["artist"], item["album"], item["filename"])
            if s:
                songs.append((s, item))
        songs.sort(key=lambda t: (-t[0], (t[1]["title"] or "").lower()))

        videos = []
        for item in self.videos():
            s = score(item["title"], item["filename"])
            if s:
                videos.append((s, item))
        videos.sort(key=lambda t: (-t[0], (t[1]["title"] or "").lower()))

        artists = [a for a in self.artists() if score(a["name"])]
        albums = [a for a in self.albums() if score(a["name"], a["artist"])]

        return {
            "query": query,
            "songs": [self.public(i) for _, i in songs[:limit]],
            "artists": artists[:limit],
            "albums": albums[:limit],
            "videos": [self.public(i) for _, i in videos[:limit]],
        }
