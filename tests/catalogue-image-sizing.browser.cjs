// Read-only layout checks for every catalogue design; no leads, orders or payments.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium,webkit}=require(process.env.INVITESTORY_PLAYWRIGHT||'playwright');
const origin=process.env.INVITESTORY_QA_ORIGIN||'http://127.0.0.1:7100';
const results=[];let browser;
const sizes=[[320,568],[390,844],[430,932],[768,1024],[1024,768],[1440,1000],[1920,1080]];
async function images(page){await page.locator('#templates-grid .template-card-img').evaluateAll(imgs=>Promise.all(imgs.map(i=>{i.loading='eager';return i.decode();})));}
async function measure(page){return page.locator('#templates-grid .template-card').evaluateAll(cards=>cards.map(c=>{const m=c.querySelector('.template-card-media'),i=c.querySelector('.template-card-img');const r=m.getBoundingClientRect(),s=i.getBoundingClientRect();return {name:c.querySelector('h3').textContent,id:c.id,x:r.x,y:r.y,w:r.width,h:r.height,ix:s.x,iy:s.y,iw:s.width,ih:s.height,fit:getComputedStyle(i).objectFit,loaded:i.complete&&i.naturalWidth>0};}));}
function validate(rows,width,mode){
 assert(rows.length>=38,'All listed designs must be checked');
 const first=rows[0];for(const r of rows){
  assert(r.loaded,`${r.name}: missing image`);assert.equal(r.fit,'cover',`${r.name}: letterboxed artwork`);
  assert(Math.abs(r.w-first.w)<1&&Math.abs(r.h-first.h)<1,`${r.name}: different preview size`);
  assert(r.ix<=r.x+2&&r.iy<=r.y+2&&r.ix+r.iw>=r.x+r.w-2&&r.iy+r.ih>=r.y+r.h-2,`${r.name}: image does not fill its frame`);
  assert(r.x>=-1&&r.x+r.w<=width+1,`${r.name}: clipped horizontally`);
  if(mode==='grid')assert(Math.abs(r.w/r.h-9/16)<.005,`${r.name}: inconsistent portrait shape`);
 }
}
(async()=>{
 for(const engine of ['chromium','webkit']){
  browser=await(engine==='webkit'?webkit.launch({headless:true}):chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true}));
  const context=await browser.newContext();const page=await context.newPage();
  await page.route('**/*',r=>r.request().method()!=='GET'||/posthog|googletagmanager|google-analytics|facebook|clarity/.test(new URL(r.request().url()).hostname)?r.abort():r.continue());
  await page.goto(origin+'/',{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>showAllDesigns());await images(page);
  const assets=await page.evaluate(()=>Promise.all(TEMPLATE_DATABASE.map(item=>new Promise(resolve=>{const i=new Image();i.onload=()=>resolve({name:item.name,ok:i.naturalWidth>0,w:i.naturalWidth,h:i.naturalHeight});i.onerror=()=>resolve({name:item.name,ok:false});i.src=item.image;}))));
  assert(assets.length>=44);assert(assets.every(a=>a.ok),JSON.stringify(assets.filter(a=>!a.ok)));
  for(const [width,height] of sizes){
   await page.setViewportSize({width,height});await page.mouse.move(0,0);await page.evaluate(()=>document.fonts.ready);
   let rows=await measure(page);validate(rows,width,'grid');
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Page overflows');
   const sample=rows.find(r=>r.name==='Royal Reception');assert(sample,'Missing screenshot design');
   const card=page.locator('#'+sample.id);await card.scrollIntoViewIfNeeded();const before=await card.boundingBox();await card.hover();await page.waitForTimeout(450);const after=await card.boundingBox();assert(Math.abs(before.y-after.y)<1,'Hover misaligns a card');await page.mouse.move(0,0);
   if(width===390||width===1440){
    const grid=page.locator('#templates-grid');await page.screenshot({path:`/tmp/invitestory-previews-${engine}-${width}.png`});
    await grid.evaluate(g=>g.classList.add('view-list'));validate(await measure(page),width,'list');await grid.evaluate(g=>g.classList.remove('view-list'));
    await card.locator('.template-card-media').click();await page.locator('#preview-modal.is-open').waitFor();await page.evaluate(()=>closePreview());
   }
   results.push({engine,width,height,designs:rows.length,assets:assets.length,frame:{width:rows[0].w,height:rows[0].h}});console.log('PASS',engine,width,rows.length);
  }
  await browser.close();browser=null;
 }
 fs.writeFileSync(process.env.INVITESTORY_QA_REPORT||'/tmp/invitestory-preview-sizing.json',JSON.stringify(results,null,2));
 console.log(`Passed ${results.length} layouts for all 38 listed designs and all 44 cover files.`);
})().catch(async error=>{console.error(error);if(browser)await browser.close();process.exitCode=1;});
