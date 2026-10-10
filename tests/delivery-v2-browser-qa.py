"""Actual storefront Chromium QA with local HTTP and mock-only portal/SDK."""
import functools, http.server, json, pathlib, threading
from playwright.sync_api import sync_playwright
root=pathlib.Path(__file__).resolve().parents[1]
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args): pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(root)))
threading.Thread(target=server.serve_forever,daemon=True).start();origin=f'http://127.0.0.1:{server.server_port}'
results=[]
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  for width,height,entry in [(390,844,'index.html'),(1440,900,'digital-wedding-invitations.html')]:
   state={'enabled':True,'old':False,'reject':False,'mismatch':False,'orders':{},'requests':[]}
   context=browser.new_context(viewport={'width':width,'height':height})
   def route_request(route):
    url=route.request.url
    if url.endswith('/api/website/config'):
     config={'enabled':False,'checkoutEnabled':True,'siteKey':'mock'}
     if not state['old']:config.update(checkoutContracts=[1,2],deliveryV2SalesEnabled=state['enabled'])
     route.fulfill(json=config)
    elif url.endswith('/api/website/checkout'):
     r=route.request.post_data_json;state['requests'].append(r)
     if state['reject']:route.fulfill(status=400,json={'error':'Mock rejection'});return
     key=r['clientKey'];version=r.get('checkoutVersion',1);tier=r['tier'];currency=r['currency']
     if key not in state['orders']:
      if version==2 and (state['old'] or not state['enabled']):route.fulfill(status=400,json={'error':'Mock unsupported contract'});return
      base={2:1999,3:2999,4:4999}[tier] if currency=='INR' else {2:29,3:45,4:75}[tier]
      response={'orderId':'order_MOCK'+str(len(state['orders'])+1),'keyId':'mock','currency':currency}
      if version==2:
       assert 'express' not in r
       fee={'standard_48h':0,'express_24h':799,'express_12h':1499}[r['deliverySpeed']]
       hours={'standard_48h':48,'express_24h':24,'express_12h':12}[r['deliverySpeed']]
       amount=(base+fee+(2000 if r['emailRsvp'] and tier!=4 else 0))*100
       response.update(checkoutVersion=2,deliverySpeed=r['deliverySpeed'],deliverySnapshot={'speed':r['deliverySpeed'],'firstDraftHours':hours,'surcharge':fee*100,'currency':'INR','startsAfter':'payment_and_complete_details'})
      else:amount=(base+(0 if tier==4 else (799 if currency=='INR' else 9)*r['express']+(2000 if currency=='INR' else 24)*r['emailRsvp']))*100
      response['amount']=amount;state['orders'][key]=response
     response=dict(state['orders'][key]);response['amount']+=1 if state['mismatch'] else 0;route.fulfill(json=response)
    elif url.startswith(origin+'/'):route.continue_()
    else:route.abort()
   context.route('**/*',route_request)
   context.add_init_script("""localStorage.setItem('invitestory_currency','INR');window.open=()=>null;window.sdkOpens=0;window.Razorpay=class {constructor(o){window.sdkOptions=o}on(){}open(){window.sdkOpens++}};window.turnstile={render(box,o){queueMicrotask(()=>o.callback('mock'));return 1},remove(){}};""")
   page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   def load():
    page.goto(origin+'/'+entry,wait_until='domcontentloaded');page.evaluate('InviteWebsite.ready');page.evaluate("currentCurrency='INR';renderPricingSection();")
   def drawer(tier=4):page.evaluate(f'openOrderDrawerForPackage({tier})');page.wait_for_selector('#order-drawer-modal.is-open')
   load();drawer()
   assert page.locator('#order-delivery-speeds').is_visible()
   for tier,base in [(2,1999),(3,2999),(4,4999)]:
    drawer(tier)
    for speed,extra in [('standard_48h',0),('express_24h',799),('express_12h',1499)]:
     page.locator('#delivery-'+speed).check()
     assert page.locator('[name=order-delivery-speed]:checked').count()==1
     assert page.evaluate('orderDrawerState.total')==base+extra
     breakdown=page.locator('#interaction-order-breakdown')
     if breakdown.count():
      hours={'standard_48h':48,'express_24h':24,'express_12h':12}[speed]
      assert f'{hours}h first draft' in breakdown.inner_text()
      if extra: assert f'{extra:,}' in breakdown.inner_text()
    if tier==4:assert page.locator('#order-drawer-addon-email-rsvp').is_checked() and page.locator('#order-drawer-addon-email-rsvp').is_disabled()
   assert page.evaluate("document.querySelector('#order-delivery-speeds').scrollWidth<=document.querySelector('#order-delivery-speeds').clientWidth+1")
   page.screenshot(path=f'/tmp/delivery-v2-{width}.png',full_page=False)
   # INR12 -> USD Dearly retains legacy75 +24h; no USD12 shown. Back resets standard.
   page.evaluate("currentCurrency='USD';updateOrderDrawerTotal()");assert page.locator('#order-delivery-speeds').is_hidden();assert page.evaluate('orderDrawerState.total')==75
   assert page.evaluate('deliveryHoursForOrder()')==24
   page.evaluate('proceedFromOrderDrawerToCheckout()');assert page.evaluate('sdkOpens')==1;assert state['requests'][-1]['express'] is True;assert 'checkoutVersion' not in state['requests'][-1]
   page.evaluate("currentCurrency='INR';updateOrderDrawerTotal()");drawer();assert page.locator('#delivery-standard_48h').is_checked()
   page.locator('#delivery-express_12h').check()
   state['reject']=True;page.evaluate('proceedFromOrderDrawerToCheckout()');assert page.evaluate('sdkOpens')==1
   rejected=state['requests'][-1]['clientKey'];state['reject']=False
   drawer();page.locator('#delivery-express_12h').check();state['mismatch']=True
   page.evaluate('proceedFromOrderDrawerToCheckout()');assert page.evaluate('sdkOpens')==1;assert state['requests'][-1]['clientKey']==rejected
   state['mismatch']=False;drawer();page.locator('#delivery-express_12h').check()
   count=len(state['requests']);page.evaluate('Promise.all([proceedFromOrderDrawerToCheckout(),proceedFromOrderDrawerToCheckout()])')
   assert len(state['requests'])==count+1;assert page.evaluate('sdkOpens')==2;assert state['requests'][-1]['clientKey']==rejected
   # Reload retry, then rollback hides new choices but retains explicit saved review/continue.
   load();drawer();page.locator('#delivery-express_12h').check();page.evaluate('proceedFromOrderDrawerToCheckout()');assert state['requests'][-1]['clientKey']==rejected
   state['enabled']=False;load();drawer();assert page.locator('#order-delivery-speeds').is_hidden();assert page.locator('#order-drawer-checkout-btn').is_disabled()
   page.evaluate('(id)=>resumeSavedCheckout(id)',rejected);assert '6,498' in page.locator('#order-checkout-retries').inner_text()
   page.get_by_role('button',name='Continue this saved payment',exact=True).click();assert page.evaluate('sdkOptions.amount')==649800
   # Receipt snapshots survive query serialization. SDK is mock and window.open is inert.
   page.evaluate("sdkOptions.handler({razorpay_payment_id:'pay_MOCK'})")
   assert '12 hours' in page.locator('#pay-success-delivery').inner_text()
   href=page.locator('#pay-success-thankyou-link').get_attribute('href');page.goto(origin+'/'+href)
   assert '12 hours' in page.locator('body').inner_text()
   page.goto(origin+'/thank-you.html?package=Dearly&amount=4999&express=1&payment_id=pay_OLD');assert '24 hours' in page.locator('body').inner_text()
   for snapshot in ['', '&delivery_snapshot=%7Bbad', '&delivery_snapshot=%5B%5D']:
    page.goto(origin+'/thank-you.html?checkout_version=2&express=1'+snapshot);assert 'Delivery promise unavailable' in page.locator('#ty-delivery').inner_text()
   # Old server blocks new client INR before POST/SDK. USD remains usable.
   state['old']=True;load();drawer();before=len(state['requests']);page.evaluate('proceedFromOrderDrawerToCheckout()');assert len(state['requests'])==before;assert page.evaluate('sdkOpens')==0
   # No uncaught page errors are acceptable; external libraries are intentionally blocked.
   assert not errors,errors
   results.append(f'{entry} {width}px: all speeds/tiers/totals, USD, rejection, mismatch, double clicks, reload retry, rollback resume, new/old receipts, old-server gate PASS')
   context.close()
  browser.close()
finally:server.shutdown()
print(json.dumps(results,indent=2))
