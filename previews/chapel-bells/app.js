const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const root=document.documentElement;
root.classList.add('js');
const media=matchMedia('(prefers-reduced-motion: reduce)');
let requestedReduction=false;
try{requestedReduction=sessionStorage.getItem('christian-reduce-motion')==='true'}catch{}
const reduced=()=>media.matches||requestedReduction;
const welcome=$('#welcome'),ringButton=$('#ring-in'),skip=$('#skip-welcome');
let opening=false,openingTimers=[];
function clearOpeningTimers(){openingTimers.forEach(clearTimeout);openingTimers=[]}
function after(ms,fn){openingTimers.push(setTimeout(fn,ms))}
function endWelcome(){clearOpeningTimers();opening=false;welcome.close();document.body.style.overflow='';welcome.classList.remove('is-ringing','is-unfolding','is-leaving');ringButton.removeAttribute('aria-disabled');$('#opening-note').textContent='One little ring. A whole lot of love.';$('#names').focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'})}
function startWelcome(){clearOpeningTimers();opening=false;welcome.classList.remove('is-ringing','is-unfolding','is-leaving');ringButton.removeAttribute('aria-disabled');$('#opening-note').textContent='One little ring. A whole lot of love.';document.body.style.overflow='hidden';welcome.showModal();ringButton.focus({preventScroll:true})}
function ringWelcome(){if(opening)return;opening=true;ringButton.setAttribute('aria-disabled','true');welcome.classList.add('is-ringing');$('#opening-note').textContent='A little joy is ringing out. Welcome.';if(reduced()){endWelcome();return}after(650,()=>welcome.classList.add('is-unfolding'));after(1850,()=>welcome.classList.add('is-leaving'));after(2250,endWelcome)}
ringButton.addEventListener('click',ringWelcome);
skip.addEventListener('click',e=>{e.preventDefault();endWelcome()});
welcome.addEventListener('cancel',e=>{e.preventDefault();endWelcome()});
welcome.addEventListener('keydown',e=>{if(e.key==='Tab'){e.preventDefault();(document.activeElement===ringButton?skip:ringButton).focus({preventScroll:true})}});
$('#replay').addEventListener('click',startWelcome);
function applyMotion(){root.classList.toggle('reduced-motion',reduced());$('#motion').setAttribute('aria-pressed',String(reduced()));$('#motion').textContent=media.matches?'Reduced motion · system':requestedReduction?'Restore gentle motion':'Reduce motion';if(reduced()&&opening)endWelcome()}
media.addEventListener('change',applyMotion);
$('#motion').addEventListener('click',()=>{if(media.matches)return;requestedReduction=!requestedReduction;try{sessionStorage.setItem('christian-reduce-motion',String(requestedReduction))}catch{}applyMotion()});
applyMotion();
if(!location.hash)startWelcome();
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('arrived');observer.unobserve(e.target)}}),{threshold:.08});
$$('.reveal').forEach(el=>observer.observe(el));
document.addEventListener('visibilitychange',()=>root.classList.toggle('paused',document.hidden));
let bellTimer;
$('#little-bell').addEventListener('click',()=>{const b=$('#little-bell');clearTimeout(bellTimer);b.classList.remove('rung');void b.offsetWidth;b.classList.add('rung');$('#bell-answer').textContent='There you are. Welcome.';bellTimer=setTimeout(()=>b.classList.remove('rung'),1300)});
$('#bird-note').addEventListener('click',()=>{const b=$('#bird-note'),open=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',String(open));$('#bird-message').hidden=!open});
$('#place-card').addEventListener('click',()=>{const b=$('#place-card'),open=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',String(open));$('#seat-message').textContent=open?'We saved you the seat beside the best stories.':'Tap the little place card.'});
const blessings={kindness:'May you keep choosing kindness, especially on the ordinary days.',laughter:'May your home be full of laughter, and room for one more.',faith:'May faith steady your hearts through every changing season.'};
$$('input[name=blessing]').forEach(input=>input.addEventListener('change',()=>{$('#blessing-result').textContent=blessings[input.value];$('#closing-wish').textContent=blessings[input.value];const b=$('.blessing');b.classList.remove('changed');void b.offsetWidth;b.classList.add('changed')}));
$('#reply-form').addEventListener('submit',e=>{e.preventDefault();const answer=new FormData(e.currentTarget).get('attendance');if(!answer)return;$('#reply-answer').textContent=answer==='yes'?'That’s our favourite answer.':'Love travels, too.';$('#reply-detail').textContent=answer==='yes'?'Picture the hugs. We already are. This is a demo confirmation only; no reply has been sent.':'We’ll carry your love into the day. This is a demo confirmation only; no reply has been sent.';e.currentTarget.hidden=true;$('.reply-confirmation').hidden=false;$('#change-reply').focus({preventScroll:true})});
$('#reply-form button[type=submit]').disabled=false;
$('#change-reply').addEventListener('click',()=>{$('#reply-form').hidden=false;$('.reply-confirmation').hidden=true;$('input[name=attendance]:checked')?.focus({preventScroll:true})});
$('#calendar').addEventListener('click',()=>{const text=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Where Love Comes Home//Sample Invitation//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:anna-matthew-sample-wedding-20270109','DTSTAMP:20261112T000000Z','DTSTART:20270109T093000Z','DTEND:20270109T103000Z','SUMMARY:Sample wedding Mass - Anna and Matthew','LOCATION:Fictional St. Clara Chapel\\, Goa\\, India','DESCRIPTION:FICTIONAL SAMPLE ONLY. Wedding Mass at 3 PM India Standard Time. Illustrative venue and details.','STATUS:TENTATIVE','END:VEVENT','BEGIN:VEVENT','UID:anna-matthew-sample-reception-20270109','DTSTAMP:20261112T000000Z','DTSTART:20270109T113000Z','DTEND:20270109T150000Z','SUMMARY:Sample garden reception - Anna and Matthew','LOCATION:Fictional Clara’s Garden\\, Goa\\, India','DESCRIPTION:FICTIONAL SAMPLE ONLY. Garden reception at 5 PM India Standard Time.','STATUS:TENTATIVE','END:VEVENT','END:VCALENDAR'].join('\r\n');const url=URL.createObjectURL(new Blob([text],{type:'text/calendar;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='anna-matthew-FICTIONAL-sample.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});

let partyTimer;
$('#one-more-song').addEventListener('click',()=>{const p=$('.party'),on=!p.classList.contains('is-evening');p.classList.toggle('is-evening',on);$('#one-more-song').setAttribute('aria-pressed',String(on));$('#one-more-song').firstChild.textContent=on?'Stay for one more song ':'Make it an evening ';$('#dance-note').textContent=on?'The lights are on. Your people are here.':'A little tap. A little magic.';clearTimeout(partyTimer);p.classList.toggle('is-dancing',on&&!reduced());partyTimer=setTimeout(()=>p.classList.remove('is-dancing'),4200)});
import('./rings.js').then(({initRings})=>{const canvas=$('#wedding-rings');initRings(canvas,{reduced,fallback:$('.rings-fallback'),onError:e=>{canvas.dataset.ringsError=e.message},onSupportChange:supported=>{$('#rings-hint').innerHTML=supported?'Two circles. One shared life.<br><span>Drag the rings, or use the arrow keys.</span>':'Two circles. One shared life.'}});}).catch(()=>{$('#wedding-rings').hidden=true;$('#rings-hint').innerHTML='Two circles. One shared life.'});
