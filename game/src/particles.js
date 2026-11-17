import {LIMITS,COLORS as C} from './config.js';
export class Effects {
  constructor(){this.particles=[];this.rings=[];this.labels=[];this.time=0;this.rng=28731;this.flash=0;this.reduced=false;}
  rand(){this.rng=(Math.imul(this.rng,1664525)+1013904223)>>>0;return this.rng/4294967296;}
  burst(x,y,color,count=20,speed=120){for(let i=0;i<(this.reduced?count/3:count)&&this.particles.length<LIMITS.particles;i++){const a=this.rand()*6.28,v=(.2+this.rand())*speed;this.particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.3+this.rand()*.7,max:1,color,r:1+this.rand()*3});}}
  ring(x,y,color,r=130){if(this.rings.length<18)this.rings.push({x,y,color,r,life:1});}
  event(e){
    if(e.type==='collect')this.burst(e.x,e.y,C.gold,7,65);
    if(e.type==='destroy'){this.burst(e.x,e.y,C.coral,28,160);this.ring(e.x,e.y,C.gold,65);this.label(e.x,e.y-20,`${e.value} CHAIN`,C.gold);this.flash=.07;}
    if(e.type==='dash')this.burst(e.x,e.y,C.teal,12,80);
    if(e.type==='hurt'){this.burst(e.x,e.y,C.coral,35,180);this.flash=.2;}
    if(e.type==='bank'){this.ring(e.x,e.y,C.teal,260);this.ring(e.x,e.y,C.gold,170);this.burst(e.x,e.y,C.gold,60,230);this.label(e.x,e.y-70,`+${e.value.toLocaleString()}`,C.gold);}
    if(e.type==='pulse'){this.ring(e.x,e.y,C.teal,e.value||190);this.burst(e.x,e.y,C.teal,40,210);}
    if(['win','dawn'].includes(e.type)){this.ring(e.x,e.y,C.gold,500);this.burst(e.x,e.y,C.gold,90,300);}
    if(e.type==='graze')this.burst(e.x,e.y,C.teal,5,50);
  }
  label(x,y,text,color){if(this.labels.length<12)this.labels.push({x,y,text,color,life:1.5});}
  update(dt){this.time+=dt;this.flash=Math.max(0,this.flash-dt);for(const p of this.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.exp(-dt*3);p.vy*=Math.exp(-dt*3);p.life-=dt;}for(const r of this.rings)r.life-=dt*1.7;for(const l of this.labels){l.life-=dt;l.y-=dt*23;}this.particles=this.particles.filter(p=>p.life>0);this.rings=this.rings.filter(p=>p.life>0);this.labels=this.labels.filter(p=>p.life>0);}
  draw(c){c.save();c.globalCompositeOperation='lighter';for(const r of this.rings){c.globalAlpha=r.life*.5;c.strokeStyle=r.color;c.lineWidth=1+r.life*2;c.beginPath();c.arc(r.x,r.y,(1-r.life)*r.r,0,6.28);c.stroke();}for(const p of this.particles){c.globalAlpha=Math.min(1,p.life*2);c.fillStyle=p.color;c.beginPath();c.ellipse(p.x,p.y,p.r,p.r*.45,this.time+p.vx,0,6.28);c.fill();}c.restore();for(const l of this.labels){c.globalAlpha=Math.min(1,l.life*2);c.fillStyle=l.color;c.font='20px Georgia';c.textAlign='center';c.fillText(l.text,l.x,l.y);}c.globalAlpha=1;}
}
