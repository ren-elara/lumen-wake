import {STEP,offeredUpgrades} from './config.js';
import {createGame,startGame,update,togglePause,chooseUpgrade,continueEndless} from './simulation.js';
import {Effects} from './particles.js';
import {Renderer} from './render.js';
import {Soundscape} from './audio.js';
import {Controls} from './input.js';
import {Interface,loadRecords,storeRecords} from './ui.js';

let state=createGame();
const effects=new Effects(),sound=new Soundscape();
const renderer=new Renderer(document.getElementById('ocean'),effects);
const prefs=loadRecords();sound.setMuted(Boolean(prefs.muted));effects.reduced=prefs.reduced??matchMedia('(prefers-reduced-motion: reduce)').matches;
let accumulator=0,last=0,visualTime=0;
function start(seed,mode){state=createGame(seed,mode);startGame(state);effects.particles=[];effects.rings=[];effects.labels=[];accumulator=0;controls.clear();sound.unlock();ui.lastPhase='';ui.finished=null;ui.update(state);}
function pause(){togglePause(state);controls.clear();accumulator=0;ui.update(state);}
function mute(){sound.unlock();sound.setMuted(!sound.muted);ui.records.muted=sound.muted;storeRecords(ui.records);ui.preferences(sound.muted,effects.reduced);}
const actions={start,pause,mute,retry:()=>start(state.seed,state.mode==='endless'?'voyage':state.mode),home:()=>{state=createGame(state.seed);controls.clear();ui.update(state);},endless:()=>{continueEndless(state);ui.update(state);},upgrade:id=>{chooseUpgrade(state,id);controls.clear();ui.update(state);sound.unlock();},dash:()=>{controls.dash=true;sound.unlock();},pulse:()=>{controls.pulse=true;sound.unlock();},motion:()=>{effects.reduced=!effects.reduced;ui.records.reduced=effects.reduced;storeRecords(ui.records);ui.preferences(sound.muted,effects.reduced);}};
const ui=new Interface(actions);
const controls=new Controls(renderer.canvas,renderer,key=>{
  if(key==='gesture')sound.unlock();
  if(key==='escape'||key==='p')pause();
  if(key==='m')mute();
  if(key==='enter'){if(state.phase==='title')actions.start(document.getElementById('seed').value||'FIRST-LIGHT','voyage');else if(state.phase==='won'||state.phase==='lost')actions.retry();else if(state.phase==='paused')pause();}
  if(['1','2','3'].includes(key))actions.upgrade(offeredUpgrades(state)[Number(key)-1].id);
});
ui.preferences(sound.muted,effects.reduced);ui.update(state);
addEventListener('resize',()=>renderer.resize());
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state.phase==='playing')pause();last=0;});
const frameSamples=[];
function frame(now){const dt=Math.min(last?(now-last)/1000:0,.1);last=now;visualTime+=Math.min(dt,.035);
  const began=performance.now();
  if(state.phase==='playing'){
    accumulator=Math.min(accumulator+dt,STEP*5);let first=true;
    while(accumulator>=STEP){const input=controls.read();if(!first){input.dash=false;input.pulse=false;}first=false;update(state,input);for(const event of state.events){effects.event(event);sound.event(event);}accumulator-=STEP;if(state.phase!=='playing'){accumulator=0;break;}}
    sound.update(dt,state.dawn);
  }else accumulator=0;
  if(state.phase!=='paused')effects.update(dt);
  renderer.draw(state,visualTime);ui.update(state,now);
  frameSamples.push(performance.now()-began);if(frameSamples.length>600)frameSamples.shift();requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
// Read-only inspection for reproducible browser verification; gameplay is changed only by real controls.
Object.defineProperty(globalThis,'lumen',{value:{snapshot:()=>structuredClone(state),metrics:()=>({frames:[...frameSamples],particles:effects.particles.length,voices:sound.voices}),worldPoint:(x,y)=>renderer.worldPoint(x,y)},writable:false});
