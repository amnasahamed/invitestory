(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const observed = new WeakSet();
  const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      observer.unobserve(target);
      target.classList.add('olive-v3-entered');
      if (reduced.matches) return;
      target.querySelectorAll('.h2, .ev').forEach((element, index) => {
        element.animate?.([{ translate: '0 13px' }, { translate: '0 0' }], {
          duration: 700, delay: Math.min(index * 85, 300), easing: 'cubic-bezier(.22,1,.36,1)'
        });
      });
    });
  }, { threshold: .12 }) : null;
  function enhance() {
    document.querySelectorAll('.sec').forEach(section => {
      if (observed.has(section)) return;
      observed.add(section);
      const art = document.createElement('span');
      art.className = 'olive-v3-art';
      art.setAttribute('aria-hidden', 'true');
      section.prepend(art);
      observer?.observe(section);
    });
    initTimelineFloral();
  }

  /* --- Olive Celebrations Floral Scroll Flow & Ease Animation --- */
  let timelineFloralInitialized = false;
  function initTimelineFloral() {
    if (timelineFloralInitialized) return;
    const arch = document.querySelector('.evsec .arch') || document.querySelector('.arch');
    if (!arch) return;

    const events = arch.querySelectorAll('.ev');
    if (!events || events.length === 0) return;

    if (arch.querySelector('.timeline-floral-cursor')) return;
    timelineFloralInitialized = true;

    const progressEl = document.createElement('div');
    progressEl.className = 'timeline-floral-progress';
    progressEl.setAttribute('aria-hidden', 'true');
    arch.prepend(progressEl);

    const cursorEl = document.createElement('div');
    cursorEl.className = 'timeline-floral-cursor';
    cursorEl.setAttribute('aria-hidden', 'true');
    cursorEl.innerHTML = `
      <div class="timeline-floral-aura"></div>
      <div class="timeline-floral-wrapper">
        <img src="assets/images/timeline-floral.svg" alt="" class="timeline-floral-img" />
      </div>
    `;
    arch.appendChild(cursorEl);

    const wrapperEl = cursorEl.querySelector('.timeline-floral-wrapper');

    let lineX = 28;
    let firstDotY = 80;
    let lastDotY = 80;
    let distance = 1;
    let inView = false;

    function measure() {
      const evList = arch.querySelectorAll('.ev');
      if (!evList.length) return;
      const firstEv = evList[0];
      const lastEv = evList[evList.length - 1];

      const isMobile = window.innerWidth <= 480;
      lineX = isMobile ? 20 : 28;
      cursorEl.style.left = lineX + 'px';
      progressEl.style.left = lineX + 'px';

      firstDotY = firstEv.offsetTop + 20;
      lastDotY = lastEv.offsetTop + lastEv.offsetHeight - 20;
      distance = Math.max(1, lastDotY - firstDotY);
    }

    measure();
    window.addEventListener('resize', measure, { passive: true });

    const evSec = arch.closest('.evsec') || arch;
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
    viewObserver.observe(evSec);

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
      const rect = arch.getBoundingClientRect();

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

      const evList = arch.querySelectorAll('.ev');
      let nearMilestone = false;

      evList.forEach(ev => {
        const dotY = ev.offsetTop + ev.offsetHeight / 2;
        const diff = Math.abs(currentY - dotY);

        if (diff < ev.offsetHeight * 0.4) {
          nearMilestone = true;
          ev.classList.add('is-bloomed');
        } else {
          ev.classList.remove('is-bloomed');
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
  let scheduled = false;
  new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; enhance(); });
  }).observe(document.body, { childList: true, subtree: true });
  enhance();
})();
