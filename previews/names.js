/* Personalization is scoped to this browser tab, never written to sample files. */
(() => {
  'use strict';
  const key = 'invitestory.previewNames';
  const clean = value => typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, 50) : '';
  const valid = value => !value || /^[\p{L}\p{M}\p{N} .’'\-]+$/u.test(value);
  const read = () => { try { const value=JSON.parse(sessionStorage.getItem(key)); return value && valid(clean(value.first)) && valid(clean(value.second)) ? {first:clean(value.first),second:clean(value.second)} : {}; } catch { return {}; } };
  const names = read();
  const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let replacements = [];
  let dataApplied = false;
  function replace(text, embedded=false) {
    if (!replacements.length) return text;
    const pattern=replacements.map(([from])=>escape(from)).join('|');
    const regex=new RegExp(embedded ? pattern : `(?<![\\p{L}\\p{M}])(?:${pattern})(?![\\p{L}\\p{M}])`, 'giu');
    return text.replace(regex, match => replacements.find(([from]) => from.toLocaleLowerCase()===match.toLocaleLowerCase())?.[1] || match);
  }
  function setMap(map) {
    replacements=[];
    for (const role of ['first','second']) if(names[role]) for(const from of map[role] || []) if(from) replacements.push([from,names[role]]);
    replacements.sort((a,b)=>b[0].length-a[0].length);
  }
  function applyData(data) {
    if (!data || (!names.first && !names.second)) return data;
    dataApplied = true;
    const couple=data.couple || data;
    const values = role => {
      const value=couple[role], result=[];
      if(typeof value==='string') result.push(value);
      else if(value) for(const field of ['name','fullName','firstName','first']) if(value[field])result.push(value[field]);
      for(const field of [role+'Full',role+'FullName',role+'Short',role+'First']) if(couple[field])result.push(couple[field]);
      return result;
    };
    setMap({first:couple.first?[couple.first]:values('groom'),second:couple.second?[couple.second]:values('bride')});
    function walk(value, field='') {
      if (typeof value==='string') {
        if (/image|photo|src|url|music|asset|parents|family|^line$/i.test(field) || /^(?:https?:|\.\/|\/)/.test(value)) return value;
        return replace(value,/hashtag/i.test(field));
      }
      if(Array.isArray(value)) return value.map(child=>walk(child,field));
      if(value && typeof value==='object') for(const child of Object.keys(value))value[child]=walk(value[child],child);
      return value;
    }
    walk(data);
    for(const [role, input] of [['groom',names.first],['bride',names.second],['first',names.first],['second',names.second]]) {
      if(!input) continue;
      if(typeof couple[role]==='object') {
        for(const field of ['name','fullName','firstName','first'])if(field in couple[role])couple[role][field]=input;
        for(const field of ['lastName','last'])if(field in couple[role])couple[role][field]='';
      }
    }
    for(const field of ['initials','monogram'])if(couple[field]) {
      const first=names.first || values('groom')[0] || couple.first || '', second=names.second || values('bride')[0] || couple.second || '';
      couple[field]=`${Array.from(first)[0] || ''} & ${Array.from(second)[0] || ''}`;
    }
    return data;
  }
  window.InvitationNames = {applyData, clean, valid, replace, setMap};
  let weddingData;
  Object.defineProperty(window,'WEDDING_DATA',{configurable:true,get:()=>weddingData,set:value=>{weddingData=applyData(value);}});
  // Static exports and archived text can sit outside their editable data renderer.
  if(names.first || names.second) window.addEventListener('load', async () => {
    const maps=await fetch('/previews/name-map.json').then(r=>r.json());
    setMap(maps[location.pathname.replace(/index\.html$/, '').replace(/\/?$/, '/')] || {});
    // A visitor can choose a name that is also another sample name. Data has
    // already rendered that choice; do not substitute it a second time.
    if(dataApplied) replacements=replacements.filter(([from])=>!Object.values(names).some(name=>name.toLocaleLowerCase()===from.toLocaleLowerCase()));
    const originals=new WeakMap();
    function update(root) {
      const nodes=[];
      if(root.nodeType===3)nodes.push(root);
      else if(root.nodeType===1) { const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);while(walker.nextNode())nodes.push(walker.currentNode); }
      for(const node of nodes) {
        if(node.parentElement?.closest('script,style,textarea,input,[contenteditable]'))continue;
        const prior=originals.get(node), source=prior?.output===node.data?prior.source:node.data, output=replace(source);
        originals.set(node,{source,output});
        if(node.data!==output)node.data=output;
      }
    }
    update(document.body);
    document.title=replace(document.title);
    new MutationObserver(records=>{for(const record of records)if(record.type==='characterData')update(record.target);else for(const node of record.addedNodes)update(node);}).observe(document.body,{childList:true,characterData:true,subtree:true});
  },{once:true});
})();
