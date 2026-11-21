import { initArrival } from './arrival.js';
import { initDiya } from './diya.js';
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const systemMotion=matchMedia('(prefers-reduced-motion: reduce)');
let chosenReduced=false;
try { chosenReduced=sessionStorage.getItem('keepsake-less-motion')==='true'; } catch(_){}
const isReduced=()=>systemMotion.matches||chosenReduced;
let diya=null,lit=false,threadLength=0,frame=0;
const book=$('#scrapbook');
const envelope=$('#envelope-scene');
let envelopeOpen=false;
envelope.classList.add('envelope-bound');
$('#open-letter').inert=true;
$('#untie-envelope').hidden=false;
function unwrapEnvelope(focus=true){
 if(envelopeOpen)return;
 envelopeOpen=true;book.classList.add('thread-released');$('.stationery-scene').classList.add('letter-ready');envelope.classList.remove('envelope-bound');envelope.classList.add('envelope-unwrapped');
 $('#open-letter').inert=false;$('#untie-envelope').setAttribute('aria-expanded','true');
 $('#untie-envelope').disabled=true;$('#untie-envelope').textContent='Tied with love. Opened by you.';
 $('#envelope-status').textContent='The ribbon is untied. Your photograph and letter are waiting. Choose Read our little letter to open it.';
 const external=$('#read-letter-external');if(external){external.hidden=false;if(focus)external.focus({preventScroll:true});}else if(focus){$('#open-letter').focus({preventScroll:true});}
 layout();
}
$('#untie-envelope').addEventListener('click',()=>unwrapEnvelope(true));
function syncMotion(){
 const reduced=isReduced(); document.documentElement.classList.toggle('reduced-motion',reduced);
 $$('[data-motion]').forEach(b=>{b.setAttribute('aria-pressed',String(reduced));b.textContent=reduced?'Reduced motion on':'Use less motion';b.disabled=systemMotion.matches;b.title=systemMotion.matches?'Following your device’s reduced-motion setting':'';});
 if(reduced)$$('.reveal.pending').forEach(el=>el.classList.remove('pending'));
 drawThread();diya?.render();
}
$$('[data-motion]').forEach(b=>b.addEventListener('click',()=>{chosenReduced=!chosenReduced;try{sessionStorage.setItem('keepsake-less-motion',String(chosenReduced));}catch(_){}syncMotion();}));
systemMotion.addEventListener('change',syncMotion);
function openDialog(el){el.showModal();el.scrollTop=0;}
$('#open-letter').addEventListener('click',()=>openDialog($('#letter-dialog')));
$('#read-letter-external')?.addEventListener('click',()=>openDialog($('#letter-dialog')));
$$('[data-details]').forEach(b=>b.addEventListener('click',()=>openDialog($('#details-dialog'))));
$('#photo-credits').addEventListener('click',()=>openDialog($('#credits-dialog')));
$$('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
$$('dialog').forEach(dialog=>dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}}));
$('#go-reply').addEventListener('click',()=>$('#details-dialog').close());
$('#turn-memory').addEventListener('click',e=>{const button=e.currentTarget,turned=button.classList.toggle('turned');button.setAttribute('aria-pressed',String(turned));button.setAttribute('aria-label',turned?'Turn the note back to the flower photograph':'Turn over the flower photograph to read a note');button.querySelector('.memory-front').setAttribute('aria-hidden',String(turned));button.querySelector('.memory-back').setAttribute('aria-hidden',String(!turned));$('#memory-announcement').textContent=turned?Array.from(button.querySelector('.memory-back').children).map(el=>el.textContent).join('. '):'';$('.turn-hint').innerHTML=turned?'A little note, just for you <span class="ink-arrow" aria-hidden="true"></span>':'Turn this memory over <span class="ink-arrow" aria-hidden="true"></span>';});
try{diya=initDiya($('#diya-canvas'),{isReduced});}catch(_){}
if(diya){$('.diya-stage').classList.add('webgl-ready');}else{$('#diya-canvas').hidden=true;$('.material-note').textContent='A LITTLE CLAY LAMP, RENDERED IN PAPER & LIGHT';}
$('#diya-canvas').addEventListener('webglcontextlost',()=>$('.diya-stage').classList.remove('webgl-ready'));
$('#diya-canvas').addEventListener('webglcontextrestored',()=>{if(diya)$('.diya-stage').classList.add('webgl-ready');});
$('#light-diya').addEventListener('click',()=>{lit=!lit;$('#a-little-light').classList.toggle('is-lit',lit);book.classList.toggle('light-carried',lit);$('#light-diya').setAttribute('aria-pressed',String(lit));$('#light-diya span').textContent=lit?'Put out the diya':'Light a little diya';$('#light-status').textContent=lit?'May the love we’ve been given find its way into the life we make.':'A small light, for the people we carry with us.';$('#carried-light').hidden=!lit;diya?.setLit(lit);layout();});
$('#reply-form').addEventListener('submit',e=>{e.preventDefault();const yes=new FormData(e.currentTarget).get('attendance')==='yes';$('#reply-status').textContent=yes?'“A place beside us. A second helping. One more song. We can’t wait.” Preview only: your reply has not been sent.':'“We’ll miss you in the photographs, but not in our hearts. We’ll save the stories.” Preview only: your reply has not been sent.';$('#reply-status').focus({preventScroll:true});layout();});
$('#calendar').addEventListener('click',()=>{
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//The Things We Keep//Sample Invitation//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH'];
 const events=[['mehendi','20270218T093000Z','20270218T113000Z','Mehendi - Garden Courtyard'],['sangeet','20270218T133000Z','20270218T173000Z','Sangeet - Mirror Terrace'],['wedding','20270219T113000Z','20270219T153000Z','Aarohi and Ishaan Wedding - Moonlit Courtyard']];
 events.forEach(([id,start,end,name])=>lines.push('BEGIN:VEVENT',`UID:${id}-sample-keepsake@invitation.example`,'DTSTAMP:20261112T000000Z',`DTSTART:${start}`,`DTEND:${end}`,`SUMMARY:SAMPLE - ${name}`,'LOCATION:The Gulmohar Haveli (fictional)\\, Udaipur\\, India','DESCRIPTION:Fictional sample wedding. Design preview only. Do not make travel plans.','STATUS:TENTATIVE','END:VEVENT'));
 lines.push('END:VCALENDAR');const url=URL.createObjectURL(new Blob([lines.join('\r\n')],{type:'text/calendar;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='sample-keepsake-celebrations.ics';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);$('#calendar-status').textContent='Your sample calendar file is ready. Open it to add the three fictional events. All invitation times are India Standard Time.';
});
function layout(){
 const w=book.clientWidth,h=book.scrollHeight,bt=book.getBoundingClientRect().top;
 const y=s=>$(s).getBoundingClientRect().top-bt;
 const mobile=w<600,left=w*(mobile?.025:.045),right=w*(mobile?.975:.955),mid=w*.5;
 const a=y('#little-things'),b=y('#celebrations'),c=y('#a-little-light'),d=y('#reply');
 const begin=y('#envelope-scene')+$('#envelope-scene').offsetHeight*.74;
 const end=y('.reply-envelope')+$('.reply-envelope').offsetHeight-35;
 const path=`M ${w*.5} ${begin} C ${right} ${begin+5},${right} ${a-55},${right} ${a+80} L ${right} ${b-100} Q ${right} ${b-40},${w*.83} ${b-35} C ${w*.52} ${b-10},${left} ${b-5},${left} ${b+180} L ${left} ${c-120} Q ${left} ${c-35},${left} ${c+100} L ${left} ${d-100} Q ${left} ${d-15},${left} ${d+150} C ${left} ${end+45},${w*.3} ${end+50},${mid} ${end}`;
 $('#memory-thread').setAttribute('viewBox',`0 0 ${w} ${h}`);$$('.memory-thread path').forEach(el=>el.setAttribute('d',path));threadLength=$('#thread-drawn').getTotalLength();$('#thread-drawn').style.strokeDasharray=threadLength;drawThread();
}
function drawThread(){frame=0;const fraction=Math.max(0,Math.min(1,(-book.getBoundingClientRect().top+innerHeight*.75)/book.scrollHeight));$('#thread-drawn').style.strokeDashoffset=isReduced()?0:threadLength*(1-fraction);}
addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(drawThread);},{passive:true});addEventListener('resize',layout);addEventListener('load',layout);document.fonts.ready.then(layout);$$('img').forEach(img=>img.addEventListener('load',layout));
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.remove('pending');observer.unobserve(e.target);}}),{threshold:.01,rootMargin:'100px'});if(!isReduced())$$('.moment-note,.ticket,.reply-postcard').forEach(el=>{el.classList.add('reveal','pending');observer.observe(el);});}
document.addEventListener('visibilitychange',()=>document.documentElement.classList.toggle('page-hidden',document.hidden));
syncMotion();layout();

initArrival({isReduced,unwrapEnvelope});

$$('.margin-note').forEach(note=>note.addEventListener('toggle',layout));
