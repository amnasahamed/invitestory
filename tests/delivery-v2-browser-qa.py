"""Actual storefront Chromium QA: both currencies, local HTTP, mock portal/SDK only."""
import functools, http.server, json, pathlib, threading
from playwright.sync_api import sync_playwright
root=pathlib.Path(__file__).resolve().parents[1]
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args): pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(root)))
threading.Thread(target=server.serve_forever,daemon=True).start();origin=f'http://127.0.0.1:{server.server_port}'
results=[];bases={'INR':{2:1999,3:2999,4:4999},'USD':{2:29,3:45,4:75}}
fees={'INR':{'standard_48h':0,'express_24h':799,'express_12h':1499},'USD':{'standard_48h':0,'express_24h':9,'express_12h':18}}
hours={'standard_48h':48,'express_24h':24,'express_12h':12}
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  for width,height,entry in [(390,844,'index.html'),(1440,900,'digital-wedding-invitations.html')]:
   for currency in ['INR','USD']:
    state={'enabled':True,'old':False,'currencies':['INR','USD'],'reject':False,'mismatch':False,'badcurrency':False,'orders':{},'requests':[]}
    context=browser.new_context(viewport={'width':width,'height':height})
    def route_request(route):
     url=route.request.url
     if url.endswith('/api/website/config'):
      config={'enabled':False,'checkoutEnabled':True,'siteKey':'mock'}
      if not state['old']:config.update(checkoutContracts=[1,2],deliveryV2SalesEnabled=state['enabled'],deliveryV2Currencies=state['currencies'])
      route.fulfill(json=config)
     elif url.endswith('/api/website/checkout'):
      r=route.request.post_data_json;state['requests'].append(r)
      if state['reject']:route.fulfill(status=400,json={'error':'Mock rejection'});return
      key=r['clientKey'];version=r.get('checkoutVersion',1);tier=r['tier'];cur=r['currency']
      if key not in state['orders']:
       if version!=2 or state['old'] or not state['enabled'] or cur not in state['currencies']:route.fulfill(status=400,json={'error':'Mock unsupported contract'});return
       assert 'express' not in r
       speed=r['deliverySpeed'];fee=fees[cur][speed]
       amount=(bases[cur][tier]+fee+((2000 if cur=='INR' else 24) if r['emailRsvp'] and tier!=4 else 0))*100
       state['orders'][key]={'orderId':'order_MOCK'+str(len(state['orders'])+1),'keyId':'mock','currency':cur,'amount':amount,'checkoutVersion':2,'deliverySpeed':speed,'deliverySnapshot':{'speed':speed,'firstDraftHours':hours[speed],'surcharge':fee*100,'currency':cur,'startsAfter':'payment_and_complete_details'}}
      response=dict(state['orders'][key]);response['amount']+=1 if state['mismatch'] else 0
      if state['badcurrency']:response['currency']='USD' if cur=='INR' else 'INR'
      route.fulfill(json=response)
     elif url.startswith(origin+'/'):route.continue_()
     else:route.abort()
    context.route('**/*',route_request)
    context.add_init_script("""window.open=()=>null;window.sdkOpens=0;window.Razorpay=class {constructor(o){window.sdkOptions=o}on(){}open(){window.sdkOpens++}};window.turnstile={render(box,o){queueMicrotask(()=>o.callback('mock'));return 1},remove(){}};""")
    page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    def load():
     page.goto(origin+'/'+entry,wait_until='domcontentloaded');page.evaluate('InviteWebsite.ready');page.evaluate('(currency)=>{currentCurrency=currency;renderPricingSection()}',currency)
    def drawer(tier=4):page.evaluate(f'openOrderDrawerForPackage({tier})');page.wait_for_selector('#order-drawer-modal.is-open')
    load();drawer();assert page.locator('#order-delivery-speeds').is_visible()
    # Seed synthetic historical pending payments without creating a new legacy order.
    legacy=[]
    for cur,suffix in [('INR','91'),('USD','92')]:
     key='00000000-0000-4000-8000-0000000000'+suffix
     req={'designId':35,'tier':4,'currency':cur,'express':True,'emailRsvp':True}
     legacy.append({'key':json.dumps(req,separators=(',',':')),'clientKey':key})
     state['orders'][key]={'orderId':'order_LEGACY'+cur,'keyId':'mock','currency':cur,'amount':bases[cur][4]*100}
    page.evaluate('(attempts)=>sessionStorage.setItem("invitestory.checkoutRetry",JSON.stringify({attempts}))',legacy)
    for tier,base in bases[currency].items():
     drawer(tier)
     for speed,extra in fees[currency].items():
      page.locator('#delivery-'+speed).check();assert page.locator('[name=order-delivery-speed]:checked').count()==1
      assert page.evaluate('orderDrawerState.total')==base+extra
      breakdown=page.locator('#interaction-order-breakdown')
      if breakdown.count():
       assert f'{hours[speed]}h first draft' in breakdown.inner_text()
       if extra:assert f'{extra:,}' in breakdown.inner_text()
      if extra:assert f'{extra:,}' in page.locator('#delivery-fee-'+speed).inner_text()
     if tier==4:assert page.locator('#order-drawer-addon-email-rsvp').is_checked() and page.locator('#order-drawer-addon-email-rsvp').is_disabled()
    assert page.evaluate("document.querySelector('#order-delivery-speeds').scrollWidth<=document.querySelector('#order-delivery-speeds').clientWidth+1")
    page.screenshot(path=f'/tmp/delivery-v2-{currency}-{width}.png',full_page=False)
    other='USD' if currency=='INR' else 'INR'
    page.evaluate('(cur)=>{currentCurrency=cur;updateOrderDrawerTotal()}',other)
    assert page.locator('#delivery-standard_48h').is_checked();assert page.evaluate('orderDrawerState.total')==bases[other][4]
    page.locator('#delivery-express_12h').check();assert page.evaluate('orderDrawerState.total')==bases[other][4]+fees[other]['express_12h']
    page.evaluate('(cur)=>{currentCurrency=cur;updateOrderDrawerTotal()}',currency);assert page.locator('#delivery-standard_48h').is_checked()
    # Rejection, mismatch and double-click handling on current-currency Dearly12.
    page.locator('#delivery-express_12h').check();state['reject']=True
    page.evaluate('proceedFromOrderDrawerToCheckout()');assert page.evaluate('sdkOpens')==0
    rejected=state['requests'][-1]['clientKey'];state['reject']=False
    for flag in ['mismatch','badcurrency']:
     drawer();page.locator('#delivery-express_12h').check();state[flag]=True
     page.evaluate('proceedFromOrderDrawerToCheckout()');assert page.evaluate('sdkOpens')==0;assert state['requests'][-1]['clientKey']==rejected;state[flag]=False
    drawer();page.locator('#delivery-express_12h').check();count=len(state['requests'])
    page.evaluate('Promise.all([proceedFromOrderDrawerToCheckout(),proceedFromOrderDrawerToCheckout()])')
    assert len(state['requests'])==count+1;assert page.evaluate('sdkOpens')==1;assert state['requests'][-1]['clientKey']==rejected
    load();drawer();page.locator('#delivery-express_12h').check();page.evaluate('proceedFromOrderDrawerToCheckout()');assert state['requests'][-1]['clientKey']==rejected
    # Rollback: no fresh purchases, exact legacy AND versioned attempts can be resumed.
    state['enabled']=False;load();drawer();assert page.locator('#order-delivery-speeds').is_hidden();assert page.locator('#order-drawer-checkout-btn').is_disabled()
    for attempt in legacy:
     cur=json.loads(attempt['key'])['currency'];page.evaluate('(id)=>resumeSavedCheckout(id)',attempt['clientKey'])
     assert '24 hours' in page.locator('#order-checkout-retries').inner_text();assert f'{bases[cur][4]:,}' in page.locator('#order-checkout-retries').inner_text()
     page.get_by_role('button',name='Continue this saved payment',exact=True).click()
     assert page.evaluate('sdkOptions.amount')==bases[cur][4]*100;assert page.evaluate('sdkOptions.currency')==cur;assert state['requests'][-1]['clientKey']==attempt['clientKey'];assert 'checkoutVersion' not in state['requests'][-1]
     drawer()
    page.evaluate('(id)=>resumeSavedCheckout(id)',rejected)
    total=bases[currency][4]+fees[currency]['express_12h'];assert f'{total:,}' in page.locator('#order-checkout-retries').inner_text()
    page.get_by_role('button',name='Continue this saved payment',exact=True).click();assert page.evaluate('sdkOptions.amount')==total*100
    page.evaluate("sdkOptions.handler({razorpay_payment_id:'pay_MOCK'})");assert '12 hours' in page.locator('#pay-success-delivery').inner_text()
    href=page.locator('#pay-success-thankyou-link').get_attribute('href');page.goto(origin+'/'+href);assert '12 hours' in page.locator('#ty-delivery').inner_text()
    for cur in ['INR','USD']:
     page.goto(origin+'/thank-you.html?package=Dearly&amount=75&express=1&payment_id=pay_OLD&currency='+cur);assert '24 hours' in page.locator('#ty-delivery').inner_text()
     for snapshot in ['', '&delivery_snapshot=%7Bbad', '&delivery_snapshot=%5B%5D']:
      page.goto(origin+'/thank-you.html?checkout_version=2&express=1&currency='+cur+snapshot);assert 'Delivery promise unavailable' in page.locator('#ty-delivery').inner_text()
    state['old']=True;load();drawer();before=len(state['requests']);page.evaluate('proceedFromOrderDrawerToCheckout()');assert len(state['requests'])==before;assert page.evaluate('sdkOpens')==0
    if currency=='USD':
     state['old']=False;state['enabled']=True;state['currencies']=['INR'];load();drawer();assert page.locator('#order-drawer-checkout-btn').is_disabled();before=len(state['requests']);page.evaluate('proceedFromOrderDrawerToCheckout()');assert len(state['requests'])==before
    assert not errors,errors
    results.append(f'{entry} {width}px {currency}: all tiers/speeds/totals, currency reset, rejection, amount/currency mismatch, double click, reload UUID, flag-off legacy INR/USD +v2 resume, receipts, old-server gates PASS')
    context.close()
  browser.close()
finally:server.shutdown()
print(json.dumps(results,indent=2))
