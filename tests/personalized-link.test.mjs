import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const source=await readFile(new URL('../personalized-link.js',import.meta.url),'utf8');

function load(input='https://www.invitestory.in/'){
  const saved=new Map();
  const parsed=new URL(input,'https://www.invitestory.in/');
  const location={origin:parsed.origin,pathname:parsed.pathname,search:parsed.search,hash:parsed.hash,href:parsed.href};
  const window={};
  const history={state:null,replaceState:(state,_title,url)=>{history.state=state;const next=new URL(url);location.href=next.href;location.search=next.search;location.hash=next.hash;}};
  const context={window,location,history,URL,URLSearchParams,TextEncoder,TextDecoder,btoa,atob,Uint8Array,JSON,sessionStorage:{setItem:(key,value)=>saved.set(key,value),getItem:key=>saved.get(key)||null}};
  vm.runInNewContext(source,context);
  return {api:window.InvitePersonalizedLink,saved,location};
}

test('creates a names-only personalized design link and restores Unicode names',()=>{
  const {api}=load();
  const link=api.create({first:'Aarav',second:'अनन्या'},'shubha-vivaham');
  const url=new URL(link);
  assert.ok(url.searchParams.get('p'));
  assert.equal(url.searchParams.has('mobile'),false);
  const restored=load(url.href);
  assert.equal(new URL(restored.location.href).searchParams.get('design'),'shubha-vivaham');
  assert.deepEqual(JSON.parse(restored.saved.get('invitestory.previewNames')),{first:'Aarav',second:'अनन्या',design:'shubha-vivaham',source:'link'});
});

test('ignores malformed and invalid name links',()=>{
  assert.equal(load('https://www.invitestory.in/?p=not-valid-base64').saved.size,0);
  const {api}=load();
  const encoded=api.create({first:'<script>',second:'Aarav'},'design');
  assert.equal(load(encoded).saved.size,0);
});
