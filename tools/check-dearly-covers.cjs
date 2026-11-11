const { chromium } = require(process.env.INVITESTORY_PLAYWRIGHT);
const fs = require('node:fs');
const origin = process.env.INVITESTORY_QA_ORIGIN || 'http://127.0.0.1:7100';
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const results=[];
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:1000}});
  await page.route('**/*',r=>r.request().method()==='GET'&&r.request().url().startsWith(origin+'/')?r.continue():r.abort());
  for(const entry of ['/',origin.startsWith('http://127.0.0.1')?'/dearly.html':'/dearly']){
   await page.goto(origin+entry,{waitUntil:'domcontentloaded'});
   if(entry==='/') await page.locator('#catalogue-show-all-btn').click();
   const selector=entry==='/'?'.template-card-img[src*="dearly-"]':'.designs-grid img';
   const covers=page.locator(selector);
   if(await covers.count()!==4)throw Error(`${entry}: expected all four Dearly covers`);
   for(const cover of await covers.all()){
    await cover.scrollIntoViewIfNeeded();
    await cover.evaluate(image=>image.decode());
   }
   const images=await covers.evaluateAll(es=>es.map(i=>({src:i.src,width:i.naturalWidth,visible:getComputedStyle(i).display!=='none'})));
   if(images.some(i=>!i.width||!i.visible||!i.src.startsWith(origin+'/assets/preview/dearly-')))throw Error(JSON.stringify(images));
   results.push({width,entry,images});
   console.log('PASS',width,entry,'all four Dearly covers loaded from local assets');
   if(entry.startsWith('/dearly')&&width===1440)await page.locator('.designs-grid').screenshot({path:'/tmp/invitestory-dearly-local-covers.png'});
  }
  await page.close();
 }
 await browser.close();
 fs.writeFileSync('/tmp/invitestory-dearly-cover-checks.json',JSON.stringify(results,null,2));
})();
