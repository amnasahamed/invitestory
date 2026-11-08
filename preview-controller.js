/* Preview lifecycle: one owner for navigation, readiness, retry and cleanup. */
  function previewDocumentReady(doc, pathname) {
    if(!doc?.body || doc.readyState==='loading' || doc.location.pathname.replace(/\/$/,'')!==pathname.replace(/\/$/,''))return false;
    // Content can render before a slow stylesheet arrives. Never reveal the
    // unstyled DOM, but don't wait for optional third-party fonts or media.
    if(previewPendingStyles(doc).length)return false;
    const text=doc.body.innerText.trim();
    if(/^(404\b|Not Found\b)/i.test(text))return false;
    // Usable text or artwork is enough. Optional/lazy/broken images must not
    // hold a working invitation behind the loading screen.
    return text.length>10 || [...doc.images].some(image=>image.complete && image.naturalWidth>0);
  }

function previewPendingStyles(doc) {
  return [...(doc.querySelectorAll?.('link[rel="stylesheet"]') || [])].filter(link=>{
    if(link.disabled || (link.media && doc.defaultView?.matchMedia && !doc.defaultView.matchMedia(link.media).matches))return false;
    try { if(new URL(link.href,doc.location.href).origin!==doc.location.origin)return false; }catch{return false;}
    return !link.sheet;
  });
}

function createPreviewController(options) {
  let frame=options.frame;
  const {loader, modal, poster, baseURL, schedule=setTimeout, cancel=clearTimeout,
    reduced=()=>false, onResize=()=>{}, onStopLoading=()=>{},
    now=()=>globalThis.performance?.now() ?? Date.now(), onMetric=()=>{}}=options;
  const listeners=new Set(), timers=new Set();
  let current=null, version=0, phase='closed', collapsed=Boolean(options.toggle), checkTimer=null;
  let startedAt=0, retryCount=0, attemptEnded=true;
  function metric(event,properties={}){
    if(!current)return;
    try{onMetric(event,{item_id:String(current.id),elapsed_ms:Math.max(0,Math.round(now()-startedAt)),
      retry_count:retryCount,preview_device:options.mobile?.matches?'mobile':'desktop',...properties});}catch{}
  }
  function endAttempt(reason){
    if(!current || attemptEnded)return;
    metric('template_preview_ended',{exit_reason:reason,preview_ready:phase==='ready'});
    attemptEnded=true;
  }
  const quotes=['Every beautiful celebration begins with an invitation.',
    'Two hearts. A thousand memories. One beautiful beginning.',
    'A little glimpse of the day you will remember forever.',
    'Your story deserves a beautiful beginning.'];
  const demoURL=item=>item.collection==='dearly' ? item.demoUrl : (item.localDemoUrl || item.demoUrl);
  function later(callback, delay, token=version) {
    const timer=schedule(()=>{timers.delete(timer);if(token===version)callback();},delay);
    timers.add(timer);return timer;
  }
  function clearTimers(){timers.forEach(cancel);timers.clear();checkTimer=null;}
  function setPhase(value){phase=value;modal.dataset.previewStatus=value;}
  function renderControls(){
    const hidden=Boolean(options.mobile?.matches && collapsed);
    modal.classList.toggle('is-details-hidden',hidden);
    if(options.toggle){options.toggle.textContent=hidden?'Share & more':'Done';options.toggle.setAttribute('aria-expanded',String(!hidden));options.toggle.setAttribute('aria-label',hidden?'Share this design, switch collection or get help':'Hide sharing and collection options');}
    onResize();
  }
  function reveal(){
    if(phase!=='loading' && phase!=='waiting')return;
    clearTimers();setPhase('ready');
    if(!attemptEnded)metric('template_preview_ready',{load_time_ms:Math.max(0,Math.round(now()-startedAt))});
    frame.classList.add('is-loaded');loader.classList.add('is-hidden');onStopLoading();
    listeners.forEach(callback=>callback(current));
    if(poster){poster.classList.add('is-ready');later(()=>{poster.hidden=true;},reduced()?0:180);}
  }
  function check(attempt=0, externalLoaded=false){
    if(!current || (phase!=='loading' && phase!=='waiting'))return;
    const expected=new URL(demoURL(current),baseURL);
    let ready=false;
    try{
      const doc=frame.contentDocument;
      if(options.mobile?.matches && doc?.head && doc.location.pathname.replace(/\/$/,'')===expected.pathname.replace(/\/$/,'')){
        doc.documentElement.dataset.cataloguePreview='';
        if(!doc.getElementById('catalogue-mobile-styles')){
          const link=doc.createElement('link');link.id='catalogue-mobile-styles';link.rel='stylesheet';
          link.href='/previews/mobile.css?v=20261008-android-1';doc.head.appendChild(link);
        }
      }
      ready=previewDocumentReady(doc,expected.pathname);
    }catch{}
    // Cross-origin frames expose no document. A completed navigation is their
    // readiness signal; the same-origin document checks still apply locally.
    if (externalLoaded && expected.origin!==new URL(baseURL).origin) ready=true;
    if(ready){reveal();return;}
    if(attempt<120 && !checkTimer)checkTimer=later(()=>{checkTimer=null;check(attempt+1,externalLoaded);},250);
  }
  function open(item,trigger='open'){
    endAttempt(trigger==='open'?'switch':trigger);
    retryCount=trigger==='retry' && current?.id===item.id ? retryCount+1 : 0;
    clearTimers();version++;current=item;startedAt=now();attemptEnded=false;setPhase('loading');renderControls();
    const cached=options.frames?.take(item,trigger!=='open');
    if(cached)frame=cached.frame;
    metric('template_preview_started',{preview_trigger:trigger});
    if(cached?.ready){
      reveal();
      if(poster)poster.hidden=true;
      options.frames.warm(item);
      return;
    }
    frame.classList.remove('is-loaded');loader.classList.remove('is-hidden');
    if(poster){
      poster.hidden=false;poster.classList.remove('is-ready');
      poster.querySelector('img').src=item.image;
      poster.querySelector('blockquote').textContent=quotes[item.id%quotes.length];
      poster.querySelector('p').textContent='Preparing your invitation preview…';
      poster.querySelector('button').hidden=true;
      const link=poster.querySelector('a');link.href=item.demoUrl;link.hidden=true;
    }
    if(!cached)frame.src=demoURL(item);
    options.frames?.warm(item);
    later(()=>{
      if(phase!=='loading')return;
      setPhase('waiting');
      let stylesMissing=false;
      try{stylesMissing=previewPendingStyles(frame.contentDocument).length>0;}catch{}
      if(!attemptEnded)metric('template_preview_delayed',{waiting_reason:stylesMissing?'styles_pending':'content_pending'});
      if(poster){poster.querySelector('p').textContent=stylesMissing?'The preview styles haven’t loaded. Retry, or open the full demo.':'Taking a little longer. Retry, or open the full demo.';poster.querySelector('button').hidden=false;poster.querySelector('a').hidden=false;}
    },8000);
    later(()=>check(),0);
  }
  function loaded(){
    if(!current)return;
    // Ready content may have appeared before iframe load (slow map/analytics).
    if(phase==='ready'){listeners.forEach(callback=>callback(current));return;}
    check(0,true);
  }
  function retry(reason='retry'){if(current)open(current,typeof reason==='string'?reason:'retry');}
  function close(){
    endAttempt('close');
    clearTimers();version++;current=null;setPhase('closed');collapsed=Boolean(options.toggle && options.mobile?.matches);renderControls();
    if(poster)poster.hidden=true;
    options.frames?.clear();
    // Release animation/video memory promptly on phones; preserve the desktop
    // close transition. Reopening still invalidates this cleanup.
    later(()=>{frame.src='about:blank';frame.classList.remove('is-loaded');loader.classList.remove('is-hidden');},options.mobile?.matches?0:350);
  }
  function adjacent(catalogue,id,direction){
    const index=catalogue.findIndex(item=>item.id===id);
    return index<0 || !catalogue.length ? null : catalogue[(index+direction+catalogue.length)%catalogue.length];
  }
  return {open,close,retry,loaded,adjacent,poster,demoURL,
    recordPageExit(){endAttempt('page_exit');},
    onReady(callback){listeners.add(callback);return()=>listeners.delete(callback);},
    toggleControls(){collapsed=!collapsed;renderControls();},renderControls,
    state:()=>({phase,item:current,version,collapsed})};
}

// Only adjacent invitations are retained; an opened invitation is discarded on exit
// so audio and partially played reveals cannot continue in the background.
function createPreviewFrameCache({catalogue,create,activate,dispose}) {
  const entries=new Map();
  let active=null;
  function ensure(item){
    if(!entries.has(item.id))entries.set(item.id,create(item));
    return entries.get(item.id);
  }
  function clear(){entries.forEach(dispose);entries.clear();}
  return {
    take(item,force=false){
      if(force)clear();
      const entry=ensure(item);
      entries.delete(item.id);
      const previous=active;active=entry;
      activate(entry);
      if(previous && previous!==entry)dispose(previous);
      return entry;
    },
    warm(item){
      const designs=catalogue(),index=designs.findIndex(design=>design.id===item.id);
      const neighbours=index<0?[]:[designs[index-1],designs[index+1]].filter(Boolean);
      const wanted=new Set(neighbours.map(design=>design.id));
      for(const [id,entry] of entries)if(!wanted.has(id)){dispose(entry);entries.delete(id);}
      neighbours.forEach(ensure);
    },
    clear(){clear();if(active)dispose(active);active=null;}
  };
}

const PreviewController = (()=>{
  if(typeof document==='undefined')return null;
  const frame=document.getElementById('preview-modal-iframe'), modal=document.getElementById('preview-modal');
  if(!frame || !modal)return null;
  let poster=null;
  if(document.body.classList.contains('browse-home')){
    poster=document.createElement('div');poster.className='interaction-preview-poster';poster.hidden=true;
    poster.innerHTML='<img alt=""><div><span class="interaction-preview-loading-label">A moment before forever</span><blockquote></blockquote><p role="status"></p><div class="interaction-preview-loading-actions"><button type="button" class="interaction-secondary" hidden>Retry preview</button><a class="interaction-secondary" target="_blank" rel="noopener" hidden>Open full demo ↗</a></div></div>';
    document.getElementById('phone-screen-viewport').appendChild(poster);
  }
  const mobile=window.matchMedia('(max-width: 760px)'), toggle=document.getElementById('preview-details-toggle');
  const frameParent=frame.parentElement;
  let controller;
  const frames=createPreviewFrameCache({
    catalogue:()=>typeof TEMPLATE_DATABASE==='undefined'?[]:TEMPLATE_DATABASE.filter(item=>!item.hidden),
    create(item){
      const node=frame.cloneNode(false);
      node.removeAttribute('id');node.classList.remove('is-loaded');node.hidden=true;
      node.setAttribute('aria-hidden','true');node.tabIndex=-1;
      // Background previews must not autoplay media before the user opens them.
      node.setAttribute('allow','fullscreen; clipboard-write; web-share; accelerometer; gyroscope');
      const entry={frame:node,ready:false};
      const url=item.collection==='dearly'?item.demoUrl:(item.localDemoUrl||item.demoUrl);
      node.addEventListener('load',()=>{
        const ready=()=>{
          if(node.src==='about:blank')return;
          try{entry.ready=previewDocumentReady(node.contentDocument,new URL(url,location.href).pathname);}catch{}
          if(new URL(url,location.href).origin!==location.origin)entry.ready=true;
          if(node.id==='preview-modal-iframe')controller.loaded();
        };
        try{
          const doc=node.contentDocument;
          if(mobile.matches && doc?.head && !doc.getElementById('catalogue-mobile-styles')){
            const link=doc.createElement('link');link.id='catalogue-mobile-styles';link.rel='stylesheet';
            link.href='/previews/mobile.css?v=20261008-android-1';
            doc.documentElement.dataset.cataloguePreview='';
            link.addEventListener('load',ready);doc.head.appendChild(link);
          }
        }catch{}
        ready();
      });
      node.src=url;frameParent.appendChild(node);
      return entry;
    },
    activate(entry){
      const old=document.getElementById('preview-modal-iframe');
      if(old && old!==entry.frame){old.removeAttribute('id');old.hidden=true;}
      entry.frame.id='preview-modal-iframe';entry.frame.hidden=false;
      entry.frame.setAttribute('allow',frame.getAttribute('allow'));
      entry.frame.removeAttribute('aria-hidden');entry.frame.removeAttribute('tabindex');
      previewIframe=entry.frame;
      document.dispatchEvent(new Event('previewframechange',{bubbles:true}));
      if(old===frame)frame.remove();
    },
    dispose(entry){entry.frame.src='about:blank';entry.frame.remove();}
  });
  controller=createPreviewController({frame,modal,poster,mobile,toggle,frames,
    onMetric:(event,properties)=>{if(typeof trackPostHogEvent==='function')trackPostHogEvent(event,properties);},
    loader:document.getElementById('preview-modal-loader'),baseURL:location.href,
    reduced:()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    onResize:()=>{if(typeof schedulePreviewScale==='function')schedulePreviewScale();},
    onStopLoading:()=>{if(typeof stopLoaderPulse==='function')stopLoaderPulse();}});
  window.addEventListener('pagehide',controller.recordPageExit);
  frame.addEventListener('load',controller.loaded);
  poster?.querySelector('button').addEventListener('click',controller.retry);
  toggle?.addEventListener('click',controller.toggleControls);
  mobile.addEventListener('change',controller.renderControls);
  controller.renderControls();
  return controller;
})();
