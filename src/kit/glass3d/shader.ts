/**
 * Raymarched glass: the icon's 2D distance field extruded into a slab with rounded edges, refracted twice (in and out)
 * against a flat backdrop texture, with per-wavelength dispersion and a disc blur for frost.
 *
 * Ported from the "Glass icons" study and fitted to the brand: no halo and no inner glow (the kit allows no glow,
 * halo or backlight), and the edge light is the Mint rim light (uRim) instead of white. The only shading under the
 * icon is a neutral contact shadow.
 */

export const VERT = `#version 300 es
in vec2 aPos; out vec2 vUv;
void main(){ vUv = aPos*0.5+0.5; gl_Position = vec4(aPos,0.0,1.0); }`

export const FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;

uniform vec2 uRes;
uniform mat3 uRot;
uniform sampler2D uTex;
uniform sampler2D uSdf;
uniform vec3 uBg;
uniform vec3 uRim;
uniform float uIor, uDisp, uFrost, uTintAmt, uTintLo, uTintHi, uScale, uDepth, uBevel, uTexH, uWhite, uRimAmt, uAlpha;
uniform vec3 uTintA, uTintB;

const float CAMZ = 9.0;
const float FOC = 2.4;
const float ZP = -2.5;
const int NS = 16;

float texL(vec2 uv){ return textureLod(uSdf, uv, 0.0).r; }

// Bicubic (B-spline) lookup: smooth gradients, so the side walls shade without banding.
float texC(vec2 uv){
  vec2 ts = vec2(512.0);
  vec2 st = uv*ts - 0.5;
  vec2 i = floor(st);
  vec2 f = st - i;
  vec2 w0 = (1.0-f)*(1.0-f)*(1.0-f)/6.0;
  vec2 w1 = (4.0 - 6.0*f*f + 3.0*f*f*f)/6.0;
  vec2 w2 = (1.0 + 3.0*f + 3.0*f*f - 3.0*f*f*f)/6.0;
  vec2 w3 = f*f*f/6.0;
  vec2 g0 = w0 + w1;
  vec2 g1 = w2 + w3;
  vec2 t0 = (i + w1/g0 - 0.5)/ts;
  vec2 t1 = (i + w3/g1 + 1.5)/ts;
  return g0.y*(g0.x*texL(t0) + g1.x*texL(vec2(t1.x, t0.y)))
       + g1.y*(g0.x*texL(vec2(t0.x, t1.y)) + g1.x*texL(t1));
}

float sd2(vec2 q, bool cubic){
  vec2 c = clamp(q, -1.0, 1.0);
  vec2 uv = c*0.5 + 0.5;
  return (cubic ? texC(uv) : texL(uv)) - length(q - c);
}

float sdf(vec3 p, bool cubic){
  float r = uBevel;
  vec2 w = vec2(r - sd2(p.xy, cubic), abs(p.z) - (uDepth - r));
  return min(max(w.x, w.y), 0.0) + length(max(w, 0.0)) - r;
}

float map(vec3 p){ return sdf((uRot*p)/uScale, false)*uScale; }
float mapC(vec3 p){ return sdf((uRot*p)/uScale, true)*uScale; }

vec3 nrm(vec3 p){
  vec2 e = vec2(0.005, 0.0);
  return normalize(vec3(
    mapC(p+e.xyy) - mapC(p-e.xyy),
    mapC(p+e.yxy) - mapC(p-e.yxy),
    mapC(p+e.yyx) - mapC(p-e.yyx)));
}

float ign(vec2 p){ return fract(52.9829189*fract(dot(p, vec2(0.06711056, 0.00583715)))); }

// A quiet studio: soft top light, one strip light, one dark flag for edge contrast.
vec3 env(vec3 d){
  float y = d.y;
  float a = atan(d.x, -d.z);
  vec3 c = uBg*(1.0 + 0.15*y);
  c += vec3(1.1)*smoothstep(0.4, 0.85, y);
  float s1 = smoothstep(0.07, 0.0, abs(a-0.9)-0.14)*smoothstep(0.95, 0.5, abs(y));
  c += vec3(1.2)*s1;
  float k1 = smoothstep(0.1, 0.0, abs(a+0.6)-0.2)*smoothstep(0.85, 0.3, abs(y+0.15));
  c *= 1.0 - 0.55*k1;
  return c;
}

vec3 scene(vec3 p, vec3 d, vec3 rd0, vec2 off, float lod){
  vec3 e = env(d);
  if (d.z < -0.05) {
    float tt = (ZP - p.z)/d.z;
    vec3 h = p + d*tt;
    vec2 uv = h.xy*(FOC/(CAMZ - ZP)) + off;
    uv.x *= uRes.y/uRes.x;
    uv += 0.5;
    vec3 tx = textureLod(uTex, uv, lod).rgb;
    vec2 q = smoothstep(vec2(0.0), vec2(0.03), uv)*smoothstep(vec2(0.0), vec2(0.03), 1.0-uv);
    float bend = smoothstep(0.03, 0.4, 1.0 - dot(d, rd0));
    return mix(e, tx, q.x*q.y*(1.0 - bend*0.6));
  }
  return e;
}

void main(){
  vec2 pp = (gl_FragCoord.xy - 0.5*uRes)/uRes.y;
  vec3 ro = vec3(0.0, 0.0, CAMZ);
  vec3 rd = normalize(vec3(pp, -FOC));

  vec3 bg = textureLod(uTex, vUv, 0.0).rgb;
  vec2 wp = pp*CAMZ/FOC;
  // Neutral contact shadow, offset down and right. No halo.
  float sd = map(vec3(wp - vec2(0.1, -0.2)*uScale, 0.0));
  float shadow = 0.22*(1.0 - smoothstep(-0.1, 0.42, sd));
  bg *= 1.0 - shadow;
  vec3 col = bg;
  vec3 glassCol = vec3(0.0);
  float coverage = 0.0;

  float R = 1.4*uScale;
  float b = dot(ro, rd);
  float c = dot(ro, ro) - R*R;
  float h = b*b - c;
  if (h > 0.0) {
    h = sqrt(h);
    float t = -b - h;
    float t1 = -b + h;
    float minD = 1e9;
    float tMin = t;
    bool hit = false;
    for (int i = 0; i < 96; i++) {
      float d = map(ro + rd*t);
      if (d < minD) { minD = d; tMin = t; }
      if (d < 0.0002*t) { hit = true; break; }
      t += d*0.9;
      if (t > t1) break;
    }
    float px = 1.0/(uRes.y*FOC);
    float cov = hit ? 1.0 : 1.0 - smoothstep(0.0, 1.6*px*tMin, minD);
    if (cov > 0.0) {
      if (!hit) t = tMin;
      vec3 p = ro + rd*t;
      vec3 n = nrm(p);
      vec3 din = refract(rd, n, 1.0/uIor);

      float ti = 0.02;
      for (int i = 0; i < 48; i++) {
        float d = -map(p + din*ti);
        if (d < 0.001) break;
        ti += max(d*0.9, 0.004);
        if (ti > 4.0) break;
      }
      vec3 pe = p + din*ti;
      vec3 n2 = nrm(pe);

      // Frost = a disc blur behind the glass; dispersion = one wavelength per tap.
      float rad = uFrost*0.055;
      float lod = uFrost > 0.001 ? max(0.0, log2(rad*uTexH/sqrt(float(NS))*1.6)) : 0.0;
      float rnd = ign(gl_FragCoord.xy)*6.2832;
      vec3 acc = vec3(0.0);
      vec3 wsum = vec3(0.0);
      for (int i = 0; i < NS; i++) {
        float s = (float(i) + 0.5)/float(NS);
        float ior = max(1.001, uIor + uDisp*(s - 0.5));
        vec3 d1 = refract(rd, n, 1.0/ior);
        vec3 dOut = refract(d1, -n2, ior);
        if (dot(dOut, dOut) < 0.5) dOut = reflect(d1, -n2);
        int j = (i*7) % NS;
        float fj = (float(j) + 0.5)/float(NS);
        float ang = float(j)*2.39996 + rnd;
        vec2 off = rad*sqrt(fj)*vec2(cos(ang), sin(ang));
        vec3 w = clamp(1.0 - abs(s*2.0 - vec3(0.0, 1.0, 2.0)), 0.0, 1.0);
        acc += scene(pe, dOut, rd, off, lod)*w;
        wsum += w;
      }
      vec3 refr = acc/wsum;

      // Colour runs top to bottom in the icon's own space, fading to clear.
      vec3 pm = (uRot*((p + pe)*0.5))/uScale;
      float hh = clamp(pm.y/0.85*0.5 + 0.5, 0.0, 1.0);
      vec3 tc = mix(uTintB, uTintA, smoothstep(0.45, 0.95, hh));
      float ts = smoothstep(uTintLo, uTintHi, hh)*uTintAmt;
      refr *= mix(vec3(1.0), tc, ts);
      refr = mix(refr, tc, ts*uFrost*0.6);
      vec3 milk = uBg + (1.0 - uBg)*0.35;
      refr = mix(refr, milk, uFrost*0.22*(1.0 - ts*0.7));
      refr = mix(refr, vec3(1.0), uWhite*(1.0 - ts*0.5));
      refr *= exp(-ti*0.04);

      float facing = max(dot(n, -rd), 0.0);
      float fr = 0.04 + 0.96*pow(1.0 - facing, 5.0);
      vec3 g = mix(refr, env(reflect(rd, n)), fr);
      // Rim light: the brand's Mint edge, strongest on the upper edges, fading mid-edge.
      g += uRim*uRimAmt*pow(1.0 - facing, 3.0)*(n.y*0.5 + 0.5);
      col = mix(bg, g, cov);
      glassCol = g;
      coverage = cov;
    }
  }
  float dither = (ign(gl_FragCoord.xy + 7.0) - 0.5)/255.0;
  if (uAlpha > 0.5) {
    // Transparent export (straight alpha): the glass over a soft black contact shadow, nothing else.
    float a = coverage + (1.0 - coverage)*shadow*0.8;
    vec3 rgb = a > 0.0 ? glassCol*coverage/a : vec3(0.0);
    outColor = vec4(clamp(rgb + dither, 0.0, 1.0), clamp(a, 0.0, 1.0));
  } else {
    outColor = vec4(clamp(col + dither, 0.0, 1.0), 1.0);
  }
}`
