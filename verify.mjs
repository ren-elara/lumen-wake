import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import {writeFileSync} from 'node:fs';
import {createGame,startGame,update,togglePause,chooseUpgrade,bankCargo,hurtPlayer,spawnEnemy,spawnCluster,continueEndless,goal} from './game/src/simulation.js';
import {segmentCircle,distance,unit,constrain} from './game/src/math.js';
import {WORLD as W,LIMITS,STEP,offeredUpgrades,UPGRADES} from './game/src/config.js';
import {Effects} from './game/src/particles.js';

let checks=0;
function test(name,run){run();checks++;console.log(`PASS ${name}`);}
export function pilot(s){
  const p=s.player;let target={x:W.cx,y:W.cy};
  if(p.cargo<Math.min(p.cap,10)&&s.energy+p.cargo<goal(s)){
    let best=Infinity;for(const q of s.sparks){const d=distance(q,p);if(d<best){best=d;target=q;}}
  }
  const n=unit(target.x-p.x,target.y-p.y);let nearest=Infinity;
  for(const e of s.enemies)nearest=Math.min(nearest,distance(e,p));
  return{x:n.x,y:n.y,target,dash:p.dash<=0&&nearest<100,pulse:p.pulse<=0&&(nearest<65||s.bullets.some(b=>distance(b,p)<75))};
}
function valid(s){const p=s.player;assert(Number.isFinite(p.x)&&Number.isFinite(p.y));assert(p.hp>=0&&p.hp<=p.maxHp);assert(p.cargo>=0&&p.cargo<=p.cap);assert(Math.hypot((p.x-W.cx)/W.rx,(p.y-W.cy)/W.ry)<=1.000001);assert(s.enemies.length<=LIMITS.enemies);assert(s.bullets.length<=LIMITS.bullets);assert(s.sparks.length<=LIMITS.sparks);}
test('swept collisions: tunneling, tangent, zero-length, misses',()=>{
  assert(segmentCircle(0,0,1000,0,500,0,1));assert(segmentCircle(0,0,10,0,5,2,2));assert(segmentCircle(1,1,1,1,1,1,0));assert(!segmentCircle(0,0,10,0,5,3,2));assert(!segmentCircle(0,0,0,0,10,10,1));
  for(let i=0;i<2000;i++){const x=(i*17)%93,y=(i*31)%81;assert.equal(segmentCircle(x,y,x+20,y+9,50,40,7),segmentCircle(x+20,y+9,x,y,50,40,7));}
});
test('title, pause, terminal states freeze the simulation',()=>{const s=createGame();const before=JSON.stringify(s);update(s,{dash:true});assert.equal(JSON.stringify(s),before);startGame(s);update(s,{x:1});togglePause(s);const frozen=JSON.stringify(s);for(let i=0;i<90;i++)update(s,{x:1,dash:true});assert.equal(JSON.stringify(s),frozen);togglePause(s);assert.equal(s.phase,'playing');s.phase='lost';const score=s.score;update(s,{});assert.equal(s.score,score);});
test('banking is atomic, guarded and advances one dawn',()=>{const s=createGame();startGame(s);s.player.x=W.cx;s.player.y=W.cy;s.player.cargo=12;assert(bankCargo(s));assert.equal(s.banked,12);assert.equal(s.player.cargo,0);assert(!bankCargo(s));s.player.bankCooldown=0;s.player.cargo=12;assert(bankCargo(s));assert.equal(s.phase,'upgrade');assert(!chooseUpgrade(s,'invalid'));assert(chooseUpgrade(s,'magnet'));assert.equal(s.dawn,1);assert.equal(s.player.cap,16);assert(!chooseUpgrade(s,'hull'));});
test('damage, invulnerability and death preserve limits',()=>{const s=createGame();startGame(s);s.player.cargo=11;s.player.invuln=0;assert(hurtPlayer(s));assert.equal(s.player.cargo,5);assert(!hurtPlayer(s));s.player.dashTime=.1;s.player.invuln=0;assert(!hurtPlayer(s));s.player.dashTime=0;s.player.hp=1;assert(hurtPlayer(s));assert.equal(s.phase,'lost');valid(s);});
test('victory, endless transition and all nine upgrade branches',()=>{const s=createGame();startGame(s);s.dawn=4;s.energy=goal(s)-4;s.player.x=W.cx;s.player.y=W.cy;s.player.cargo=4;bankCargo(s);assert.equal(s.phase,'won');continueEndless(s);assert.equal(s.phase,'upgrade');assert(chooseUpgrade(s,'harbor'));for(let i=0;i<UPGRADES.length;i++){const state=createGame();state.phase='upgrade';state.dawn=Math.floor(i/3);state.player.hp=1;assert(chooseUpgrade(state,UPGRADES[i].id));assert.equal(state.upgrades[0],UPGRADES[i].id);valid(state);}const a=createGame();a.phase='upgrade';assert(!chooseUpgrade(a,'heart'),'Unoffered gift must be refused');});
test('endless is selectable from a fresh start and continues beyond dawn five',()=>{const s=createGame('high-tide','endless');assert.equal(s.phase,'title');startGame(s);assert.equal(s.mode,'endless');for(let i=0;i<180000&&s.dawn<7;i++){if(s.phase==='upgrade')chooseUpgrade(s,offeredUpgrades(s)[i%3].id);else if(s.phase==='playing'){s.player.invuln=0.1;update(s,pilot(s));}}assert(s.dawn>=7);assert.notEqual(s.phase,'won');});
test('invalid delta/input and arena boundary remain finite',()=>{const s=createGame();startGame(s);update(s,{x:NaN,y:Infinity,target:{x:NaN,y:0}},NaN);for(let i=0;i<1000;i++)update(s,{x:1e20,y:-1e20,dash:true},Infinity);s.player.x=1e9;s.player.y=-1e9;constrain(s.player,W);valid(s);});
test('gift effects change combat, economy and healing',()=>{
  const a=createGame();a.phase='upgrade';a.dawn=1;chooseUpgrade(a,'pulse');assert(a.player.pulseRadius>175&&a.player.pulseCooldown<7);
  const b=createGame();b.phase='upgrade';b.dawn=2;chooseUpgrade(b,'prism');b.player.x=W.cx;b.player.y=W.cy;b.player.cargo=4;bankCargo(b);assert.equal(b.score,1000);assert.equal(b.player.cap,18);
  const c=createGame();c.phase='upgrade';c.dawn=2;chooseUpgrade(c,'heart');c.player.hp=2;c.enemies.push({x:c.player.x+100,y:c.player.y,type:'hunter',r:15,age:2,windup:0,cool:2,vx:0,vy:0,angle:0,dead:false});update(c,{pulse:true});assert.equal(c.player.hp,3);assert.equal(c.kills,1);
  const d=createGame();d.phase='upgrade';d.dawn=1;chooseUpgrade(d,'harbor');d.player.invuln=0;d.player.x=W.cx;d.player.y=W.cy;d.player.cargo=1;bankCargo(d);assert(d.player.invuln>=.9);
});
test('identical seed plus inputs reproduce complete state',()=>{const a=createGame('repeat'),b=createGame('repeat');startGame(a);startGame(b);for(let i=0;i<18000;i++){if(a.phase==='upgrade'){const id=offeredUpgrades(a)[2].id;chooseUpgrade(a,id);chooseUpgrade(b,id);}const input=structuredClone(pilot(a));update(a,structuredClone(input));update(b,structuredClone(input));}assert.deepEqual(a,b);assert.notEqual(createGame('other').rng,a.rng);});

const timings=[],peaks={enemies:0,bullets:0,sparks:0,particles:0};let steps=0,victories=0,losses=0,longest=0;
test('48 seeded voyages exercise full loop, difficulty and effects',()=>{
  for(let run=0;run<48;run++){
    const s=createGame('stress-'+run),fx=new Effects();startGame(s);
    for(let i=0;i<36000&&s.phase!=='won'&&s.phase!=='lost';i++){
      if(s.phase==='upgrade')chooseUpgrade(s,offeredUpgrades(s)[run%3].id);
      const input=pilot(s),t=performance.now();update(s,input);timings.push(performance.now()-t);steps++;
      for(const e of s.events)fx.event(e);fx.update(STEP);
      if(i%60===0)valid(s);
      for(const key of ['enemies','bullets','sparks'])peaks[key]=Math.max(peaks[key],s[key].length);peaks.particles=Math.max(peaks.particles,fx.particles.length);
    }
    valid(s);assert(s.phase==='won'||s.phase==='lost','Pilot must reach a terminal state');if(s.phase==='won')victories++;else losses++;longest=Math.max(longest,s.time);
  }
  assert(victories>0,'At least one complete victory must be achievable');assert(losses>0||victories===48);assert(peaks.particles<=LIMITS.particles);
});
test('saturated director/projectile/pickup bounds over 60,000 steps',()=>{const s=createGame('saturation','endless');startGame(s);s.dawn=7;s.player.hp=s.player.maxHp=9;for(let i=0;i<60000;i++){s.player.invuln=1;if(s.phase==='upgrade')chooseUpgrade(s,offeredUpgrades(s)[0].id);if(i%10===0){spawnEnemy(s);spawnCluster(s);}update(s,{x:Math.sin(i*.013),y:Math.cos(i*.011),dash:i%45===0,pulse:i%240===0});if(i%300===0)valid(s);}valid(s);});

let retainedHeapBytes=null;
test('effects and discarded runs release retained state',()=>{const fx=new Effects();for(let i=0;i<1000;i++){fx.burst(10,10,'#fff',60);fx.ring(10,10,'#fff');fx.label(1,1,'test','#fff');fx.update(.1);}assert(fx.particles.length<=LIMITS.particles);for(let i=0;i<100;i++)fx.update(.1);assert.equal(fx.particles.length,0);assert.equal(fx.rings.length,0);assert.equal(fx.labels.length,0);if(global.gc){global.gc();const before=process.memoryUsage().heapUsed;for(let i=0;i<300;i++){const s=createGame('gc-'+i);startGame(s);for(let j=0;j<300;j++)update(s,pilot(s));}global.gc();retainedHeapBytes=process.memoryUsage().heapUsed-before;assert(retainedHeapBytes<8*1024*1024,'Retained heap grew beyond 8 MiB');}});
timings.sort((a,b)=>a-b);const at=q=>Number(timings[Math.floor((timings.length-1)*q)].toFixed(4));
const report={checks,simulationSteps:steps+60000,seededVoyages:48,victories,losses,longestVoyageSeconds:Number(longest.toFixed(1)),updateMs:{p50:at(.5),p95:at(.95),p99:at(.99),max:at(1)},frameBudgetMs:16.667,peaks,retainedHeapBytes,node:process.version,platform:process.platform,arch:process.arch,notes:'Update-only timings; browser rendering is measured separately. Finite stress tests cannot prove absence of every memory leak.'};
assert(report.updateMs.p99<16.667,'99th percentile simulation exceeds one 60 Hz frame');
if(process.argv.includes('--report'))writeFileSync(new URL('./verification.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
