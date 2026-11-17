import {LIMITS} from './config.js';
export function emit(s,type,x=s.player.x,y=s.player.y,value=0){if(s.events.length<LIMITS.events)s.events.push({type,x,y,value});}
