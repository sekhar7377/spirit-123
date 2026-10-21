/** Shallow image-derived motion: small continuous rotations preserve the source anatomy. */
export const STAR_PARTICLES = 1000;
export function poseAt(t: number) {
  return {
    yaw: Math.sin(t * .25) * .035 + Math.sin(t * .13) * .012,
    nod: Math.sin(t * .39 + .6) * .018,
    arm: Math.sin(t * .51 - .5) * .018,
    breath: Math.sin(t * .92) * .009,
    sway: Math.sin(t * .31) * .013,
    turn: Math.sin(t * .21) * .022,
  };
}
export const RIG_GLSL = `
uniform vec4 uPose;
uniform vec2 uBody;
vec3 rz(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(c*p.x-s*p.y,s*p.x+c*p.y,p.z);}
vec3 ry(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z);}
vec3 rx(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(p.x,c*p.y-s*p.z,s*p.y+c*p.z);}
vec3 portraitPoint(vec2 uv){
 bool compact=uResolution.x<uResolution.y;
 return vec3((uv.x-.5)*2.*uImageAspect+(compact?0.:.9),(uv.y-.5)*2.+(compact?.20:.08),0.);
}
vec3 skin(vec3 p,vec2 uv){
 // This source is a side-profile bust: move the head and shoulders as one surface.
 vec3 neck=portraitPoint(vec2(.52,.43));
 float head=smoothstep(.40,.53,uv.y);
 p=mix(p,neck+ry(rx(p-neck,uPose.y*.45),uPose.x*.5),head);
 float chest=exp(-pow((uv.y-.27)/.20,2.));
 p.z+=uPose.w*chest;
 p.y+=uPose.w*.25*chest;
 p=neck+ry(p-neck,uBody.y*.4);p.x+=uBody.x*.5;
 return p;
}
`;
