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
vec3 portraitPoint(vec2 uv){return vec3((uv.x-(uResolution.x<uResolution.y?.61:.54))*2.0*uImageAspect,(uv.y-.5)*2.0+.08,0.);}
vec3 skin(vec3 p,vec2 uv){
 float head=smoothstep(.66,.77,uv.y);
 vec3 neck=portraitPoint(vec2(.622,.69));
 p=mix(p,neck+ry(rx(p-neck,uPose.y),uPose.x),head);
 float chest=exp(-pow((uv.y-.49)/.20,2.))*exp(-pow((uv.x-.61)/.13,2.));
 p.x+=(uv.x-.615)*uPose.w*1.5*chest;
 p.z+=uPose.w*chest;
 p.y+=uPose.w*.35*chest;
 // Hand and bottle belong to the source portrait; preserve their uninterrupted surface.
 float arm=(1.-smoothstep(.50,.53,uv.x))*(1.-smoothstep(.45,.64,uv.y));
 vec3 shoulder=portraitPoint(vec2(.505,.65));
 p=mix(p,shoulder+rz(p-shoulder,uPose.z),arm);
 vec3 hip=portraitPoint(vec2(.615,.24));
 p=hip+ry(p-hip,uBody.y);p.x+=uBody.x;
 return p;
}
`;
