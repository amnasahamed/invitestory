"""Local Chromium QA: no provider traffic; Python Playwright + installed Chromium."""
import functools, http.server, json, pathlib, threading
from playwright.sync_api import sync_playwright
root=pathlib.Path(__file__).resolve().parents[1]
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(root)))
threading.Thread(target=server.serve_forever,daemon=True).start()
origin=f'http://127.0.0.1:{server.server_port}'
results=[]
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  for width,height in [(390,844),(1440,900)]:
   context=browser.new_context(viewport={'width':width,'height':height})
   context.route('**/*',lambda route: route.continue_() if route.request.url.startswith(origin+'/') else route.abort())
   page=context.new_page(); errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
   page.goto(origin+'/docs/delivery-preview/')
   for tier,base in [('2',1999),('3',2999),('4',4999)]:
    page.select_option('#tier',tier)
    for speed,extra,hours in [('standard',0,48),('express24',799,24),('express12',1499,12)]:
     page.check(f'[name=speed][value={speed}]')
     assert page.locator('[name=speed]:checked').count()==1
     assert f'{base+extra:,}' in page.locator('#total').inner_text()
     assert f'{hours} hours' in page.locator('#promise').inner_text()
    if tier=='4': assert page.locator('#rsvp').is_checked() and page.locator('#rsvp').is_disabled()
   page.select_option('#currency','USD')
   assert not page.locator('[value=express12]').is_disabled()
   assert '$75' in page.locator('#total').inner_text()
   assert page.locator('[value=standard]').is_checked()
   page.select_option('#tier','2'); assert '$29' in page.locator('#total').inner_text()
   page.check('[value=express24]');page.check('#rsvp');assert '$62' in page.locator('#total').inner_text()
   page.select_option('#currency','INR');assert '3,999' in page.locator('#total').inner_text()
   assert page.locator('button').is_disabled()
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
   assert not errors,errors
   page.screenshot(path=f'/tmp/delivery-preview-{width}.png',full_page=True)
   results.append(f'{width}px preview: all tiers/speeds, exclusivity, totals, currency, RSVP, no overflow, checkout disabled PASS')
   context.close()
  # Real client, local browser storage and mocked portal responses only.
  context=browser.new_context();state={'fail':True,'ids':[]}
  def route_request(route):
   url=route.request.url
   if url.endswith('/api/website/config'):
    route.fulfill(json={'enabled':True,'checkoutEnabled':True,'siteKey':'mock'})
   elif url.endswith('/api/website/checkout'):
    data=route.request.post_data_json;state['ids'].append(data['clientKey'])
    route.fulfill(status=422 if state['fail'] else 200,json={'error':'Mock rejected'} if state['fail'] else {'amount':199900,'currency':'INR','orderId':'mock-order','keyId':'mock-key'})
   elif url.startswith(origin+'/'):route.continue_()
   else:route.abort()
  context.route('**/*',route_request);page=context.new_page()
  def load_client():
   page.goto(origin+'/docs/delivery-preview/')
   page.evaluate("window.turnstile={render(box,o){queueMicrotask(()=>o.callback('mock'));return 1},remove(){}}")
   page.add_script_tag(url=origin+'/website-integration.js')
  load_client()
  selection={'designId':1,'tier':2,'currency':'INR','express':False,'emailRsvp':False}
  run="async s=>{try{return await InviteWebsite.checkout(s)}catch(e){return {error:e.message}}}"
  assert 'Mock rejected' in page.evaluate(run,selection)['error']
  first=state['ids'][-1];load_client();state['fail']=False
  assert page.evaluate(run,selection)['clientKey']==first
  b=page.evaluate(run,{**selection,'express':True})['clientKey'];assert b!=first
  assert page.evaluate(run,selection)['clientKey']==first
  # A rollback to current main reads the exact stored identity/history.
  import subprocess
  main_source=subprocess.check_output(['git','show','50a1dae:website-integration.js'],cwd=root,text=True)
  page.reload();page.evaluate("window.turnstile={render(box,o){queueMicrotask(()=>o.callback('mock'));return 1},remove(){}}")
  page.add_script_tag(content=main_source)
  assert page.evaluate(run,selection)['clientKey']==first
  assert page.evaluate(run,{**selection,'express':True})['clientKey']==b
  load_client();before=len(state['ids']);assert 'not available' in page.evaluate(run,{**selection,'deliveryHours':12})['error'];assert len(state['ids'])==before
  page.add_script_tag(url=origin+'/paid-order.js')
  assert '24 hours' in page.evaluate("InvitePaidOrder.summary({express:true,deliveryHours:12}).delivery")
  results.append('Chromium mock portal: rejection, reload/A-B-A retries, rollback to main IDs, unsupported speed guard, historic receipt PASS')
  browser.close()
finally:server.shutdown()
print(json.dumps(results,indent=2))
