/* Image-space anchored embers: stays registered through crop, zoom and parallax. */
(()=>{'use strict';
const opening=document.querySelector('#opening-title svg');if(opening){opening.querySelector('defs').insertAdjacentHTML('beforeend','<filter id="crimson-material" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".19" numOctaves="3" stitchTiles="stitch" result="grain"/><feColorMatrix in="grain" type="saturate" values="0"/><feComponentTransfer><feFuncR type="linear" slope=".32" intercept=".68"/><feFuncG type="linear" slope=".32" intercept=".68"/><feFuncB type="linear" slope=".32" intercept=".68"/></feComponentTransfer><feBlend in2="SourceGraphic" mode="multiply"/><feComposite in2="SourceGraphic" operator="in"/></filter>');opening.querySelector('g[mask]').setAttribute('filter','url(#crimson-material)')}
const hero=document.querySelector('.hero'),photo=hero?.querySelector('[data-scene="0"]');if(!hero||!photo)return;
const canvas=document.createElement('canvas');canvas.className='cigarette-life';canvas.setAttribute('aria-hidden','true');hero.append(canvas);const ctx=canvas.getContext('2d');
let visible=true,last=0;new IntersectionObserver(e=>visible=e[0].isIntersecting).observe(hero);
function render(ms){requestAnimationFrame(render);if(document.hidden||!visible||ms-last<33)return;last=ms;
const h=hero.getBoundingClientRect(),r=photo.getBoundingClientRect(),dpr=Math.min(devicePixelRatio,2);if(canvas.width!==Math.round(h.width*dpr)||canvas.height!==Math.round(h.height*dpr)){canvas.width=Math.round(h.width*dpr);canvas.height=Math.round(h.height*dpr)}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,h.width,h.height);
if(!photo.classList.contains('active')||!photo.naturalWidth)return;
const pos=getComputedStyle(photo).objectPosition.split(' ').map(parseFloat),scale=Math.max(r.width/photo.naturalWidth,r.height/photo.naturalHeight),iw=photo.naturalWidth*scale,ih=photo.naturalHeight*scale;
const x=r.left-h.left+(r.width-iw)*(pos[0]/100)+iw*.6745,y=r.top-h.top+(r.height-ih)*(pos[1]/100)+ih*.252;
const reduced=document.body.classList.contains('reduced')||matchMedia('(prefers-reduced-motion: reduce)').matches,t=reduced?0:ms/1000,k=Math.max(.65,Math.min(2,iw/1060)),pulse=.8+.12*Math.sin(t*5.2)+.08*Math.sin(t*13.7);
ctx.save();ctx.translate(x,y);ctx.scale(k,k);ctx.globalCompositeOperation='screen';
const halo=ctx.createRadialGradient(0,0,0,0,0,17);halo.addColorStop(0,`rgba(255,95,15,${.65*pulse})`);halo.addColorStop(.3,'rgba(244,54,3,.2)');halo.addColorStop(1,'rgba(220,45,0,0)');ctx.fillStyle=halo;ctx.fillRect(-18,-18,36,36);
ctx.rotate(-.65);ctx.fillStyle='#b42b09';ctx.beginPath();ctx.ellipse(0,0,3.8,2.2,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=`rgba(255,176,65,${pulse})`;ctx.beginPath();ctx.ellipse(0,-.5,2.2,1.2,0,0,Math.PI*2);ctx.fill();ctx.rotate(.65);
// Small lighter flame touching the tip, with a warm outer edge and pale core.
const flicker=reduced?0:Math.sin(t*17)*1.1;const flame=ctx.createLinearGradient(0,15,0,-9);flame.addColorStop(0,'rgba(55,100,255,.18)');flame.addColorStop(.4,'rgba(255,132,12,.7)');flame.addColorStop(.8,'rgba(255,216,99,.8)');flame.addColorStop(1,'rgba(255,220,120,0)');ctx.fillStyle=flame;ctx.beginPath();ctx.moveTo(1,15);ctx.bezierCurveTo(-5,5,3+flicker,-2,2+flicker,-10);ctx.bezierCurveTo(10,0,9,10,1,15);ctx.fill();
ctx.globalCompositeOperation='source-over';
if(!reduced){for(let i=0;i<26;i++){const age=(t*.19+i/26)%1,sy=-age*118,sx=Math.sin(age*7+t*.75)*age*15+age*10,rad=2+age*15;const smoke=ctx.createRadialGradient(sx,sy,0,sx,sy,rad);smoke.addColorStop(0,`rgba(218,220,216,${.048*Math.sin(age*Math.PI)})`);smoke.addColorStop(1,'rgba(218,220,216,0)');ctx.fillStyle=smoke;ctx.fillRect(sx-rad,sy-rad,rad*2,rad*2)}}ctx.restore();
}requestAnimationFrame(render);
})();
