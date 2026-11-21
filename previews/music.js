/* Tap-to-open music for sample invitations that do not bring their own soundtrack.
 * Usage: <script src="/previews/music.js?v=1" data-pool="festive|nikah|romantic" defer></script>
 * The first tap on the invitation starts a 30-second highlight; clips then play in
 * rotation, and each new invitation (or visit) starts on the next song in the pool. */
(() => {
  'use strict';
  const script = document.currentScript;
  // [file, song, film, tags]. Files are level-matched without re-encoding (mp3gain).
  const TRACKS = [
    ['aaja-nachle', 'Aaja Nachle', 'Aaja Nachle', 'festive'],
    ['are-re-are', 'Are Re Are', 'Dil To Pagal Hai', 'romantic'],
    ['bole-chudiyan', 'Bole Chudiyan', 'Kabhi Khushi Kabhie Gham', 'festive'],
    ['chalte-chalte', 'Chalte Chalte', 'Mohabbatein', 'romantic'],
    ['chammak-challo', 'Chammak Challo', 'Ra.One', 'festive'],
    ['chand-sifarish', 'Chand Sifarish', 'Fanaa', 'romantic'],
    ['chhote-chhote-bhaiyon', 'Chhote Chhote Bhaiyon Ke Bade Bhaiyya', 'Hum Saath-Saath Hain', 'festive devotional'],
    ['d-se-dance', 'D Se Dance', 'Humpty Sharma Ki Dulhania', 'festive'],
    ['deewani-mastani', 'Deewani Mastani', 'Bajirao Mastani', 'festive'],
    ['didi-tera-devar-deewana', 'Didi Tera Devar Deewana', 'Hum Aapke Hain Koun', 'festive'],
    ['dil-laga-liya', 'Dil Laga Liya', 'Dil Hai Tumhaara', 'romantic'],
    ['gerua', 'Gerua', 'Dilwale', 'romantic'],
    ['har-dil-jo-pyaar-karega', 'Har Dil Jo Pyaar Karega', 'Har Dil Jo Pyaar Karega', 'romantic'],
    ['janam-janam', 'Janam Janam', 'Dilwale', 'romantic'],
    ['jeena-jeena', 'Jeena Jeena', 'Badlapur', 'romantic'],
    ['ladki-badi-anjani-hai', 'Ladki Badi Anjani Hai', 'Kuch Kuch Hota Hai', 'romantic'],
    ['lal-dupatta', 'Lal Dupatta', 'Mujhse Shaadi Karogi', 'festive'],
    ['maahi-ve', 'Maahi Ve', 'Kal Ho Naa Ho', 'festive'],
    ['main-rang-sharbaton-ka', 'Main Rang Sharbaton Ka', 'Phata Poster Nikhla Hero', 'romantic'],
    ['maiyya-yashoda', 'Maiyya Yashoda', 'Hum Saath-Saath Hain', 'festive devotional'],
    ['manwa-laage', 'Manwa Laage', 'Happy New Year', 'romantic'],
    ['mehndi-laga-ke-rakhna', 'Mehndi Laga Ke Rakhna', 'Dilwale Dulhania Le Jayenge', 'festive'],
    ['mera-yaar-dildar', 'Mera Yaar Dildar Bada Sona', 'Jaanwar', 'festive'],
    ['mere-khwabon-mein', 'Mere Khwabon Mein', 'Dilwale Dulhania Le Jayenge', 'romantic'],
    ['pee-loon', 'Pee Loon', 'Once Upon a Time in Mumbaai', 'romantic'],
    ['pinga', 'Pinga', 'Bajirao Mastani', 'festive'],
    ['piya-o-re-piya', 'Piya O Re Piya', 'Tere Naal Love Ho Gaya', 'romantic'],
    ['prem-ratan-dhan-payo', 'Prem Ratan Dhan Payo', 'Prem Ratan Dhan Payo', 'festive devotional'],
    ['pretty-woman', 'Pretty Woman', 'Kal Ho Naa Ho', 'festive'],
    ['saajanji-ghar-aaye', 'Saajanji Ghar Aaye', 'Kuch Kuch Hota Hai', 'festive'],
    ['saans', 'Saans', 'Jab Tak Hai Jaan', 'romantic'],
    ['sajan-tumse-pyar', 'Sajan Tumse Pyar', 'Maine Pyaar Kyun Kiya', 'romantic'],
    ['samjhawan-unplugged', 'Samjhawan (Unplugged)', 'Humpty Sharma Ki Dulhania', 'romantic'],
    ['suraj-hua-maddham', 'Suraj Hua Maddham', 'Kabhi Khushi Kabhie Gham', 'romantic'],
    ['tenu-leke', 'Tenu Leke', 'Salaam-e-Ishq', 'festive'],
    ['tere-bina', 'Tere Bina', 'Guru', 'romantic'],
    ['tere-sang-yaara', 'Tere Sang Yaara', 'Rustom', 'romantic'],
    ['wah-wah-ramji', 'Wah Wah Ramji', 'Hum Aapke Hain Koun', 'festive devotional'],
    ['yeh-ladka-hai-allah', 'Yeh Ladka Hai Allah', 'Kabhi Khushi Kabhie Gham', 'festive'],
    ['zaalima', 'Zaalima', 'Raees', 'romantic'],
    ['zara-sa-jhoom-loon-main', 'Zara Sa Jhoom Loon Main', 'Dilwale Dulhania Le Jayenge', 'festive']
  ];
  const POOLS = {
    // Hindu and pan-Indian celebrations: every song.
    festive: () => TRACKS,
    // Nikah and Walima: no Hindu devotional songs.
    nikah: () => TRACKS.filter(t => !t[3].includes('devotional')),
    // Church, engagement and quieter designs: romantic songs only.
    romantic: () => TRACKS.filter(t => t[3].includes('romantic'))
  };
  // A fixed shuffle, so neighbouring songs in the rotation differ in mood and era.
  const shuffled = list => list.map((t, i) => [((i + 1) * 2654435761) % 4294967296, t]).sort((a, b) => a[0] - b[0]).map(p => p[1]);
  const pool = shuffled((POOLS[script?.dataset.pool] || POOLS.festive)());
  const base = new URL('_music/', script?.src || location.origin + '/previews/music.js');
  const store = (area, k, v) => { try { return v === undefined ? window[area].getItem(k) : window[area].setItem(k, v); } catch { return null; } };
  const OFF = 'invitestory.music.off', NEXT = 'invitestory.music.next';
  if (navigator.connection?.saveData) return;

  // Each design opens on its own song; the visitor's cursor moves the rotation on every visit.
  const designOffset = Array.from(location.pathname).reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % pool.length;
  let index = (Number(store('localStorage', NEXT)) || 0) + designOffset;
  const audio = new Audio();
  audio.preload = 'none';
  audio.volume = 0;
  let started = false, wanted = store('sessionStorage', OFF) !== '1', fadeTimer = 0, button;

  function fade(to, ms, done) {
    clearInterval(fadeTimer);
    const from = audio.volume, steps = Math.max(1, Math.round(ms / 50));
    let n = 0;
    fadeTimer = setInterval(() => {
      n += 1;
      audio.volume = Math.min(1, Math.max(0, from + (to - from) * (n / steps)));
      if (n >= steps) { clearInterval(fadeTimer); done?.(); }
    }, 50);
  }
  function load(i) {
    const track = pool[((i % pool.length) + pool.length) % pool.length];
    audio.src = new URL(track[0] + '.mp3', base).href;
    audio.dataset.song = `${track[1]} · ${track[2]}`;
    if (button) button.title = `${track[1]} (${track[2]})`;
  }
  function play() {
    const attempt = audio.play();
    fade(0.9, 1200);
    return attempt;
  }
  // Each clip fades out at the end and hands over to the next song in the rotation.
  audio.addEventListener('timeupdate', () => {
    if (audio.duration && audio.duration - audio.currentTime < 1.6 && !audio.dataset.ending) {
      audio.dataset.ending = '1';
      fade(0, 1400);
    }
  });
  audio.addEventListener('ended', () => {
    delete audio.dataset.ending;
    index += 1;
    load(index);
    if (wanted && !document.hidden) play()?.catch(() => {});
  });

  function render() {
    if (!button) return;
    const on = wanted && !audio.paused;
    button.setAttribute('aria-pressed', String(on));
    button.setAttribute('aria-label', on ? 'Pause music' : 'Play music');
    button.classList.toggle('is-playing', on);
  }
  function addButton() {
    const style = document.createElement('style');
    style.textContent = `.is-music-toggle{position:fixed;z-index:2147483000;left:calc(12px + env(safe-area-inset-left));bottom:calc(12px + env(safe-area-inset-bottom));width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.35);background:rgba(20,16,12,.55);color:#fff;display:grid;place-items:center;padding:0;cursor:pointer;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);box-shadow:0 4px 14px rgba(0,0,0,.25);opacity:0;transition:opacity .4s,transform .25s;transform:translateY(calc(var(--lift,0) * -1px))}
.is-music-toggle.is-ready{opacity:1}
.is-music-toggle:focus-visible{outline:2px solid #fff;outline-offset:2px}
.is-music-toggle svg{width:20px;height:20px}
.is-music-toggle .bar{transform-origin:50% 100%;transform:scaleY(.35)}
.is-music-toggle.is-playing .bar{animation:is-music-bar 1s ease-in-out infinite}
.is-music-toggle.is-playing .bar:nth-child(2){animation-delay:-.4s}
.is-music-toggle.is-playing .bar:nth-child(3){animation-delay:-.7s}
.is-music-toggle .slash{display:none}
.is-music-toggle[aria-pressed="false"] .slash{display:block}
@keyframes is-music-bar{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}
@media (prefers-reduced-motion:reduce){.is-music-toggle.is-playing .bar{animation:none;transform:none}}`;
    document.head.append(style);
    button = document.createElement('button');
    button.type = 'button';
    button.className = 'is-music-toggle';
    button.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true" fill="currentColor"><rect class="bar" x="3" y="4" width="3" height="12" rx="1.5"/><rect class="bar" x="8.5" y="4" width="3" height="12" rx="1.5"/><rect class="bar" x="14" y="4" width="3" height="12" rx="1.5"/><path class="slash" d="M2 2 18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    button.addEventListener('click', event => {
      event.stopPropagation();
      wanted = !(wanted && !audio.paused);
      store('sessionStorage', OFF, wanted ? '0' : '1');
      if (wanted) { if (!started) start(); else play()?.catch(() => {}); }
      else fade(0, 300, () => { audio.pause(); render(); });
      render();
    });
    audio.addEventListener('play', render);
    audio.addEventListener('pause', render);
    // A modal <dialog> (some designs' welcome screen) sits in the top layer above any z-index,
    // so the toggle moves into whichever modal is open.
    const place = () => {
      const host = Array.from(document.querySelectorAll('dialog[open]')).filter(d => d.matches(':modal')).pop() || document.body;
      if (button.parentElement !== host) host.append(button);
    };
    place();
    new MutationObserver(place).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] });
    requestAnimationFrame(() => button.classList.add('is-ready'));
    // Step upwards while the toggle would cover one of the invitation's own links or buttons.
    // Full-screen "tap to open" covers are ignored: any tap there starts the music anyway.
    const coveredAt = (x, y) => {
      button.style.pointerEvents = 'none';
      const el = document.elementFromPoint(x, y)?.closest('a,button,input,select,textarea,summary,[role=button],[tabindex]');
      button.style.pointerEvents = '';
      if (!el) return false;
      const b = el.getBoundingClientRect();
      return b.width * b.height < innerWidth * innerHeight * 0.5;
    };
    let lift = 0, queued = false;
    const dodge = () => {
      queued = false;
      const r = button.getBoundingClientRect();
      const shift = new DOMMatrixReadOnly(getComputedStyle(button).transform).f; // mid-transition offset
      const x = r.left + r.width / 2, y = r.top + r.height / 2 - shift;
      let next = 0;
      const blocked = dy => [[0, 0], [-14, -14], [14, -14], [-14, 14], [14, 14]].some(([dx, d]) => coveredAt(x + dx, y - dy + d));
      while (next < 208 && blocked(next)) next += 52;
      if (next !== lift) button.style.setProperty('--lift', lift = next);
    };
    const queue = () => { if (!queued) { queued = true; requestAnimationFrame(dodge); } };
    addEventListener('scroll', queue, { passive: true, capture: true });
    addEventListener('resize', queue);
    setInterval(queue, 700);
    queue();
    render();
  }

  function start() {
    if (started) return;
    const attempt = play();
    if (!attempt) return;
    started = true;
    attempt.then(() => {
      // Advance the shared rotation only once a song has actually played.
      store('localStorage', NEXT, String(index - designOffset + 1));
      stopListening();
      render();
    }).catch(() => { started = false; clearInterval(fadeTimer); audio.volume = 0; });
  }
  // The invitation's own "tap to open" is the visitor's first gesture; it also unlocks audio.
  const gestures = ['pointerup', 'touchend', 'click', 'keydown'];
  function onGesture(event) {
    if (button && event.target === button) return;
    if (event.type === 'keydown' && ['Tab', 'Shift', 'Escape'].includes(event.key)) return;
    if (wanted) start();
    else stopListening();
  }
  function stopListening() { for (const type of gestures) document.removeEventListener(type, onGesture, true); }
  for (const type of gestures) document.addEventListener(type, onGesture, true);

  // Do not play in a background tab; resume only if it was playing.
  let resume = false;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { resume = !audio.paused; audio.pause(); }
    else if (resume && wanted) { resume = false; play()?.catch(() => {}); }
  });
  window.addEventListener('pagehide', () => audio.pause());

  load(index);
  const ready = () => addButton();
  if (document.body) ready(); else document.addEventListener('DOMContentLoaded', ready, { once: true });
  window.InvitationMusic = { audio, pool: pool.map(t => t[0]) };
})();
