import { test } from 'node:test';
import assert from 'node:assert/strict';
import { previewLeadBridge } from '../preview-lead.js';

const url='https://www.invitestory.in/api/preview-lead';
const env={N8N_PREVIEW_LEAD_WEBHOOK:'https://hooks.example/webhook/invitestory-preview-leads'};
const preview_token='eyJmaXJzdCI6IkFuYW55YSIsInNlY29uZCI6IkFhcmF2IiwiZGVzaWduIjoic2h1YmhhLXZpdmFoYW0ifQ';
const valid={first_name:'Ananya',partner_name:'Aarav',whatsapp_number:'+919876543210',country_code:'+91',country:'IN',design_id:5,design_name:'Shubha Vivaham',page_url:'https://www.invitestory.in/?design=shubha-vivaham',personalized_url:`https://www.invitestory.in/?p=${preview_token}`,preview_token,client_key:'123e4567-e89b-42d3-a456-426614174000',utm_source:'instagram',utm_medium:'social',utm_campaign:'wedding'};
const request=(body=valid,origin='https://www.invitestory.in')=>new Request(url,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(body)});

test('preview lead proxy validates and forwards only normalized lead fields',async()=>{
  let forwarded;
  const response=await previewLeadBridge(request(),env,async(target,options)=>{forwarded={target:String(target),options};return Response.json({ok:true});});
  assert.equal(response.status,200);
  assert.equal(forwarded.target,env.N8N_PREVIEW_LEAD_WEBHOOK);
  assert.deepEqual(JSON.parse(forwarded.options.body),valid);
  assert.equal(forwarded.options.headers.Cookie,undefined);
});

test('preview lead proxy rejects cross-origin and invalid personal details',async()=>{
  assert.equal((await previewLeadBridge(request(valid,'https://attacker.example'),env)).status,403);
  assert.equal((await previewLeadBridge(request({...valid,whatsapp_number:'123'}),env)).status,400);
  assert.equal((await previewLeadBridge(request({...valid,page_url:'https://attacker.example/'}),env)).status,400);
  assert.equal((await previewLeadBridge(request({...valid,personalized_url:'https://attacker.example/#names=abc'}),env)).status,400);
  assert.equal((await previewLeadBridge(request({...valid,personalized_url:'https://www.invitestory.in/'}),env)).status,400);
});

test('preview lead proxy fails closed when n8n is missing or unavailable',async()=>{
  assert.equal((await previewLeadBridge(request(),{})).status,503);
  assert.equal((await previewLeadBridge(request(),env,async()=>new Response('',{status:500}))).status,502);
});
