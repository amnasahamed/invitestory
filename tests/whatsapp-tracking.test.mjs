import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../whatsapp-tracking.js', import.meta.url), 'utf8');
function setup(pathname, hostname='invitestory.in') {
  let listener; const events=[];
  const window={location:{pathname,hostname},posthog:{capture:(...args)=>events.push(args)}};
  vm.runInNewContext(source,{URL,window,document:{addEventListener:(name,fn)=>{listener=fn}}});
  const link={href:'https://wa.me/123?text=PRIVATE',id:'',closest:()=>null,classList:{contains:()=>false}};
  return {events,window,link,click:()=>listener({target:{closest:()=>link}})};
}
test('standalone page aliases capture only fixed metadata',()=>{
  for(const path of ['/dearly','/dearly/','/dearly.html','/blog/','/blog/index.html','/privacy-policy.html','/terms.html','/refund-and-editing-policy.html','/thank-you.html']) {
    const s=setup(path);s.click();assert.equal(s.events.length,1,path);
    assert.equal(s.events[0][0],'whatsapp_cta_clicked');
    assert.deepEqual(Object.keys(s.events[0][1]).sort(),['cta_location','destination','source_event']);
    assert.doesNotMatch(JSON.stringify(s.events),/PRIVATE|123/);
  }
});
test('standalone tracking excludes unrelated destinations, local hosts and unsupported pages, and tolerates SDK failures',()=>{
  const s=setup('/dearly/');s.link.href='https://example.com/?wa.me';s.click();assert.equal(s.events.length,0);
  for(const s of [setup('/unknown'),setup('/dearly','localhost')]) {s.click();assert.equal(s.events.length,0);}
  s.link.href='https://wa.me/123';s.window.posthog=undefined;assert.doesNotThrow(s.click);
  s.window.posthog={capture(){throw Error('offline')}};assert.doesNotThrow(s.click);
});
