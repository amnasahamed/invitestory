/* Keep visual section treatments tied to configuration keys, not positions. */
(() => {
  const tagSections = () => {
    const main = document.querySelector('#main');
    if (!main || !main.children.length) return;
    const keys = window.LAGO_CONFIG.sections.filter(key => window.LAGO_CONFIG[key]);
    [...main.children].forEach((section, index) => {
      if (keys[index]) section.dataset.section = keys[index];
    });
    const wish = main.querySelector('[data-section="dua"] [lang="ar"]');
    if (wish && window.LAGO_CONFIG.dua.script && !/[\u0600-\u06ff]/.test(window.LAGO_CONFIG.dua.script)) {
      wish.lang = 'en';
      wish.dir = 'ltr';
      wish.style.fontFamily = '"cormorant", Georgia, serif';
      wish.style.whiteSpace = 'normal';
    }
  };
  new MutationObserver(tagSections).observe(document.querySelector('#app'), {
    childList: true,
    subtree: true,
  });
  tagSections();
})();
