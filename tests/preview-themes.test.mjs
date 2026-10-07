import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const context=vm.createContext({});
vm.runInContext(readFileSync(new URL('../preview-themes.js',import.meta.url),'utf8'),context);
const themes=vm.runInContext('PreviewThemes',context);
const ids=[...readFileSync(new URL('../scripts.js',import.meta.url),'utf8').matchAll(/id: (\d+),\s+name:/g)].map(match=>Number(match[1]));
test('every catalogue design has a distinct art-directed palette with readable labels and actions',()=>{
 assert.equal(ids.length,35);
 const stages=new Set();
 for(const id of ids) {
  const theme=themes.themeFor(id);
  assert.notEqual(theme.stage,themes.themeFor(null).stage,`missing design ${id}`);
  stages.add(theme.stage);
  for(const [foreground,background] of [[theme.ink,theme.surface],[theme.muted,theme.surface],[theme.onAccent,theme.accent],[theme.ink,theme.soft]])assert.ok(themes.contrast(foreground,background)>=4.5,`design ${id}: ${foreground} on ${background}`);
 }
 assert.equal(stages.size,35);
});
test('booking uses the chosen design palette and package-only review resets to neutral',()=>{
 const properties=new Map();
 const element={dataset:{},style:{setProperty:(key,value)=>properties.set(key,value)}};
 themes.apply(element,{id:35},true);
 assert.equal(properties.get('--order-cta-start'),'#682e49');
 assert.equal(properties.get('--order-panel-top'),'#fbf0ea');
 themes.apply(element,{id:37},true);
 assert.equal(properties.get('--order-cta-start'),'#294e7b');
 assert.equal(element.dataset.invitationTheme,'37');
 themes.apply(element,null,true);
 assert.equal(properties.get('--order-cta-start'),'#173e35');
 assert.equal(element.dataset.invitationTheme,'neutral');
});
