(() => {
  'use strict';
  const root = document.getElementById('invitation-archive');
  if (!root) return;

  // Use the same public browsing list as the catalogue, including its ordering
  // and hidden-design policy. Artwork, names and previews stay in sync.
  const items = getListedDesigns().map(item => ({
    ...item,
    tags: [item.style, ...(item.tags || []).slice(0, 2)].filter(Boolean).join(' / ').toUpperCase()
  }));
  if (!items.length) return;

  const shelf = document.getElementById('archive-shelf');
  const stage = document.getElementById('archive-stage');
  const title = document.getElementById('archive-title');
  const subtitle = document.getElementById('archive-subtitle');
  const dot = document.getElementById('archive-ruler-dot');
  const ticks = document.getElementById('archive-ruler-ticks');
  const ruler = document.getElementById('archive-ruler');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards = [];
  const ribbon = document.createElement('canvas');
  ribbon.className = 'invitation-ribbon';
  ribbon.setAttribute('aria-hidden', 'true');
  shelf.prepend(ribbon);
  const ribbonContext = ribbon.getContext('2d');
  const paperTexture = document.createElement('canvas');
  const textureContext = paperTexture.getContext('2d');
  // Load only the artwork a visitor can currently see. Loading the whole
  // catalogue here used to make mobile browsers fetch roughly 16 MB at once.
  const artwork = new Array(items.length);
  const initialIndex = Math.max(0, items.findIndex(item => item.id === 29));
  let current = initialIndex;
  let target = initialIndex;
  let active = initialIndex;
  let dragging = false;
  let dragged = false;
  let startX = 0;
  let startTarget = 0;
  let last = performance.now();
  let renderRequest = 0;
  let neighbourWarmup;
  let wheelTimer;
  let playing = null;
  const playbackClose = document.createElement('button');
  playbackClose.type = 'button';
  playbackClose.className = 'archive-playback-close';
  playbackClose.textContent = 'Close invitation ×';
  playbackClose.hidden = true;
  document.getElementById('archive-open').after(playbackClose);
  playbackClose.addEventListener('click', () => stopPlayback(true));
  let metrics = { h: 350, phoneW: 165, gap: 14, unit: 112 };

  const mod = (n, m) => ((n % m) + m) % m;
  const relative = (index, position) => {
    let value = index - mod(Math.round(position), items.length) - (position - Math.round(position));
    while (value > items.length / 2) value -= items.length;
    while (value < -items.length / 2) value += items.length;
    return value;
  };

  items.forEach((item, index) => {
    const card = document.createElement('div');
    card.setAttribute('role', 'button');
    card.tabIndex = 0;
    card.className = 'archive-card';
    card.dataset.index = index;
    card.dataset.designId = item.id;
    card.setAttribute('aria-label', `Select ${item.name}`);
    const device = document.createElement('span');
    device.className = 'archive-device';
    const screen = document.createElement('span');
    screen.className = 'archive-screen';
    screen.dataset.src = item.image;
    card.screen = screen;
    const hardware = document.createElement('span');
    hardware.className = 'archive-hardware';
    hardware.setAttribute('aria-hidden', 'true');
    device.append(screen, hardware);
    card.append(device);
    stage.appendChild(card);
    cards.push(card);
    card.addEventListener('click', () => {
      if (playing) return;
      if (dragged) return;
      if (index === active && Math.abs(target - current) < .25) openSelected();
      else goTo(index);
    });
    card.addEventListener('keydown', event => {
      if (playing || !['Enter', ' '].includes(event.key)) return;
      event.preventDefault(); event.stopPropagation(); openSelected();
    });

    const tick = document.createElement('button');
    tick.type = 'button';
    tick.className = 'archive-tick';
    tick.setAttribute('aria-label', `Go to ${item.name}`);
    tick.innerHTML = `<span>${String(index + 1).padStart(2, '0')}</span>`;
    tick.addEventListener('click', event => { event.stopPropagation(); goTo(index); });
    ticks.appendChild(tick);
  });

  function measure() {
    const raw = parseFloat(getComputedStyle(root).getPropertyValue('--card-h'));
    const probe = document.createElement('i');
    probe.style.cssText = 'position:absolute;height:var(--card-h);visibility:hidden';
    root.appendChild(probe);
    const h = probe.getBoundingClientRect().height || raw || 350;
    probe.remove();
    metrics = { h, phoneW: h * .47, gap: h * .04, unit: h * .34 };
    sizePlayback();
  }

  function nearestTarget(index) {
    const base = Math.round(target);
    const baseIndex = mod(base, items.length);
    let delta = index - baseIndex;
    if (delta > items.length / 2) delta -= items.length;
    if (delta < -items.length / 2) delta += items.length;
    return base + delta;
  }

  function requestRender() {
    if (!renderRequest && !document.hidden) renderRequest = requestAnimationFrame(render);
  }

  function ensureArtwork(index, priority = false) {
    const safeIndex = mod(index, items.length);
    if (artwork[safeIndex]) return artwork[safeIndex];
    const img = new Image();
    artwork[safeIndex] = img;
    img.decoding = 'async';
    img.fetchPriority = priority ? 'high' : 'low';
    img.onload = requestRender;
    img.onerror = requestRender;
    img.src = items[safeIndex].image;
    cards[safeIndex].screen.style.backgroundImage = `url("${items[safeIndex].image}")`;
    return img;
  }

  function warmNearbyArtwork(index) {
    clearTimeout(neighbourWarmup);
    neighbourWarmup = setTimeout(() => {
      ensureArtwork(index - 1);
      ensureArtwork(index + 1);
    }, 1200);
  }

  function goTo(index) { stopPlayback(); target = nearestTarget(index); ensureArtwork(index); requestRender(); }
  function step(amount) { stopPlayback(); target = Math.round(target) + amount; ensureArtwork(mod(Math.round(target), items.length)); requestRender(); }
  function sizePlayback() {
    if (!playing) return;
    const scale = playing.card.screen.clientWidth / 390;
    playing.frame.style.width = '390px';
    playing.frame.style.height = `${playing.card.screen.clientHeight / scale}px`;
    playing.frame.style.transform = `scale(${scale})`;
  }
  function stopPlayback(restoreFocus = false) {
    if (!playing) return;
    const { card, frame } = playing;
    playing = null;
    frame.remove();
    card.screen.classList.remove('is-playing');
    card.setAttribute('role', 'button');
    card.tabIndex = 0;
    playbackClose.hidden = true;
    document.getElementById('archive-open').hidden = false;
    root.classList.remove('is-playing');
    if (restoreFocus) card.focus({ preventScroll: true });
  }
  function openSelected() {
    if (playing) return;
    clearTimeout(wheelTimer);
    current = target = Math.round(current);
    const item = items[active];
    if (typeof openPreview === 'function') {
      openPreview(item.id);
      return;
    }
    const url = new URL(location.href);
    url.searchParams.set('design', item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    location.assign(url.toString());
  }

  function swapText(node, value, direction) {
    if (node.textContent === value) return;
    if (reduceMotion || !node.animate) { node.textContent = value; return; }
    node.getAnimations().forEach(animation => animation.cancel());
    node.textContent = value;
    node.animate([{ transform: `translateY(${direction * 110}%)` }, { transform: 'translateY(0)' }], { duration: 430, easing: 'cubic-bezier(.2,.8,.2,1)' });
  }

  function updateActive(index, direction) {
    active = index;
    ensureArtwork(index, index === initialIndex);
    warmNearbyArtwork(index);
    const item = items[index];
    const price = document.getElementById('archive-design-price');
    price.dataset.designId = item.id;
    const prices = getItemPrices(item);
    price.textContent = formatPrice(prices.priceINR, prices.priceUSD);
    const designUrl = new URL('/', 'https://invitestory.in');
    designUrl.searchParams.set('design', item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    document.getElementById('archive-book').href = `https://wa.me/918281583882?text=${encodeURIComponent(`Hi InviteStory, I'd like to book the ${item.name} invitation. Please help me with the next steps.\n\nDesign: ${designUrl.href}`)}`;
    swapText(title, items[index].name, direction || 1);
    swapText(subtitle, items[index].tags, direction || 1);
    cards.forEach((card, i) => card.setAttribute('aria-current', i === index ? 'true' : 'false'));
  }

  function render(now) {
    renderRequest = 0;
    const dt = Math.min(.05, (now - last) / 1000 || .016);
    last = now;
    if (playing) return;
    const ease = reduceMotion ? 1 : 1 - Math.exp(-(dragging ? 18 : 6.2) * dt);
    current += (target - current) * ease;
    const nextActive = mod(Math.round(current), items.length);
    const base = Math.floor(current);
    const fraction = current - base;
    const width = shelf.clientWidth;
    const height = shelf.clientHeight;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    if (ribbon.width !== Math.round(width * ratio) || ribbon.height !== Math.round(height * ratio)) {
      ribbon.width = Math.round(width * ratio); ribbon.height = Math.round(height * ratio);
    }
    ribbonContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    ribbonContext.clearRect(0, 0, width, height);
    const panelWidth = metrics.h * .7;
    const ribbonHeight = metrics.h * .56;
    const offset = current * panelWidth;
    const textureWidth = Math.ceil(width * ratio);
    if (paperTexture.width !== textureWidth) { paperTexture.width = textureWidth; paperTexture.height = 900; }
    textureContext.setTransform(ratio,0,0,1,0,0);
    textureContext.fillStyle = '#f4f0e5';
    textureContext.fillRect(0,0,width,900);
    const firstPanel = Math.floor((offset - width / 2) / panelWidth);
    const lastPanel = Math.ceil((offset + width / 2) / panelWidth);
    for (const [focusedPanel, alpha] of [[base,1],[base+1,fraction]]) {
      if (alpha < .001) continue;
      textureContext.globalAlpha = alpha;
      for (let panel = firstPanel; panel <= lastPanel; panel++) {
        let index = mod(panel >= focusedPanel ? panel + 1 : panel,items.length);
        if (index === mod(focusedPanel,items.length)) index = mod(index+1,items.length);
        const img = artwork[index];
        if (img?.complete && img.naturalWidth) textureContext.drawImage(img,panel*panelWidth-offset+width/2,0,panelWidth+.2,900);
      }
    }
    textureContext.globalAlpha = 1;
    textureContext.fillStyle = 'rgba(247,245,230,.26)';
    textureContext.fillRect(0,0,width,900);
    // One continuous antialiased silhouette gives the paper a clean cut edge.
    // Artwork follows the same cubic curve in subpixel strips inside that edge.
    const curve = t => {
      const u = 1 - t;
      return height * (.54*u*u*u + 3*.52*u*u*t + 3*.01*u*t*t + .17*t*t*t);
    };
    const thickness = t => ribbonHeight * (.65 + .35 * Math.sin(Math.PI * t));
    ribbonContext.save();
    ribbonContext.beginPath();
    for (let i = 0; i <= 180; i++) {
      const t = i / 180;
      if (!i) ribbonContext.moveTo(0, curve(t));
      else ribbonContext.lineTo(t * width, curve(t));
    }
    for (let i = 180; i >= 0; i--) {
      const t = i / 180;
      ribbonContext.lineTo(t * width, curve(t) + thickness(t));
    }
    ribbonContext.closePath();
    ribbonContext.clip();
    // Warp an already-composited opaque surface on device-pixel boundaries.
    // This avoids the overlapping alpha strips that caused vertical banding.
    for (let pixel = 0; pixel < textureWidth; pixel++) {
      const x = pixel / ratio;
      const t = x / width;
      const y = curve(t);
      const h = thickness(t);
      ribbonContext.drawImage(paperTexture,pixel,0,1,900,x,y-2,1/ratio,h+4);
    }
    const paperLight = ribbonContext.createLinearGradient(0, 0, width, height * .2);
    paperLight.addColorStop(0, 'rgba(93,69,35,.09)');
    paperLight.addColorStop(.22, 'rgba(255,252,242,.2)');
    paperLight.addColorStop(.45, 'rgba(62,44,20,.1)');
    paperLight.addColorStop(.68, 'rgba(255,253,243,.28)');
    paperLight.addColorStop(1, 'rgba(236,228,210,.13)');
    ribbonContext.fillStyle = paperLight;
    ribbonContext.fillRect(0, 0, width, height);
    ribbonContext.restore();
    if (nextActive !== active) {
      if (!reduceMotion) {
        const previousCard = cards[active];
        const previousScreen = previousCard.screen;
        previousScreen.getAnimations().forEach(animation => animation.cancel());
        const overlay = previousScreen.cloneNode(false);
        overlay.className = 'archive-screen archive-screen-dissolve';
        cards[nextActive].querySelector('.archive-device').appendChild(overlay);
        const dissolve = overlay.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 480, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards'
        });
        dissolve.finished.then(() => overlay.remove()).catch(() => overlay.remove());
      }
      updateActive(nextActive, Math.sign(target - current) || 1);
    }

    cards.forEach((card, index) => {
      card.hidden = index !== nextActive;
      if (card.hidden) return;
      card.style.transform = 'translate3d(0,-16px,65px) rotateX(12deg) rotateY(-9deg) rotateZ(-1deg)';
      card.style.zIndex = '3055';
      card.style.setProperty('--device-shade', '0');
      card.style.setProperty('--device-glow', '1');
    });
    const progress = mod(current, items.length) / (items.length - 1);
    dot.style.left = `${Math.max(0, Math.min(100, progress * 100))}%`;
    if (dragging || Math.abs(target - current) > .001) requestRender();
  }

  document.querySelector('.archive-arrow-prev').addEventListener('click', () => step(-1));
  document.querySelector('.archive-arrow-next').addEventListener('click', () => step(1));
  document.getElementById('archive-open').addEventListener('click', openSelected);
  ruler.addEventListener('click', event => {
    if (event.target.closest('.archive-tick')) return;
    const rect = ruler.getBoundingClientRect();
    goTo(Math.round((event.clientX - rect.left) / rect.width * (items.length - 1)));
  });
  shelf.addEventListener('pointerdown', event => {
    if (playing) return;
    dragging = true; dragged = false; startX = event.clientX; startTarget = target;
    shelf.classList.add('is-dragging');
    requestRender();
  });
  shelf.addEventListener('pointermove', event => {
    if (!dragging) return;
    const dx = event.clientX - startX;
    if (Math.abs(dx) > 5) { dragged = true; shelf.setPointerCapture(event.pointerId); }
    target = startTarget - dx / metrics.unit;
    requestRender();
  });
  const endDrag = () => { if (!dragging) return; dragging = false; target = Math.round(target); shelf.classList.remove('is-dragging'); requestRender(); setTimeout(() => { dragged = false; }, 0); };
  shelf.addEventListener('pointerup', endDrag);
  shelf.addEventListener('pointercancel', endDrag);
  shelf.addEventListener('wheel', event => {
    if (playing) return;
    event.preventDefault();
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    target += delta / metrics.unit * .36;
    requestRender();
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => { target = Math.round(target); requestRender(); }, 150);
  }, { passive: false });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && playing) { stopPlayback(true); return; }
    if (event.target.closest('button, a, input, select, textarea, iframe')) return;
    if (!root.matches(':hover') && document.activeElement?.closest('#invitation-archive') == null) return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); step(1); }
    if (event.key === 'Enter') openSelected();
  });
  addEventListener('resize', () => { measure(); requestRender(); }, { passive: true });
  document.addEventListener('visibilitychange', requestRender);
  measure();
  updateActive(initialIndex, 1);
  requestRender();
})();
