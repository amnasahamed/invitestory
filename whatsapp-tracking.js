// Standalone pages do not load the catalogue's conversion tracker.
// Capture only fixed placement metadata, never link text, URLs or order details.
(() => {
  const pages = {
    '/dearly': 'dearly', '/dearly/': 'dearly', '/dearly.html': 'dearly',
    '/blog': 'blog', '/blog/': 'blog', '/blog/index.html': 'blog',
    '/privacy-policy': 'privacy_policy', '/privacy-policy.html': 'privacy_policy',
    '/terms': 'terms', '/terms.html': 'terms',
    '/refund-and-editing-policy': 'refund_policy', '/refund-and-editing-policy.html': 'refund_policy',
    '/thank-you': 'thank_you', '/thank-you.html': 'thank_you'
  };
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    try {
      if (new URL(link.href).hostname !== 'wa.me') return;
      if (['localhost', '127.0.0.1', '::1', '[::1]'].includes(window.location.hostname)) return;
      const page = pages[window.location.pathname];
      if (!page) return;
      const placement = link.id === 'ty-wa-btn' ? 'order_summary'
        : link.closest('header') ? 'header'
        : link.closest('footer') ? 'footer'
        : link.classList.contains('floating-wa') ? 'floating_button' : 'page_link';
      window.posthog?.capture('whatsapp_cta_clicked', {
        source_event: 'whatsapp_click', destination: 'whatsapp',
        cta_location: `${page}_${placement}`
      });
    } catch (_) {
      // Analytics must never prevent WhatsApp navigation.
    }
  }, { passive: true });
})();
