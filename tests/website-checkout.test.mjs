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
