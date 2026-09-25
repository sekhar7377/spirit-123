/* Growing film-photo constellation inspired by the supplied motion reference. */
(()=>{'use strict';const entry=document.getElementById('entry');if(!entry)return;
const canvas=document.createElement('canvas');canvas.className='journey-canvas';canvas.setAttribute('aria-hidden','true');entry.prepend(canvas);const ctx=canvas.getContext('2d');let photos=[],last=0,time=0,previous=0,wasClosed=true;const nodes=[];
fetch('assets/journey/manifest.json').then(r=>r.json()).then(async films=>{// Resolve same-year releases explicitly, then assign every growing node in time order.
const order=['Eeswar','Raghavendra','Varsham','Adavi Ramudu','Chakram','Chatrapathi','Pournami','Yogi','Munna','Bujjigadu','Billa','Ek Niranjan','Darling','Mr. Perfect','Rebel','Mirchi','Baahubali: The Beginning','Baahubali 2: The Conclusion','Saaho','Radhe Shyam','Adipurush','Salaar Part 1 - Ceasefire','Kalki 2898 AD','Kannappa (Cameo Role)','The Raja Saab','Spirit'];
films.sort((a,b)=>order.indexOf(a.title)-order.indexOf(b.title));
// One source image, one plane. Branches retain chronology without tiling assets.
const unique=new Set();films=films.filter(f=>{if(unique.has(f.src))return false;unique.add(f.src);return true});
const route=[[-.42,.28],[-.35,.20],[-.43,.04],[-.35,-.08],[-.43,-.24],[-.33,-.34],[-.21,-.39],[-.09,-.36],[.06,-.40],[.21,-.36],[.35,-.32],[.43,-.18],[.35,-.05],[.43,.10],[.34,.24],[.43,.36],[.29,.39],[.16,.33],[.03,.38],[-.10,.32],[-.23,.39],[-.32,.30],[-.24,.11],[-.12,.13],[.11,.14],[.24,.10]];
films.forEach((f,i)=>{const [x,y]=route[i%route.length];nodes.push({x,y,parent:i===0?-1:i===8?5:i===16?13:i===22?2:i-1,size:38,image:i,title:f.title,year:f.year,birth:i*.95,phase:i*1.73,depth:0})});
canvas.dataset.structures=String(nodes.length);canvas.dataset.uniquePhotos=String(unique.size);
canvas.dataset.filmOrder=films.map(f=>f.title).join(' → ');
photos=await Promise.all(films.map(f=>new Promise(resolve=>{const im=new Image();im.onload=()=>{const thumb=document.createElement('canvas');thumb.width=224;thumb.height=280;const c=thumb.getContext('2d'),s=Math.max(224/im.width,280/im.height),sw=224/s,sh=280/s;c.filter='contrast(1.08) brightness(.96)';c.drawImage(im,(im.width-sw)/2,(im.height-sh)*.2,sw,sh,0,0,224,280);resolve(thumb)};im.onerror=()=>resolve(null);im.src=f.src})));time=0;entry.classList.add('journey-ready')}).catch(()=>{});
let targetX=0,targetY=0,viewX=0,viewY=0;
entry.addEventListener('pointermove',e=>{targetX=e.clientX/innerWidth-.5;targetY=e.clientY/innerHeight-.5},{passive:true});
entry.addEventListener('pointerleave',()=>{targetX=targetY=0});
function textureTriangle(im,a,b,c,u,v,q){
 ctx.save();ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.closePath();ctx.clip();
 const det=(v.x-u.x)*(q.y-u.y)-(q.x-u.x)*(v.y-u.y);
 const A=((b.x-a.x)*(q.y-u.y)-(c.x-a.x)*(v.y-u.y))/det,B=((b.y-a.y)*(q.y-u.y)-(c.y-a.y)*(v.y-u.y))/det;
 const C=((c.x-a.x)*(v.x-u.x)-(b.x-a.x)*(q.x-u.x))/det,D=((c.y-a.y)*(v.x-u.x)-(b.y-a.y)*(q.x-u.x))/det;
 ctx.transform(A,B,C,D,a.x-A*u.x-C*u.y,a.y-B*u.x-D*u.y);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(im,0,0);ctx.restore();
}
const ease=x=>1-Math.pow(1-Math.max(0,Math.min(1,x)),3);
function frame(now){requestAnimationFrame(frame);if(document.hidden||entry.hidden||entry.classList.contains('out')){previous=now;wasClosed=true;return}if(now-last<15)return;last=now;if(wasClosed){time=0;wasClosed=false}const reduced=document.body.classList.contains('reduced')||matchMedia('(prefers-reduced-motion: reduce)').matches;if(!reduced)time+=Math.min((now-(previous||now))/1000,.1);previous=now;if(!photos.length)return;
const w=entry.clientWidth,h=entry.clientHeight,dpr=Math.min(devicePixelRatio,2);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr)}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);const t=reduced?30:time,zoom=1.1-.1*ease(t/16),sizeScale=Math.max(.58,Math.min(w/1100,1.25));
viewX+=( (reduced?0:targetX)-viewX)*.045;viewY+=((reduced?0:targetY)-viewY)*.045;
const yaw=(reduced?0:Math.sin(t*.09)*.045)+viewX*.16,pitch=viewY*.10,focal=Math.max(w,h)*1.5;
function project(x,y,z){const xx=x*Math.cos(yaw)+z*Math.sin(yaw),zz=z*Math.cos(yaw)-x*Math.sin(yaw),yy=y*Math.cos(pitch)-zz*Math.sin(pitch),depth=zz*Math.cos(pitch)+y*Math.sin(pitch),scale=focal/(focal-depth);return{x:w*.5+xx*scale,y:h*.5+yy*scale,z:depth,scale}}
const positions=[];
nodes.forEach(n=>{let x=(n.x*w+Math.sin(t*.14+n.phase)*3)*zoom,y=(n.y*h+Math.cos(t*.12+n.phase)*3)*zoom,z=Math.sin(n.phase*1.3)*.08*Math.min(w,h);const growth=ease((t-n.birth)/1.55),parent=positions[n.parent];if(parent){const dx=x-parent.wx,dy=y-parent.wy,bend=Math.sin(n.phase)*.23,cx=(parent.wx+x)/2-dy*bend,cy=(parent.wy+y)/2+dx*bend,q=growth;x=(1-q)*(1-q)*parent.wx+2*(1-q)*q*cx+q*q*x;y=(1-q)*(1-q)*parent.wy+2*(1-q)*q*cy+q*q*y;z=parent.wz+(z-parent.wz)*q}positions.push({...project(x,y,z),wx:x,wy:y,wz:z,alpha:ease((t-n.birth)/1.35)})});

nodes.forEach((n,i)=>{if(n.parent<0)return;const p=positions[i],parent=positions[n.parent],growth=Math.max(0,Math.min(1,(t-n.birth)/.6));if(!growth)return;const dx=p.x-parent.x,dy=p.y-parent.y,bend=Math.sin(n.phase)*.23,cx=(parent.x+p.x)/2-dy*bend,cy=(parent.y+p.y)/2+dx*bend;
const curve=q=>({x:(1-q)*(1-q)*parent.x+2*(1-q)*q*cx+q*q*p.x,y:(1-q)*(1-q)*parent.y+2*(1-q)*q*cy+q*q*p.y});
const pulse=1;ctx.strokeStyle=n.depth===0?'rgba(141,98,68,.22)':`rgba(153,113,82,${(n.depth<3?.42:.3)*pulse})`;ctx.lineWidth=n.depth===0?1.3:n.depth<3?.7:.45;ctx.beginPath();ctx.moveTo(parent.x,parent.y);if(growth===1)ctx.quadraticCurveTo(cx,cy,p.x,p.y);else{const ex=curve(growth);ctx.quadraticCurveTo(parent.x+(cx-parent.x)*growth,parent.y+(cy-parent.y)*growth,ex.x,ex.y)}ctx.stroke();
const q=growth<1?growth:1,v=curve(q);ctx.shadowColor='#d4a461';ctx.shadowBlur=0;ctx.fillStyle=growth<1?'rgba(150,114,77,.3)':'rgba(150,114,77,.12)';ctx.beginPath();ctx.arc(v.x,v.y,n.depth<2?(growth<1?2.1:1.3):.65,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0});
// Sort actual world-space planes from far to near, then perspective-project their corners.
nodes.map((n,i)=>i).sort((a,b)=>positions[a].z-positions[b].z).forEach(i=>{const n=nodes[i],p=positions[i],im=photos[n.image];if(!im||!p.alpha||!n.size)return;
const s=n.size*sizeScale*(n.depth<2?1.18:1.08)*(.72+.28*p.alpha),hh=s*1.25,tilt=Math.sin(n.phase)*.23+(reduced?0:Math.sin(t*.12+n.phase)*.07);
const corners=[[-s/2,-hh/2],[s/2,-hh/2],[s/2,hh/2],[-s/2,hh/2]].map(([x,y])=>project(p.wx+x*Math.cos(tilt),p.wy+y,p.wz+x*Math.sin(tilt)));
ctx.save();ctx.globalAlpha=p.alpha*.68;ctx.shadowColor='rgba(47,34,23,.27)';ctx.shadowBlur=3;ctx.shadowOffsetY=n.depth<2?4*p.scale:1;ctx.fillStyle='#29251f';ctx.beginPath();corners.forEach((v,k)=>k?ctx.lineTo(v.x,v.y):ctx.moveTo(v.x,v.y));ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.shadowOffsetY=0;
textureTriangle(im,corners[0],corners[1],corners[2],{x:0,y:0},{x:224,y:0},{x:224,y:280});textureTriangle(im,corners[0],corners[2],corners[3],{x:0,y:0},{x:224,y:280},{x:0,y:280});ctx.restore();
// Quiet captions sit on their own photo, never on the Spirit lettering.
ctx.save();ctx.globalAlpha=p.alpha*.82;const labelWidth=s*p.scale,baseY=p.y+hh*p.scale/2;ctx.fillStyle='rgba(27,23,21,.88)';ctx.fillRect(p.x-labelWidth/2,baseY-14,labelWidth,14);ctx.fillStyle='#f4eddf';ctx.textAlign='center';ctx.font='500 '+Math.max(5.5,Math.min(8,labelWidth/7))+'px Arial';const caption=n.title.replace('Baahubali: The Beginning','Baahubali I').replace('Baahubali 2: The Conclusion','Baahubali II').replace('Salaar Part 1 - Ceasefire','Salaar').replace('Kannappa (Cameo Role)','Kannappa');ctx.fillText(caption,p.x,baseY-5,labelWidth-3);ctx.restore();
});
}requestAnimationFrame(frame);
})();
