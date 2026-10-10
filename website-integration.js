(() => {
 'use strict';
 let configuration={enabled:false,checkoutEnabled:false}, token='', turnstileReady;
 try{token=sessionStorage.getItem('invitestory.previewToken')||'';}catch{}
 const form=document.getElementById('preview-names-form');
 const notice=document.createElement('p');notice.id='preview-whatsapp-notice';notice.setAttribute('role','status');
 if(form)form.closest('dialog').after(notice);
 async function api(action,data) {
  const response=await fetch('/api/website/'+action,{method:data?'POST':'GET',headers:data?{'Content-Type':'application/json'}:{},body:data?JSON.stringify(data):undefined});
  const result=await response.json();if(!response.ok){const error=new Error(result.error||'Please try again');error.status=response.status;throw error;}return result;
 }
 const ready=api('config').then(c=>{configuration=c;return c;}).catch(error=>{if(error.status>=500)configuration={enabled:false,checkoutEnabled:true,unavailable:true};return configuration;});
 function verification(action) {
  if(!configuration.siteKey)return Promise.reject(new Error('WhatsApp saving is unavailable'));
  if(!turnstileReady)turnstileReady=new Promise((resolve,reject)=>{
   if(window.turnstile){resolve();return;}
   const s=document.createElement('script');s.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';s.onload=resolve;s.onerror=()=>reject(new Error('Verification could not load'));document.head.append(s);
  });
  return turnstileReady.then(()=>new Promise((resolve,reject)=>{
   const box=document.createElement('div');box.className='website-verification';document.body.append(box);
   const timer=setTimeout(()=>finish(new Error('Verification timed out. Please try again.')),120000);
   let widget;
   function finish(error,value){clearTimeout(timer);if(widget!==undefined)window.turnstile.remove(widget);box.remove();error?reject(error):resolve(value);}
   widget=window.turnstile.render(box,{sitekey:configuration.siteKey,action,callback:value=>finish(null,value),'error-callback':()=>finish(new Error('Verification failed')),'expired-callback':()=>finish(new Error('Verification expired'))});
  }));
 }
 function selected(){return typeof previewState!=='undefined'?TEMPLATE_DATABASE[previewState.currentIndex]:null;}
 function storeToken(value){token=value;try{sessionStorage.setItem('invitestory.previewToken',value);}catch{}}
 ready.then(async c=>{
  if(c.enabled&&form) {
   const fields=document.createElement('details');fields.className='preview-whatsapp-fields';
   fields.innerHTML='<summary>Save this preview on WhatsApp <span>(optional)</span></summary><p>Keep the link for later. You can preview your names without a number.</p><label>WhatsApp number <span>(optional)</span><input name="whatsapp" type="tel" autocomplete="tel" maxlength="25" placeholder="+91" data-private="true" data-clarity-mask="true" class="ph-no-capture"></label><label class="preview-whatsapp-consent"><input name="whatsappConsent" type="checkbox"><span></span></label>';
   fields.querySelector('.preview-whatsapp-consent span').textContent=c.consentWording;
   form.querySelector('.preview-names-actions').before(fields);
   form.addEventListener('reset',()=>{fields.querySelector('[name=whatsappConsent]').checked=false;});
   form.addEventListener('submit',()=>{
    const phone=fields.querySelector('[name=whatsapp]').value.trim(),consent=fields.querySelector('[name=whatsappConsent]').checked,design=selected();
    if(!phone||!consent||!design)return;
    const first=form.elements.first.value.trim(),second=form.elements.second.value.trim();
    if((!first&&!second)||[first,second].some(n=>! /^[\p{L}\p{M}\p{N} .’'\-]*$/u.test(n)))return;
    notice.textContent='Saving your preview for later…';
    const attribution={};for(const k of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term']){try{attribution[k]=new URLSearchParams(location.search).get(k)||sessionStorage.getItem('ist_'+k)||'';}catch{}}
    const snapshot={phone,first,second,designId:design.id,consent:true,consentVersion:c.consentVersion,attribution};
    const key=JSON.stringify(snapshot);
    let clientKey=crypto.randomUUID();try{const prior=JSON.parse(sessionStorage.getItem('invitestory.captureRetry')||'null');if(prior?.key===key)clientKey=prior.clientKey;else sessionStorage.setItem('invitestory.captureRetry',JSON.stringify({key,clientKey}));}catch{}
    verification('capture').then(turnstileToken=>api('capture',{...snapshot,clientKey,turnstileToken})).then(result=>{
     storeToken(result.token);notice.replaceChildren();fields.querySelector('[name=whatsappConsent]').checked=false;
     if(result.verified){notice.textContent='Your preview is saved.';return;}
     notice.append('Your names are ready. Send the prefilled WhatsApp message to confirm where to save your preview. ');
     const link=document.createElement('a');link.textContent='Confirm on WhatsApp';link.href='https://wa.me/'+c.businessNumber.replace(/\D/g,'')+'?text='+encodeURIComponent('Please send my saved InviteStory preview.\nPREVIEW '+result.verification);link.target='_blank';link.rel='noopener';notice.append(link);const saved=document.createElement('a');saved.textContent='Open saved preview';saved.href=location.origin+'/#saved-preview='+result.token;notice.append(' · ',saved);
    }).catch(()=>{notice.textContent='Your names are previewed. WhatsApp saving did not complete; edit names to try again.';});
   });
  }
  const hash=new URLSearchParams(location.hash.slice(1)),saved=hash.get('saved-preview');
  if(saved&&/^[a-f0-9]{64}$/.test(saved)) {
   // Remove the bearer token from the visible URL before other interactions.
   history.replaceState(null,'',location.pathname+location.search);
   try {
    const result=await api('restore',{token:saved});storeToken(saved);
    sessionStorage.setItem('invitestory.previewNames',JSON.stringify({first:result.first,second:result.second}));sessionStorage.setItem('invitestory.previewNamesPromptSeen','1');
    if(form){form.elements.first.value=result.first;form.elements.second.value=result.second;}
    if(window.InvitePreviewNames)window.InvitePreviewNames.restore({first:result.first,second:result.second});
    openPreview(result.designId);
   }catch{notice.textContent='This saved preview is unavailable. You can create a new preview.';}
  }
 });
 let lastActivity=0;
 function activity(){
  if(!token||Date.now()-lastActivity<60000||!document.getElementById('preview-modal')?.classList.contains('is-open'))return;
  const design=selected();if(!design)return;lastActivity=Date.now();api('activity',{token,designId:design.id}).catch(()=>{});
 }
 window.addEventListener('pointerdown',activity,{passive:true});
 const frame=document.getElementById('preview-modal-iframe');
 frame?.addEventListener('load',()=>{
  try{frame.contentWindow.addEventListener('pointerdown',activity,{passive:true});frame.contentWindow.addEventListener('scroll',activity,{passive:true});activity();}catch{}
 });
 const checkoutStorageKey='invitestory.checkoutRetry',checkoutInFlight=new Map();
 const uuidPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
 let checkoutAttempts;
 function checkoutStorageError(){return new Error('Checkout could not safely save your payment attempt. Please allow browser storage or contact us before retrying.');}
 function readCheckoutAttempts(){
  try{
   const raw=sessionStorage.getItem(checkoutStorageKey);if(raw===null)return [];
   const saved=JSON.parse(raw),attempts=Array.isArray(saved?.attempts)?saved.attempts:[saved];
   const keys=new Set(),ids=new Set();
   for(const attempt of attempts){
    if(!attempt||typeof attempt.key!=='string'||!uuidPattern.test(attempt.clientKey)||keys.has(attempt.key)||ids.has(attempt.clientKey))throw checkoutStorageError();
    keys.add(attempt.key);ids.add(attempt.clientKey);
   }
   return attempts;
  }catch{throw checkoutStorageError();}
 }
 function checkoutAttemptId(){
  if(typeof globalThis.crypto?.randomUUID==='function')return crypto.randomUUID();
  if(typeof globalThis.crypto?.getRandomValues!=='function')throw new Error('Secure checkout is not supported in this browser. Please use an updated browser.');
  const bytes=crypto.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
  const hex=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
 }
 function checkoutKey(key){
  const saved=readCheckoutAttempts();
  if(!checkoutAttempts)checkoutAttempts=saved;
  // Do not rotate IDs after an uncertain response, storage failure, or selection change.
  if(saved.some(a=>!checkoutAttempts.some(b=>a.key===b.key&&a.clientKey===b.clientKey)))throw checkoutStorageError();
  let attempt=checkoutAttempts.find(a=>a.key===key);
  if(!attempt){attempt={key,clientKey:checkoutAttemptId()};checkoutAttempts.push(attempt);}
  const value=JSON.stringify({attempts:checkoutAttempts});
  try{sessionStorage.setItem(checkoutStorageKey,value);if(sessionStorage.getItem(checkoutStorageKey)!==value)throw checkoutStorageError();}catch{throw checkoutStorageError();}
  return attempt.clientKey;
 }
 const speedHours={standard_48h:48,express_24h:24,express_12h:12};
 function v2Supported(currency='INR'){return configuration.checkoutEnabled===true&&Array.isArray(configuration.checkoutContracts)&&configuration.checkoutContracts.includes(2)&&(configuration.deliveryV2Currencies===undefined?currency==='INR':Array.isArray(configuration.deliveryV2Currencies)&&configuration.deliveryV2Currencies.includes(currency));}
 function validateSelection(selection){
  if(selection.checkoutVersion===2){
   const allowed=['checkoutVersion','deliverySpeed','designId','tier','currency','emailRsvp','token'];
   if(Object.keys(selection).some(k=>!allowed.includes(k))||!['INR','USD'].includes(selection.currency)||typeof selection.deliverySpeed!=='string'||!Object.hasOwn(speedHours,selection.deliverySpeed)||typeof selection.emailRsvp!=='boolean'||![2,3,4].includes(selection.tier))throw new Error('This delivery option is not available in secure checkout yet. Please contact our team.');
  }else if(['checkoutVersion','deliverySpeed','deliveryAddon','deliveryHours','deliverySnapshot','firstDraftHours'].some(field=>Object.hasOwn(selection,field)))throw new Error('This delivery option is not available in secure checkout yet. Please contact our team.');
 }
 function validateResponse(result,request){
  if(request.checkoutVersion!==2)return;
  const snap=result.deliverySnapshot,fee=(request.currency==='INR'?{standard_48h:0,express_24h:79900,express_12h:149900}:{standard_48h:0,express_24h:900,express_12h:1800})[request.deliverySpeed];
  if(result.checkoutVersion!==2||result.deliverySpeed!==request.deliverySpeed||result.currency!==request.currency||!Number.isSafeInteger(result.amount)||result.amount<=0||!snap||snap.speed!==request.deliverySpeed||snap.firstDraftHours!==speedHours[request.deliverySpeed]||snap.surcharge!==fee||snap.currency!==request.currency||snap.startsAfter!=='payment_and_complete_details')throw new Error('The checkout delivery promise could not be verified. Please contact our team before paying.');
 }
 async function submitCheckout(request,savedAttempt){
  validateSelection(request);await ready;
  if(configuration.unavailable)throw new Error('Secure checkout is temporarily unavailable. Please try again or contact us.');
  const key=savedAttempt?.key||JSON.stringify(request);
  if(request.checkoutVersion===2){
   if(!v2Supported(request.currency))throw new Error('This delivery option is not available in secure checkout yet. Please contact our team.');
   if(configuration.deliveryV2SalesEnabled!==true&&!readCheckoutAttempts().some(a=>a.key===key))throw new Error('New delivery bookings are currently unavailable. Saved payments can still be resumed.');
  }
  if(!configuration.checkoutEnabled){if(savedAttempt)throw new Error('Secure checkout is temporarily unavailable.');return null;}
  if(window.isSecureContext!==true)throw new Error('Please open this page over HTTPS to use secure checkout.');
  if(checkoutInFlight.has(key))return checkoutInFlight.get(key);
  const clientKey=checkoutKey(key);
  if(savedAttempt&&savedAttempt.clientKey!==clientKey)throw checkoutStorageError();
  const pending=(async()=>{
   const result=await api('checkout',{...request,clientKey,turnstileToken:await verification('checkout')});
   validateResponse(result,request);return {...result,clientKey,request};
  })();
  checkoutInFlight.set(key,pending);
  try{return await pending;}finally{checkoutInFlight.delete(key);}
 }
 window.InviteWebsite={
  ready,
  deliveryV2Enabled:(currency='INR')=>v2Supported(currency)&&configuration.deliveryV2SalesEnabled===true,
  pendingCheckouts(){return readCheckoutAttempts().map(a=>{let request;try{request=JSON.parse(a.key);validateSelection(request);}catch{return null;}return {clientKey:a.clientKey,request};}).filter(Boolean);},
  async resumeCheckout(clientKey){
   const attempt=readCheckoutAttempts().find(a=>a.clientKey===clientKey);if(!attempt)throw checkoutStorageError();
   // Replay the exact saved JSON identity, including its original preview token.
   return submitCheckout(JSON.parse(attempt.key),attempt);
  },
  async checkout(selection){
   validateSelection(selection);
   return submitCheckout({...selection,token:token||undefined});
  },
  paid(clientKey){
   if(!uuidPattern.test(clientKey))return;
   try{
    const remaining=readCheckoutAttempts().filter(a=>a.clientKey!==clientKey);
    const value=JSON.stringify({attempts:remaining});sessionStorage.setItem(checkoutStorageKey,value);
    if(sessionStorage.getItem(checkoutStorageKey)===value)checkoutAttempts=remaining;
   }catch{} // Retain the existing IDs if cleanup fails; never manufacture a replacement.
  }
 };
})();
