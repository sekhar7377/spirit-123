/** Art-directed, image-derived skinning. Coordinates are in bottom-up portrait UV.
 * This is a shallow volumetric reconstruction, not a scanned likeness or full human mesh.
 * The face keeps its source texture; analytic pivots articulate the point surface.
 */
export const RIG_PARTICLES = 48000;
export const STAR_PARTICLES = 1800;

export function poseAt(t: number) {
  return {
    yaw: Math.sin(t * .31) * .10 + Math.sin(t * .13) * .035,
    nod: Math.sin(t * .47 + .6) * .045,
    arm: Math.sin(t * .63 - .5) * .075 + Math.sin(t * .27) * .025,
    breath: Math.sin(t * 1.05) * .018,
    sway: Math.sin(t * .38) * .025,
    turn: Math.sin(t * .25) * .045,
  };
}

export const RIG_GLSL = `
uniform vec4 uPose;
uniform vec2 uBody;
vec3 rz(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(c*p.x-s*p.y,s*p.x+c*p.y,p.z);}
vec3 ry(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z);}
vec3 rx(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(p.x,c*p.y-s*p.z,s*p.y+c*p.z);}
vec3 portraitPoint(vec2 uv){return vec3((uv.x-(uResolution.x<uResolution.y?.61:.55))*2.0*uImageAspect,(uv.y-.5)*2.0+.22,0.);}
float capsule(vec2 p,vec2 a,vec2 b,float r){vec2 d=b-a;float h=clamp(dot(p-a,d)/dot(d,d),0.,1.);return 1.-smoothstep(r*.96,r,length(p-a-d*h));}
float armWeight(vec2 uv){return max(capsule(uv,vec2(.36,.20),vec2(.455,.155),.065),capsule(uv,vec2(.485,.115),vec2(.555,.105),.075));}
vec3 armTransform(vec3 p){
 vec3 elbow=portraitPoint(vec2(.355,.235));
 p=elbow+rz(p-elbow,-.70+uPose.z);
 vec3 shoulder=portraitPoint(vec2(.451,.565));
 return shoulder+rx(p-shoulder,uPose.z*.28);
}
vec3 bodyTransform(vec3 p){vec3 hip=portraitPoint(vec2(.615,.03));p=hip+ry(p-hip,uBody.y);p.x+=uBody.x;return p;}
vec3 skin(vec3 p,vec2 uv){
 // Smooth neck weighting keeps the jaw connected while the head turns and nods.
 float head=smoothstep(.635,.755,uv.y);
 vec3 neck=portraitPoint(vec2(.614,.643));
 vec3 headPose=neck+ry(rx(p-neck,uPose.y),uPose.x);
 p=mix(p,headPose,head);
 float chest=exp(-pow((uv.y-.46)/.22,2.))*exp(-pow((uv.x-.61)/.21,2.));
 p.x+=(uv.x-.615)*uPose.w*2.3*chest;
 p.z+=uPose.w*chest;
 p.y+=uPose.w*.45*chest;
 p=mix(p,armTransform(p),armWeight(uv));
 return bodyTransform(p);
}
vec3 bottlePoint(float id,out float light){
 // Parametric rounded-square glass bottle: body, tapered shoulder, neck, lip.
 float v=hash(id+139.);float a=hash(id+157.)*6.2831853;
 float r=v<.67?.082:v<.81?mix(.082,.029,(v-.67)/.14):.029;
 if(v>.96)r=.036;
 vec2 ring=sign(vec2(cos(a),sin(a)))*pow(abs(vec2(cos(a),sin(a))),vec2(.42))*r;
 vec3 local=vec3(ring.x,(v-1.)*.26,ring.y);
 // Bottle neck meets the hand after the very same elbow and shoulder transforms.
 vec3 grip=portraitPoint(vec2(.53,.115));
 vec3 wrist=armTransform(grip);
 local=rz(local,sin(uTime*.63-1.0)*.065);
 light=.32+.5*pow(abs(cos(a)),8.);
 if(v<.025||v>.96||abs(v-.67)<.012)light=1.;
 if(mod(a*12.+v*20.,1.)<.06)light=max(light,.75);
 return bodyTransform(wrist+local+vec3(0.,-.03,.04));
}
`;

