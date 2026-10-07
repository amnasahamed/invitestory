import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';

const source = readFileSync(new URL('../scripts.js', import.meta.url), 'utf8');
const manifest = JSON.parse(readFileSync(new URL('../previews/manifest.json', import.meta.url), 'utf8'));

test('all 35 catalogue previews resolve to existing local entry points', () => {
  const urls = [...source.matchAll(/localDemoUrl: "([^"]+)"/g)].map(match => match[1]);
  assert.equal(urls.length, 35);
  assert.equal(new Set(urls).size, 35);
  assert.equal(manifest.designs.length, 35);
  for (const design of manifest.designs) {
    assert.ok(urls.includes(design.url), `manifest mismatch: ${design.name}`);
    assert.ok(design.url.startsWith('/previews/') || design.url.startsWith('/dearly/'));
    const path = design.url.split('?')[0].replace(/^\//, '');
    assert.ok(existsSync(new URL(`../${path}index.html`, import.meta.url)), `missing ${design.name}`);
  }
});

test('shared font URLs reference existing immutable content files', () => {
  const summary = JSON.parse(readFileSync(new URL('../docs/preview-import-summary.json', import.meta.url), 'utf8'));
  let sharedReferences = 0;
  for (const report of summary.templates) {
    for (const path of Object.keys(report.originalFileHashes).filter(path => path.endsWith('.css'))) {
      const css = readFileSync(new URL(`../previews/${report.slug}/${path}`, import.meta.url), 'utf8');
      for (const match of css.matchAll(/\/previews\/_shared\/([a-f0-9]{24}\.[a-z0-9]+)/g)) {
        sharedReferences++;
        assert.ok(existsSync(new URL(`../previews/_shared/${match[1]}`, import.meta.url)), `missing ${match[1]}`);
      }
    }
  }
  assert.ok(sharedReferences > 0);
});
