const { chromium } = require(process.env.INVITESTORY_PLAYWRIGHT);
const fs = require('node:fs');
const origin = process.env.INVITESTORY_QA_ORIGIN || 'http://127.0.0.1:7100';
const names = process.argv.slice(2).length ? process.argv.slice(2) : ['amber','bahaar','bloom','exotic','mithril','olive','ruby','zareen'];
(async () => {
  const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  const results = [];
  for (const slug of names) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await context.addInitScript(() => sessionStorage.setItem('invitestory.previewNames', JSON.stringify({ first:'Nikhil', second:'Sana' })));
    const page = await context.newPage();
    await page.route('**/*', route => route.request().method() === 'GET' && route.request().url().startsWith(origin+'/') ? route.continue() : route.abort());
    const missing = new Set(), errors = [];
    page.on('response', r => { if (r.status() >= 400 && r.url().startsWith(origin+'/')) missing.add(r.url()); });
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(`${origin}/previews/${slug}/`, { waitUntil:'domcontentloaded' });
    await page.waitForTimeout(1200);
    const controls = await page.locator('button,[role=button]').evaluateAll(es => es.map(e => ({ id:e.id, text:e.innerText, label:e.getAttribute('aria-label') })).filter(e=>/open|unlock/i.test(e.text+' '+e.label)));
    console.log(slug, JSON.stringify(controls));
    const opening = page.locator('button,[role=button]').filter({ hasText:/tap.*(?:open|unlock)/i }).first();
    if (await opening.count()) await opening.click({ force: true });
    else await page.mouse.click(195,650);
    await page.waitForTimeout(6500);
    for (let y=0;y<12000;y+=700) { await page.evaluate(y=>window.scrollTo(0,y),y); await page.waitForTimeout(75); }
    const state = await page.evaluate(() => ({ text:document.body.innerText.slice(0,900), first:document.body.innerText.includes('Nikhil'), second:document.body.innerText.includes('Sana'), width:document.documentElement.scrollWidth, viewport:innerWidth, broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src), videos:[...document.querySelectorAll('video')].map(v=>({src:v.currentSrc,time:v.currentTime,error:v.error?.message})), controls:[...document.querySelectorAll('button,[role=button]')].slice(0,8).map(e=>({id:e.id,text:e.innerText})) }));
    await page.screenshot({path:`/tmp/invitestory-${slug}-opened.png`,timeout:5000,animations:'disabled'});
    results.push({slug,missing:[...missing],errors,...state});
    await context.close();
  }
  fs.writeFileSync(process.env.INVITESTORY_QA_REPORT || '/tmp/invitestory-browser-results.json',JSON.stringify(results,null,2));
  console.log(JSON.stringify(results,null,2));
  await browser.close();
  if (results.some(r => r.missing.length || r.errors.length || r.broken.length || !r.first || !r.second || r.width > r.viewport)) process.exitCode=1;
})();
