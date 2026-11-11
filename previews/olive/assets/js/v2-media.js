/* Keep V2 artwork URLs explicit, including images rendered by the legacy app. */
(() => {
  const names = new Set(['banquet', 'chandelier', 'greenery', 'urn', 'sprig', 'divider']);
  const upgrade = image => {
    const source = image.getAttribute('src') || '';
    const match = source.match(/^(.*\/images\/)([a-z]+)\.webp(?:\?.*)?$/);
    if (match && names.has(match[2])) image.setAttribute('src', `${match[1]}${match[2]}-v2.webp`);
  };
  const scan = node => {
    if (node.nodeType !== 1) return;
    if (node.tagName === 'IMG') upgrade(node);
    node.querySelectorAll('img').forEach(upgrade);
  };
  const observer = new MutationObserver(records => records.forEach(record => {
    if (record.type === 'attributes') upgrade(record.target);
    else record.addedNodes.forEach(scan);
  }));
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
  document.querySelectorAll('img').forEach(upgrade);
})();
