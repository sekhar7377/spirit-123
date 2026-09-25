/* Growing film-photo constellation inspired by the supplied motion reference. */
(()=>{'use strict';const entry=document.getElementById('entry');if(!entry)return;
const canvas=document.createElement('canvas');canvas.className='journey-canvas';canvas.setAttribute('aria-hidden','true');entry.prepend(canvas);const ctx=canvas.getContext('2d');let photos=[],last=0,time=0,previous=0,wasClosed=true;const nodes=[];
// One origin, an irregular connected journey, then successively finer splits.
// Each branch starts only once its parent's travelling tip has arrived.
const skeleton=[[-.40,.35,-1],[-.26,.22,0],[-.11,.31,1],[.04,.20,2],[.23,.30,3],[.39,.15,4],[.33,-.05,5],[.43,-.27,6],[.23,-.34,7],[.07,-.24,8],[-.12,-.34,9],[-.31,-.26,10],[-.43,-.08,11],[-.29,.03,1],[-.12,-.04,13],[.08,.01,3]];
skeleton.forEach(([x,y,parent],i)=>nodes.push({x,y,parent,size:i%3===0?49:35,image:i,birth:parent<0?0:nodes[parent].birth+.63,phase:i*1.73,depth:0}));
let generation=Array.from({length:16},(_,i)=>i);
for(let depth=1;depth<=4;depth++){const next=[];for(const parent of generation){const p=nodes[parent];for(let split=0;split<3;split++){const i=nodes.length,a=(p.angle??(parent*2.399))+(split-1)*(depth===1?2.05:.91)+Math.sin(i*1.73)*.19,r=(.078/Math.pow(1.8,depth-1))*(.85+.3*Math.sin(i*2.1)**2);nodes.push({x:p.x+Math.cos(a)*r,y:p.y+Math.sin(a)*r*1.38,size:depth===1?25:depth===2?13:depth===3?5:0,image:i%26,parent,birth:p.birth+.72+split*.12,phase:p.phase+split*.3,angle:a,depth});next.push(i)}}generation=next}
canvas.dataset.structures=String(nodes.length);
fetch('assets/journey/manifest.json').then(r=>r.json()).then(async films=>{photos=await Promise.all(films.map(f=>new Promise(resolve=>{const im=new Image();im.onload=()=>{const thumb=document.createElement('canvas');thumb.width=224;thumb.height=280;const c=thumb.getContext('2d'),s=Math.max(224/im.width,280/im.height),sw=224/s,sh=280/s;c.filter='sepia(.14) saturate(.82) contrast(1.08)';c.drawImage(im,(im.width-sw)/2,(im.height-sh)*.2,sw,sh,0,0,224,280);resolve(thumb)};im.onerror=()=>resolve(null);im.src=f.src})));time=0;entry.classList.add('journey-ready')}).catch(()=>{});
let targetX=0,targetY=0,viewX=0,viewY=0;
entry.addEventListener('pointermove',e=>{targetX=e.clientX/innerWidth-.5;targetY=e.clientY/innerHeight-.5},{passive:true});
entry.addEventListener('pointerleave',()=>{targetX=targetY=0});
function textureTriangle(im,a,b,c,u,v,q){
 ctx.save();ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.closePath();ctx.clip();
 const det=(v.x-u.x)*(q.y-u.y)-(q.x-u.x)*(v.y-u.y);
 const A=((b.x-a.x)*(q.y-u.y)-(c.x-a.x)*(v.y-u.y))/det,B=((b.y-a.y)*(q.y-u.y)-(c.y-a.y)*(v.y-u.y))/det;
 const C=((c.x-a.x)*(v.x-u.x)-(b.x-a.x)*(q.x-u.x))/det,D=((c.y-a.y)*(v.x-u.x)-(b.y-a.y)*(q.x-u.x))/det;
 ctx.transform(A,B,C,D,a.x-A*u.x-C*u.y,a.y-B*u.x-D*u.y);ctx.drawImage(im,0,0);ctx.restore();
}
const ease=x=>1-Math.pow(1-Math.max(0,Math.min(1,x)),3);
function frame(now){requestAnimationFrame(frame);if(document.hidden||entry.hidden||entry.classList.contains('out')){previous=now;wasClosed=true;return}if(now-last<15)return;last=now;if(wasClosed){time=0;wasClosed=false}const reduced=document.body.classList.contains('reduced')||matchMedia('(prefers-reduced-motion: reduce)').matches;if(!reduced)time+=Math.min((now-(previous||now))/1000,.1);previous=now;if(!photos.length)return;
const w=entry.clientWidth,h=entry.clientHeight,dpr=Math.min(devicePixelRatio,2);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr)}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);const t=reduced?12:time,zoom=1.1-.1*ease(t/16),sizeScale=Math.max(.58,Math.min(w/1100,1.25));
viewX+=( (reduced?0:targetX)-viewX)*.045;viewY+=((reduced?0:targetY)-viewY)*.045;
const yaw=(reduced?0:Math.sin(t*.09)*.045)+viewX*.16,pitch=viewY*.10,focal=Math.max(w,h)*1.5;
function project(x,y,z){const xx=x*Math.cos(yaw)+z*Math.sin(yaw),zz=z*Math.cos(yaw)-x*Math.sin(yaw),yy=y*Math.cos(pitch)-zz*Math.sin(pitch),depth=zz*Math.cos(pitch)+y*Math.sin(pitch),scale=focal/(focal-depth);return{x:w*.5+xx*scale,y:h*.5+yy*scale,z:depth,scale}}
const positions=nodes.map(n=>{const x=(n.x*w+Math.sin(t*.14+n.phase)*5)*zoom,y=(n.y*h+Math.cos(t*.12+n.phase)*4)*zoom,z=(Math.sin(n.phase*1.3)*.12+(n.depth===0?.025:-.025*n.depth))*Math.min(w,h);return{...project(x,y,z),wx:x,wy:y,wz:z,alpha:ease((t-n.birth-.58)/.7)}});

nodes.forEach((n,i)=>{if(n.parent<0)return;const p=positions[i],parent=positions[n.parent],growth=Math.max(0,Math.min(1,(t-n.birth)/.6));if(!growth)return;const dx=p.x-parent.x,dy=p.y-parent.y,bend=Math.sin(n.phase)*.23,cx=(parent.x+p.x)/2-dy*bend,cy=(parent.y+p.y)/2+dx*bend;
const curve=q=>({x:(1-q)*(1-q)*parent.x+2*(1-q)*q*cx+q*q*p.x,y:(1-q)*(1-q)*parent.y+2*(1-q)*q*cy+q*q*p.y});
const pulse=.8+.2*Math.sin(t*1.4-n.birth*2);ctx.strokeStyle=n.depth===0?'rgba(141,98,68,.56)':`rgba(153,113,82,${(n.depth<3?.42:.3)*pulse})`;ctx.lineWidth=n.depth===0?1.3:n.depth<3?.7:.45;ctx.beginPath();ctx.moveTo(parent.x,parent.y);if(growth===1)ctx.quadraticCurveTo(cx,cy,p.x,p.y);else{const ex=curve(growth);ctx.quadraticCurveTo(parent.x+(cx-parent.x)*growth,parent.y+(cy-parent.y)*growth,ex.x,ex.y)}ctx.stroke();
const q=growth<1?growth:(t*.17-n.birth*.17+1e3)%1,v=curve(q);ctx.shadowColor='#d4a461';ctx.shadowBlur=n.depth<2?(growth<1?9:4):0;ctx.fillStyle=growth<1?'rgba(186,126,60,.9)':'rgba(186,126,60,.48)';ctx.beginPath();ctx.arc(v.x,v.y,n.depth<2?(growth<1?2.1:1.3):.65,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0});
// Sort actual world-space planes from far to near, then perspective-project their corners.
nodes.map((n,i)=>i).sort((a,b)=>positions[a].z-positions[b].z).forEach(i=>{const n=nodes[i],p=positions[i],im=photos[n.image%photos.length];if(!im||!p.alpha||!n.size)return;
const s=n.size*sizeScale*(n.depth<2?1.18:1.08)*(.72+.28*p.alpha),hh=s*1.25,tilt=Math.sin(n.phase)*.23+(reduced?0:Math.sin(t*.12+n.phase)*.07);
const corners=[[-s/2,-hh/2],[s/2,-hh/2],[s/2,hh/2],[-s/2,hh/2]].map(([x,y])=>project(p.wx+x*Math.cos(tilt),p.wy+y,p.wz+x*Math.sin(tilt)));
ctx.save();ctx.globalAlpha=p.alpha*(n.size>30?.94:.72);ctx.shadowColor='rgba(47,34,23,.27)';ctx.shadowBlur=n.depth<2?10*p.scale:2;ctx.shadowOffsetY=n.depth<2?4*p.scale:1;ctx.fillStyle='#fffaf0';ctx.beginPath();corners.forEach((v,k)=>k?ctx.lineTo(v.x,v.y):ctx.moveTo(v.x,v.y));ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.shadowOffsetY=0;
textureTriangle(im,corners[0],corners[1],corners[2],{x:0,y:0},{x:224,y:0},{x:224,y:280});textureTriangle(im,corners[0],corners[2],corners[3],{x:0,y:0},{x:224,y:280},{x:0,y:280});ctx.restore();
});
}requestAnimationFrame(frame);
})();
