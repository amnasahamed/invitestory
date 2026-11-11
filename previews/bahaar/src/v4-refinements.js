(() => {
  function enhance() {
    const card = document.querySelector('.venue-card');
    if (card && !card.querySelector('.v4-venue-image')) {
      const figure = document.createElement('figure');
      figure.className = 'v4-venue-image';
      const image = document.createElement('img');
      image.src = './assets/images/venue-garden-v4.webp';
      image.alt = 'A jasmine canopy and blush flowers beside an ivory garden pavilion';
      image.width = 1536; image.height = 1024;
      image.loading = 'lazy'; image.decoding = 'async';
      figure.append(image); card.prepend(figure);
    }
  }
  enhance();
  const root = document.querySelector('#app');
  if (root) new MutationObserver(enhance).observe(root, { childList:true });
})();
