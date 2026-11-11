/* Versioned delivery for botanicals emitted by the original template renderer. */
(() => {
  const names = new Set(['cluster', 'garland-left', 'garland-band', 'sprig', 'divider', 'extra2', 'extra3', 'extra4', 'flower']);
  const upgrade = (image) => {
    const source = image.getAttribute('src') || '';
    const match = source.match(/^(.*\/)([^/]+)\.webp(?:\?.*)?$/);
    if (match && names.has(match[2])) image.setAttribute('src', `${match[1]}${match[2]}-v2.webp`);
  };
  const scan = (node) => {
    if (!(node instanceof Element)) return;
    if (node.matches('img')) upgrade(node);
    node.querySelectorAll('img').forEach(upgrade);
  };
  new MutationObserver(records => {
    records.forEach(record => {
      if (record.type === 'attributes') upgrade(record.target);
      else record.addedNodes.forEach(scan);
    });
  }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
  scan(document.documentElement);
})();
