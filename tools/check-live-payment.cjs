const { chromium } = require(process.env.INVITESTORY_PLAYWRIGHT);
const fs=require('node:fs');
const ids=process.argv.slice(2).length?process.argv.slice(2).map(Number):[40,41,42,43,44,45,46,47];
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const results=fs.existsSync('/tmp/invitestory-live-payment.json')?JSON.parse(fs.readFileSync('/tmp/invitestory-live-payment.json','utf8')):[];
 const context=await browser.newContext({viewport:{width:1280,height:900}});
 await context.route('**/*',route=>{
  const r=route.request(),u=new URL(r.url());
  // Never authorize a provider payment or invoke the success handler.
  if(/razorpay\.com$/.test(u.hostname)&&/\/payments?(?:\/|$)/.test(u.pathname)&&r.method()!=='GET')return route.abort();
  if(/google-analytics|googletagmanager|facebook|posthog|clarity|doubleclick/.test(u.hostname))return route.abort();
  return route.continue();
 });
 const page=await context.newPage();
 for(const id of ids){
  const slug={40:'sunehri',41:'gulistan',42:'gulabi',43:'raat-rani',44:'aabha',45:'aranya',46:'gulnaar',47:'noor-mahal'}[id];
  await page.goto(`https://www.invitestory.in/?design=${slug}`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.InviteWebsite?.ready);
  const config=await page.evaluate(()=>InviteWebsite.ready);
  if(!config.checkoutEnabled)throw Error('Live checkout is disabled');
  await page.waitForFunction(id=>typeof previewState!=='undefined'&&TEMPLATE_DATABASE[previewState.currentIndex]?.id===id,id);
  await page.locator('#preview-instant-pay-btn').click({force:true});
  await page.locator('#order-drawer-checkout-btn').waitFor({state:'visible'});
  const expected=[40,41,42,46].includes(id)?199900:299900;
  let request,response;
  const handler=async r=>{
   if(r.url().endsWith('/api/website/checkout')){
    request=r.request().postDataJSON();
    try{response={status:r.status(),body:await r.json()};}catch{response={status:r.status()};}
    console.log('CHECKOUT',id,JSON.stringify(response));
   }
  };
  page.on('response',handler);
  await page.locator('#order-drawer-checkout-btn').click();
  try{
   await page.waitForFunction(()=>[...document.querySelectorAll('iframe')].some(f=>/razorpay/.test(f.src)&&f.getBoundingClientRect().width>0),{},{timeout:135000});
  }catch{}
  await page.waitForTimeout(2500);
  const frames=await page.locator('iframe').evaluateAll(es=>es.filter(f=>/razorpay/.test(f.src)&&f.getBoundingClientRect().width>0).map(f=>({src:f.src,title:f.title})));
  const notices=await page.locator('[role=alert],.toast,.toast-message').allTextContents();
  const result={id,expected,response,request:request&&{designId:request.designId,tier:request.tier,currency:request.currency,checkoutVersion:request.checkoutVersion,deliverySpeed:request.deliverySpeed},frames,notices};
  results.push(result);fs.writeFileSync('/tmp/invitestory-live-payment.json',JSON.stringify(results,null,2));
  await page.screenshot({path:`/tmp/invitestory-live-payment-${id}.png`});
  page.off('response',handler);
  if(response?.status!==200||response.body.amount!==expected||response.body.currency!=='INR'||request.designId!==id||!frames.length){console.log('FAILED',JSON.stringify(result));process.exitCode=1;break;}
  console.log('PASS',id,response.body.orderId,expected);
  await page.keyboard.press('Escape');
 }
 await browser.close();
})();
