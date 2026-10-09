import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const context=vm.createContext({URL,setTimeout,clearTimeout});
vm.runInContext(readFileSync(new URL('../preview-controller.js',import.meta.url),'utf8'),context);
const create=context.createPreviewController;
function fixture(){
  let now=0,id=0;const timers=new Map();
  const schedule=(fn,ms)=>{const key=++id;timers.set(key,{fn,due:now+ms});return key;};
  const advance=ms=>{const end=now+ms;for(;;){const next=[...timers].sort((a,b)=>a[1].due-b[1].due)[0];if(!next || next[1].due>end)break;now=next[1].due;timers.delete(next[0]);next[1].fn();}now=end;};
  const classes=()=>{const values=new Set();return {add:v=>values.add(v),remove:v=>values.delete(v),contains:v=>values.has(v),toggle:(v,on)=>on?values.add(v):values.delete(v)};};
  const elements=Object.fromEntries(['img','blockquote','p','button','a'].map(k=>[k,{hidden:true}]));
  const frame={src:'about:blank',classList:classes(),contentDocument:null};
  const poster={hidden:true,classList:classes(),querySelector:key=>elements[key]};
  const modal={dataset:{},classList:classes()},toggle={setAttribute(){}};
  const mobile={matches:true};
  const controller=create({frame,poster,modal,toggle,mobile,loader:{classList:classes()},baseURL:'https://example.com/',schedule,cancel:key=>timers.delete(key),reduced:()=>true});
  const rendered=(slug='a')=>{frame.contentDocument={readyState:'interactive',location:{pathname:`/previews/${slug}/`},body:{innerText:'Welcome to our wedding celebration'},images:[]};};
  const design=slug=>({id:slug==='a'?1:2,name:slug,localDemoUrl:`/previews/${slug}/`,demoUrl:`https://${slug}.example.com/`,image:`${slug}.webp`});
  return {controller,frame,poster,modal,mobile,toggle,elements,advance,rendered,design,timers};
}
test('a slow preview recovers automatically after the eight-second fallback',()=>{
  const f=fixture();f.controller.open(f.design('a'));f.advance(8100);
  assert.equal(f.controller.state().phase,'waiting');assert.equal(f.elements.button.hidden,false);
  f.rendered();f.advance(250);
  assert.equal(f.controller.state().phase,'ready');assert.equal(f.poster.hidden,true);
});
test('retry and rapid switching invalidate previous preview timers and documents',()=>{
  const f=fixture();f.controller.open(f.design('a'));f.advance(7900);f.controller.open(f.design('b'));f.advance(200);
  assert.equal(f.elements.button.hidden,true);f.rendered('a');f.advance(250);assert.equal(f.controller.state().phase,'loading');
  f.controller.retry();f.rendered('b');f.advance(250);assert.equal(f.controller.state().phase,'ready');f.advance(10000);assert.equal(f.elements.button.hidden,true);
});
test('closing cancels loading and reopening cancels the pending blank-frame cleanup',()=>{
  const f=fixture();f.mobile.matches=false;f.controller.open(f.design('a'));f.controller.toggleControls();f.controller.close();
  assert.equal(f.controller.state().collapsed,false);assert.equal(f.controller.state().phase,'closed');assert.equal(f.poster.hidden,true);
  f.advance(100);f.controller.open(f.design('b'));f.rendered('b');f.advance(400);
  assert.equal(f.frame.src,'/previews/b/');assert.equal(f.controller.state().phase,'ready');
  f.controller.close();f.advance(350);assert.equal(f.frame.src,'about:blank');assert.equal(f.timers.size,0);
});
test('mobile Close releases the frame without waiting for a desktop transition',()=>{
  const f=fixture();f.controller.open(f.design('a'));f.rendered();f.advance(0);
  f.controller.close();f.advance(0);assert.equal(f.frame.src,'about:blank');assert.equal(f.timers.size,0);
});
test('repeated load events do not multiply readiness polling',()=>{
  const f=fixture();f.controller.open(f.design('a'));f.advance(0);
  f.controller.loaded();f.controller.loaded();f.controller.loaded();
  assert.equal(f.timers.size,2); // one readiness check and one fallback
});
test('controller navigation crosses collection boundaries and wraps',()=>{
  const f=fixture(), catalogue=[{id:1,tier:2},{id:2,tier:3},{id:3,tier:4}];
  assert.equal(f.controller.adjacent(catalogue,1,1).id,2);
  assert.equal(f.controller.adjacent(catalogue,3,1).id,1);
  assert.equal(f.controller.adjacent(catalogue,1,-1).id,3);
});

test('mobile starts compact, expands optional tools, and resets when closed',()=>{
  const f=fixture();f.controller.open(f.design('a'));
  assert.equal(f.modal.classList.contains('is-details-hidden'),true);
  assert.equal(f.toggle.textContent,'More options');
  f.controller.toggleControls();
  assert.equal(f.modal.classList.contains('is-details-hidden'),false);
  f.controller.open(f.design('b'));
  assert.equal(f.controller.state().collapsed,false);
  f.controller.close();f.controller.open(f.design('a'));
  assert.equal(f.modal.classList.contains('is-details-hidden'),true);
  f.mobile.matches=false;f.controller.renderControls();
  assert.equal(f.modal.classList.contains('is-details-hidden'),false);
});
