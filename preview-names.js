(() => {
  'use strict';
  const form=document.getElementById('preview-names-form'), dialog=document.getElementById('preview-names-dialog');
  const preview=document.getElementById('preview-modal'), edit=document.getElementById('preview-names-edit');
  if(!form || !dialog || !preview || !edit)return;
  const key='invitestory.previewNames', seenKey='invitestory.previewNamesPromptSeen';
  const first=form.elements.first, second=form.elements.second, status=document.getElementById('preview-names-status');
  const reset=document.getElementById('preview-names-reset'), skip=document.getElementById('preview-names-skip');
  const clean=value=>value.trim().replace(/\s+/g,' ').slice(0,50);
  const valid=value=>!value || /^[\p{L}\p{M}\p{N} .’'\-]+$/u.test(value);
  let seen=false, applied={};
  try {applied=JSON.parse(sessionStorage.getItem(key))||{};seen=sessionStorage.getItem(seenKey)==='1';}catch{}
  first.value=applied.first||'';second.value=applied.second||'';
  function sync(){const personalized=Boolean(applied.first||applied.second);edit.textContent='Edit names';reset.hidden=!personalized;skip.textContent=personalized?'Keep current names':'Skip for now';}
  function dismiss(){dialog.close();edit.focus({preventScroll:true});}
  function open(automatic=false){if(dialog.open)return;seen=true;try{sessionStorage.setItem(seenKey,'1');}catch{}sync();dialog.showModal();(automatic===true?document.getElementById('preview-names-title'):first).focus({preventScroll:true});}
  function reload(){if(typeof PreviewController!=='undefined' && PreviewController){PreviewController.retry();return;}const frame=document.getElementById('preview-modal-iframe');if(frame?.getAttribute('src') && frame.getAttribute('src')!=='about:blank')frame.src=frame.src;}
  edit.addEventListener('click',open);
  skip.addEventListener('click',dismiss);
  document.getElementById('preview-names-close').addEventListener('click',dismiss);
  dialog.addEventListener('cancel',event=>{event.preventDefault();event.stopPropagation();dismiss();});
  // The viewer has its own keyboard handler; the native dialog handles Tab.
  dialog.addEventListener('keydown',event=>{event.stopPropagation();if(event.key==='Escape'){event.preventDefault();dismiss();}});
  dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dismiss();}});
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const value={first:clean(first.value),second:clean(second.value)};
    if(!valid(value.first)||!valid(value.second)){status.textContent='Use letters, spaces, apostrophes, dots or hyphens for names.';return;}
    try {sessionStorage.setItem(key,JSON.stringify(value));}catch{status.textContent='Your browser could not save names for this tab.';return;}
    applied=value;first.value=value.first;second.value=value.second;
    status.textContent='Names stay in this browser tab. Other details are samples.';
    sync();reload();dismiss();
  });
  form.addEventListener('reset',event=>{
    event.preventDefault();try {sessionStorage.removeItem(key);}catch{}
    applied={};first.value='';second.value='';status.textContent='Names stay in this browser tab. Other details are samples.';
    sync();reload();dismiss();
  });
  function previewChanged(){if(!preview.classList.contains('is-open')){if(dialog.open)dialog.close();return;}if(!seen && !applied.first && !applied.second)open(true);}
  new MutationObserver(previewChanged).observe(preview,{attributes:true,attributeFilter:['class']});
  sync();previewChanged();
})();
