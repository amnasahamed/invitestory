// Read-only integration checks. No enquiries, orders, RSVP submissions or charges.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium,webkit}=require(process.env.INVITESTORY_PLAYWRIGHT||'playwright');
const origin=process.env.INVITESTORY_QA_ORIGIN||'https://127.0.0.1:7102';
const report=process.env.INVITESTORY_QA_REPORT||'/tmp/invitestory-how-video-browser.json';
const chromePath='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sizes=[[320,568],[360,800],[390,844],[430,932],[568,320],[667,375],[767,900],[768,900],[844,390],[1024,768],[1440,900]];
const results=[];
const opened=[];
const mediaName=width=>width<=767?'vertical':'horizontal';
function state(v){const r=v.getBoundingClientRect();return {src:v.currentSrc||v.src,poster:v.poster,width:v.videoWidth,height:v.videoHeight,time:v.currentTime,paused:v.paused,preload:v.preload,autoplay:v.autoplay,controls:v.controls,inline:v.playsInline,box:{x:r.x,y:r.y,w:r.width,h:r.height},overflow:document.documentElement.scrollWidth>innerWidth};}
async function setup(browser,width,height,options={}){
 const context=await browser.newContext({viewport:{width,height},ignoreHTTPSErrors:true,...options});
 const page=await context.newPage();const videos=[];const errors=[];
 page.on('request',r=>{if(/how-it-works-.*\.mp4/.test(r.url()))videos.push(r.url());});page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>r.request().method()!=='GET'||/googletagmanager|google-analytics|facebook|posthog|clarity|doubleclick/.test(new URL(r.request().url()).hostname)?r.abort():r.continue());
 await page.goto(origin+'/',{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);
 await page.locator('#how-it-works-video').scrollIntoViewIfNeeded();
 return {context,page,videos,errors};
}
(async()=>{
 for(const engine of ['chromium','webkit']){
  const browser=await(engine==='webkit'?webkit.launch({headless:true}):chromium.launch({executablePath:chromePath,headless:true}));opened.push(browser);
  for(const [width,height] of sizes){
   const {context,page,videos,errors}=await setup(browser,width,height);
   const video=page.locator('#how-it-works-video');const initial=await video.evaluate(state);
   assert.equal(videos.length,0,`${engine} ${width}: downloaded video before play`);
   assert(initial.src.includes(mediaName(width)),`${engine} ${width}: wrong initial source`);
   assert(initial.poster.includes(mediaName(width)),`${engine} ${width}: wrong poster`);
   assert(initial.controls&&initial.inline&&!initial.autoplay&&initial.preload==='none','Native user-controlled playback');
   assert(!initial.overflow&&initial.box.x>=-1&&initial.box.x+initial.box.w<=width+1,'Video/page overflows');
   assert(Math.abs(initial.box.w/initial.box.h-(width<=767?9/16:16/9))<.02,'Wrong video shape');
   if(width<=767){const ordering=await page.evaluate(()=>{const r=s=>document.querySelector(s).getBoundingClientRect().top;return r('.how-film')<r('.studio-process-copy')});assert(ordering,'Mobile video is below the steps');}
   await video.evaluate(v=>{v.muted=true;return v.play();});
   await page.waitForFunction(()=>document.querySelector('#how-it-works-video').currentTime>.4);
   const playing=await video.evaluate(state);
   assert.equal(playing.width,width<=767?1080:1920);assert.equal(playing.height,width<=767?1920:1080);
   assert(videos.every(u=>u.includes(mediaName(width))),`${engine} ${width}: fetched the other format`);
   if(width===390||width===1440){
    await video.evaluate(v=>{v.pause();v.currentTime=35;});
    await page.waitForFunction(()=>{const v=document.querySelector('#how-it-works-video');return !v.seeking&&v.currentTime>=35&&v.readyState>=2});
    await page.screenshot({path:`/tmp/invitestory-how-video-${engine}-${width}.png`});
    await page.locator('.how-film-transcript summary').click();assert(await page.locator('.how-film-transcript').evaluate(e=>e.open),'Transcript cannot open');
    assert((await page.locator('.how-film-transcript').innerText()).includes('Alexander Holm'),'Missing music attribution');
   }
   await video.evaluate(v=>v.pause());assert.equal((await video.evaluate(state)).paused,true);
   assert.deepEqual(errors,[],`${engine} ${width}: JavaScript errors`);
   results.push({engine,width,height,initial,playing});console.log('PASS',engine,width,height);await context.close();
  }
  // Rotating/resizing switches files while preserving pause/play state and progress.
  const {context,page}=await setup(browser,390,844);const video=page.locator('#how-it-works-video');
  await video.evaluate(v=>{v.muted=true;return v.play();});await page.waitForFunction(()=>document.querySelector('#how-it-works-video').currentTime>.3);
  await video.evaluate(v=>{v.pause();v.currentTime=12;});await page.waitForFunction(()=>!document.querySelector('#how-it-works-video').seeking);
  await page.setViewportSize({width:1024,height:768});
  await page.waitForFunction(()=>{const v=document.querySelector('#how-it-works-video');return v.videoWidth===1920&&v.currentTime>=11.9&&!v.seeking;});
  assert((await video.evaluate(state)).paused,'Paused video restarted on resize');
  await video.evaluate(v=>v.play());const before=await video.evaluate(v=>v.currentTime);
  await page.setViewportSize({width:390,height:844});
  await page.waitForFunction(()=>{const v=document.querySelector('#how-it-works-video');return v.videoWidth===1080&&!v.paused&&v.currentTime>=11.9&&!v.seeking;});
  const rotated=await video.evaluate(state);assert(rotated.time>=before-.2&&rotated.time<before+4,'Lost playback position');results.push({engine,rotation:rotated});await context.close();
  // The HTML sources remain usable if JavaScript is unavailable.
  for(const width of [390,1440]){
   const {context,page,videos}=await setup(browser,width,900,{javaScriptEnabled:false});
   const video=page.locator('#how-it-works-video');await video.evaluate(v=>{v.muted=true;return v.play();});
   await page.waitForTimeout(700);assert((await video.evaluate(state)).time>.3,'No-JavaScript video did not advance');
   assert(videos.every(u=>u.includes(mediaName(width))),'No-JavaScript fallback chose wrong format');
   assert.equal((await video.evaluate(state)).width,width<=767?1080:1920);results.push({engine,noJavaScript:width});await context.close();
  }
  await browser.close();
 }
 // Validate the production-equivalent streaming and cache headers as well as browser playback.
 const browser=await chromium.launch({executablePath:chromePath,headless:true});opened.push(browser);const context=await browser.newContext({ignoreHTTPSErrors:true});
 for(const shape of ['vertical','horizontal']){
  const response=await context.request.get(`${origin}/assets/video/how-it-works-${shape}-20261111.mp4`,{headers:{Range:'bytes=0-1023'}});
  assert.equal(response.status(),206);assert(response.headers()['content-type'].includes('video/mp4'));assert.equal((await response.body()).length,1024);assert(response.headers()['cache-control'].includes('immutable'));
 }
 await browser.close();fs.writeFileSync(report,JSON.stringify(results,null,2));console.log(`Passed ${results.length} video/layout cases plus streaming/cache checks: ${origin}`);
})().catch(async error=>{console.error(error);await Promise.allSettled(opened.map(b=>b.close()));process.exitCode=1;});
