export class Controls {
  constructor(canvas,renderer,onAction){this.keys=new Set();this.pointer=null;this.dash=false;this.pulse=false;this.renderer=renderer;this.onAction=onAction;
    addEventListener('keydown',e=>{
      if(e.target instanceof HTMLInputElement)return;
      const k=e.key.toLowerCase();if([' ','arrowup','arrowdown','arrowleft','arrowright','shift'].includes(k))e.preventDefault();
      if(!e.repeat){if(k===' '||k==='shift')this.dash=true;if(k==='e')this.pulse=true;if(['escape','p','m','enter','1','2','3'].includes(k))onAction(k);}
      this.keys.add(k);
    });
    addEventListener('keyup',e=>this.keys.delete(e.key.toLowerCase()));
    canvas.addEventListener('contextmenu',e=>e.preventDefault());
    canvas.addEventListener('pointerdown',e=>{e.preventDefault();canvas.setPointerCapture(e.pointerId);this.pointer=renderer.worldPoint(e.clientX,e.clientY);if(e.pointerType!=='touch')this.dash=true;onAction('gesture');});
    canvas.addEventListener('pointermove',e=>{if(this.pointer)this.pointer=renderer.worldPoint(e.clientX,e.clientY);});
    canvas.addEventListener('pointerup',()=>{this.pointer=null;});canvas.addEventListener('pointercancel',()=>{this.pointer=null;});
    addEventListener('blur',()=>this.clear());
  }
  read(){const k=this.keys;const result={x:Number(k.has('d')||k.has('arrowright'))-Number(k.has('a')||k.has('arrowleft')),y:Number(k.has('s')||k.has('arrowdown'))-Number(k.has('w')||k.has('arrowup')),target:this.pointer,dash:this.dash,pulse:this.pulse};this.dash=false;this.pulse=false;return result;}
  clear(){this.keys.clear();this.pointer=null;this.dash=false;this.pulse=false;}
}
