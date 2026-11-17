export class Soundscape {
  constructor(){this.ctx=null;this.muted=false;this.voices=0;this.beat=0;this.timer=0;}
  async unlock(){try{if(!this.ctx){const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Audio)return;this.ctx=new Audio();this.master=this.ctx.createGain();this.master.gain.value=.24;this.master.connect(this.ctx.destination);}if(this.ctx.state==='suspended')await this.ctx.resume();}catch{/* Audio remains optional on restricted devices. */}}
  tone(freq,duration=.2,type='sine',volume=.2,delay=0,slide=0){
    if(!this.ctx||this.muted||this.voices>=24||this.ctx.state!=='running')return;
    const now=this.ctx.currentTime+delay,o=this.ctx.createOscillator(),g=this.ctx.createGain();this.voices++;o.type=type;o.frequency.setValueAtTime(freq,now);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,slide),now+duration);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(Math.max(.001,volume),now+.008);g.gain.exponentialRampToValueAtTime(.0001,now+duration);o.connect(g);g.connect(this.master);o.start(now);o.stop(now+duration+.02);o.onended=()=>{o.disconnect();g.disconnect();this.voices--;};
  }
  event(e){
    if(e.type==='collect')this.tone([440,528,660,792,880,1056][e.value%6],.16,'sine',.22);
    if(e.type==='dash'){this.tone(330,.14,'triangle',.15,0,70);this.tone(75,.18,'sine',.2);}
    if(e.type==='destroy'){this.tone(145,.18,'triangle',.3,0,35);this.tone(660+e.value*35,.12,'sine',.15);}
    if(e.type==='hurt')this.tone(130,.35,'sawtooth',.15,0,25);
    if(e.type==='bank'){[220,330,440,660].forEach((f,i)=>this.tone(f,.7,'sine',.25,i*.05));}
    if(e.type==='pulse'){this.tone(110,.6,'sine',.4,0,660);this.tone(330,.3,'triangle',.1);}
    if(e.type==='dawn'||e.type==='win')[330,440,528,660,880].forEach((f,i)=>this.tone(f,.9,'sine',.23,i*.12));
    if(e.type==='lost')[220,196,165,110].forEach((f,i)=>this.tone(f,.7,'sine',.18,i*.18));
  }
  update(dt,dawn){this.timer-=dt;if(this.timer>0)return;this.timer=.36;const notes=[110,165,220,264,330,220,165,132];this.tone(notes[this.beat%8],.65,'sine',.045);if(this.beat%4===0)this.tone(55,.8,'sine',.12);if(dawn>2&&this.beat%2===0)this.tone(660,.06,'triangle',.025);this.beat++;}
  setMuted(value){this.muted=value;if(this.master)this.master.gain.setTargetAtTime(value?0:.24,this.ctx.currentTime,.03);}
}
