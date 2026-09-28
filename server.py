#!/usr/bin/env python3
"""Local Media Server entrypoint.

Run:  python3 server.py
Env:  HOST, PORT, MEDIA_DIR, MUSIC_DIR, VIDEO_DIR, DATA_DIR
"""

from __future__ import annotations

import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.config import detect_lan_ip, settings  # noqa: E402


def _display_path(path: Path) -> str:
    try:
        return "./" + str(path.relative_to(Path.cwd()))
    except ValueError:
        return str(path)


def print_banner() -> None:
    lan_ip = detect_lan_ip()
    port = settings.port
    line = "=" * 44
    print(line)
    print("🎵 LOCAL MEDIA SERVER")
    print(line)
    print(f"Server:  http://localhost:{port}")
    if lan_ip:
        print(f"Network: http://{lan_ip}:{port}")
    else:
        print("Network: (could not detect LAN IP — try `ipconfig getifaddr en0`)")
    print()
    music_note = "" if settings.music_dir.is_dir() else "   (missing!)"
    video_note = "" if settings.video_dir.is_dir() else "   (missing!)"
    print(f"Music:   {_display_path(settings.music_dir)}{music_note}")
    print(f"Videos:  {_display_path(settings.video_dir)}{video_note}")
    print(f"Data:    {_display_path(settings.data_dir)}")
    print()
    print("Press CTRL+C to stop")
    print(line, flush=True)


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
    try:
        import uvicorn
    except ImportError:
        print("Missing dependencies. Run:  pip install -r requirements.txt", file=sys.stderr)
        sys.exit(1)

    from app.api import create_app

    print_banner()
    app = create_app(settings)
    uvicorn.run(app, host=settings.host, port=settings.port, log_level="warning", access_log=False)


if __name__ == "__main__":
    main()
