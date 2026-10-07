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
