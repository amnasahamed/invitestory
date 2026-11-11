(() => {
  'use strict';
  const video = document.getElementById('how-it-works-video');
  if (!video) return;
  const mobile = window.matchMedia('(max-width: 767px)');
  const sources = video.querySelectorAll('source');
  let restoreProgress;

  function selectFormat() {
    const source = sources[mobile.matches ? 0 : 1];
    const src = source.getAttribute('src');
    if (video.getAttribute('src') === src) return;
    const position = video.currentTime;
    const resume = !video.paused && !video.ended;
    if (restoreProgress) video.removeEventListener('loadedmetadata', restoreProgress);
    if (resume) video.pause();
    video.poster = source.dataset.poster;
    video.width = mobile.matches ? 1080 : 1920;
    video.height = mobile.matches ? 1920 : 1080;
    // An active viewer keeps their place when rotating or resizing the screen.
    if (position > 0 || resume) {
      video.preload = 'metadata';
      restoreProgress = () => {
        video.currentTime = Math.min(position, video.duration);
        if (resume) video.play().catch(() => {});
      };
      video.addEventListener('loadedmetadata', restoreProgress, { once: true });
    }
    video.src = src;
  }

  mobile.addEventListener('change', selectFormat);
  selectFormat();
})();
