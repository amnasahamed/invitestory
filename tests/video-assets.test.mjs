import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { serveVideoAsset, videoAssetSizes } from '../video-assets.js';
import worker from '../_worker.js';

const bytes = Uint8Array.from({ length: 16 }, (_, i) => i);
function fixture(status = 200) {
  let cancelled = false;
  let completed = false;
  return {
    get cancelled() { return cancelled; },
    get completed() { return completed; },
    async fetch(request) {
      assert.equal(request.headers.get('Range'), null);
      assert.equal(request.headers.get('If-Range'), null);
      if (status !== 200) return new Response(null, { status });
      let offset = 0;
      const body = request.method === 'HEAD' ? null : new ReadableStream({
        pull(c) { if (offset === bytes.length) { completed = true; return c.close(); } c.enqueue(bytes.slice(offset, offset += 4)); },
        cancel() { cancelled = true; },
      });
      return new Response(body, { headers: { 'Content-Type': 'video/mp4', ETag: '"film"', 'Cache-Control': 'public, max-age=31536000, immutable' } });
    },
  };
}
const request = (range, extra = {}) => new Request('https://invitestory.in/assets/video/fixture.mp4', { ...extra, headers: { ...(range ? { Range: range } : {}), ...extra.headers } });

test('video byte ranges cross chunk boundaries and support suffixes, open ends and capped ends', async () => {
  for (const [range, start, end] of [['bytes=0-1',0,1],['bytes=3-9',3,9],['bytes=12-',12,15],['bytes=-5',11,15],['bytes=-100',0,15],['bytes=14-999',14,15]]) {
    const assets = fixture();
    const response = await serveVideoAsset(request(range), assets, bytes.length);
    assert.equal(response.status, 206);
    assert.equal(response.headers.get('Content-Range'), `bytes ${start}-${end}/16`);
    assert.equal(response.headers.get('Content-Length'), String(end-start+1));
    assert.equal(response.headers.get('Accept-Ranges'), 'bytes');
    assert.deepEqual(new Uint8Array(await response.arrayBuffer()), bytes.slice(start,end+1));
    assert(assets.cancelled || assets.completed);
  }
});
test('unsatisfiable ranges are empty 416 responses and release the source', async () => {
  for (const range of ['bytes=16-','bytes=9-2','bytes=-0']) {
    const assets = fixture();const r = await serveVideoAsset(request(range), assets, 16);
    assert.equal(r.status,416);assert.equal(r.headers.get('Content-Range'),'bytes */16');assert.equal(await r.text(),'');assert(assets.cancelled);
  }
});
test('HEAD, validators, normal requests and missing assets retain correct semantics', async () => {
  const head = await serveVideoAsset(request('bytes=3-7',{method:'HEAD'}),fixture(),16);
  assert.equal(head.status,206);assert.equal(await head.text(),'');assert.equal(head.headers.get('Content-Length'),'5');
  for (const [range,validator,status] of [[undefined,undefined,200],['items=1-2',undefined,200],['bytes=0-1,4-5',undefined,200],['bytes=0-1','"old"',200],['bytes=0-1','W/"film"',200],['bytes=0-1','"film"',206]]) {
    const r=await serveVideoAsset(request(range,{headers:validator?{'If-Range':validator}:{}}),fixture(),16);assert.equal(r.status,status);assert.equal((await r.arrayBuffer()).byteLength,status===200?16:2);
  }
  assert.equal((await serveVideoAsset(request('bytes=0-1'),fixture(404),16)).status,404);
  assert.equal((await serveVideoAsset(request('bytes=0-1'),fixture(304),16)).status,304);
});
test('shipped video sizes and Worker routing match the real deployment assets', async () => {
  const config=JSON.parse(readFileSync(new URL('../wrangler.jsonc',import.meta.url),'utf8'));
  assert(config.assets.run_worker_first.includes('/assets/video/*.mp4'));
  for (const [path,size] of Object.entries(videoAssetSizes)) {
    assert.equal(statSync(new URL(`..${path}`,import.meta.url)).size,size);
    const r=await worker.fetch(new Request(`https://invitestory.in${path}`,{headers:{Range:'bytes=0-1'}}),{ASSETS:fixture()});
    assert.equal(r.status,206);assert.deepEqual(new Uint8Array(await r.arrayBuffer()),bytes.slice(0,2));
  }
});
