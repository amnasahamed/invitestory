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
   const fields=document.createElement('div');fields.className='preview-whatsapp-fields';
   fields.innerHTML='<label>WhatsApp number <span>(optional)</span><input name="whatsapp" type="tel" autocomplete="tel" maxlength="25" placeholder="+91" data-private="true" data-clarity-mask="true" class="ph-no-capture"></label><label class="preview-whatsapp-consent"><input name="whatsappConsent" type="checkbox"><span></span></label>';
   fields.querySelector('.preview-whatsapp-consent span').textContent=c.consentWording;
   form.querySelector('.preview-names-actions').before(fields);
   form.addEventListener('submit',()=>{
    const phone=fields.querySelector('[name=whatsapp]').value.trim(),consent=fields.querySelector('[name=whatsappConsent]').checked,design=selected();
    if(!phone||!consent||!design)return;
    const first=form.elements.first.value.trim(),second=form.elements.second.value.trim();
    if((!first&&!second)||[first,second].some(n=>! /^[\p{L}\p{M}\p{N} .’'\-]*$/u.test(n)))return;
    notice.textContent='Saving your WhatsApp preview…';
    const attribution={};for(const k of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term']){try{attribution[k]=new URLSearchParams(location.search).get(k)||sessionStorage.getItem('ist_'+k)||'';}catch{}}
    const snapshot={phone,first,second,designId:design.id,consent:true,consentVersion:c.consentVersion,attribution};
    const key=JSON.stringify(snapshot);
    let clientKey=crypto.randomUUID();try{const prior=JSON.parse(sessionStorage.getItem('invitestory.captureRetry')||'null');if(prior?.key===key)clientKey=prior.clientKey;else sessionStorage.setItem('invitestory.captureRetry',JSON.stringify({key,clientKey}));}catch{}
    verification('capture').then(turnstileToken=>api('capture',{...snapshot,clientKey,turnstileToken})).then(result=>{
     storeToken(result.token);notice.replaceChildren();
     if(result.verified){notice.textContent='Your preview is saved.';return;}
     notice.append('Confirm your number to receive the saved preview and reminders. ');
     const link=document.createElement('a');link.textContent='Confirm on WhatsApp';link.href='https://wa.me/'+c.businessNumber.replace(/\D/g,'')+'?text='+encodeURIComponent('PREVIEW '+result.verification);link.target='_blank';link.rel='noopener';notice.append(link);
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
 window.InviteWebsite={
  ready,
  async checkout(selection){await ready;if(configuration.unavailable)throw new Error('Secure checkout is temporarily unavailable. Please try again or contact us.');if(!configuration.checkoutEnabled)return null;
   const request={...selection,token:token||undefined},key=JSON.stringify(request);let clientKey;
   try{const prior=JSON.parse(sessionStorage.getItem('invitestory.checkoutRetry')||'null');clientKey=prior?.key===key?prior.clientKey:crypto.randomUUID();sessionStorage.setItem('invitestory.checkoutRetry',JSON.stringify({key,clientKey}));}catch{clientKey=crypto.randomUUID();}
   return api('checkout',{...request,clientKey,turnstileToken:await verification('checkout')});
  },
  paid(){try{sessionStorage.removeItem('invitestory.checkoutRetry');}catch{}}
 };
})();
