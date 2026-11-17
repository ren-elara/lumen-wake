import { WORLD as W, STEP, LIMITS, DAWNS } from './config.js';
import {clamp,distance,unit,hashSeed,random,segmentCircle,constrain} from './math.js';

export function createGame(seed='FIRST-LIGHT',mode='voyage') {
  const s={seed:String(seed),mode,rng:hashSeed(seed),phase:'title',time:0,tick:0,dawn:0,energy:0,score:0,banked:0,kills:0,banks:0,hits:0,peak:1,combo:0,comboTime:0,spawn:4,cluster:0,pressure:0.45,bossAngle:0,bossShot:1.5,shake:0,hitstop:0,banner:4,events:[],enemies:[],bullets:[],sparks:[],upgrades:[],won:false,
    player:{x:W.cx,y:W.cy+110,px:W.cx,py:W.cy+110,dx:0,dy:-1,hp:5,maxHp:5,cargo:0,cap:12,magnet:36,dash:0,dashTime:0,dashCooldown:1.3,pulse:0,invuln:3,bankCooldown:0}};
  for(let i=0;i<5;i++)spawnCluster(s,i===0?{x:W.cx+110,y:W.cy+95}:null);
  return s;
}
export function emit(s,type,x=s.player.x,y=s.player.y,value=0) {if(s.events.length<LIMITS.events)s.events.push({type,x,y,value});}
export function startGame(s) {if(s.phase==='title')s.phase='playing';}
export function togglePause(s) {if(s.phase==='playing')s.phase='paused';else if(s.phase==='paused')s.phase='playing';}
export function multiplier(s) {return Math.min(4,1+Math.floor(s.player.cargo/4));}
export function goal(s) {return DAWNS[Math.min(s.dawn,4)].goal+(s.dawn>4?(s.dawn-4)*10:0);}
export function spawnCluster(s,position=null) {
  const a=random(s)*Math.PI*2,r=0.34+random(s)*0.52;
  const c=position||{x:W.cx+Math.cos(a)*W.rx*r,y:W.cy+Math.sin(a)*W.ry*r};
  for(let i=0;i<6&&s.sparks.length<LIMITS.sparks;i++){
    const t=i/6*Math.PI*2;
    s.sparks.push({x:c.x+Math.cos(t)*23,y:c.y+Math.sin(t)*23,age:0,life:28,phase:random(s)*6.28});
  }
}
export function spawnEnemy(s,type=null) {
  if(s.enemies.length>=LIMITS.enemies)return;
  let a=random(s)*6.28,x=W.cx+Math.cos(a)*W.rx*0.98,y=W.cy+Math.sin(a)*W.ry*0.98;
  if(Math.hypot(x-s.player.x,y-s.player.y)<160){a+=Math.PI;x=W.cx+Math.cos(a)*W.rx*0.98;y=W.cy+Math.sin(a)*W.ry*0.98;}
  const r=random(s);type??=s.dawn>=2&&r<0.25?'lancer':s.dawn>=1&&r<0.5?'shooter':'hunter';
  s.enemies.push({x,y,type,r:type==='shooter'?19:15,age:0,windup:0,cool:1.8+random(s)*2,vx:0,vy:0,angle:a,dead:false});
}
function projectile(s,x,y,angle,speed=120) {if(s.bullets.length<LIMITS.bullets)s.bullets.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:7});}
export function destroyEnemy(s,e) {
  if(e.dead)return;e.dead=true;s.kills++;s.combo=Math.min(20,s.combo+1);s.comboTime=3;s.score+=40*(1+s.combo*0.15);s.shake=Math.max(s.shake,5);s.hitstop=Math.max(s.hitstop,0.025);
  emit(s,'destroy',e.x,e.y,s.combo);
  for(let i=0;i<3&&s.sparks.length<LIMITS.sparks;i++)s.sparks.push({x:e.x+(random(s)-0.5)*30,y:e.y+(random(s)-0.5)*30,age:0,life:18,phase:random(s)*6.28});
}
export function hurtPlayer(s) {
  const p=s.player;if(p.invuln>0||p.dashTime>0||s.phase!=='playing')return false;
  p.hp--;p.cargo=Math.floor(p.cargo/2);p.invuln=1.7;s.hits++;s.combo=0;s.shake=12;s.hitstop=0.07;s.pressure=clamp(s.pressure-0.2,0.15,1);emit(s,'hurt');
  if(p.hp<=0){p.hp=0;s.phase='lost';emit(s,'lost');}return true;
}
export function bankCargo(s) {
  const p=s.player;if(s.phase!=='playing'||!p.cargo||p.bankCooldown>0||distance(p,{x:W.cx,y:W.cy})>57)return false;
  const cargo=p.cargo,m=multiplier(s),points=Math.round(cargo*100*m*(1+s.combo*0.025));
  s.score+=points;s.energy+=cargo;s.banked+=cargo;s.banks++;s.peak=Math.max(s.peak,m);p.cargo=0;p.bankCooldown=0.7;p.pulse=Math.max(0,p.pulse-2);s.pressure=clamp(s.pressure+0.045,0.15,1);s.shake=7;
  emit(s,'bank',W.cx,W.cy,points);for(const e of s.enemies)if(distance(e,{x:W.cx,y:W.cy})<150)destroyEnemy(s,e);
  s.bullets=s.bullets.filter(b=>distance(b,{x:W.cx,y:W.cy})>180);
  if(s.energy>=goal(s)){
    if(s.dawn>=4&&s.mode!=='endless'){s.phase='won';s.won=true;s.score+=5000+p.hp*500;emit(s,'win');}
    else{s.phase='upgrade';emit(s,'dawn');}
  }
  return true;
}
export function chooseUpgrade(s,id) {
  if(s.phase!=='upgrade'||!['dash','magnet','hull'].includes(id))return false;
  const p=s.player;s.upgrades.push(id);
  if(id==='dash')p.dashCooldown=Math.max(0.45,p.dashCooldown*0.78);
  if(id==='magnet'){p.magnet+=18;p.cap+=4;}
  if(id==='hull'){p.maxHp=Math.min(9,p.maxHp+1);p.hp=Math.min(p.maxHp,p.hp+2);}
  s.dawn++;s.energy=0;s.enemies=[];s.bullets=[];s.banner=4;s.spawn=2.5;p.invuln=2;p.dash=0;p.hp=Math.min(p.maxHp,p.hp+1);s.phase='playing';emit(s,'launch');return true;
}
export function continueEndless(s) {if(s.phase!=='won')return;s.mode='endless';s.phase='upgrade';}
export function update(s,input={},dt=STEP) {
  s.events.length=0;if(s.phase!=='playing')return;
  dt=clamp(Number.isFinite(dt)?dt:0,0,0.05);if(!dt)return;
  s.tick++;s.time+=dt;s.banner=Math.max(0,s.banner-dt);s.shake=Math.max(0,s.shake-dt*24);
  if(s.hitstop>0){s.hitstop-=dt;return;}
  const p=s.player;p.px=p.x;p.py=p.y;
  for(const key of ['dash','pulse','invuln','bankCooldown'])p[key]=Math.max(0,p[key]-dt);
  s.comboTime-=dt;if(s.comboTime<=0)s.combo=0;
  let dx=Number.isFinite(input.x)?input.x:0,dy=Number.isFinite(input.y)?input.y:0;
  if(input.target&&Number.isFinite(input.target.x)&&Number.isFinite(input.target.y)){
    const v=unit(input.target.x-p.x,input.target.y-p.y),d=distance(p,input.target);dx=v.x*Math.min(1,d/18);dy=v.y*Math.min(1,d/18);
  }
  const magnitude=Math.hypot(dx,dy);let v=magnitude>1?unit(dx,dy):{x:dx,y:dy};if(magnitude>0.08){const facing=unit(dx,dy);p.dx=facing.x;p.dy=facing.y;}
  if(input.dash&&p.dash<=0){p.dash=p.dashCooldown;p.dashTime=0.18;emit(s,'dash');}
  if(input.pulse&&p.pulse<=0){p.pulse=7;emit(s,'pulse');s.shake=8;s.bullets=s.bullets.filter(b=>distance(b,p)>175);for(const e of s.enemies)if(distance(e,p)<175)destroyEnemy(s,e);}
  const dashing=p.dashTime>0;
  if(dashing){p.dashTime=Math.max(0,p.dashTime-dt);v={x:p.dx,y:p.dy};}
  const speed=dashing?940:235;
  p.x+=v.x*speed*dt;p.y+=v.y*speed*dt;constrain(p,W);
  for(const spark of s.sparks){
    spark.age+=dt;const d=distance(p,spark);
    if(d<p.magnet+22){spark.x+=(p.x-spark.x)*dt*9;spark.y+=(p.y-spark.y)*dt*9;}
    if(p.cargo<p.cap&&segmentCircle(p.px,p.py,p.x,p.y,spark.x,spark.y,22)){p.cargo++;spark.life=0;s.peak=Math.max(s.peak,multiplier(s));emit(s,'collect',spark.x,spark.y,p.cargo);}
  }
  s.sparks=s.sparks.filter(q=>q.life>q.age);
  s.cluster-=dt;if(s.cluster<=0){if(s.sparks.length<45)spawnCluster(s);s.cluster=2.1;}
  bankCargo(s);if(s.phase!=='playing')return;
  s.spawn-=dt;if(s.spawn<=0){spawnEnemy(s);s.spawn=Math.max(0.45,2.15-s.dawn*0.25-s.pressure*0.55-s.time/450);}
  const danger=1+s.dawn*0.12+p.cargo/p.cap*0.25+s.pressure*0.15;
  for(const e of s.enemies){
    if(e.dead)continue;
    e.age+=dt;let n=unit(p.x-e.x,p.y-e.y);e.angle=Math.atan2(n.y,n.x);e.cool-=dt;
    if(e.type==='hunter'){e.x+=n.x*76*danger*dt;e.y+=n.y*76*danger*dt;}
    if(e.type==='shooter'){
      const d=distance(e,p),f=d>230?1:d<170?-1:0;
      e.x+=(n.x*f-n.y*0.45)*58*dt;e.y+=(n.y*f+n.x*0.45)*58*dt;
      if(e.cool<=0){for(let i=-1;i<=1;i++)projectile(s,e.x,e.y,e.angle+i*0.23,115+s.dawn*6);e.cool=2.8;emit(s,'shot',e.x,e.y);}
    }
    if(e.type==='lancer'){
      if(e.windup>0){e.angle=Math.atan2(e.aimY,e.aimX);e.windup-=dt;if(e.windup<=0){e.vx=e.aimX*460;e.vy=e.aimY*460;e.cool=2.7;}}
      else if(e.cool<=0){e.windup=0.7;e.aimX=n.x;e.aimY=n.y;emit(s,'warning',e.x,e.y);}
      else{e.x+=(e.vx||n.x*42)*dt;e.y+=(e.vy||n.y*42)*dt;e.vx*=Math.exp(-dt*2.5);e.vy*=Math.exp(-dt*2.5);}
    }
    constrain(e,W);
    if(segmentCircle(p.px,p.py,p.x,p.y,e.x,e.y,e.r+10)){
      if(dashing)destroyEnemy(s,e);else if(hurtPlayer(s)){e.x-=n.x*60;e.y-=n.y*60;}
    }
  }
  s.enemies=s.enemies.filter(e=>!e.dead);
  if(s.dawn>=4){s.bossAngle+=dt*0.22;s.bossShot-=dt;if(s.bossShot<=0){const x=W.cx+Math.cos(s.bossAngle)*390,y=W.cy+Math.sin(s.bossAngle)*180,a=Math.atan2(p.y-y,p.x-x);for(let i=-3;i<=3;i++)projectile(s,x,y,a+i*0.22,110);s.bossShot=2.5;emit(s,'boss',x,y);}}
  for(const b of s.bullets){const ox=b.x,oy=b.y;b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
    if(segmentCircle(ox,oy,b.x,b.y,p.x,p.y,14)){if(!dashing)hurtPlayer(s);else emit(s,'graze',b.x,b.y);b.life=0;}
  }
  s.bullets=s.bullets.filter(b=>b.life>0&&b.x>20&&b.x<W.width-20&&b.y>65&&b.y<W.height-30);
}
