# 🎵 Local Media Server

A self-hosted music & video player for your home network. Run it on your Mac, then open it in a browser on any phone, tablet, laptop or smart TV connected to the same Wi‑Fi. Everything streams directly from your Mac — no internet connection, no cloud, no accounts.

- **Music library** with metadata, artwork, artists, albums, search
- **Video library** with thumbnails and a full custom video player (seek, speed, fullscreen, picture‑in‑picture)
- **Persistent bottom player** that keeps playing while you browse: queue, shuffle, repeat, volume, seeking
- **Playlists, favorites, recently played** (stored locally in JSON)
- **Resume where you left off** — current song, position and volume are remembered per browser
- **10‑band real‑time equalizer** (Web Audio API) with presets, ON/OFF bypass and per‑browser persistence
- **Proper HTTP Range streaming** so seeking works and large files never download fully
- **Responsive dark UI** for desktop, tablet and phone

Stack: Python 3.14 · FastAPI · Uvicorn · mutagen · vanilla HTML/CSS/JS.

---

## Installation

```bash
cd local-media-server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
python3 server.py
```

You will see:

```
============================================
🎵 LOCAL MEDIA SERVER
============================================
Server:  http://localhost:8000
Network: http://192.168.1.34:8000

Music:   ./media/music
Videos:  ./media/videos
Data:    ./data

Press CTRL+C to stop
============================================
```

Press `CTRL+C` to stop the server.

## Access

**On the Mac itself**

```
http://localhost:8000
```

**From phones, tablets, TVs and other computers on the same network**

```
http://MAC-IP:8000
```

For example `http://192.168.1.34:8000`. The exact address is printed in the terminal when the server starts and is shown in the app's sidebar and home page.

### Finding your Mac's IP address

Run one of these in Terminal (Wi‑Fi is usually `en0`, Ethernet/adapters are often `en1`):

```bash
ipconfig getifaddr en0
ipconfig getifaddr en1
```

Or open **System Settings → Wi‑Fi → Details…** next to your network and read the IP address.

> Tip: your router may hand out a different IP after a reboot. If the app stops loading on your phone, check the IP again or give your Mac a fixed IP / DHCP reservation in your router.

---

## Folder structure

```
local-media-server/
├── server.py            # entry point (prints banner, starts Uvicorn)
├── requirements.txt
├── app/                 # backend package
│   ├── config.py        # settings from environment variables
│   ├── library.py       # scanning, metadata, artwork, caching
│   ├── store.py         # playlists / favorites / recent (JSON)
│   ├── streaming.py     # HTTP Range streaming + path validation
│   └── api.py           # FastAPI routes
├── web/                 # frontend (no build step)
│   ├── index.html
│   ├── style.css
│   └── app.js
├── media/
│   ├── music/           # your audio files
│   └── videos/          # your video files
├── data/                # created automatically: cache, artwork, thumbnails, userdata.json
└── README.md
```

## Adding music and videos

Simply put files in the media folders — nothing is moved or copied.

**Music** goes into `media/music/`. Any layout works:

```
media/music/
├── Artist Name/
│   ├── Album Name/
│   │   ├── 01 Track.mp3
│   │   └── 02 Track.flac
│   └── Single.m4a
├── Some Artist - Some Song.mp3
└── cover.jpg              # optional folder artwork (cover/folder/front/album.jpg|png)
```

Metadata (title, artist, album, track number, embedded artwork…) is read from the file tags. When tags are missing the app falls back to the folder structure (`Artist/Album/Song`) or an `Artist - Title` filename.

Supported audio: `mp3`, `m4a`, `aac`, `wav`, `ogg`, `opus`, `flac` (FLAC/OGG playback depends on the browser — Safari on iPhone does not play OGG/Opus).

**Videos** go into `media/videos/` (sub‑folders are fine):

```
media/videos/
├── Holiday 2024.mp4
└── Clips/
    └── Funny cat.webm
```

Supported video: `mp4`, `m4v`, `webm`, `mov`, `ogv`. Browsers only decode what they support natively — H.264/AAC MP4 works everywhere; HEVC MOV files generally only play in Safari.

If `ffmpeg`/`ffprobe` are installed (`brew install ffmpeg`) the server also generates video thumbnails and reads video dimensions. This is optional.

**After adding files**, click **Rescan Library** in the app (sidebar or top bar) or call `POST /api/scan`. No restart needed. Metadata is cached in `data/library_cache.json`, so rescans only re‑read new or changed files.

---

## Configuration

Everything is configured with environment variables (all optional):

| Variable    | Default          | Description                                  |
|-------------|------------------|----------------------------------------------|
| `HOST`      | `0.0.0.0`        | Interface to listen on (`127.0.0.1` = Mac only) |
| `PORT`      | `8000`           | TCP port                                     |
| `MEDIA_DIR` | `./media`        | Base media folder                            |
| `MUSIC_DIR` | `$MEDIA_DIR/music` | Music folder (can be anywhere, e.g. an external drive) |
| `VIDEO_DIR` | `$MEDIA_DIR/videos` | Video folder                              |
| `DATA_DIR`  | `./data`         | Where cache, artwork and playlists are stored |

Example — serve music from an external disk on port 9000:

```bash
MUSIC_DIR="/Volumes/Media/Music" VIDEO_DIR="/Volumes/Media/Movies" PORT=9000 python3 server.py
```

---

## API

All endpoints return JSON. Interactive docs are at `http://localhost:8000/api/docs`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/status` | Library counts, LAN IP, scan state |
| `POST` | `/api/scan` | Rescan media folders |
| `GET`  | `/api/media?type=all|music|video&q=&sort=&offset=&limit=` | Combined paginated listing |
| `GET`  | `/api/music?q=&artist=&album=&sort=&offset=&limit=` | Songs (paginated) |
| `GET`  | `/api/videos?q=&sort=&offset=&limit=` | Videos (paginated) |
| `GET`  | `/api/artists`, `/api/albums` | Aggregated artists / albums |
| `GET`  | `/api/items/{id}` | Single item |
| `GET`  | `/api/search?q=` | Songs, artists, albums and videos matching `q` |
| `GET`  | `/api/home` | Data for the home page |
| `GET`  | `/api/playlists` · `POST /api/playlists` | List / create playlists |
| `GET` `PUT` `DELETE` | `/api/playlists/{id}` | Read / rename+reorder / delete |
| `POST` | `/api/playlists/{id}/items` · `DELETE /api/playlists/{id}/items/{item_id}` | Add / remove songs |
| `GET`  | `/api/favorites` · `POST /api/favorites` · `DELETE /api/favorites/{id}` | Favorites |
| `GET`  | `/api/recent` · `POST /api/recent` · `DELETE /api/recent` | Recently played |
| `GET`  | `/api/art/{art_id}` · `/api/thumb/{id}` | Album artwork / video thumbnails |
| `GET`  | `/media/music/{path}` · `/media/videos/{path}` | **Streaming** (supports `Range`, `HEAD`, `ETag`) |

Streaming endpoints only serve files with an allowed media extension that resolve inside the configured folders. Traversal attempts (`../`, encoded variants, absolute paths, hidden files) return `404`.

---

## Equalizer

Press **EQ** in the bottom player (on phones: open the now‑playing screen first). The equalizer runs entirely in the browser with the Web Audio API — nothing is processed or transcoded on the server, and it only affects music (videos play untouched).

- **10 bands**: 60 · 170 · 310 · 600 Hz · 1 · 3 · 6 · 12 · 14 · 16 kHz, each −12…+12 dB in 1 dB steps
- **Presets**: Flat, Rock, Pop, Jazz, Classical, Electronic, Bass Boost, Treble Boost, Vocal, Acoustic; moving any slider switches to *Custom*
- **ON/OFF** bypasses the filters but keeps your slider values; **Reset** returns to Flat
- Settings are saved per browser in `localStorage` under `localMediaPlayer.equalizer`
- Sliders are keyboard accessible (focus a band, use the arrow keys)

The audio graph is created on your first press of Play (browsers block audio processing before a user gesture). If a browser does not support the Web Audio API, the panel shows a notice and normal playback continues without the equalizer.

---

## Troubleshooting

**The phone can't open `http://MAC-IP:8000`**

1. Make sure the phone and the Mac are on the **same Wi‑Fi network** (guest networks are often isolated).
2. Confirm the server is running and shows a `Network:` address in the terminal.
3. **macOS Firewall**: go to *System Settings → Network → Firewall*. If it is on, either allow incoming connections for `Python` when prompted, or click *Options…* and add Python (`.venv/bin/python`) to the allowed list. Alternatively disable *Block all incoming connections*.
4. Try from the Mac first: `curl http://localhost:8000/api/status`.
5. Try the IP from another device: `curl http://MAC-IP:8000/api/status`.
6. Some routers have "AP isolation" / "client isolation" enabled which prevents devices from talking to each other. Disable it in the router settings.
7. VPNs on the Mac or the phone can route traffic away from the LAN — try turning them off.

**Network address says "could not detect LAN IP"** — run `ipconfig getifaddr en0` manually; the server still works, it just couldn't guess the address.

**Port 8000 is already in use** — start with another port: `PORT=8080 python3 server.py`.

**A song/video won't play** — the browser probably doesn't support the codec (e.g. FLAC/OGG on iPhone, HEVC/10‑bit MOV in Chrome). Convert with ffmpeg: `ffmpeg -i input.mov -c:v libx264 -c:a aac output.mp4`.

**Files don't show up** — check the extension is supported, the file is not hidden (starts with `.`), then click **Rescan Library**. Files that fail to read are skipped and listed in the server log.

**Playback stops on iPhone when the screen locks** — Safari continues audio in the background as long as the page stays open; lock‑screen controls are provided via the Media Session API. Add the page to your Home Screen (*Share → Add to Home Screen*) for an app‑like experience.

**Reset everything** — stop the server and delete the `data/` folder (this removes playlists, favorites, history and caches; your media files are untouched).

---

## Security notes

This is intended for a trusted home network. There is no authentication, so **do not port‑forward it to the internet**. The server only exposes files inside the configured music/video folders, never executes media files, and validates all paths against traversal.
