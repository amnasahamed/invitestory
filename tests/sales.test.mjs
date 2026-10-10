import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function website() {
  const elements = new Map();
  const storage = new Map();
  const calls = [];
  const classList = { add() {}, remove() {}, contains() { return false; } };
  const location = new URL('https://invitestory.in/');
  const store = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
  const document = {
    documentElement: { dataset: {}, classList }, body: { classList },
    getElementById: id => elements.get(id) ?? null,
    querySelector: selector => elements.get(selector) ?? null, querySelectorAll: selector => Array.isArray(elements.get(selector)) ? elements.get(selector) : [], addEventListener() {},
  };
  const window = { location, posthog: { capture: (...args) => calls.push(['posthog', ...args]) }, open: (...args) => calls.push(['open', ...args]), matchMedia: () => ({ matches: false }), history: { replaceState() {} }, gtag: (...args) => calls.push(['ga', ...args]), fbq: (...args) => calls.push(['meta', ...args]) };
  const context = vm.createContext({ document, window, location, history: window.history, navigator: { userAgent: 'test', maxTouchPoints: 0 }, localStorage: store, sessionStorage: store, URL, URLSearchParams, console, setTimeout, clearTimeout, queueMicrotask });
  vm.runInContext(readFileSync(new URL('../scripts.js', import.meta.url), 'utf8'), context);
  vm.runInContext(readFileSync(new URL('../sales.js', import.meta.url), 'utf8'), context);
  vm.runInContext(readFileSync(new URL('../interactions.js', import.meta.url), 'utf8'), context);
  return { elements, calls, run: source => vm.runInContext(source, context) };
}

test('concurrent Pay presses open one checkout and payment cleanup uses the captured attempt ID',async()=>{
 const site=website();
 site.run(`window.opens=0; window.checkouts=0;
  window.InviteWebsite={deliveryV2Enabled:()=>true,checkout(){window.checkouts++;return new Promise(resolve=>window.resolveCheckout=resolve);},paid(key){window.paidKey=key;}};
  var Razorpay=class {constructor(options){window.checkoutOptions=options;}on(){}open(){window.opens++;}};
  handlePaidSuccess=()=>{};orderDrawerState.tier=2;orderDrawerState.total=1999;
 `);
 const pending=site.run('proceedFromOrderDrawerToCheckout()');
 await site.run('proceedFromOrderDrawerToCheckout()');
 assert.equal(site.run('window.checkouts'),1);
 site.run("window.resolveCheckout({clientKey:'00000000-0000-4000-8000-000000000009',orderId:'fixture-order',keyId:'fixture-key',amount:199900,currency:'INR',checkoutVersion:2,deliverySpeed:'standard_48h',deliverySnapshot:{speed:'standard_48h',firstDraftHours:48,surcharge:0,currency:'INR',startsAfter:'payment_and_complete_details'}})");
 await pending;assert.equal(site.run('window.opens'),1);
 assert.equal(site.run('window.checkoutOptions.amount'),199900);
 assert.equal(site.run('window.checkoutOptions.order_id'),'fixture-order');
 site.run("window.checkoutOptions.handler({razorpay_payment_id:'fixture-payment'})");
 assert.equal(site.run('window.paidKey'),'00000000-0000-4000-8000-000000000009');
});

test('checkout failure releases the Pay guard for a deliberate retry without opening the SDK',async()=>{
 const site=website();site.run(`window.attempts=0;window.opens=0;showToast=()=>{};
 window.InviteWebsite={deliveryV2Enabled:()=>true,async checkout(){window.attempts++;throw new Error('Fixture failure');}};
 var Razorpay=class {on(){}open(){window.opens++;}};`);
 await site.run('proceedFromOrderDrawerToCheckout()');await site.run('proceedFromOrderDrawerToCheckout()');
 assert.equal(site.run('window.attempts'),2);assert.equal(site.run('window.opens'),0);
 assert.equal(site.calls.filter(call=>call[0]==='posthog'&&call[1]==='checkout_unavailable').length,2);
});

test('PostHog receives catalogue metadata without form values, contact details or raw searches', () => {
  const site = website();
  site.run("trackConversionEvent('select_design', {item_id:'35', value:4999, currency:'INR', first:'Private name', phone:'Private number', query:'Private search', message:'Private message'})");
  const event = site.calls.find(call => call[0] === 'posthog');
  assert.equal(event[1], 'template_viewed');
  assert.equal(event[2].template_slug, 'dearly-magnolia');
  assert.equal(event[2].template_name, 'Magnolia Reverie');
  assert.equal(event[2].collection, 'Dearly Exclusive');
  assert.equal(event[2].value, 4999);
  for (const key of ['first', 'phone', 'query', 'message']) assert.equal(key in event[2], false);
  assert.equal(site.calls.some(call => call[0] === 'ga' && call[2] === 'select_design'), true);
});

test('PostHog separates WhatsApp intent from checkout and deduplicates browser payment callbacks', () => {
  const site = website();
  site.run("askTemplateOnWhatsApp(35); trackConversionEvent('view_order', {content_ids:['35']}); trackConversionEvent('begin_checkout', {content_ids:['35']});");
  assert.deepEqual(site.calls.filter(call => call[0] === 'posthog').map(call => call[1]), ['whatsapp_cta_clicked', 'order_cta_clicked', 'checkout_started']);
  site.run("trackConversionEvent('purchase', {value:4999}); trackConversionEvent('purchase', {content_ids:['35'], transaction_id:'payment_test', value:4999, currency:'INR'}); trackConversionEvent('purchase', {transaction_id:'payment_test', value:4999});");
  const payments = site.calls.filter(call => call[0] === 'posthog' && call[1] === 'payment_succeeded');
  assert.equal(payments.length, 1);
  assert.equal(payments[0][2].payment_confirmation, 'browser_callback');
  assert.equal(site.calls.some(call => call[0] === 'posthog' && call[1] === 'order_completed'), false);
});

test('a missing or failed PostHog SDK never prevents enquiries or other conversion tracking', () => {
  const site = website();
  site.run("window.posthog = undefined; askTemplateOnWhatsApp(1); window.posthog = {capture(){throw new Error('Unavailable')}}; askTemplateOnWhatsApp(35);");
  assert.equal(site.calls.filter(call => call[0] === 'open').length, 2);
  assert.equal(site.calls.filter(call => call[0] === 'meta' && call[2] === 'Contact').length, 2);
  assert.equal(site.calls.filter(call => call[0] === 'ga' && call[2] === 'whatsapp_click').length, 2);
});

test('local development does not send custom events to the production PostHog project', () => {
  const site = website();
  site.run("window.location.href = 'http://127.0.0.1:7100/'; trackConversionEvent('select_design', {item_id:'35'});");
  assert.equal(site.calls.some(call => call[0] === 'posthog'), false);
});

test('catalogue result counts follow the same collection, style and search filters as the designs shown', () => {
  const site = website();
  assert.equal(site.run('getFilteredTemplates().length'), 35);
  assert.equal(site.run("activeTierFilter = 4; getFilteredTemplates().length"), 4);
  assert.equal(site.run("searchQuery = 'magnolia'; getFilteredTemplates().length"), 1);
  assert.equal(site.run("searchQuery = 'unmatched'; getFilteredTemplates().length"), 0);
  assert.equal(site.run("searchQuery = ''; activeTagFilter = 'traditional'; getFilteredTemplates().length"), 0);
});

test('Premium and Luxury totals charge only selected extras; Dearly charges neither included extra', () => {
  const site = website();
  const express = { checked: false };
  const email = { checked: false };
  site.elements.set('order-drawer-addon-express', express);
  site.elements.set('order-drawer-addon-email-rsvp', email);
  for (const [currency, expected] of [['INR', [1999, 3999, 4798, 4999]], ['USD', [29, 53, 62, 75]]]) {
    site.run(`currentCurrency = '${currency}'; orderDrawerState.isPackage = true; orderDrawerState.tier = 2;`);
    express.checked = false; email.checked = false;
    site.run('updateOrderDrawerTotal()'); assert.equal(site.run('orderDrawerState.total'), expected[0]);
    email.checked = true;
    site.run('updateOrderDrawerTotal()'); assert.equal(site.run('orderDrawerState.total'), expected[1]);
    express.checked = true;
    site.run('updateOrderDrawerTotal()'); assert.equal(site.run('orderDrawerState.total'), expected[2]);
    site.run('orderDrawerState.tier = 4; updateOrderDrawerTotal()'); assert.equal(site.run('orderDrawerState.total'), expected[3]);
  }
  site.run("currentCurrency = 'INR'; orderDrawerState.tier = 3;");
  express.checked = false;
  site.run('updateOrderDrawerTotal()'); assert.equal(site.run('orderDrawerState.total'), 4999);
  express.checked = true;
  site.run('updateOrderDrawerTotal()'); assert.equal(site.run('orderDrawerState.total'), 5798);
});

test('discovery defaults to the full catalogue and preserves shared shortlist order', () => {
  const site = website();
  assert.equal(site.run('getDiscoveryDesigns(TEMPLATE_DATABASE).length'), 35);
  site.run('discovery.shared = [35, 1, 999];');
  assert.equal(site.run('JSON.stringify(getDiscoveryDesigns(TEMPLATE_DATABASE).map(item => item.id))'), '[35,1]');
  site.run('discovery.savedOnly = true; previewFavourites.add(21);');
  assert.equal(site.run('JSON.stringify(getDiscoveryDesigns(TEMPLATE_DATABASE).map(item => item.id))'), '[21]');
});

test('preview arrows traverse all 35 designs across collections and wrap both ways', () => {
  const site = website();
  site.run('const visits=[]; openPreview=id=>{visits.push(id);previewState.currentIndex=TEMPLATE_DATABASE.findIndex(item=>item.id===id);};previewState.currentIndex=0;');
  for (let i=0;i<35;i++) site.run('previewNext()');
  assert.equal(site.run('new Set(visits).size'), 35);
  assert.equal(site.run('previewState.currentIndex'), 0);
  site.run('previewPrev()');
  assert.equal(site.run('previewState.currentIndex'), 34);
  assert.equal(site.run('TEMPLATE_DATABASE[previewState.currentIndex].tier'), 4);
});

test('family sharing includes the correct price and the actual RSVP channel', () => {
  const site = website();
  assert.match(site.run('getDesignShareContent(TEMPLATE_DATABASE.find(item => item.id === 1)).text'), /₹1,999.*[\s\S]*WhatsApp RSVP/);
  assert.match(site.run('getDesignShareContent(TEMPLATE_DATABASE.find(item => item.id === 35)).text'), /₹4,999.*[\s\S]*Email RSVP/);
});

test('retargeting retains design IDs and separates viewing an order from starting payment', () => {
  const site = website();
  site.run("trackConversionEvent('view_order', { content_ids: ['21'], content_name: 'Rajwada Royale', value: 2999 });");
  assert.equal(site.calls.some(call => call[0] === 'meta' && call[2] === 'InitiateCheckout'), false);
  site.run("trackConversionEvent('begin_checkout', { content_ids: ['21'], content_name: 'Rajwada Royale', value: 4999 });");
  const checkout = site.calls.find(call => call[0] === 'meta' && call[2] === 'InitiateCheckout');
  assert.equal(checkout[3].content_ids[0], '21');
  assert.equal(checkout[3].value, 4999);
  site.run("trackConversionEvent('save_design', { content_ids: ['35'], content_name: 'Magnolia Reverie', value: 4999 });");
  assert.equal(site.calls.find(call => call[0] === 'meta' && call[2] === 'AddToWishlist')[3].content_ids[0], '35');
});

test('a catalogue WhatsApp enquiry records Contact without starting a checkout', () => {
  const site = website();
  site.run('askTemplateOnWhatsApp(21)');
  assert.equal(site.calls.some(call => call[0] === 'meta' && call[2] === 'Contact'), true);
  assert.equal(site.calls.some(call => call[0] === 'meta' && call[2] === 'InitiateCheckout'), false);
  assert.equal(site.calls.some(call => call[0] === 'meta' && call[2] === 'Purchase'), false);
});

test('the booking shortcut uses a valid chosen design and remembers a direct order selection', () => {
  const site = website();
  const shortlist = { dataset: {}, innerHTML: '' };
  site.elements.set('saved-designs', shortlist);
  assert.equal(site.run('lastChosenDesign()'), null);
  site.run('renderSavedDesigns()');
  assert.equal(shortlist.dataset.hasChoices, 'false');
  site.run('localStorage.setItem("invitestory_selected_design", "invalid")');
  assert.equal(site.run('lastChosenDesign()'), null);
  site.run('localStorage.setItem("invitestory_selected_design", JSON.stringify({id:999}))');
  assert.equal(site.run('lastChosenDesign()'), null);
  site.run('orderDrawerState.template = TEMPLATE_DATABASE.find(item => item.id === 35); orderDrawerState.tier = 4; onSalesOrderOpen()');
  assert.equal(site.run('lastChosenDesign().id'), 35);
  site.run('orderDrawerState.template = TEMPLATE_DATABASE.find(item => item.id === 1); orderDrawerState.tier = 2; onSalesOrderOpen()');
  assert.equal(site.run('lastChosenDesign().id'), 1);
  assert.equal(shortlist.dataset.hasChoices, 'true');
  assert.match(shortlist.innerHTML, /Marigold Bhavan/);
});

test('delivery planning flags tight schedules and allows room for draft review', () => {
  const site = website();
  site.elements.set('planner-ready-date', { value: '2026-10-10', validity: { valid: true } });
  const share = { value: '2026-10-11', validity: { valid: true } };
  const result = { textContent: '' };
  site.elements.set('planner-share-date', share);
  site.elements.set('delivery-plan-result', result);
  site.run('updateDeliveryPlan()'); assert.match(result.textContent, /tight turnaround/);
  share.value = '2026-10-12'; site.run('updateDeliveryPlan()'); assert.match(result.textContent, /Express gives/);
  share.value = '2026-10-13'; site.run('updateDeliveryPlan()'); assert.match(result.textContent, /Standard gives/);
  share.value = '2026-10-09'; site.run('updateDeliveryPlan()'); assert.match(result.textContent, /before your planned sharing date/);
});

test('the selected design keeps its own collection, price and booking destination across currency and order changes', () => {
  const site = website();
  const note = { hidden: true, innerHTML: '' };
  site.elements.set('pricing-selected-design', note);
  site.run('updateSelectedDesignNote()');
  assert.equal(note.hidden, true);
  site.run('updateSelectedDesignNote(TEMPLATE_DATABASE.find(item => item.id === 25))');
  assert.equal(note.hidden, false);
  assert.match(note.innerHTML, /Lakeview Lanterns.*Luxury.*₹2,999/);
  assert.match(note.innerHTML, /openOrderDrawerForTemplate\(25\)/);
  site.run("currentCurrency = 'USD'; updateSelectedDesignNote(TEMPLATE_DATABASE.find(item => item.id === 25))");
  assert.match(note.innerHTML, /Luxury.*\$45/);
  site.run("currentCurrency = 'INR'; orderDrawerState.template = TEMPLATE_DATABASE.find(item => item.id === 35); orderDrawerState.tier = 4; onSalesOrderOpen()");
  assert.match(note.innerHTML, /Magnolia Reverie.*Dearly.*₹4,999/);
  assert.match(note.innerHTML, /openOrderDrawerForTemplate\(35\)/);
});


test('style recommendations respect tradition and package constraints without invented matches', () => {
  const site = website();
  const ids = JSON.parse(site.run("JSON.stringify(InviteInteractions.rankMatches('botanical','all',4).map(item=>item.id))"));
  assert.equal(ids.length, 3);
  assert.equal(site.run("InviteInteractions.rankMatches('botanical','all',4).every(item=>item.tier===4)"), true);
  assert.equal(site.run("InviteInteractions.rankMatches('traditional','islamic',4).length"), 0);
  assert.equal(site.run("InviteInteractions.rankMatches('unknown','all',0).length"), 0);
});

test('shared shortlist URLs deduplicate, validate and bound IDs while preserving currency', () => {
  const site = website();
  const url = new URL(site.run("InviteInteractions.shortlistURL([35,35,999,1], 'USD', 'https://invitestory.in/?design=old#pricing')"));
  assert.equal(url.searchParams.get('shortlist'), '35,1');
  assert.equal(url.searchParams.get('currency'), 'USD');
  assert.equal(url.searchParams.has('design'), false);
  assert.equal(url.hash, '');
  const large = new URL(site.run("InviteInteractions.shortlistURL(TEMPLATE_DATABASE.map(item=>item.id), 'invalid', 'https://invitestory.in/')"));
  assert.equal(large.searchParams.get('shortlist').split(',').length, 12);
  assert.equal(large.searchParams.get('currency'), 'INR');
});

test('return context rejects expired data and repairs unavailable designs and invalid filters', () => {
  const site = website();
  assert.equal(site.run('InviteInteractions.validateContext({version:1,updated:Date.now()-15*86400000})'), null);
  assert.equal(site.run('InviteInteractions.validateContext({version:2,updated:Date.now()})'), null);
  const repaired = JSON.parse(site.run("JSON.stringify(InviteInteractions.validateContext({version:1,updated:Date.now(),query:'floral',tag:'our-picks',tier:99,recommendations:[35,999,35],shared:null,scroll:-9,curated:true,reasons:[[35,'Botanical'],[999,'Missing']]}))"));
  assert.equal(repaired.query, 'floral');
  assert.equal(repaired.tag, 'all');
  assert.equal(repaired.tier, 0);
  assert.deepEqual(repaired.recommendations, [35]);
  assert.equal(repaired.scroll, 0);
  assert.deepEqual(repaired.reasons, [[35,'Botanical']]);
});


test('Dearly showroom uses its checkout USD price and retired ₹299 extras never enter orders', () => {
  const site = website();
  const showroom = {textContent:''};
  const pill = {textContent:''};
  site.elements.set('.dearly-price-amount',showroom);
  site.elements.set('.dearly-card-price-pill',[pill]);
  site.run("currentCurrency = 'USD'; updateTierLabels()");
  assert.equal(showroom.textContent,'$75');
  assert.equal(pill.textContent,'$75');
  site.run("currentCurrency = 'INR'");
  site.elements.set('addon-lang-1',{checked:true});
  assert.equal(site.run('ADDONS.lang'),undefined);
  site.run('askTemplateOnWhatsApp(1)');
  const message=new URL(site.calls.find(call=>call[0]==='open')[1]).searchParams.get('text');
  assert.match(message,/₹1,999/);
  assert.doesNotMatch(message,/Multi-Language|Extra Event|₹299/);
});


test('bespoke quote uses the INR equivalent plus 30% in every USD enquiry surface', () => {
  const site = website();
  const header = {innerHTML:'',title:''};
  const modal = {classList:{add(){},remove(){}},setAttribute(){}};
  const price = {textContent:''};
  const whatsapp = {href:''};
  site.elements.set('.header-cta',[header]);
  site.elements.set('custom-modal',modal);
  site.elements.set('custom-modal-price',price);
  site.elements.set('custom-modal-wa-btn',whatsapp);
  site.run("currentCurrency = 'USD'; updateHeaderCtaText(); openCustomModal()");
  assert.equal(site.run('BESPOKE_PRICING.usd'),161);
  assert.match(header.innerHTML,/from \$161/);
  assert.equal(price.textContent,'$161');
  assert.match(new URL(whatsapp.href).searchParams.get('text'),/starting at \$161/);
  whatsapp.onclick();
  assert.ok(site.calls.some(call => call[0]==='ga' && call[3]?.value===161));
  site.run("currentCurrency = 'INR'; openCustomModal()");
  assert.equal(price.textContent,'₹12,000');
});

test('payment reassurance follows standard, Express and included Dearly timing', () => {
  const site = website();
  const reassurance = {textContent:''};
  const modal = {querySelector: selector => selector === '.order-drawer-guarantee' ? reassurance : null, querySelectorAll: () => []};
  const express = {checked:false};
  site.elements.set('order-drawer-modal', modal);
  site.elements.set('order-drawer-addon-express', express);
  site.run('orderDrawerState.tier = 2; updateSalesOrder()');
  assert.match(reassurance.textContent, /48h after payment and complete details/);
  express.checked = true;
  site.run('updateSalesOrder()');
  assert.match(reassurance.textContent, /24h after payment and complete details/);
  express.checked = false;
  site.run('orderDrawerState.tier = 4; updateSalesOrder()');
  assert.match(reassurance.textContent, /24h after payment and complete details/);
});

test('preview performance events retain timing and outcome without personalized values', () => {
  const site = website();
  site.run("trackPostHogEvent('template_preview_ended', {item_id:'29', elapsed_ms:8300, retry_count:1, preview_device:'mobile', preview_ready:false, exit_reason:'close', first:'Private name', phone:'Private number', previewUrl:'https://example.com/?name=private'})");
  const event=site.calls.find(call=>call[0]==='posthog');
  assert.equal(event[1],'template_preview_ended');
  assert.equal(event[2].template_name,'Seashell Vows');
  assert.equal(event[2].elapsed_ms,8300);assert.equal(event[2].retry_count,1);
  assert.equal(event[2].preview_ready,false);assert.equal(event[2].exit_reason,'close');
  for(const key of ['first','phone','previewUrl'])assert.equal(key in event[2],false);
});

test('server quote mismatch or rejection never opens payment or clears retry identity',async()=>{
 for(const response of ['{amount:1,currency:"INR"}','{amount:199900,currency:"USD"}','null']){
  const site=website();site.run(`window.opens=0;window.cleaned=0;window.InviteWebsite={deliveryV2Enabled:()=>true,checkout:async()=>{${response==='null'?'throw new Error("Mock backend rejection")':`return ${response}`}},paid(){window.cleaned++;}};var Razorpay=class {constructor(){} on(){} open(){window.opens++;}};showToast=()=>{};orderDrawerState.tier=2;orderDrawerState.total=1999;`);
  await site.run('proceedFromOrderDrawerToCheckout()');assert.equal(site.run('window.opens'),0);assert.equal(site.run('window.cleaned'),0);
 }
});

test('v2 INR totals charge exactly one speed including Dearly; RSVP stays included',()=>{
 const site=website(),radio={value:'standard_48h'},email={checked:true};
 site.elements.set('input[name="order-delivery-speed"]:checked',radio);site.elements.set('order-drawer-addon-email-rsvp',email);
 site.run('window.InviteWebsite={deliveryV2Enabled:()=>true};orderDrawerState.isPackage=true;');
 for(const tier of [2,3,4])for(const [speed,fee,hours] of [['standard_48h',0,48],['express_24h',799,24],['express_12h',1499,12]]){
  radio.value=speed;site.run(`orderDrawerState.tier=${tier};updateOrderDrawerTotal()`);
  assert.equal(site.run('orderDrawerState.total'),({2:1999,3:2999,4:4999}[tier])+fee+(tier===4?0:2000));assert.equal(site.run('deliveryHoursForOrder()'),hours);
 }
});

test('success receipt link carries versioned delivery while legacy links stay legacy',()=>{
 const site=website(),link={href:''};site.elements.set('payment-success-modal',{classList:{add(){}},setAttribute(){}});site.elements.set('pay-success-thankyou-link',link);
 site.run(`var InvitePaidOrder={summary:()=>({addons:'',delivery:''})};showPaymentSuccess({packageName:'Dearly',amountText:'₹6,498',paymentId:'mock',checkoutVersion:2,deliverySnapshot:{speed:'express_12h',firstDraftHours:12,currency:'INR',startsAfter:'payment_and_complete_details'}})`);
 const q=new URL(link.href,'https://example.test').searchParams;assert.equal(q.get('checkout_version'),'2');assert.equal(JSON.parse(q.get('delivery_snapshot')).firstDraftHours,12);
 site.run("showPaymentSuccess({packageName:'Dearly',amountText:'₹4,999',paymentId:'old',express:true})");assert.equal(new URL(link.href,'https://example.test').searchParams.has('checkout_version'),false);
});

test('resumed checkout uses the saved design and original terms even when another design is selected',async()=>{
 const site=website();site.run(`window.InviteWebsite={};window.opened=0;var Razorpay=class {constructor(o){window.options=o}on(){}open(){window.opened++}};orderDrawerState.template=TEMPLATE_DATABASE.find(d=>d.id===35);`);
 await site.run(`proceedFromOrderDrawerToCheckout({request:{designId:1,tier:2,currency:'INR',express:true,emailRsvp:false},secure:{orderId:'order_saved',keyId:'mock',amount:279800,currency:'INR',clientKey:'saved'}})`);
 assert.equal(site.run('window.opened'),1);assert.equal(site.run('window.options.notes.template_id'),'1');assert.equal(site.run('window.options.amount'),279800);
});

test('USD versioned totals keep base and RSVP prices, charge one speed for all packages',()=>{
 const site=website(),radio={value:'standard_48h'},email={checked:true};
 site.elements.set('input[name="order-delivery-speed"]:checked',radio);site.elements.set('order-drawer-addon-email-rsvp',email);
 site.run("window.InviteWebsite={deliveryV2Enabled:()=>true};currentCurrency='USD';orderDrawerState.isPackage=true;");
 for(const tier of [2,3,4])for(const [speed,fee,hours] of [['standard_48h',0,48],['express_24h',9,24],['express_12h',18,12]]){
  radio.value=speed;site.run(`orderDrawerState.tier=${tier};updateOrderDrawerTotal()`);
  assert.equal(site.run('orderDrawerState.total'),({2:29,3:45,4:75}[tier])+fee+(tier===4?0:24));assert.equal(site.run('deliveryHoursForOrder()'),hours);
 }
});
