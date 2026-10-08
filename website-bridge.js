// Same-origin gateway. Credentials and provider calls stay on the server.
const allowed = new Set(['config','capture','restore','activity','checkout']);
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
async function limitedBody(request) {
 if(Number(request.headers.get('Content-Length'))>8192)return null;
 if(!request.body)return '';
 const reader=request.body.getReader(),chunks=[];let size=0;
 while(true){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>8192){await reader.cancel();return null;}chunks.push(part.value);}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}return new TextDecoder().decode(bytes);
}
async function forwardWebsiteRequest(request,env={},fetcher=fetch) {
 const url=new URL(request.url),action=url.pathname.split('/').pop();
 if(!allowed.has(action))return json({error:'Not found'},404);
 const enabled=env.WEBSITE_INTEGRATION_ENABLED==='1'&&env.WEBSITE_BRIDGE_SECRET&&env.WEBSITE_PORTAL_ORIGIN;
 if(!enabled)return action==='config'?json({enabled:false,checkoutEnabled:false}):json({error:'Website integration is unavailable'},503);
 if(request.method!==(action==='config'?'GET':'POST'))return json({error:'Method not allowed'},405);
 if(action!=='config'&&request.headers.get('Origin')!==url.origin)return json({error:'Invalid request origin'},403);
 let origin;try{origin=new URL(env.WEBSITE_PORTAL_ORIGIN);}catch{return json({error:'Invalid server configuration'},503);}
 if(origin.protocol!=='https:'&&!(env.WEBSITE_ALLOW_LOCAL==='1'&&['localhost','127.0.0.1'].includes(origin.hostname)))return json({error:'Invalid server configuration'},503);
 let payload;
 if(action!=='config') {
  const text=await limitedBody(request);if(text===null)return json({error:'Request too large'},413);
  try{payload=JSON.parse(text);}catch{return json({error:'Invalid request'},400);}
  if(action==='capture'||action==='checkout') {
   if(!env.WEBSITE_TURNSTILE_SECRET)return json({error:'Verification is not configured'},503);
   const validation=await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:env.WEBSITE_TURNSTILE_SECRET,response:payload.turnstileToken||'',remoteip:request.headers.get('CF-Connecting-IP')||''}),signal:AbortSignal.timeout(10000)});
   const result=await validation.json();
   if(!result.success||result.hostname!==url.hostname||result.action!==action)return json({error:'Please complete verification and try again'},403);
   delete payload.turnstileToken;
  }
 }
 try {
  const response=await fetcher(new URL('/api/website/'+action,origin),{method:request.method,headers:{Authorization:'Bearer '+env.WEBSITE_BRIDGE_SECRET,'Content-Type':'application/json','X-Website-Client-IP':request.headers.get('CF-Connecting-IP')||'local'},body:payload?JSON.stringify(payload):undefined,signal:AbortSignal.timeout(20000)});
  const result=await response.json();
  if(action==='config')return json({...result,enabled:Boolean(result.enabled&&env.WEBSITE_TURNSTILE_SITE_KEY),checkoutEnabled:Boolean(result.checkoutEnabled&&env.WEBSITE_TURNSTILE_SITE_KEY),siteKey:env.WEBSITE_TURNSTILE_SITE_KEY||''},response.status);
  return json(result,response.status);
 }catch{return json({error:'Connection unavailable. Please try again.'},503);}
}

export async function websiteBridge(request,env={},fetcher=fetch) {
 try{return await forwardWebsiteRequest(request,env,fetcher);}
 catch{return json({error:'Connection unavailable. Please try again.'},503);}
}
