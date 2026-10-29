/* Homepage composition only. Product selection, totals and checkout remain in the shared flow. */
function setupHomeCollectionCards(container) {
  const examples = [1, 21, 35];
  container.querySelectorAll('.pricing-card').forEach((card, index) => {
    if (card.querySelector('.atelier-collection-art')) return;
    const item = TEMPLATE_DATABASE.find(design => design.id === examples[index]);
    if (!item) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'atelier-collection-art';
    button.setAttribute('aria-label', `Preview ${packageName(item.tier)} with ${item.name}`);
    const image = document.createElement('img');
    image.src = item.image;
    image.alt = `${item.name} invitation design`;
    image.loading = 'lazy';
    image.width = 230;
    image.height = 280;
    button.appendChild(image);
    button.addEventListener('click', () => openPreview(item.id));
    card.prepend(button);
  });
}

function setupHomeShowroom() {
  if (!document.body.classList.contains('atelier-home')) return;
  const currencyLayout = window.matchMedia('(max-width: 760px)');
  const setCurrencyLabels = () => {
    for (const code of ['INR', 'USD']) {
      const button = document.getElementById(`currency-${code.toLowerCase()}`);
      const fullLabel = code === 'INR' ? 'INR (₹)' : 'USD ($)';
      button.setAttribute('aria-label', fullLabel);
      button.textContent = currencyLayout.matches ? code : fullLabel;
    }
  };
  setCurrencyLabels();
  currencyLayout.addEventListener('change', setCurrencyLabels);
  // On phones the currency switch lives in the menu, leaving the header for the logo, WhatsApp and Menu.
  const currencySwitch = document.querySelector('.header-actions .currency-switch-container');
  const headerActions = document.querySelector('.header-actions');
  const placeCurrency = () => {
    if (!currencySwitch || !headerActions) return;
    if (currencyLayout.matches) document.getElementById('home-navigation')?.appendChild(currencySwitch);
    else headerActions.prepend(currencySwitch);
  };
  placeCurrency();
  currencyLayout.addEventListener('change', placeCurrency);
  const menu = document.querySelector('.atelier-menu-toggle');
  const nav = document.getElementById('home-navigation');
  const closeMenu = () => {
    menu.setAttribute('aria-expanded', 'false');
    menu.querySelector('span').textContent = '+';
    nav.classList.remove('is-open');
  };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.querySelector('span').textContent = open ? '−' : '+';
    nav.classList.toggle('is-open', open);
  });
  nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menu.focus();
    }
  });
  const openingVideo = document.getElementById('hero-opening-video');
  if (openingVideo) {
    // The muted loop plays only while on screen and the page is in front; a preview, another tab,
    // reduced motion or data saver leave the still poster.
    const stillOnly = window.matchMedia('(prefers-reduced-motion: reduce)').matches || navigator.connection?.saveData;
    const previewModal = document.getElementById('preview-modal');
    let inView = false;
    const syncPlayback = () => {
      const previewOpen = previewModal?.classList.contains('is-open');
      if (inView && !stillOnly && !document.hidden && !previewOpen) openingVideo.play().catch(() => {});
      else openingVideo.pause();
    };
    document.addEventListener('visibilitychange', syncPlayback);
    window.addEventListener('pagehide', () => openingVideo.pause());
    if (previewModal) new MutationObserver(syncPlayback).observe(previewModal, { attributes: true, attributeFilter: ['class'] });
    new IntersectionObserver(entries => {
      // Fast scrolls can batch several entries; only the latest reflects where the phone is now.
      inView = entries[entries.length - 1].isIntersecting;
      syncPlayback();
    }, { threshold: 0.4 }).observe(openingVideo);
  }
  setupHomeCollectionCards(document.getElementById('pricing'));
}
document.addEventListener('DOMContentLoaded', setupHomeShowroom);
