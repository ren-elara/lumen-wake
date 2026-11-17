export const WORLD = { width: 1280, height: 800, cx: 640, cy: 420, rx: 540, ry: 285 };
export const STEP = 1 / 60;
export const LIMITS = { enemies: 34, bullets: 180, sparks: 72, particles: 420, events: 80 };
export const COLORS = { bg:'#071c26', sea:'#0c2a36', teal:'#6fe9d4', gold:'#ffd389', coral:'#ff746f', white:'#f5f0dc', muted:'#7faaa9' };
export const DAWNS = [
  {name:'A small beginning',goal:24,subtitle:'Gather the scattered light.'},
  {name:'The water listens',goal:36,subtitle:'The storm has found your wake.'},
  {name:'Teeth in the tide',goal:48,subtitle:'Lancers are locking on. Keep moving.'},
  {name:'Against the current',goal:60,subtitle:'A full hold is worth the risk.'},
  {name:'The last dark',goal:72,subtitle:'Feed the beacon. Break the leviathan.'},
];
export const UPGRADES = [
  {id:'dash',symbol:'↗',name:'Slipstream',tag:'MOBILITY',text:'Dash recharges 22% faster. Thread the storm more often.',color:'#6fe9d4'},
  {id:'magnet',symbol:'✧',name:'Gatherlight',tag:'REACH',text:'Collect light from farther away. Carry 4 more sparks.',color:'#ffd389'},
  {id:'hull',symbol:'◇',name:'Second wind',tag:'SURVIVAL',text:'Repair 2 hull and add one maximum hull segment.',color:'#ffaaa0'},
];
