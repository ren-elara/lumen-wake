import {UPGRADES,DAWNS} from './config.js';
import {goal,multiplier} from './simulation.js';
const $=id=>document.getElementById(id);
export function loadRecords(){try{return JSON.parse(localStorage.getItem('lumen-wake-v1')||'{}')||{};}catch{return{};}}
export function storeRecords(data){try{localStorage.setItem('lumen-wake-v1',JSON.stringify(data));}catch{/* Private browsing and full storage remain playable. */}}
export class Interface {
  constructor(actions){this.actions=actions;this.records=loadRecords();this.lastPhase='';this.lastHud=0;this.finished=null;
    $('play').onclick=()=>actions.start($('seed').value||'FIRST-LIGHT','voyage');
    $('daily').onclick=()=>{const seed='TIDE-'+new Date().toISOString().slice(0,10);$('seed').value=seed;actions.start(seed,'daily');};
    $('pause').onclick=actions.pause;$('resume').onclick=actions.pause;$('mute').onclick=actions.mute;$('motion').onclick=actions.motion;
    $('retry').onclick=actions.retry;$('restart-pause').onclick=actions.retry;$('back-title').onclick=actions.home;$('home').onclick=actions.home;$('endless').onclick=actions.endless;
    $('dash-button').onpointerdown=e=>{e.preventDefault();actions.dash();};$('pulse-button').onpointerdown=e=>{e.preventDefault();actions.pulse();};
    const param=new URLSearchParams(location.search).get('seed');if(param)$('seed').value=param.slice(0,32);
    $('title-best').textContent=`YOUR BEST VOYAGE · ${Math.round(this.records.best||0).toLocaleString()}`;
    $('upgrade-cards').replaceChildren(...UPGRADES.map((u,i)=>{const b=document.createElement('button');b.className='upgrade-card';b.innerHTML=`<kbd>${i+1}</kbd><span style="color:${u.color}">${u.symbol}</span><small>${u.tag}</small><h3>${u.name}</h3><p>${u.text}</p>`;b.onclick=()=>actions.upgrade(u.id);return b;}));
  }
  preferences(muted,reduced){$('mute').textContent=muted?'♪':'♫';$('mute').ariaLabel=muted?'Unmute sound':'Mute sound';$('motion').style.opacity=reduced?'.5':'1';$('motion').ariaLabel=reduced?'Enable full motion':'Reduce motion';}
  update(s,now=0){
    if(s.phase!==this.lastPhase){this.lastPhase=s.phase;const screens={title:'title-screen',upgrade:'upgrade-screen',paused:'pause-screen',won:'result-screen',lost:'result-screen'};for(const id of ['title-screen','upgrade-screen','pause-screen','result-screen'])$(id).hidden=id!==screens[s.phase];const active=s.phase!=='title';for(const id of ['live-hud','flight-deck','guidance'])$(id).hidden=!active;$('pause').hidden=!active;
    if(s.phase==='upgrade'){$('upgrade-eyebrow').textContent=`DAWN ${String(s.dawn+1).padStart(2,'0')} KINDLED · +1 HULL RESTORED`;setTimeout(()=>$('upgrade-cards').firstElementChild?.focus({preventScroll:true}),20);}
      if(s.phase==='won'||s.phase==='lost')this.results(s);
      if(s.phase==='playing')document.activeElement?.blur();
    }
    if(now-this.lastHud<70&&now!==0)return;this.lastHud=now;
    const p=s.player;$('dawn-label').textContent=s.phase==='title'?'THE LANTERN ARCHIPELAGO':`DAWN ${String(s.dawn+1).padStart(2,'0')} OF ${s.mode==='endless'?'∞':'05'}`;
    $('mission-name').textContent=s.phase==='title'?'Carry the dawn.':DAWNS[Math.min(s.dawn,4)].name;
    $('dawn-progress').style.width=`${s.phase==='title'?0:Math.min(100,s.energy/goal(s)*100)}%`;
    $('score').textContent=Math.round(s.score).toLocaleString();$('best-score').textContent=`BEST ${Math.round(this.records.best||0).toLocaleString()}`;
    $('hull').innerHTML=Array.from({length:p.maxHp},(_,i)=>`<i class="${i>=p.hp?'empty':''}"></i>`).join('');
    $('wave-counter').textContent=`${String(s.dawn+1).padStart(2,'0')} / ${s.mode==='endless'?'∞':'05'}`;
    $('cargo-count').textContent=`${p.cargo} / ${p.cap}`;$('cargo-slots').innerHTML=Array.from({length:p.cap},(_,i)=>`<i class="${i<p.cargo?'full':''}"></i>`).join('');
    $('multiplier').textContent=`×${multiplier(s)}`;$('cargo-advice').textContent=p.cargo>=p.cap?'HOLD FULL · BRING IT HOME':p.cargo>=8?'HIGH RISK · HIGH REWARD':'UNBANKED · RETURN TO BEACON';
    $('bank-count').textContent=`${Math.min(s.energy,goal(s))} / ${goal(s)}`;
    $('dash-status').textContent=p.dash>0?`RECHARGING · ${p.dash.toFixed(1)}s`:'READY · CUT THROUGH THREATS';$('dash-fill').style.width=`${100*(1-p.dash/p.dashCooldown)}%`;
    $('pulse-status').textContent=p.pulse>0?`RECHARGING · ${Math.ceil(p.pulse)}s`:'READY · CLEAR THE TIDE';$('pulse-fill').style.width=`${100*(1-p.pulse/7)}%`;
    $('guide-text').textContent=s.time<3?'Steer with WASD or drag. Gather the amber light.':p.cargo>=8?'Your hold is bright. Return to the central beacon.':!s.banks&&p.cargo?'Bring your light to the beacon at the center.':s.dawn>=4?'Bank light to break the leviathan’s shield.':p.hp<=2?'Hull critical. Dash through threats; pulse to escape.':'More carried light = more reward. And more danger.';
  }
  results(s){
    const won=s.phase==='won',score=Math.round(s.score),best=this.records.best||0,newBest=score>best;
    if(this.finished!==s){this.finished=s;this.records.best=Math.max(best,score);this.records.seeds??={};const key=`${s.mode}:${s.seed}`;this.records.seeds[key]=Math.max(this.records.seeds[key]||0,score);const keys=Object.keys(this.records.seeds);if(keys.length>50)delete this.records.seeds[keys[0]];storeRecords(this.records);}
    $('result-emblem').textContent=won?'✧':'◇';$('result-eyebrow').textContent=won?'ALL FIVE DAWNS KINDLED':`VOYAGE ENDED · DAWN ${s.dawn+1}`;
    $('result-title').innerHTML=won?'You brought<br><em>the morning.</em>':'A light worth<br><em>carrying.</em>';
    $('result-description').textContent=won?'Even the longest night gives way to a little light.':'The sea keeps your story. The beacon keeps your score.';
    $('result-score').textContent=score.toLocaleString();$('record-label').textContent=newBest?'NEW PERSONAL BEST':'';
    const time=`${Math.floor(s.time/60)}:${String(Math.floor(s.time%60)).padStart(2,'0')}`;
    $('result-stats').innerHTML=[[s.banked,'LIGHT SAVED'],['×'+s.peak,'PEAK MULTIPLIER'],[s.kills,'STORMS CUT'],[s.dawn+(won?1:0),'DAWNS KINDLED'],[time,'VOYAGE TIME'],[s.hits,'HITS TAKEN']].map(([v,label])=>`<div><strong>${v}</strong><small>${label}</small></div>`).join('');
    $('endless').hidden=!won;$('result-seed').textContent=`SEED ${s.seed.toUpperCase()} · ${s.mode.toUpperCase()}`;$('title-best').textContent=`YOUR BEST VOYAGE · ${this.records.best.toLocaleString()}`;
    setTimeout(()=>$('retry').focus({preventScroll:true}),30);
  }
}
