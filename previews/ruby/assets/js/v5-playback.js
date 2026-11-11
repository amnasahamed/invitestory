/* Synchronize the single title fade with media progress rather than wall-clock CSS. */
(() => {
  const hero = document.querySelector('#hero');
  const video = document.querySelector('#introVideo');
  if (!hero || !video) return;
  let ready = hero.classList.contains('v5-title-ready');
  let started = false;
  let fallback = null;
  let lastTime = video.currentTime || 0;
  const open = () => hero.classList.contains('is-open');
  const reveal = reason => {
    if (ready || !open()) return;
    ready = true;
    clearTimeout(fallback);
    hero.dataset.v5TitleReason = reason;
    hero.classList.add('v5-title-ready');
  };
  const guard = milliseconds => {
    clearTimeout(fallback);
    if (ready || !open()) return;
    const at = video.currentTime || 0;
    fallback = setTimeout(() => {
      if (!ready && open() && Math.abs((video.currentTime || 0) - at) < .04) reveal('media-fallback');
      else if (!ready) guard(18000);
    }, milliseconds);
  };
  const check = () => {
    if (!open() || ready) return;
    if (video.error) return reveal('media-error');
    const duration = video.duration;
    if (video.ended || (Number.isFinite(duration) && duration > 0 && video.currentTime >= duration - .08)) {
      reveal('media-complete');
      return;
    }
    if (Math.abs(video.currentTime - lastTime) >= .04) {
      lastTime = video.currentTime;
      guard(18000);
    }
  };
  const begin = () => {
    if (!open() || started) return;
    started = true;
    check();
    if (!ready) guard(12000);
  };
  document.documentElement.classList.add('v5-playback-sync');
  new MutationObserver(begin).observe(hero, { attributes: true, attributeFilter: ['class'] });
  ['timeupdate', 'ended', 'loadedmetadata', 'loadeddata', 'playing', 'pause'].forEach(event => video.addEventListener(event, check));
  video.addEventListener('error', () => reveal('media-error'));
  ['waiting', 'stalled'].forEach(event => video.addEventListener(event, () => guard(18000)));
  window.addEventListener('pageshow', () => { begin(); check(); });
  begin();
})();

/* Keep the accessible music action aligned with the actual audio state. */
(() => {
  const audio = document.querySelector('#backgroundMusic');
  const button = document.querySelector('#musicToggle');
  const label = document.querySelector('#musicLabel');
  if (!audio || !button) return;
  const sync = () => {
    const playing = !audio.paused && !audio.ended && !audio.error;
    button.setAttribute('aria-label', playing ? 'Pause background music' : 'Play background music');
    button.setAttribute('aria-pressed', String(playing));
    button.classList.toggle('is-playing', playing);
    if (label) label.textContent = playing ? 'Playing' : 'Music';
  };
  // External pauses can leave the original app's private boolean stale.
  // Own this control and decide from the media element on every gesture.
  button.addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (audio.paused || audio.ended) {
      const attempt = audio.play();
      if (attempt && typeof attempt.catch === 'function') attempt.catch(sync);
    } else audio.pause();
    sync();
  }, true);
  ['play', 'playing', 'pause', 'ended', 'emptied', 'error'].forEach(event => audio.addEventListener(event, sync));
  window.addEventListener('pageshow', sync);
  sync();
})();
