(() => {
  'use strict';
  const form=document.getElementById('preview-names-form'), dialog=document.getElementById('preview-names-dialog');
  const preview=document.getElementById('preview-modal'), edit=document.getElementById('preview-names-edit');
  if(!form || !dialog || !preview || !edit)return;
  const key='invitestory.previewNames';
  const leadRetryKey='invitestory.previewLeadRetry';
  const first=form.elements.first, second=form.elements.second, mobile=form.elements.mobile, countryCode=form.elements.countryCode, mobileHelp=document.getElementById('preview-mobile-help'), status=document.getElementById('preview-names-status');
  const reset=document.getElementById('preview-names-reset'), skip=document.getElementById('preview-names-skip');
  const next=document.getElementById('preview-names-next'), back=document.getElementById('preview-names-back'), summary=document.getElementById('preview-names-summary');
  const title=document.getElementById('preview-names-title'), intro=dialog.querySelector('.preview-names-intro'), progress=dialog.querySelector('.preview-names-progress'), steps=[...form.querySelectorAll('[data-preview-step]')];
  if(Array.isArray(window.InviteCountryCodes)&&window.InviteCountryCodes.length){
    const flag=iso=>/^[A-Z]{2}$/.test(iso)?String.fromCodePoint(...[...iso].map(letter=>127397+letter.charCodeAt(0))):'🌐';
    countryCode.replaceChildren(...window.InviteCountryCodes.map(item=>{
      const option=document.createElement('option');option.value=item.dial;option.dataset.country=item.iso;option.textContent=`${flag(item.iso)} ${item.dial} — ${item.name}`;option.selected=item.iso==='IN';return option;
    }));
  }
  const clean=value=>value.trim().replace(/\s+/g,' ').slice(0,50);
  const valid=value=>!value || /^[\p{L}\p{M}\p{N} .’'\-]+$/u.test(value);
  let applied={};
  try {applied=JSON.parse(sessionStorage.getItem(key))||{};}catch{}
  function selectCountry(value={}){
    const match=[...countryCode.options].find(option=>value.country ? option.dataset.country===value.country : option.value===(value.countryCode||'+91'));
    countryCode.selectedIndex=Math.max(0,match ? [...countryCode.options].indexOf(match) : 0);
  }
  function currentCountry(){const option=countryCode.options[countryCode.selectedIndex];return {countryCode:option.value,country:option.dataset.country||''};}
  function uuid(){
    if(typeof crypto.randomUUID==='function')return crypto.randomUUID();
    const bytes=crypto.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
    const hex=[...bytes].map(byte=>byte.toString(16).padStart(2,'0')).join('');
    return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
  }
  function attribution(){const values={};for(const name of ['utm_source','utm_medium','utm_campaign']){try{values[name]=new URLSearchParams(location.search).get(name)||sessionStorage.getItem('ist_'+name)||'';}catch{values[name]='';}}return values;}
  function leadPayload(value){
    const design=typeof TEMPLATE_DATABASE!=='undefined'?TEMPLATE_DATABASE[previewState.currentIndex]:null;if(!design)return null;
    const fingerprint=`${value.first}|${value.second}|${value.countryCode}|${value.mobile}|${design.id}`;
    let saved;try{saved=JSON.parse(sessionStorage.getItem(leadRetryKey)||'null');}catch{}
    const client_key=saved?.fingerprint===fingerprint&&saved?.payload?.client_key?saved.payload.client_key:uuid();
    const slug=typeof getDesignSlug==='function'?getDesignSlug(design):(design.slug||'');
    const personalized_url=window.InvitePersonalizedLink?.create(value,slug)||'';
    const preview_token=window.InvitePersonalizedLink?.token(value,slug)||'';
    return {first_name:value.first,partner_name:value.second,whatsapp_number:value.countryCode+value.mobile,country_code:value.countryCode,country:value.country,design_id:design.id,design_name:design.name,page_url:location.href,personalized_url,preview_token,client_key,...attribution()};
  }
  async function captureLead(value){
    const payload=value.client_key?value:leadPayload(value);if(!payload)return;
    const fingerprint=`${payload.first_name}|${payload.partner_name}|${payload.country_code}|${payload.whatsapp_number.replace(payload.country_code,'')}|${payload.design_id}`;
    try{sessionStorage.setItem(leadRetryKey,JSON.stringify({fingerprint,payload}));}catch{}
    const response=await fetch('/api/preview-lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),keepalive:true});
    if(!response.ok)throw new Error('Lead capture failed');
    try{const saved=JSON.parse(sessionStorage.getItem(leadRetryKey)||'null');if(saved?.payload?.client_key===payload.client_key)sessionStorage.removeItem(leadRetryKey);}catch{}
  }
  function retryLead(){try{const pending=JSON.parse(sessionStorage.getItem(leadRetryKey)||'null');if(pending?.payload)captureLead(pending.payload).catch(()=>{});}catch{}}
  function syncMobileGuidance(){
    const {country}=currentCountry(),isIndia=country==='IN';
    mobileHelp.textContent=isIndia?'Enter a 10-digit Indian mobile number.':'Enter your mobile number without the country code.';
    mobile.placeholder=isIndia?'98765 43210':'Mobile number';
  }
  first.value=applied.first||'';second.value=applied.second||'';mobile.value=applied.mobile||'';selectCountry(applied);syncMobileGuidance();
  function sync(){const personalized=Boolean(applied.first||applied.second);edit.textContent=personalized?'Edit names':'Try your names';reset.hidden=!personalized;skip.textContent=personalized?'Keep current names':'Not now';}
  function validateNames(){
    const values={first:clean(first.value),second:clean(second.value)};
    if(!values.first||!values.second){status.textContent='Please add both names to continue.';(!values.first?first:second).focus();return null;}
    if(!valid(values.first)||!valid(values.second)){status.textContent='Use letters, spaces, apostrophes, dots or hyphens for names.';return null;}
    return values;
  }
  function showStep(number){
    steps.forEach(step=>{const active=Number(step.dataset.previewStep)===number;step.hidden=!active;step.classList.toggle('is-active',active);});
    [...progress.querySelectorAll('span')].forEach((step,index)=>step.classList.toggle('is-active',index<number));
    progress.setAttribute('aria-label',`Step ${number} of 2`);
    title.textContent=number===1?'See the invitation with your names':'Your invitation is one step away';
    intro.textContent=number===1?'Add both names to personalize the invitation.':'Enter your WhatsApp number to unlock the design with your names.';
    if(number===2){const values=validateNames();if(!values)return showStep(1);summary.textContent=`Previewing ${values.first} & ${values.second}`;mobile.focus({preventScroll:true});}
    else first.focus({preventScroll:true});
  }
  function dismiss(){dialog.close();edit.focus({preventScroll:true});}
  function open(){if(dialog.open)return;sync();dialog.showModal();showStep(1);}
  function reload(){if(typeof PreviewController!=='undefined' && PreviewController){PreviewController.retry('names_changed');return;}const frame=document.getElementById('preview-modal-iframe');if(frame?.getAttribute('src') && frame.getAttribute('src')!=='about:blank')frame.src=frame.src;}
  edit.addEventListener('click',open);
  countryCode.addEventListener('change',syncMobileGuidance);
  next.addEventListener('click',()=>{if(validateNames())showStep(2);});
  back.addEventListener('click',()=>showStep(1));
  skip.addEventListener('click',dismiss);
  document.getElementById('preview-names-close').addEventListener('click',dismiss);
  dialog.addEventListener('cancel',event=>{event.preventDefault();event.stopPropagation();dismiss();});
  // The viewer has its own keyboard handler; the native dialog handles Tab.
  dialog.addEventListener('keydown',event=>{event.stopPropagation();if(event.key==='Escape'){event.preventDefault();dismiss();}});
  dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dismiss();}});
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const names=validateNames();if(!names)return showStep(1);
    const value={...names,mobile:mobile.value.replace(/\D/g,''),...currentCountry()};
    const validMobile=value.country==='IN'?/^[6-9]\d{9}$/.test(value.mobile):/^\d{6,14}$/.test(value.mobile)&&value.countryCode.replace(/\D/g,'').length+value.mobile.length<=15;
    if(!validMobile){status.textContent=value.country==='IN'?'Enter a valid 10-digit Indian mobile number.':'Enter a valid mobile number for the selected country.';mobile.focus();return;}
    try {sessionStorage.setItem(key,JSON.stringify(value));}catch{status.textContent='Your browser could not save names for this tab.';return;}
    applied=value;first.value=value.first;second.value=value.second;mobile.value=value.mobile;
    if(typeof trackPostHogEvent==='function')trackPostHogEvent('preview_names_applied',{item_id:String(TEMPLATE_DATABASE[previewState.currentIndex]?.id||'')});
    captureLead(value).catch(()=>{});
    status.innerHTML='<span aria-hidden="true">✓</span> Your personalized preview is ready.';
    sync();reload();dismiss();
  });
  form.addEventListener('reset',event=>{
    event.preventDefault();try {sessionStorage.removeItem(key);}catch{}
    applied={};first.value='';second.value='';mobile.value='';selectCountry();syncMobileGuidance();status.innerHTML='<span aria-hidden="true">✦</span> Your invitation is waiting—complete both steps to see your names in the design.';
    sync();reload();dismiss();
  });
  // Show the invitation first. Personalization is available on request.
  function previewChanged(){if(!preview.classList.contains('is-open') && dialog.open)dialog.close();}
  new MutationObserver(previewChanged).observe(preview,{attributes:true,attributeFilter:['class']});
  window.InvitePreviewNames={restore(value){applied=value;first.value=value.first||'';second.value=value.second||'';mobile.value=value.mobile||'';selectCountry(value);syncMobileGuidance();sync();}};
  window.addEventListener('online',retryLead);
  retryLead();
  sync();previewChanged();
})();
