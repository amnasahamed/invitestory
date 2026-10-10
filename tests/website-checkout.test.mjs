import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../website-integration.js',import.meta.url),'utf8');
function client(response) {
 const window={addEventListener(){}};
 const context={window,document:{getElementById(){return null;},createElement(){return {setAttribute(){}};}},sessionStorage:{getItem(){return null;}},location:{hash:'',search:''},URLSearchParams,fetch:async()=>response,crypto:globalThis.crypto};
 vm.runInNewContext(source,context);return window.InviteWebsite;
}
test('an explicitly disabled integration keeps the existing checkout available',async()=>{const api=client(Response.json({enabled:false,checkoutEnabled:false}));assert.equal(await api.checkout({tier:2}),null);});
test('a configured gateway outage blocks unsigned fallback checkout',async()=>{const api=client(Response.json({error:'Portal unavailable'},{status:503}));await assert.rejects(api.checkout({tier:2}),/Secure checkout is temporarily unavailable/);});
test('a website without deployed API routes keeps names-only legacy checkout',async()=>{const api=client(Response.json({error:'Not found'},{status:404}));assert.equal(await api.checkout({tier:2}),null);});

const storageKey='invitestory.checkoutRetry';
const selection={designId:1,tier:2,currency:'INR',express:false,emailRsvp:false};
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
function fixture({storage=new Map(),secure=true,noUUID=false,noCrypto=false,configStatus=200,config={enabled:true,checkoutEnabled:true,siteKey:'fixture-key'}}={}) {
 const state={storage,requests:[],verification:0,generated:0,mode:'',rejectCheckout:false,rejectVerification:false,hold:null};
 const crypto=noCrypto?undefined:{
  ...(noUUID?{}:{randomUUID(){state.generated++;return `00000000-0000-4000-8000-${String(state.generated).padStart(12,'0')}`;}}),
  getRandomValues(bytes){state.generated++;bytes.fill(state.generated);return bytes;}
 };
 const window={isSecureContext:secure,addEventListener(){},turnstile:{render(box,options){state.verification++;queueMicrotask(()=>state.rejectVerification?options['error-callback']():options.callback('fixture-only'));return 1;},remove(){}}};
 const context={window,crypto,URLSearchParams,Uint8Array,setTimeout,clearTimeout,location:{hash:'',search:''},
  document:{getElementById(){return null;},createElement(){return {setAttribute(){},remove(){}};},body:{append(){}}},
  sessionStorage:{getItem(k){if(state.mode==='read')throw Error('Denied');return storage.get(k)??null;},setItem(k,v){if(state.mode==='write')throw Error('Denied');if(state.mode!=='silent')storage.set(k,v);}},
  fetch:async(url,options)=>{
   state.requests.push({url,body:options.body?JSON.parse(options.body):undefined});
   if(url==='/api/website/config')return Response.json(config,{status:configStatus});
   assert.equal(url,'/api/website/checkout');
   if(state.hold)await state.hold;
   if(state.rejectCheckout)throw new TypeError('Fixture uncertain response');
   return Response.json({orderId:'fixture-order',keyId:'fixture-key',amount:199900,currency:'INR'});
  }
 };
 vm.runInNewContext(source,context);return Object.assign(state,{api:window.InviteWebsite});
}
test('native UUID is generated once and the checkout request/response contract is preserved',async()=>{
 const f=fixture(),a=await f.api.checkout(selection),b=await f.api.checkout(selection);
 assert.equal(f.generated,1);assert.equal(a.clientKey,b.clientKey);assert.match(a.clientKey,uuid);
 assert.equal(a.orderId,'fixture-order');assert.equal(a.amount,199900);assert.equal(a.currency,'INR');
 assert.deepEqual(f.requests[1].body,{...selection,clientKey:a.clientKey,turnstileToken:'fixture-only'});
});
test('secure browser without randomUUID uses cryptographic bytes with UUID v4 bits',async()=>{
 const f=fixture({noUUID:true}),result=await f.api.checkout(selection);
 assert.equal(result.clientKey,'01010101-0101-4101-8101-010101010101');assert.equal(f.generated,1);
});
test('insecure context cannot create or reuse a checkout key',async()=>{
 for(const storage of [new Map(),new Map([[storageKey,JSON.stringify({key:JSON.stringify(selection),clientKey:'00000000-0000-4000-8000-000000000009'})]])]){
  const f=fixture({secure:false,storage});await assert.rejects(f.api.checkout(selection),/HTTPS/);
  assert.equal(f.generated,0);assert.equal(f.verification,0);assert.equal(f.requests.length,1);
 }
});
test('missing cryptography blocks checkout without an unsigned fallback',async()=>{
 const f=fixture({noCrypto:true});await assert.rejects(f.api.checkout(selection),/not supported/);
 assert.equal(f.verification,0);assert.equal(f.requests.length,1);
});
test('read denial, write denial and silent write loss stop before verification; write retries keep their ID',async()=>{
 for(const mode of ['read','write','silent']){
  const f=fixture();f.mode=mode;
  await assert.rejects(f.api.checkout(selection),/safely save/);await assert.rejects(f.api.checkout(selection),/safely save/);
  assert.equal(f.verification,0);assert.equal(f.requests.length,1);assert.equal(f.generated,mode==='read'?0:1);
  f.mode='';await f.api.checkout(selection);assert.equal(f.generated,1);
 }
});
test('corrupt JSON, invalid retry IDs and duplicate entries fail closed without replacing storage',async()=>{
 const entry={key:JSON.stringify(selection),clientKey:'00000000-0000-4000-8000-000000000009'};
 for(const raw of ['{', 'null',JSON.stringify({...entry,clientKey:'invalid'}),JSON.stringify({attempts:[entry,entry]})]){
  const f=fixture({storage:new Map([[storageKey,raw]])});await assert.rejects(f.api.checkout(selection),/safely save/);
  assert.equal(f.storage.get(storageKey),raw);assert.equal(f.generated,0);assert.equal(f.verification,0);
 }
});
test('valid legacy retry migrates and uncertain A to B to A retries preserve both keys across reload',async()=>{
 const oldId='00000000-0000-4000-8000-000000000009',storage=new Map([[storageKey,JSON.stringify({key:JSON.stringify(selection),clientKey:oldId})]]);
 const f=fixture({storage});f.rejectCheckout=true;await assert.rejects(f.api.checkout(selection),/uncertain/);
 f.rejectCheckout=false;const b=await f.api.checkout({...selection,designId:2}),a=await f.api.checkout(selection);
 assert.equal(a.clientKey,oldId);assert.notEqual(a.clientKey,b.clientKey);assert.equal(f.generated,1);
 const reloaded=fixture({storage});assert.equal((await reloaded.api.checkout(selection)).clientKey,oldId);assert.equal(reloaded.generated,0);
});
test('concurrent identical calls share one verification and request; different selections keep distinct keys',async()=>{
 const f=fixture();let release;f.hold=new Promise(resolve=>{release=resolve;});
 const a=f.api.checkout(selection),same=f.api.checkout(selection),b=f.api.checkout({...selection,designId:2});
 await new Promise(setImmediate);assert.equal(f.verification,2);assert.equal(f.requests.length,3);
 release();const [first,second,other]=await Promise.all([a,same,b]);
 assert.equal(first.clientKey,second.clientKey);assert.notEqual(first.clientKey,other.clientKey);
 assert.equal(JSON.parse(f.storage.get(storageKey)).attempts.length,2);
});
test('paid cleanup removes only its identified attempt; failed cleanup retains IDs',async()=>{
 const f=fixture(),a=await f.api.checkout(selection),b=await f.api.checkout({...selection,designId:2});
 f.mode='write';f.api.paid(a.clientKey);f.mode='';assert.equal((await f.api.checkout(selection)).clientKey,a.clientKey);
 f.api.paid();assert.equal(JSON.parse(f.storage.get(storageKey)).attempts.length,2);
 f.api.paid(a.clientKey);assert.equal((await f.api.checkout({...selection,designId:2})).clientKey,b.clientKey);
 assert.notEqual((await f.api.checkout(selection)).clientKey,a.clientKey);
});
test('config outage stays blocked for the page lifetime; a fresh successful config recovers with the saved key',async()=>{
 const storage=new Map(),first=fixture({storage}),a=await first.api.checkout(selection);
 const failed=fixture({storage,configStatus:503,config:{error:'Fixture outage'}});
 for(let i=0;i<2;i++)await assert.rejects(failed.api.checkout(selection),/temporarily unavailable/);
 assert.equal(failed.requests.length,1);assert.equal(failed.generated,0);assert.equal(failed.verification,0);
 assert.equal((await fixture({storage}).api.checkout(selection)).clientKey,a.clientKey);
});
test('verification failure retains the saved ID for retry without sending checkout',async()=>{
 const f=fixture();f.rejectVerification=true;await assert.rejects(f.api.checkout(selection),/Verification failed/);
 assert.equal(f.requests.length,1);const saved=JSON.parse(f.storage.get(storageKey)).attempts[0].clientKey;
 f.rejectVerification=false;assert.equal((await f.api.checkout(selection)).clientKey,saved);assert.equal(f.generated,1);
});
