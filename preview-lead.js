const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});

async function readJson(request){
  if(Number(request.headers.get('Content-Length'))>4096)return null;
  const text=await request.text();
  if(text.length>4096)return null;
  try{return JSON.parse(text);}catch{return null;}
}

const clean=(value,max)=>typeof value==='string'?value.trim().slice(0,max):'';
const validName=value=>value.length>0&&value.length<=50&&/^[\p{L}\p{M}\p{N} .’'\-]+$/u.test(value);

export async function previewLeadBridge(request,env={},fetcher=fetch){
  if(request.method!=='POST')return json({error:'Method not allowed'},405);
  const requestUrl=new URL(request.url);
  if(request.headers.get('Origin')!==requestUrl.origin)return json({error:'Invalid request origin'},403);
  const payload=await readJson(request);
  if(!payload)return json({error:'Invalid request'},400);

  const first_name=clean(payload.first_name,50),partner_name=clean(payload.partner_name,50);
  const whatsapp_number=clean(payload.whatsapp_number,20),country_code=clean(payload.country_code,8),country=clean(payload.country,2).toUpperCase();
  const design_id=Number(payload.design_id),design_name=clean(payload.design_name,100),page_url=clean(payload.page_url,500),personalized_url=clean(payload.personalized_url,1000),preview_token=clean(payload.preview_token,400),client_key=clean(payload.client_key,100);
  if(!validName(first_name)||!validName(partner_name)||!/^\+[1-9]\d{6,14}$/.test(whatsapp_number)||!/^\+[1-9]\d{0,3}$/.test(country_code)||!/^[A-Z]{2}$/.test(country)||!Number.isSafeInteger(design_id)||design_id<=0||!design_name||!/^[A-Za-z0-9_-]{20,400}$/.test(preview_token)||!/^[-0-9a-f]{36}$/i.test(client_key))return json({error:'Invalid lead details'},400);
  try{const page=new URL(page_url);if(page.origin!==requestUrl.origin)return json({error:'Invalid page URL'},400);}catch{return json({error:'Invalid page URL'},400);}
  try{const personalized=new URL(personalized_url);if(personalized.origin!==requestUrl.origin||personalized.searchParams.get('p')!==preview_token)return json({error:'Invalid personalized URL'},400);}catch{return json({error:'Invalid personalized URL'},400);}

  let webhook;
  try{webhook=new URL(env.N8N_PREVIEW_LEAD_WEBHOOK);}catch{return json({error:'Lead capture is not configured'},503);}
  if(webhook.protocol!=='https:')return json({error:'Lead capture is not configured'},503);
  const body={first_name,partner_name,whatsapp_number,country_code,country,design_id,design_name,page_url,personalized_url,preview_token,client_key,
    utm_source:clean(payload.utm_source,100),utm_medium:clean(payload.utm_medium,100),utm_campaign:clean(payload.utm_campaign,150)};
  try{
    const response=await fetcher(webhook,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(10000)});
    if(!response.ok)return json({error:'Lead capture is temporarily unavailable'},502);
    return json({ok:true});
  }catch{return json({error:'Lead capture is temporarily unavailable'},503);}
}
