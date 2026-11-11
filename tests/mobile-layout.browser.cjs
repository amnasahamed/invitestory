// Run with INVITESTORY_PLAYWRIGHT pointing to the installed Playwright package.
// No leads, RSVP submissions or payment requests are sent.
const {chromium,webkit}=require(process.env.INVITESTORY_PLAYWRIGHT||'playwright');
const fs=require('node:fs');
const origin=process.env.INVITESTORY_QA_ORIGIN||'http://127.0.0.1:7100';
const engines=(process.env.INVITESTORY_QA_ENGINES||'chromium,webkit').split(',');
const sizes=process.env.INVITESTORY_QA_SIZES?process.env.INVITESTORY_QA_SIZES.split(',').map(s=>s.split('x').map(Number)):[[320,568],[360,800],[390,844],[430,932],[568,320],[667,375],[844,390],[1024,768],[1440,900]];
const results=[];
const chromePath=process.env.INVITESTORY_CHROME_PATH||(fs.existsSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':undefined);
const assert=(condition,message)=>{if(!condition)throw Error(message);};
const box=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,viewport:innerWidth,vh:innerHeight};};
async function fits(page,selector,minSize=0){
 const r=await page.locator(selector).evaluate(box);
 assert(r.x>=-1&&r.y>=-1&&r.x+r.w<=r.viewport+1&&r.y+r.h<=r.vh+1,`${selector} clipped: ${JSON.stringify(r)}`);
 if(minSize)assert(r.w>=minSize-1&&r.h>=minSize-1,`${selector} too small: ${JSON.stringify(r)}`);
 return r;
}
(async()=>{
 for(const engine of engines){
  const browser=await(engine==='webkit'?webkit.launch({headless:true}):chromium.launch({executablePath:chromePath,headless:true}));
  for(const [width,height] of sizes){
   const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true});
   const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/*',r=>r.request().method()!=='GET'||/googletagmanager|google-analytics|facebook|posthog|clarity|doubleclick/.test(new URL(r.request().url()).hostname)?r.abort():r.continue());
   const dearlyPath=origin.startsWith('http://127.0.0.1')?'/dearly.html':'/dearly';
   await page.goto(origin+dearlyPath,{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),'Dearly has horizontal overflow');
   const header=await fits(page,'.btn-wa-header',44);
   for(const el of await page.locator('.header-nav .nav-link').all())assert((await el.boundingBox()).height>=43,'Dearly navigation tap area');
   await page.locator('.logo-img').evaluate(i=>i.decode());
   assert((await page.locator('.logo-img').getAttribute('src')).includes('logo-header.webp'),'Dearly uses heavy logo');
   if(width===320)await page.screenshot({path:`/tmp/invitestory-mobile-fixed-${engine}-dearly.png`});
   const campaignPath=origin.startsWith('http://127.0.0.1')?'/digital-wedding-invitations.html':'/digital-wedding-invitations';
   await page.goto(origin+campaignPath,{waitUntil:'domcontentloaded'});
   await fits(page,'#currency-inr',44);await fits(page,'#currency-usd',44);
   await page.locator('#currency-usd').tap();assert(await page.locator('#currency-usd').evaluate(e=>e.classList.contains('active')),'USD selection failed');
   await page.locator('#currency-inr').tap();assert(await page.locator('#currency-inr').evaluate(e=>e.classList.contains('active')),'INR selection failed');
   await page.goto(origin+'/?design=sunehri',{waitUntil:'domcontentloaded'});
   await page.locator('#preview-modal.is-open').waitFor();await page.evaluate(()=>document.fonts.ready);
   await page.waitForFunction(()=>document.querySelector('.preview-gallery-card')?.getBoundingClientRect().width>0);
   const full=await fits(page,'#preview-fullscreen-btn',44);
   assert(await page.locator('#preview-fullscreen-btn').evaluate(e=>!e.closest('.preview-gallery-card')),'Full preview is inside scaled/clipped card');
   const card=await page.locator('.preview-gallery-card').evaluate(box);
   if(width>height&&height<=500){assert(card.h>=height-70,'Landscape artwork is too short');assert(card.w>=115,'Landscape artwork is too narrow');}
   if(width===390||width===844){
    const popupPromise=context.waitForEvent('page');await page.locator('#preview-fullscreen-btn').tap();const popup=await popupPromise;
    await popup.waitForLoadState('domcontentloaded');assert(popup.url().includes('/previews/amber/'),'Full preview opened the wrong design');await popup.close();
   }
   await fits(page,'#preview-instant-pay-btn',44);
   await page.locator('#preview-names-edit').tap();await fits(page,'#preview-names-close',44);
   await page.locator('[name=first]').fill('Nikhil');await page.locator('[name=second]').fill('Sana');await page.locator('#preview-names-next').tap();
   await page.locator('#preview-names-back').scrollIntoViewIfNeeded();await fits(page,'#preview-names-back',44);
   await page.locator('#preview-names-dialog button[type=submit]').scrollIntoViewIfNeeded();await fits(page,'#preview-names-dialog button[type=submit]',44);
   if(width===390){
    await page.setViewportSize({width:390,height:500});
    await page.locator('#preview-names-dialog button[type=submit]').scrollIntoViewIfNeeded();await fits(page,'#preview-names-dialog button[type=submit]',44);
    await page.locator('#preview-names-close').scrollIntoViewIfNeeded();await fits(page,'#preview-names-close',44);
    await page.setViewportSize({width,height});
   }
   await page.locator('#preview-names-close').tap();
   if(width===844||width===390)await page.screenshot({path:`/tmp/invitestory-mobile-fixed-${engine}-preview-${width}.png`});
   await page.locator('#preview-instant-pay-btn').tap();await page.locator('#order-drawer-checkout-btn').scrollIntoViewIfNeeded();await fits(page,'#order-drawer-checkout-btn',44);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),'Main page overflow');
   assert(!errors.length,`Page errors: ${errors.join('; ')}`);
   results.push({engine,width,height,header,full,card,passed:true});console.log('PASS',engine,width,height);
   await context.close();fs.writeFileSync(process.env.INVITESTORY_QA_REPORT||'/tmp/invitestory-mobile-fix-results.json',JSON.stringify(results,null,2));
  }
  await browser.close();
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
