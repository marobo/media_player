"""HTTP Range-aware file streaming with strict path validation."""

from __future__ import annotations

import re
from email.utils import formatdate
from pathlib import Path
from typing import Iterator
from urllib.parse import unquote

from fastapi import HTTPException, Request
from fastapi.responses import Response, StreamingResponse

from .config import MIME_TYPES

CHUNK_SIZE = 1024 * 256  # 256 KiB
RANGE_RE = re.compile(r"^bytes=(\d*)-(\d*)$")


def safe_resolve(root: Path, raw_path: str, allowed_extensions: set[str]) -> Path:
    """Resolve *raw_path* inside *root*, rejecting traversal and unsupported files.

    Raises HTTPException(404) for anything suspicious so we never leak details.
    """
    decoded = unquote(raw_path)
    # Decode twice to catch double-encoded traversal attempts (%252e%252e)
    decoded = unquote(decoded)
    if not decoded or "\x00" in decoded or "\\" in decoded:
        raise HTTPException(status_code=404, detail="Not found")
    if decoded.startswith("/") or decoded.startswith("~"):
        raise HTTPException(status_code=404, detail="Not found")
    parts = [p for p in decoded.split("/") if p]
    if any(p in (".", "..") or p.startswith(".") for p in parts):
        raise HTTPException(status_code=404, detail="Not found")

    root_resolved = root.resolve()
    candidate = (root_resolved / Path(*parts)).resolve() if parts else root_resolved
    try:
        candidate.relative_to(root_resolved)
    except ValueError:
        raise HTTPException(status_code=404, detail="Not found")
    if candidate.suffix.lower() not in allowed_extensions:
        raise HTTPException(status_code=404, detail="Not found")
    if not candidate.is_file():
        raise HTTPException(status_code=404, detail="Not found")
    return candidate


def _iter_file(path: Path, start: int, end: int) -> Iterator[bytes]:
    """Yield bytes from *start* to *end* (inclusive)."""
    remaining = end - start + 1
    with open(path, "rb") as fh:
        fh.seek(start)
        while remaining > 0:
            chunk = fh.read(min(CHUNK_SIZE, remaining))
            if not chunk:
                break
            remaining -= len(chunk)
            yield chunk


def range_file_response(request: Request, path: Path, media_type: str | None = None) -> Response:
    """Serve *path* honouring a single HTTP Range (RFC 7233)."""
    stat = path.stat()
    size = stat.st_size
    media_type = media_type or MIME_TYPES.get(path.suffix.lower(), "application/octet-stream")
    etag = f'"{stat.st_mtime_ns:x}-{size:x}"'
    base_headers = {
        "Accept-Ranges": "bytes",
        "Content-Type": media_type,
        "Last-Modified": formatdate(stat.st_mtime, usegmt=True),
        "ETag": etag,
        "Cache-Control": "private, max-age=3600",
        "Access-Control-Allow-Origin": "*",
    }

    if request.headers.get("if-none-match") == etag:
        return Response(status_code=304, headers=base_headers)

    range_header = request.headers.get("range")
    start, end = 0, size - 1
    status = 200

    if range_header:
        match = RANGE_RE.match(range_header.strip())
        if not match:
            return Response(status_code=416, headers={**base_headers, "Content-Range": f"bytes */{size}"})
        start_s, end_s = match.groups()
        if start_s == "" and end_s == "":
            return Response(status_code=416, headers={**base_headers, "Content-Range": f"bytes */{size}"})
        if start_s == "":  # suffix range: last N bytes
            suffix = int(end_s)
            if suffix == 0:
                return Response(status_code=416, headers={**base_headers, "Content-Range": f"bytes */{size}"})
            start = max(0, size - suffix)
            end = size - 1
        else:
            start = int(start_s)
            end = int(end_s) if end_s else size - 1
            end = min(end, size - 1)
        if start >= size or start > end:
            return Response(status_code=416, headers={**base_headers, "Content-Range": f"bytes */{size}"})
        status = 206
        base_headers["Content-Range"] = f"bytes {start}-{end}/{size}"

    length = end - start + 1
    headers = {**base_headers, "Content-Length": str(length)}

    if request.method == "HEAD":
        return Response(status_code=status, headers=headers)
    return StreamingResponse(_iter_file(path, start, end), status_code=status, headers=headers, media_type=media_type)
