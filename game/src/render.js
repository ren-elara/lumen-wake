import {WORLD as W,COLORS as C,DAWNS} from './config.js';
import {goal} from './simulation.js';
import {drawRegion} from './regions.js';
export class Renderer {
  constructor(canvas,effects){this.canvas=canvas;this.c=canvas.getContext('2d',{alpha:false});this.fx=effects;this.scale=1;this.ox=0;this.oy=0;this.backdrop=null;this.resize();}
  resize(){const w=innerWidth,h=innerHeight,dpr=Math.min(devicePixelRatio||1,1.6);this.canvas.width=Math.round(w*dpr);this.canvas.height=Math.round(h*dpr);this.scale=Math.min(w/W.width,h/W.height)*dpr;this.ox=(w*dpr-W.width*this.scale)/2;this.oy=(h*dpr-W.height*this.scale)/2;this.backdrop=null;}
  worldPoint(x,y){return{x:(x*(this.canvas.width/innerWidth)-this.ox)/this.scale,y:(y*(this.canvas.height/innerHeight)-this.oy)/this.scale};}
  path(points,fill,stroke=null,width=1){const c=this.c;c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
  circle(x,y,r,color,width=1){const c=this.c;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.strokeStyle=color;c.lineWidth=width;c.stroke();}
  glow(x,y,r,color){const c=this.c,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
  ocean(){
    const c=this.c;const bg=c.createRadialGradient(640,420,20,640,420,670);bg.addColorStop(0,'#123f47');bg.addColorStop(.55,'#0d2c39');bg.addColorStop(1,'#061923');c.fillStyle=bg;c.fillRect(0,0,1280,800);
    for(let i=0;i<9;i++){c.beginPath();c.ellipse(W.cx,W.cy,180+i*47,60+i*30,-.05,0,6.28);c.strokeStyle=i%2?'#67979813':'#86bcac1c';c.lineWidth=.7;c.stroke();}
    for(let i=0;i<28;i++){const a=i/28*6.28;const x=W.cx+Math.cos(a)*545,y=W.cy+Math.sin(a)*290;c.strokeStyle='#9bc1ae35';c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(a)*8,y+Math.sin(a)*8);c.stroke();}
    c.save();c.setLineDash([2,8]);c.beginPath();c.ellipse(W.cx,W.cy,550,295,0,0,6.28);c.strokeStyle='#9bc1ae32';c.stroke();c.restore();
    for(let i=0;i<115;i++){const x=(i*173.17+37)%1280,y=110+(i*79.71)%620;c.fillStyle=i%4?'#7bb7af21':'#b8dfcb60';c.fillRect(x,y,i%5?1:2,1);}
    for(let i=0;i<9;i++){const a=i*.77+.3,x=W.cx+Math.cos(a)*590,y=W.cy+Math.sin(a)*325;c.save();c.translate(x,y);c.rotate(a);this.path([[-35,-12],[-17,-26],[12,-20],[35,0],[15,16],[-20,20]],'#061b24','#547f7e35');this.path([[-30,-12],[-11,-17],[12,-11],[21,-2]],null,'#5a858238');c.restore();}
    c.font='9px Arial';c.fillStyle='#5b898b';c.textAlign='center';c.fillText('N',640,104);c.fillText('S',640,737);c.save();c.translate(108,420);c.rotate(-Math.PI/2);c.fillText('THE LANTERN ARCHIPELAGO',0,0);c.restore();
  }
  beacon(s,t){
    const c=this.c,x=W.cx,y=W.cy,progress=Math.min(1,s.energy/goal(s));this.glow(x,y,170,'#5be7c01b');
    c.save();c.translate(x,y);c.scale(1,.68);this.circle(0,0,87,'#7de8cf25');this.circle(0,0,72,'#c6e0b140');c.save();c.rotate(t*.08);c.setLineDash([1,9]);this.circle(0,0,101,'#6fe9d450',1);c.restore();
    for(let i=0;i<12;i++){const a=i/12*6.28;c.save();c.rotate(a);this.path([[0,-58],[13,-31],[0,-12],[-13,-31]],i<Math.round(progress*12)?'#f2cf83bb':'#478b8245','#a2f0c85a',.7);c.restore();}
    c.restore();
    c.save();c.translate(x,y-15);this.path([[0,-44],[21,-4],[0,21],[-21,-4]],'#153f48','#a1efd1',1.4);this.path([[0,-44],[0,21],[-21,-4]],'#2f8278');this.path([[0,-28],[9,-6],[0,6],[-9,-6]],'#f3e1a0','#fff6cb');this.glow(0,-7,48,'#ffda9455');c.restore();
    c.fillStyle='#b4d8c4';c.textAlign='center';c.font='8px Arial';c.fillText('THE BEACON',x,y+83);c.fillStyle=C.teal;c.font='11px Georgia';c.fillText(s.phase==='title'?'KEEP A LITTLE LIGHT':`${Math.min(s.energy,goal(s))} / ${goal(s)} LIGHT`,x,y+101);
    for(let i=0;i<5;i++){const a=-Math.PI/2+(i-2)*.23;this.circle(x+Math.cos(a)*116,y+Math.sin(a)*83,3,i<s.dawn?C.gold:'#78a19355',i<s.dawn?3:1);}
  }
  courier(p,t,title=false){
    const c=this.c;const x=p.x,y=p.y;this.glow(x,y,65,'#58e4d324');
    c.save();c.translate(x,y);c.rotate(Math.atan2(p.dy,p.dx)+Math.PI/2);
    for(let i=5;i>0;i--){c.globalAlpha=.05+(5-i)*.025;this.path([[-4,12+i*5],[0,26+i*5],[4,12+i*5]],C.teal);}
    c.globalAlpha=p.invuln>0&&!title?.55+Math.sin(t*22)*.25:1;
    const wing=Math.sin(t*6)*2;this.path([[0,-19],[8,-3],[30,14+wing],[10,10],[0,24],[-10,10],[-30,14+wing],[-8,-3]],'#c4ece1','#e4f3d8',1);
    this.path([[0,-19],[0,24],[-10,10],[-30,14+wing]],'#47acaa');this.path([[0,-12],[5,1],[0,14],[-5,1]],C.gold);
    c.strokeStyle='#174f56';c.lineWidth=.8;c.beginPath();c.moveTo(-27,13);c.lineTo(-4,5);c.lineTo(0,20);c.lineTo(4,5);c.lineTo(27,13);c.stroke();c.restore();
    for(let i=0;i<p.cargo;i++){const a=t*1.4+i/Math.max(1,p.cargo)*6.28,r=35+(i%2)*7;this.diamond(x+Math.cos(a)*r,y+Math.sin(a)*r*.7,3.2,C.gold);}
    if(p.dashTime>0){c.save();c.globalCompositeOperation='lighter';c.lineWidth=13;c.strokeStyle='#72ffde45';c.beginPath();c.moveTo(x-p.dx*100,y-p.dy*100);c.lineTo(x,y);c.stroke();c.restore();}
  }
  diamond(x,y,r,color){this.path([[x,y-r],[x+r*.65,y],[x,y+r],[x-r*.65,y]],color);}
  enemy(e,t){const c=this.c;c.save();c.translate(e.x,e.y);c.rotate(e.angle+Math.PI/2);this.glow(0,0,40,'#fa655525');
    if(e.type==='hunter'){this.path([[0,-17],[18,9],[8,5],[0,17],[-8,5],[-18,9]],'#6d3841',C.coral);this.path([[0,-10],[4,3],[0,9],[-4,3]],C.coral);}
    if(e.type==='shooter'){c.rotate(t*.5);for(let i=0;i<4;i++){c.rotate(Math.PI/2);this.path([[0,-23],[9,-9],[0,-3],[-9,-9]],'#6b3542',C.coral);}this.circle(0,0,7,C.gold);}
    if(e.type==='lancer'){this.path([[0,-27],[12,13],[0,7],[-12,13]],'#733b49',C.coral,1.5);this.diamond(0,1,5,C.gold);}
    c.restore();if(e.windup>0){c.save();c.setLineDash([7,7]);c.strokeStyle='#ff8b7665';c.lineWidth=2;c.beginPath();c.moveTo(e.x,e.y);c.lineTo(e.x+Math.cos(e.angle)*450,e.y+Math.sin(e.angle)*450);c.stroke();c.restore();this.circle(e.x,e.y,26+e.windup*20,C.coral);}
    if(e.age<.7)this.circle(e.x,e.y,35*(1-e.age/.7),'#ff746f88');
    if(e.type==='shooter'&&e.cool<.65)this.circle(e.x,e.y,23+e.cool*18,'#ffd38999');
  }
  leviathan(s,t){const c=this.c,x=W.cx+Math.cos(s.bossAngle)*390,y=W.cy+Math.sin(s.bossAngle)*180;c.save();c.translate(x,y);c.rotate(s.bossAngle+Math.PI/2);this.glow(0,0,120,'#ff746f20');
    for(let side of [-1,1]){c.save();c.scale(side,1);this.path([[0,-45],[35,-21],[88,-27],[67,4],[111,30],[62,25],[75,56],[27,28],[0,53]],'#3a3041','#d378795f',1.5);this.path([[9,-27],[35,0],[74,14],[27,18],[11,37]],'#743f4d','#f0907950');c.restore();}
    this.path([[0,-53],[25,-7],[0,54],[-25,-7]],'#5f3e53',C.coral,1.4);this.diamond(0,0,16,C.gold);this.circle(0,0,69,'#ffb5a12b');c.restore();
    c.fillStyle='#e8a595';c.font='8px Arial';c.textAlign='center';c.fillText('THE LAST DARK',x,y+94);c.fillStyle='#4b3442';c.fillRect(x-45,y+103,90,3);c.fillStyle=C.coral;c.fillRect(x-45,y+103,90*(1-Math.min(1,s.energy/goal(s))),3);
  }
  draw(s,t){
    const c=this.c;c.setTransform(1,0,0,1,0,0);c.fillStyle=C.bg;c.fillRect(0,0,this.canvas.width,this.canvas.height);c.setTransform(this.scale,0,0,this.scale,this.ox,this.oy);
    const title=s.phase==='title';const shake=this.fx.reduced?0:s.shake;c.translate(Math.sin(t*79)*shake*.5,Math.cos(t*91)*shake*.35);
    if(!this.backdrop){this.backdrop=document.createElement('canvas');this.backdrop.width=1280;this.backdrop.height=800;const old=this.c;this.c=this.backdrop.getContext('2d');this.ocean();this.c=old;}
    c.drawImage(this.backdrop,0,0);
    if(title){c.save();c.translate(240,-18);this.beacon(s,t);this.leviathan({...s,bossAngle:3.95,energy:20},t);this.courier({...s.player,x:890,y:530,cargo:7,dx:-.6,dy:-1},t,true);for(let i=0;i<16;i++){const a=i*.8;this.diamond(825+Math.cos(a)*190,395+Math.sin(a)*140,3+i%3,C.gold);}c.restore();}
    else{
      drawRegion(this,s,t);this.beacon(s,t);if(s.dawn>=4)this.leviathan(s,t);
      for(const q of s.sparks){const alpha=q.life-q.age<3?.4+Math.sin(t*8)*.3:.9;c.globalAlpha=alpha;this.glow(q.x,q.y,16,'#ffcd7820');this.diamond(q.x,q.y+Math.sin(t*2+q.phase)*2,4.3,C.gold);}c.globalAlpha=1;
      for(const e of s.enemies)this.enemy(e,t);
      c.save();c.globalCompositeOperation='lighter';for(const b of s.bullets){c.strokeStyle='#ff726755';c.lineWidth=2;c.beginPath();c.moveTo(b.x-b.vx*.035,b.y-b.vy*.035);c.lineTo(b.x,b.y);c.stroke();this.diamond(b.x,b.y,4.5,C.coral);}c.restore();
      const p=s.player;if(p.cargo>0){c.save();c.setLineDash([2,10]);c.strokeStyle='#e6db9a30';c.beginPath();c.moveTo(p.x,p.y);c.lineTo(W.cx,W.cy);c.stroke();c.restore();}
      this.courier(p,t);this.fx.draw(c);
      if(s.combo>1){c.font='italic 20px Georgia';c.fillStyle=C.gold;c.textAlign='center';c.fillText(`${s.combo} CHAIN`,p.x,p.y-60);}
      if(s.banner>0&&s.phase==='playing'&&s.time>2){c.globalAlpha=Math.min(1,s.banner);c.fillStyle=C.gold;c.textAlign='center';c.font='9px Arial';c.fillText(`DAWN ${String(s.dawn+1).padStart(2,'0')}  /  ${s.dawn>=4?'THE FINAL TIDE':'FIVE TIDES TO MORNING'}`,640,183);c.fillStyle=C.white;c.font='28px Georgia';c.fillText(DAWNS[Math.min(s.dawn,4)].name,640,219);c.globalAlpha=1;}
    }
    if(!this.fx.reduced&&this.fx.flash>0){c.fillStyle=`rgba(247,229,178,${this.fx.flash*.35})`;c.fillRect(0,0,1280,800);}
  }
}
