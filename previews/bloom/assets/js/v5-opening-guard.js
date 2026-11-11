/* Preserve the original keyboard action while preventing Space scrolling. */
document.querySelector('#cover')?.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') event.preventDefault();
}, true);
