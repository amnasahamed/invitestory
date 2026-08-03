/**
 * InviteStory — YouTube background music (audio only, no visible video).
 *
 * Configure per invite by editing music.json next to index.html:
 *   { "youtube": "https://www.youtube.com/watch?v=VIDEO_ID" }
 *
 * Leave "youtube" empty to hide the control.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "invitestory-music-muted";

  function isTinyGalleryPreview() {
    try {
      if (window.self === window.top) return false;
      var fe = window.frameElement;
      if (!fe) return false;
      return fe.clientHeight < 480;
    } catch (e) {
      return true;
    }
  }

  function extractVideoId(input) {
    if (!input || typeof input !== "string") return "";
    var s = input.trim();
    if (/^[\w-]{11}$/.test(s)) return s;
    var patterns = [
      /(?:youtube\.com\/watch\?[^#]*v=|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtu\.be\/)([\w-]{11})/,
      /[?&]v=([\w-]{11})/,
    ];
    for (var i = 0; i < patterns.length; i++) {
      var m = s.match(patterns[i]);
      if (m) return m[1];
    }
    return "";
  }

  function loadConfig() {
    var inline = window.__INVITESTORY_MUSIC__;
    if (inline && inline.youtube) {
      return Promise.resolve({ youtube: String(inline.youtube) });
    }
    var url = new URL("music.json", document.baseURI || window.location.href);
    return fetch(url.href, { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) return { youtube: "" };
        return r.json();
      })
      .catch(function () {
        return { youtube: "" };
      });
  }

  function injectStyles() {
    if (document.getElementById("is-yt-music-style")) return;
    var css = document.createElement("style");
    css.id = "is-yt-music-style";
    css.textContent =
      "#is-yt-music{position:fixed;left:max(12px,env(safe-area-inset-left));bottom:max(12px,env(safe-area-inset-bottom));z-index:2147483000;display:flex;gap:8px;align-items:center;font-family:system-ui,-apple-system,sans-serif}" +
      "#is-yt-music button{appearance:none;border:0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:0 16px;border-radius:999px;background:rgba(14,20,16,.88);color:#ede8df;font-size:12px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;box-shadow:0 10px 28px rgba(0,0,0,.28);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);transition:transform .15s ease,background .15s ease}" +
      "#is-yt-music button:active{transform:scale(.97)}" +
      "#is-yt-music button[aria-pressed='true']{background:#3d7a5f}" +
      "#is-yt-music .is-yt-icon{width:18px;height:18px;flex-shrink:0}" +
      "#is-yt-host{position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;left:-9999px;bottom:0;overflow:hidden}" +
      "@media (prefers-reduced-motion:reduce){#is-yt-music button{transition:none}}";
    document.head.appendChild(css);
  }

  function iconPlay() {
    return '<svg class="is-yt-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7L8 5z"/></svg>';
  }
  function iconPause() {
    return '<svg class="is-yt-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z"/></svg>';
  }
  function iconMute() {
    return '<svg class="is-yt-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.5 12c0-1.8-1-3.3-2.5-4.1v2.3l2.4 2.4c.1-.2.1-.4.1-.6zm3.5 0c0 .9-.2 1.8-.5 2.6l1.5 1.5c.7-1.2 1-2.6 1-4.1 0-3.2-1.8-6-4.5-7.3v2.1c1.8 1.1 3 3 3 5.2zM4.3 3 3 4.3 7.7 9H4v6h3l5 4v-5.7l5.7 5.7 1.3-1.3L4.3 3zM12 5l-1.9 1.9L12 8.8V5z"/></svg>';
  }
  function iconUnmute() {
    return '<svg class="is-yt-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8.1v7.8a4.5 4.5 0 0 0 2.5-3.9zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>';
  }

  function boot(videoId) {
    if (!videoId || isTinyGalleryPreview()) return;

    injectStyles();

    var host = document.createElement("div");
    host.id = "is-yt-host";
    var playerEl = document.createElement("div");
    playerEl.id = "is-yt-player";
    host.appendChild(playerEl);
    document.body.appendChild(host);

    var ui = document.createElement("div");
    ui.id = "is-yt-music";
    ui.setAttribute("role", "group");
    ui.setAttribute("aria-label", "Background music");

    var playBtn = document.createElement("button");
    playBtn.type = "button";
    playBtn.setAttribute("aria-pressed", "false");
    playBtn.innerHTML = iconPlay() + "<span>Play music</span>";

    var muteBtn = document.createElement("button");
    muteBtn.type = "button";
    muteBtn.hidden = true;
    muteBtn.setAttribute("aria-pressed", "false");
    muteBtn.innerHTML = iconMute() + "<span>Mute</span>";

    ui.appendChild(playBtn);
    ui.appendChild(muteBtn);
    document.body.appendChild(ui);

    var player = null;
    var started = false;
    var muted = false;
    try {
      muted = localStorage.getItem(STORAGE_KEY) === "1";
    } catch (e) {}

    function syncUi() {
      if (!started) {
        playBtn.innerHTML = iconPlay() + "<span>Play music</span>";
        playBtn.setAttribute("aria-pressed", "false");
        muteBtn.hidden = true;
        return;
      }
      playBtn.innerHTML = iconPause() + "<span>Pause</span>";
      playBtn.setAttribute("aria-pressed", "true");
      muteBtn.hidden = false;
      if (muted) {
        muteBtn.innerHTML = iconUnmute() + "<span>Unmute</span>";
        muteBtn.setAttribute("aria-pressed", "true");
      } else {
        muteBtn.innerHTML = iconMute() + "<span>Mute</span>";
        muteBtn.setAttribute("aria-pressed", "false");
      }
    }

    function ensureApi(cb) {
      if (window.YT && window.YT.Player) {
        cb();
        return;
      }
      var prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function () {
        if (typeof prev === "function") prev();
        cb();
      };
      if (!document.getElementById("is-yt-api")) {
        var tag = document.createElement("script");
        tag.id = "is-yt-api";
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
    }

    function createPlayer(thenPlay) {
      ensureApi(function () {
        if (player) {
          if (thenPlay) player.playVideo();
          return;
        }
        player = new window.YT.Player("is-yt-player", {
          width: 1,
          height: 1,
          videoId: videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            loop: 1,
            playlist: videoId,
            origin: window.location.origin,
          },
          events: {
            onReady: function (ev) {
              if (muted) ev.target.mute();
              else ev.target.unMute();
              if (thenPlay) {
                ev.target.playVideo();
                started = true;
                syncUi();
              }
            },
            onStateChange: function (ev) {
              // 0 = ended — loop usually handles; 2 = paused
              if (ev.data === 2) {
                started = false;
                syncUi();
              }
              if (ev.data === 1) {
                started = true;
                syncUi();
              }
            },
          },
        });
      });
    }

    playBtn.addEventListener("click", function () {
      if (!started) {
        createPlayer(true);
        return;
      }
      if (player && player.pauseVideo) {
        player.pauseVideo();
        started = false;
        syncUi();
      }
    });

    muteBtn.addEventListener("click", function () {
      if (!player) return;
      muted = !muted;
      try {
        localStorage.setItem(STORAGE_KEY, muted ? "1" : "0");
      } catch (e) {}
      if (muted) player.mute();
      else player.unMute();
      syncUi();
    });

    syncUi();
  }

  function start() {
    loadConfig().then(function (cfg) {
      var id = extractVideoId(cfg && cfg.youtube);
      if (!id) return;
      boot(id);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
