"""Configuration loaded from environment variables with sensible defaults."""

from __future__ import annotations

import os
import socket
from dataclasses import dataclass, field
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

AUDIO_EXTENSIONS = {".mp3", ".m4a", ".aac", ".wav", ".ogg", ".oga", ".opus", ".flac"}
VIDEO_EXTENSIONS = {".mp4", ".m4v", ".webm", ".mov", ".ogv"}

MIME_TYPES = {
    ".mp3": "audio/mpeg",
    ".m4a": "audio/mp4",
    ".aac": "audio/aac",
    ".wav": "audio/wav",
    ".ogg": "audio/ogg",
    ".oga": "audio/ogg",
    ".opus": "audio/ogg",
    ".flac": "audio/flac",
    ".mp4": "video/mp4",
    ".m4v": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
    ".ogv": "video/ogg",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
}


def _env_path(name: str, default: Path) -> Path:
    raw = os.environ.get(name, "").strip()
    return (Path(raw).expanduser() if raw else default).resolve()


def _env_int(name: str, default: int) -> int:
    raw = os.environ.get(name, "").strip()
    try:
        return int(raw) if raw else default
    except ValueError:
        return default


@dataclass
class Settings:
    host: str = field(default_factory=lambda: os.environ.get("HOST", "0.0.0.0").strip() or "0.0.0.0")
    port: int = field(default_factory=lambda: _env_int("PORT", 8000))
    media_dir: Path = field(default_factory=lambda: _env_path("MEDIA_DIR", BASE_DIR / "media"))
    music_dir: Path = field(default=None)  # type: ignore[assignment]
    video_dir: Path = field(default=None)  # type: ignore[assignment]
    data_dir: Path = field(default_factory=lambda: _env_path("DATA_DIR", BASE_DIR / "data"))
    web_dir: Path = field(default_factory=lambda: BASE_DIR / "web")

    def __post_init__(self) -> None:
        if self.music_dir is None:
            self.music_dir = _env_path("MUSIC_DIR", self.media_dir / "music")
        if self.video_dir is None:
            self.video_dir = _env_path("VIDEO_DIR", self.media_dir / "videos")

    @property
    def art_dir(self) -> Path:
        return self.data_dir / "art"

    @property
    def thumb_dir(self) -> Path:
        return self.data_dir / "thumbs"

    def ensure_dirs(self) -> None:
        for d in (self.data_dir, self.art_dir, self.thumb_dir):
            d.mkdir(parents=True, exist_ok=True)


def detect_lan_ip() -> str | None:
    """Best-effort detection of the LAN IP address (no packets are actually sent)."""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.settimeout(0.5)
            s.connect(("10.255.255.255", 1))
            ip = s.getsockname()[0]
            if ip and not ip.startswith("127."):
                return ip
    except OSError:
        pass
    try:
        for info in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET):
            ip = info[4][0]
            if not ip.startswith("127."):
                return ip
    except OSError:
        pass
    return None


settings = Settings()
