import {DAWNS,WORLD as W,offeredUpgrades} from './config.js';
import {clamp,distance} from './math.js';
import {emit} from './events.js';
import {destroyEnemy} from './combat.js';
export function multiplier(s){return Math.min(4,1+Math.floor(s.player.cargo/4));}
export function goal(s){return DAWNS[Math.min(s.dawn,4)].goal+Math.max(0,s.dawn-4)*10;}
export function bankCargo(s){
  const p=s.player;if(s.phase!=='playing'||!p.cargo||p.bankCooldown>0||distance(p,{x:W.cx,y:W.cy})>57)return false;
  const cargo=p.cargo,m=multiplier(s),points=Math.round(cargo*100*m*(1+s.combo*.025)*(p.bankBonus||1));
  s.score+=points;s.energy+=cargo;s.banked+=cargo;s.banks++;s.peak=Math.max(s.peak,m);p.cargo=0;p.bankCooldown=.7;p.pulse=Math.max(0,p.pulse-2);s.pressure=clamp(s.pressure+.045,.15,1);s.shake=7;
  emit(s,'bank',W.cx,W.cy,points);for(const e of s.enemies)if(distance(e,{x:W.cx,y:W.cy})<150)destroyEnemy(s,e);
  if(p.harbor)p.invuln=Math.max(p.invuln,.9);
  s.bullets=s.bullets.filter(b=>distance(b,{x:W.cx,y:W.cy})>180);
  if(s.energy>=goal(s)){if(s.dawn>=4&&s.mode!=='endless'){s.phase='won';s.won=true;s.score+=5000+p.hp*500;emit(s,'win');}else{s.phase='upgrade';emit(s,'dawn');}}
  return true;
}
export function chooseUpgrade(s,id){
  if(s.phase!=='upgrade'||!offeredUpgrades(s).some(u=>u.id===id))return false;
  const p=s.player;s.upgrades.push(id);
  if(id==='dash')p.dashCooldown=Math.max(.45,p.dashCooldown*.78);
  if(id==='magnet'){p.magnet+=18;p.cap+=4;}
  if(id==='hull'){p.maxHp=Math.min(9,p.maxHp+1);p.hp=Math.min(p.maxHp,p.hp+2);}
  if(id==='wake'){p.dashWidth=(p.dashWidth||0)+18;p.killBonus=(p.killBonus||1)*1.3;}
  if(id==='pulse'){p.pulseRadius=(p.pulseRadius||175)*1.45;p.pulseCooldown=(p.pulseCooldown||7)*.75;}
  if(id==='harbor'){p.harbor=true;p.hp=Math.min(p.maxHp,p.hp+2);}
  if(id==='sails'){p.cruise=(p.cruise||235)*1.18;p.dashLength=(p.dashLength||.18)+.05;}
  if(id==='prism'){p.cap+=6;p.bankBonus=(p.bankBonus||1)*1.25;}
  if(id==='heart'){p.hp=p.maxHp;p.dawnheart=true;}
  s.dawn++;s.energy=0;s.enemies=[];s.bullets=[];s.banner=4;s.spawn=2.5;p.invuln=2;p.dash=0;p.hp=Math.min(p.maxHp,p.hp+1);s.phase='playing';emit(s,'launch');return true;
}
export function continueEndless(s){if(s.phase==='won'){s.mode='endless';s.phase='upgrade';}}
