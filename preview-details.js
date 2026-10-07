/* Mobile viewer focus mode keeps the invitation mounted and playing. */
(() => {
  const modal = document.getElementById('preview-modal');
  const toggle = document.getElementById('preview-details-toggle');
  if (!modal || !toggle) return;
  const mobile = window.matchMedia('(max-width: 760px)');
  let collapsed = false;
  function render() {
    const hidden = mobile.matches && collapsed;
    modal.classList.toggle('is-details-hidden', hidden);
    toggle.textContent = hidden ? 'Show details' : 'Hide details';
    toggle.setAttribute('aria-expanded', String(!hidden));
    if (typeof schedulePreviewScale === 'function') schedulePreviewScale();
  }
  toggle.addEventListener('click', () => {
    collapsed = !collapsed;
    render();
  });
  mobile.addEventListener('change', render);
  new MutationObserver(() => {
    if (!modal.classList.contains('is-open') && collapsed) {
      collapsed = false;
      render();
    }
  }).observe(modal, {attributes: true, attributeFilter: ['class']});
  render();
})();
