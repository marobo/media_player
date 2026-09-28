"""Simple JSON-backed persistence for playlists, favorites and recently played."""

from __future__ import annotations

import json
import logging
import os
import threading
import time
import uuid
from pathlib import Path
from typing import Any

log = logging.getLogger("media.store")

MAX_RECENT = 100


class Store:
    def __init__(self, data_dir: Path) -> None:
        self.path = data_dir / "userdata.json"
        self._lock = threading.RLock()
        self._data: dict[str, Any] = {"playlists": [], "favorites": [], "recent": []}
        self._load()

    # ------------------------------------------------------------------ io
    def _load(self) -> None:
        try:
            if self.path.exists():
                data = json.loads(self.path.read_text("utf-8"))
                if isinstance(data, dict):
                    self._data["playlists"] = [p for p in data.get("playlists", []) if isinstance(p, dict) and p.get("id")]
                    self._data["favorites"] = [f for f in data.get("favorites", []) if isinstance(f, str)]
                    self._data["recent"] = [r for r in data.get("recent", []) if isinstance(r, dict) and r.get("id")]
        except Exception as exc:
            log.warning("Could not load user data (%s); starting fresh", exc)

    def _save(self) -> None:
        try:
            self.path.parent.mkdir(parents=True, exist_ok=True)
            tmp = self.path.with_suffix(".tmp")
            tmp.write_text(json.dumps(self._data, indent=2, ensure_ascii=False), "utf-8")
            os.replace(tmp, self.path)
        except Exception as exc:
            log.error("Could not save user data: %s", exc)

    # ------------------------------------------------------------------ playlists
    def playlists(self) -> list[dict[str, Any]]:
        with self._lock:
            return [dict(p) for p in self._data["playlists"]]

    def get_playlist(self, playlist_id: str) -> dict[str, Any] | None:
        with self._lock:
            for p in self._data["playlists"]:
                if p["id"] == playlist_id:
                    return dict(p)
        return None

    def create_playlist(self, name: str, items: list[str] | None = None) -> dict[str, Any]:
        now = int(time.time())
        playlist = {
            "id": uuid.uuid4().hex[:12],
            "name": name.strip() or "New Playlist",
            "items": list(dict.fromkeys(items or [])),
            "created": now,
            "updated": now,
        }
        with self._lock:
            self._data["playlists"].append(playlist)
            self._save()
        return dict(playlist)

    def update_playlist(self, playlist_id: str, *, name: str | None = None, items: list[str] | None = None) -> dict[str, Any] | None:
        with self._lock:
            for p in self._data["playlists"]:
                if p["id"] == playlist_id:
                    if name is not None and name.strip():
                        p["name"] = name.strip()
                    if items is not None:
                        p["items"] = list(dict.fromkeys(items))
                    p["updated"] = int(time.time())
                    self._save()
                    return dict(p)
        return None

    def add_to_playlist(self, playlist_id: str, ids: list[str]) -> dict[str, Any] | None:
        with self._lock:
            for p in self._data["playlists"]:
                if p["id"] == playlist_id:
                    existing = set(p["items"])
                    for i in ids:
                        if i not in existing:
                            p["items"].append(i)
                            existing.add(i)
                    p["updated"] = int(time.time())
                    self._save()
                    return dict(p)
        return None

    def remove_from_playlist(self, playlist_id: str, item_id: str) -> dict[str, Any] | None:
        with self._lock:
            for p in self._data["playlists"]:
                if p["id"] == playlist_id:
                    p["items"] = [i for i in p["items"] if i != item_id]
                    p["updated"] = int(time.time())
                    self._save()
                    return dict(p)
        return None

    def delete_playlist(self, playlist_id: str) -> bool:
        with self._lock:
            before = len(self._data["playlists"])
            self._data["playlists"] = [p for p in self._data["playlists"] if p["id"] != playlist_id]
            if len(self._data["playlists"]) != before:
                self._save()
                return True
        return False

    # ------------------------------------------------------------------ favorites
    def favorites(self) -> list[str]:
        with self._lock:
            return list(self._data["favorites"])

    def add_favorite(self, item_id: str) -> bool:
        with self._lock:
            if item_id in self._data["favorites"]:
                return False
            self._data["favorites"].insert(0, item_id)
            self._save()
            return True

    def remove_favorite(self, item_id: str) -> bool:
        with self._lock:
            if item_id not in self._data["favorites"]:
                return False
            self._data["favorites"] = [f for f in self._data["favorites"] if f != item_id]
            self._save()
            return True

    # ------------------------------------------------------------------ recent
    def recent(self) -> list[dict[str, Any]]:
        with self._lock:
            return [dict(r) for r in self._data["recent"]]

    def add_recent(self, item_id: str) -> None:
        with self._lock:
            self._data["recent"] = [r for r in self._data["recent"] if r["id"] != item_id]
            self._data["recent"].insert(0, {"id": item_id, "played_at": int(time.time())})
            del self._data["recent"][MAX_RECENT:]
            self._save()

    def clear_recent(self) -> None:
        with self._lock:
            self._data["recent"] = []
            self._save()
