import {REGIONS,WORLD as W} from './config.js';
export function drawRegion(renderer,s,t){
  const c=renderer.c,region=REGIONS[Math.min(s.dawn,4)];
  const haze=c.createRadialGradient(640,420,45,640,420,550);haze.addColorStop(0,'transparent');haze.addColorStop(1,region.haze+'55');c.fillStyle=haze;c.fillRect(85,118,1110,600);
  for(let i=0;i<10;i++){
    const a=i*.67+.4,x=640+Math.cos(a)*(490+(i%3)*12),y=420+Math.sin(a)*(235+(i%2)*18);
    c.save();c.translate(x,y);c.rotate(Math.sin(a)*.15);const size=20+(i%3)*13;
    c.save();c.scale(1,.35);renderer.circle(0,12,size*1.8,region.color+'35');renderer.circle(0,12,size*2.1,region.color+'18');c.restore();
    if(region.motif==='reef'){
      for(let j=0;j<3;j++){c.save();c.translate((j-1)*18,0);renderer.path([[-10,8],[-7,-18-j*8],[0,-34-j*8],[11,-12],[14,8]],region.land,region.color+'55');renderer.path([[0,-34-j*8],[2,8],[14,8],[11,-12]],'#275853');c.restore();}
    }else if(region.motif==='arches'){
      renderer.path([[-size,15],[-size,-size],[0,-size-20],[size,-size],[size,15],[size-10,15],[size-10,-size+9],[0,-size-5],[-size+10,-size+9],[-size+10,15]],region.land,region.color+'70');
    }else{
      renderer.path([[-size,15],[-size*.5,-size],[0,-size*1.65],[size*.6,-size*.5],[size,15]],region.land,region.color+'65');
      renderer.path([[0,-size*1.65],[0,15],[size,15],[size*.6,-size*.5]],region.color+'18');
      if(region.motif==='ruins'){c.strokeStyle=region.color+'80';c.beginPath();c.moveTo(-size*.45,-size*.3);c.lineTo(size*.45,-size*.3);c.stroke();renderer.diamond(0,-size*.45,4,region.color);}
    }
    c.restore();
  }
  for(let i=0;i<7;i++){const a=t*.07+i*.91,x=W.cx+Math.cos(a)*(220+i*33),y=W.cy+Math.sin(a)*(130+i*11);c.strokeStyle=region.color+'20';c.lineWidth=1;c.beginPath();c.ellipse(x,y,18+i*3,3,Math.sin(a)*.2,0,Math.PI*1.4);c.stroke();}
  c.textAlign='left';c.fillStyle=region.color;c.font='10px Arial';c.fillText(region.name,43,224);c.fillStyle='#aec9c2';c.font='24px Georgia';c.fillText(s.dawn>=4?'Break the leviathan.':'Kindle the next dawn.',42,256);c.fillStyle='#7ca3a4';c.font='10px Arial';c.fillText('GATHER  →  DASH  →  RETURN',43,279);
  if(s.upgrades.length){c.fillStyle='#86b2aa';c.font='8px Arial';c.fillText('YOUR GIFTS',43,311);s.upgrades.forEach((id,i)=>{renderer.diamond(48+i*20,329,4,region.color);});}
}
