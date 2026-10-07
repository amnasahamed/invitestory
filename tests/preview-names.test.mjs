import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../previews/names.js',import.meta.url),'utf8');
function runtime(names){const window={addEventListener(){}};vm.runInNewContext(source,{window,sessionStorage:{getItem:()=>JSON.stringify(names)}});return window;}
test('all 35 template data formats accept both names without changing media or parents',()=>{
 const manifest=JSON.parse(fs.readFileSync(new URL('../previews/manifest.json',import.meta.url),'utf8'));
 for(const design of manifest.designs){
  const folder=new URL('../'+design.url.split('?')[0].slice(1),import.meta.url);
  const f=['editable/wedding-data.js','content/wedding-data.js','wedding-data.js'].map(path=>new URL(path,folder)).find(fs.existsSync);
  const window=runtime({first:'Nikhil',second:'Sana'});
  let dataSource=fs.readFileSync(f,'utf8').replace('export const weddingData =','window.WEDDING_DATA =');
  dataSource=dataSource.replace('window.InvitationNames?.applyData(weddingData);','');
  vm.runInNewContext(dataSource,{window});
  const data=window.WEDDING_DATA, couple=data.couple||data;
  const flat=JSON.stringify(couple);
  assert.ok(flat.includes('Nikhil'),design.name+' first name');assert.ok(flat.includes('Sana'),design.name+' second name');
  const original={window:{}};vm.runInNewContext(dataSource,original);
  function unchanged(before,after,key=''){if(typeof before==='string' && /image|photo|src|url|music|asset|parents|family/i.test(key))assert.equal(after,before,design.name+' '+key);else if(before && typeof before==='object')for(const k of Object.keys(before))unchanged(before[k],after[k],k);}
  unchanged(original.window.WEDDING_DATA,data);
 }
});
test('mapped text substitution is simultaneous and respects name boundaries',()=>{
 const window=runtime({first:'Het',second:'Chirag'}), api=window.InvitationNames;
 api.setMap({first:['Chirag'],second:['Het']});
 assert.equal(api.replace('Chirag & Het'), 'Het & Chirag');
 assert.equal(api.replace('Chiragville and other'), 'Chiragville and other');
});
test('Unicode names and apostrophes work; markup is rejected; empty settings preserve samples',()=>{
 const api=runtime({}).InvitationNames;
 assert.ok(api.valid("Zoë O’Connor"));assert.ok(api.valid('अनन्या'));assert.equal(api.valid('<img src=x>'),false);
 const data={couple:{groom:'Aarav',bride:'Meera',monogram:'A & M'}};
 assert.deepEqual(api.applyData(data),data);
 const invalid=runtime({first:'<script>',second:'Sana'});invalid.WEDDING_DATA={couple:{groom:'Aarav',bride:'Meera'}};assert.equal(invalid.WEDDING_DATA.couple.groom,'Aarav');
});
