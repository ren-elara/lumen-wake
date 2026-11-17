import {LIMITS} from './config.js';
import {random,clamp} from './math.js';
import {emit} from './events.js';
export function projectile(s,x,y,angle,speed=120){if(s.bullets.length<LIMITS.bullets)s.bullets.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:7});}
export function destroyEnemy(s,e){
  if(e.dead)return;e.dead=true;s.kills++;s.combo=Math.min(20,s.combo+1);s.comboTime=3;s.score+=40*(1+s.combo*.15)*(s.player.killBonus||1);s.shake=Math.max(s.shake,5);s.hitstop=Math.max(s.hitstop,.025);emit(s,'destroy',e.x,e.y,s.combo);
  for(let i=0;i<3&&s.sparks.length<LIMITS.sparks;i++)s.sparks.push({x:e.x+(random(s)-.5)*30,y:e.y+(random(s)-.5)*30,age:0,life:18,phase:random(s)*6.28});
}
export function hurtPlayer(s){const p=s.player;if(p.invuln>0||p.dashTime>0||s.phase!=='playing')return false;p.hp--;p.cargo=Math.floor(p.cargo/2);p.invuln=1.7;s.hits++;s.combo=0;s.shake=12;s.hitstop=.07;s.pressure=clamp(s.pressure-.2,.15,1);emit(s,'hurt');if(p.hp<=0){p.hp=0;s.phase='lost';emit(s,'lost');}return true;}
