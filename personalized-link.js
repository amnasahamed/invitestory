/* Names-only personalized links. WhatsApp numbers never enter the URL. */
(() => {
  'use strict';
  const storageKey='invitestory.previewNames', parameter='p', legacyParameter='names';
  const clean=value=>typeof value==='string'?value.trim().replace(/\s+/g,' ').slice(0,50):'';
  const valid=value=>Boolean(value)&&/^[\p{L}\p{M}\p{N} .’'\-]+$/u.test(value);
  function encode(value,designSlug=''){
    const design=/^[a-z0-9-]{1,100}$/.test(designSlug)?designSlug:'';
    const bytes=new TextEncoder().encode(JSON.stringify({first:clean(value.first),second:clean(value.second),design}));
    let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);
    return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }
  function decode(token){
    if(typeof token!=='string'||!token||token.length>300)return null;
    try{
      const normalized=token.replace(/-/g,'+').replace(/_/g,'/');
      const binary=atob(normalized+'='.repeat((4-normalized.length%4)%4));
      const bytes=Uint8Array.from(binary,char=>char.charCodeAt(0));
      const value=JSON.parse(new TextDecoder().decode(bytes));
      const first=clean(value.first),second=clean(value.second),design=/^[a-z0-9-]{1,100}$/.test(value.design||'')?value.design:'';
      return valid(first)&&valid(second)?{first,second,design,source:'link'}:null;
    }catch{return null;}
  }
  function create(value,designSlug=''){
    const url=new URL(location.origin+location.pathname);
    url.searchParams.set(parameter,encode(value,designSlug));
    return url.toString();
  }
  const token=(value,designSlug='')=>encode(value,designSlug);
  function restore(){
    const query=new URLSearchParams(location.search),encoded=query.get(parameter)||new URLSearchParams(location.hash.slice(1)).get(legacyParameter),value=decode(encoded);
    if(!value)return null;
    try{sessionStorage.setItem(storageKey,JSON.stringify(value));}catch{return null;}
    if(query.has(parameter)&&value.design&&!query.has('design')&&typeof history!=='undefined'&&history.replaceState){const url=new URL(location.href);url.searchParams.set('design',value.design);history.replaceState(history.state,'',url.toString());}
    return value;
  }
  window.InvitePersonalizedLink={create,decode,restore,token,parameter};
  restore();
})();
