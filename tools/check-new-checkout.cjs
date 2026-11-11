const { chromium } = require(process.env.INVITESTORY_PLAYWRIGHT);
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:900}});
  await page.route('**/*',route=>{
   const url=route.request().url();
   if(url.endsWith('/api/website/config'))return route.fulfill({json:{enabled:false}});
   return url.startsWith('http://127.0.0.1:7100/')?route.continue():route.abort();
  });
  await page.goto('http://127.0.0.1:7100/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction('typeof openOrderDrawerForTemplate === "function"');
  await page.evaluate(()=>{
   window.InviteWebsite={ready:Promise.resolve({checkoutEnabled:true}),legacyCheckoutEnabled:()=>true,deliveryV2Enabled:()=>false,checkout:async selection=>{
    window.checkedSelection=selection;
    return {clientKey:'00000000-0000-4000-8000-000000000040',orderId:'order_LOCAL_TEST',keyId:'local-test',amount:([40,41,42,46].includes(selection.designId)?1999:2999)*100,currency:'INR'};
   }};
   window.Razorpay=class {constructor(options){window.checkedPayment=options;}on(){}open(){window.testPaymentOpened=true;}};
  });
  for(const id of [40,41,42,43,44,45,46,47]){
   const state=await page.evaluate(id=>{
    currentCurrency='INR';openOrderDrawerForTemplate(id);
    const modal=document.querySelector('#order-drawer-modal');
    return {id:orderDrawerState.template.id,total:orderDrawerState.total,tier:orderDrawerState.tier,name:document.querySelector('#order-drawer-item-name').textContent,price:document.querySelector('#order-drawer-base-price').textContent,overflow:modal.scrollWidth>modal.clientWidth+1};
   },id);
   const expected=[40,41,42,46].includes(id)?1999:2999;
   if(state.id!==id||state.total!==expected||!state.price.includes(expected.toLocaleString('en-IN'))||state.overflow)throw Error(JSON.stringify(state));
   await page.evaluate(()=>proceedFromOrderDrawerToCheckout());
   const payment=await page.evaluate(()=>({selection:window.checkedSelection,amount:window.checkedPayment?.amount,opened:window.testPaymentOpened}));
   if(payment.selection?.designId!==id||payment.amount!==expected*100||!payment.opened)throw Error(JSON.stringify(payment));
   console.log(width,JSON.stringify(state));
  }
  await page.close();
 }
 await browser.close();
})();
