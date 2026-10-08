import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../website-integration.js',import.meta.url),'utf8');
async function customerFlow(){
 const requests=[],listeners={},inserted=[],storage=new Map();let rendered=0,notice;
 class Element {
  constructor(tag){this.tagName=tag.toUpperCase();this.open=false;this.children=[];this.controls={phone:{value:''},consent:{checked:false},wording:{textContent:''}};}
  setAttribute(){} append(...items){this.children.push(...items);} remove(){} replaceChildren(){this.children=[];}
  querySelector(selector){return selector.includes('whatsappConsent')?this.controls.consent:selector.includes('[name=whatsapp]')?this.controls.phone:this.controls.wording;}
 }
 const form={elements:{first:{value:'Asha'},second:{value:'Ravi'}},closest(){return {after(node){notice=node;}};},querySelector(){return {before(node){inserted.push(node);}};},addEventListener(event,fn){(listeners[event]??=[]).push(fn);}};
 const window={addEventListener(){},turnstile:{render(box,options){rendered++;queueMicrotask(()=>options.callback('synthetic-token'));return 1;},remove(){}}};
 const context={window,document:{getElementById(id){return id==='preview-names-form'?form:null;},createElement(tag){return new Element(tag);},body:{append(){}}},location:{hash:'',search:'',origin:'https://www.invitestory.in'},sessionStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},URLSearchParams,crypto:globalThis.crypto,setTimeout,clearTimeout,previewState:{currentIndex:0},TEMPLATE_DATABASE:[{id:1}],fetch:async(url,options)=>{requests.push({url,options});return url.endsWith('/config')?Response.json({enabled:true,checkoutEnabled:true,siteKey:'public-key',businessNumber:'918281583882',consentVersion:'preview-reminders-v2',consentWording:'One optional follow-up'}):Response.json({token:'a'.repeat(64),verification:'b'.repeat(24),verified:false});}};
 vm.runInNewContext(source,context);await window.InviteWebsite.ready;await new Promise(setImmediate);
 return {fields:inserted[0],form,requests,get notice(){return notice;},get rendered(){return rendered;},async submit(){for(const fn of listeners.submit||[])fn();await new Promise(setImmediate);},reset(){for(const fn of listeners.reset||[])fn();}};
}
test('WhatsApp saving is collapsed and names-only preview submits never request verification or capture',async()=>{
 const flow=await customerFlow();assert.equal(flow.fields.tagName,'DETAILS');assert.equal(flow.fields.open,false);assert.equal(flow.fields.controls.consent.checked,false);
 await flow.submit();assert.equal(flow.rendered,0);assert.deepEqual(flow.requests.map(r=>r.url),['/api/website/config']);
});
test('a phone number without explicit consent never triggers WhatsApp capture',async()=>{
 const flow=await customerFlow();flow.fields.controls.phone.value='+916000000001';await flow.submit();assert.equal(flow.rendered,0);assert.equal(flow.requests.length,1);
});
test('consented saving preserves name values, offers confirmation and a saved link, and does not repeat on later name edits',async()=>{
 const flow=await customerFlow();flow.fields.controls.phone.value='+916000000001';flow.fields.controls.consent.checked=true;await flow.submit();
 assert.equal(flow.rendered,1);const capture=flow.requests.find(r=>r.url.endsWith('/capture'));assert.ok(capture);const body=JSON.parse(capture.options.body);assert.equal(body.first,'Asha');assert.equal(body.second,'Ravi');assert.equal(body.consent,true);
 assert.equal(flow.fields.controls.consent.checked,false);const links=flow.notice.children.filter(x=>x?.tagName==='A');assert.equal(links.length,2);assert.match(decodeURIComponent(links[0].href),/Please send my saved InviteStory preview\.\nPREVIEW /);assert.match(links[1].href,/#saved-preview=[a-f0-9]{64}$/);
 flow.form.elements.first.value='Another name';await flow.submit();assert.equal(flow.requests.filter(r=>r.url.endsWith('/capture')).length,1);
});
test('using sample names clears WhatsApp consent',async()=>{const flow=await customerFlow();flow.fields.controls.consent.checked=true;flow.reset();assert.equal(flow.fields.controls.consent.checked,false);});
