/* Progressive motion: content stays visible even if this script cannot run. */
(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const buttons = 'button, .event-btn, .venue-map-button, .calendar-cta';
  const press = event => {
    const target = event.target.closest(buttons);
    if (target) target.classList.add('v3-pressed');
  };
  const release = () => document.querySelectorAll('.v3-pressed').forEach(e => e.classList.remove('v3-pressed'));
  document.addEventListener('pointerdown', press);
  document.addEventListener('pointerup', release);
  document.addEventListener('pointercancel', release);
  document.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') press(event);
  });
  document.addEventListener('keyup', release);
  window.addEventListener('blur', release);
  const observed = new WeakSet();
  const decorations = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle('is-inview', entry.isIntersecting));
  }, { threshold: 0 });
  const reveal = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      reveal.unobserve(entry.target);
      if (!motion.matches && entry.target.animate) {
        entry.target.animate([
          { opacity: .45, transform: 'translateY(14px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 720, delay: Number(entry.target.dataset.v3Delay || 0),
          easing: 'cubic-bezier(.2,.7,.25,1)', fill: 'backwards' });
      }
    });
  }, { threshold: .12 });
  function enhance() {
    document.querySelectorAll('.welcome-section, .gifts-section').forEach(section => {
      if (section.querySelector('.v3-botanical')) return;
      const ornament = document.createElement('span');
      ornament.className = 'v3-botanical';
      ornament.setAttribute('aria-hidden', 'true');
      section.prepend(ornament);
      decorations.observe(ornament);
    });
    document.querySelectorAll('.section-heading, .welcome-copy, .gallery-frame, .timeline article, .event-list article, .dress-copy, .gift-copy, .closing-arch').forEach(element => {
      if (observed.has(element)) return;
      observed.add(element);
      const siblings = element.parentElement.children;
      element.dataset.v3Delay = String(Math.min(Array.prototype.indexOf.call(siblings, element) * 65, 260));
      reveal.observe(element);
    });
    initTimelineFloral();
  }

  /* --- Ruby Timeline Floral Scroll Flow & Ease Animation --- */
  let timelineFloralInitialized = false;
  function initTimelineFloral() {
    if (timelineFloralInitialized) return;
    const timeline = document.getElementById('programTimeline');
    if (!timeline) return;

    const articles = timeline.querySelectorAll('article');
    if (!articles || articles.length === 0) return; // Wait until populated

    if (timeline.querySelector('.timeline-floral-cursor')) return;
    timelineFloralInitialized = true;

    // Glowing ruby/golden progress track that trails the floral
    const progressEl = document.createElement('div');
    progressEl.className = 'timeline-floral-progress';
    progressEl.setAttribute('aria-hidden', 'true');
    timeline.prepend(progressEl);

    // Floating Floral Follower
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

    let lineX = 104;
    let firstDotY = 24;
    let lastDotY = 24;
    let distance = 1;
    let inView = false;

    function measure() {
      const arts = timeline.querySelectorAll('article');
      if (!arts.length) return;
      const firstArt = arts[0];
      const lastArt = arts[arts.length - 1];

      const isMobile = window.innerWidth <= 600;
      lineX = isMobile ? 86 : 104;
      cursorEl.style.left = lineX + 'px';
      progressEl.style.left = lineX + 'px';

      firstDotY = firstArt.offsetTop + 28;
      lastDotY = lastArt.offsetTop + 28;
      distance = Math.max(1, lastDotY - firstDotY);
    }

    measure();
    window.addEventListener('resize', measure, { passive: true });

    // Activate/deactivate only when the celebration section is visible
    const programSection = timeline.closest('.program-section') || timeline;
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
    viewObserver.observe(programSection);

    // State for smooth lerp physics
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

      // Velocity adds kinetic energy to floral bloom
      scrollVelocity = Math.min(scrollVelocity + delta * 0.12, 10);

      const winH = window.innerHeight;
      const rect = timeline.getBoundingClientRect();

      // Viewport trigger window for celebration flow
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
      // Velocity decay towards rest
      scrollVelocity *= 0.88;
      if (scrollVelocity < 0.01) scrollVelocity = 0;

      // Silky smooth position easing
      currentY += (targetY - currentY) * 0.12;

      // Trailing ruby line
      const progressHeight = Math.max(0, currentY - firstDotY);
      progressEl.style.top = firstDotY + 'px';
      progressEl.style.height = progressHeight + 'px';

      // Check waypoint milestone proximity
      const arts = timeline.querySelectorAll('article');
      let nearMilestone = false;

      arts.forEach(art => {
        const dotY = art.offsetTop + 28;
        const diff = Math.abs(currentY - dotY);

        if (diff < 18) {
          nearMilestone = true;
          art.classList.add('is-bloomed');
        } else {
          art.classList.remove('is-bloomed');
        }

        if (currentY >= dotY - 6) {
          art.classList.add('is-passed');
        } else {
          art.classList.remove('is-passed');
        }
      });

      // Floral Scale: increases size during scroll & waypoint crossings, decreases as scrolling rests
      const motionBoost = Math.min(0.45, scrollVelocity * 0.05);
      const milestoneBoost = nearMilestone ? 0.35 : 0;
      targetScale = 0.78 + motionBoost + milestoneBoost;
      currentScale += (targetScale - currentScale) * 0.1;

      // Rotational ease
      targetRot = (currentY - firstDotY) * 0.26 + (scrollVelocity * 1.6);
      currentRot += (targetRot - currentRot) * 0.08;

      // Apply transforms
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
  const observer = new MutationObserver(enhance);
  observer.observe(document.querySelector('main') || document.body, { childList: true, subtree: true });
  enhance();
})();
