import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const htmlFiles = ['index.html', 'digital-wedding-invitations.html', 'dearly.html', 'thank-you.html'];
const read = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

test('each tracked page loads the new GTM container exactly once in head and once as noscript fallback', () => {
  for (const file of htmlFiles) {
    const source = read(file);
    assert.equal((source.match(/GTM-TPHKX2M9/g) || []).length, 2, file);
    assert.equal((source.match(/googletagmanager\.com\/gtm\.js\?id=/g) || []).length, 1, file);
    assert.equal((source.match(/googletagmanager\.com\/ns\.html\?id=GTM-TPHKX2M9/g) || []).length, 1, file);
    assert.doesNotMatch(source, /GTM-5G245BWJ/, file);
  }
});

test('website code contains no direct Google Ads conversion call or legacy Ads configuration', () => {
  const source = [...htmlFiles.map(read), read('scripts.js')].join('\n');
  assert.doesNotMatch(source, /GOOGLE_ADS_(?:ID|CONVERSION_LABEL|PURCHASE_LABEL|WHATSAPP_LABEL)/);
  assert.doesNotMatch(source, /gtag\s*\(\s*["']event["']\s*,\s*["']conversion["']/);
});

test('conversion data-layer events contain only the approved fields', () => {
  const source = read('scripts.js');
  assert.match(source, /pushDataLayerEvent\(\{\s*event:\s*["']whatsapp_click["']\s*\}\)/);
  assert.match(source, /event:\s*["']payment_success["'],\s*payment_value:\s*value,\s*transaction_id:\s*verified\.transactionId/);
});
