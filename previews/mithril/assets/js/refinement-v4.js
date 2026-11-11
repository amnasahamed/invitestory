(() => {
  function refine() {
    document.querySelectorAll('.mithril-v3-surface').forEach(section => {
      const image = part => section.querySelector(`img[src*="${part}"]`);
      if (image('portrait-v2')) section.classList.add('mithril-v4-media', 'mithril-v4-portrait');
      if (image('interlude-v2') || image('footer-cover-v2')) section.classList.add('mithril-v4-media');
      if (image('venue-v2')) section.classList.add('mithril-v4-venue');
      if (image('dresscode-v2')) section.classList.add('mithril-v4-fashion');
      if (section.querySelector('form')) section.classList.add('mithril-v4-form');
    });
    document.querySelectorAll('.mithril-v4-fashion span[style]').forEach(swatch => {
      if (swatch.children.length || swatch.textContent.trim()) return;
      const color = swatch.style.backgroundColor || swatch.style.background;
      if (!color) return;
      swatch.classList.add('mithril-v4-swatch');
      swatch.setAttribute('role', 'img');
      swatch.setAttribute('aria-label', `Suggested attire colour: ${color}`);
      swatch.title = 'Suggested attire colour';
    });
  }
  let pending = false;
  new MutationObserver(() => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; refine(); });
  }).observe(document.body, { childList:true, subtree:true });
  refine();
})();
