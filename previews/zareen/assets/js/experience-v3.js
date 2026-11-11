(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  document.addEventListener('pointerdown', event => {
    const control = event.target.closest('button,a');
    if (!control || reduced.matches) return;
    control.classList.add('v3-pressed');
    const clear = () => control.classList.remove('v3-pressed');
    window.addEventListener('pointerup', clear, {once:true});
    window.addEventListener('pointercancel', clear, {once:true});
    setTimeout(clear,500);
  }, {passive:true});
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    entry.target.classList.toggle('v3-floral-visible', entry.isIntersecting && !reduced.matches);
  }), {threshold:.05});
  const seen = new WeakSet();
  const attach = () => {
    document.querySelectorAll('#main [data-section]').forEach(section => {
      if (!seen.has(section)) {seen.add(section);observer.observe(section);}
    });
    initTimelineFloral();
  };

  /* --- Zareen / Noor Mahal Celebration Floral Scroll Flow & Ease Animation --- */
  let timelineFloralInitialized = false;
  function initTimelineFloral() {
    if (timelineFloralInitialized) return;
    const celebrationSec = document.querySelector('[data-section="celebration"]');
    if (!celebrationSec) return;

    const cards = celebrationSec.querySelectorAll(':scope > div > div:last-child > div');
    if (!cards || cards.length === 0) return;

    if (celebrationSec.querySelector('.timeline-floral-cursor')) return;
    timelineFloralInitialized = true;

    const progressEl = document.createElement('div');
    progressEl.className = 'timeline-floral-progress';
    progressEl.setAttribute('aria-hidden', 'true');
    celebrationSec.prepend(progressEl);

    const cursorEl = document.createElement('div');
    cursorEl.className = 'timeline-floral-cursor';
    cursorEl.setAttribute('aria-hidden', 'true');
    cursorEl.innerHTML = `
      <div class="timeline-floral-aura"></div>
      <div class="timeline-floral-wrapper">
        <img src="assets/images/timeline-floral.svg" alt="" class="timeline-floral-img" />
      </div>
    `;
    celebrationSec.appendChild(cursorEl);

    const wrapperEl = cursorEl.querySelector('.timeline-floral-wrapper');

    let lineX = 28;
    let firstDotY = 60;
    let lastDotY = 60;
    let distance = 1;
    let inView = false;

    function measure() {
      const cardList = celebrationSec.querySelectorAll(':scope > div > div:last-child > div');
      if (!cardList.length) return;
      const firstCard = cardList[0];
      const lastCard = cardList[cardList.length - 1];

      const isMobile = window.innerWidth <= 480;
      lineX = isMobile ? 20 : 28;
      cursorEl.style.left = lineX + 'px';
      progressEl.style.left = lineX + 'px';

      firstDotY = firstCard.offsetTop + 20;
      lastDotY = lastCard.offsetTop + lastCard.offsetHeight - 20;
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
    viewObserver.observe(celebrationSec);

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
      const rect = celebrationSec.getBoundingClientRect();

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

      const cardList = celebrationSec.querySelectorAll(':scope > div > div:last-child > div');
      let nearMilestone = false;

      cardList.forEach(card => {
        const dotY = card.offsetTop + card.offsetHeight / 2;
        const diff = Math.abs(currentY - dotY);

        if (diff < card.offsetHeight * 0.4) {
          nearMilestone = true;
          card.classList.add('is-bloomed');
        } else {
          card.classList.remove('is-bloomed');
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
  new MutationObserver(attach).observe(document.querySelector('#app'),{childList:true,subtree:true});
  attach();
})();
