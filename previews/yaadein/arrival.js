export function initArrival({isReduced,unwrapEnvelope}){
 const dialog=document.querySelector('#arrival'),seal=document.querySelector('#arrival-open'),enter=document.querySelector('#arrival-enter'),letter=document.querySelector('#arrival-message');
 if(!dialog||!dialog.showModal)return;
 const wax=document.querySelector('#arrival-wax');
 let opened=false,leaving=false,finishTimer=0,readyTimer=0,lastFocus=null;
 const root=document.documentElement;
 function reset(){clearTimeout(finishTimer);clearTimeout(readyTimer);opened=false;leaving=false;dialog.classList.remove('is-unsealed','is-leaving');seal.disabled=false;seal.hidden=false;wax.disabled=false;wax.hidden=false;seal.setAttribute('aria-expanded','false');enter.hidden=true;letter.setAttribute('aria-hidden','true');document.querySelector('#arrival-status').textContent='';}
 function show(){if(dialog.open)return;lastFocus=document.activeElement;reset();dialog.showModal();root.classList.add('arrival-active');dialog.scrollTop=0;seal.focus({preventScroll:true});}
 function close(){clearTimeout(finishTimer);clearTimeout(readyTimer);if(dialog.open)dialog.close();root.classList.remove('arrival-active');if(lastFocus&&lastFocus!==document.body&&lastFocus.isConnected)lastFocus.focus({preventScroll:true});else{const h=document.querySelector('#beginning h1');h.setAttribute('tabindex','-1');h.focus({preventScroll:true});}}
 function finish(skip=false){if(leaving){if(skip)close();return;}leaving=true;clearTimeout(readyTimer);if(opened)unwrapEnvelope(false);if(!skip){window.scrollTo({top:0,behavior:'instant'});lastFocus=null;}if(isReduced()||skip){close();return;}dialog.classList.add('is-leaving');finishTimer=setTimeout(close,560);}
 seal.addEventListener('click',()=>{
  if(opened)return;opened=true;seal.disabled=true;wax.disabled=true;seal.setAttribute('aria-expanded','true');letter.setAttribute('aria-hidden','false');dialog.classList.add('is-unsealed');
  document.querySelector('#arrival-status').textContent='The letter is open. We kept a place for you. Before the music, before the photographs, there is this: we hope you’ll be there.';
  const ready=()=>{seal.hidden=true;wax.hidden=true;enter.hidden=false;enter.focus({preventScroll:true});};
  if(isReduced())ready();else readyTimer=setTimeout(ready,1050);
 });
 wax.addEventListener('click',()=>seal.click());
 enter.addEventListener('click',()=>finish(false));
 document.querySelector('#arrival-skip').addEventListener('click',()=>finish(true));
 dialog.addEventListener('cancel',e=>{e.preventDefault();finish(true);});
 dialog.addEventListener('close',()=>{root.classList.remove('arrival-active');clearTimeout(finishTimer);clearTimeout(readyTimer);});
 document.querySelector('#replay-arrival').addEventListener('click',show);
 window.addEventListener('hashchange',()=>{if(location.hash&&dialog.open)finish(true);});
 // A direct link to event details never gets a decorative gate.
 if(!location.hash)show();
}
