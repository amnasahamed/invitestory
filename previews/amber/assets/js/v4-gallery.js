/* A native swipeable editorial gallery; its photographs remain visible without JS. */
(() => {
  const track = document.querySelector('#amberEditorialTrack');
  if (!track) return;
  const slides = Array.from(track.querySelectorAll('figure'));
  const buttons = Array.from(document.querySelectorAll('[data-editorial-slide]'));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const go = index => {
    track.scrollTo({ left: index * track.clientWidth, behavior: reduce.matches ? 'auto' : 'smooth' });
  };
  buttons.forEach(button => button.addEventListener('click', () => go(Number(button.dataset.editorialSlide))));
  track.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    if (matchMedia('(min-width: 900px)').matches) return;
    event.preventDefault();
    const current = Math.round(track.scrollLeft / track.clientWidth);
    go(Math.max(0, Math.min(slides.length - 1, current + (event.key === 'ArrowRight' ? 1 : -1))));
  });
  // All three slides intersect on desktop. Use the actual horizontal position
  // so resizing back to the single-slide layout cannot leave the last dot set.
  const sync = () => {
    const index = Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / (track.clientWidth || 1))));
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(index === i)));
  };
  track.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync);
  sync();
})();
