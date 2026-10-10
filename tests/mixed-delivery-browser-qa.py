"""Mixed cache/deploy assets; localhost and mocked config/payment only."""
import functools,http.server,pathlib,subprocess,threading,json,urllib.parse
from playwright.sync_api import sync_playwright
root=pathlib.Path(__file__).resolve().parents[1]
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(root)))
threading.Thread(target=server.serve_forever,daemon=True).start();origin=f'http://127.0.0.1:{server.server_port}'
def old(name):return subprocess.check_output(['git','show','50a1dae:'+name],cwd=root).decode()
assets=['scripts.js','sales.js','interactions.js','paid-order.js','website-integration.js']
cases=[('all old',['index.html']+assets),('old main new helpers',['scripts.js']),('old integration',['website-integration.js']),('old sales',['sales.js']),('old interactions',['interactions.js']),('old receipt',['paid-order.js']),('old HTML',['index.html'])]
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  for name,old_assets in cases:
   ctx=browser.new_context(viewport={'width':390,'height':844});requests=[];errors=[]
   def route(r):
    path=r.request.url.split('?')[0].removeprefix(origin+'/')
    if path=='api/website/config':r.fulfill(json={'enabled':False,'checkoutEnabled':True,'siteKey':'mock','checkoutContracts':[1,2],'deliveryV2SalesEnabled':True,'deliveryV2Currencies':['INR','USD']})
    elif path=='api/website/checkout':
     body=r.request.post_data_json;requests.append(body)
     assert 'checkoutVersion' not in body,(name,body)
     r.fulfill(json={'orderId':'order_MOCK','keyId':'mock','amount':7500,'currency':'USD'})
    elif path in old_assets:r.fulfill(body=old(path),content_type='text/html' if path.endswith('.html') else 'text/javascript')
    elif r.request.url.startswith(origin+'/'):r.continue_()
    else:r.abort()
   ctx.route('**/*',route)
   ctx.add_init_script("window.open=()=>null;window.sdkOpens=0;window.Razorpay=class{constructor(o){window.sdkOptions=o}on(){}open(){window.sdkOpens++}};window.turnstile={render(b,o){queueMicrotask(()=>o.callback('mock'));return 1},remove(){}}")
   page=ctx.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(origin+'/index.html',wait_until='domcontentloaded');page.evaluate('InviteWebsite.ready');page.evaluate("currentCurrency='USD';renderPricingSection();openOrderDrawerForPackage(4)")
   page.wait_for_timeout(50)
   assert '24' in page.locator('#order-drawer-delivery-tag').inner_text(),(name,'wrong promise')
   assert page.locator('#order-drawer-checkout-btn').is_enabled(),(name,'disabled')
   page.evaluate('proceedFromOrderDrawerToCheckout()');page.wait_for_timeout(50)
   assert len(requests)==1 and requests[0]['express'] is True,(name,requests)
   assert page.evaluate('window.sdkOpens')==1,(name,'SDK not opened')
   assert page.evaluate('window.sdkOptions.amount')==7500
   assert not errors,(name,errors)
   print('PASS',name);ctx.close()
  snapshot={'speed':'express_12h','firstDraftHours':12,'currency':'USD','startsAfter':'payment_and_complete_details'}
  query=urllib.parse.urlencode({'checkout_version':'2','delivery_snapshot':json.dumps(snapshot),'currency':'USD','package':'Dearly','amount':'$93','payment_id':'mock','express':'0'})
  for name,old_asset,expected in [('old receipt HTML','thank-you.html','12 hours'),('old receipt reader','paid-order.js','refresh')]:
   ctx=browser.new_context();page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   def receipt_route(r):
    path=r.request.url.split('?')[0].removeprefix(origin+'/')
    if path==old_asset:r.fulfill(body=old(path),content_type='text/html' if path.endswith('.html') else 'text/javascript')
    elif r.request.url.startswith(origin+'/'):r.continue_()
    else:r.abort()
   ctx.route('**/*',receipt_route);page.goto(origin+'/thank-you.html?'+query,wait_until='domcontentloaded')
   delivery=page.locator('#ty-delivery').inner_text();assert expected in delivery,(name,delivery)
   assert '48 hours' not in urllib.parse.unquote(page.locator('#ty-wa-btn').get_attribute('href'))
   assert not errors,(name,errors)
   print('PASS',name);ctx.close()
  browser.close()
finally:server.shutdown()
