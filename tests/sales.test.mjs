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
  const window = { location, open() {}, matchMedia: () => ({ matches: false }), history: { replaceState() {} }, gtag: (...args) => calls.push(['ga', ...args]), fbq: (...args) => calls.push(['meta', ...args]) };
  const context = vm.createContext({ document, window, location, history: window.history, navigator: { userAgent: 'test', maxTouchPoints: 0 }, localStorage: store, sessionStorage: store, URL, URLSearchParams, console, setTimeout, clearTimeout, queueMicrotask });
  vm.runInContext(readFileSync(new URL('../scripts.js', import.meta.url), 'utf8'), context);
  vm.runInContext(readFileSync(new URL('../sales.js', import.meta.url), 'utf8'), context);
  vm.runInContext(readFileSync(new URL('../interactions.js', import.meta.url), 'utf8'), context);
  return { elements, calls, run: source => vm.runInContext(source, context) };
}

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
  site.run('orderCustomTemplate(21)');
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
  assert.match(site.run('buildWhatsAppMessage(1,true)'),/₹1,999/);
  assert.doesNotMatch(site.run('buildWhatsAppMessage(1,true)'),/Multi-Language|Extra Event|₹299/);
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
