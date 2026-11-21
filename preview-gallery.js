/* Reuse the live viewer and its actions; only their placement changes. */
(() => {
  const modal = document.getElementById('preview-modal');
  const byId = id => document.getElementById(id);
  const shell = document.createElement('div');
  shell.className = 'preview-gallery-shell';
  const header = document.createElement('header');
  header.className = 'preview-gallery-header';
  const heading = document.createElement('div');
  heading.className = 'preview-gallery-heading';
  heading.append(byId('preview-sheet-title'), byId('preview-counter-badge'));
  const handle = document.createElement('span');
  handle.className = 'preview-gallery-handle';
  handle.setAttribute('aria-hidden', 'true');
  header.append(handle, modal.querySelector('.preview-modal-close'), heading, byId('preview-favourite-btn'));
  const stage = document.createElement('div');
  stage.className = 'preview-gallery-stage';
  const card = document.createElement('div');
  card.className = 'preview-gallery-card';
  const full = byId('preview-fullscreen-btn');
  full.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="currentColor"/><path d="M10 8.2v7.6l6-3.8z" fill="#fff"/></svg><span>Watch full preview</span>';
  // The link sits on the card, outside the scaled invitation, so it never scales or clips.
  card.append(byId('preview-modal-iframe-wrap'), full);
  stage.append(card);
  const peeks = [-1, 1].map(direction => {
    const peek = document.createElement('button');
    peek.type = 'button';
    peek.className = `preview-gallery-peek ${direction < 0 ? 'is-previous' : 'is-next'}`;
    const image = document.createElement('img');
    image.alt = '';
    image.draggable = false;
    peek.append(image);
    peek.addEventListener('click', () => navigate(direction));
    stage.append(peek);
    return peek;
  });
  const navigation = modal.querySelector('.preview-browse-controls');
  const namesButton = byId('preview-names-edit');
  const hint = document.createElement('span');
  hint.className = 'preview-gallery-swipe';
  hint.textContent = 'Swipe for more designs';
  stage.append(byId('preview-side-prev'), byId('preview-side-next'));
  navigation.replaceChildren(hint);
  const footer = modal.querySelector('.preview-modal-toolbar');
  const actions = document.createElement('div');
  actions.className = 'preview-gallery-actions';
  // Keep the pre-payment question path inside the preview (the old secondary row is hidden here).
  const askButton = byId('preview-buy-btn');
  if (askButton) askButton.setAttribute('aria-label', 'Ask about this design on WhatsApp');
  actions.append(...[namesButton, askButton, byId('preview-footer-share-btn')].filter(Boolean));
  if (askButton) actions.classList.add('has-ask');
  // What every order includes, between the artwork and the actions.
  const promises = document.createElement('ul');
  promises.className = 'preview-gallery-promises';
  promises.setAttribute('aria-label', 'Included with this design');
  const promise = (icon, text) => {
    const row = document.createElement('li');
    row.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon}</svg>`;
    const label = document.createElement('span');
    label.textContent = text;
    row.append(label);
    promises.append(row);
    return label;
  };
  const draftLabel = promise('<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>', '48h draft');
  promise('<path d="M12 12c-2-2.7-3.6-4-5.5-4a4 4 0 0 0 0 8c1.9 0 3.5-1.3 5.5-4Zm0 0c2 2.7 3.6 4 5.5 4a4 4 0 0 0 0-8c-1.9 0-3.5 1.3-5.5 4Z"/>', 'Edits (24h)');
  promise('<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M8 3v4m8-4v4M3.5 10h17m-11 4.6 1.9 1.9 3.7-3.8"/>', 'RSVP');
  footer.prepend(promises, actions);
  shell.append(header, stage, navigation, footer);
  modal.append(shell);
  modal.classList.add('preview-gallery');
  byId('preview-instant-pay-btn').setAttribute('aria-label', 'Choose this design and review the price');
  for (const button of shell.querySelectorAll('button')) {
    if (!button.hasAttribute('aria-label')) button.setAttribute('aria-label', button.textContent.trim());
  }
  const hintKey = 'invitestory.previewSwipeDiscovered';
  try { hint.hidden = localStorage.getItem(hintKey) === '1'; } catch {}
  function dismissHint() {
    hint.hidden = true;
    try { localStorage.setItem(hintKey, '1'); } catch {}
  }
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let current, neighbours = [], busy = false, queuedDirection = 0, drag = null, suppressClick = false;
  function render(item) {
    current = item;
    const theme = PreviewThemes.themeFor(item.id);
    // Pure black/white always provides a passing alternative for an opaque palette color.
    const text = PreviewThemes.contrast(theme.accent, theme.onAccent) >= 4.5 ? theme.onAccent :
      (PreviewThemes.contrast(theme.accent, '#ffffff') >= 4.5 ? '#ffffff' : '#000000');
    byId('preview-instant-pay-btn').style.setProperty('--gallery-cta-text', text);
    // Dearly's first draft follows the delivery terms currently on offer.
    const fastDearly = item.tier === 4 && !(typeof usesNewDelivery === 'function' && usesNewDelivery());
    draftLabel.textContent = fastDearly ? '24h draft' : '48h draft';
    const catalogue = TEMPLATE_DATABASE.filter(design => !design.hidden || design.id === item.id);
    const index = catalogue.indexOf(item);
    neighbours = [catalogue[index - 1], catalogue[index + 1]];
    peeks.forEach((peek, i) => {
      const neighbour = neighbours[i];
      peek.hidden = !neighbour;
      const arrow = byId(i === 0 ? 'preview-side-prev' : 'preview-side-next');
      arrow.disabled = !neighbour;
      arrow.hidden = !neighbour;
      if (neighbour) {
        peek.firstElementChild.src = neighbour.image;
        peek.setAttribute('aria-label', `Preview ${neighbour.title || neighbour.name}`);
      }
    });
  }
  const movingCards = [card, ...peeks];
  function animate(from, to, duration) {
    return movingCards.map(element => element.animate(
      [{ transform: `translateX(${from}px)` }, { transform: `translateX(${to}px)` }],
      { duration, easing: 'ease-out', fill: 'both' }
    ));
  }
  async function navigate(direction, offset = 0) {
    if (busy) { queuedDirection = direction; return false; }
    const next = neighbours[direction < 0 ? 0 : 1];
    if (!next || !modal.classList.contains('is-open')) return false;
    busy = true;
    stage.setAttribute('aria-busy', 'true');
    // Start the live invitation immediately instead of waiting on an exit animation.
    openPreview(next.id);
    dismissHint();
    stage.style.removeProperty('--drag-x');
    const incoming = reducedMotion.matches ? [] : animate(direction * 32, 0, 220);
    await Promise.all(incoming.map(animation => animation.finished.catch(() => {})));
    incoming.forEach(animation => animation.cancel());
    busy = false;
    stage.setAttribute('aria-busy', 'false');
    const queued = queuedDirection;
    queuedDirection = 0;
    if (queued && current === next && modal.classList.contains('is-open')) await navigate(queued);
    return true;
  }
  function bindGestures(surface, point = event => ({ x: event.clientX, y: event.clientY }), signal) {
    const options = { signal, capture: true };
    surface.addEventListener('pointerdown', event => {
      if (busy || event.isPrimary === false || (event.button !== undefined && event.button !== 0) || event.target.closest('a,input,textarea,select,[contenteditable]')) return;
      drag = { ...point(event), dx: 0, horizontal: false };
    }, options);
    surface.addEventListener('pointermove', event => {
      if (!drag) return;
      const position = point(event);
      const dx = position.x - drag.x;
      const dy = position.y - drag.y;
      if (!drag.horizontal && Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { drag = null; return; }
      if (!drag.horizontal && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        drag.horizontal = true;
        event.target.setPointerCapture?.(event.pointerId);
      }
      if (!drag.horizontal) return;
      event.preventDefault();
      const available = neighbours[dx < 0 ? 1 : 0];
      const limit = card.clientWidth + 8;
      drag.dx = Math.max(-limit, Math.min(limit, dx * (available ? 1 : .2)));
      stage.style.setProperty('--drag-x', `${drag.dx}px`);
    }, { ...options, passive: false });
    const release = async (cancelled = false) => {
      if (!drag) return;
      const { dx, horizontal } = drag;
      drag = null;
      if (!horizontal) return;
      suppressClick = true;
      setTimeout(() => { suppressClick = false; }, 0);
      const threshold = (card.clientWidth + 8) / 2;
      if (!cancelled && Math.abs(dx) >= threshold && neighbours[dx < 0 ? 1 : 0]) {
        await navigate(dx < 0 ? 1 : -1, dx);
      } else {
        const snap = reducedMotion.matches ? [] : animate(dx, 0, 180);
        stage.style.removeProperty('--drag-x');
        await Promise.all(snap.map(animation => animation.finished.catch(() => {})));
        snap.forEach(animation => animation.cancel());
      }
    };
    surface.addEventListener('pointerup', () => release(), options);
    surface.addEventListener('pointercancel', () => release(true), options);
    surface.addEventListener('click', event => {
      if (suppressClick) { event.preventDefault(); event.stopImmediatePropagation(); }
    }, { ...options, capture: true });
    // Keep vertical invitation scrolling native while recognizing horizontal touch intent.
    surface.addEventListener('touchmove', event => {
      if (drag?.horizontal && event.cancelable) event.preventDefault();
    }, { ...options, passive: false });
  }
  // Pull the sheet down by its header to close it, as the handle suggests.
  let pull = null;
  header.addEventListener('pointerdown', event => {
    if (event.target.closest('button,a')) return;
    pull = { y: event.clientY };
  });
  header.addEventListener('pointerup', event => {
    if (pull && event.clientY - pull.y > 70 && typeof closePreview === 'function') closePreview();
    pull = null;
  });
  header.addEventListener('pointercancel', () => { pull = null; });
  bindGestures(stage);
  bindGestures(navigation);
  let frameGestures;
  function bindActiveFrameGestures() {
    frameGestures?.abort();
    frameGestures = new AbortController();
    try {
      const frame = byId('preview-modal-iframe');
      // Convert moving iframe coordinates back to the stationary carousel viewport.
      bindGestures(frame.contentDocument, event => {
        const rect = frame.getBoundingClientRect();
        const scale = rect.width / 390;
        return { x: rect.left + event.clientX * scale, y: rect.top + event.clientY * scale };
      }, frameGestures.signal);
    } catch {
      // Cross-origin demos keep their native gestures; the two peeks remain swipe targets.
    }
  }
  function watchActiveFrame() {
    byId('preview-modal-iframe').addEventListener('load', bindActiveFrameGestures);
    bindActiveFrameGestures();
  }
  watchActiveFrame();
  document.addEventListener('previewframechange', watchActiveFrame);
  document.addEventListener('keydown', event => {
    if (!modal.classList.contains('is-open') || !['ArrowLeft', 'ArrowRight'].includes(event.key) ||
      event.target.closest('input,textarea,select,[contenteditable],dialog[open]') ||
      document.querySelector('#order-drawer-modal.is-open,#preview-faq-backdrop.is-open,.interaction-sheet[open]')) return;
    event.preventDefault();
    navigate(event.key === 'ArrowLeft' ? -1 : 1);
  });
  window.PreviewGallery = { render, navigate };
  new ResizeObserver(() => schedulePreviewScale()).observe(stage);
})();
