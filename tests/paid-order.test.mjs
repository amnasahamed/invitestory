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
