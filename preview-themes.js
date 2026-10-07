/* Palettes art-directed against all 35 catalogue covers, not extracted at runtime.
   Order of fields: family, stage, surface, ink, action, decorative highlight. */
const PreviewThemes = (() => {
  const palettes = {
    1:['paper','#e8e3d9','#faf8f2','#38352b','#665b3f','#b59c6b'],
    3:['festive','#3b0d11','#fff5e8','#411b1a','#781e23','#c29b53'],
    5:['festive','#f0dfbd','#fffaf0','#47381d','#805522','#d89e34'],
    6:['festive','#e9d49a','#fff9e7','#4e3e1e','#756027','#c99024'],
    7:['paper','#a5ada0','#faf6e9','#3c463b','#526047','#bba36c'],
    29:['paper','#e7dfcb','#fffcf1','#4b4435','#716345','#c9ae7c'],
    8:['botanical','#092e24','#f9f4e4','#173b2e','#1a4b39','#c5ac66'],
    9:['botanical','#dce3c6','#fffdf1','#3e482b','#596331','#a6ac74'],
    10:['botanical','#17376a','#f2f6ff','#1b3457','#214c91','#7f9ed2'],
    11:['festive','#0d392b','#fcf7e9','#23412d','#295b3d','#cb9c4c'],
    12:['botanical','#6c5843','#fff8e9','#4e3b2a','#715035','#cfb471'],
    13:['illustrated','#123d53','#f3f6ed','#19394a','#255a70','#d8a84b'],
    14:['illustrated','#b6deed','#fff9ec','#3b4135','#596841','#e0bd79'],
    15:['illustrated','#e6dbc3','#fcf9f2','#50432f','#78603d','#cbb180'],
    17:['paper','#d9d4c9','#fcfaf4','#3e3932','#645a4b','#b7aa91'],
    18:['botanical','#e6b5a6','#fff5ed','#573b35','#894c48','#bd805d'],
    19:['paper','#9ba694','#fbf6e7','#394738','#4b614a','#bba066'],
    30:['festive','#dbd0b2','#fcf8ea','#4c432f','#72613c','#a79956'],
    31:['festive','#63673b','#fcf5e5','#45452a','#5e6434','#b4a559'],
    21:['cinematic','#5d453e','#fff6e8','#563932','#7c4845','#c6a178'],
    22:['cinematic','#1c080e','#2b1119','#fff4df','#e7c287','#c49756'],
    23:['cinematic','#0c152d','#18223b','#f5f1e9','#c6d9f2','#9cb2d7'],
    24:['botanical','#a87477','#fff2e8','#593b3c','#8a4f58','#c79c80'],
    25:['cinematic','#231429','#322139','#fff2e4','#efbc99','#c58d91'],
    26:['cinematic','#102137','#1b3048','#f2f4f4','#c3d9e5','#8dabc3'],
    27:['festive','#e8d7ac','#fff9ea','#55412b','#7e5939','#ce9e47'],
    28:['paper','#e5dac7','#fffbf2','#4b302e','#721e28','#bd9c67'],
    32:['festive','#7b2617','#fff3df','#582a20','#963b26','#cda24d'],
    33:['cinematic','#55401d','#fff8e8','#4c3c21','#725723','#c6a25d'],
    34:['cinematic','#281811','#fff5e7','#4d3525','#755031','#b49b64'],
    16:['paper','#e7dbc0','#fffaf0','#55492f','#7a653c','#bba368'],
    35:['botanical','#351323','#fbf0ea','#4c2034','#682e49','#c9988f'],
    36:['botanical','#64351f','#fff4e6','#542d1c','#8b4e2b','#c69a64'],
    37:['botanical','#142c44','#f0f5f8','#253f56','#294e7b','#97b0c4'],
    38:['botanical','#112f2e','#f3f3e8','#23423d','#174b49','#b4af84']
  };
  const neutral=['paper','#edf2ef','#ffffff','#173e35','#173e35','#547c6b'];
  const rgb=hex=>hex.slice(1).match(/../g).map(value=>parseInt(value,16));
  const mix=(a,b,weight)=>'#'+rgb(a).map((value,i)=>Math.round(value*weight+rgb(b)[i]*(1-weight)).toString(16).padStart(2,'0')).join('');
  const luminance=hex=>rgb(hex).map(value=>{value/=255;return value<=.04045?value/12.92:((value+.055)/1.055)**2.4;}).reduce((sum,value,i)=>sum+value*[.2126,.7152,.0722][i],0);
  const contrast=(a,b)=>(Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);
  function themeFor(id) {
    const [family,stage,surface,ink,accent,trim]=palettes[id]||neutral;
    return {family,stage,surface,ink,accent,trim,muted:mix(ink,surface,.82),soft:mix(surface,accent,.9),border:mix(surface,ink,.82),onAccent:contrast(accent,'#ffffff')>=contrast(accent,'#171717')?'#ffffff':'#171717'};
  }
  function apply(element,item,order=false) {
    if(!element)return;
    const theme=themeFor(item?.id);
    element.dataset.invitationTheme=String(item?.id||'neutral');
    element.dataset.themeFamily=theme.family;
    Object.entries(theme).filter(([key])=>key!=='family').forEach(([key,value])=>element.style.setProperty('--invitation-'+key.replace(/[A-Z]/g,letter=>'-'+letter.toLowerCase()),value));
    if(order) {
      const tokens={'panel-top':theme.surface,'panel-bottom':theme.surface,ink:theme.ink,muted:theme.muted,accent:theme.accent,surface:theme.surface,soft:theme.soft,border:theme.border,shadow:theme.stage+'40','cta-start':theme.accent,'cta-mid':theme.accent,'cta-end':theme.accent,'cta-ink':theme.onAccent};
      Object.entries(tokens).forEach(([key,value])=>element.style.setProperty('--order-'+key,value));
    }
  }
  return {themeFor,apply,contrast};
})();
