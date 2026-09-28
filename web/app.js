/* =========================================================================
   Local Media Server — frontend (vanilla JS, no build step)
   ========================================================================= */
(() => {
  "use strict";

  // ------------------------------------------------------------------ icons
  const S = (inner, fill = false) =>
    `<svg viewBox="0 0 24 24" fill="${fill ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
  const ICONS = {
    home: S('<path d="M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z"/>'),
    music: S('<path d="M9 18V6l11-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>'),
    video: S('<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9l5 3-5 3z" fill="currentColor" stroke="none"/>'),
    playlist: S('<path d="M4 6h12M4 12h12M4 18h8"/><path d="M19 12v6.5a2.5 2.5 0 1 1-2-2.45V10l4-1"/>'),
    heart: S('<path d="M12 20.5s-7.5-4.6-9.3-9.7C1.5 7.4 4 4.5 7.2 4.5c1.9 0 3.5 1 4.8 2.8 1.3-1.8 2.9-2.8 4.8-2.8 3.2 0 5.7 2.9 4.5 6.3-1.8 5.1-9.3 9.7-9.3 9.7z"/>'),
    clock: S('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    plus: S('<path d="M12 5v14M5 12h14"/>'),
    refresh: S('<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v5h-5"/>'),
    menu: S('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    "chevron-left": S('<path d="M15 6l-6 6 6 6"/>'),
    "chevron-down": S('<path d="M6 9l6 6 6-6"/>'),
    search: S('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>'),
    close: S('<path d="M6 6l12 12M18 6L6 18"/>'),
    queue: S('<path d="M4 6h10M4 12h10M4 18h16"/><path d="M17 5v8"/><path d="M14 8.5l3-3 3 3"/>'),
    shuffle: S('<path d="M16 3h5v5"/><path d="M4 20L21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/>'),
    prev: S('<path d="M6 5v14"/><path d="M19 5l-10 7 10 7z" fill="currentColor"/>'),
    next: S('<path d="M18 5v14"/><path d="M5 5l10 7-10 7z" fill="currentColor"/>'),
    play: S('<path d="M7 4.5v15l12-7.5z"/>', true),
    pause: S('<rect x="5.5" y="4" width="4.5" height="16" rx="1"/><rect x="14" y="4" width="4.5" height="16" rx="1"/>', true),
    repeat: S('<path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>'),
    "repeat-one": S('<path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/><path d="M11 10l2-1v6"/>'),
    volume: S('<path d="M4 10v4h3l4 4V6L7 10z" fill="currentColor"/><path d="M15 9a4 4 0 0 1 0 6"/><path d="M18 6a8 8 0 0 1 0 12"/>'),
    "volume-low": S('<path d="M4 10v4h3l4 4V6L7 10z" fill="currentColor"/><path d="M15 9a4 4 0 0 1 0 6"/>'),
    "volume-off": S('<path d="M4 10v4h3l4 4V6L7 10z" fill="currentColor"/><path d="M16 9l5 5M21 9l-5 5"/>'),
    pip: S('<rect x="2" y="4" width="20" height="16" rx="2"/><rect x="12" y="11" width="8" height="6" rx="1" fill="currentColor"/>'),
    fullscreen: S('<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>'),
    more: S('<circle cx="5" cy="12" r="1.8" fill="currentColor"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/><circle cx="19" cy="12" r="1.8" fill="currentColor"/>'),
    trash: S('<path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l1 13h10l1-13"/><path d="M9 7V4h6v3"/>'),
    edit: S('<path d="M4 20h4l10-10-4-4L4 16z"/><path d="M13 7l4 4"/>'),
    drag: S('<circle cx="9" cy="6" r="1.5" fill="currentColor"/><circle cx="15" cy="6" r="1.5" fill="currentColor"/><circle cx="9" cy="12" r="1.5" fill="currentColor"/><circle cx="15" cy="12" r="1.5" fill="currentColor"/><circle cx="9" cy="18" r="1.5" fill="currentColor"/><circle cx="15" cy="18" r="1.5" fill="currentColor"/>'),
    "arrow-up": S('<path d="M12 19V5"/><path d="M5 12l7-7 7 7"/>'),
    "arrow-down": S('<path d="M12 5v14"/><path d="M19 12l-7 7-7-7"/>'),
    "play-next": S('<path d="M4 6h10M4 12h10M4 18h7"/><path d="M15 13l5 3-5 3z" fill="currentColor"/>'),
    user: S('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
    disc: S('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/>'),
    folder: S('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
    check: S('<path d="M5 12l5 5L20 7"/>'),
    info: S('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'),
  };
  const icon = (name) => `<span data-icon="${name}">${ICONS[name] || ""}</span>`;
  const hydrateIcons = (root = document) => {
    root.querySelectorAll("[data-icon]").forEach((el) => {
      if (!el.firstElementChild) el.innerHTML = ICONS[el.dataset.icon] || "";
    });
  };
  const setIcon = (el, name) => { if (el) { el.dataset.icon = name; el.innerHTML = ICONS[name] || ""; } };

  // ------------------------------------------------------------------ helpers
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmtTime = (sec) => {
    if (!isFinite(sec) || sec < 0) return "0:00";
    sec = Math.floor(sec);
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return h ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
  };
  const fmtLong = (sec) => {
    if (!sec) return "0 min";
    const h = Math.floor(sec / 3600), m = Math.round((sec % 3600) / 60);
    return h ? `${h} hr ${m} min` : `${m} min`;
  };
  const fmtSize = (b) => (b >= 1e9 ? (b / 1e9).toFixed(2) + " GB" : b >= 1e6 ? (b / 1e6).toFixed(1) + " MB" : Math.round(b / 1e3) + " KB");
  const fmtAgo = (ts) => {
    if (!ts) return "";
    const d = Math.max(0, Date.now() / 1000 - ts);
    if (d < 60) return "just now";
    if (d < 3600) return `${Math.floor(d / 60)} min ago`;
    if (d < 86400) return `${Math.floor(d / 3600)} hr ago`;
    if (d < 7 * 86400) return `${Math.floor(d / 86400)} d ago`;
    return new Date(ts * 1000).toLocaleDateString();
  };
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const throttle = (fn, ms) => {
    let last = 0, t;
    return (...a) => {
      const now = Date.now();
      clearTimeout(t);
      if (now - last >= ms) { last = now; fn(...a); }
      else t = setTimeout(() => { last = Date.now(); fn(...a); }, ms - (now - last));
    };
  };
  const shuffleArray = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const artistOf = (item) => item.artist || "Unknown Artist";
  const routeArtist = (name) => `#/artist/${encodeURIComponent(name)}`;
  const routeAlbum = (name, artist) => `#/album/${encodeURIComponent(name)}${artist ? `?artist=${encodeURIComponent(artist)}` : ""}`;

  async function api(path, opts = {}) {
    const init = { method: opts.method || "GET", headers: {} };
    if (opts.body !== undefined) { init.headers["Content-Type"] = "application/json"; init.body = JSON.stringify(opts.body); }
    const res = await fetch(path, init);
    if (!res.ok) {
      let detail = res.statusText;
      try { detail = (await res.json()).detail || detail; } catch (_) { /* ignore */ }
      throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
    }
    if (res.status === 204) return null;
    return res.json();
  }

  function toast(msg, type = "") {
    const root = $("#toast-root");
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.textContent = msg;
    root.appendChild(el);
    setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity .3s"; setTimeout(() => el.remove(), 320); }, 2400);
  }

  // ------------------------------------------------------------------ state
  const state = {
    favorites: new Set(),
    playlists: [],
    lists: {},           // render-time registries: key -> items[]
    listCounter: 0,
    status: null,
  };
  const registerList = (items) => { const key = `L${++state.listCounter}`; state.lists[key] = items; return key; };
  const isFav = (id) => state.favorites.has(id);

  // ------------------------------------------------------------------ rendering helpers
  const artImg = (item, cls = "") => item.art_url
    ? `<img src="${esc(item.art_url)}" alt="" loading="lazy" class="${cls}" onerror="this.remove()">`
    : "";

  function placeholderIcon(item) {
    return item.type === "video" ? "video" : "music";
  }

  function favBtn(item, extraCls = "") {
    return `<button class="icon-btn fav-btn ${isFav(item.id) ? "on" : ""} ${extraCls}" data-action="fav" data-id="${item.id}" data-fav-id="${item.id}" aria-label="Favorite" title="Favorite">${icon("heart")}</button>`;
  }

  function trackList(items, opts = {}) {
    if (!items.length) return "";
    const key = registerList(items);
    const currentId = Player.current()?.id;
    const showArt = opts.showArt !== false;
    const extra = opts.playlistId ? ` data-playlist="${opts.playlistId}"` : "";
    const rows = items.map((it, i) => {
      const playing = it.id === currentId;
      const hasArt = showArt && it.art_url;
      const num = opts.numbering === "track" && it.track ? it.track : i + 1;
      return `
      <div class="track ${playing ? "playing" : ""}" data-action="play-list" data-list="${key}" data-index="${i}" data-id="${it.id}" data-track-num="${num}"${extra} role="button" tabindex="0">
        <div class="track-index ${hasArt ? "has-art" : ""}">
          ${hasArt ? `<img src="${esc(it.art_url)}" alt="" loading="lazy">` : ""}
          <span class="track-num">${playing ? '<span class="eq"><i></i><i></i><i></i><i></i></span>' : num}</span>
          <span class="track-play">${icon(playing && Player.isPlaying() ? "pause" : "play")}</span>
        </div>
        <div class="track-main">
          <div class="track-title">${esc(it.title)}</div>
          <div class="track-sub"><a href="${routeArtist(artistOf(it))}" data-stop>${esc(artistOf(it))}</a>${it.ext ? ` · <span class="ext">${esc(it.ext.toUpperCase())}</span>` : ""}</div>
        </div>
        <div class="track-album">${it.album ? `<a href="${routeAlbum(it.album, it.album_artist || it.artist)}" data-stop>${esc(it.album)}</a>` : ""}</div>
        <div class="track-duration">${fmtTime(it.duration)}</div>
        <div class="track-actions">
          ${favBtn(it, "small")}
          <button class="icon-btn small" data-action="menu" data-list="${key}" data-index="${i}"${extra} aria-label="More" title="More">${icon("more")}</button>
        </div>
      </div>`;
    }).join("");
    return `<div class="track-list">
      <div class="track-list-head"><span>#</span><span>Title</span><span class="h-album">Album</span><span style="text-align:right">Time</span><span></span></div>
      ${rows}
    </div>`;
  }

  function songCard(item, key, i) {
    return `
    <div class="card ${item.id === Player.current()?.id ? "playing" : ""}" data-action="play-list" data-list="${key}" data-index="${i}" data-id="${item.id}" role="button" tabindex="0">
      <div class="card-art">
        <div class="placeholder">${icon("music")}</div>
        ${artImg(item)}
        ${favBtn(item)}
        <button class="icon-btn more-btn" data-action="menu" data-list="${key}" data-index="${i}" aria-label="More">${icon("more")}</button>
        <button class="card-play" data-action="play-list" data-list="${key}" data-index="${i}" aria-label="Play">${icon("play")}</button>
      </div>
      <div class="card-title">${esc(item.title)}</div>
      <div class="card-sub">${esc(artistOf(item))}</div>
    </div>`;
  }

  function videoCard(item, key, i) {
    return `
    <div class="card" data-action="open-video" data-list="${key}" data-index="${i}" data-id="${item.id}" role="button" tabindex="0">
      <div class="card-art wide">
        <div class="placeholder">${icon("video")}</div>
        ${artImg(item)}
        ${favBtn(item)}
        <button class="icon-btn more-btn" data-action="menu" data-list="${key}" data-index="${i}" aria-label="More">${icon("more")}</button>
        <span class="card-badge">${fmtTime(item.duration)}</span>
        <button class="card-play" data-action="open-video" data-list="${key}" data-index="${i}" aria-label="Play">${icon("play")}</button>
      </div>
      <div class="card-title">${esc(item.title)}</div>
      <div class="card-sub">${esc(item.ext.toUpperCase())}${item.height ? ` · ${Math.min(item.width || item.height, item.height)}p` : ""} · ${fmtSize(item.size)}</div>
    </div>`;
  }

  function artistCard(a) {
    return `
    <a class="card" href="${routeArtist(a.name)}">
      <div class="card-art round">
        <div class="placeholder">${icon("user")}</div>
        ${artImg(a)}
      </div>
      <div class="card-title">${esc(a.name)}</div>
      <div class="card-sub">${a.count} song${a.count === 1 ? "" : "s"}</div>
    </a>`;
  }

  function albumCard(a) {
    return `
    <a class="card" href="${routeAlbum(a.name, a.artist)}">
      <div class="card-art">
        <div class="placeholder">${icon("disc")}</div>
        ${artImg(a)}
      </div>
      <div class="card-title">${esc(a.name)}</div>
      <div class="card-sub">${esc(a.artist)}${a.year ? ` · ${a.year}` : ""}</div>
    </a>`;
  }

  function playlistCard(p) {
    return `
    <a class="card" href="#/playlist/${p.id}">
      <div class="card-art">
        <div class="placeholder">${icon("playlist")}</div>
        ${artImg(p)}
        ${p.count ? `<button class="card-play" data-action="play-playlist" data-playlist="${p.id}" aria-label="Play">${icon("play")}</button>` : ""}
      </div>
      <div class="card-title">${esc(p.name)}</div>
      <div class="card-sub">${p.count} song${p.count === 1 ? "" : "s"}${p.duration ? ` · ${fmtLong(p.duration)}` : ""}</div>
    </a>`;
  }

  const mediaCard = (item, key, i) => (item.type === "video" ? videoCard(item, key, i) : songCard(item, key, i));

  function shelf(title, items, renderer, moreHref) {
    if (!items.length) return "";
    const key = registerList(items);
    return `<section class="section">
      <div class="section-head"><h2>${esc(title)}</h2>${moreHref ? `<a href="${moreHref}">See all</a>` : ""}</div>
      <div class="shelf">${items.map((it, i) => renderer(it, key, i)).join("")}</div>
    </section>`;
  }

  function emptyState(iconName, title, text) {
    return `<div class="empty-state">${icon(iconName)}<h3>${esc(title)}</h3><p>${text}</p></div>`;
  }
  const loading = () => `<div class="loading">${icon("refresh")}</div>`;

  // ------------------------------------------------------------------ router
  const main = $("#main");
  const routes = {
    home: renderHome, music: renderMusic, artist: renderArtist, album: renderAlbum, videos: renderVideos,
    playlists: renderPlaylists, playlist: renderPlaylist, favorites: renderFavorites, recent: renderRecent, search: renderSearch,
  };
  let currentRenderId = 0;

  function parseHash() {
    const raw = location.hash.replace(/^#\/?/, "") || "home";
    const [pathPart, queryPart] = raw.split("?");
    const segs = pathPart.split("/").map((s) => { try { return decodeURIComponent(s); } catch (_) { return s; } });
    const query = Object.fromEntries(new URLSearchParams(queryPart || ""));
    return { name: segs[0] || "home", segs: segs.slice(1), query };
  }

  async function navigate() {
    const route = parseHash();
    const renderId = ++currentRenderId;
    state.lists = {};
    document.body.classList.remove("sidebar-open");
    $("#app").classList.remove("sidebar-open");
    $$("[data-route]").forEach((a) => a.classList.toggle("active", a.dataset.route === route.name || (route.name === "playlist" && a.dataset.route === "playlists") || ((route.name === "artist" || route.name === "album") && a.dataset.route === "music")));
    $$("#sidebar-playlists a").forEach((a) => a.classList.toggle("active", route.name === "playlist" && a.dataset.playlist === route.segs[0]));
    if (route.name !== "search") { const inp = $("#search-input"); if (inp.value && document.activeElement !== inp) { inp.value = ""; $("#search-clear").classList.add("hidden"); } }
    const fn = routes[route.name] || renderHome;
    main.innerHTML = `<div class="page">${loading()}</div>`;
    try {
      const html = await fn(route);
      if (renderId !== currentRenderId) return;
      main.innerHTML = `<div class="page">${html}</div>`;
      main.scrollTop = 0;
      hydrateIcons(main);
      main.querySelector(".spin")?.classList.remove("spin");
    } catch (err) {
      if (renderId !== currentRenderId) return;
      main.innerHTML = `<div class="page">${emptyState("info", "Something went wrong", esc(err.message))}</div>`;
      hydrateIcons(main);
    }
  }

  function refreshCurrentPage() {
    if (!$("#video-overlay").classList.contains("hidden")) return;
    navigate();
  }

  // ------------------------------------------------------------------ pages
  async function renderHome() {
    const data = await api("/api/home");
    const st = state.status || {};
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    const empty = !data.counts.music && !data.counts.videos;
    return `
      <div class="hero">
        <div>
          <h1>${greeting}</h1>
          <p>${empty ? "Your library is empty. Add files to your media folders and rescan." : "Stream your music and videos on any device on your network."}</p>
          ${st.lan_ip ? `<p style="margin-top:8px;font-size:13px">Open on other devices: <code style="color:var(--accent-2)">http://${esc(st.lan_ip)}:${st.port}</code></p>` : ""}
        </div>
        <div class="stats">
          <div class="stat"><b>${data.counts.music}</b><span>Songs</span></div>
          <div class="stat"><b>${data.counts.videos}</b><span>Videos</span></div>
          <div class="stat"><b>${data.artists.length}${data.artists.length >= 12 ? "+" : ""}</b><span>Artists</span></div>
          <div class="stat"><b>${state.playlists.length}</b><span>Playlists</span></div>
        </div>
      </div>
      ${st.scan_errors?.length ? `<div class="notice">${st.scan_errors.length} file${st.scan_errors.length > 1 ? "s" : ""} could not be read and were skipped. See the server log for details.</div>` : ""}
      ${empty ? emptyState("folder", "No media found", `Put audio files in <code>${esc(st.music_dir || "media/music")}</code> and videos in <code>${esc(st.video_dir || "media/videos")}</code>, then click <b>Rescan Library</b>.`) : ""}
      ${shelf("Recently played", data.recent, mediaCard, "#/recent")}
      ${shelf("Recently added music", data.new_music, songCard, "#/music")}
      ${shelf("Videos", data.new_videos, videoCard, "#/videos")}
      ${shelf("Artists", data.artists, artistCard, "#/music/artists")}
      ${shelf("Albums", data.albums, albumCard, "#/music/albums")}
    `;
  }

  const PAGE = 100;
  async function renderMusic(route) {
    const tab = route.segs[0] || "songs";
    const tabs = `<div class="tabs">
      <a href="#/music" class="${tab === "songs" ? "active" : ""}">Songs</a>
      <a href="#/music/artists" class="${tab === "artists" ? "active" : ""}">Artists</a>
      <a href="#/music/albums" class="${tab === "albums" ? "active" : ""}">Albums</a>
    </div>`;
    if (tab === "artists") {
      const { items } = await api("/api/artists");
      return `<div class="page-head"><div><h1>Music</h1><div class="sub">${items.length} artist${items.length === 1 ? "" : "s"}</div></div></div>${tabs}
        ${items.length ? `<div class="grid">${items.map(artistCard).join("")}</div>` : emptyState("user", "No artists yet", "Add music to your library to see artists here.")}`;
    }
    if (tab === "albums") {
      const { items } = await api("/api/albums");
      return `<div class="page-head"><div><h1>Music</h1><div class="sub">${items.length} album${items.length === 1 ? "" : "s"}</div></div></div>${tabs}
        ${items.length ? `<div class="grid">${items.map(albumCard).join("")}</div>` : emptyState("disc", "No albums yet", "Albums appear when your files have album metadata or live in <code>Artist/Album/</code> folders.")}`;
    }
    const sort = route.query.sort || "default";
    const q = route.query.q || "";
    const data = await api(`/api/music?limit=${PAGE}&offset=0&sort=${encodeURIComponent(sort)}${q ? `&q=${encodeURIComponent(q)}` : ""}`);
    const listHtml = data.items.length ? trackList(data.items) : emptyState("music", q ? "No matches" : "No songs found", q ? "Try a different filter." : "Add audio files to your music folder and rescan.");
    const key = Object.keys(state.lists).pop();
    return `
      <div class="page-head">
        <div><h1>Music</h1><div class="sub">${data.total} song${data.total === 1 ? "" : "s"}</div></div>
        <div class="page-actions">
          <button class="btn primary" data-action="play-all" data-src="music" ${data.total ? "" : "disabled"}>${icon("play")} Play all</button>
          <button class="btn" data-action="shuffle-all" data-src="music" ${data.total ? "" : "disabled"}>${icon("shuffle")} Shuffle</button>
        </div>
      </div>
      ${tabs}
      <div class="toolbar">
        <input class="field" id="music-filter" placeholder="Filter songs" value="${esc(q)}" data-sort="${esc(sort)}">
        <select class="field" id="music-sort" data-q="${esc(q)}">
          <option value="default" ${sort === "default" ? "selected" : ""}>Artist / Album</option>
          <option value="title" ${sort === "title" ? "selected" : ""}>Title</option>
          <option value="recent" ${sort === "recent" ? "selected" : ""}>Recently added</option>
          <option value="duration" ${sort === "duration" ? "selected" : ""}>Longest</option>
        </select>
        <span class="count">Showing ${data.items.length} of ${data.total}</span>
      </div>
      <div id="music-list" data-key="${key}">${listHtml}</div>
      ${data.total > data.items.length ? `<div class="load-more"><button class="btn" data-action="load-more" data-kind="music" data-offset="${data.items.length}" data-sort="${esc(sort)}" data-q="${esc(q)}" data-total="${data.total}">Load more</button></div>` : ""}
    `;
  }

  async function renderArtist(route) {
    const name = route.segs[0] || "";
    const data = await api(`/api/music?artist=${encodeURIComponent(name)}&limit=500`);
    if (!data.items.length) return emptyState("user", "Artist not found", "This artist has no songs in the library.");
    const art = data.items.find((i) => i.art_url);
    const albums = [...new Set(data.items.map((i) => i.album).filter(Boolean))];
    const total = data.items.reduce((s, i) => s + (i.duration || 0), 0);
    const key = registerList(data.items);
    return `
      <div class="collection-head">
        <div class="collection-art round">${art ? artImg(art) : icon("user")}</div>
        <div class="collection-meta">
          <div class="kicker">Artist</div>
          <h1>${esc(name)}</h1>
          <div class="sub">${data.items.length} song${data.items.length === 1 ? "" : "s"}${albums.length ? ` · ${albums.length} album${albums.length === 1 ? "" : "s"}` : ""} · ${fmtLong(total)}</div>
          <div class="collection-actions">
            <button class="btn primary play-round" data-action="play-list" data-list="${key}" data-index="0" aria-label="Play">${icon("play")}</button>
            <button class="btn" data-action="shuffle-list" data-list="${key}">${icon("shuffle")} Shuffle</button>
            <button class="btn ghost" data-action="queue-list" data-list="${key}">${icon("queue")} Add to queue</button>
          </div>
        </div>
      </div>
      ${trackList(data.items)}
    `;
  }

  async function renderAlbum(route) {
    const name = route.segs[0] || "";
    const artist = route.query.artist || "";
    const data = await api(`/api/music?album=${encodeURIComponent(name)}${artist ? `&artist=${encodeURIComponent(artist)}` : ""}&limit=500`);
    let items = data.items;
    if (!items.length && artist) items = (await api(`/api/music?album=${encodeURIComponent(name)}&limit=500`)).items;
    if (!items.length) return emptyState("disc", "Album not found", "This album has no songs in the library.");
    const art = items.find((i) => i.art_url);
    const total = items.reduce((s, i) => s + (i.duration || 0), 0);
    const key = registerList(items);
    const albumArtist = items[0].album_artist || artist || artistOf(items[0]);
    return `
      <div class="collection-head">
        <div class="collection-art">${art ? artImg(art) : icon("disc")}</div>
        <div class="collection-meta">
          <div class="kicker">Album</div>
          <h1>${esc(name)}</h1>
          <div class="sub"><a href="${routeArtist(albumArtist)}"><b>${esc(albumArtist)}</b></a>${items[0].year ? ` · ${items[0].year}` : ""} · ${items.length} song${items.length === 1 ? "" : "s"} · ${fmtLong(total)}</div>
          <div class="collection-actions">
            <button class="btn primary play-round" data-action="play-list" data-list="${key}" data-index="0" aria-label="Play">${icon("play")}</button>
            <button class="btn" data-action="shuffle-list" data-list="${key}">${icon("shuffle")} Shuffle</button>
            <button class="btn ghost" data-action="queue-list" data-list="${key}">${icon("queue")} Add to queue</button>
          </div>
        </div>
      </div>
      ${trackList(items, { showArt: false, numbering: "track" })}
    `;
  }

  async function renderVideos(route) {
    const sort = route.query.sort || "default";
    const q = route.query.q || "";
    const data = await api(`/api/videos?limit=${PAGE}&offset=0&sort=${encodeURIComponent(sort)}${q ? `&q=${encodeURIComponent(q)}` : ""}`);
    const key = registerList(data.items);
    return `
      <div class="page-head">
        <div><h1>Videos</h1><div class="sub">${data.total} video${data.total === 1 ? "" : "s"}</div></div>
      </div>
      <div class="toolbar">
        <input class="field" id="video-filter" placeholder="Filter videos" value="${esc(q)}" data-sort="${esc(sort)}">
        <select class="field" id="video-sort" data-q="${esc(q)}">
          <option value="default" ${sort === "default" ? "selected" : ""}>Title</option>
          <option value="recent" ${sort === "recent" ? "selected" : ""}>Recently added</option>
          <option value="duration" ${sort === "duration" ? "selected" : ""}>Longest</option>
        </select>
        <span class="count">Showing ${data.items.length} of ${data.total}</span>
      </div>
      ${data.items.length ? `<div class="grid videos" id="video-grid" data-key="${key}">${data.items.map((it, i) => videoCard(it, key, i)).join("")}</div>` : emptyState("video", q ? "No matches" : "No videos found", q ? "Try a different filter." : "Add MP4/WebM/MOV files to your videos folder and rescan.")}
      ${data.total > data.items.length ? `<div class="load-more"><button class="btn" data-action="load-more" data-kind="video" data-offset="${data.items.length}" data-sort="${esc(sort)}" data-q="${esc(q)}" data-total="${data.total}">Load more</button></div>` : ""}
    `;
  }

  async function renderPlaylists() {
    await loadPlaylists();
    return `
      <div class="page-head">
        <div><h1>Playlists</h1><div class="sub">${state.playlists.length} playlist${state.playlists.length === 1 ? "" : "s"}</div></div>
        <div class="page-actions"><button class="btn primary" data-action="new-playlist">${icon("plus")} New playlist</button></div>
      </div>
      ${state.playlists.length ? `<div class="grid">${state.playlists.map(playlistCard).join("")}</div>` : emptyState("playlist", "No playlists yet", "Create a playlist, then add songs from the ⋯ menu on any track.")}
    `;
  }

  async function renderPlaylist(route) {
    const id = route.segs[0];
    let p;
    try { p = await api(`/api/playlists/${encodeURIComponent(id)}`); } catch (_) { return emptyState("playlist", "Playlist not found", 'It may have been deleted. <a href="#/playlists">Back to playlists</a>'); }
    const key = registerList(p.items);
    return `
      <div class="collection-head">
        <div class="collection-art">${p.art_url ? `<img src="${esc(p.art_url)}" alt="">` : icon("playlist")}</div>
        <div class="collection-meta">
          <div class="kicker">Playlist</div>
          <h1>${esc(p.name)}</h1>
          <div class="sub">${p.count} song${p.count === 1 ? "" : "s"} · ${fmtLong(p.duration)}</div>
          <div class="collection-actions">
            <button class="btn primary play-round" data-action="play-list" data-list="${key}" data-index="0" aria-label="Play" ${p.count ? "" : "disabled"}>${icon("play")}</button>
            <button class="btn" data-action="shuffle-list" data-list="${key}" ${p.count ? "" : "disabled"}>${icon("shuffle")} Shuffle</button>
            <button class="btn ghost" data-action="queue-list" data-list="${key}" ${p.count ? "" : "disabled"}>${icon("queue")} Add to queue</button>
            <button class="btn ghost" data-action="rename-playlist" data-playlist="${p.id}" data-name="${esc(p.name)}">${icon("edit")} Rename</button>
            <button class="btn ghost danger" data-action="delete-playlist" data-playlist="${p.id}" data-name="${esc(p.name)}">${icon("trash")} Delete</button>
          </div>
        </div>
      </div>
      ${p.items.length ? trackList(p.items, { playlistId: p.id }) : emptyState("music", "This playlist is empty", "Use the ⋯ menu on any song and choose <b>Add to playlist</b>.")}
    `;
  }

  async function renderFavorites(route) {
    const tab = route.segs[0] || "songs";
    const data = await api("/api/favorites");
    state.favorites = new Set(data.ids);
    const songs = data.items.filter((i) => i.type === "music");
    const videos = data.items.filter((i) => i.type === "video");
    const key = registerList(videos);
    const tabs = `<div class="tabs">
      <a href="#/favorites" class="${tab === "songs" ? "active" : ""}">Songs (${songs.length})</a>
      <a href="#/favorites/videos" class="${tab === "videos" ? "active" : ""}">Videos (${videos.length})</a>
    </div>`;
    let body;
    if (tab === "videos") {
      body = videos.length ? `<div class="grid videos">${videos.map((it, i) => videoCard(it, key, i)).join("")}</div>` : emptyState("heart", "No favorite videos", "Tap the heart on any video to save it here.");
    } else {
      body = songs.length ? trackList(songs) : emptyState("heart", "No favorite songs", "Tap the heart on any song to save it here.");
    }
    const skey = registerList(songs);
    return `
      <div class="page-head">
        <div><h1>Favorites</h1><div class="sub">${data.total} item${data.total === 1 ? "" : "s"}</div></div>
        <div class="page-actions">
          <button class="btn primary" data-action="play-list" data-list="${skey}" data-index="0" ${songs.length ? "" : "disabled"}>${icon("play")} Play songs</button>
          <button class="btn" data-action="shuffle-list" data-list="${skey}" ${songs.length ? "" : "disabled"}>${icon("shuffle")} Shuffle</button>
        </div>
      </div>
      ${tabs}${body}
    `;
  }

  async function renderRecent() {
    const data = await api("/api/recent?limit=100");
    const songs = data.items.filter((i) => i.type === "music");
    const videos = data.items.filter((i) => i.type === "video");
    const skey = registerList(songs);
    return `
      <div class="page-head">
        <div><h1>Recently Played</h1><div class="sub">${data.total} item${data.total === 1 ? "" : "s"}</div></div>
        <div class="page-actions">
          <button class="btn primary" data-action="play-list" data-list="${skey}" data-index="0" ${songs.length ? "" : "disabled"}>${icon("play")} Play</button>
          <button class="btn ghost" data-action="clear-recent" ${data.total ? "" : "disabled"}>${icon("trash")} Clear history</button>
        </div>
      </div>
      ${!data.total ? emptyState("clock", "Nothing played yet", "Songs and videos you play will show up here.") : ""}
      ${videos.length ? `<section class="section"><div class="section-head"><h2>Videos</h2></div><div class="shelf">${(() => { const k = registerList(videos); return videos.map((it, i) => videoCard(it, k, i)).join(""); })()}</div></section>` : ""}
      ${songs.length ? `<section class="section"><div class="section-head"><h2>Songs</h2></div>${trackList(songs)}</section>` : ""}
    `;
  }

  async function renderSearch(route) {
    const q = (route.query.q || "").trim();
    const inp = $("#search-input");
    if (inp.value !== q && document.activeElement !== inp) inp.value = q;
    $("#search-clear").classList.toggle("hidden", !q);
    if (!q) return `<div class="page-head"><div><h1>Search</h1><div class="sub">Find songs, artists, albums and videos.</div></div></div>`;
    const r = await api(`/api/search?q=${encodeURIComponent(q)}&limit=40`);
    const total = r.songs.length + r.artists.length + r.albums.length + r.videos.length;
    const vkey = registerList(r.videos);
    return `
      <div class="page-head"><div><h1>Results for “${esc(q)}”</h1><div class="sub">${total} result${total === 1 ? "" : "s"}</div></div></div>
      ${!total ? emptyState("search", "No results", "Try a different search term.") : ""}
      ${r.songs.length ? `<section class="section"><div class="section-head"><h2>Songs</h2></div>${trackList(r.songs)}</section>` : ""}
      ${r.artists.length ? `<section class="section"><div class="section-head"><h2>Artists</h2></div><div class="shelf">${r.artists.map(artistCard).join("")}</div></section>` : ""}
      ${r.albums.length ? `<section class="section"><div class="section-head"><h2>Albums</h2></div><div class="shelf">${r.albums.map(albumCard).join("")}</div></section>` : ""}
      ${r.videos.length ? `<section class="section"><div class="section-head"><h2>Videos</h2></div><div class="grid videos">${r.videos.map((it, i) => videoCard(it, vkey, i)).join("")}</div></section>` : ""}
    `;
  }

  // ------------------------------------------------------------------ audio player
  const audio = $("#audio");
  const els = {
    player: $("#player"), art: $("#player-art"), title: $("#player-title"), artist: $("#player-artist"), fav: $("#player-fav"),
    play: $("#btn-play"), miniPlay: $("#mini-play-icon"), shuffle: $("#btn-shuffle"), repeat: $("#btn-repeat"),
    seek: $("#seek"), cur: $("#time-current"), total: $("#time-total"), volume: $("#volume"), mute: $("#btn-mute"), miniFill: $("#mini-progress-fill"),
  };
  const STORAGE_KEY = "lms.player.v1";

  const Player = {
    queue: [], index: -1, shuffle: false, repeat: "off", originalQueue: null, seeking: false, errorStreak: 0, restoredPosition: null, recentedId: null,

    current() { return this.queue[this.index] || null; },
    isPlaying() { return !audio.paused && !audio.ended && !!this.current(); },

    playList(items, index = 0, { shuffle = false } = {}) {
      const songs = items.filter((i) => i.type !== "video");
      if (!songs.length) return;
      const start = Math.max(0, Math.min(index, songs.length - 1));
      if (shuffle) {
        this.shuffle = true;
        const first = songs[start];
        this.originalQueue = songs.slice();
        this.queue = [first, ...shuffleArray(songs.filter((_, i) => i !== start))];
        this.index = 0;
      } else {
        if (this.shuffle) this.shuffle = false;
        this.originalQueue = null;
        this.queue = songs.slice();
        this.index = start;
      }
      this.load(true);
      this.renderQueue();
      this.updateToggles();
    },
    addToQueue(items) {
      const songs = items.filter((i) => i.type !== "video");
      if (!songs.length) return;
      const wasEmpty = !this.queue.length;
      this.queue.push(...songs);
      if (this.originalQueue) this.originalQueue.push(...songs);
      if (wasEmpty) { this.index = 0; this.load(true); }
      this.renderQueue(); this._saveNow();
      toast(songs.length === 1 ? `Added “${songs[0].title}” to queue` : `Added ${songs.length} songs to queue`);
    },
    playNext(items) {
      const songs = items.filter((i) => i.type !== "video");
      if (!songs.length) return;
      if (!this.queue.length) return this.playList(songs, 0);
      this.queue.splice(this.index + 1, 0, ...songs);
      if (this.originalQueue) this.originalQueue.push(...songs);
      this.renderQueue(); this._saveNow();
      toast(songs.length === 1 ? `“${songs[0].title}” will play next` : `${songs.length} songs will play next`);
    },
    removeAt(i) {
      if (i < 0 || i >= this.queue.length) return;
      const removed = this.queue.splice(i, 1)[0];
      if (this.originalQueue) { const k = this.originalQueue.indexOf(removed); if (k >= 0) this.originalQueue.splice(k, 1); }
      if (i < this.index) this.index--;
      else if (i === this.index) {
        if (!this.queue.length) { this.index = -1; this.clearAudio(); }
        else { this.index = Math.min(this.index, this.queue.length - 1); this.load(this.isPlaying() || !audio.paused); }
      }
      this.renderQueue(); this._saveNow();
    },
    move(from, to) {
      if (from === to || from < 0 || to < 0 || from >= this.queue.length || to >= this.queue.length) return;
      const cur = this.current();
      const [it] = this.queue.splice(from, 1);
      this.queue.splice(to, 0, it);
      this.index = this.queue.indexOf(cur);
      this.renderQueue(); this._saveNow();
    },
    clear() {
      const cur = this.current();
      this.queue = cur ? [cur] : [];
      this.originalQueue = null;
      this.index = cur ? 0 : -1;
      this.renderQueue(); this._saveNow();
      toast("Queue cleared");
    },
    clearAudio() {
      audio.removeAttribute("src"); audio.load();
      this.updateNowPlaying(); this.updateProgress(); this.updatePlayIcon();
    },
    jumpTo(i) { if (i < 0 || i >= this.queue.length) return; this.index = i; this.load(true); },

    load(autoplay) {
      const it = this.current();
      if (!it) return this.clearAudio();
      this.recentedId = null;
      audio.src = it.stream_url;
      audio.load();
      this.updateNowPlaying();
      this.updateProgress();
      this.renderQueue();
      highlightPlaying();
      this._saveNow();
      if (autoplay) this.play();
    },
    async play() {
      if (!this.current()) { if (this.queue.length) { this.index = 0; return this.load(true); } return; }
      if (!audio.src) audio.src = this.current().stream_url;
      // play() is only ever reached from a user gesture (click / key / media key), so this is the
      // right moment to lazily create the AudioContext and lift autoplay suspension.
      EQ.ensureContext(); EQ.resume();
      try { await audio.play(); } catch (err) { if (err.name !== "AbortError") console.warn("play() failed:", err.message); }
    },
    pause() { audio.pause(); },
    toggle() { this.isPlaying() ? this.pause() : this.play(); },
    next(auto = false) {
      if (!this.queue.length) return;
      if (auto && this.repeat === "one") { audio.currentTime = 0; return this.play(); }
      if (this.index < this.queue.length - 1) { this.index++; return this.load(true); }
      if (this.repeat === "all" || !auto) { this.index = 0; return this.load(!auto || this.repeat === "all"); }
      audio.pause(); audio.currentTime = 0; this.updatePlayIcon();
    },
    prev() {
      if (!this.queue.length) return;
      if (audio.currentTime > 3 || this.index === 0) { audio.currentTime = 0; return this.play(); }
      this.index--; this.load(true);
    },
    toggleShuffle() {
      if (!this.shuffle) {
        this.shuffle = true;
        const cur = this.current();
        this.originalQueue = this.queue.slice();
        const rest = shuffleArray(this.queue.filter((_, i) => i !== this.index));
        this.queue = cur ? [cur, ...rest] : rest;
        this.index = cur ? 0 : -1;
      } else {
        this.shuffle = false;
        if (this.originalQueue) {
          const cur = this.current();
          this.queue = this.originalQueue.slice();
          this.index = cur ? this.queue.indexOf(cur) : -1;
          this.originalQueue = null;
        }
      }
      this.updateToggles(); this.renderQueue(); this._saveNow();
      toast(this.shuffle ? "Shuffle on" : "Shuffle off");
    },
    cycleRepeat() {
      this.repeat = this.repeat === "off" ? "all" : this.repeat === "all" ? "one" : "off";
      this.updateToggles(); this._saveNow();
      toast(this.repeat === "off" ? "Repeat off" : this.repeat === "all" ? "Repeat all" : "Repeat one");
    },
    setVolume(v) { audio.volume = Math.max(0, Math.min(1, v)); if (v > 0) audio.muted = false; },
    toggleMute() { audio.muted = !audio.muted; },

    // -- UI
    updateNowPlaying() {
      const it = this.current();
      if (!it) {
        els.art.innerHTML = icon("music"); els.title.textContent = "Nothing playing"; els.artist.textContent = "Pick a song to start";
        els.fav.classList.remove("on"); els.fav.dataset.favId = ""; document.title = "Local Media";
        if ("mediaSession" in navigator) navigator.mediaSession.metadata = null;
        return;
      }
      els.art.innerHTML = it.art_url ? `<img src="${esc(it.art_url)}" alt="">` : icon("music");
      els.title.innerHTML = it.album ? `<a href="${routeAlbum(it.album, it.album_artist || it.artist)}" title="${esc(it.title)}">${esc(it.title)}</a>` : esc(it.title);
      els.artist.innerHTML = `<a href="${routeArtist(artistOf(it))}">${esc(artistOf(it))}</a>`;
      els.fav.classList.toggle("on", isFav(it.id)); els.fav.dataset.favId = it.id;
      document.title = `${it.title} · ${artistOf(it)}`;
      if ("mediaSession" in navigator) {
        try {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: it.title, artist: artistOf(it), album: it.album || "",
            artwork: it.art_url ? [{ src: new URL(it.art_url, location.href).href, sizes: "512x512", type: "image/jpeg" }] : [],
          });
        } catch (_) { /* ignore */ }
      }
    },
    updatePlayIcon() {
      const playing = this.isPlaying();
      setIcon(els.play.firstElementChild, playing ? "pause" : "play");
      els.play.setAttribute("aria-label", playing ? "Pause" : "Play");
      setIcon(els.miniPlay, playing ? "pause" : "play");
      els.player.classList.toggle("paused", !playing);
      $$(`.track[data-id]`).forEach((row) => {
        const isCur = row.dataset.id === this.current()?.id;
        const ic = row.querySelector(".track-play [data-icon]");
        if (ic) setIcon(ic, isCur && playing ? "pause" : "play");
      });
      if ("mediaSession" in navigator) { try { navigator.mediaSession.playbackState = playing ? "playing" : "paused"; } catch (_) { /* ignore */ } }
    },
    updateProgress() {
      const d = audio.duration, t = audio.currentTime || 0;
      const pct = d && isFinite(d) ? (t / d) * 100 : 0;
      if (!this.seeking) { els.seek.value = Math.round(pct * 10); els.seek.style.setProperty("--pct", pct + "%"); }
      els.cur.textContent = fmtTime(t);
      els.total.textContent = fmtTime(isFinite(d) ? d : this.current()?.duration || 0);
      els.miniFill.style.width = pct + "%";
    },
    updateToggles() {
      els.shuffle.classList.toggle("on", this.shuffle);
      els.repeat.classList.toggle("on", this.repeat !== "off");
      setIcon(els.repeat.firstElementChild, this.repeat === "one" ? "repeat-one" : "repeat");
    },
    updateVolumeUI() {
      const v = audio.muted ? 0 : audio.volume;
      els.volume.value = Math.round(v * 100);
      els.volume.style.setProperty("--pct", v * 100 + "%");
      setIcon(els.mute.firstElementChild, v === 0 ? "volume-off" : v < 0.5 ? "volume-low" : "volume");
    },
    renderQueue() { renderQueuePanel(); },

    // -- persistence
    save: throttle(() => Player._saveNow(), 1500),
    _saveNow() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          queue: this.queue.map(slimItem), originalQueue: this.originalQueue ? this.originalQueue.map(slimItem) : null,
          index: this.index, position: audio.currentTime || 0, volume: audio.volume, muted: audio.muted,
          shuffle: this.shuffle, repeat: this.repeat,
        }));
      } catch (_) { /* storage full or disabled */ }
    },
    restore() {
      let s = null;
      try { s = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch (_) { /* ignore */ }
      audio.volume = typeof s?.volume === "number" ? s.volume : 0.8;
      audio.muted = !!s?.muted;
      this.updateVolumeUI();
      if (!s || !Array.isArray(s.queue) || !s.queue.length) { this.updateNowPlaying(); this.updateToggles(); this.renderQueue(); return; }
      this.queue = s.queue; this.originalQueue = s.originalQueue || null;
      this.index = Math.max(0, Math.min(s.index || 0, this.queue.length - 1));
      this.shuffle = !!s.shuffle; this.repeat = ["off", "all", "one"].includes(s.repeat) ? s.repeat : "off";
      this.restoredPosition = s.position || 0;
      const it = this.current();
      audio.src = it.stream_url; audio.load();
      this.updateNowPlaying(); this.updateToggles(); this.updateProgress(); this.renderQueue();
      els.cur.textContent = fmtTime(this.restoredPosition);
      if (it.duration) { const pct = (this.restoredPosition / it.duration) * 100; els.seek.value = Math.round(pct * 10); els.seek.style.setProperty("--pct", pct + "%"); els.miniFill.style.width = pct + "%"; }
    },
  };
  const slimItem = (i) => ({ id: i.id, type: i.type, title: i.title, artist: i.artist, album: i.album, album_artist: i.album_artist, duration: i.duration, ext: i.ext, stream_url: i.stream_url, art_url: i.art_url });

  // audio events
  audio.addEventListener("loadedmetadata", () => {
    if (Player.restoredPosition != null) {
      const pos = Player.restoredPosition; Player.restoredPosition = null;
      if (pos > 0 && pos < (audio.duration || Infinity) - 2) { try { audio.currentTime = pos; } catch (_) { /* ignore */ } }
    }
    Player.updateProgress();
  });
  audio.addEventListener("timeupdate", () => { Player.updateProgress(); Player.save(); });
  audio.addEventListener("play", () => {
    EQ.resume(); // e.g. resumed from lock-screen / media keys while the context was suspended
    Player.updatePlayIcon(); Player.errorStreak = 0;
    const it = Player.current();
    if (it && Player.recentedId !== it.id) { Player.recentedId = it.id; api("/api/recent", { method: "POST", body: { id: it.id } }).catch(() => {}); }
  });
  audio.addEventListener("pause", () => { Player.updatePlayIcon(); Player._saveNow(); });
  audio.addEventListener("ended", () => Player.next(true));
  audio.addEventListener("volumechange", () => { Player.updateVolumeUI(); Player.save(); });
  audio.addEventListener("error", () => {
    const it = Player.current();
    if (!it || !audio.src) return;
    Player.errorStreak++;
    toast(`Can't play “${it.title}” (${it.ext?.toUpperCase() || "unsupported"})`, "error");
    if (Player.errorStreak < Player.queue.length && Player.queue.length > 1) setTimeout(() => Player.next(true), 600);
    else Player.updatePlayIcon();
  });
  audio.addEventListener("waiting", () => els.player.classList.add("buffering"));
  audio.addEventListener("playing", () => els.player.classList.remove("buffering"));

  // seek + volume sliders
  els.seek.addEventListener("input", () => { Player.seeking = true; const d = audio.duration || Player.current()?.duration || 0; const pct = els.seek.value / 10; els.seek.style.setProperty("--pct", pct + "%"); els.cur.textContent = fmtTime((pct / 100) * d); });
  els.seek.addEventListener("change", () => { const d = audio.duration || Player.current()?.duration || 0; if (d) audio.currentTime = (els.seek.value / 1000) * d; Player.seeking = false; });
  els.volume.addEventListener("input", () => { Player.setVolume(els.volume.value / 100); els.volume.style.setProperty("--pct", els.volume.value + "%"); });

  if ("mediaSession" in navigator) {
    const ms = navigator.mediaSession;
    const safe = (a, fn) => { try { ms.setActionHandler(a, fn); } catch (_) { /* unsupported action */ } };
    safe("play", () => Player.play()); safe("pause", () => Player.pause());
    safe("previoustrack", () => Player.prev()); safe("nexttrack", () => Player.next());
    safe("seekto", (d) => { if (d.seekTime != null) audio.currentTime = d.seekTime; });
    safe("seekbackward", () => { audio.currentTime = Math.max(0, audio.currentTime - 10); });
    safe("seekforward", () => { audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10); });
  }

  // ------------------------------------------------------------------ equalizer (Web Audio API)
  // Graph:  <audio> → MediaElementSource → [10 × BiquadFilter] → master GainNode → destination
  // Bypass: <audio> → MediaElementSource ─────────────────────────→ master GainNode → destination
  // The graph is built once (lazily, on the first user-initiated play) and is never rebuilt when
  // the track changes — the same HTMLAudioElement stays connected to the same source node.
  const EQ_STORAGE_KEY = "localMediaPlayer.equalizer";
  const EQ_BANDS = [
    { freq: 60, label: "60", type: "lowshelf" },
    { freq: 170, label: "170", type: "peaking" },
    { freq: 310, label: "310", type: "peaking" },
    { freq: 600, label: "600", type: "peaking" },
    { freq: 1000, label: "1K", type: "peaking" },
    { freq: 3000, label: "3K", type: "peaking" },
    { freq: 6000, label: "6K", type: "peaking" },
    { freq: 12000, label: "12K", type: "peaking" },
    { freq: 14000, label: "14K", type: "peaking" },
    { freq: 16000, label: "16K", type: "highshelf" },
  ];
  const EQ_PRESETS = {
    //                 60  170  310  600   1K   3K   6K  12K  14K  16K
    flat:        { name: "Flat",         gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    rock:        { name: "Rock",         gains: [5, 4, 3, 1, -1, 1, 3, 4, 4, 4] },
    pop:         { name: "Pop",          gains: [-1, 1, 3, 4, 3, 1, -1, -1, 0, 0] },
    jazz:        { name: "Jazz",         gains: [3, 2, 1, 2, -2, -2, 0, 1, 2, 3] },
    classical:   { name: "Classical",    gains: [4, 3, 2, 0, 0, 0, -2, -2, -2, -3] },
    electronic:  { name: "Electronic",   gains: [5, 4, 1, 0, -2, 2, 1, 2, 4, 5] },
    bassBoost:   { name: "Bass Boost",   gains: [7, 6, 4, 2, 0, 0, 0, 0, 0, 0] },
    trebleBoost: { name: "Treble Boost", gains: [0, 0, 0, 0, 0, 2, 4, 6, 6, 7] },
    vocal:       { name: "Vocal",        gains: [-2, -3, -2, 1, 4, 5, 4, 2, 0, -1] },
    acoustic:    { name: "Acoustic",     gains: [4, 3, 2, 1, 2, 2, 3, 3, 2, 1] },
  };
  const EQ_MIN = -12, EQ_MAX = 12;
  const clampDb = (v) => Math.max(EQ_MIN, Math.min(EQ_MAX, Math.round(Number(v) || 0)));
  const fmtDb = (v) => (v > 0 ? `+${v}` : `${v}`) + " dB";

  const EQ = {
    ctx: null, source: null, filters: [], gain: null, ready: false, failed: false, unsupported: false,
    enabled: true, gains: EQ_PRESETS.flat.gains.slice(), preset: "flat",
    el: {},

    // -- persistence
    load() {
      try {
        const s = JSON.parse(localStorage.getItem(EQ_STORAGE_KEY) || "null");
        if (s && typeof s === "object") {
          if (Array.isArray(s.gains) && s.gains.length === EQ_BANDS.length) this.gains = s.gains.map(clampDb);
          if (typeof s.enabled === "boolean") this.enabled = s.enabled;
          if (typeof s.preset === "string" && (s.preset === "custom" || EQ_PRESETS[s.preset])) this.preset = s.preset;
        }
      } catch (_) { /* ignore corrupt storage */ }
    },
    save() {
      try { localStorage.setItem(EQ_STORAGE_KEY, JSON.stringify({ enabled: this.enabled, gains: this.gains, preset: this.preset })); } catch (_) { /* ignore */ }
    },

    // -- Web Audio graph (built lazily after a user gesture)
    supported() { return typeof (window.AudioContext || window.webkitAudioContext) === "function"; },
    ensureContext() {
      if (this.ready || this.failed) return this.ready;
      if (!this.supported()) { this.unsupported = true; this.failed = true; this.updateStatus(); return false; }
      const Ctx = window.AudioContext || window.webkitAudioContext;
      try {
        this.ctx = new Ctx();
        this.source = this.ctx.createMediaElementSource(audio);
        this.filters = EQ_BANDS.map((band, i) => {
          const f = this.ctx.createBiquadFilter();
          f.type = band.type;
          f.frequency.value = band.freq;
          if (band.type === "peaking") f.Q.value = 1.1;
          f.gain.value = this.gains[i];
          return f;
        });
        for (let i = 0; i < this.filters.length - 1; i++) this.filters[i].connect(this.filters[i + 1]);
        this.gain = this.ctx.createGain();
        this.gain.gain.value = 1.0;
        this.filters[this.filters.length - 1].connect(this.gain);
        this.gain.connect(this.ctx.destination);
        this.ready = true;
        this.route();
        this.ctx.onstatechange = () => this.updateStatus();
      } catch (err) {
        // Anything went wrong: leave the <audio> element on its normal output path so playback still works.
        console.warn("Equalizer unavailable:", err);
        this.failed = true;
        try { this.source?.disconnect(); this.source?.connect(this.ctx.destination); } catch (_) { /* ignore */ }
        this.ctx = null; this.source = null; this.filters = []; this.gain = null;
      }
      this.updateStatus();
      return this.ready;
    },
    resume() {
      if (this.ctx && this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
    },
    // Connect the source either through the filter chain or straight to the master gain (bypass).
    route() {
      if (!this.ready) return;
      try { this.source.disconnect(); } catch (_) { /* not connected yet */ }
      this.source.connect(this.enabled ? this.filters[0] : this.gain);
    },
    applyGains() {
      if (!this.ready) return;
      const t = this.ctx.currentTime;
      this.filters.forEach((f, i) => { f.gain.cancelScheduledValues(t); f.gain.setTargetAtTime(this.gains[i], t, 0.02); });
    },

    // -- state changes
    setBand(i, value, { fromPreset = false } = {}) {
      this.gains[i] = clampDb(value);
      if (this.ready) { const t = this.ctx.currentTime; this.filters[i].gain.cancelScheduledValues(t); this.filters[i].gain.setTargetAtTime(this.gains[i], t, 0.02); }
      if (!fromPreset) this.preset = this.detectPreset();
      this.renderBand(i);
      this.renderPreset();
      this.renderEnabled();
      this.save();
    },
    detectPreset() {
      const hit = Object.keys(EQ_PRESETS).find((k) => EQ_PRESETS[k].gains.every((g, i) => g === this.gains[i]));
      return hit || "custom";
    },
    setPreset(key) {
      const p = EQ_PRESETS[key];
      if (!p) return;
      this.gains = p.gains.slice();
      this.preset = key;
      this.applyGains();
      this.renderAll();
      this.save();
    },
    reset() { this.setPreset("flat"); toast("Equalizer reset"); },
    setEnabled(on) {
      this.enabled = !!on;
      this.route();
      this.renderEnabled();
      this.save();
    },

    // -- UI
    init() {
      this.load();
      this.el = { panel: $("#eq-panel"), btn: $("#btn-eq"), bands: $("#eq-bands"), preset: $("#eq-preset"), enabled: $("#eq-enabled"), switchLabel: $("#eq-switch-label"), status: $("#eq-status"), body: $(".eq-body"), reset: $("#eq-reset") };
      this.el.bands.innerHTML = EQ_BANDS.map((b, i) => `
        <div class="eq-band">
          <span class="eq-band-value" id="eq-val-${i}">${fmtDb(this.gains[i])}</span>
          <div class="eq-slider-wrap">
            <input type="range" class="slider" id="eq-band-${i}" data-band="${i}" min="${EQ_MIN}" max="${EQ_MAX}" step="1" value="${this.gains[i]}"
                   aria-label="${b.freq >= 1000 ? b.freq / 1000 + " kHz" : b.freq + " Hz"}" aria-valuetext="${fmtDb(this.gains[i])}" aria-orientation="vertical">
          </div>
          <span class="eq-band-freq">${b.label}${b.freq < 1000 ? " Hz" : ""}</span>
        </div>`).join("");
      this.el.preset.innerHTML = Object.entries(EQ_PRESETS).map(([k, p]) => `<option value="${k}">${p.name}</option>`).join("") + `<option value="custom">Custom</option>`;

      this.el.bands.addEventListener("input", (e) => {
        const input = e.target.closest("input[data-band]"); if (!input) return;
        this.ensureContext(); this.resume();
        this.setBand(Number(input.dataset.band), input.value);
      });
      this.el.preset.addEventListener("change", () => {
        if (this.el.preset.value === "custom") { this.renderPreset(); return; }
        this.ensureContext(); this.resume();
        this.setPreset(this.el.preset.value);
      });
      this.el.enabled.addEventListener("change", () => { this.ensureContext(); this.resume(); this.setEnabled(this.el.enabled.checked); toast(this.enabled ? "Equalizer on" : "Equalizer off (bypassed)"); });
      this.el.reset.addEventListener("click", () => { this.ensureContext(); this.reset(); });
      // click outside closes the popover (but not clicks on the player controls that opened it)
      document.addEventListener("click", (e) => {
        if (this.el.panel.classList.contains("hidden")) return;
        if (e.target.closest("#eq-panel") || e.target.closest("[data-action='toggle-eq']")) return;
        this.close();
      });
      this.renderAll();
    },
    open() { this.el.panel.classList.remove("hidden"); this.el.btn.classList.add("open"); this.el.btn.setAttribute("aria-expanded", "true"); this.ensureContext(); this.updateStatus(); },
    close() { this.el.panel.classList.add("hidden"); this.el.btn.classList.remove("open"); this.el.btn.setAttribute("aria-expanded", "false"); },
    toggle() { this.isOpen() ? this.close() : this.open(); },
    isOpen() { return !this.el.panel.classList.contains("hidden"); },
    renderBand(i) {
      const input = $(`#eq-band-${i}`), val = $(`#eq-val-${i}`);
      if (!input) return;
      const g = this.gains[i];
      if (Number(input.value) !== g) input.value = g;
      input.setAttribute("aria-valuetext", fmtDb(g));
      input.style.setProperty("--pct", ((g - EQ_MIN) / (EQ_MAX - EQ_MIN)) * 100 + "%");
      val.textContent = fmtDb(g);
      val.classList.toggle("zero", g === 0);
    },
    renderPreset() { if (this.el.preset) this.el.preset.value = this.preset; },
    renderEnabled() {
      this.el.enabled.checked = this.enabled;
      this.el.switchLabel.textContent = this.enabled ? "ON" : "OFF";
      this.el.body.classList.toggle("bypassed", !this.enabled);
      this.el.btn.classList.toggle("on", this.enabled && this.gains.some((g) => g !== 0));
    },
    updateStatus() {
      const s = this.el.status; if (!s) return;
      s.classList.remove("warn");
      if (this.unsupported) { s.textContent = "Web Audio API not supported in this browser"; s.classList.add("warn"); }
      else if (this.failed) { s.textContent = "Equalizer unavailable — playback continues without EQ"; s.classList.add("warn"); }
      else if (!this.ready) s.textContent = "Press play to activate";
      else if (this.ctx.state === "suspended") s.textContent = "Audio paused";
      else s.textContent = `Active · ${this.ctx.sampleRate / 1000} kHz`;
    },
    renderAll() { EQ_BANDS.forEach((_, i) => this.renderBand(i)); this.renderPreset(); this.renderEnabled(); this.updateStatus(); },
  };

  function highlightPlaying() {
    const id = Player.current()?.id;
    $$(".track[data-id], .card[data-id]").forEach((el) => {
      const on = el.dataset.id === id && el.dataset.action === "play-list";
      el.classList.toggle("playing", on);
      const num = el.querySelector(".track-num");
      if (num) num.innerHTML = on ? '<span class="eq"><i></i><i></i><i></i><i></i></span>' : (el.dataset.trackNum || String(Number(el.dataset.index) + 1));
    });
    Player.updatePlayIcon();
  }

  // ------------------------------------------------------------------ queue panel
  function renderQueuePanel() {
    const body = $("#queue-body");
    if (!Player.queue.length) { body.innerHTML = `<div class="queue-empty">Your queue is empty.<br>Play a song or use “Add to queue”.</div>`; return; }
    const cur = Player.index;
    const row = (it, i) => `
      <div class="queue-item ${i === cur ? "current" : ""}" data-qindex="${i}" draggable="true">
        <span class="q-handle" title="Drag to reorder">${icon("drag")}</span>
        <div class="q-art">${it.art_url ? `<img src="${esc(it.art_url)}" alt="" loading="lazy">` : icon("music")}</div>
        <div class="q-main" data-action="queue-jump" data-qindex="${i}">
          <div class="q-title">${esc(it.title)}</div>
          <div class="q-sub">${esc(artistOf(it))} · ${fmtTime(it.duration)}</div>
        </div>
        <div class="q-actions">
          <button class="icon-btn" data-action="queue-up" data-qindex="${i}" aria-label="Move up" ${i === 0 ? "disabled" : ""}>${icon("arrow-up")}</button>
          <button class="icon-btn" data-action="queue-down" data-qindex="${i}" aria-label="Move down" ${i === Player.queue.length - 1 ? "disabled" : ""}>${icon("arrow-down")}</button>
          <button class="icon-btn danger" data-action="queue-remove" data-qindex="${i}" aria-label="Remove">${icon("close")}</button>
        </div>
      </div>`;
    const now = Player.queue[cur] ? `<div class="queue-label">Now playing</div>${row(Player.queue[cur], cur)}` : "";
    const next = Player.queue.slice(cur + 1).map((it, k) => row(it, cur + 1 + k)).join("");
    const before = Player.queue.slice(0, Math.max(cur, 0)).map((it, k) => row(it, k)).join("");
    body.innerHTML = `${now}${next ? `<div class="queue-label">Next up · ${Player.queue.length - cur - 1}</div>${next}` : ""}${before ? `<div class="queue-label">Played</div>${before}` : ""}`;
  }

  // drag & drop reorder
  let dragFrom = null;
  $("#queue-body").addEventListener("dragstart", (e) => {
    const row = e.target.closest(".queue-item"); if (!row) return;
    dragFrom = Number(row.dataset.qindex); row.classList.add("dragging"); e.dataTransfer.effectAllowed = "move";
    try { e.dataTransfer.setData("text/plain", String(dragFrom)); } catch (_) { /* ignore */ }
  });
  $("#queue-body").addEventListener("dragover", (e) => { const row = e.target.closest(".queue-item"); if (!row) return; e.preventDefault(); $$(".queue-item.drag-over").forEach((r) => r.classList.remove("drag-over")); row.classList.add("drag-over"); });
  $("#queue-body").addEventListener("dragleave", (e) => { e.target.closest?.(".queue-item")?.classList.remove("drag-over"); });
  $("#queue-body").addEventListener("drop", (e) => {
    const row = e.target.closest(".queue-item"); if (!row || dragFrom == null) return;
    e.preventDefault(); Player.move(dragFrom, Number(row.dataset.qindex)); dragFrom = null;
  });
  $("#queue-body").addEventListener("dragend", () => { $$(".queue-item").forEach((r) => r.classList.remove("dragging", "drag-over")); dragFrom = null; });

  // ------------------------------------------------------------------ video player
  const V = {
    overlay: $("#video-overlay"), stage: $("#video-stage"), video: $("#video"), list: [], index: -1, item: null, idleTimer: null, seeking: false, recented: false,
    el: {
      title: $("#video-title"), fav: $("#video-fav"), play: $("#video-play"), seek: $("#video-seek"), cur: $("#video-current"), dur: $("#video-duration"),
      vol: $("#video-volume"), mute: $("#video-mute"), speedBtn: $("#video-speed-btn"), speedMenu: $("#speed-menu"), info: $("#video-info"), pip: $("#video-pip"),
    },
    open(item, list = null) {
      if (list) { this.list = list.filter((i) => i.type === "video"); this.index = this.list.findIndex((i) => i.id === item.id); }
      else if (!this.list.length) { this.list = [item]; this.index = 0; }
      this.item = item; this.recented = false;
      Player.pause();
      this.overlay.classList.remove("hidden");
      document.body.style.overflow = "hidden";
      this.video.src = item.stream_url;
      this.video.load();
      this.el.title.textContent = item.title;
      this.el.fav.classList.toggle("on", isFav(item.id)); this.el.fav.dataset.favId = item.id;
      this.el.seek.value = 0; this.el.seek.style.setProperty("--pct", "0%"); this.el.seek.style.setProperty("--buffered", "0%");
      this.el.cur.textContent = "0:00"; this.el.dur.textContent = fmtTime(item.duration);
      this.el.pip.classList.toggle("hidden", !document.pictureInPictureEnabled);
      this.renderInfo();
      this.stage.classList.remove("idle");
      this.setSpeed(1);
      this.video.play().catch(() => {});
      this.wake();
    },
    close() {
      if (document.pictureInPictureElement) document.exitPictureInPicture().catch(() => {});
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      this.video.pause(); this.video.removeAttribute("src"); this.video.load();
      this.overlay.classList.add("hidden");
      document.body.style.overflow = "";
      this.item = null;
      document.title = Player.current() ? `${Player.current().title} · ${artistOf(Player.current())}` : "Local Media";
    },
    isOpen() { return !this.overlay.classList.contains("hidden"); },
    toggle() { this.video.paused ? this.video.play().catch(() => {}) : this.video.pause(); },
    step(d) { const i = this.index + d; if (i >= 0 && i < this.list.length) { this.index = i; this.open(this.list[i]); } else toast(d > 0 ? "No more videos" : "This is the first video"); },
    setSpeed(r) {
      this.video.playbackRate = r; this.el.speedBtn.textContent = `${r}×`;
      $$("button", this.el.speedMenu).forEach((b) => b.classList.toggle("active", Number(b.dataset.speed) === r));
      this.el.speedMenu.classList.add("hidden");
    },
    async fullscreen() {
      try {
        if (document.fullscreenElement) return await document.exitFullscreen();
        if (this.stage.requestFullscreen) return await this.stage.requestFullscreen();
        if (this.video.webkitEnterFullscreen) return this.video.webkitEnterFullscreen(); // iOS Safari
        if (this.stage.webkitRequestFullscreen) return this.stage.webkitRequestFullscreen();
      } catch (err) { toast("Fullscreen not available", "error"); }
    },
    async pip() {
      try {
        if (document.pictureInPictureElement) await document.exitPictureInPicture();
        else if (document.pictureInPictureEnabled) await this.video.requestPictureInPicture();
        else if (this.video.webkitSetPresentationMode) this.video.webkitSetPresentationMode(this.video.webkitPresentationMode === "picture-in-picture" ? "inline" : "picture-in-picture");
        else toast("Picture-in-picture not supported", "error");
      } catch (err) { toast("Picture-in-picture failed", "error"); }
    },
    wake() {
      this.stage.classList.remove("idle", "hide-cursor");
      clearTimeout(this.idleTimer);
      if (!this.video.paused) this.idleTimer = setTimeout(() => { if (!this.video.paused && this.el.speedMenu.classList.contains("hidden")) this.stage.classList.add("idle", "hide-cursor"); }, 2600);
    },
    updateProgress() {
      const d = this.video.duration, t = this.video.currentTime;
      const pct = d ? (t / d) * 100 : 0;
      if (!this.seeking) { this.el.seek.value = Math.round(pct * 10); this.el.seek.style.setProperty("--pct", pct + "%"); }
      this.el.cur.textContent = fmtTime(t); if (d) this.el.dur.textContent = fmtTime(d);
      try { const b = this.video.buffered; if (b.length && d) this.el.seek.style.setProperty("--buffered", (b.end(b.length - 1) / d) * 100 + "%"); } catch (_) { /* ignore */ }
    },
    updateVolume() {
      const v = this.video.muted ? 0 : this.video.volume;
      this.el.vol.value = Math.round(v * 100); this.el.vol.style.setProperty("--pct", v * 100 + "%");
      setIcon(this.el.mute.firstElementChild, v === 0 ? "volume-off" : v < 0.5 ? "volume-low" : "volume");
    },
    renderInfo() {
      const it = this.item; if (!it) return;
      const others = this.list.filter((v) => v.id !== it.id).slice(0, 12);
      const key = registerList(others);
      this.el.info.innerHTML = `
        <h2>${esc(it.title)}</h2>
        <div class="meta"><span>${esc(it.ext.toUpperCase())}</span>${it.width ? `<span>${it.width}×${it.height}</span>` : ""}<span>${fmtTime(it.duration)}</span><span>${fmtSize(it.size)}</span><span>${esc(it.path)}</span></div>
        ${others.length ? `<div class="up-next"><h3>More videos</h3><div class="shelf">${others.map((v, i) => videoCard(v, key, i)).join("")}</div></div>` : ""}`;
      hydrateIcons(this.el.info);
    },
  };
  V.video.addEventListener("play", () => { V.stage.classList.add("playing"); setIcon(V.el.play.firstElementChild, "pause"); Player.pause(); V.wake(); if (V.item && !V.recented) { V.recented = true; api("/api/recent", { method: "POST", body: { id: V.item.id } }).catch(() => {}); } document.title = V.item ? V.item.title : document.title; });
  V.video.addEventListener("pause", () => { V.stage.classList.remove("playing"); setIcon(V.el.play.firstElementChild, "play"); V.wake(); });
  V.video.addEventListener("ended", () => { V.stage.classList.remove("playing"); setIcon(V.el.play.firstElementChild, "play"); V.wake(); });
  V.video.addEventListener("timeupdate", () => V.updateProgress());
  V.video.addEventListener("progress", () => V.updateProgress());
  V.video.addEventListener("loadedmetadata", () => V.updateProgress());
  V.video.addEventListener("durationchange", () => V.updateProgress());
  V.video.addEventListener("waiting", () => V.stage.classList.add("buffering"));
  V.video.addEventListener("playing", () => V.stage.classList.remove("buffering"));
  V.video.addEventListener("canplay", () => V.stage.classList.remove("buffering"));
  V.video.addEventListener("volumechange", () => V.updateVolume());
  V.video.addEventListener("error", () => { V.stage.classList.remove("buffering"); if (V.item) toast(`Can't play “${V.item.title}” — this browser may not support ${V.item.ext.toUpperCase()}`, "error"); });
  V.video.addEventListener("click", () => V.toggle());
  V.video.addEventListener("dblclick", () => V.fullscreen());
  $("#video-bigplay").addEventListener("click", () => V.toggle());
  V.stage.addEventListener("mousemove", () => V.wake());
  V.stage.addEventListener("touchstart", () => V.wake(), { passive: true });
  V.el.seek.addEventListener("input", () => { V.seeking = true; const pct = V.el.seek.value / 10; V.el.seek.style.setProperty("--pct", pct + "%"); V.el.cur.textContent = fmtTime((pct / 100) * (V.video.duration || 0)); V.wake(); });
  V.el.seek.addEventListener("change", () => { if (V.video.duration) V.video.currentTime = (V.el.seek.value / 1000) * V.video.duration; V.seeking = false; });
  V.el.vol.addEventListener("input", () => { V.video.volume = V.el.vol.value / 100; V.video.muted = V.el.vol.value === "0"; });
  $$("button", V.el.speedMenu).forEach((b) => b.addEventListener("click", () => V.setSpeed(Number(b.dataset.speed))));
  V.overlay.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-vaction]");
    if (!btn) { if (!e.target.closest(".video-speed")) V.el.speedMenu.classList.add("hidden"); return; }
    e.stopPropagation();
    const a = btn.dataset.vaction;
    if (a === "close") V.close();
    else if (a === "toggle") V.toggle();
    else if (a === "prev") V.step(-1);
    else if (a === "next") V.step(1);
    else if (a === "mute") V.video.muted = !V.video.muted;
    else if (a === "speed") V.el.speedMenu.classList.toggle("hidden");
    else if (a === "pip") V.pip();
    else if (a === "fullscreen") V.fullscreen();
    else if (a === "fav") toggleFavorite(V.item);
  });
  V.updateVolume();

  // ------------------------------------------------------------------ favorites / playlists / recent
  async function loadFavorites() {
    try { const d = await api("/api/favorites"); state.favorites = new Set(d.ids); } catch (_) { /* offline? */ }
  }
  async function toggleFavorite(item) {
    if (!item) return;
    const on = !isFav(item.id);
    if (on) state.favorites.add(item.id); else state.favorites.delete(item.id);
    $$(`[data-fav-id="${item.id}"]`).forEach((b) => b.classList.toggle("on", on));
    try {
      if (on) await api("/api/favorites", { method: "POST", body: { id: item.id } });
      else await api(`/api/favorites/${encodeURIComponent(item.id)}`, { method: "DELETE" });
      toast(on ? `Added “${item.title}” to favorites` : `Removed from favorites`);
      if (parseHash().name === "favorites" && !on) refreshCurrentPage();
    } catch (err) { toast(err.message, "error"); }
  }

  async function loadPlaylists() {
    try { state.playlists = (await api("/api/playlists")).items; } catch (_) { state.playlists = []; }
    renderSidebarPlaylists();
  }
  function renderSidebarPlaylists() {
    const box = $("#sidebar-playlists");
    const cur = parseHash();
    box.innerHTML = state.playlists.length
      ? state.playlists.map((p) => `<a href="#/playlist/${p.id}" data-playlist="${p.id}" class="${cur.name === "playlist" && cur.segs[0] === p.id ? "active" : ""}">${icon("playlist")}<span>${esc(p.name)}</span></a>`).join("")
      : `<div class="empty">No playlists yet</div>`;
  }
  async function createPlaylist(items = []) {
    const name = await promptModal("New playlist", "Name", `My Playlist ${state.playlists.length + 1}`);
    if (!name) return null;
    try {
      const p = await api("/api/playlists", { method: "POST", body: { name, items: items.map((i) => i.id) } });
      await loadPlaylists();
      toast(items.length ? `Created “${p.name}” with ${items.length} song${items.length === 1 ? "" : "s"}` : `Created “${p.name}”`);
      if (parseHash().name === "playlists") refreshCurrentPage();
      return p;
    } catch (err) { toast(err.message, "error"); return null; }
  }
  async function addToPlaylistFlow(items) {
    const songs = items.filter((i) => i.type !== "video");
    if (!songs.length) return toast("Only songs can be added to playlists", "error");
    const choice = await pickPlaylistModal(songs);
    if (choice === "__new__") return createPlaylist(songs);
    if (!choice) return;
    try {
      const p = await api(`/api/playlists/${choice}/items`, { method: "POST", body: { ids: songs.map((i) => i.id) } });
      await loadPlaylists();
      toast(`Added to “${p.name}”`);
      const r = parseHash(); if (r.name === "playlist" && r.segs[0] === choice) refreshCurrentPage();
    } catch (err) { toast(err.message, "error"); }
  }

  // ------------------------------------------------------------------ modals
  function openModal(html) {
    const root = $("#modal-root");
    root.innerHTML = `<div class="modal">${html}</div>`;
    root.classList.remove("hidden");
    hydrateIcons(root);
    return root;
  }
  function closeModal() { const root = $("#modal-root"); root.classList.add("hidden"); root.innerHTML = ""; }
  function promptModal(title, label, value = "") {
    return new Promise((resolve) => {
      const root = openModal(`
        <div class="modal-head"><h3>${esc(title)}</h3><button class="icon-btn" data-modal="cancel" aria-label="Close">${icon("close")}</button></div>
        <form class="modal-body" id="modal-form"><input class="field" id="modal-input" value="${esc(value)}" placeholder="${esc(label)}" maxlength="120" autocomplete="off"></form>
        <div class="modal-foot"><button class="btn ghost" data-modal="cancel">Cancel</button><button class="btn primary" data-modal="ok">Save</button></div>`);
      const input = $("#modal-input", root);
      setTimeout(() => { input.focus(); input.select(); }, 30);
      const done = (v) => { closeModal(); resolve(v); };
      $("#modal-form", root).addEventListener("submit", (e) => { e.preventDefault(); done(input.value.trim()); });
      root.onclick = (e) => {
        const b = e.target.closest("[data-modal]");
        if (b?.dataset.modal === "ok") done(input.value.trim());
        else if (b?.dataset.modal === "cancel" || e.target === root) done(null);
      };
    });
  }
  function confirmModal(title, text, okLabel = "Delete") {
    return new Promise((resolve) => {
      const root = openModal(`
        <div class="modal-head"><h3>${esc(title)}</h3><button class="icon-btn" data-modal="cancel" aria-label="Close">${icon("close")}</button></div>
        <div class="modal-body"><p>${text}</p></div>
        <div class="modal-foot"><button class="btn ghost" data-modal="cancel">Cancel</button><button class="btn primary" style="background:var(--danger)" data-modal="ok">${esc(okLabel)}</button></div>`);
      const done = (v) => { closeModal(); resolve(v); };
      root.onclick = (e) => {
        const b = e.target.closest("[data-modal]");
        if (b?.dataset.modal === "ok") done(true);
        else if (b?.dataset.modal === "cancel" || e.target === root) done(false);
      };
    });
  }
  function pickPlaylistModal(songs) {
    return new Promise((resolve) => {
      const root = openModal(`
        <div class="modal-head"><h3>Add to playlist</h3><button class="icon-btn" data-modal="cancel" aria-label="Close">${icon("close")}</button></div>
        <div class="modal-body">
          <p>${songs.length === 1 ? `“${esc(songs[0].title)}”` : `${songs.length} songs`}</p>
          <div class="pick-list">
            <button data-pick="__new__"><span class="pl-art">${icon("plus")}</span><div><b>New playlist</b><span>Create and add</span></div></button>
            ${state.playlists.map((p) => `<button data-pick="${p.id}"><span class="pl-art">${p.art_url ? `<img src="${esc(p.art_url)}" alt="">` : icon("playlist")}</span><div><b>${esc(p.name)}</b><span>${p.count} song${p.count === 1 ? "" : "s"}</span></div></button>`).join("")}
          </div>
        </div>
        <div class="modal-foot"><button class="btn ghost" data-modal="cancel">Cancel</button></div>`);
      const done = (v) => { closeModal(); resolve(v); };
      root.onclick = (e) => {
        const p = e.target.closest("[data-pick]");
        if (p) return done(p.dataset.pick);
        if (e.target.closest("[data-modal]") || e.target === root) done(null);
      };
    });
  }

  // ------------------------------------------------------------------ context menu
  function openContextMenu(anchor, items, opts = {}) {
    const menu = $("#context-menu"), backdrop = $("#context-backdrop");
    const it = items[0];
    const many = items.length > 1;
    const isVideo = it.type === "video";
    const entries = [];
    if (isVideo) entries.push({ a: "cm-open-video", i: "play", t: "Play video" });
    else {
      entries.push({ a: "cm-play", i: "play", t: many ? "Play all" : "Play" });
      entries.push({ a: "cm-play-next", i: "play-next", t: "Play next" });
      entries.push({ a: "cm-queue", i: "queue", t: "Add to queue" });
      entries.push({ a: "cm-playlist", i: "plus", t: "Add to playlist" });
    }
    entries.push({ a: "cm-fav", i: "heart", t: isFav(it.id) ? "Remove from favorites" : "Add to favorites" });
    if (!isVideo && !many) {
      entries.push({ hr: true });
      entries.push({ a: "cm-artist", i: "user", t: `Go to artist` });
      if (it.album) entries.push({ a: "cm-album", i: "disc", t: `Go to album` });
    }
    if (opts.playlistId) { entries.push({ hr: true }); entries.push({ a: "cm-remove-playlist", i: "trash", t: "Remove from this playlist", cls: "danger" }); }
    menu.innerHTML = `<div class="cm-head"><b>${esc(many ? `${items.length} songs` : it.title)}</b><span>${esc(many ? "" : isVideo ? `${it.ext.toUpperCase()} · ${fmtTime(it.duration)}` : artistOf(it))}</span></div>` +
      entries.map((e) => e.hr ? "<hr>" : `<button data-cm="${e.a}" class="${e.cls || ""}">${icon(e.i)}<span>${esc(e.t)}</span></button>`).join("");
    menu.classList.remove("hidden"); backdrop.classList.remove("hidden");
    // position (desktop) — CSS overrides to a bottom sheet on phones
    const r = anchor.getBoundingClientRect();
    const mw = menu.offsetWidth, mh = menu.offsetHeight;
    let x = r.right - mw, y = r.bottom + 6;
    if (x < 8) x = 8; if (x + mw > innerWidth - 8) x = innerWidth - mw - 8;
    if (y + mh > innerHeight - 8) y = Math.max(8, r.top - mh - 6);
    menu.style.left = x + "px"; menu.style.top = y + "px";

    const close = () => { menu.classList.add("hidden"); backdrop.classList.add("hidden"); menu.onclick = null; backdrop.onclick = null; };
    backdrop.onclick = close;
    menu.onclick = async (e) => {
      const b = e.target.closest("[data-cm]"); if (!b) return;
      const a = b.dataset.cm; close();
      if (a === "cm-play") Player.playList(items, 0);
      else if (a === "cm-open-video") V.open(it, opts.list);
      else if (a === "cm-play-next") Player.playNext(items);
      else if (a === "cm-queue") Player.addToQueue(items);
      else if (a === "cm-playlist") addToPlaylistFlow(items);
      else if (a === "cm-fav") toggleFavorite(it);
      else if (a === "cm-artist") location.hash = routeArtist(artistOf(it));
      else if (a === "cm-album") location.hash = routeAlbum(it.album, it.album_artist || it.artist);
      else if (a === "cm-remove-playlist") {
        try { await api(`/api/playlists/${opts.playlistId}/items/${encodeURIComponent(it.id)}`, { method: "DELETE" }); toast("Removed from playlist"); await loadPlaylists(); refreshCurrentPage(); }
        catch (err) { toast(err.message, "error"); }
      }
    };
  }

  // ------------------------------------------------------------------ status / scan
  async function loadStatus() {
    try {
      state.status = await api("/api/status");
      const s = state.status;
      $("#lan-info").innerHTML = s.lan_ip
        ? `<strong>On this network</strong><br><code>http://${esc(s.lan_ip)}:${s.port}</code><br><span>${s.music} songs · ${s.videos} videos</span>`
        : `<span>${s.music} songs · ${s.videos} videos</span>`;
    } catch (_) { /* ignore */ }
  }
  let scanning = false;
  async function rescan() {
    if (scanning) return;
    scanning = true;
    $$('[data-action="rescan"] [data-icon]').forEach((i) => i.classList.add("spin"));
    toast("Scanning library…");
    try {
      const r = await api("/api/scan", { method: "POST" });
      if (r.status === "already_scanning") toast("Scan already in progress");
      else toast(`Library updated: ${r.music} songs, ${r.videos} videos${r.errors ? ` (${r.errors} skipped)` : ""}`);
      await Promise.all([loadStatus(), loadFavorites(), loadPlaylists()]);
      refreshCurrentPage();
    } catch (err) { toast(`Scan failed: ${err.message}`, "error"); }
    finally { scanning = false; $$('[data-action="rescan"] [data-icon]').forEach((i) => i.classList.remove("spin")); }
  }

  // ------------------------------------------------------------------ load more (pagination)
  async function loadMore(btn) {
    const { kind, offset, sort, q, total } = btn.dataset;
    btn.disabled = true; btn.textContent = "Loading…";
    try {
      const data = await api(`/api/${kind === "music" ? "music" : "videos"}?limit=${PAGE}&offset=${offset}&sort=${encodeURIComponent(sort)}${q ? `&q=${encodeURIComponent(q)}` : ""}`);
      if (kind === "music") {
        const box = $("#music-list"); const key = box.dataset.key; const list = state.lists[key];
        const base = list.length; list.push(...data.items);
        const currentId = Player.current()?.id;
        const tl = box.querySelector(".track-list");
        const html = data.items.map((it, k) => {
          const i = base + k;
          const hasArt = it.art_url;
          return `<div class="track ${it.id === currentId ? "playing" : ""}" data-action="play-list" data-list="${key}" data-index="${i}" data-id="${it.id}" role="button" tabindex="0">
            <div class="track-index ${hasArt ? "has-art" : ""}">${hasArt ? `<img src="${esc(it.art_url)}" alt="" loading="lazy">` : ""}<span class="track-num">${i + 1}</span><span class="track-play">${icon("play")}</span></div>
            <div class="track-main"><div class="track-title">${esc(it.title)}</div><div class="track-sub"><a href="${routeArtist(artistOf(it))}" data-stop>${esc(artistOf(it))}</a> · <span class="ext">${esc(it.ext.toUpperCase())}</span></div></div>
            <div class="track-album">${it.album ? `<a href="${routeAlbum(it.album, it.album_artist || it.artist)}" data-stop>${esc(it.album)}</a>` : ""}</div>
            <div class="track-duration">${fmtTime(it.duration)}</div>
            <div class="track-actions">${favBtn(it, "small")}<button class="icon-btn small" data-action="menu" data-list="${key}" data-index="${i}" aria-label="More">${icon("more")}</button></div>
          </div>`;
        }).join("");
        tl.insertAdjacentHTML("beforeend", html);
      } else {
        const grid = $("#video-grid"); const key = grid.dataset.key; const list = state.lists[key];
        const base = list.length; list.push(...data.items);
        grid.insertAdjacentHTML("beforeend", data.items.map((it, k) => videoCard(it, key, base + k)).join(""));
      }
      const shown = Number(offset) + data.items.length;
      const count = $(".toolbar .count"); if (count) count.textContent = `Showing ${shown} of ${total}`;
      if (shown >= Number(total)) btn.closest(".load-more").remove();
      else { btn.dataset.offset = shown; btn.disabled = false; btn.textContent = "Load more"; }
      hydrateIcons(main);
    } catch (err) { toast(err.message, "error"); btn.disabled = false; btn.textContent = "Load more"; }
  }

  // ------------------------------------------------------------------ global event delegation
  document.addEventListener("click", async (e) => {
    // links inside rows should navigate without triggering the row action
    const stopLink = e.target.closest("a[data-stop]");
    if (stopLink) { e.stopPropagation(); return; }
    const actEl = e.target.closest("[data-action]");
    if (!actEl) return;
    const action = actEl.dataset.action;
    const listOf = () => state.lists[actEl.dataset.list] || [];
    const idx = Number(actEl.dataset.index || 0);

    switch (action) {
      case "play-list": {
        e.preventDefault();
        const items = listOf(); if (!items.length) return;
        const target = items[idx];
        if (target?.type === "video") return V.open(target, items);
        if (target && Player.current()?.id === target.id && actEl.classList.contains("track")) return Player.toggle();
        Player.playList(items, idx);
        break;
      }
      case "shuffle-list": Player.playList(listOf(), Math.floor(Math.random() * Math.max(1, listOf().length)), { shuffle: true }); break;
      case "queue-list": Player.addToQueue(listOf()); break;
      case "open-video": { e.preventDefault(); const items = listOf(); if (items[idx]) V.open(items[idx], items); break; }
      case "play-all": case "shuffle-all": {
        actEl.disabled = true;
        try { const d = await api(`/api/${actEl.dataset.src}?limit=500`); Player.playList(d.items, action === "shuffle-all" ? Math.floor(Math.random() * d.items.length) : 0, { shuffle: action === "shuffle-all" }); }
        catch (err) { toast(err.message, "error"); } finally { actEl.disabled = false; }
        break;
      }
      case "play-playlist": {
        e.preventDefault(); e.stopPropagation();
        try { const p = await api(`/api/playlists/${actEl.dataset.playlist}`); Player.playList(p.items, 0); } catch (err) { toast(err.message, "error"); }
        break;
      }
      case "menu": {
        e.preventDefault(); e.stopPropagation();
        const items = listOf(); const it = items[idx]; if (!it) return;
        openContextMenu(actEl, [it], { playlistId: actEl.dataset.playlist, list: items });
        break;
      }
      case "fav": {
        e.preventDefault(); e.stopPropagation();
        const id = actEl.dataset.id;
        let it = Object.values(state.lists).flat().find((i) => i.id === id) || Player.queue.find((i) => i.id === id) || (V.item?.id === id ? V.item : null);
        if (!it) { try { it = await api(`/api/items/${id}`); } catch (_) { return; } }
        toggleFavorite(it);
        break;
      }
      case "toggle-fav-current": toggleFavorite(Player.current()); break;
      case "toggle-play": e.stopPropagation(); Player.toggle(); break;
      case "next": e.stopPropagation(); Player.next(); break;
      case "prev": Player.prev(); break;
      case "shuffle": Player.toggleShuffle(); break;
      case "repeat": Player.cycleRepeat(); break;
      case "mute": Player.toggleMute(); break;
      case "toggle-eq": e.stopPropagation(); EQ.toggle(); break;
      case "toggle-queue": $("#app").classList.toggle("queue-open"); if ($("#app").classList.contains("queue-open")) els.player.classList.remove("expanded"); break;
      case "clear-queue": Player.clear(); break;
      case "save-queue": if (Player.queue.length) createPlaylist(Player.queue); else toast("Queue is empty"); break;
      case "queue-jump": Player.jumpTo(Number(actEl.dataset.qindex)); break;
      case "queue-remove": e.stopPropagation(); Player.removeAt(Number(actEl.dataset.qindex)); break;
      case "queue-up": e.stopPropagation(); { const i = Number(actEl.dataset.qindex); Player.move(i, i - 1); } break;
      case "queue-down": e.stopPropagation(); { const i = Number(actEl.dataset.qindex); Player.move(i, i + 1); } break;
      case "collapse-player": els.player.classList.remove("expanded"); break;
      case "rescan": rescan(); break;
      case "back": history.length > 1 ? history.back() : (location.hash = "#/home"); break;
      case "new-playlist": e.preventDefault(); createPlaylist(); break;
      case "rename-playlist": {
        const name = await promptModal("Rename playlist", "Name", actEl.dataset.name);
        if (!name || name === actEl.dataset.name) return;
        try { await api(`/api/playlists/${actEl.dataset.playlist}`, { method: "PUT", body: { name } }); await loadPlaylists(); refreshCurrentPage(); toast("Playlist renamed"); } catch (err) { toast(err.message, "error"); }
        break;
      }
      case "delete-playlist": {
        if (!(await confirmModal("Delete playlist?", `“${esc(actEl.dataset.name)}” will be permanently deleted. Your media files are not affected.`))) return;
        try { await api(`/api/playlists/${actEl.dataset.playlist}`, { method: "DELETE" }); await loadPlaylists(); location.hash = "#/playlists"; toast("Playlist deleted"); } catch (err) { toast(err.message, "error"); }
        break;
      }
      case "clear-recent": {
        if (!(await confirmModal("Clear history?", "This removes your recently played list.", "Clear"))) return;
        try { await api("/api/recent", { method: "DELETE" }); refreshCurrentPage(); } catch (err) { toast(err.message, "error"); }
        break;
      }
      case "load-more": loadMore(actEl); break;
      default: break;
    }
  });

  // keyboard: Enter/Space on focused rows
  document.addEventListener("keydown", (e) => {
    const tag = document.activeElement?.tagName;
    const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
    if (e.key === "Escape") {
      if (!$("#modal-root").classList.contains("hidden")) return closeModal();
      if (!$("#context-menu").classList.contains("hidden")) return $("#context-backdrop").click();
      if (EQ.isOpen()) return EQ.close();
      if (V.isOpen()) return V.close();
      if (els.player.classList.contains("expanded")) return els.player.classList.remove("expanded");
      if ($("#app").classList.contains("sidebar-open")) return $("#app").classList.remove("sidebar-open");
      if ($("#app").classList.contains("queue-open")) return $("#app").classList.remove("queue-open");
      return;
    }
    if ((e.key === "Enter" || e.key === " ") && document.activeElement?.matches(".track, .card[role=button]")) { e.preventDefault(); document.activeElement.click(); return; }
    if (typing) return;
    if (V.isOpen()) {
      if (e.key === " " || e.key === "k") { e.preventDefault(); V.toggle(); }
      else if (e.key === "ArrowRight") V.video.currentTime = Math.min(V.video.duration || 0, V.video.currentTime + 10);
      else if (e.key === "ArrowLeft") V.video.currentTime = Math.max(0, V.video.currentTime - 10);
      else if (e.key === "ArrowUp") { e.preventDefault(); V.video.volume = Math.min(1, V.video.volume + 0.1); }
      else if (e.key === "ArrowDown") { e.preventDefault(); V.video.volume = Math.max(0, V.video.volume - 0.1); }
      else if (e.key === "f") V.fullscreen();
      else if (e.key === "m") V.video.muted = !V.video.muted;
      else if (e.key === "p") V.pip();
      return;
    }
    if (e.key === " ") { e.preventDefault(); Player.toggle(); }
    else if (e.key === "ArrowRight" && e.shiftKey) Player.next();
    else if (e.key === "ArrowLeft" && e.shiftKey) Player.prev();
    else if (e.key === "ArrowRight") audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 5);
    else if (e.key === "ArrowLeft") audio.currentTime = Math.max(0, audio.currentTime - 5);
    else if (e.key === "m") Player.toggleMute();
    else if (e.key === "/" ) { e.preventDefault(); $("#search-input").focus(); }
  });

  // sidebar drawer (mobile)
  $("#menu-btn").addEventListener("click", () => $("#app").classList.toggle("sidebar-open"));
  $("#sidebar-backdrop").addEventListener("click", () => $("#app").classList.remove("sidebar-open"));

  // expand player on mobile when tapping now-playing info
  $("#player-now").addEventListener("click", (e) => {
    if (e.target.closest("a, button")) return;
    if (matchMedia("(max-width: 860px)").matches && Player.current()) els.player.classList.toggle("expanded");
  });

  // search
  const searchInput = $("#search-input");
  const goSearch = debounce(() => {
    const q = searchInput.value.trim();
    $("#search-clear").classList.toggle("hidden", !q);
    const target = q ? `#/search?q=${encodeURIComponent(q)}` : "#/home";
    if (parseHash().name === "search") history.replaceState(null, "", target), navigate();
    else if (q) location.hash = target;
  }, 250);
  searchInput.addEventListener("input", goSearch);
  $("#search-form").addEventListener("submit", (e) => { e.preventDefault(); goSearch(); searchInput.blur(); });
  $("#search-clear").addEventListener("click", () => { searchInput.value = ""; $("#search-clear").classList.add("hidden"); if (parseHash().name === "search") location.hash = "#/home"; searchInput.focus(); });

  // filters on music / videos pages
  main.addEventListener("input", debounce((e) => {
    if (e.target.id === "music-filter") location.hash = `#/music?sort=${encodeURIComponent(e.target.dataset.sort)}&q=${encodeURIComponent(e.target.value.trim())}`;
    if (e.target.id === "video-filter") location.hash = `#/videos?sort=${encodeURIComponent(e.target.dataset.sort)}&q=${encodeURIComponent(e.target.value.trim())}`;
  }, 300));
  main.addEventListener("change", (e) => {
    if (e.target.id === "music-sort") location.hash = `#/music?sort=${encodeURIComponent(e.target.value)}${e.target.dataset.q ? `&q=${encodeURIComponent(e.target.dataset.q)}` : ""}`;
    if (e.target.id === "video-sort") location.hash = `#/videos?sort=${encodeURIComponent(e.target.value)}${e.target.dataset.q ? `&q=${encodeURIComponent(e.target.dataset.q)}` : ""}`;
  });
  // keep focus in the filter box after the page re-renders
  const refocusFilter = () => { const r = parseHash(); if ((r.name === "music" || r.name === "videos") && r.query.q !== undefined) { const f = $("#music-filter, #video-filter"); if (f && document.activeElement === document.body) { f.focus(); f.setSelectionRange(f.value.length, f.value.length); } } };
  const observer = new MutationObserver(() => refocusFilter());
  observer.observe(main, { childList: true });

  window.addEventListener("hashchange", navigate);
  window.addEventListener("beforeunload", () => Player._saveNow());
  document.addEventListener("visibilitychange", () => { if (document.hidden) Player._saveNow(); });

  // ------------------------------------------------------------------ init
  (async function init() {
    hydrateIcons(document);
    // Must be set before any src is assigned so the media element is usable as a Web Audio source.
    audio.crossOrigin = "anonymous";
    EQ.init();
    window.lmsDebug = { EQ, Player, audio }; // console handle for troubleshooting (read-only usage)
    Player.restore();
    await Promise.all([loadStatus(), loadFavorites(), loadPlaylists()]);
    Player.updateNowPlaying();
    navigate();
  })();
})();
