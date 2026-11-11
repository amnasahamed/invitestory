/* Native playback failure leaves the invitation accessible. */
(() => {
  let bound = false;
  function connect() {
    const gate = document.querySelector('#opening-gate');
    const video = document.querySelector('.hero__video');
    if (bound || !gate || !video) return;
    bound = true;
    let started = false;
    const skip = document.createElement('button');
    skip.type = 'button';
    skip.className = 'v5-opening-skip';
    skip.textContent = 'Skip animation';
    skip.hidden = true;
    document.querySelector('#top')?.append(skip);
    function fallback() {
      if (!started) return;
      document.querySelector('.hero__content')?.classList.add('is-visible');
      document.querySelector('.hero__content')?.setAttribute('aria-hidden', 'false');
      document.querySelector('.scroll-cue')?.classList.add('is-visible');
      document.body.classList.remove('scroll-locked');
      document.documentElement.classList.remove('scroll-locked');
      document.body.classList.add('experience-open');
      skip.hidden = true;
    }
    skip.addEventListener('click', () => { video.pause(); fallback(); });
    gate.addEventListener('click', () => {
      if (started) return;
      started = true;
      setTimeout(() => {
        if (video.error || (video.paused && video.currentTime === 0)) fallback();
      }, 2500);
      setTimeout(() => {
        const title = document.querySelector('.hero__content');
        if (!title?.classList.contains('is-visible') && !video.ended) skip.hidden = false;
      }, 8000);
    }, true);
    video.addEventListener('error', fallback);
    video.addEventListener('ended', () => { skip.hidden = true; });
  }
  connect();
  const root = document.querySelector('#app');
  if (root) new MutationObserver(connect).observe(root, { childList: true });
})();
