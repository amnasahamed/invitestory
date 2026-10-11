import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import worker from '../_worker.js';
const calls=[];
const env={ASSETS:{async fetch(request){
 const path=new URL(request.url).pathname;
 calls.push(path);
 const filename=path==='/'?'index.html':path.slice(1);
 try{return new Response(readFileSync(new URL(`../${filename}`,import.meta.url),'utf8'),{headers:{'content-type':'text/html'}});}catch{return new Response('Not found',{status:404});}
}}};
test('production aliases serve the intended pages through the asset binding',async()=>{
 for(const [path,expected] of [['/dearly','/dearly.html'],['/dearly/','/dearly.html'],['/digital-wedding-invitations','/digital-wedding-invitations.html']]){
  const response=await worker.fetch(new Request(`https://invitestory.in${path}`),env);
  assert.equal(response.status,200);
  assert.equal(calls.at(-1),expected);
 }
});
test('shared design URL serves the catalogue with design-specific social metadata',async()=>{
 const response=await worker.fetch(new Request('https://invitestory.in/?design=marigold-bhavan'),env);
 const html=await response.text();
 assert.match(html,/<title>Marigold Bhavan \|/);
 assert.match(html,/id="templates-grid"/);
 assert.equal(response.headers.get('cache-control'),'public, max-age=300, stale-while-revalidate=86400');
});

test('HTTP production navigations upgrade before assets or personalization, preserving path and query',async()=>{
 const noAssets={ASSETS:{fetch(){assert.fail('HTTP redirect must precede all page processing');}}};
 for(const host of ['invitestory.in','www.invitestory.in'])for(const method of ['GET','HEAD'])for(const path of ['/','/index.html','/digital-wedding-invitations','/dearly','/dearly/']){
  const url=`http://${host}:80${path}?design=marigold-bhavan&utm_source=fixture&next=https%3A%2F%2Foutside.invalid%2F&x=a%2Bb`;
  const response=await worker.fetch(new Request(url,{method}),noAssets);
  assert.equal(response.status,307);
  assert.equal(response.headers.get('location'),url.replace('http:','https:').replace(':80',''));
  assert.equal(response.headers.get('cache-control'),'no-store');
  assert.equal(response.headers.get('referrer-policy'),'no-referrer');
  assert.equal(await response.text(),'');
 }
});
test('HTTPS, local hosts, hostname lookalikes and nondefault ports never redirect',async()=>{
 const assetOnly={ASSETS:{async fetch(){return new Response('fixture');}}};
 for(const url of ['https://www.invitestory.in/','https://invitestory.in/','http://localhost/','http://127.0.0.1/','http://www.invitestory.in.outside.invalid/','http://invitestory.in:8080/']){
  const response=await worker.fetch(new Request(url),assetOnly);
  assert.equal(response.status,200);assert.equal(response.headers.get('location'),null);
 }
});
test('HTTP writes are not redirected or replayed to another origin',async()=>{
 const response=await worker.fetch(new Request('http://www.invitestory.in/api/website/checkout',{method:'POST',headers:{Origin:'http://www.invitestory.in'},body:'{}'}),{});
 assert.equal(response.status,503);assert.equal(response.headers.get('location'),null);
});
test('HTTP config keeps its existing bridge behavior',async()=>{
 const response=await worker.fetch(new Request('http://www.invitestory.in/api/website/config'),{});
 assert.equal(response.status,200);assert.equal(response.headers.get('location'),null);
 assert.deepEqual(await response.json(),{enabled:false,checkoutEnabled:false});
});
test('the observed root and index use worker-first routing; direct campaign HTML remains an explicit coverage gap',()=>{
 const config=JSON.parse(readFileSync(new URL('../wrangler.jsonc',import.meta.url),'utf8'));
 assert.ok(config.assets.run_worker_first.includes('/'));
 assert.ok(config.assets.run_worker_first.includes('/index.html'));
 assert.ok(config.assets.run_worker_first.includes('/digital-wedding-invitations'));
 assert.equal(config.assets.run_worker_first.includes('/digital-wedding-invitations.html'),false);
});
