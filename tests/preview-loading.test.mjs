import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../preview-controller.js',import.meta.url),'utf8');
const readySource=source.slice(source.indexOf('  function previewDocumentReady('),source.indexOf('function createPreviewController('));
function ready(doc,path='/previews/example/') {
  return vm.runInNewContext(readySource+'\npreviewDocumentReady(doc,path)',{doc,path,URL});
}
test('rendered invitation is revealed despite failed or pending optional images',()=>{
  const doc={readyState:'interactive',location:{pathname:'/previews/example/'},body:{innerText:'You are invited to our wedding'},images:[{complete:false,naturalWidth:0},{complete:true,naturalWidth:0}]};
  assert.equal(ready(doc),true);
});
test('blank, wrong-design and error documents stay behind the loading screen',()=>{
  const doc={readyState:'complete',location:{pathname:'/previews/example/'},body:{innerText:''},images:[]};
  assert.equal(ready(doc),false);
  assert.equal(ready({...doc,body:{innerText:'404 Not Found'}}),false);
  assert.equal(ready({...doc,body:{innerText:'A different invitation'},location:{pathname:'/previews/other/'}}),false);
});
test('artwork-only openings can load and trailing slash redirects are accepted',()=>{
  const doc={readyState:'complete',location:{pathname:'/previews/example'},body:{innerText:''},images:[{complete:true,naturalWidth:800}]};
  assert.equal(ready(doc),true);
});
test('rendered text waits for same-origin styles, then recovers when they load',()=>{
  const style={href:'https://example.com/previews/example/assets/main.css',sheet:null};
  const doc={readyState:'interactive',location:{pathname:'/previews/example/',href:'https://example.com/previews/example/',origin:'https://example.com'},body:{innerText:'Welcome to our wedding'},images:[],querySelectorAll:()=>[style]};
  assert.equal(ready(doc),false);
  style.sheet={};assert.equal(ready(doc),true);
});
test('optional third-party font styles and inactive styles never block the invitation',()=>{
  const doc={readyState:'complete',location:{pathname:'/previews/example/',href:'https://example.com/previews/example/',origin:'https://example.com'},body:{innerText:'Welcome to our wedding'},images:[],querySelectorAll:()=>[{href:'https://fonts.googleapis.com/css2?family=Inter',sheet:null},{href:'https://example.com/print.css',disabled:true,sheet:null}]};
  assert.equal(ready(doc),true);
});
