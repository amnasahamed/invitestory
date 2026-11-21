/** Dependency-free 3D rings: WebGL first, projected Canvas2D second, SVG last. */
const VERT = `
precision mediump float;
attribute vec3 aPosition;
attribute vec3 aNormal;
uniform mat4 uModel;
uniform mat4 uProjectionView;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vLocal;
void main(){
 vec4 p=uModel*vec4(aPosition,1.0);
 vPosition=p.xyz;
 vNormal=mat3(uModel)*aNormal;
 vLocal=aPosition;
 gl_Position=uProjectionView*p;
}`;
const FRAG = `
precision mediump float;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vLocal;
uniform vec3 uEye;
uniform vec3 uGold;
const float PI=3.14159265;
float distribution(float NoH,float rough){float a=rough*rough;float a2=a*a;float d=NoH*NoH*(a2-1.0)+1.0;return a2/max(PI*d*d,0.001);}
float visibility(float NoV,float NoL,float r){float k=(r+1.0)*(r+1.0)/8.0;return (NoV/(NoV*(1.0-k)+k))*(NoL/(NoL*(1.0-k)+k));}
vec3 light(vec3 N,vec3 V,vec3 L,vec3 energy){
 vec3 H=normalize(V+L);float NoL=max(dot(N,L),0.0);float NoV=max(dot(N,V),0.001);float NoH=max(dot(N,H),0.0);float VoH=max(dot(V,H),0.0);
 vec3 F=uGold+(1.0-uGold)*pow(1.0-VoH,5.0);
 vec3 spec=distribution(NoH,0.27)*visibility(NoV,NoL,0.27)*F/max(4.0*NoV*NoL,0.04);
 return (spec+uGold*0.055)*energy*NoL;
}
void main(){
 vec3 N=normalize(vNormal), V=normalize(uEye-vPosition);
 vec3 R=reflect(-V,N);
 // Broad reflected studio cards make the metal curved, rather than flat yellow.
 float top=pow(max(dot(R,normalize(vec3(-0.38,0.7,0.62))),0.0),9.0);
 float edge=pow(max(dot(R,normalize(vec3(0.85,0.22,0.48))),0.0),24.0);
 float low=pow(max(dot(R,normalize(vec3(-0.12,-0.88,0.45))),0.0),12.0);
 vec3 env=vec3(0.055,0.042,0.027)+vec3(0.24,0.21,0.16)*(0.5+0.5*R.y);
 env+=top*vec3(1.5,1.35,1.12)+edge*vec3(1.1,1.06,1.0)+low*vec3(0.22,0.18,0.12);
 vec3 c=uGold*env;
 c+=light(N,V,normalize(vec3(-3.5,5.0,4.5)),vec3(3.0,2.8,2.45));
 c+=light(N,V,normalize(vec3(4.0,1.0,2.0)),vec3(1.0,1.08,1.2));
 // Very restrained circumferential brushing, no texture downloads.
 float brush=sin(atan(vLocal.y,vLocal.x)*180.0+vLocal.z*75.0)*0.006;
 c*=1.0+brush;
 c=c/(c+vec3(1.0));
 c=pow(max(c,vec3(0.0)),vec3(1.0/2.2));
 gl_FragColor=vec4(c,1.0);
}`;
const I=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
function mul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){let v=0;for(let k=0;k<4;k++)v+=a[k*4+r]*b[c*4+k];o[c*4+r]=v;}return o;}
function rx(t){const m=I(),c=Math.cos(t),s=Math.sin(t);m[5]=c;m[6]=s;m[9]=-s;m[10]=c;return m;}
function ry(t){const m=I(),c=Math.cos(t),s=Math.sin(t);m[0]=c;m[2]=-s;m[8]=s;m[10]=c;return m;}
function rz(t){const m=I(),c=Math.cos(t),s=Math.sin(t);m[0]=c;m[1]=s;m[4]=-s;m[5]=c;return m;}
function translation(x,y,z){const m=I();m[12]=x;m[13]=y;m[14]=z;return m;}
function perspective(fov,aspect,near,far){const f=1/Math.tan(fov/2),m=new Float32Array(16);m[0]=f/aspect;m[5]=f;m[10]=(far+near)/(near-far);m[11]=-1;m[14]=2*far*near/(near-far);return m;}
function torus(major=112,minor=28){
 const vertices=[],indices=[],R=0.84,a=0.115,b=0.185;
 for(let i=0;i<=major;i++){const u=i/major*Math.PI*2,cu=Math.cos(u),su=Math.sin(u);
  for(let j=0;j<=minor;j++){const v=j/minor*Math.PI*2,cv=Math.cos(v),sv=Math.sin(v);const nx=cu*cv/a,ny=su*cv/a,nz=sv/b,n=Math.hypot(nx,ny,nz);
   vertices.push((R+a*cv)*cu,(R+a*cv)*su,b*sv,nx/n,ny/n,nz/n);}}
 for(let i=0;i<major;i++)for(let j=0;j<minor;j++){const x=i*(minor+1)+j,y=x+minor+1;indices.push(x,y,x+1,y,y+1,x+1);}
 return {vertices:new Float32Array(vertices),indices:new Uint16Array(indices)};
}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

// CPU renderer uses the same mesh/model transforms; this is real projected 3D,
// not a rotating bitmap. A painter pass handles the nonintersecting torus surfaces.
const norm3=(v)=>{const n=Math.hypot(...v)||1;return v.map(x=>x/n);};
const dot3=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const CPU_TOP=norm3([-0.38,0.7,0.62]),CPU_EDGE=norm3([0.85,0.22,0.48]),CPU_LOW=norm3([-0.12,-0.88,0.45]);
const CPU_LIGHTS=[[norm3([-3.5,5,4.5]),[3,2.8,2.45]],[norm3([4,1,2]),[1,1.08,1.2]]];
function cpuColor(N,P,distance,gold){
 const V=norm3([-P[0],-P[1],distance-P[2]]),nv=Math.max(dot3(N,V),0.001);
 const R=[2*nv*N[0]-V[0],2*nv*N[1]-V[1],2*nv*N[2]-V[2]];
 const top=Math.pow(Math.max(dot3(R,CPU_TOP),0),9),edge=Math.pow(Math.max(dot3(R,CPU_EDGE),0),24),low=Math.pow(Math.max(dot3(R,CPU_LOW),0),12),sky=0.5+0.5*R[1];
 const c=[0,1,2].map(k=>gold[k]*([.055,.042,.027][k]+[.24,.21,.16][k]*sky+top*[1.5,1.35,1.12][k]+edge*[1.1,1.06,1][k]+low*[.22,.18,.12][k]));
 for(const[L,energy]of CPU_LIGHTS){const nl=Math.max(dot3(N,L),0);if(nl<=0)continue;
  const H=norm3([V[0]+L[0],V[1]+L[1],V[2]+L[2]]),nh=Math.max(dot3(N,H),0),vh=Math.max(dot3(V,H),0),a2=Math.pow(.27,4),dd=nh*nh*(a2-1)+1;
  const D=a2/Math.max(Math.PI*dd*dd,.001),k=Math.pow(1.27,2)/8,G=(nv/(nv*(1-k)+k))*(nl/(nl*(1-k)+k)),fres=Math.pow(1-vh,5);
  for(let k=0;k<3;k++)c[k]+=(D*G*(gold[k]+(1-gold[k])*fres)/Math.max(4*nv*nl,.04)+gold[k]*.055)*energy[k]*nl;
 }
 return c.map(v=>Math.round(255*Math.pow(Math.max(v,0)/(Math.max(v,0)+1),1/2.2)));
}
function softwareDraw(ctx,mesh,models,width,height,distance){
 ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,width,height);
 const focal=height/(2*Math.tan(.67/2)),faces=[],v=mesh.vertices,ids=mesh.indices;
 for(let ring=0;ring<2;ring++){
  const m=models[ring],points=[],gold=ring?[.92,.64,.25]:[1,.70,.30];
  for(let i=0;i<v.length;i+=6){
   const x=v[i],y=v[i+1],z=v[i+2],nx=v[i+3],ny=v[i+4],nz=v[i+5];
   const P=[m[0]*x+m[4]*y+m[8]*z+m[12],m[1]*x+m[5]*y+m[9]*z+m[13],m[2]*x+m[6]*y+m[10]*z+m[14]];
   const N=[m[0]*nx+m[4]*ny+m[8]*nz,m[1]*nx+m[5]*ny+m[9]*nz,m[2]*nx+m[6]*ny+m[10]*nz];
   const depth=distance-P[2],scale=focal/depth;
   points.push({x:width/2+P[0]*scale,y:height/2-P[1]*scale,z:P[2],front:dot3(N,[-P[0],-P[1],depth]),color:cpuColor(N,P,distance,gold)});
  }
  for(let i=0;i<ids.length;i+=3){const a=points[ids[i]],b=points[ids[i+1]],c=points[ids[i+2]];
   if(a.front+b.front+c.front<=0)continue;
   faces.push({p:[a,b,c],z:(a.z+b.z+c.z)/3});
  }
 }
 faces.sort((a,b)=>a.z-b.z);
 ctx.lineWidth=.55;ctx.lineJoin='round';
 for(const face of faces){const p=face.p;let low=p[0],high=p[0];
  for(const q of p){if(q.color[0]+q.color[1]+q.color[2]<low.color[0]+low.color[1]+low.color[2])low=q;if(q.color[0]+q.color[1]+q.color[2]>high.color[0]+high.color[1]+high.color[2])high=q;}
  let fill='rgb('+p[0].color.join(',')+')';
  if(low!==high&&Math.hypot(high.x-low.x,high.y-low.y)>.05){const gradient=ctx.createLinearGradient(low.x,low.y,high.x,high.y);gradient.addColorStop(0,'rgb('+low.color.join(',')+')');gradient.addColorStop(1,'rgb('+high.color.join(',')+')');fill=gradient;}
  ctx.fillStyle=fill;ctx.strokeStyle=fill;ctx.beginPath();ctx.moveTo(p[0].x,p[0].y);ctx.lineTo(p[1].x,p[1].y);ctx.lineTo(p[2].x,p[2].y);ctx.closePath();ctx.fill();ctx.stroke();
 }
}


/**
 * initRings(canvas, { reduced?:()=>boolean, fallback?:HTMLImageElement,
 * fallbackURL?:string, onSupportChange?:(supported:boolean,renderer:string)=>void, duration?:number })
 * Returns { supported, renderer, render(), reset({animate?:boolean}), dispose() }.
 * Set a CSS width AND height on the canvas (or its container) before calling.
 */
export function initRings(canvas,options={}){
 if(!canvas||typeof canvas.getContext!=='function')throw new TypeError('initRings needs a canvas element');
 const doc=canvas.ownerDocument,win=doc.defaultView||globalThis;
 const motion=win.matchMedia?.('(prefers-reduced-motion: reduce)');
 const coarse=win.matchMedia?.('(pointer: coarse)')?.matches||false;
 const old={hidden:canvas.hidden,tabindex:canvas.getAttribute('tabindex'),role:canvas.getAttribute('role'),label:canvas.getAttribute('aria-label'),touchAction:canvas.style.touchAction,cursor:canvas.style.cursor};
 let fallback=options.fallback,ownedFallback=false;
 if(!fallback){fallback=doc.createElement('img');fallback.src=options.fallbackURL||new URL('./assets/rings-fallback.svg',import.meta.url).href;fallback.alt='Two interlocking gold wedding rings';fallback.width=560;fallback.height=420;fallback.style.cssText='width:100%;height:100%;object-fit:contain;';fallback.hidden=true;canvas.insertAdjacentElement('afterend',fallback);ownedFallback=true;}
 const fallbackOldHidden=fallback.hidden;
 canvas.tabIndex=canvas.hasAttribute('tabindex')?canvas.tabIndex:0;
 if(!canvas.hasAttribute('role'))canvas.setAttribute('role','img');
 if(!canvas.hasAttribute('aria-label'))canvas.setAttribute('aria-label','Two gold wedding rings. Drag or use arrow keys to turn. Press Home to reset.');
 canvas.style.touchAction='pan-y';canvas.style.cursor='grab';
 let gl=null,resources=null,disposed=false,lost=false,good=false,raf=0,visible=true,lastTime=0,elapsed=0,dirty=true;
 let surface=canvas,softwareCanvas=null,ctx2d=null,softwareMesh=null,mode='svg';
 let rotation={x:-0.63,y:0.24,z:-0.28};
 let intro=true,drag=null;
 const duration=clamp(Number(options.duration)||1400,400,4000);
 const reduced=()=>!!(motion?.matches||doc.documentElement.classList.contains('reduced-motion')||options.reduced?.());
 const isVisible=()=>visible&&!doc.hidden&&!disposed;
 function signal(renderer){mode=renderer;good=renderer!=='svg';canvas.hidden=!good||surface!==canvas;if(softwareCanvas)softwareCanvas.hidden=renderer!=='canvas2d';fallback.hidden=good;canvas.dataset.ringsState=renderer==='svg'?'fallback':renderer;surface.dataset.ringsState=canvas.dataset.ringsState;options.onSupportChange?.(good,renderer);}
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const e=gl.getShaderInfoLog(s);gl.deleteShader(s);throw new Error(e||'WebGL shader compilation failed');}return s;}
 function release(){if(!resources||!gl)return;gl.deleteBuffer(resources.vertex);gl.deleteBuffer(resources.index);gl.deleteProgram(resources.program);resources=null;}
 function setupSoftware(error){
  try{
   try{ctx2d=canvas.getContext('2d',{alpha:true});}catch(_){ctx2d=null;}
   if(!ctx2d){
    if(!softwareCanvas){softwareCanvas=doc.createElement('canvas');softwareCanvas.className=canvas.className;softwareCanvas.style.cssText=canvas.style.cssText;softwareCanvas.style.width='100%';softwareCanvas.style.height='100%';softwareCanvas.tabIndex=canvas.tabIndex;softwareCanvas.setAttribute('role','img');softwareCanvas.setAttribute('aria-label',canvas.getAttribute('aria-label'));canvas.insertAdjacentElement('afterend',softwareCanvas);bindInteraction(softwareCanvas);}
    ctx2d=softwareCanvas.getContext('2d',{alpha:true});if(!ctx2d)throw new Error('Neither WebGL nor Canvas2D is available');
    surface=softwareCanvas;ro?.unobserve?.(canvas);io?.unobserve?.(canvas);ro?.observe(surface);io?.observe(surface);
   }else surface=canvas;
   softwareMesh=softwareMesh||torus(coarse?64:80,coarse?20:24);lost=false;signal('canvas2d');dirty=true;queue();options.onFallback?.(error);
  }catch(cpuError){signal('svg');options.onError?.(cpuError);}
 }
 function setup(){
  if(options.renderer==='canvas2d'){setupSoftware(new Error('Software renderer selected'));return;}
  try{
   gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:true,depth:true,powerPreference:'low-power',preserveDrawingBuffer:false});
   if(!gl)throw new Error('WebGL unavailable');
   const vs=shader(gl.VERTEX_SHADER,VERT),fs=shader(gl.FRAGMENT_SHADER,FRAG),program=gl.createProgram();
   gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);
   if(!gl.getProgramParameter(program,gl.LINK_STATUS)){const e=gl.getProgramInfoLog(program);gl.deleteProgram(program);throw new Error(e||'WebGL program link failed');}
   const mesh=torus(coarse?96:112,coarse?24:28),vertex=gl.createBuffer(),index=gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER,vertex);gl.bufferData(gl.ARRAY_BUFFER,mesh.vertices,gl.STATIC_DRAW);
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,index);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,mesh.indices,gl.STATIC_DRAW);
   resources={program,vertex,index,count:mesh.indices.length,pos:gl.getAttribLocation(program,'aPosition'),normal:gl.getAttribLocation(program,'aNormal'),model:gl.getUniformLocation(program,'uModel'),pv:gl.getUniformLocation(program,'uProjectionView'),eye:gl.getUniformLocation(program,'uEye'),gold:gl.getUniformLocation(program,'uGold')};
   gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.clearColor(0,0,0,0);
   ro?.unobserve?.(surface);io?.unobserve?.(surface);surface=canvas;ro?.observe(canvas);io?.observe(canvas);lost=false;signal('webgl');dirty=true;queue();
  }catch(error){release();setupSoftware(error);}
 }
 function pose(){const t=intro?clamp(elapsed/duration,0,1):1;const ease=1-Math.pow(1-t,3);return {x:rotation.x+(1-ease)*0.18,y:rotation.y+(1-ease)*0.72,z:rotation.z+(1-ease)*-0.12};}
 function finishAtCurrentPose(){rotation=pose();intro=false;lastTime=0;}
 function draw(){
  if(lost||!good)return;
  const rect=surface.getBoundingClientRect(),width=rect.width,height=rect.height;if(width<1||height<1)return;
  const dpr=Math.min(win.devicePixelRatio||1,mode==='canvas2d'?1.25:(coarse||width<600?1.5:2)),pw=Math.max(1,Math.round(width*dpr)),ph=Math.max(1,Math.round(height*dpr));
  if(surface.width!==pw||surface.height!==ph){surface.width=pw;surface.height=ph;}
  const aspect=width/height,distance=Math.max(4.45,4.4/aspect),p=pose();
  const world=mul(rz(p.z),mul(ry(p.y),rx(p.x)));
  // A genuine Hopf link: nonintersecting tori in perpendicular planes.
  const models=[mul(world,translation(-0.51,0,0)),mul(world,mul(translation(0.51,0,0),rx(Math.PI/2)))];
  if(mode==='canvas2d'){softwareDraw(ctx2d,softwareMesh,models,pw,ph,distance);return;}
  if(!resources)return;
  gl.viewport(0,0,pw,ph);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(resources.program);
  gl.bindBuffer(gl.ARRAY_BUFFER,resources.vertex);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,resources.index);
  gl.enableVertexAttribArray(resources.pos);gl.vertexAttribPointer(resources.pos,3,gl.FLOAT,false,24,0);
  gl.enableVertexAttribArray(resources.normal);gl.vertexAttribPointer(resources.normal,3,gl.FLOAT,false,24,12);
  const pv=mul(perspective(0.67,aspect,0.1,Math.max(30,distance+8)),translation(0,0,-distance));
  gl.uniformMatrix4fv(resources.pv,false,pv);gl.uniform3f(resources.eye,0,0,distance);
  for(let i=0;i<2;i++){gl.uniformMatrix4fv(resources.model,false,models[i]);gl.uniform3f(resources.gold,i?0.92:1.0,i?0.64:0.70,i?0.25:0.30);gl.drawElements(gl.TRIANGLES,resources.count,gl.UNSIGNED_SHORT,0);}
 }
 function tick(now){raf=0;if(!isVisible()||lost||!good){lastTime=0;return;}
  if(reduced()){intro=false;lastTime=0;}
  if(intro){if(lastTime)elapsed+=Math.min(64,now-lastTime);lastTime=now;if(elapsed>=duration){elapsed=duration;intro=false;}dirty=true;}
  if(dirty){draw();dirty=false;}
  if(intro)queue();
 }
 function queue(){if(!raf&&isVisible()&&good&&!lost)raf=win.requestAnimationFrame(tick);}
 function render(){dirty=true;if(reduced())intro=false;queue();}
 function reset({animate=false}={}){rotation={x:-0.63,y:0.24,z:-0.28};elapsed=0;lastTime=0;intro=!!animate&&!reduced();render();}
 const listeners=[];
 function on(target,name,fn,opts){target.addEventListener(name,fn,opts);listeners.push(()=>target.removeEventListener(name,fn,opts));}
 function pointerDown(e){if(e.button!==undefined&&e.button!==0)return;if(!good)return;finishAtCurrentPose();drag={id:e.pointerId,x:e.clientX,y:e.clientY,rx:rotation.x,ry:rotation.y};surface.setPointerCapture?.(e.pointerId);surface.style.cursor='grabbing';surface.focus({preventScroll:true});}
 function pointerMove(e){if(!drag||drag.id!==e.pointerId)return;const scale=3/Math.max(240,surface.getBoundingClientRect().width);rotation.y=drag.ry+(e.clientX-drag.x)*scale;rotation.x=clamp(drag.rx+(e.clientY-drag.y)*scale,-1.4,1.4);render();}
 function pointerEnd(e){if(!drag||drag.id!==e.pointerId)return;drag=null;surface.style.cursor='grab';if(surface.hasPointerCapture?.(e.pointerId))surface.releasePointerCapture(e.pointerId);}
 function keydown(e){const step=e.shiftKey?0.20:0.09;if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','0'].includes(e.key)||!good)return;e.preventDefault();finishAtCurrentPose();if(e.key==='Home'||e.key==='0'){reset();return;}if(e.key==='ArrowLeft')rotation.y-=step;if(e.key==='ArrowRight')rotation.y+=step;if(e.key==='ArrowUp')rotation.x=clamp(rotation.x-step,-1.4,1.4);if(e.key==='ArrowDown')rotation.x=clamp(rotation.x+step,-1.4,1.4);render();}
 function visibilityChanged(){lastTime=0;if(!isVisible()){if(raf)win.cancelAnimationFrame(raf);raf=0;}else render();}
 function motionChanged(){if(reduced()){intro=false;lastTime=0;}render();}
 function bindInteraction(target){on(target,'pointerdown',pointerDown);on(target,'pointermove',pointerMove);on(target,'pointerup',pointerEnd);on(target,'pointercancel',pointerEnd);on(target,'lostpointercapture',pointerEnd);on(target,'keydown',keydown);}
 bindInteraction(canvas);
 on(canvas,'webglcontextlost',e=>{e.preventDefault();lost=true;if(raf)win.cancelAnimationFrame(raf);raf=0;resources=null;setupSoftware(new Error('WebGL context lost'));});
 on(canvas,'webglcontextrestored',()=>{if(!disposed)setup();});on(doc,'visibilitychange',visibilityChanged);on(win,'resize',render,{passive:true});
 if(motion?.addEventListener)on(motion,'change',motionChanged);else if(motion?.addListener){motion.addListener(motionChanged);listeners.push(()=>motion.removeListener(motionChanged));}
 const ro=win.ResizeObserver?new win.ResizeObserver(render):null;ro?.observe(canvas);
 const io=win.IntersectionObserver?new win.IntersectionObserver(entries=>{const entry=entries.find(e=>!e.target||e.target===surface);if(entry){visible=entry.isIntersecting!==false;visibilityChanged();}},{threshold:0}):null;io?.observe(canvas);
 const mo=win.MutationObserver?new win.MutationObserver(motionChanged):null;mo?.observe(doc.documentElement,{attributes:true,attributeFilter:['class']});
 intro=!reduced();setup();
 return {get supported(){return good;},get renderer(){return mode;},render,reset,dispose(){if(disposed)return;disposed=true;good=false;if(raf)win.cancelAnimationFrame(raf);raf=0;listeners.forEach(off=>off());ro?.disconnect();io?.disconnect();mo?.disconnect();release();softwareCanvas?.remove();if(ownedFallback)fallback.remove();else fallback.hidden=fallbackOldHidden;canvas.hidden=old.hidden;canvas.style.touchAction=old.touchAction;canvas.style.cursor=old.cursor;for(const [name,value]of [['tabindex',old.tabindex],['role',old.role],['aria-label',old.label]]){if(value===null)canvas.removeAttribute(name);else canvas.setAttribute(name,value);}delete canvas.dataset.ringsState;}};
}
