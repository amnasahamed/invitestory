// Adds a short reference code to every WhatsApp message the site opens, e.g.
// "Ref: IS7K2QX", and identifies the visitor in PostHog as wa_IS7K2QX.
// The staff portal reads the code from the first message and reports the chat
// and the paid order to PostHog under the same id, so WhatsApp sales are
// attributed to the website visit (source, ad, design) that produced them.
// No personal data is sent: the code is random and stored only in this browser.
(() => {
  const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  const KEY = 'ist_wa_ref';
  const WA_HOSTS = ['wa.me', 'api.whatsapp.com'];
  const HAS_REF = /(?:^|[\s(\[])ref\s*[:#-]?\s*IS[2-9A-HJ-NP-Z]{5}(?![A-Za-z0-9])/i;
  let ref = '';

  function newRef() {
    const bytes = new Uint8Array(5);
    crypto.getRandomValues(bytes);
    return 'IS' + Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
  }

  function getRef() {
    if (ref) return ref;
    try { ref = localStorage.getItem(KEY) || ''; } catch (_) { ref = ''; }
    if (!/^IS[2-9A-HJ-NP-Z]{5}$/.test(ref)) {
      ref = newRef();
      try { localStorage.setItem(KEY, ref); } catch (_) { /* private mode: one code per page view */ }
    }
    return ref;
  }

  function identify(code) {
    try {
      const ph = window.posthog;
      if (!ph || typeof ph.identify !== 'function') return;
      const id = 'wa_' + code;
      if (typeof ph.get_distinct_id === 'function' && ph.get_distinct_id() === id) return;
      ph.identify(id);
    } catch (_) { /* analytics must never block WhatsApp */ }
  }

  /** Returns the URL with the reference added to its prefilled text, or the URL unchanged. */
  function tag(href) {
    try {
      const url = new URL(String(href), location.href);
      if (!WA_HOSTS.includes(url.hostname)) return href;
      const text = url.searchParams.get('text') || '';
      if (HAS_REF.test(text)) return href;
      const code = getRef();
      const line = 'Ref: ' + code;
      // Keep a trailing "PREVIEW <token>" line last: the portal reads it from the end.
      const preview = text.match(/\nPREVIEW [a-f0-9]{24}$/i);
      const tagged = preview
        ? text.slice(0, preview.index) + '\n' + line + preview[0]
        : (text ? text.replace(/\s+$/, '') + '\n\n' : '') + line;
      url.searchParams.set('text', tagged);
      identify(code);
      return url.toString();
    } catch (_) {
      return href;
    }
  }

  window.InviteStoryWhatsAppRef = { tag, getRef };
  if (['localhost', '127.0.0.1', '::1', '[::1]'].includes(location.hostname)) return;

  // Links: rewrite just before the browser follows them (capture phase runs first).
  const onActivate = (event) => {
    const link = event.target && event.target.closest ? event.target.closest('a[href]') : null;
    if (!link) return;
    const next = tag(link.href);
    if (next !== link.href) link.href = next;
  };
  document.addEventListener('click', onActivate, true);
  document.addEventListener('auxclick', onActivate, true);

  // Buttons that open WhatsApp with window.open(...).
  const open = window.open;
  window.open = function (url, ...rest) {
    return open.call(this, url == null ? url : tag(url), ...rest);
  };
})();
