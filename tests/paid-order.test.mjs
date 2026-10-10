import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const context=vm.createContext({});
vm.runInContext(readFileSync(new URL('../paid-order.js',import.meta.url),'utf8'),context);
const order=context.InvitePaidOrder;
const base={packageName:'Premium',designName:'Grand Line Voyage',amountText:'₹2,998',currency:'INR',paymentId:'pay_example'};
test('paid summary preserves extras, currency, preview names and campaign context',()=>{
 const msg=order.message({...base,addons:['Express 24h Delivery','Email RSVP'],express:true,previewNames:'Amnas & Muhsina',utm_source:'instagram',utm_campaign:'wedding',utm_content:'creative-2'});
 for(const value of ['Grand Line Voyage','Express 24h Delivery, Email RSVP','First draft within 24 hours','₹2,998 (INR)','pay_example','Amnas & Muhsina','instagram / wedding / creative-2'])assert.ok(msg.includes(value),value);
 assert.ok(msg.includes('please confirm'));
});
test('package-only standard purchase asks to confirm design and omits absent names and ads',()=>{
 const msg=order.message({...base,designName:'',addons:[],express:false});
 assert.ok(msg.includes('To be confirmed with your team'));
 assert.ok(msg.includes('None selected'));
 assert.ok(msg.includes('First draft within 48 hours after payment and all required details'));
 assert.ok(!msg.includes('Enquiry source:'));
 assert.ok(!msg.includes('Names used in preview'));
});
test('Dearly included services stay explicit and malformed receipt extras do not break messages',()=>{
 const msg=order.message({...base,packageName:'Dearly',addons:['Express 24h Delivery','Email RSVP (included)'],express:true});
 assert.ok(msg.includes('Email RSVP (included)'));
 assert.equal(order.summary({...base,addons:{unexpected:true}}).addons,'None selected');
});

test('historic express=true remains 24h even with untrusted proposed speed fields',()=>{
 const historic={...base,packageName:'Dearly',express:true,deliverySpeed:'express12',deliveryHours:12,addons:['Express 24h Delivery (included)','Email RSVP (included)']};
 assert.ok(order.summary(historic).delivery.includes('24 hours'));
 assert.ok(order.message(historic).includes('Email RSVP (included)'));
 assert.ok(order.summary({...historic,express:false}).delivery.includes('48 hours'));
});

test('versioned receipts use the immutable speed snapshot and reject invalid promises',()=>{
 for(const [speed,hours] of [['standard_48h',48],['express_24h',24],['express_12h',12]]){
  const details={...base,checkoutVersion:2,express:true,deliverySnapshot:{speed,firstDraftHours:hours,currency:'INR',startsAfter:'payment_and_complete_details'}};
  assert.ok(order.summary(details).delivery.includes(`${hours} hours`));assert.ok(order.summary(details).delivery.includes('including overnight'));
 }
 for(const snapshot of [undefined,{speed:'express_12h',firstDraftHours:24},{speed:['express_12h'],firstDraftHours:12,currency:'INR',startsAfter:'payment_and_complete_details'}])assert.match(order.summary({checkoutVersion:2,express:true,deliverySnapshot:snapshot}).delivery,/unavailable/);
});

test('new USD receipt uses12h snapshot while historical USD Dearly remains24h',()=>{
 const old={...base,currency:'USD',packageName:'Dearly',amountText:'$75',express:true,addons:['Express 24h Delivery (included)','Email RSVP (included)']};
 assert.match(order.summary(old).delivery,/24 hours/);
 const snapshot={speed:'express_12h',firstDraftHours:12,currency:'USD',surcharge:1800,startsAfter:'payment_and_complete_details'};
 assert.match(order.summary({...old,amountText:'$93',checkoutVersion:2,deliverySnapshot:snapshot}).delivery,/12 hours/);
 assert.match(order.summary({...old,checkoutVersion:2,deliverySnapshot:{...snapshot,currency:'INR'}}).delivery,/unavailable/);
});

test('new receipt reader recovers v2 promise from cached old thank-you HTML without reinterpreting historic links',()=>{
 const snapshot={speed:'express_12h',firstDraftHours:12,currency:'USD',startsAfter:'payment_and_complete_details'};
 const query=new URLSearchParams({checkout_version:'2',delivery_snapshot:JSON.stringify(snapshot)});
 const mixed=vm.createContext({URLSearchParams,location:{pathname:'/thank-you.html',search:'?'+query}});
 vm.runInContext(readFileSync(new URL('../paid-order.js',import.meta.url),'utf8'),mixed);
 const details={currency:'USD',express:false};assert.match(mixed.InvitePaidOrder.summary(details).delivery,/12 hours/);
 mixed.location.search='?checkout_version=2&delivery_snapshot=broken';assert.match(mixed.InvitePaidOrder.summary(details).delivery,/unavailable/);
 mixed.location.search='?express=1';assert.match(mixed.InvitePaidOrder.summary({...details,express:true}).delivery,/24 hours/);
 mixed.location.pathname='/index.html';mixed.location.search='?'+query;assert.match(mixed.InvitePaidOrder.summary(details).delivery,/48 hours/);
});
