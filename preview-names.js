(() => {
  'use strict';
  const form=document.getElementById('preview-names-form'), dialog=document.getElementById('preview-names-dialog');
  const preview=document.getElementById('preview-modal'), edit=document.getElementById('preview-names-edit');
  if(!form || !dialog || !preview || !edit)return;
  const key='invitestory.previewNames';
  const first=form.elements.first, second=form.elements.second, status=document.getElementById('preview-names-status');
  const reset=document.getElementById('preview-names-reset'), skip=document.getElementById('preview-names-skip');
  const clean=value=>value.trim().replace(/\s+/g,' ').slice(0,50);
  const valid=value=>!value || /^[\p{L}\p{M}\p{N} .’'\-]+$/u.test(value);
  let applied={};
  try {applied=JSON.parse(sessionStorage.getItem(key))||{};}catch{}
  first.value=applied.first||'';second.value=applied.second||'';
  function sync(){const personalized=Boolean(applied.first||applied.second);edit.textContent=personalized?'Edit names':'Add your names';reset.hidden=!personalized;skip.textContent=personalized?'Keep current names':'Skip for now';}
  function dismiss(){dialog.close();edit.focus({preventScroll:true});}
  function open(){if(dialog.open)return;sync();dialog.showModal();first.focus({preventScroll:true});}
  function reload(){if(typeof PreviewController!=='undefined' && PreviewController){PreviewController.retry('names_changed');return;}const frame=document.getElementById('preview-modal-iframe');if(frame?.getAttribute('src') && frame.getAttribute('src')!=='about:blank')frame.src=frame.src;}
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
    if(typeof trackPostHogEvent==='function')trackPostHogEvent('preview_names_applied',{item_id:String(TEMPLATE_DATABASE[previewState.currentIndex]?.id||'')});
    status.textContent='Names stay in this tab unless you choose WhatsApp saving. Other details are samples.';
    sync();reload();dismiss();
  });
  form.addEventListener('reset',event=>{
    event.preventDefault();try {sessionStorage.removeItem(key);}catch{}
    applied={};first.value='';second.value='';status.textContent='Names stay in this tab unless you choose WhatsApp saving. Other details are samples.';
    sync();reload();dismiss();
  });
  // Show the invitation first. Personalization is available on request.
  function previewChanged(){if(!preview.classList.contains('is-open') && dialog.open)dialog.close();}
  new MutationObserver(previewChanged).observe(preview,{attributes:true,attributeFilter:['class']});
  window.InvitePreviewNames={restore(value){applied=value;first.value=value.first||'';second.value=value.second||'';sync();}};
  sync();previewChanged();
})();
