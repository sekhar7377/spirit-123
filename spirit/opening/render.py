"""Reproducible 20s cinematic still-animation. 1920 composition, 3840 export.
Run with Pillow, numpy and imageio-ffmpeg installed, or pass FFMPEG env path.
No source video footage is used. Artwork is AI-generated; sound is procedural.
"""
from pathlib import Path
import os, sys, math, subprocess, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT=Path(__file__).resolve().parent
sys.path.insert(0,str(ROOT.parent.parent/'.video-tools'))
import imageio_ffmpeg
FF=os.environ.get('FFMPEG') or imageio_ffmpeg.get_ffmpeg_exe()
W,H,FPS,DURATION=1920,1080,24,20
work=ROOT/'work'; work.mkdir(exist_ok=True)
hero=Image.open(ROOT/'hero-generated.png').convert('RGB')
macro=Image.open(ROOT/'macro-generated.png').convert('RGB')

def camera(im, zoom, cx=.5,cy=.5):
    iw,ih=im.size
    cw=min(iw,ih*W/H)/zoom; ch=cw*H/W
    x=max(0,min(iw-cw,cx*iw-cw/2)); y=max(0,min(ih-ch,cy*ih-ch/2))
    return im.transform((W,H),Image.Transform.EXTENT,(x,y,x+cw,y+ch),Image.Resampling.BICUBIC)

# Match the existing website's campaign-title mask; animate new faceted stars.
letter=Image.open(ROOT.parent/'dist/assets/title-master.jpg').convert('L')
d=ImageDraw.Draw(letter)
for box in [(0,0,230,95),(1200,0,1280,115),(0,640,380,720),(565,465,1280,720),(665,145,767,243),(847,145,951,243)]:d.rectangle(box,fill=0)
letter=letter.resize((1280,720),Image.Resampling.LANCZOS)
random=np.random.default_rng(42)
particles=[(random.uniform(0,W),random.uniform(0,H),random.uniform(9,40),random.uniform(1,3),random.uniform(0,6.28)) for _ in range(90)]

def star(draw,cx,cy,r,a,opacity):
    pts=[(cx+math.cos(a-math.pi/2+i*math.pi/5)*r*(.43 if i%2 else 1),cy+math.sin(a-math.pi/2+i*math.pi/5)*r*(.43 if i%2 else 1)) for i in range(10)]
    for i in range(10):
        shade=int(110+120*(.5+.5*math.cos(i*1.5+a)))
        draw.polygon([(cx,cy),pts[i],pts[(i+1)%10]],fill=(shade,min(255,shade+4),min(255,shade+10),int(opacity*255)))

def frame(t):
    if t<4.5: im=camera(macro,1.06+t*.014,.62,.5)
    elif t<7.5: im=camera(hero,2.6+(t-4.5)*.035,.56,.31)
    elif t<12.5: im=camera(hero,1.7+(t-7.5)*.022,.62,.26)
    else: im=camera(hero,1.09-(min(t,16)-12.5)*.015,.52,.5)
    # Long final dissolve into an isolated title, with short soft scene seams.
    brightness=min(1,t/1.2)
    for cut in (4.5,7.5,12.5):brightness*=.55+.45*min(1,abs(t-cut)/.22)
    if t>15:brightness*=max(0,1-(t-15)/2)
    im=Image.blend(Image.new('RGB',(W,H)),im,brightness)
    overlay=Image.new('RGBA',(W,H)); dr=ImageDraw.Draw(overlay)
    for x,y,v,r,p in particles:
        px=(x+math.sin(t*.25+p)*25)%W; py=(y-t*v)%H
        alpha=int((20+25*math.sin(t*.7+p)**2)*min(1,t))
        dr.ellipse((px-r,py-r,px+r,py+r),fill=(239,195,125,alpha))
    # Subtle wide anamorphic practical flare.
    if t<15:
        yy=int(H*.28+math.sin(t*.4)*12)
        dr.line((1000,yy,1900,yy),fill=(255,206,135,15),width=3)
    im=Image.alpha_composite(im.convert('RGBA'),overlay)
    if t>=15.7:
        u=t-15.7; reveal=min(1,u/2.2); mask=letter.copy()
        ImageDraw.Draw(mask).rectangle((int(1280*reveal),0,1280,720),fill=0)
        tint=Image.new('RGBA',(1280,720),(225,222,213,255)); tint.putalpha(mask)
        im.alpha_composite(tint,(320,140))
        stars=Image.new('RGBA',(W,H)); sd=ImageDraw.Draw(stars)
        alpha=min(1,max(0,(u-.75)/.65))
        for x in (717,900):star(sd,320+x,338,44,u*1.1,alpha)
        # Fine crimson underline draws with the lettering, never blood.
        sd.rectangle((650,920,650+int(620*reveal),923),fill=(164,16,31,int(255*min(1,u))))
        im=Image.alpha_composite(im,stars)
    dr=ImageDraw.Draw(im);dr.rectangle((0,0,W,110),fill='black');dr.rectangle((0,H-110,W,H),fill='black')
    if t>19.5:im=Image.blend(Image.new('RGBA',(W,H),(0,0,0,255)),im,max(0,(20-t)/.5))
    return im.convert('RGB')

# Original cinematic pulse, sub impacts, risers and stereo metallic overtones.
sr=48000;tt=np.arange(sr*DURATION)/sr
audio=.065*np.sin(2*np.pi*43*tt)+.028*np.sin(2*np.pi*64.5*tt)
for beat in (0,2.25,4.5,6,7.5,9,10.5,12,12.5,14,15.7,17.9):
    u=np.maximum(0,tt-beat); active=(tt>=beat)
    audio+=active*.3*np.exp(-u*4)*np.sin(2*np.pi*(48*u+22*(1-np.exp(-u*8))))
    audio+=active*.045*np.exp(-u*12)*random.normal(0,1,len(tt))
rise=np.clip((tt-12)/3.7,0,1)*(tt<15.7)
audio+=.035*rise*np.sin(2*np.pi*(180*tt+16*tt**2))
u=np.maximum(0,tt-15.7)
audio+=(tt>=15.7)*.035*np.exp(-u)*sum(np.sin(2*np.pi*f*u) for f in (440,659,880))
audio*=np.minimum(1,tt/.6)*np.minimum(1,(DURATION-tt)/.7)
stereo=np.stack([audio,np.roll(audio,330)],axis=1)
stereo=np.int16(np.clip(stereo,-.95,.95)*32767)
with wave.open(str(work/'score.wav'),'wb') as wav:
    wav.setnchannels(2);wav.setsampwidth(2);wav.setframerate(sr);wav.writeframes(stereo.tobytes())

out=ROOT/'spirit-opening-4k.mp4'
cmd=[FF,'-y','-hide_banner','-loglevel','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-i',str(work/'score.wav'),'-vf','scale=3840:2160:flags=lanczos','-c:v','libx264','-preset','fast','-crf','20','-threads','4','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart','-shortest',str(out)]
with subprocess.Popen(cmd,stdin=subprocess.PIPE) as proc:
    for n in range(FPS*DURATION):
        fr=frame(n/FPS)
        if n in (48,144,240,336,432):fr.save(ROOT/f'qa-{n//FPS:02d}s.jpg',quality=90)
        proc.stdin.write(fr.tobytes())
        if n%48==0:print(f'Render {n//FPS}/{DURATION}s',flush=True)
    proc.stdin.close();result=proc.wait()
    if result:raise RuntimeError(f'Encoder failed {result}')
subprocess.run([FF,'-y','-hide_banner','-loglevel','error','-i',str(out),'-vf','scale=1920:1080','-c:v','libx264','-preset','fast','-crf','22','-c:a','copy','-movflags','+faststart',str(ROOT/'spirit-opening-preview.mp4')],check=True)
print(f'COMPLETE {out}',flush=True)
