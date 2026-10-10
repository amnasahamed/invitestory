/* InviteStory interaction layer. Native sheets and actual invitation assets, no UI framework. */
const InviteInteractions = (() => {
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const price = item => formatPrice(getItemPrices(item).priceINR, getItemPrices(item).priceUSD);
  const itemById = id => TEMPLATE_DATABASE.find(item => item.id === Number(id));
  let sheet, content, returnFocus, sheetKind = '', navigating=false, restoring=false;
  const owner=Date.now().toString(36)+Math.random().toString(36).slice(2);
  const contextKey='invitestory_browse_v1';
  let sheetCleanup=()=>{};
  function openSheet(kind, title, html, initialize) {
    sheetCleanup();sheetCleanup=()=>{};
    if (!sheet.open) returnFocus = document.activeElement;
    else sheet.close();
    pushOverlay('sheet',{sheetKind:kind});
    sheetKind = kind;
    sheet.dataset.kind = kind;
    sheet.querySelector('h2').textContent = title;
    const nextContent=document.createElement('div');nextContent.className='interaction-sheet-content';content.replaceWith(nextContent);content=nextContent;
    content.innerHTML = html;
    sheet.showModal();
    document.body.classList.add('interaction-sheet-open');
    sheet.querySelector('[data-sheet-close]').focus({preventScroll:true});
    initialize?.(content);
    updateMobileBookingBar();
  }
  function closeSheet(updateHistory=true) {
    if (!sheet?.open) return;
    if(updateHistory && requestOverlayClose('sheet'))return;
    sheetCleanup();sheetCleanup=()=>{};
    sheet.close();
    document.body.classList.remove('interaction-sheet-open');
    returnFocus?.isConnected && returnFocus.focus({preventScroll:true});
    sheetKind = '';
    updateMobileBookingBar();
  }
  function matches(query) {
    const q = query.trim().toLowerCase();
    return TEMPLATE_DATABASE.filter(item => !q || `${item.name} ${item.style} ${item.desc} ${item.tags.join(' ')}`.toLowerCase().includes(q));
  }
  function setSearch(query) {
    const input = document.getElementById('search-input');
    input.value = query;
    input.dispatchEvent(new Event('input', {bubbles:true}));
  }
  function openSearch() {
    openSheet('search', 'Find your invitation', `<label class="interaction-label" for="focused-search">Search a design or tradition</label><div class="interaction-search-line"><input id="focused-search" type="search" autocomplete="off" placeholder="Try floral, royal or Telugu" value="${escape(searchQuery)}"><button type="button" id="focused-clear">Clear</button></div><div class="interaction-suggestions" aria-label="Search suggestions">${['Floral','Royal','Telugu','Islamic','Modern'].map(term=>`<button type="button" data-search-term="${term}">${term}</button>`).join('')}</div><p id="focused-count" role="status"></p><div id="focused-results"></div><button type="button" class="interaction-primary" data-sheet-close>See results</button>`, root => {
      const input = root.querySelector('input');
      const render = () => {
        const results = matches(input.value);
        root.querySelector('#focused-count').textContent = `${results.length} matching invitation${results.length === 1 ? '' : 's'}`;
        root.querySelector('#focused-results').innerHTML = results.slice(0,5).map(item=>`<button type="button" class="interaction-result" data-search-design="${item.id}"><img src="${item.image}" alt="" width="48" height="60"><span><strong>${escape(item.name)}</strong><small>${escape(item.style)} · ${price(item)}</small></span><span aria-hidden="true">↗</span></button>`).join('') || '<p>No exact match. Try a tradition or choose a suggestion above.</p>';
      };
      const apply = () => {setSearch(input.value); render();};
      input.addEventListener('input', apply);
      input.addEventListener('keydown', event => {if(event.key === 'Enter'){event.preventDefault();closeSheet();document.getElementById('templates-grid').scrollIntoView({behavior:reduced()?'instant':'smooth',block:'start'});}});
      root.querySelector('#focused-clear').addEventListener('click',()=>{input.value='';apply();input.focus();});
      root.addEventListener('click', event => {
        const term = event.target.closest('[data-search-term]');
        if(term){input.value=term.dataset.searchTerm;apply();}
        const choice = event.target.closest('[data-search-design]');
        if(choice){closeSheet(false);openPreview(Number(choice.dataset.searchDesign));}
      });
      render();
      input.focus({preventScroll:true});
    });
  }
  const feelings = [
    {value:'traditional',label:'Rooted in tradition',image:1,tags:['traditional','south-indian']},
    {value:'modern',label:'Modern & minimal',image:7,tags:['modern','minimalist']},
    {value:'royal',label:'Royal & cinematic',image:21,tags:['royal','palace']},
    {value:'botanical',label:'Floral & botanical',image:35,tags:['botanical','floral','garden','watercolor']},
    {value:'illustrated',label:'Illustrated & playful',image:18,tags:['illustrated','quirky','ghibli','anime']}
  ];
  let matchReasons = new Map();
  function rankMatches(style, tradition, tier) {
    const feeling = feelings.find(choice=>choice.value===style);
    if(!feeling) return [];
    return TEMPLATE_DATABASE.filter(item=>(!tier || item.tier===Number(tier)) && (tradition==='all' || item.tags.includes(tradition))).map(item=>({item,score:feeling.tags.filter(tag=>`${item.style} ${item.tags.join(' ')} ${item.desc}`.toLowerCase().includes(tag)).length})).filter(match=>match.score>0).sort((a,b)=>b.score-a.score || a.item.id-b.item.id).slice(0,3).map(match=>match.item);
  }
  function openFinder() {
    let step=0;
    const answers={style:'',tradition:'all',tier:0};
    openSheet('finder','Find our three','',root=>{
      const render=()=>{
        const titles=['What feels like you?','Any traditions to reflect?','Which collection?'];
        const options=step===0 ? feelings.map(choice=>({value:choice.value,label:choice.label,image:itemById(choice.image)?.image})) : step===1 ? [{value:'all',label:'Open to every style'},{value:'traditional',label:'Traditional Indian'},{value:'south-indian',label:'South Indian'},{value:'islamic',label:'Islamic'}] : [{value:0,label:'Explore all collections'},{value:2,label:`Premium · ${formatPrice(1999,29)}`},{value:3,label:`Luxury · ${formatPrice(2999,45)}`},{value:4,label:`Dearly · ${formatPrice(4999,75)}`}];
        const key=['style','tradition','tier'][step];
        root.innerHTML=`<p class="interaction-step">${step+1} of 3</p><h3 tabindex="-1">${titles[step]}</h3><p class="interaction-muted">${step===0?'Choose a feeling. You can change it later.':step===1?'We only suggest designs that match your choice.':'Every collection includes personalization and hosting.'}</p><div class="interaction-finder-options ${step===0?'is-visual':''}">${options.map(option=>`<button type="button" data-finder-answer="${option.value}" aria-pressed="${String(answers[key])===String(option.value)}">${option.image?`<img src="${option.image}" alt="" width="140" height="100">`:''}<span>${option.label}</span></button>`).join('')}</div><div class="interaction-finder-nav">${step?'<button type="button" class="interaction-secondary" data-finder-back>Back</button>':''}<button type="button" class="interaction-primary" data-finder-next ${!answers.style?'disabled':''}>${step===2?'Find our designs':'Continue'}</button></div>`;
        root.querySelector('h3').focus({preventScroll:true});
        root.querySelectorAll('[data-finder-answer]').forEach(button=>button.addEventListener('click',()=>{answers[key]=step===2?Number(button.dataset.finderAnswer):button.dataset.finderAnswer;root.querySelectorAll('[data-finder-answer]').forEach(choice=>choice.setAttribute('aria-pressed',String(choice===button)));root.querySelector('[data-finder-next]').disabled=false;}));
        root.querySelector('[data-finder-back]')?.addEventListener('click',()=>{step--;render();});
        root.querySelector('[data-finder-next]').addEventListener('click',()=>{
          if(step<2){step++;render();return;}
          const results=rankMatches(answers.style,answers.tradition,answers.tier);
          const feeling=feelings.find(choice=>choice.value===answers.style);
          resetFilters(); discovery.recommendations=results.map(item=>item.id);
          matchReasons=new Map(results.map(item=>[item.id,`${feeling.label}${answers.tradition!=='all'?' · '+answers.tradition.replaceAll('-',' '):''}${answers.tier?' · '+packageName(answers.tier):''}`]));
          renderCatalogue();closeSheet();
          document.getElementById('templates-grid').scrollIntoView({behavior:reduced()?'instant':'smooth',block:'start'});
          document.getElementById('discovery-status').textContent=results.length?`${results.length} matches for your choices. Preview each to find your favourite.`:'No exact match for those choices. Change your choices or explore every collection.';
          trackConversionEvent('style_finder_complete',{style:answers.style,tradition:answers.tradition,package_tier:answers.tier,content_ids:results.map(item=>String(item.id))});
        });
      };render();
    });
  }
  function afterCatalogue() {
    if(!document.body.classList.contains('browse-home')) return;
    const grid = document.getElementById('templates-grid');
    const count = grid.querySelectorAll('.template-card,.match-card').length;
    grid.setAttribute('aria-label', `${count} invitation designs`);
    grid.querySelectorAll('.template-card').forEach(card => {
      const reason=discovery.recommendations && matchReasons.get(Number(card.id.replace('template-card-','')));
      if(reason){const label=document.createElement('p');label.className='interaction-match-reason';label.textContent='Why this fits: '+reason;card.querySelector('.template-card-content').appendChild(label);}
      if(!reduced()) card.animate([{opacity:.55},{opacity:1}],{duration:170});
    });
    document.querySelectorAll('.filter-tag').forEach(button => {
      const tag = button.dataset.tag;
      const selected = tag === activeTagFilter;
      button.classList.toggle('active',selected);
      button.setAttribute('aria-pressed',String(selected));
    });
    persistContext();
    const empty = grid.querySelector('.no-results');
    if(empty && !discovery.savedOnly) empty.innerHTML = '<h3>No exact match yet</h3><p>Try another style, or broaden your search.</p><button type="button" class="interaction-secondary" onclick="InviteInteractions.clearSearch()">Clear search</button><button type="button" class="interaction-secondary" onclick="resetFilters()">See all designs</button>';
  }
  function clearSearch(){setSearch('');}
  let savedButton, feedback, feedbackTimer;
  let compareIds=new Set();
  const savedItems=()=>[...previewFavourites].map(itemById).filter(Boolean);
  function updateSavedButton(){if(savedButton){savedButton.textContent=`View saved (${savedItems().length})`;savedButton.setAttribute('aria-label',`Open shortlist, ${savedItems().length} saved designs`);}}
  function notify(message,action,label){
    clearTimeout(feedbackTimer);
    if(!sheet?.open && feedback){
      const preview=document.getElementById('preview-modal');
      const parent=preview?.classList.contains('is-open') ? preview : document.body;
      if(feedback.parentElement!==parent)parent.appendChild(feedback);
    }
    const mount=sheet?.open ? content.querySelector('.interaction-sheet-notice') || content.appendChild(Object.assign(document.createElement('div'),{className:'interaction-sheet-notice'})) : feedback;
    mount.setAttribute('role','status');mount.setAttribute('aria-live','polite');mount.setAttribute('aria-atomic','true');
    mount.hidden=false;mount.innerHTML=`<span>${escape(message)}</span>${action?`<button type="button">${label}</button>`:''}`;
    mount.querySelector('button')?.addEventListener('click',()=>{mount.hidden=true;action();});
    feedbackTimer=setTimeout(()=>mount.hidden=true,6000);
  }
  function renderShortlist() {
    const items=savedItems();
    compareIds=new Set([...compareIds].filter(id=>previewFavourites.has(id)));
    content.innerHTML=items.length ? `<p class="interaction-muted">${items.length} saved ${items.length === 1 ? "design" : "designs"} on this device. Share your shortlist to choose together.</p><div class="interaction-shortlist-actions"><button type="button" class="interaction-primary" data-shortlist-share>Share with family</button><button type="button" class="interaction-secondary" data-shortlist-compare ${compareIds.size<2?"disabled":""}>Compare selected (${compareIds.size})</button></div><p class="interaction-muted" id="compare-selection-status">${items.length < 2 ? "Save one more design to compare your favourites." : "Choose 2 or 3 designs to compare."}</p><div>${items.map(item=>`<div class="interaction-saved-row"><label class="interaction-compare-check"><input type="checkbox" data-compare-choice="${item.id}" ${compareIds.has(item.id)?"checked":""} aria-label="Compare ${escape(item.name)}"></label><button type="button" class="interaction-result" data-shortlist-preview="${item.id}"><img src="${item.image}" alt="" width="48" height="60"><span><strong>${escape(item.name)}</strong><small>${price(item)} · ${packageName(item.tier)}</small></span></button><button type="button" class="interaction-secondary" data-shortlist-remove="${item.id}" aria-label="Remove ${escape(item.name)} from shortlist">Remove</button></div>`).join('')}</div>` : '<h3>A place for your favourites</h3><p class="interaction-muted">Tap the heart on any invitation to keep it here.</p><button type="button" class="interaction-primary" data-sheet-close>Explore the designs</button>';
  }
  function openShortlist() {
    compareIds=new Set(savedItems().slice(0,3).map(item=>item.id));
    openSheet('shortlist','Your saved designs','',root=>{
      renderShortlist();
      root.onclick=event=>{
        const preview=event.target.closest('[data-shortlist-preview]');
        const remove=event.target.closest('[data-shortlist-remove]');
        if(preview){const id=Number(preview.dataset.shortlistPreview);closeSheet(false);openPreview(id);}
        if(remove)toggleSavedDesign(Number(remove.dataset.shortlistRemove));
        if(event.target.closest('[data-shortlist-share]'))shareSavedDesigns();
        if(event.target.closest('[data-shortlist-compare]'))openComparison([...compareIds]);
      };
      root.onchange=event=>{
        const choice=event.target.closest('[data-compare-choice]');if(!choice)return;
        const id=Number(choice.dataset.compareChoice);
        if(choice.checked && compareIds.size>=3){choice.checked=false;root.querySelector('#compare-selection-status').textContent='Compare up to three at a time.';return;}
        choice.checked?compareIds.add(id):compareIds.delete(id);
        const button=root.querySelector('[data-shortlist-compare]');button.disabled=compareIds.size<2;button.textContent=`Compare selected (${compareIds.size})`;
      };
    });
  }
  function openComparison(ids) {
    const items=ids.map(itemById).filter(Boolean).slice(0,3);
    if(items.length<2)return;
    openSheet('compare','Compare your favourites',`<p class="interaction-muted">One-time prices. Personalization and hosting included.</p><div class="interaction-compare-track" style="--compare-count:${items.length}">${items.map(item=>`<article><img src="${item.image}" alt="${escape(item.name)} invitation artwork"><h3>${escape(item.name)}</h3><p class="interaction-compare-price">${price(item)}</p><dl><dt>Collection</dt><dd>${packageName(item.tier)}</dd><dt>Opening</dt><dd>${item.tier===4?'Floral wax seal':item.tier===3?'Cinematic reveal':'Interactive invitation'}</dd><dt>Guest replies</dt><dd>${item.tier===4?'Email RSVP included':'WhatsApp RSVP included'}</dd><dt>First draft</dt><dd>${item.tier===4?'24':'48'}h after payment and complete details</dd></dl><button type="button" class="interaction-primary" data-compare-preview="${item.id}">Preview ${escape(item.name)}</button><button type="button" class="interaction-secondary" data-compare-book="${item.id}" aria-label="Choose ${escape(item.name)} and review the price">Choose design</button></article>`).join('')}</div><div class="interaction-compare-navigation"><button type="button" class="interaction-secondary" data-compare-prev aria-label="Previous comparison">Previous</button><span role="status" id="comparison-position">1 of ${items.length}</span><button type="button" class="interaction-secondary" data-compare-next aria-label="Next comparison">Next</button></div><button type="button" class="interaction-secondary" data-back-shortlist>Back to shortlist</button>`,root=>{
      const track=root.querySelector('.interaction-compare-track');const cards=[...track.children];let index=0;
      const update=()=>{root.querySelector('#comparison-position').textContent=`${index+1} of ${cards.length}`;root.querySelector('[data-compare-prev]').disabled=index===0;root.querySelector('[data-compare-next]').disabled=index===cards.length-1;};
      const go=change=>{index=Math.max(0,Math.min(cards.length-1,index+change));track.scrollTo({left:cards[index].offsetLeft-cards[0].offsetLeft,behavior:reduced()?'instant':'smooth'});update();};
      root.querySelector('[data-compare-prev]').addEventListener('click',()=>go(-1));root.querySelector('[data-compare-next]').addEventListener('click',()=>go(1));
      const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.intersectionRatio>.65){index=cards.indexOf(entry.target);update();}});},{root:track,threshold:.65});cards.forEach(card=>observer.observe(card));
      sheetCleanup=()=>observer.disconnect();
      root.addEventListener('click',event=>{const preview=event.target.closest('[data-compare-preview]');const book=event.target.closest('[data-compare-book]');if(preview){closeSheet(false);openPreview(Number(preview.dataset.comparePreview));}if(book){closeSheet(false);openOrderDrawerForTemplate(Number(book.dataset.compareBook));}if(event.target.closest('[data-back-shortlist]'))openShortlist();});update();
    });
  }
  function shortlistURL(ids,currency,base=location.href) {
    const url=new URL(base);url.search='';url.hash='';
    const known=[...new Set(ids.map(Number))].filter(id=>itemById(id)).slice(0,12);
    url.searchParams.set('shortlist',known.join(','));
    url.searchParams.set('currency',currency==='USD'?'USD':'INR');return url.href;
  }
  function openFamilyShare() {
    const items=savedItems().slice(0,12);if(!items.length)return;
    const url=shortlistURL(items.map(item=>item.id),currentCurrency);
    const text=`Help us choose our wedding invitation.\n${items.map(item=>`${item.name} · ${price(item)}`).join('\n')}\nPersonalized by InviteStory. Open the shortlist to try each design.`;
    openSheet('share','Choose with your family',`<p class="interaction-muted">Your link opens these ${items.length} designs with their current prices. No login needed.${savedItems().length > 12 ? " Sharing supports up to 12 designs; this link includes your first 12 saved choices." : ""}</p>${items.map(item=>`<div class="interaction-result"><img src="${item.image}" alt="" width="48" height="60"><span><strong>${escape(item.name)}</strong><small>${price(item)}</small></span></div>`).join('')}<label class="interaction-label" for="family-shortlist-link">Your shortlist link</label><input id="family-shortlist-link" class="interaction-link-input" value="${escape(url)}" readonly><button type="button" class="interaction-primary" id="family-copy-link">Copy shortlist link</button>${navigator.share?'<button type="button" class="interaction-secondary" id="family-native-share">Share…</button>':''}<p id="family-share-status" role="status" class="interaction-muted"></p><p class="interaction-muted">This link is a snapshot of your choices. Changes on this device do not update it automatically.</p><button type="button" class="interaction-secondary" data-back-shortlist>Back to saved designs</button>`,root=>{
      root.querySelector('[data-back-shortlist]').addEventListener('click',openShortlist);
      const status=root.querySelector('#family-share-status');
      root.querySelector('#family-copy-link').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(url);status.textContent='Link copied. Paste it into your family chat.';trackConversionEvent('share_shortlist',{content_ids:items.map(item=>String(item.id)),method:'copy'});}catch{const input=root.querySelector('input');input.focus();input.select();status.textContent='Select and copy the link above.';}});
      root.querySelector('#family-native-share')?.addEventListener('click',async()=>{try{await navigator.share({title:'Our invitation shortlist',text,url});status.textContent='Shortlist shared.';trackConversionEvent('share_shortlist',{content_ids:items.map(item=>String(item.id)),method:'native'});}catch(error){status.textContent=error.name==='AbortError'?'':'Could not open sharing. Copy the link instead.';}});
    });
  }
  function savedChanged(id,wasSaved){
    if(!savedButton)return;
    updateSavedButton();
    if(sheet.open && sheetKind==='shortlist'){renderShortlist();sheet.querySelector('[data-sheet-close]').focus({preventScroll:true});}
    const item=itemById(id);
    if(wasSaved) notify(`${item.name} removed`,()=>toggleSavedDesign(id),'Undo');
    else {if(!reduced())document.querySelector(`#template-card-${id} .sales-save-design`)?.animate([{transform:'scale(.85)'},{transform:'scale(1.1)'},{transform:'scale(1)'}],{duration:220});notify(`Saved to your shortlist: ${item.name}`,openShortlist,'View saved');}
  }
  let previewOrigin=null, poster, previewItem=null;
  const localDearly = {35:'aubergine-magnolia',36:'cinnamon-camellia',37:'cobalt-iris',38:'petrol-dahlia'};
  function demoURL(item){return item.localDemoUrl || item.demoUrl;}
  function demoAPI(){try{return document.getElementById('preview-modal-iframe').contentWindow.InvitationPreview;}catch{return null;}}
  function demoAction(action){const api=demoAPI();if(!api)return;if(action==='open' && api.state().opened)api.goto('invitation');else if(typeof api[action]==='function')api[action]();}
  let demoTools, chapters, paletteTools, explore;

  function beforePreview(id) {
    if(!document.body.classList.contains('browse-home')) return;
    if(document.getElementById('preview-modal').classList.contains('is-open'))demoAPI()?.pause();
    if(!document.getElementById('preview-modal').classList.contains('is-open')) {
      previewState.savedScrollY=window.scrollY;
      const image=document.querySelector(`#template-card-${id} .template-card-img`);
      previewOrigin=image ? {image,rect:image.getBoundingClientRect(),id} : null;
    }
  }
  function artworkTransition(from,to,source) {
    if(reduced() || !from || !to || from.bottom<0 || from.top>innerHeight) return;
    // A hidden/loading poster can have a zero-sized rectangle when closing.
    // Skip that decorative flight rather than constructing infinite keyframes.
    if(![from,to].every(rect=>['left','top','width','height'].every(key=>Number.isFinite(rect[key])) && rect.width>0 && rect.height>0)) return;
    const ghost=document.createElement('img');ghost.src=source;ghost.className='interaction-artwork-flight';
    Object.assign(ghost.style,{left:from.left+'px',top:from.top+'px',width:from.width+'px',height:from.height+'px'});
    document.body.appendChild(ghost);
    const animation=ghost.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${to.left-from.left}px,${to.top-from.top}px) scale(${to.width/from.width},${to.height/from.height})`,opacity:0}],{duration:280,easing:'cubic-bezier(.2,.8,.2,1)'});
    animation.finished.catch(()=>{}).finally(()=>ghost.remove());
  }
  function afterPreview(item) {
    if(!document.body.classList.contains('browse-home') || !poster) return;
    previewItem=item;
    if(explore){explore.hidden=true;explore.open=false;}
    if(paletteTools){paletteTools.hidden=!localDearly[item.id];paletteTools.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.previewPalette)===item.id)));}
    if(chapters){chapters.hidden=!localDearly[item.id];chapters.querySelectorAll('button').forEach(button=>{button.disabled=true;button.setAttribute('aria-pressed',String(button.dataset.chapter==='opening'));});}
    if(demoTools) {demoTools.hidden=!localDearly[item.id];demoTools.querySelectorAll('button').forEach(button=>button.disabled=true);}
    requestAnimationFrame(()=>{if(previewOrigin?.id===item.id) artworkTransition(previewOrigin.rect,poster.getBoundingClientRect(),item.image);});
  }
  function beforePreviewClose() {
    if(previewOrigin){const origin=document.querySelector(`#template-card-${previewOrigin.id} .template-card-img`);if(origin)previewState.savedScrollY=Math.max(0,origin.getBoundingClientRect().top+window.scrollY-previewOrigin.rect.top);}
    if(previewOrigin && previewItem && poster) {
      const target=document.querySelector(`#template-card-${previewOrigin.id} .template-card-img`);
      if(target) artworkTransition(poster.getBoundingClientRect(),previewOrigin.rect,previewItem.image);
    }
    demoAPI()?.pause();
    previewItem=null;
  }
  let lastOrderTotal='';
  function syncOrder() {
    const summary=document.getElementById('interaction-order-breakdown');if(!summary)return;
    const dearly=orderDrawerState.tier===4;
    const base=document.getElementById('order-drawer-base-price').textContent;
    const rows=[['Invitation, personalization & hosting',base]];
    if(usesNewDelivery()){const speed=DELIVERY_SPEEDS[orderDeliverySpeed()];rows.push([`${speed.hours}h first draft`,deliveryFeeForOrder()?formatPrice(speed.fee,speed.feeUSD):'Included']);}
    else if(dearly || document.getElementById('order-drawer-addon-express').checked)rows.push(['24h first draft',dearly?'Included':formatPrice(ADDONS.express.priceINR,ADDONS.express.priceUSD)]);
    if(dearly || document.getElementById('order-drawer-addon-email-rsvp').checked)rows.push(['Email RSVP',dearly?'Included':formatPrice(ADDONS.emailRsvp.priceINR,ADDONS.emailRsvp.priceUSD)]);
    summary.innerHTML='<h4>Price breakdown</h4><dl>'+rows.map(([label,value])=>`<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')+'</dl>';
    const total=document.getElementById('order-drawer-total-val');
    const key=`${currentCurrency}:${orderDrawerState.total}`;
    if(lastOrderTotal && lastOrderTotal!==key && document.getElementById('order-drawer-modal').classList.contains('is-open') && !reduced())total.animate([{background:'#dfeae3'},{background:'transparent'}],{duration:450});
    lastOrderTotal=key;
  }
  function browsingContext() {
    return {version:1,updated:Date.now(),query:searchQuery,tag:activeTagFilter,tier:activeTierFilter,savedOnly:discovery.savedOnly,recommendations:discovery.recommendations,shared:discovery.shared,reasons:[...matchReasons],view:document.getElementById('view-mode-list')?.classList.contains('active')?'list':'grid',scroll:window.scrollY};
  }
  function validateContext(value) {
    if(!value || value.version!==1 || typeof value.updated!=='number' || Date.now()-value.updated>14*86400000 || value.updated>Date.now()+60000)return null;
    const ids=value=>Array.isArray(value)?[...new Set(value.filter(id=>Number.isInteger(id)&&itemById(id)))].slice(0,12):null;
    const tags=new Set(['all',...TEMPLATE_DATABASE.flatMap(item=>item.tags)]);
    return {view:value.view==='list'?'list':'grid',query:typeof value.query==='string'?value.query.slice(0,120):'',tag:tags.has(value.tag)?value.tag:'all',tier:[0,2,3,4].includes(value.tier)?value.tier:0,savedOnly:value.savedOnly===true,recommendations:ids(value.recommendations),shared:ids(value.shared),reasons:Array.isArray(value.reasons)?value.reasons.filter(row=>Array.isArray(row)&&itemById(row[0])&&typeof row[1]==='string').map(([id,reason])=>[id,reason.slice(0,160)]):[],scroll:Number.isFinite(value.scroll)?Math.max(0,Math.min(value.scroll,100000)):0};
  }
  function persistContext() {
    if(restoring || !sheet)return;
    const value=browsingContext();
    if(document.getElementById('preview-modal').classList.contains('is-open'))value.scroll=Math.max(0,previewState.savedScrollY);
    try{localStorage.setItem(contextKey,JSON.stringify(value));}catch{}
  }
  function cleanPreviewURL(){const url=new URL(location.href);['design','preview','id'].forEach(key=>url.searchParams.delete(key));return url;}
  function pushOverlay(kind,extra={}) {
    if(navigating || !sheet)return;
    persistContext();
    const state={...(history.state||{}),inviteOwner:owner,storyOverlay:kind,...extra};
    if(history.state?.inviteOwner===owner && history.state.storyOverlay===kind)history.replaceState(state,'',location.href);
    else history.pushState(state,'',location.href);
  }
  function previewHistory(item) {
    if(!sheet)return false;
    persistContext();
    const url=new URL(location.href);url.searchParams.set('design',item.slug||getDesignSlug(item));url.searchParams.delete('preview');url.searchParams.delete('id');
    const state={...(history.state||{}),inviteOwner:owner,storyOverlay:'preview',modalOpen:true,templateId:item.id};
    if(history.state?.inviteOwner===owner && ['preview','sheet'].includes(history.state.storyOverlay))history.replaceState(state,'',url);
    else {history.replaceState({...history.state,modalOpen:false,storyOverlay:null},'',cleanPreviewURL());history.pushState(state,'',url);}
    return true;
  }
  function requestOverlayClose(kind) {
    if(!navigating && history.state?.inviteOwner===owner && history.state.storyOverlay===kind){history.back();return true;}
    return false;
  }
  function requestPreviewClose(updateHistory){return updateHistory && requestOverlayClose('preview');}
  function requestOrderClose(updateHistory){return updateHistory && requestOverlayClose('order');}
  function orderOpened(){if(sheet)pushOverlay('order',{orderId:orderDrawerState.template?.id||null,orderTier:orderDrawerState.tier});}
  function handlePop(event) {
    if(!sheet)return;
    navigating=true;
    const state=event.state||{};
    const kind=state.inviteOwner===owner?state.storyOverlay:null;
    if(sheet.open)closeSheet(false);
    if(kind!=='order' && document.getElementById('order-drawer-modal').classList.contains('is-open'))closeOrderDrawer(false);
    if(!state.modalOpen && document.getElementById('preview-modal').classList.contains('is-open'))closePreview(false);
    if(state.modalOpen && itemById(state.templateId) && (!document.getElementById('preview-modal').classList.contains('is-open') || previewState.currentIndex!==TEMPLATE_DATABASE.findIndex(item=>item.id===state.templateId)))openPreview(state.templateId,false);
    if(kind==='sheet') {
      if(state.sheetKind==='search')openSearch();
      if(state.sheetKind==='finder')openFinder();
      if(state.sheetKind==='shortlist')openShortlist();
      if(state.sheetKind==='compare')openComparison([...compareIds]);
      if(state.sheetKind==='share')openFamilyShare();
    }
    if(kind==='order'){if(itemById(state.orderId))openOrderDrawerForTemplate(state.orderId);else openOrderDrawerForPackage(state.orderTier);}
    navigating=false;persistContext();
  }
  function restoreContext() {
    const params=new URLSearchParams(location.search);
    if(['design','preview','id','shortlist'].some(key=>params.has(key)))return;
    let saved;try{saved=validateContext(JSON.parse(localStorage.getItem(contextKey)));}catch{}
    if(!saved)return;
    restoring=true;searchQuery=saved.query;activeTagFilter=saved.tag;activeTierFilter=saved.tier;
    document.getElementById('search-input').value=saved.query;
    Object.assign(discovery,{savedOnly:saved.savedOnly,recommendations:saved.recommendations,shared:saved.shared});matchReasons=new Map(saved.reasons);
    const tier=document.querySelector(`input[name="tier"][value="${saved.tier}"]`);if(tier)tier.checked=true;
    updateTagFilterButtons();
    if(saved.view==='list')document.getElementById('view-mode-list')?.click();else document.getElementById('view-mode-grid')?.click();
    renderCatalogue();
    requestAnimationFrame(()=>{window.scrollTo({top:saved.scroll,behavior:'instant'});restoring=false;});
  }
  function setup() {
    if(!document.body.classList.contains('browse-home')) return;
    sheet = document.createElement('dialog');
    sheet.className = 'interaction-sheet';
    sheet.setAttribute('aria-labelledby','interaction-sheet-title');
    sheet.innerHTML = '<header><h2 id="interaction-sheet-title"></h2><button type="button" data-sheet-close aria-label="Close panel">×</button></header><div class="interaction-sheet-content"></div>';
    document.body.appendChild(sheet);
    content = sheet.querySelector('.interaction-sheet-content');
    sheet.addEventListener('click', event => {if(event.target === sheet || event.target.closest('[data-sheet-close]')) closeSheet();});
    sheet.addEventListener('cancel', event=>{event.preventDefault();closeSheet();});
    sheet.addEventListener('close',()=>{if(!sheet.open)document.body.classList.remove('interaction-sheet-open');});
    const oldFinder=document.querySelector('.sales-style-finder');
    if(oldFinder) oldFinder.hidden=true;
    const actions=document.createElement('div');actions.className='interaction-discovery-actions';
    actions.innerHTML='<button type="button" class="interaction-secondary" id="interaction-find-three">Find our three</button>';
    document.querySelector('.filter-tags-row')?.after(actions);
    // Some catalogue versions name the horizontal row differently.
    if(!actions.isConnected) document.querySelector('.controls-card').appendChild(actions);
    actions.querySelector('button').addEventListener('click',openFinder);
    savedButton=document.createElement('button');savedButton.type='button';savedButton.className='interaction-secondary';savedButton.addEventListener('click',openShortlist);actions.appendChild(savedButton);updateSavedButton();
    feedback=document.createElement('div');feedback.className='interaction-feedback';feedback.hidden=true;feedback.setAttribute('role','status');document.body.appendChild(feedback);
    poster=PreviewController.poster;
    demoTools=document.createElement('div');demoTools.className='interaction-demo-controls';demoTools.hidden=true;
    demoTools.innerHTML='<button type="button" data-demo-action="open">Open invitation</button><button type="button" data-demo-action="replay">Replay opening</button><button type="button" data-demo-action="sound">Sound off</button>';
    document.querySelector('#preview-modal .preview-modal-toolbar').prepend(demoTools);
    chapters=document.createElement('nav');chapters.className='interaction-chapters';chapters.hidden=true;chapters.setAttribute('aria-label','Guest walkthrough');
    chapters.innerHTML='<span id="guest-chapter-status" class="interaction-muted">Guest view · 1 of 4</span><div>'+[['opening','Opening'],['invitation','Invitation'],['events','Events'],['rsvp','RSVP']].map(([key,label])=>`<button type="button" data-chapter="${key}" aria-pressed="${key==='opening'}">${label}</button>`).join('')+'</div>';
    demoTools.before(chapters);
    chapters.addEventListener('click',event=>{const button=event.target.closest('[data-chapter]');const api=demoAPI();if(!button || !api?.goto)return;api.goto(button.dataset.chapter);chapters.querySelectorAll('button').forEach(choice=>choice.setAttribute('aria-pressed',String(choice===button)));document.getElementById('guest-chapter-status').textContent=`Guest view · ${['opening','invitation','events','rsvp'].indexOf(button.dataset.chapter)+1} of 4`;explore.open=false;explore.querySelector('summary').textContent=`Guest view: ${button.textContent} · ${['opening','invitation','events','rsvp'].indexOf(button.dataset.chapter)+1} of 4`;schedulePreviewScale();});
    paletteTools=document.createElement('div');paletteTools.className='interaction-preview-palettes';paletteTools.hidden=true;paletteTools.setAttribute('role','group');paletteTools.setAttribute('aria-label','Available Dearly designs');
    paletteTools.innerHTML='<span>Dearly palettes</span><div>'+[35,36,37,38].map(id=>{const item=itemById(id);return `<button type="button" data-preview-palette="${id}" aria-label="Preview ${escape(item.name)} palette" aria-pressed="false" title="${escape(item.name)}" style="--palette:${item.accentColor}"><span aria-hidden="true"></span></button>`;}).join('')+'</div>';
    chapters.before(paletteTools);
    explore=document.createElement('details');explore.className='interaction-preview-explore';explore.hidden=true;explore.innerHTML='<summary>Explore this invitation</summary>';paletteTools.before(explore);explore.append(paletteTools,chapters,demoTools);
    paletteTools.addEventListener('click',event=>{const choice=event.target.closest('[data-preview-palette]');if(choice && Number(choice.dataset.previewPalette)!==previewItem?.id)openPreview(Number(choice.dataset.previewPalette));});
    demoTools.addEventListener('click',event=>{const button=event.target.closest('[data-demo-action]');if(!button)return;const wasOpened=Boolean(demoAPI()?.state().opened);demoAction(button.dataset.demoAction);if(button.dataset.demoAction!=='sound'){const chapter=button.dataset.demoAction==='open' && wasOpened?'invitation':'opening';chapters.querySelectorAll('button').forEach(choice=>choice.setAttribute('aria-pressed',String(choice.dataset.chapter===chapter)));explore.open=false;document.getElementById('guest-chapter-status').textContent=`Guest view · ${chapter==='opening'?1:2} of 4`;explore.querySelector('summary').textContent=button.dataset.demoAction==='replay'?'Playing the opening':'Explore this invitation';schedulePreviewScale();}if(button.dataset.demoAction==='sound')setTimeout(()=>{button.textContent=demoAPI()?.state().sound?'Sound on':'Sound off';button.setAttribute('aria-pressed',String(Boolean(demoAPI()?.state().sound)));},150);});
    PreviewController.onReady(()=>{
      if(demoTools)demoTools.querySelectorAll('button').forEach(button=>button.disabled=!demoAPI());
      if(chapters)chapters.querySelectorAll('button').forEach(button=>button.disabled=!demoAPI());
    });
    const sharedCurrency=new URLSearchParams(location.search).get('currency');
    if(sharedCurrency==='INR' || sharedCurrency==='USD')document.getElementById(`currency-${sharedCurrency.toLowerCase()}`).click();
    const orderTitle=document.querySelector('#order-drawer-modal .order-drawer-title');if(orderTitle)orderTitle.textContent='Review your invitation';
    const orderSubtitle=document.querySelector('#order-drawer-modal .order-drawer-subtitle');if(orderSubtitle)orderSubtitle.textContent='We personalize your chosen design. Send your details after booking.';
    const breakdown=document.createElement('section');breakdown.id='interaction-order-breakdown';breakdown.className='interaction-order-breakdown';
    document.querySelector('#order-drawer-modal .order-drawer-total-bar').before(breakdown);
    document.getElementById('order-drawer-total-val').setAttribute('role','status');
    document.getElementById('order-drawer-total-val').setAttribute('aria-live','polite');
    if(new URLSearchParams(location.search).has('shortlist') && !discovery.shared)notify('This shortlist is unavailable. Explore the current designs instead.');
    restoreContext();
    const contextObserver=new IntersectionObserver(()=>{if(!sheet.open && !document.querySelector('#preview-modal.is-open, #order-drawer-modal.is-open'))persistContext();},{threshold:[0,.5]});
    contextObserver.observe(document.getElementById('catalogue-header'));
    window.addEventListener('pagehide',persistContext);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)persistContext();});
    const clearContext=document.createElement('button');clearContext.type='button';clearContext.className='interaction-secondary';clearContext.textContent='Reset browsing';clearContext.addEventListener('click',()=>{try{localStorage.removeItem(contextKey);}catch{}resetFilters();matchReasons.clear();document.getElementById('catalogue-header').scrollIntoView({behavior:reduced()?'instant':'smooth'});});actions.appendChild(clearContext);
    if(document.getElementById('preview-modal').classList.contains('is-open')) {const item=TEMPLATE_DATABASE[previewState.currentIndex];if(item){afterPreview(item);if(demoAPI()){demoTools.querySelectorAll('button').forEach(button=>button.disabled=false);chapters.querySelectorAll('button').forEach(button=>button.disabled=false);}}}
    afterCatalogue();
    const search = document.getElementById('search-input');
    search.addEventListener('click',()=>{if(matchMedia('(max-width:760px)').matches) openSearch();});
    search.addEventListener('keydown',event=>{if(event.key==='Enter' && matchMedia('(max-width:760px)').matches){event.preventDefault();openSearch();}});
  }
  document.addEventListener('DOMContentLoaded', setup);
  return {openSheet,closeSheet,openSearch,escape,price,itemById,reduced,afterCatalogue,clearSearch,openFinder,rankMatches,beforePreview,afterPreview,beforePreviewClose,demoURL,savedChanged,openShortlist,openComparison,openFamilyShare,shortlistURL,syncOrder,previewHistory,requestPreviewClose,requestOrderClose,orderOpened,handlePop,validateContext};
})();
