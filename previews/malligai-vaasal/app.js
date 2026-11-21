const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const systemMotion=matchMedia('(prefers-reduced-motion: reduce)');
let chosenReduced=false;
try{chosenReduced=sessionStorage.getItem('sacred-beginning-less-motion')==='true';}catch{}
const reduced=()=>systemMotion.matches||chosenReduced;
function syncMotion(){const r=reduced();document.documentElement.classList.toggle('reduced-motion',r);$$('[data-motion]').forEach(b=>{b.setAttribute('aria-pressed',String(r));b.textContent=r?'Reduced motion on':'Use less motion';b.disabled=systemMotion.matches;b.title=systemMotion.matches?'Following your device’s reduced-motion setting':'';});if(r)$$('.reveal.pending').forEach(e=>e.classList.remove('pending'));dispatchEvent(new Event('invitationmotionchange'));}
$$('[data-motion]').forEach(b=>b.addEventListener('click',()=>{chosenReduced=!chosenReduced;try{sessionStorage.setItem('sacred-beginning-less-motion',String(chosenReduced));}catch{}syncMotion();}));
systemMotion.addEventListener('change',syncMotion);syncMotion();
const welcome=$('#welcome'),light=$('#light-welcome');
const lightLabel=light.innerHTML;
let phaseTimer=0,autoTimer=0,closeTimer=0,lit=false,leaving=false,lastFocus=null;
function clearWelcomeTimers(){clearTimeout(phaseTimer);clearTimeout(autoTimer);clearTimeout(closeTimer);}
function showWelcome(){
 if(!welcome.showModal||welcome.open)return;
 clearWelcomeTimers();lit=false;leaving=false;lastFocus=document.activeElement;
 welcome.classList.remove('is-lit','is-open','is-leaving');
 light.disabled=false;light.hidden=false;light.innerHTML=lightLabel;light.removeAttribute('aria-disabled');
 $('.welcome-names').setAttribute('aria-hidden','true');$('#welcome-status').textContent='';
 welcome.showModal();welcome.scrollTop=0;document.documentElement.classList.add('welcome-active');light.focus({preventScroll:true});
}
function closeWelcome(){
 clearWelcomeTimers();if(welcome.open)welcome.close();document.documentElement.classList.remove('welcome-active');
 if(lastFocus&&lastFocus!==document.body&&lastFocus.isConnected)lastFocus.focus({preventScroll:true});
 else{const h=$('h1');h.setAttribute('tabindex','-1');h.focus({preventScroll:true});}
}
function finishWelcome(skip=false){
 if(leaving){if(skip)closeWelcome();return;}leaving=true;clearWelcomeTimers();
 if(!skip){window.scrollTo({top:0,behavior:'instant'});lastFocus=null;}
 if(skip||reduced()){closeWelcome();return;}
 welcome.classList.add('is-leaving');closeTimer=setTimeout(closeWelcome,480);
}
function openWelcomeDoors(){
 if(!welcome.open||leaving)return;
 welcome.classList.add('is-open');$('.welcome-names').setAttribute('aria-hidden','false');
 light.textContent='Welcome inside…';shower($('.threshold-dust'),18);
}
light.addEventListener('click',()=>{
 if(lit||leaving)return;lit=true;
 light.setAttribute('aria-disabled','true');light.textContent='A little light, just for you…';
 welcome.classList.add('is-lit');
 $('#welcome-status').textContent='The lamp is lit. The doors will open and take you into the invitation automatically.';
 if(reduced()){openWelcomeDoors();finishWelcome();return;}
 phaseTimer=setTimeout(openWelcomeDoors,650);autoTimer=setTimeout(()=>finishWelcome(),2350);
});
$('#skip-welcome').addEventListener('click',e=>{e.preventDefault();finishWelcome(true);});
welcome.addEventListener('cancel',e=>{e.preventDefault();finishWelcome(true);});
welcome.addEventListener('keydown',e=>{if(e.key==='Tab'){e.preventDefault();(document.activeElement===light?$('#skip-welcome'):light).focus({preventScroll:true});}});
welcome.addEventListener('close',()=>{document.documentElement.classList.remove('welcome-active');clearWelcomeTimers();});
$('#replay').addEventListener('click',showWelcome);
addEventListener('hashchange',()=>{if(location.hash&&welcome.open)finishWelcome(true);});if(!location.hash)showWelcome();
$('#reply-form').addEventListener('submit',e=>{e.preventDefault();const yes=new FormData(e.currentTarget).get('attendance')==='yes';$('#reply-status').textContent=yes?'“A seat at the ceremony. A place at the table. We look forward to having you beside us.” Preview only: nothing has been sent.':'“We’ll carry your love into the morning, and save the stories for you.” Preview only: nothing has been sent.';$('#reply-status').focus({preventScroll:true});});
$('#credits').addEventListener('click',()=>{$('#notes').showModal();$('#notes').scrollTop=0;});$('#close-notes').addEventListener('click',()=>$('#notes').close());$('#notes').addEventListener('click',e=>{if(e.target!==$('#notes'))return;const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();});
$('#calendar').addEventListener('click',()=>{const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//A Sacred Beginning//Fictional Wedding Preview//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH'];const events=[['oonjal','20270321T003000Z','20270321T010000Z','Oonjal - Courtyard'],['muhurtham','20270321T010000Z','20270321T030000Z','Muhurtham - Mandapam'],['virundhu','20270321T030000Z','20270321T040000Z','Wedding Breakfast - Dining Hall']];events.forEach(([id,start,end,name])=>lines.push('BEGIN:VEVENT',`UID:${id}-sample-sacred-beginning@invitation.example`,'DTSTAMP:20261112T000000Z',`DTSTART:${start}`,`DTEND:${end}`,`SUMMARY:SAMPLE - ${name}`,'LOCATION:Ananda Mandapam (fictional)\\, Thanjavur\\, Tamil Nadu','DESCRIPTION:Fictional sample wedding. Illustrative schedule only; not a verified auspicious time. Do not make travel plans.','STATUS:TENTATIVE','END:VEVENT'));lines.push('END:VCALENDAR');const url=URL.createObjectURL(new Blob([lines.join('\r\n')],{type:'text/calendar;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='sample-tamil-wedding.ics';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);$('#calendar-status').textContent='Sample calendar file prepared. All invitation times are India Standard Time; the events are fictional.';});
if('IntersectionObserver'in window&&!reduced()){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.remove('pending');observer.unobserve(e.target);}}),{threshold:.05,rootMargin:'80px'});$$('.ritual-copy,.invitation-close').forEach(e=>{e.classList.add('reveal','pending');observer.observe(e);});}
addEventListener('visibilitychange',()=>document.documentElement.classList.toggle('page-hidden',document.hidden));

// Optional visual moments never block the ceremony details.
document.documentElement.classList.add('enhanced');
const petalTimers=new Map();
function shower(stage,count=26){
 if(!stage)return;clearTimeout(petalTimers.get(stage));stage.replaceChildren();if(reduced())return;
 const fall=stage.clientHeight+35;
 for(let i=0;i<count;i++){const petal=document.createElement('i');petal.className='petal';petal.style.cssText=`--x:${7+(i*37%86)}%;--size:${7+i%5*1.6}px;--fall:${fall}px;--drift:${(i%2?-1:1)*(18+i%7*10)}px;--spin:${(i%2?-1:1)*(120+i*21)}deg;--delay:${i%7*.075}s`;stage.append(petal);}
 petalTimers.set(stage,setTimeout(()=>{stage.replaceChildren();petalTimers.delete(stage)},3300));
}
$('#replay').addEventListener('click',()=>$('.threshold-dust').replaceChildren());
addEventListener('invitationmotionchange',()=>{
 if(!reduced())return;
 for(const[stage,timer]of petalTimers){clearTimeout(timer);stage.replaceChildren()}petalTimers.clear();
 $$('.draw-ready').forEach(e=>e.classList.add('is-drawn'));$$('.art-ready').forEach(e=>e.classList.add('art-arrived'));
 if(welcome.open&&(lit||leaving)){clearWelcomeTimers();if(leaving)closeWelcome();else{openWelcomeDoors();finishWelcome();}}
});
const wishes={kindness:'May kindness be the first thing you find at home.',laughter:'May your home always have room for laughter.',togetherness:'May you keep finding your way back to each other.'};
$$('[data-wish]').forEach(button=>button.addEventListener('click',()=>{
 const key=button.dataset.wish, sentence=wishes[key];
 $$('[data-wish]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 $('#wish-status').textContent=sentence;$('#muhurtham').classList.add('has-wish');
 $('.carried-wish').hidden=false;$('[data-carried-wish]').textContent=sentence;
 $('.reply-wish').hidden=false;$('[data-reply-wish]').textContent=sentence;$('#blessing').classList.add('wish-carried');
 shower($('#muhurtham figure .petal-stage'),18);shower($('.wish-petals'),12);
}));
if('IntersectionObserver'in window){
 const scenes=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{
  if(!isIntersecting)return;target.classList.add(target.classList.contains('kolam-moment')?'is-drawn':'art-arrived');scenes.unobserve(target);
 }),{threshold:.16,rootMargin:'30px'});
 for(const el of $$('.ritual figure,.kolam-moment')){if(reduced()){el.classList.add(el.classList.contains('kolam-moment')?'is-drawn':'art-arrived');continue;}el.classList.add(el.classList.contains('kolam-moment')?'draw-ready':'art-ready');scenes.observe(el);}
 const active=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('not-in-view',!e.isIntersecting)));active.observe($('.hero'));
}
let journeyPending=false;const day=$('.day');
function updateJourney(){journeyPending=false;const rect=day.getBoundingClientRect();const progress=Math.max(0,Math.min(100,((innerHeight*.55-rect.top-440)/(rect.height-470))*100));day.style.setProperty('--journey',progress+'%');}
addEventListener('scroll',()=>{if(!journeyPending){journeyPending=true;requestAnimationFrame(updateJourney)}},{passive:true});addEventListener('resize',updateJourney);updateJourney();

// Small, optional responses belong to the story, never to the event instructions.
$('#parrot-greeting').addEventListener('click',()=>{const open=$('#parrot-greeting').getAttribute('aria-expanded')!=='true';$('#parrot-greeting').setAttribute('aria-expanded',String(open));$('#parrot-greeting').classList.toggle('greeted',open);$('#parrot-note').hidden=!open;});
$('#kolam-replay').addEventListener('click',()=>{const k=$('.kolam-moment');if(reduced()){k.classList.add('is-drawn');return;}k.classList.remove('is-drawn');k.classList.add('draw-ready');void k.offsetWidth;requestAnimationFrame(()=>k.classList.add('is-drawn'));});
$('#oonjal details').addEventListener('toggle',e=>$('#oonjal').classList.toggle('family-close',e.target.open));
$('#carry-light').addEventListener('click',()=>{const b=$('#blessing');b.classList.remove('light-shared');void b.offsetWidth;b.classList.add('light-shared');$('#light-whisper').textContent='May there always be light to come home to.';});
$('#reply-form').addEventListener('submit',e=>{const form=e.currentTarget;form.classList.remove('reply-saved');void form.offsetWidth;form.classList.add('reply-saved');});
