(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const observed = new WeakSet();
  const reveal = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      reveal.unobserve(target);
      if (reduced.matches || !target.animate) return;
      target.animate([{ translate: '0 12px' }, { translate: '0 0' }], {
        duration: 650, easing: 'cubic-bezier(.22,1,.36,1)'
      });
    });
  }, { threshold: .15 }) : null;
  function enhance() {
    const opening = document.querySelector('video[src*="opening-v3.mp4"]');
    const poster = window.VERONA_CONFIG?.media?.openingPoster;
    if (opening && poster && opening.getAttribute('poster') !== poster) opening.setAttribute('poster', poster);
    document.querySelectorAll('section').forEach(section => {
      if (section.querySelector('video') || section.closest('#cover')) return;
      if (!section.classList.contains('mithril-v3-surface')) {
        section.classList.add('mithril-v3-surface');
        const decoration = document.createElement('span');
        decoration.className = 'mithril-v3-art';
        decoration.setAttribute('aria-hidden', 'true');
        section.prepend(decoration);
      }
    });
    document.querySelectorAll('article, #vrScratch').forEach(card => card.classList.add('mithril-v3-card'));
    document.querySelectorAll('h2, h3').forEach(heading => {
      if (observed.has(heading)) return;
      observed.add(heading);
      reveal?.observe(heading);
    });
    initTimelineFloral();
  }

  /* --- Mithril / Aabha Celebration Floral Scroll Flow & Ease Animation --- */
  let timelineFloralInitialized = false;
  function initTimelineFloral() {
    if (timelineFloralInitialized) return;
    const venueEl = document.querySelector('.mithril-v4-venue') || document.querySelector('section:has(.mithril-v4-venue)') || document.querySelector('[data-section="celebration"]');
    if (!venueEl) return;

    const card = venueEl.querySelector('article') || venueEl;
    if (venueEl.querySelector('.timeline-floral-cursor')) return;
    timelineFloralInitialized = true;

    const progressEl = document.createElement('div');
    progressEl.className = 'timeline-floral-progress';
    progressEl.setAttribute('aria-hidden', 'true');
    venueEl.prepend(progressEl);

    const cursorEl = document.createElement('div');
    cursorEl.className = 'timeline-floral-cursor';
    cursorEl.setAttribute('aria-hidden', 'true');
    cursorEl.innerHTML = `
      <div class="timeline-floral-aura"></div>
      <div class="timeline-floral-wrapper">
        <img src="assets/images/timeline-floral.svg" alt="" class="timeline-floral-img" />
      </div>
    `;
    venueEl.appendChild(cursorEl);

    const wrapperEl = cursorEl.querySelector('.timeline-floral-wrapper');

    let lineX = 28;
    let firstDotY = 40;
    let lastDotY = 40;
    let distance = 1;
    let inView = false;

    function measure() {
      const isMobile = window.innerWidth <= 480;
      lineX = isMobile ? 20 : 28;
      cursorEl.style.left = lineX + 'px';
      progressEl.style.left = lineX + 'px';

      firstDotY = card.offsetTop + 30;
      lastDotY = card.offsetTop + card.offsetHeight - 30;
      distance = Math.max(1, lastDotY - firstDotY);
    }

    measure();
    window.addEventListener('resize', measure, { passive: true });

    const viewObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        inView = entry.isIntersecting;
        if (inView) {
          cursorEl.classList.add('is-active');
          progressEl.classList.add('is-active');
          onScroll();
        } else {
          cursorEl.classList.remove('is-active');
          progressEl.classList.remove('is-active');
        }
      });
    }, { rootMargin: '120px 0px 120px 0px', threshold: 0.01 });
    viewObserver.observe(venueEl);

    let currentY = firstDotY;
    let targetY = firstDotY;
    let currentScale = 0.8;
    let targetScale = 0.8;
    let currentRot = 0;
    let targetRot = 0;

    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;
    let isTicking = false;

    function onScroll() {
      const scrollY = window.scrollY;
      const delta = Math.abs(scrollY - lastScrollY);
      lastScrollY = scrollY;

      scrollVelocity = Math.min(scrollVelocity + delta * 0.12, 10);

      const winH = window.innerHeight;
      const rect = venueEl.getBoundingClientRect();

      const startTrigger = winH * 0.65;
      const endTrigger = winH * 0.35;
      const scrollSpan = rect.height;

      let p = (startTrigger - rect.top) / (scrollSpan + (startTrigger - endTrigger) * 0.4);
      p = Math.max(0, Math.min(1, p));

      targetY = firstDotY + (p * distance);

      if (!isTicking && inView) {
        isTicking = true;
        requestAnimationFrame(updateFrame);
      }
    }

    function updateFrame() {
      scrollVelocity *= 0.88;
      if (scrollVelocity < 0.01) scrollVelocity = 0;

      currentY += (targetY - currentY) * 0.12;

      const progressHeight = Math.max(0, currentY - firstDotY);
      progressEl.style.top = firstDotY + 'px';
      progressEl.style.height = progressHeight + 'px';

      const cardCenter = card.offsetTop + card.offsetHeight / 2;
      const diff = Math.abs(currentY - cardCenter);
      const nearMilestone = diff < card.offsetHeight * 0.4;

      if (nearMilestone) {
        venueEl.classList.add('is-bloomed');
      } else {
        venueEl.classList.remove('is-bloomed');
      }

      const motionBoost = Math.min(0.45, scrollVelocity * 0.05);
      const milestoneBoost = nearMilestone ? 0.35 : 0;
      targetScale = 0.78 + motionBoost + milestoneBoost;
      currentScale += (targetScale - currentScale) * 0.1;

      targetRot = (currentY - firstDotY) * 0.26 + (scrollVelocity * 1.6);
      currentRot += (targetRot - currentRot) * 0.08;

      cursorEl.style.top = currentY + 'px';
      wrapperEl.style.transform = `scale(${currentScale.toFixed(3)}) rotate(${currentRot.toFixed(2)}deg)`;

      const stillMoving = Math.abs(targetY - currentY) > 0.1 ||
                          Math.abs(targetScale - currentScale) > 0.005 ||
                          scrollVelocity > 0.02;

      if (stillMoving && inView) {
        requestAnimationFrame(updateFrame);
      } else {
        isTicking = false;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  let scheduled = false;
  new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; enhance(); });
  }).observe(document.body, { childList: true, subtree: true });
  enhance();
})();
