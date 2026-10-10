import test from 'node:test';
import assert from 'node:assert/strict';
import {quote,switchCurrency} from '../docs/delivery-preview/policy.mjs';
test('approved INR first-draft estimates charge exactly one speed across packages',()=>{
 for(const tier of [2,3,4])for(const [speed,hours,extra] of [['standard',48,0],['express24',24,799],['express12',12,1499]]){
  const q=quote({tier,speed});assert.equal(q.hours,hours);assert.equal(q.delivery,extra);assert.equal(q.total,({2:1999,3:2999,4:4999}[tier])+extra);
 }
 assert.throws(()=>quote({speed:['express24','express12']}),/exactly one/);
});
test('Dearly retains included Email RSVP while INR express is optional',()=>{
 const standard=quote({tier:4,emailRsvp:true}),fast=quote({tier:4,speed:'express12',emailRsvp:true});
 assert.equal(standard.emailRsvp,true);assert.equal(standard.hours,48);assert.equal(fast.rsvp,0);assert.equal(fast.total,6498);
 assert.equal(quote({tier:2,emailRsvp:true}).total,3999);
});
test('USD behavior is unchanged and 12h has no invented price',()=>{
 assert.equal(quote({tier:2,currency:'USD',speed:'express24',emailRsvp:true}).total,62);
 assert.equal(quote({tier:3,currency:'USD'}).total,45);
 const dearly=quote({tier:4,currency:'USD'});assert.equal(dearly.total,75);assert.equal(dearly.hours,24);assert.equal(dearly.emailRsvp,true);
 assert.throws(()=>quote({currency:'USD',speed:'express12'}),/unresolved/);
 const switched=switchCurrency({tier:2,currency:'INR',speed:'express12'},'USD');assert.equal(switched.speed,'standard');assert.equal(quote(switched).total,29);
 assert.equal(quote(switchCurrency(switched,'INR')).total,1999);
});
