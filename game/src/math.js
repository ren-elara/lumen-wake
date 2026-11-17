export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const distance = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
export function unit(x,y) {const n=Math.hypot(x,y);return n>1e-8?{x:x/n,y:y/n}:{x:0,y:0};}
export function hashSeed(text) {let h=2166136261;for(const c of String(text)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0||1;}
export function random(state) {let x=state.rng;x^=x<<13;x^=x>>>17;x^=x<<5;state.rng=x>>>0;return state.rng/4294967296;}
export function segmentCircle(ax,ay,bx,by,cx,cy,r) {
  const dx=bx-ax,dy=by-ay,len=dx*dx+dy*dy;
  const t=len?clamp(((cx-ax)*dx+(cy-ay)*dy)/len,0,1):0;
  return (ax+dx*t-cx)**2+(ay+dy*t-cy)**2<=r*r;
}
export function constrain(p,world) {
  const x=(p.x-world.cx)/world.rx,y=(p.y-world.cy)/world.ry,n=Math.hypot(x,y);
  if(n>1){p.x=world.cx+x/n*world.rx;p.y=world.cy+y/n*world.ry;}
}
