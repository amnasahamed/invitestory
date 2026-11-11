/* Spring editorial heading cadence, layered over the existing gallery/reveal logic. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const observer = new IntersectionObserver(entries => entries.forEach(({ target, isIntersecting }) => {
    if (!isIntersecting) return;
    target.classList.add('v3-entered');
    if (!reduced.matches) {
      const headings = target.querySelectorAll('.section-kicker, h2');
      headings.forEach((heading, i) => heading.animate(
        [{ opacity: .72, translate: '0 7px' }, { opacity: 1, translate: '0 0' }],
        { duration: 1000, delay: i * 100, easing: 'cubic-bezier(.16,1,.3,1)' }
      ));
    }
    observer.unobserve(target);
  }), { threshold: .12 });
  const seen = new WeakSet();
  function connect() {
    document.querySelectorAll('.section').forEach(section => {
      if (seen.has(section)) return;
      seen.add(section); section.classList.add('v3-section'); observer.observe(section);
    });
    initTimelineFloral();
  }

  /* --- Bahaar Timeline Floral Scroll Flow & Ease Animation --- */
  let timelineFloralInitialized = false;
  function initTimelineFloral() {
    if (timelineFloralInitialized) return;
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;

    const items = timeline.querySelectorAll('.timeline__item');
    if (!items || items.length === 0) return;

    if (timeline.querySelector('.timeline-floral-cursor')) return;
    timelineFloralInitialized = true;

    const progressEl = document.createElement('div');
    progressEl.className = 'timeline-floral-progress';
    progressEl.setAttribute('aria-hidden', 'true');
    timeline.prepend(progressEl);

    const cursorEl = document.createElement('div');
    cursorEl.className = 'timeline-floral-cursor';
    cursorEl.setAttribute('aria-hidden', 'true');
    cursorEl.innerHTML = `
      <div class="timeline-floral-aura"></div>
      <div class="timeline-floral-wrapper">
        <img src="assets/images/timeline-floral.svg" alt="" class="timeline-floral-img" />
      </div>
    `;
    timeline.appendChild(cursorEl);

    const wrapperEl = cursorEl.querySelector('.timeline-floral-wrapper');

    let lineX = 41;
    let firstDotY = 25;
    let lastDotY = 25;
    let distance = 1;
    let inView = false;

    function measure() {
      const itemsList = timeline.querySelectorAll('.timeline__item');
      if (!itemsList.length) return;
      const firstItem = itemsList[0];
      const lastItem = itemsList[itemsList.length - 1];

      const isMobile = window.innerWidth <= 680;
      lineX = isMobile ? 31 : 41;
      cursorEl.style.left = lineX + 'px';
      progressEl.style.left = lineX + 'px';

      const firstMarker = firstItem.querySelector('.timeline__marker') || firstItem;
      const lastMarker = lastItem.querySelector('.timeline__marker') || lastItem;

      firstDotY = firstItem.offsetTop + (firstMarker.offsetHeight / 2 || 25);
      lastDotY = lastItem.offsetTop + (lastMarker.offsetHeight / 2 || 25);
      distance = Math.max(1, lastDotY - firstDotY);
    }

    measure();
    window.addEventListener('resize', measure, { passive: true });

    const timelineSection = timeline.closest('.timeline-section') || timeline;
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
    viewObserver.observe(timelineSection);

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
      const rect = timeline.getBoundingClientRect();

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

      const itemsList = timeline.querySelectorAll('.timeline__item');
      let nearMilestone = false;

      itemsList.forEach(item => {
        const marker = item.querySelector('.timeline__marker') || item;
        const dotY = item.offsetTop + (marker.offsetHeight / 2 || 25);
        const diff = Math.abs(currentY - dotY);

        if (diff < 20) {
          nearMilestone = true;
          item.classList.add('is-bloomed');
        } else {
          item.classList.remove('is-bloomed');
        }

        if (currentY >= dotY - 6) {
          item.classList.add('is-passed');
        } else {
          item.classList.remove('is-passed');
        }
      });

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
  connect();
  const root = document.querySelector('#app');
  if (root) new MutationObserver(connect).observe(root, { childList: true });
})();
