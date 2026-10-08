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
  const image = document.getElementById('atelier-envelope-image');
  const preview = document.getElementById('hero-preview-btn');
  document.querySelectorAll('[data-hero-design]').forEach(choice => {
    choice.addEventListener('click', () => {
      const item = TEMPLATE_DATABASE.find(design => design.id === Number(choice.dataset.heroDesign));
      if (!item) return;
      document.querySelectorAll('[data-hero-design]').forEach(button => {
        const selected = button === choice;
        button.setAttribute('aria-pressed', String(selected));
        button.classList.toggle('is-selected', selected);
      });
      preview.dataset.designId = String(item.id);
      preview.setAttribute('aria-label', `Open the ${item.name} live invitation`);
      document.getElementById('atelier-product-name').textContent = item.name;
      image.alt = `${item.name} embossed floral envelope and wax seal`;
      image.src = item.image;
      preview.classList.remove('is-switching');
      requestAnimationFrame(() => preview.classList.add('is-switching'));
    });
  });
  preview.addEventListener('animationend', () => preview.classList.remove('is-switching'));

  const reviews = {
    6: { quote: '“Thank You Mam for making this invitation beautiful”', context: 'A customer’s message after seeing their invitation.', file: 'review-07.webp' },
    5: { quote: '“Sir everyone like it”', context: 'A customer’s reply after sharing the invitation with their family.', file: 'review-06.webp' },
    8: { quote: '“Thank you sir! I appreciate your work!”', context: 'A customer’s message to the team after delivery.', file: 'review-09.webp' }
  };
  document.querySelectorAll('[data-customer-review]').forEach(button => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.customerReview);
      const review = reviews[index];
      if (!review) return;
      document.querySelectorAll('[data-customer-review]').forEach(choice => choice.setAttribute('aria-pressed', String(choice === button)));
      document.getElementById('atelier-customer-quote').textContent = review.quote;
      document.getElementById('atelier-customer-context').textContent = review.context;
      const photo = document.getElementById('atelier-review-image');
      photo.src = `assets/reviews/${review.file}`;
      photo.alt = `Original WhatsApp conversation: ${review.quote}`;
      document.getElementById('atelier-review-original').dataset.reviewIndex = String(index);
      document.getElementById('atelier-review-image-button').dataset.reviewIndex = String(index);
    });
  });
  setupHomeCollectionCards(document.getElementById('pricing'));
}
document.addEventListener('DOMContentLoaded', setupHomeShowroom);
