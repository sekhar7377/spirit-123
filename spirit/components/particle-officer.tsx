'use client';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { useReducedMotion } from 'framer-motion';
import { RIG_GLSL, STAR_PARTICLES, poseAt } from '../lib/constellation-rig';
import { samplePortrait } from '../lib/portrait-sampling';

const VERTEX=`#version 300 es
precision highp float;
uniform sampler2D uPortrait;
uniform vec2 uResolution;
uniform float uCount;
in vec2 aUV;
uniform float uTime;
uniform float uFormation;
uniform float uImageAspect;
uniform vec2 uMouse;
uniform float uMousePower;
uniform vec2 uVelocity;
uniform vec2 uTrail[6];
uniform float uPixelRatio;
out vec3 vColor;
out float vAlpha;
float hash(float n){return fract(sin(n)*43758.5453123);}
vec3 flow(vec3 p,float t){
 return vec3(sin(p.y*1.8+t*.43)+cos(p.z*2.1-t*.31),sin(p.z*1.7+t*.37)+cos(p.x*1.9+t*.25),sin(p.x*1.6-t*.29)+cos(p.y*2.0+t*.33));
}
${RIG_GLSL}
void main(){
 float id=float(gl_VertexID);
 if(id>=uCount){float star=id-uCount;float sx=hash(star+401.)*2.-1.;float sy=mod(hash(star+811.)*2.+uTime*(.002+hash(star+53.)*.004),2.)-1.;gl_Position=vec4(sx,sy,.8,1.);gl_PointSize=(.6+hash(star+201.)*.8)*uPixelRatio;vColor=vec3(.88,.93,1.);vAlpha=.08+hash(star+90.)*.18;return;}
 vec2 uv=aUV;
 vec4 tex=texture(uPortrait,uv);
 float luminance=dot(tex.rgb,vec3(.2126,.7152,.0722));
 float seed=hash(id*.173+1.);
 vec3 target=portraitPoint(uv);
 float torsoWidth=max(.04,.205*(1.-.28*smoothstep(.48,.75,uv.y)));
 float bulge=sqrt(max(0.,1.-pow((uv.x-.615)/torsoWidth,2.)));
 target.z=bulge*.13+(luminance-.35)*.045;
 float angle=seed*6.2831853+uTime*.15;
 float radius=.8+hash(id+7.)*2.2;
 vec3 cloud=vec3(cos(angle)*radius,sin(angle)*radius*.58,(hash(id+53.)-.5)*2.5);
 if(uFormation<.99)cloud+=flow(cloud,uTime)*.45;
 target.z+=(hash(id+37.)-.5)*.012;
 float melt=1.-uFormation;
 target=skin(target,uv);
 vec3 p=mix(cloud,target,uFormation);
 p+=flow(p*1.7,uTime)*(.0015+.18*melt);
 float camera=3.4;
 float aspect=uResolution.x/uResolution.y;
 float framing=aspect<.85?2.1:2.7;
 vec2 ndc=p.xy*framing/(camera-p.z)/vec2(aspect,1.);
 // True screen-space distance, corrected for aspect, parts the fluid around a cursor trail.
 vec2 push=vec2(0.);
 if(uMousePower>.005)for(int i=0;i<6;i++){
  vec2 centre=i==0?uMouse:uTrail[i];
  vec2 delta=(ndc-centre)*vec2(aspect,1.);
  float dist=length(delta);
  float influence=exp(-dist*dist/ .075)*uMousePower*(1.-float(i)*.12);
  vec2 direction=delta/max(dist,.018);
  float a=seed*6.2831853+uTime*(.8+seed);
  vec2 scatter=vec2(cos(a),sin(a))*(.08+hash(id+71.)*.25);
  push+=(direction*.025+vec2(-direction.y,direction.x)*(.06+seed*.12)+scatter+uVelocity*.10)*influence;
 }
 p.xy+=push*vec2(1.,1.)*.85;
 p.z+=length(push)*.32;
 ndc=p.xy*framing/(camera-p.z)/vec2(aspect,1.);
 gl_Position=vec4(ndc,p.z*.08,1.);

 float faceDetail=exp(-pow((uv.x-.62)/.095,2.)-pow((uv.y-.78)/.14,2.));
 gl_PointSize=clamp((1.34+.45*melt)*mix(1.,.70,faceDetail)*sqrt(280000./uCount)*uPixelRatio*3.4/(camera-p.z),.65,2.8);
 vec3 bronze=vec3(.90,.94,1.);
 // Retain eye sockets, nose planes and mouth shading instead of washing the face white.
 vec3 shaded=mix(pow(tex.rgb,vec3(.60))*1.3,pow(tex.rgb,vec3(1.02))*1.04,faceDetail);
 vColor=mix(bronze,shaded,.42+.58*uFormation);
 float border=smoothstep(0.,.10,uv.x)*smoothstep(0.,.10,1.-uv.x)*smoothstep(0.,.07,uv.y)*smoothstep(0.,.07,1.-uv.y);
 float pulse=1.+.07*sin(uTime*.8+uv.y*9.);
 vAlpha=smoothstep(.018,.10,luminance)*(.68+.22*uFormation)*border*pulse;
 // Empty background texels never become a rectangular particle sheet.
 if(vAlpha<.015)gl_Position=vec4(4.,4.,4.,1.);
}`;
const FRAGMENT=`#version 300 es
precision highp float;
in vec3 vColor;
in float vAlpha;
out vec4 color;
void main(){float d=length(gl_PointCoord-.5);float core=1.-smoothstep(.08,.35,d);float halo=exp(-d*d*14.)*.24;float edge=core+halo;if(d>.5)discard;color=vec4(vColor,vAlpha*edge);}`;
const smooth=(a:number,b:number,x:number)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};

export default function ParticleOfficer(){
 const root=useRef<HTMLElement>(null),canvas=useRef<HTMLCanvasElement>(null),mouse=useRef({x:4,y:4,active:0,stamp:0}),pausedRef=useRef(false),resetRef=useRef(false);
 const prefersReduced=useReducedMotion(),[enableMotion,setEnableMotion]=useState(false),reduce=prefersReduced&&!enableMotion,[ready,setReady]=useState(false),[paused,setPaused]=useState(false),[count,setCount]=useState(0),[phase,setPhase]=useState('Gathering starlight'),[failed,setFailed]=useState(false),[epoch,setEpoch]=useState(0);
 useEffect(()=>{
  if(reduce)return;
  const surface=canvas.current,section=root.current;if(!surface||!section)return;
  const gl=surface.getContext('webgl2',{alpha:true,antialias:false,powerPreference:'high-performance',premultipliedAlpha:false});
  if(!gl){setFailed(true);return}
  let disposed=false,raf=0,visible=false,previous=0,time=0,frames=0,totalFrame=0,lastPhase='',lastDraw=0,renderSamples=0,renderTotal=0;
  let program:WebGLProgram|null=null,texture:WebGLTexture|null=null,vao:WebGLVertexArrayObject|null=null,pointBuffer:WebGLBuffer|null=null;
  const shaders:WebGLShader[]=[];
  const compact=matchMedia('(max-width:700px)').matches;
  let pointCount=compact?180000:360000,adapted=false;
  const cursor={x:4,y:4,power:0},trail=new Float32Array(12).fill(4);
  function compile(type:number,source:string){const shader=gl!.createShader(type);if(!shader)throw Error('Shader unavailable');shaders.push(shader);gl!.shaderSource(shader,source);gl!.compileShader(shader);if(!gl!.getShaderParameter(shader,gl!.COMPILE_STATUS))throw Error(gl!.getShaderInfoLog(shader)||'Shader compile failed');return shader}
  const image=new Image();
  const observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting;previous=0},{rootMargin:'120px'});observer.observe(section);
  function contextLost(event:Event){event.preventDefault();setReady(false);setFailed(true);cancelAnimationFrame(raf)}
  function contextRestored(){setFailed(false);setEpoch(v=>v+1)}
  surface.addEventListener('webglcontextlost',contextLost);surface.addEventListener('webglcontextrestored',contextRestored);
  image.onload=()=>{if(disposed)return;try{
   program=gl.createProgram();if(!program)throw Error('Program unavailable');gl.attachShader(program,compile(gl.VERTEX_SHADER,VERTEX));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,FRAGMENT));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program)||'Shader link failed');gl.useProgram(program);
   vao=gl.createVertexArray();gl.bindVertexArray(vao);const sampling=document.createElement('canvas');sampling.width=image.width;sampling.height=image.height;const ctx=sampling.getContext('2d',{willReadFrequently:true});if(!ctx)throw Error('Sampling canvas unavailable');ctx.drawImage(image,0,0);const samples=samplePortrait(ctx.getImageData(0,0,image.width,image.height).data,image.width,image.height,pointCount);const uvData=new Float32Array((pointCount+STAR_PARTICLES)*2);uvData.set(samples);pointBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,pointBuffer);gl.bufferData(gl.ARRAY_BUFFER,uvData,gl.STATIC_DRAW);const uvLocation=gl.getAttribLocation(program,'aUV');gl.enableVertexAttribArray(uvLocation);gl.vertexAttribPointer(uvLocation,2,gl.FLOAT,false,0,0);texture=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
   const uniforms=Object.fromEntries(['uPose','uBody','uPortrait','uResolution','uCount','uTime','uFormation','uImageAspect','uMouse','uMousePower','uVelocity','uTrail[0]','uPixelRatio'].map(n=>[n,gl.getUniformLocation(program!,n)]));
   gl.uniform1i(uniforms.uPortrait,0);gl.uniform1f(uniforms.uImageAspect,image.width/image.height);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(0,0,0,0);
   setCount(pointCount);setReady(true);setFailed(false);
   function frame(now:number){raf=requestAnimationFrame(frame);if(disposed||!visible||document.hidden){previous=0;lastDraw=0;return}
    const dt=previous?Math.min((now-previous)/1000,.08):0;previous=now;
    if(resetRef.current){time=0;resetRef.current=false}if(!pausedRef.current)time+=dt;
    const dpr=Math.min(devicePixelRatio,compact?1.75:1.75),width=Math.round(section!.clientWidth*dpr),height=Math.round(section!.clientHeight*dpr);
    if(surface!.width!==width||surface!.height!==height){surface!.width=width;surface!.height=height;gl!.viewport(0,0,width,height)}
    const cycle=0;
    const formation=time<6?smooth(.6,5.8,time):cycle<19?1:cycle<23?1-smooth(19,23,cycle):smooth(23,28,cycle);
    const status=formation>.96?'A living constellation.':time<6||cycle>=23?'Gathering starlight':'Dissolving into motion';if(status!==lastPhase){lastPhase=status;setPhase(status)}
    const vx=(mouse.current.x-cursor.x),vy=(mouse.current.y-cursor.y);cursor.x+=vx*.17;cursor.y+=vy*.17;const activity=mouse.current.active*Math.exp(-(performance.now()-mouse.current.stamp)/650);cursor.power+=(activity-cursor.power)*.07;
    for(let i=5;i>0;i--){trail[i*2]+=(trail[(i-1)*2]-trail[i*2])*.22;trail[i*2+1]+=(trail[(i-1)*2+1]-trail[i*2+1])*.22}trail[0]=cursor.x;trail[1]=cursor.y;
    const pose=poseAt(time);gl!.useProgram(program);gl!.uniform4f(uniforms.uPose,pose.yaw,pose.nod,pose.arm,pose.breath);gl!.uniform2f(uniforms.uBody,pose.sway,pose.turn);gl!.uniform2f(uniforms.uResolution,width,height);gl!.uniform1f(uniforms.uCount,pointCount);gl!.uniform1f(uniforms.uTime,time);gl!.uniform1f(uniforms.uFormation,formation);gl!.uniform2f(uniforms.uMouse,cursor.x,cursor.y);gl!.uniform1f(uniforms.uMousePower,cursor.power);gl!.uniform2f(uniforms.uVelocity,Math.max(-1,Math.min(1,vx*8)),Math.max(-1,Math.min(1,vy*8)));gl!.uniform2fv(uniforms['uTrail[0]'],trail);gl!.uniform1f(uniforms.uPixelRatio,dpr);gl!.clear(gl!.COLOR_BUFFER_BIT);gl!.drawArrays(gl!.POINTS,0,pointCount+STAR_PARTICLES);
    // Adapt only after a sustained slow sample, keeping UI responsive on integrated GPUs.
    if(lastDraw&&time>7&&!adapted){totalFrame+=now-lastDraw;frames++;if(frames>=100){if(totalFrame/frames>42){pointCount=compact?100000:220000;adapted=true;setCount(pointCount)}frames=0;totalFrame=0}}lastDraw=now;
    if(dt>0){renderSamples++;renderTotal+=dt;if(renderSamples===60){surface!.dataset.fps=String(Math.round(renderSamples/renderTotal));renderSamples=0;renderTotal=0}}
    surface!.dataset.pose=JSON.stringify(pose);surface!.dataset.particles=String(pointCount);surface!.dataset.formation=formation.toFixed(2);surface!.dataset.mousePower=cursor.power.toFixed(2);
   }raf=requestAnimationFrame(frame);
  }catch(error){console.error('Particle portrait unavailable:',error);setFailed(true);setReady(false)}};
  image.onerror=()=>{setFailed(true);setReady(false)};image.src='/assets/prabhas-cosmic-spirit-look.png';
  return()=>{disposed=true;cancelAnimationFrame(raf);observer.disconnect();image.onload=image.onerror=null;surface.removeEventListener('webglcontextlost',contextLost);surface.removeEventListener('webglcontextrestored',contextRestored);if(texture)gl.deleteTexture(texture);if(pointBuffer)gl.deleteBuffer(pointBuffer);if(vao)gl.deleteVertexArray(vao);if(program)gl.deleteProgram(program);shaders.forEach(s=>gl.deleteShader(s))};
 },[reduce,epoch]);
 function pointer(e:PointerEvent<HTMLElement>){const rect=e.currentTarget.getBoundingClientRect();mouse.current={x:(e.clientX-rect.left)/rect.width*2-1,y:1-(e.clientY-rect.top)/rect.height*2,active:1,stamp:performance.now()}}
 return <section ref={root} className={`particle-officer ${enableMotion?'motion-enabled':''}`} aria-label="Interactive Prabhas cosmic constellation portrait" onPointerDown={pointer} onPointerMove={pointer} onPointerUp={()=>{mouse.current.active=0}} onPointerCancel={()=>{mouse.current.active=0}} onPointerLeave={()=>{mouse.current.active=0}}>
  <img className={`particle-fallback ${ready&&!reduce?'is-hidden':''}`} src="/assets/prabhas-cosmic-spirit-look.png" alt="AI-generated Prabhas cosmic concept: translucent white constellation figure, with long wavy hair, a full beard and relaxed empty hands" loading="lazy"/>
  <canvas ref={canvas} className={`particle-canvas ${ready&&!reduce?'is-ready':''}`} aria-label="Animated particles forming Prabhas; move your pointer across the portrait to part the particles" role="img"/>
  <div className="particle-topline"><span>SPIRIT / A NEW DIMENSION</span><span>{ready&&!reduce?new Intl.NumberFormat('en-IN').format(count)+' PARTICLES':'THE CONSTELLATION PORTRAIT'}</span></div>
  <div className="particle-editorial"><span className="eyebrow">PRABHAS · CELESTIAL PRESENCE</span><h2>FROM DUST.<br/><em>TO PRESENCE.</em></h2><p>{reduce||failed?'A new portrait of commanding presence.':'Move through the field. Set the stars in motion.'}</p></div>
  <div className="particle-bottom"><span className="particle-phase">{reduce||failed?'AI-GENERATED FAN ARTWORK':phase}</span><div className="particle-controls">{reduce&&<button onClick={()=>setEnableMotion(true)}>Enable interactive motion ↗</button>}{!reduce&&!failed&&<><button onClick={()=>{resetRef.current=true;pausedRef.current=false;setPaused(false)}}>Reform portrait ↗</button><button aria-pressed={paused} onClick={()=>{pausedRef.current=!paused;setPaused(!paused)}}>{paused?'Resume motion':'Pause motion'}</button></>}<span>AI-GENERATED FAN CONCEPT</span></div></div>
 </section>
}
