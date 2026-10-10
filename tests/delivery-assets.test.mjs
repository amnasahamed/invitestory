import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Keep new HTML from reusing cached pre-contract code across the checkout boundary.
test('checkout pages reference one coordinated delivery asset revision', () => {
  const revision = '20261010-delivery-bridge-2';
  const expected = {
    'index.html': ['scripts.js', 'sales.js', 'interactions.js', 'website-integration.js', 'paid-order.js', 'sales.css'],
    'digital-wedding-invitations.html': ['scripts.js', 'sales.js', 'website-integration.js', 'paid-order.js', 'sales.css'],
    'thank-you.html': ['paid-order.js'],
  };
  for (const [page, assets] of Object.entries(expected)) {
    const html = readFileSync(new URL(`../${page}`, import.meta.url), 'utf8');
    for (const asset of assets) {
      const matches = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
        .map(match => match[1]).filter(url => url.split('?')[0] === asset);
      assert.deepEqual(matches, [`${asset}?v=${revision}`], `${page}: ${asset}`);
    }
  }
});
