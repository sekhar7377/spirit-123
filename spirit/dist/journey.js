/* A bounded photo archive, rendered as hundreds of frames rather than DOM nodes. */
(()=>{'use strict';const entry=document.getElementById('entry');if(!entry)return;
const canvas=document.createElement('canvas');canvas.className='journey-canvas';canvas.setAttribute('aria-hidden','true');entry.prepend(canvas);const ctx=canvas.getContext('2d',{alpha:true});let images=[],last=0,time=0,previous=0,width=0,height=0,atlas;
function cover(c,img,x,y,w,h){const scale=Math.max(w/img.naturalWidth,h/img.naturalHeight),sw=w/scale,sh=h/scale;c.drawImage(img,(img.naturalWidth-sw)/2,Math.max(0,(img.naturalHeight-sh)*.24),sw,sh,x,y,w,h)}
function build(){if(!images.length)return;atlas=document.createElement('canvas');atlas.width=2400;atlas.height=1600;const c=atlas.getContext('2d');c.fillStyle='#e7decc';c.fillRect(0,0,2400,1600);c.filter='sepia(.48) saturate(.38) contrast(.86)';for(let row=0;row<10;row++)for(let col=0;col<24;col++){const i=(row*24+col)%images.length,x=col*103+(row%2?-51:0),y=row*164;c.globalAlpha=.82;cover(c,images[i],x+3,y+3,96,153)}c.filter='none';c.globalAlpha=1;entry.classList.add('journey-ready')}
fetch('assets/journey/manifest.json').then(r=>{if(!r.ok)throw Error('Archive unavailable');return r.json()}).then(async films=>{const loaded=await Promise.all(films.map(f=>new Promise(resolve=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>resolve(null);im.src=f.src})));images=loaded.filter(Boolean);build()}).catch(()=>{/* The ivory title remains usable when offline. */});
function frame(now){requestAnimationFrame(frame);if(document.hidden||entry.hidden||entry.classList.contains('out')){previous=now;return}if(now-last<42)return;last=now;const reduced=document.body.classList.contains('reduced')||matchMedia('(prefers-reduced-motion: reduce)').matches;if(!reduced)time+=Math.min((now-(previous||now))/1000,.1);previous=now;if(!atlas)return;
const w=entry.clientWidth,h=entry.clientHeight,dpr=Math.min(devicePixelRatio,1.5);if(width!==w||height!==h){width=w;height=h;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr)}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
// Counter-drifting memory planes with a slow cinematic push; no pointer tracking.
const base=Math.max(w/2400,h/1600),zoom=1.16+Math.sin(time*.06)*.035;
ctx.save();ctx.translate(w*.5+Math.sin(time*.035)*w*.035,h*.5+Math.cos(time*.045)*h*.025);ctx.rotate(-.075);ctx.scale(base*zoom,base*zoom);ctx.globalAlpha=.58;ctx.drawImage(atlas,-1200,-800);ctx.restore();
ctx.save();ctx.globalAlpha=.09;ctx.translate(w*.5-Math.sin(time*.025)*40,h*.5);ctx.rotate(.065);ctx.scale(base*.66,base*.66);for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)ctx.drawImage(atlas,-1200+x*2400,-800+y*1600);ctx.restore();
}requestAnimationFrame(frame);
})();
