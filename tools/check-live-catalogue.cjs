const { chromium } = require(process.env.INVITESTORY_PLAYWRIGHT);
const fs = require('node:fs');
const origin='https://www.invitestory.in';
const designs=[[40,'sunehri','amber',1999],[41,'gulistan','bahaar',1999],[42,'gulabi','bloom',1999],[43,'raat-rani','exotic',2999],[44,'aabha','mithril',2999],[45,'aranya','olive',2999],[46,'gulnaar','ruby',1999],[47,'noor-mahal','zareen',2999]];
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const results=[];
 for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:900}});
  await context.route('**/*',route=>{
   const r=route.request(),url=r.url();
   // Exercise live page and API configuration reads without creating orders,
   // leads, analytics events or sending sample RSVPs.
   return r.method()==='GET' && url.startsWith(origin+'/') ? route.continue() : route.abort();
  });
  const page=await context.newPage();
  for(const [id,slug,folder,price] of designs){
   await page.goto(`${origin}/?design=${slug}`,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(id=>typeof previewState!=='undefined' && TEMPLATE_DATABASE[previewState.currentIndex]?.id===id,id);
   await page.waitForFunction(()=>document.querySelector('#preview-pay-label')?.textContent.includes('Choose design'));
   const preview=await page.evaluate(()=>({title:document.querySelector('#preview-sheet-title').textContent,price:document.querySelector('#preview-pay-label').textContent,frame:document.querySelector('#preview-modal-iframe')?.src}));
   if(!preview.price.includes(price.toLocaleString('en-IN'))||!preview.frame?.includes(`/previews/${folder}/`))throw Error(JSON.stringify(preview));
   await page.locator('#preview-instant-pay-btn').click({force:true});
   const order=await page.evaluate(()=>({id:orderDrawerState.template?.id,total:orderDrawerState.total,open:document.querySelector('#order-drawer-modal').classList.contains('is-open'),overflow:document.querySelector('#order-drawer-modal').scrollWidth>document.querySelector('#order-drawer-modal').clientWidth+1}));
   if(order.id!==id||order.total!==price||!order.open||order.overflow)throw Error(JSON.stringify(order));
   results.push({width,id,slug,preview,order});
   console.log('PASS',width,slug,price);
  }
  await page.screenshot({path:`/tmp/invitestory-live-order-${width}.png`});
  await context.close();
 }
 await browser.close();
 fs.writeFileSync('/tmp/invitestory-live-catalogue.json',JSON.stringify(results,null,2));
})();
