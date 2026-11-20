import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { webcrypto } from 'node:crypto';

const source = readFileSync(new URL('../whatsapp-ref.js', import.meta.url), 'utf8');

function setup({ hostname = 'www.invitestory.in', stored = null, distinctId = 'anon-1' } = {}) {
  const listeners = {};
  const store = new Map(stored ? [['ist_wa_ref', stored]] : []);
  const identified = [];
  const opened = [];
  const window = {
    open: (url) => { opened.push(url); return null; },
    posthog: { identify: (id) => identified.push(id), get_distinct_id: () => distinctId },
  };
  vm.runInNewContext(source, {
    URL, crypto: webcrypto, window,
    location: { href: `https://${hostname}/`, hostname },
    localStorage: { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) },
    document: { addEventListener: (name, fn) => { listeners[name] = fn; } },
  });
  const click = (link) => listeners.click({ target: { closest: () => link } });
  return { window, identified, opened, store, click, listeners };
}
const textOf = (href) => new URL(href).searchParams.get('text');

test('appends one reference code to the prefilled message and identifies the visitor', () => {
  const s = setup();
  const link = { href: 'https://wa.me/918281583882?text=Hi%20InviteStory%21' };
  s.click(link);
  const text = textOf(link.href);
  assert.match(text, /^Hi InviteStory!\n\nRef: IS[2-9A-HJ-NP-Z]{5}$/);
  const code = text.split('Ref: ')[1];
  assert.equal(s.store.get('ist_wa_ref'), code);
  assert.deepEqual(s.identified, [`wa_${code}`]);
  s.click(link);
  assert.equal(textOf(link.href), text, 'never tagged twice');
});

test('reuses the stored code, also for window.open buttons, and skips identify when already identified', () => {
  const s = setup({ stored: 'IS7K2QX', distinctId: 'wa_IS7K2QX' });
  s.window.open('https://wa.me/918281583882?text=' + encodeURIComponent('Hi, Luxury please'), '_blank');
  assert.equal(textOf(s.opened[0]), 'Hi, Luxury please\n\nRef: IS7K2QX');
  assert.deepEqual(s.identified, []);
});

test('keeps the PREVIEW token as the last line for the portal', () => {
  const s = setup({ stored: 'IS7K2QX' });
  const link = { href: 'https://wa.me/918281583882?text=' + encodeURIComponent('Please send my saved InviteStory preview.\nPREVIEW 0123456789abcdef01234567') };
  s.click(link);
  assert.equal(textOf(link.href), 'Please send my saved InviteStory preview.\nRef: IS7K2QX\nPREVIEW 0123456789abcdef01234567');
});

test('leaves other links, empty messages and local hosts alone', () => {
  const s = setup({ stored: 'IS7K2QX' });
  const other = { href: 'https://example.com/?text=hi' };
  s.click(other);
  assert.equal(other.href, 'https://example.com/?text=hi');
  const bare = { href: 'https://wa.me/918281583882' };
  s.click(bare);
  assert.equal(textOf(bare.href), 'Ref: IS7K2QX');
  const local = setup({ hostname: 'localhost' });
  assert.equal(local.listeners.click, undefined);
  local.window.open('https://wa.me/1?text=x');
  assert.equal(local.opened[0], 'https://wa.me/1?text=x');
});

test('a broken analytics SDK never blocks WhatsApp', () => {
  const s = setup();
  s.window.posthog.identify = () => { throw new Error('sdk down'); };
  const link = { href: 'https://wa.me/918281583882?text=Hi' };
  assert.doesNotThrow(() => s.click(link));
  assert.match(textOf(link.href), /Ref: IS/);
});
