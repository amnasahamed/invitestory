(() => {
  const mark = () => document.querySelectorAll('.sec').forEach(section => {
    if (section.querySelector('form')) section.classList.add('olive-v4-form');
  });
  let pending = false;
  new MutationObserver(() => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; mark(); });
  }).observe(document.body, { childList:true, subtree:true });
  mark();
})();
