import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const source = readFileSync(new URL('../interactions.js', import.meta.url), 'utf8');
const animationSource = source.slice(source.indexOf('  function artworkTransition('), source.indexOf('  function afterPreview('));
function run(from, to) {
  let frames = null, appended = 0;
  const context = vm.createContext({
    reduced: () => false, innerHeight: 844,
    document: {
      body: {appendChild: () => appended++},
      createElement: () => ({style: {}, remove() {}, animate(value) {frames = value; return {finished: Promise.resolve()};}}),
    }, from, to,
  });
  vm.runInContext(animationSource + '\nartworkTransition(from,to,"image.webp");', context);
  return {frames, appended};
}
const rect = {left: 10, top: 20, width: 100, height: 200, bottom: 220};
test('hidden or invalid poster rectangles never create animation keyframes', () => {
  for (const invalid of [{...rect,width:0}, {...rect,height:0}, {...rect,left:NaN}, {...rect,width:Infinity}]) {
    assert.equal(run(invalid, rect).appended, 0);
    assert.equal(run(rect, invalid).appended, 0);
  }
});
test('visible artwork still animates with finite scale', () => {
  const result = run(rect, {...rect,left:30,top:40,width:200,height:400});
  assert.equal(result.appended, 1);
  assert.equal(result.frames[1].transform, 'translate(20px,20px) scale(2,2)');
});
