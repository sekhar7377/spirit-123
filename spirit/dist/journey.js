/* A living photo sculpture: nested moving growth fronts, never a line diagram. */
(()=>{'use strict';
const entry=document.getElementById('entry');if(!entry)return;
const canvas=document.createElement('canvas');canvas.className='journey-canvas';canvas.setAttribute('aria-hidden','true');entry.prepend(canvas);
const ctx=canvas.getContext('2d'),TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10)};
let photos=[],time=0,previous=0,closed=true;
const nodes=[{parent:-1,depth:0,angle:0,radius:0,birth:0,phase:0,size:31}];
let generation=[0];
// Six broad currents, each recursively opening into four unequal smaller blooms.
for(let depth=1;depth<=5;depth++){
 const next=[];
 for(const parent of generation){const p=nodes[parent],count=depth===1?6:4;
  for(let j=0;j<count;j++){
   const id=nodes.length,phase=id*2.399963;
   const angle=depth===1?j*TAU/6-.7:p.angle+(j-1.5)*.92+Math.sin(phase)*.23;
   nodes.push({parent,depth,angle,radius:[0,.265,.125,.058,.027,.012][depth]*(.86+.25*Math.sin(phase)**2),birth:p.birth+(depth===1?.3:1.5)+j*.17,phase,size:[31,26,17,9,4,1.6][depth]});next.push(id);
  }
 }
 generation=next;
}
canvas.dataset.structures=String(nodes.length);
fetch('assets/journey/manifest.json').then(r=>r.json()).then(async films=>{
 photos=await Promise.all(films.map(f=>new Promise(resolve=>{const im=new Image();im.onload=()=>{const thumb=document.createElement('canvas');thumb.width=96;thumb.height=120;const c=thumb.getContext('2d'),s=Math.max(96/im.width,120/im.height),sw=96/s,sh=120/s;c.filter='sepia(.42) saturate(.52) contrast(.92)';c.drawImage(im,(im.width-sw)/2,(im.height-sh)*.2,sw,sh,0,0,96,120);resolve(thumb)};im.onerror=()=>resolve(null);im.src=f.src})));
 time=0;entry.classList.add('journey-ready');
}).catch(()=>{});
const positions=nodes.map(()=>({x:0,y:0,alpha:0}));
function tile(x,y,size,alpha,angle,index){const im=photos[index%photos.length];if(!im||alpha<.015)return;ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(angle);ctx.drawImage(im,-size/2,-size*.625,size,size*1.25);ctx.rotate(-angle);ctx.translate(-x,-y)}
function frame(now){requestAnimationFrame(frame);
 if(document.hidden||entry.hidden||entry.classList.contains('out')){previous=now;closed=true;return}
 if(closed){time=0;closed=false}const reduced=document.body.classList.contains('reduced')||matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(!reduced)time+=Math.min((now-(previous||now))/1000,.05);previous=now;if(!photos.length)return;
 const w=entry.clientWidth,h=entry.clientHeight,dpr=Math.min(devicePixelRatio,1.5);
 if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr)}
 ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
 const t=reduced?18:time;
 // A substantial, smoothly eased camera retreat reveals the nested structure.
 const zoom=2.65-1.65*smooth(t/15),rotation=.09*Math.sin(t*.085)+t*.009;
 const scaleX=w*zoom,scaleY=Math.max(h*.96,w*.56)*zoom;
 ctx.translate(w*.5,h*.48);ctx.rotate(rotation);
 for(let i=0;i<nodes.length;i++){
  const n=nodes[i],p=positions[i],age=t-n.birth,g=smooth(age/(3.2+n.depth*.12));
  if(i===0){p.x=-.14*scaleX*(1-smooth(t/12));p.y=.08*scaleY*(1-smooth(t/12));p.alpha=smooth(t/1.1);continue}
  const parent=positions[n.parent];
  // Parent motion is inherited. Curled trajectories unwind as each bud opens.
  const a=n.angle+(.95*(1-g))+Math.sin(t*.32+n.phase)*(.10+.035*n.depth);
  const breath=1+.06*Math.sin(t*.52-n.depth*.7+n.phase);
  p.x=parent.x+Math.cos(a)*n.radius*scaleX*g*breath;
  p.y=parent.y+Math.sin(a)*n.radius*scaleY*g*breath;
  p.alpha=smooth(age/.85)*parent.alpha;
 }
 // Photographic particles flow through the branches; there are no connector strokes.
 for(let i=1;i<nodes.length;i++){
  const n=nodes[i],p=positions[i],parent=positions[n.parent];if(p.alpha<.01||n.depth>3)continue;
  const dx=p.x-parent.x,dy=p.y-parent.y,amount=n.depth===1?17:n.depth===2?10:5;
  for(let k=0;k<amount;k++){
   const q=(k/amount+t*(.055+.006*n.depth)+n.phase*.03)%1;
   const arch=Math.sin(q*Math.PI)*Math.sin(t*.35+n.phase)*.17;
   const x=parent.x+dx*q-dy*arch,y=parent.y+dy*q+dx*arch;
   const size=(n.depth===1?6:n.depth===2?3.8:2.1)*Math.min(zoom,1.55)*( .65+.35*Math.sin(q*Math.PI));
   tile(x,y,size,p.alpha*.38*Math.sin(q*Math.PI),Math.atan2(dy,dx)*.15,i+k);
  }
 }
 // Nested photo blooms replace the previous rigid static endpoints.
 const sizing=Math.max(.65,Math.min(w/1100,1.15))*Math.min(zoom,1.8);
 for(let i=nodes.length-1;i>=0;i--){const n=nodes[i],p=positions[i];if(p.alpha<.01)continue;
  tile(p.x,p.y,n.size*sizing*(.72+.28*p.alpha),p.alpha*(n.depth<3?.78:.51),Math.sin(t*.2+n.phase)*.12-rotation*.4,i);
 }
 ctx.globalAlpha=1;
 canvas.dataset.phase=t<3?'origin':t<9?'splitting':t<15?'unfolding':'living';
}requestAnimationFrame(frame);
})();
