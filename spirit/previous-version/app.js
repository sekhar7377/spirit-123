'use strict';
const $ = (q,root=document)=>root.querySelector(q);
const $$ = (q,root=document)=>[...root.querySelectorAll(q)];
const artworks=[
 {name:'The original.',category:'cast',label:'FIRST LOOK',cls:'first-look',src:'first-look.jpeg',alt:'Prabhas and Triptii Dimri in the Spirit first-look artwork'},
 {name:'A different shade.',category:'cast',label:'CHARACTER REVEAL',cls:'vivek',src:'vivek.jpeg',alt:'Vivek Oberoi in the Spirit character reveal'},
 {name:'The mind behind it.',category:'cast',label:'THE FILMMAKER',cls:'director',src:'director.jpeg',alt:'Sandeep Reddy Vanga in the director tribute artwork'},
 {name:'A date with the world.',category:'film',label:'RELEASE ANNOUNCEMENT',cls:'title',src:'title.jpeg',alt:'Spirit title artwork announcing March 5, 2027'},
 {name:'In the shadows.',category:'film',label:'FROM THE ARCHIVE',cls:'shadows',src:'shadows.jpeg',alt:'Silhouettes from the Spirit reference archive'}
];
const people={
 prabhas:{name:'PRABHAS',role:'LEAD ACTOR',photo:'prabhas-photo',bio:'The lead of Spirit. Prabhas joins Sandeep Reddy Vanga for this new collaboration, with the first-look artwork revealing a bruised, strikingly intimate image alongside Triptii Dimri.',art:0},
 triptii:{name:'TRIPTII DIMRI',role:'ACTOR',photo:'triptii-photo',bio:'Triptii Dimri stars alongside Prabhas in Spirit. She appears with him in the first-look artwork unveiled for the film, a quiet moment at the center of its earliest visual identity.',art:0},
 vivek:{name:'VIVEK OBEROI',role:'ACTOR',photo:'vivek-photo',bio:'Vivek Oberoi joins the cast of Spirit. His reveal artwork introduces a sharply dressed figure against an ornate, dark interior. Explore the full image in the visual archive.',art:1},
 sandeep:{name:'SANDEEP REDDY VANGA',role:'WRITER & DIRECTOR',photo:'sandeep-photo',bio:'The filmmaker behind Spirit. Sandeep Reddy Vanga writes and directs the project, bringing his next cinematic world to the screen with Prabhas in the lead.',art:2}
};
let route='',navigating=false,galleryIndex=0,lightboxIndex=0;
let motionReduced=matchMedia('(prefers-reduced-motion: reduce)').matches,haptics=false;
try{motionReduced=localStorage.getItem('spirit-motion')==='reduce'||motionReduced}catch{}
document.body.classList.toggle('reduce-motion',motionReduced);
const posterMarkup=(a,loading='lazy')=>`<div class="poster ${a.cls}"><img src="assets/${a.src}" alt="${a.alt}" loading="${loading}"></div>`;
function notify(message){const toast=$('#toast');toast.textContent=message;toast.classList.add('visible');clearTimeout(notify.timer);notify.timer=setTimeout(()=>toast.classList.remove('visible'),3500)}
function pulse(){if(haptics&&navigator.vibrate)navigator.vibrate(16)}
function closeDialog(dialog){dialog.close();if(dialog.id==='menu-dialog')$('#menu-toggle').setAttribute('aria-expanded','false')}
$$('[data-close]').forEach(button=>button.addEventListener('click',()=>closeDialog(button.closest('dialog'))));
$$('dialog').forEach(dialog=>{dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog(dialog)}});dialog.addEventListener('close',()=>{if(dialog.id==='menu-dialog')$('#menu-toggle').setAttribute('aria-expanded','false')})});
$('#menu-toggle').addEventListener('click',()=>{$('#menu-dialog').showModal();$('#menu-toggle').setAttribute('aria-expanded','true');pulse()});
$('.skip').addEventListener('click',e=>{e.preventDefault();$('#main').setAttribute('tabindex','-1');$('#main').focus();$('#main').scrollIntoView({behavior:'instant'})});
$('#menu-dialog').addEventListener('click',e=>{if(e.target.closest('a'))closeDialog($('#menu-dialog'))});
function parseRoute(){const parts=location.hash.replace(/^#\/?/,'').split('#');return {page:parts[0]||'home',anchor:parts[1]}}
function render(){const {page,anchor}=parseRoute();const valid=['home','film','cast','gallery','sound'].includes(page)?page:'home';route=valid;$('#main').replaceChildren($(`#${valid}-template`).content.cloneNode(true));document.title=`SPIRIT — ${{home:'In Spirit Mode',film:'The Film',cast:'The People',gallery:'Visual Archive',sound:'Sound Room'}[valid]}`;$$('.desktop-nav a').forEach(a=>{const active=a.hash==='#/'+valid;a.classList.toggle('active',active);active?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current')});window.scrollTo({top:0,behavior:'instant'});bindPage();if(anchor)requestAnimationFrame(()=>document.getElementById(anchor)?.scrollIntoView());}
async function navigate(){if(navigating)return;navigating=true;const curtain=$('.curtain');if(!motionReduced){curtain.classList.add('cover');await new Promise(r=>setTimeout(r,320))}render();curtain.classList.remove('cover');navigating=false;pulse();}
addEventListener('hashchange',navigate);
let revealObserver;
function bindPage(){
 $$('[data-art]',$('#main')).forEach(button=>button.addEventListener('click',()=>openArt(Number(button.dataset.art))));
 $$('[data-person]').forEach(button=>button.addEventListener('click',()=>openPerson(button.dataset.person)));
 $('[data-home-scroll]')?.addEventListener('click',()=>$('#beyond').scrollIntoView({behavior:motionReduced?'instant':'smooth'}));
 revealObserver?.disconnect();revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');revealObserver.unobserve(e.target)}}),{threshold:.12});$$('.reveal').forEach(el=>revealObserver.observe(el));
 $$('.tilt').forEach(card=>{card.addEventListener('pointermove',e=>{if(motionReduced||e.pointerType!=='mouse')return;const r=card.getBoundingClientRect();card.style.transform=`perspective(1200px) rotateX(${-(e.clientY-r.top-r.height/2)/r.height*5}deg) rotateY(${(e.clientX-r.left-r.width/2)/r.width*5}deg)`});card.addEventListener('pointerleave',()=>card.style.transform='')});
 if(route==='gallery')setupGallery();if(route==='sound')setupSoundRoom();updateCountdown();updateSoundUI();
}
function openArt(index){lightboxIndex=(index+artworks.length)%artworks.length;const a=artworks[lightboxIndex];$('#lightbox-art').innerHTML=posterMarkup(a,'eager');$('#lightbox-caption').textContent=a.label+' / '+a.name;$('#art-count').textContent=`${String(lightboxIndex+1).padStart(2,'0')} / 05`;if(!$('#lightbox').open)$('#lightbox').showModal();pulse()}
$('#previous-art').addEventListener('click',()=>openArt(lightboxIndex-1));$('#next-art').addEventListener('click',()=>openArt(lightboxIndex+1));
$('#lightbox').addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();openArt(lightboxIndex-1)}if(e.key==='ArrowRight'){e.preventDefault();openArt(lightboxIndex+1)}});
function openPerson(key){const p=people[key];$('#person-content').innerHTML=`<div class="person-content"><div class="person-image"><div class="person-photo ${p.photo}"></div></div><div class="bio"><p class="eyebrow red">${p.role}</p><h2>${p.name}</h2><p>${p.bio}</p><button class="underlined" id="person-art">Explore the artwork ↗</button></div></div>`;$('#person-dialog').showModal();$('#person-art').addEventListener('click',()=>{closeDialog($('#person-dialog'));openArt(p.art)});pulse()}
function setupGallery(){
 $('#coverflow').innerHTML=artworks.map((a,i)=>`<button class="cover-card" data-cover="${i}" aria-label="Open ${a.name}">${posterMarkup(a,'eager')}<span>${String(i+1).padStart(2,'0')} / ${a.label}</span></button>`).join('');
 $('#gallery-grid').innerHTML=artworks.map((a,i)=>`<button class="art-card" data-gallery-art="${i}" data-category="${a.category}">${posterMarkup(a)}<span class="card-caption"><span><small>${a.label}</small>${a.name}</span><b>↗</b></span></button>`).join('');
 $$('[data-gallery-art]').forEach(b=>b.addEventListener('click',()=>openArt(Number(b.dataset.galleryArt))));
 $$('[data-cover]').forEach(b=>b.addEventListener('click',()=>{if(dragged)return;const n=Number(b.dataset.cover);if(n===galleryIndex)openArt(n);else{galleryIndex=n;updateGallery()}}));
 $('#gallery-prev').addEventListener('click',()=>{galleryIndex=(galleryIndex+4)%5;updateGallery();pulse()});$('#gallery-next').addEventListener('click',()=>{galleryIndex=(galleryIndex+1)%5;updateGallery();pulse()});
 $$('[data-filter]').forEach(b=>b.addEventListener('click',()=>{$$('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$$('[data-category]').forEach(x=>x.hidden=b.dataset.filter!=='all'&&x.dataset.category!==b.dataset.filter)}));
 let startX=0,startY=0,dragged=false;const stage=$('.gallery-stage');stage.addEventListener('pointerdown',e=>{startX=e.clientX;startY=e.clientY;dragged=false});stage.addEventListener('pointerup',e=>{const delta=e.clientX-startX;if(Math.abs(delta)>45&&Math.abs(delta)>Math.abs(e.clientY-startY)){dragged=true;galleryIndex=(galleryIndex+(delta<0?1:4))%5;updateGallery();setTimeout(()=>dragged=false,100)}});updateGallery();
}
function updateGallery(){const mobile=innerWidth<640;$$('[data-cover]').forEach((el,i)=>{let offset=i-galleryIndex;if(offset>2)offset-=5;if(offset<-2)offset+=5;el.style.transform=`translateX(${offset*(mobile?165:280)}px) translateZ(${-Math.abs(offset)*180}px) rotateY(${-offset*17}deg)`;el.style.opacity=Math.abs(offset)===2?'.32':Math.abs(offset)===1?'.66':'1';el.style.zIndex=String(5-Math.abs(offset));el.setAttribute('aria-label',`${i===galleryIndex?'Open':'Select'} ${artworks[i].name}`)});$('#gallery-index').textContent=String(galleryIndex+1).padStart(2,'0')}
function updateCountdown(){let left=Math.max(0,new Date('2027-03-05T00:00:00+05:30').getTime()-Date.now());const vals={days:Math.floor(left/86400000),hours:Math.floor(left/3600000)%24,minutes:Math.floor(left/60000)%60,seconds:Math.floor(left/1000)%60};$$('[data-time]').forEach(el=>el.textContent=String(vals[el.dataset.time]).padStart(2,'0'));}
setInterval(updateCountdown,1000);
let audioContext,masterGain,analyser,noiseSource,oscillators=[],playing=false,volume=.35,customAudio=null,customURL=null,trackName='#ONEBADHABIT',trackKind='soundtrack',audioData;
const mediaSources=new WeakMap();
function makeAudio(src){const audio=new Audio(src);audio.id='soundtrack-media';audio.setAttribute('aria-label','Spirit soundtrack');audio.preload='metadata';audio.loop=true;audio.volume=volume;audio.addEventListener('timeupdate',updatePlayback);audio.addEventListener('loadedmetadata',updatePlayback);audio.addEventListener('error',()=>{playing=false;updateSoundUI();notify('Audio could not load. Please try another audio file.')});document.body.append(audio);return audio;}
customAudio=makeAudio('assets/one-bad-habit-telugu.mp3');
function initAudio(){
 if(audioContext)return;audioContext=new (window.AudioContext||window.webkitAudioContext)();masterGain=audioContext.createGain();masterGain.gain.value=0;analyser=audioContext.createAnalyser();analyser.fftSize=128;audioData=new Uint8Array(analyser.frequencyBinCount);masterGain.connect(analyser);analyser.connect(audioContext.destination);
 [55,82.41,110.15].forEach((freq,i)=>{const osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type='sine';osc.frequency.value=freq;gain.gain.value=[.12,.045,.025][i];osc.connect(gain);gain.connect(masterGain);osc.start();oscillators.push(osc)});
 const buffer=audioContext.createBuffer(1,audioContext.sampleRate*4,audioContext.sampleRate);const values=buffer.getChannelData(0);let last=0;for(let i=0;i<values.length;i++){last=(last+(Math.random()*2-1)*.02)/1.02;values[i]=last*2};noiseSource=audioContext.createBufferSource();noiseSource.buffer=buffer;noiseSource.loop=true;const lowpass=audioContext.createBiquadFilter();lowpass.type='lowpass';lowpass.frequency.value=380;const noiseGain=audioContext.createGain();noiseGain.gain.value=.12;noiseSource.connect(lowpass);lowpass.connect(noiseGain);noiseGain.connect(masterGain);noiseSource.start();
}
async function toggleAudio(){try{initAudio();await audioContext.resume();if(customAudio){if(!mediaSources.has(customAudio)){const source=audioContext.createMediaElementSource(customAudio);source.connect(analyser);mediaSources.set(customAudio,source)}if(playing)customAudio.pause();else await customAudio.play()}else{masterGain.gain.setTargetAtTime(playing?0:volume,audioContext.currentTime,.4)}playing=!playing;updateSoundUI();pulse()}catch{playing=false;updateSoundUI();notify('Audio could not play. Please try a supported audio file.')}}
function updateSoundUI(){document.body.classList.toggle('sound-on',playing);$('#sound-toggle').setAttribute('aria-pressed',String(playing));$('#sound-toggle').setAttribute('aria-label',playing?'Pause soundtrack':'Play soundtrack');$('.sound-label').textContent=playing?'Sound on':'Sound off';if($('#room-play')){$('#room-play').textContent=playing?'Ⅱ':'▶';$('#room-play').setAttribute('aria-label',playing?'Pause audio':'Play audio');$('#track-title').textContent=trackName;$('#track-note').textContent=trackKind==='soundtrack'?'SPIRIT · Telugu · supplied soundtrack':trackKind==='local'?'Your local audio · playing only on this device':'Original ambient atmosphere · not the film score';$('#seek').disabled=!customAudio;updatePlayback();}}
const formatTime=value=>Number.isFinite(value)?`${Math.floor(value/60)}:${String(Math.floor(value%60)).padStart(2,'0')}`:'0:00';
function updatePlayback(){if(!$('#seek'))return;const duration=customAudio?.duration||0,current=customAudio?.currentTime||0;$('#seek').value=duration?current/duration*100:0;$('#current-time').textContent=formatTime(current);$('#duration').textContent=customAudio?formatTime(duration):'AMBIENT';}
function releaseCurrentAudio(){customAudio?.pause();if(customAudio&&mediaSources.has(customAudio))mediaSources.get(customAudio).disconnect();customAudio?.remove();if(customURL)URL.revokeObjectURL(customURL);customURL=null;if(masterGain)masterGain.gain.setTargetAtTime(0,audioContext.currentTime,.1);playing=false;}
$('#sound-toggle').addEventListener('click',toggleAudio);
function setupSoundRoom(){
 $('#waveform').innerHTML=Array.from({length:64},()=>'<i></i>').join('');$('#room-play').addEventListener('click',toggleAudio);$('#volume').value=volume*100;$('#volume-value').value=Math.round(volume*100)+'%';
 $('#volume').addEventListener('input',e=>{volume=Number(e.target.value)/100;$('#volume-value').value=e.target.value+'%';if(masterGain&&playing&&!customAudio)masterGain.gain.setTargetAtTime(volume,audioContext.currentTime,.1);if(customAudio)customAudio.volume=volume});
 $('#seek').addEventListener('input',e=>{if(customAudio&&Number.isFinite(customAudio.duration)){customAudio.currentTime=Number(e.target.value)/100*customAudio.duration;updatePlayback()}});
 $('#audio-file').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;if(!file.type.startsWith('audio/')&&!/\.(mp3|wav|ogg|m4a|aac|flac|webm)$/i.test(file.name)){notify('Please choose an audio file.');return}releaseCurrentAudio();customURL=URL.createObjectURL(file);customAudio=makeAudio(customURL);trackName=file.name.replace(/\.[^.]+$/,'');trackKind='local';updateSoundUI();notify('Your soundtrack is ready. Press play to enter.');});
 $('#reset-track').addEventListener('click',()=>{releaseCurrentAudio();customAudio=null;trackName='AFTER HOURS';trackKind='ambient';updateSoundUI();notify('Ambient atmosphere selected.')});
 $('#film-track').addEventListener('click',()=>{releaseCurrentAudio();customAudio=makeAudio('assets/one-bad-habit-telugu.mp3');trackName='#ONEBADHABIT';trackKind='soundtrack';updateSoundUI();notify('Spirit soundtrack selected.')});
 $('#motion-setting').checked=motionReduced;$('#motion-setting').addEventListener('change',e=>{motionReduced=e.target.checked;document.body.classList.toggle('reduce-motion',motionReduced);try{localStorage.setItem('spirit-motion',motionReduced?'reduce':'full')}catch{}});
 $('#haptic-setting').checked=haptics;$('#haptic-setting').addEventListener('change',e=>{haptics=e.target.checked;if(haptics&&!navigator.vibrate){notify('Touch feedback is not supported on this device.');e.target.checked=false;haptics=false}pulse()});
 $('#fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement){await document.exitFullscreen()}else if(document.documentElement.requestFullscreen){await document.documentElement.requestFullscreen()}else{notify('Fullscreen is unavailable in this browser.')}}catch{notify('Fullscreen is unavailable in this browser.')}});
}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing){customAudio?.pause();if(masterGain)masterGain.gain.setTargetAtTime(0,audioContext.currentTime,.1);playing=false;updateSoundUI()}});
const canvas=$('#atmosphere'),ctx=canvas.getContext('2d');let width=innerWidth,height=innerHeight,pointer={x:0,y:0},lastFrame=0;
const particles=Array.from({length:85},()=>({x:Math.random()*2-1,y:Math.random()*2-1,z:Math.random()*1.8+.2,speed:Math.random()*.035+.01}));
function resize(){width=innerWidth;height=innerHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);if(route==='gallery')updateGallery()}
addEventListener('resize',resize);addEventListener('pointermove',e=>{pointer.x=e.clientX/width-.5;pointer.y=e.clientY/height-.5},{passive:true});resize();
function frame(time){requestAnimationFrame(frame);if(document.hidden||time-lastFrame<32)return;const dt=Math.min((time-lastFrame)/1000,.1);lastFrame=time;ctx.clearRect(0,0,width,height);if(!motionReduced){particles.forEach(p=>{p.y-=p.speed*dt;p.x+=Math.sin(time*.0001+p.z)*.00015;if(p.y< -1.3){p.y=1.3;p.x=Math.random()*2-1}const x=width/2+(p.x*width*.7-pointer.x*30)/p.z,y=height/2+(p.y*height*.7-pointer.y*25)/p.z;ctx.beginPath();ctx.fillStyle=`rgba(210,164,119,${.1+.24/p.z})`;ctx.arc(x,y,Math.min(2,1/p.z),0,Math.PI*2);ctx.fill()});const hero=$('[data-parallax]');if(hero)hero.style.transform=`translate3d(${pointer.x*15}px,${pointer.y*10+Math.min(scrollY,900)*.055}px,0) scale(1.03)`;}const bars=$$('#waveform i');if(bars.length){if(playing&&analyser){analyser.getByteFrequencyData(audioData)}bars.forEach((bar,i)=>{let value=2;if(playing)value=3+(audioData?.[i]||0)*.22;bar.style.height=(motionReduced?2:value)+'px'})}}
render();requestAnimationFrame(frame);
