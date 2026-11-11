/* Quiet cinematic emphasis with no persistent hidden or transformed content. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const seen = new WeakSet();
  const observer = new IntersectionObserver(entries => entries.forEach(({target, isIntersecting}) => {
    if (!isIntersecting) return;
    target.classList.add('v3-entered');
    if (!reduced.matches) target.querySelector('h2')?.animate(
      [{ opacity: .78, filter: 'blur(1px)' }, { opacity: 1, filter: 'blur(0)' }],
      { duration: 1100, easing: 'cubic-bezier(.22,1,.36,1)' }
    );
    observer.unobserve(target);
  }), { threshold: .12 });
  function connect() {
    const emptyInterlude = document.querySelector('[data-quran]')?.closest('section');
    if (emptyInterlude && !emptyInterlude.textContent.trim() && !emptyInterlude.querySelector('img,video,button,a,form')) {
      emptyInterlude.hidden = true;
      emptyInterlude.style.display = 'none';
    }
    const rsvpBox = document.querySelector('#rsvpBox');
    if (rsvpBox) {
      const rsvpSection = rsvpBox.closest('section') || rsvpBox;
      rsvpSection.hidden = true;
      rsvpSection.style.display = 'none';
    }
    const cover = document.querySelector('#coverCard');
    if (cover && !cover.querySelector('.v3-opening-cue')) {
      cover.setAttribute('role', 'button');
      cover.setAttribute('tabindex', '0');
      cover.setAttribute('aria-label', 'Open wedding invitation');
      const cue = document.createElement('span');
      cue.className = 'v3-opening-cue';
      cue.textContent = 'Tap to open';
      cue.setAttribute('aria-hidden', 'true');
      cover.append(cue);
      cover.addEventListener('click', () => cover.classList.add('v5-opening-active'), { once:true });
      cover.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          cover.click();
        }
      });
    }
    document.querySelectorAll('.t049 section:not(.rs-hero)').forEach(section => {
      if (seen.has(section)) return;
      seen.add(section); section.classList.add('v3-section'); observer.observe(section);
    });
    initTimelineFloral();
  }

  /* --- Raat Rani Timeline Floral Scroll Flow & Ease Animation --- */
  let timelineFloralInitialized = false;
  function initTimelineFloral() {
    if (timelineFloralInitialized) return;
    const timeEl = document.querySelector('.rs-time');
    if (!timeEl) return;
    const section = timeEl.closest('section');
    if (!section) return;

    const times = section.querySelectorAll('.rs-time');
    if (!times || times.length === 0) return;

    if (section.querySelector('.timeline-floral-cursor')) return;
    timelineFloralInitialized = true;

    // Mark step rows for milestone styling
    times.forEach(t => {
      const row = t.parentElement;
      if (row) row.classList.add('rs-step-row');
    });

    const progressEl = document.createElement('div');
    progressEl.className = 'timeline-floral-progress';
    progressEl.setAttribute('aria-hidden', 'true');
    section.prepend(progressEl);

    const cursorEl = document.createElement('div');
    cursorEl.className = 'timeline-floral-cursor';
    cursorEl.setAttribute('aria-hidden', 'true');
    cursorEl.innerHTML = `
      <div class="timeline-floral-aura"></div>
      <div class="timeline-floral-wrapper">
        <img src="assets/images/timeline-floral.svg" alt="" class="timeline-floral-img" />
      </div>
    `;
    section.appendChild(cursorEl);

    const wrapperEl = cursorEl.querySelector('.timeline-floral-wrapper');

    let lineX = 0;
    let firstDotY = 0;
    let lastDotY = 0;
    let distance = 1;
    let inView = false;

    function measure() {
      const timesList = section.querySelectorAll('.rs-time');
      if (!timesList.length) return;
      const firstTime = timesList[0];
      const lastTime = timesList[timesList.length - 1];

      const secRect = section.getBoundingClientRect();
      const firstDot = firstTime.nextElementSibling || firstTime;
      const lastDot = lastTime.nextElementSibling || lastTime;

      const firstDotRect = firstDot.getBoundingClientRect();
      const lastDotRect = lastDot.getBoundingClientRect();

      lineX = firstDotRect.left - secRect.left + (firstDotRect.width / 2);
      cursorEl.style.left = lineX + 'px';
      progressEl.style.left = lineX + 'px';

      firstDotY = firstDotRect.top - secRect.top + (firstDotRect.height / 2);
      lastDotY = lastDotRect.top - secRect.top + (lastDotRect.height / 2);
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
    viewObserver.observe(section);

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
      const rect = section.getBoundingClientRect();

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

      const secRect = section.getBoundingClientRect();
      const rows = section.querySelectorAll('.rs-step-row');
      let nearMilestone = false;

      rows.forEach(row => {
        const rowRect = row.getBoundingClientRect();
        const dotY = rowRect.top - secRect.top + (rowRect.height / 2);
        const diff = Math.abs(currentY - dotY);

        if (diff < 18) {
          nearMilestone = true;
          row.classList.add('is-bloomed');
        } else {
          row.classList.remove('is-bloomed');
        }

        if (currentY >= dotY - 6) {
          row.classList.add('is-passed');
        } else {
          row.classList.remove('is-passed');
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
  if (root) new MutationObserver(connect).observe(root, { childList: true, subtree: true });
})();
