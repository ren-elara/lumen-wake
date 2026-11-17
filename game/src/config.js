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
  {id:'wake',symbol:'⋈',name:'Razorwake',tag:'OFFENSE',text:'Your dash cuts a wider path. Chain kills grant 30% more score.',color:'#6fe9d4'},
  {id:'pulse',symbol:'◎',name:'Tidecaller',tag:'CONTROL',text:'Pulse reaches 45% farther and recharges 25% faster.',color:'#ffd389'},
  {id:'harbor',symbol:'⌂',name:'Safe harbor',tag:'RECOVERY',text:'Repair 2 hull. Every bank grants a moment of protection.',color:'#ffaaa0'},
  {id:'sails',symbol:'↠',name:'Galesilk',tag:'MOBILITY',text:'Cruise 18% faster and gain a longer invulnerable dash.',color:'#6fe9d4'},
  {id:'prism',symbol:'✦',name:'Prism hold',tag:'GREED',text:'Carry 6 more sparks. All banked cargo is worth 25% more.',color:'#ffd389'},
  {id:'heart',symbol:'❖',name:'Dawnheart',tag:'SURVIVAL',text:'Restore all hull. Your pulse repairs one hull when it strikes.',color:'#ffaaa0'},
];
export const REGIONS=[
 {name:'GLASSWATER',color:'#76daca',haze:'#1c6d6b',land:'#153d43',motif:'reef'},
 {name:'THE AMBER SHOALS',color:'#efc27d',haze:'#78602b',land:'#494338',motif:'spires'},
 {name:'VERMILION STRAIT',color:'#ec8b86',haze:'#772f51',land:'#462e43',motif:'shards'},
 {name:'THE VIOLET REACH',color:'#b8a2e8',haze:'#564583',land:'#302d4d',motif:'arches'},
 {name:'THE LAST DARK',color:'#ffa177',haze:'#914536',land:'#472f3e',motif:'ruins'},
];
export function offeredUpgrades(s){const offset=(s.dawn%3)*3;return UPGRADES.slice(offset,offset+3);}
