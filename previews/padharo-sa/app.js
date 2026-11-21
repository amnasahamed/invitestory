(() => {
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const motion=matchMedia('(prefers-reduced-motion: reduce)');
const world=$('#world');
let manuallyReduced=false;
try{manuallyReduced=sessionStorage.getItem('wedding-less-motion')==='true';}catch(_){}
const reduceMotion=()=>motion.matches||manuallyReduced;

function icon(id,cls=''){return `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;}
$$('.toran,.mandap-toran').forEach((container,idx)=>{for(let i=0;i<(idx?7:13);i++){container.insertAdjacentHTML('beforeend',icon('leaf'));container.lastElementChild.style.setProperty('--rot',`${i%2?5:-7}deg`);}});
for(let i=0;i<9;i++)$('.trailing-flowers').insertAdjacentHTML('beforeend',icon('phool'));
for(let i=0;i<19;i++){const bulb=document.createElement('span');bulb.className='bulb';const x=(i+.5)/19;bulb.style.left=`${x*100}%`;bulb.style.top=`calc(${6.7+59.2*(1-(2*x-1)**2)}% + 6px)`;bulb.style.setProperty('--tilt',`${(x-.5)*-50}deg`);bulb.style.setProperty('--delay',`${i*43}ms`);$('.bulbs').append(bulb);}
for(let i=0;i<13;i++){const b=document.createElement('span');b.className='bulb';const x=(i+.5)/13;b.style.left=`${x*100}%`;b.style.top=`calc(${3.8+69.2*(1-(2*x-1)**2)}% + 6px)`;b.style.setProperty('--tilt',`${(x-.5)*-45}deg`);b.style.setProperty('--delay',`${i*50}ms`);$('.lower-bulbs').append(b);}
for(let i=0;i<7;i++){const n=document.createElement('span');n.className='music-note';n.textContent=i%2?'♪':'♫';n.style.left=`${i*15}%`;n.style.setProperty('--delay',`${i*.13}s`);$('.music-notes').append(n);}
let petalTimer=0;
function shower(count=50){if(reduceMotion())return;const layer=$('#petal-layer');clearTimeout(petalTimer);layer.replaceChildren();const colors=['#e49d22','#d96b2b','#e5b13e','#cf5942','#ebbd56'];for(let i=0;i<count;i++){const p=document.createElement('i');p.className='falling-petal';p.style.left=`${Math.random()*100}%`;p.style.setProperty('--color',colors[i%colors.length]);p.style.setProperty('--duration',`${2.2+Math.random()*1.5}s`);p.style.setProperty('--delay',`${Math.random()*.55}s`);p.style.setProperty('--drift',`${-65+Math.random()*130}px`);p.style.setProperty('--spin',`${180+Math.random()*500}deg`);layer.append(p);}petalTimer=setTimeout(()=>layer.replaceChildren(),4500);}
let opened=false;
function openDoor(){if(opened){$('#invitation').scrollIntoView({behavior:reduceMotion()?'instant':'smooth'});return;}opened=true;$('.doorstep').classList.add('door-open');$('#door-button').setAttribute('aria-label','The haveli door is open');$('#knock-button').querySelectorAll('span')[1].textContent='There you are. Come home.';$('.door-hint').textContent='Someone’s already making room for you.';shower(27);setTimeout(()=>{$('#invitation').scrollIntoView({behavior:reduceMotion()?'instant':'smooth'});$('#invitation').focus({preventScroll:true});history.replaceState(null,'','#invitation');},reduceMotion()?0:1100);}
$('#door-button').addEventListener('click',openDoor);$('#knock-button').addEventListener('click',openDoor);
$('#light-button').addEventListener('click',()=>{const lit=$('#sangeet').classList.toggle('is-lit');world.classList.toggle('evening-lit',lit);$('#light-button').setAttribute('aria-pressed',String(lit));$('#light-button').querySelector('span:nth-child(2)').textContent=lit?'One more song?':'Light up the evening';$('#light-status').textContent=lit?'There you are, in the middle of our favourite people.':'Familiar faces. Our favourite songs. Just waiting for the lights.';});
$('#petal-button').addEventListener('click',()=>{shower(65);world.classList.add('blessing-kept');$('#kept-blessing').hidden=false;$('#petal-status').textContent='May the love in this courtyard follow us home.';layout();});
const dialog=$('#details-dialog');$$('[data-open-details]').forEach(b=>b.addEventListener('click',()=>dialog.showModal()));$('#close-dialog').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});$('#dialog-rsvp').addEventListener('click',()=>dialog.close());
$('#rsvp-form').addEventListener('submit',e=>{e.preventDefault();const yes=new FormData(e.target).get('attendance')==='yes';$('#response-result').textContent=yes?'“We can almost hear you at the door. A seat, a second helping, and a story are waiting for you.” Preview only. Nothing has been sent.':'“We’ll miss your face in the courtyard. We’ll save the stories for when we see you.” Preview only. Nothing has been sent.';$('#response-result').focus({preventScroll:true});});
$('#calendar-button').addEventListener('click',()=>{const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Wedding Home Story//Sample Invitation//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH'];const events=[['mehendi','20270218T093000Z','20270218T113000Z','Mehendi - Garden Courtyard'],['sangeet','20270218T133000Z','20270218T173000Z','Sangeet - Mirror Terrace'],['wedding','20270219T113000Z','20270219T153000Z','Aarohi and Ishaan Wedding - Moonlit Courtyard']];events.forEach(([uid,start,end,title])=>lines.push('BEGIN:VEVENT',`UID:${uid}-sample-202702@invitation.example`,'DTSTAMP:20261112T000000Z',`DTSTART:${start}`,`DTEND:${end}`,`SUMMARY:SAMPLE - ${title}`,'LOCATION:The Gulmohar Haveli (fictional)\\, Udaipur\\, India','DESCRIPTION:Fictional sample wedding. Design preview only. Do not make travel plans.','STATUS:TENTATIVE','END:VEVENT'));lines.push('END:VCALENDAR');const blob=new Blob([lines.join('\r\n')],{type:'text/calendar;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='sample-aarohi-ishaan-celebrations.ics';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);$('#calendar-status').textContent='The sample calendar includes all three celebrations, in India Standard Time. These are fictional events.';});
let length=0,drawQueued=false,threadFlowers=[];
function layout(){const w=world.clientWidth,h=world.scrollHeight,top=world.getBoundingClientRect().top+scrollY;const y=s=>$(s).getBoundingClientRect().top+scrollY-top;const m=y('#mehendi'),s=y('#sangeet'),v=y('#wedding'),r=y('#rsvp');world.style.setProperty('--gold-end',`${(s-350)/h*100}%`);world.style.setProperty('--dusk-start',`${(s-200)/h*100}%`);world.style.setProperty('--night-start',`${(s+70)/h*100}%`);world.style.setProperty('--night-mid',`${(s+500)/h*100}%`);world.style.setProperty('--night-end',`${(v+150)/h*100}%`);const a=w*(w<760?.055:.075),b=w*(w<760?.945:.925),c=w*.5;const start=$('.home-stage').getBoundingClientRect().bottom+scrollY-top-12;const d=`M ${c} ${start} C ${c} ${start+60},${a} ${start+30},${a} ${start+150} L ${a} ${m+300} C ${a} ${s-120},${b} ${s-220},${b} ${s+140} S ${b} ${v-100},${b} ${v+80} C ${b} ${v+400},${b} ${r-100},${c} ${r+30}`;$('#story-thread').setAttribute('viewBox',`0 0 ${w} ${h}`);$$('#story-thread path').forEach(p=>p.setAttribute('d',d));length=$('#thread-light').getTotalLength();$('#thread-light').style.strokeDasharray=length;let group=$('#thread-flowers');if(!group){group=document.createElementNS('http://www.w3.org/2000/svg','g');group.id='thread-flowers';$('#story-thread').append(group);}group.replaceChildren();threadFlowers=[];for(let q=0;q<length;q+=w<760?24:29){const point=$('#thread-light').getPointAtLength(q),f=document.createElementNS('http://www.w3.org/2000/svg','use'),size=w<760?12:15;f.setAttribute('href','#phool');f.setAttribute('x',point.x-size/2);f.setAttribute('y',point.y-size/2);f.setAttribute('width',size);f.setAttribute('height',size);f.setAttribute('color',q%3?'#c87727':'#c45c2d');f.setAttribute('class',point.y>s-150&&point.y<v-50?'thread-flower thread-lamp':'thread-flower');f.style.opacity='.25';group.append(f);threadFlowers.push([f,q/length]);}update();}
function update(){drawQueued=false;const top=world.getBoundingClientRect().top;const fraction=Math.max(0,Math.min(1,(-top+innerHeight*.73)/world.scrollHeight));$('#thread-light').style.strokeDashoffset=reduceMotion()?0:length*(1-fraction);threadFlowers.forEach(([f,p])=>{f.style.opacity=reduceMotion()||p<fraction?'.85':'.25';});$('.floating-details').classList.toggle('visible',scrollY>innerHeight*.65);if(!reduceMotion()){const sun=$('.setting-sun'),bird=$('.passing-bird');const d=$('.day-turns').getBoundingClientRect().top;const progress=Math.max(0,Math.min(1,(innerHeight-d)/(innerHeight+210)));sun.style.transform=`translateY(${progress*70}px)`;bird.style.transform=`translateX(${progress*65-30}px)`;}}
addEventListener('scroll',()=>{if(!drawQueued){drawQueued=true;requestAnimationFrame(update);}},{passive:true});addEventListener('resize',layout);addEventListener('load',layout);document.fonts.ready.then(layout);layout();
if('IntersectionObserver' in window&&!reduceMotion()){document.documentElement.classList.add('js');const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.remove('pending');observer.unobserve(e.target);}}),{threshold:.01,rootMargin:'180px'});$$('.gathering-scene,.dance-scene,.mandap-scene,.reply-letter').forEach(el=>{el.classList.add('reveal','pending');observer.observe(el);});}

// A letter worth pausing for. Reading is never timed and the scene is optional.
const opener=$('#invitation-opener'),letter=$('#personal-letter');
let openingTimer=0,letterTimer=0,openerOrigin=null,openerScroll=0,leaving=false,letterOpened=false;
function syncMotion(){
  const reduced=reduceMotion();
  document.documentElement.classList.toggle('reduced-motion',reduced);
  $$('[data-motion-toggle]').forEach(b=>{b.setAttribute('aria-pressed',String(reduced));b.textContent=reduced?'Reduced motion on':'Use less motion';b.disabled=motion.matches;b.title=motion.matches?'Following your device’s reduced-motion setting':'';});
  if(reduced){
    $('#petal-layer').replaceChildren();
    $$('.reveal.pending').forEach(el=>el.classList.remove('pending'));
    $('.setting-sun').style.transform='';$('.passing-bird').style.transform='';
    if(leaving)finishLetter(true);
    if(letterOpened&&opener.open){clearTimeout(letterTimer);settleLetter();}
  }
}
function finishLetter(enter){
  clearTimeout(openingTimer);clearTimeout(letterTimer);leaving=false;
  if(opener.open)opener.close();
  document.documentElement.classList.remove('opener-active');
  opener.classList.remove('leaving');
  if(openerOrigin&&!enter){window.scrollTo({top:openerScroll,behavior:'instant'});openerOrigin.focus({preventScroll:true});openerOrigin=null;return;}
  openerOrigin=null;window.scrollTo({top:0,behavior:'instant'});$('#couple-names').focus({preventScroll:true});
}
function settleLetter(){if(opener.open&&!leaving){$('#envelope').hidden=true;$('#envelope').inert=true;$('#letter-greeting').focus({preventScroll:true});}}
function readLetter(){
  if(letterOpened||leaving)return;
  letterOpened=true;letter.hidden=false;opener.scrollTop=0;
  opener.setAttribute('aria-labelledby','letter-greeting');
  opener.classList.add('letter-open');
  $('#unwrap-button').setAttribute('aria-disabled','true');$('#unwrap-button').tabIndex=-1;
  $('.sealed-intro').setAttribute('aria-hidden','true');$('.sealed-whisper').setAttribute('aria-hidden','true');
  // Let the flap lift before the note comes into the guest’s hands.
  letterTimer=setTimeout(settleLetter,reduceMotion()?0:1050);
}
function enterHome(){
  if(leaving)return;
  if(reduceMotion()){finishLetter(true);return;}
  leaving=true;opener.classList.add('leaving');
  $('#enter-invitation').setAttribute('aria-disabled','true');
  openingTimer=setTimeout(()=>finishLetter(true),650);
}
function showOpener(replay=false){
  if(opener.open)return;
  clearTimeout(openingTimer);clearTimeout(letterTimer);
  openerOrigin=replay?document.activeElement:null;openerScroll=scrollY;
  window.scrollTo({top:0,behavior:'instant'});
  opener.classList.remove('leaving','letter-open');leaving=false;letterOpened=false;letter.hidden=true;
  $('#envelope').hidden=false;$('#envelope').inert=false;$('#unwrap-button').tabIndex=0;$('#unwrap-button').removeAttribute('aria-disabled');
  $('.sealed-intro').removeAttribute('aria-hidden');$('.sealed-whisper').removeAttribute('aria-hidden');$('#enter-invitation').removeAttribute('aria-disabled');
  opener.setAttribute('aria-labelledby','opener-title');
  document.documentElement.classList.add('opener-active');
  opener.showModal();opener.scrollTop=0;$('#unwrap-button').focus({preventScroll:true});
}
$('#unwrap-button').addEventListener('click',readLetter);
$('#enter-invitation').addEventListener('click',enterHome);
$('#opener-skip').addEventListener('click',()=>finishLetter(false));
opener.addEventListener('cancel',e=>{e.preventDefault();finishLetter(false);});
$('#replay-opener').addEventListener('click',()=>showOpener(true));
$$('[data-motion-toggle]').forEach(b=>b.addEventListener('click',()=>{manuallyReduced=!manuallyReduced;try{sessionStorage.setItem('wedding-less-motion',String(manuallyReduced));}catch(_){}syncMotion();update();}));
motion.addEventListener('change',()=>{syncMotion();update();});
document.addEventListener('visibilitychange',()=>document.documentElement.classList.toggle('page-hidden',document.hidden));
syncMotion();
// Deep links, browser Back restoration, and plain HTML never get an entry gate.
const navigation=performance.getEntriesByType('navigation')[0];
if(!location.hash&&navigation?.type!=='back_forward')showOpener();

// Only visible decorative motifs move. No animation is tied to pointer position.
if('IntersectionObserver' in window){
  const ambience=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('in-view',e.isIntersecting)),{threshold:.01});
  $$('.doorstep,.home-letter,.wedding,.closing').forEach(el=>ambience.observe(el));
}
})();