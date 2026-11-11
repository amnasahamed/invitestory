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
  header.append(modal.querySelector('.preview-modal-close'), heading, byId('preview-favourite-btn'));
  const stage = document.createElement('div');
  stage.className = 'preview-gallery-stage';
  const card = document.createElement('div');
  card.className = 'preview-gallery-card';
  const full = byId('preview-fullscreen-btn');
  full.querySelector('span').textContent = 'Watch full preview';
  card.append(byId('preview-modal-iframe-wrap'));
  // Keep the link outside the scaled artwork so short screens cannot clip it.
  stage.append(card, full);
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
  actions.append(namesButton, byId('preview-footer-share-btn'));
  footer.prepend(actions);
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
