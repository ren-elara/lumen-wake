import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=fileURLToPath(new URL('.',import.meta.url)).replace(/\/$/,'');
const browser=await chromium.launch({...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{}),headless:true});
const page=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1,hasTouch:true});
const errors=[],external=[],failed=[];
page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:8080/')&&!r.url().startsWith('data:'))external.push(r.url());});page.on('requestfailed',r=>failed.push(r.url()));
await page.clock.install({time:new Date('2026-11-17T12:00:00Z')});
await page.clock.pauseAt(new Date('2026-11-17T12:00:01Z'));
await page.goto((process.env.GAME_URL||'http://127.0.0.1:8080/')+'?seed=FIRST-LIGHT');await page.waitForFunction(()=>globalThis.lumen);
await page.clock.runFor(300);
const titleLayout=await page.locator('.title-copy').boundingBox();assert(titleLayout.x>=0&&titleLayout.y>=82);
await page.screenshot({path:root+'/screenshots/2-storm.jpg',type:'jpeg',quality:87});
await page.keyboard.press('Enter');await page.clock.runFor(100);
assert.equal(await page.evaluate(()=>lumen.snapshot().phase),'playing');
await page.keyboard.press('Escape');const paused=await page.evaluate(()=>lumen.snapshot().time);await page.clock.runFor(1000);assert.equal(await page.evaluate(()=>lumen.snapshot().time),paused);await page.locator('#resume').click();
await page.keyboard.press('m');await page.keyboard.press('m');
await page.mouse.move(750,515);await page.mouse.down();
let capturedAction=false,capturedUpgrade=false,summary,iterations=0;
for(let i=0;i<2400;i++){
  iterations++;
  const s=await page.evaluate(()=>lumen.snapshot());
  if(i%100===0)console.log('voyage',i,s.phase,s.dawn,s.time.toFixed(1),s.player.hp,s.banked,s.enemies.length);
  if(s.phase==='upgrade'){
    await page.mouse.up();
    if(!capturedUpgrade&&s.dawn>=1){await page.clock.runFor(300);await page.screenshot({path:root+'/screenshots/3-gift.jpg',type:'jpeg',quality:87});capturedUpgrade=true;}
    await page.keyboard.press('3');await page.clock.runFor(40);await page.mouse.down();continue;
  }
  if(s.phase==='won'||s.phase==='lost'){
    console.log('terminal',s.phase,s.dawn,s.time,s.player.hp,s.banked);
    await page.mouse.up();await page.clock.runFor(500);await page.screenshot({path:root+'/screenshots/4-morning.jpg',type:'jpeg',quality:87});summary=s;break;
  }
  const p=s.player;
  let target={x:640,y:420};
  const goals=[24,36,48,60,72];
  if(p.cargo<Math.min(p.cap,12)&&s.energy+p.cargo<goals[Math.min(s.dawn,4)]){
    let best=Infinity;for(const q of s.sparks){const d=Math.hypot(q.x-p.x,q.y-p.y);if(d<best){best=d;target=q;}}
  }
  await page.mouse.move(target.x,target.y);
  const nearest=Math.min(...s.enemies.map(e=>Math.hypot(e.x-p.x,e.y-p.y)));
  if(p.dash<=0&&nearest<105)await page.keyboard.press('Space');
  if(p.pulse<=0&&(nearest<70||s.bullets.some(b=>Math.hypot(b.x-p.x,b.y-p.y)<75)))await page.keyboard.press('e');
  await page.clock.runFor(100);
  if(!capturedAction&&s.dawn>=4&&s.enemies.length>=4&&p.cargo>=4){await page.screenshot({path:root+'/screenshots/1-start.jpg',type:'jpeg',quality:87});capturedAction=true;}
}
assert(summary,'Voyage reached a result');assert.equal(summary.phase,'won','Input-driven voyage should be winnable');assert(capturedAction&&capturedUpgrade);
const score=summary.score;assert(await page.locator('#retry').isVisible());await page.locator('#retry').click();await page.clock.runFor(200);assert.equal(await page.evaluate(()=>lumen.snapshot().phase),'playing');
await page.reload();await page.clock.runFor(100);assert((await page.evaluate(()=>JSON.parse(localStorage.getItem('lumen-wake-v1')).best))>=score);
// Viewport and actual touch input check on a portrait phone.
await page.setViewportSize({width:390,height:844});await page.clock.runFor(100);
await page.locator('#play').click();await page.clock.runFor(100);
const cdp=await page.context().newCDPSession(page);
await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:250,y:400}]});
await page.clock.runFor(500);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
const mobile=await page.evaluate(()=>({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,phase:lumen.snapshot().phase,player:lumen.snapshot().player}));
assert(!mobile.overflow);assert.equal(mobile.phase,'playing');
await page.locator('#home').click();await page.locator('#mode-endless').click();assert.equal(await page.locator('#mode-endless').getAttribute('aria-pressed'),'true');await page.locator('#play').click();await page.clock.runFor(100);const endless=await page.evaluate(()=>lumen.snapshot());assert.equal(endless.phase,'playing');assert.equal(endless.mode,'endless');
await page.setViewportSize({width:1280,height:800});await page.reload();await page.keyboard.press('Enter');
// Measure real wall-clock rendering, without virtual-time acceleration.
await page.clock.resume();await page.waitForTimeout(6000);
const metrics=await page.evaluate(()=>lumen.metrics());const frames=metrics.frames.sort((a,b)=>a-b);const q=p=>Number(frames[Math.floor((frames.length-1)*p)].toFixed(3));
assert.equal(errors.length,0,JSON.stringify(errors));assert.equal(external.length,0);assert.equal(failed.length,0);
const report={browser:browser.version(),viewport:'1280×800',inputDrivenVictory:{seconds:Number(summary.time.toFixed(2)),score:Math.round(score),dawns:5,banked:summary.banked,hits:summary.hits,kills:summary.kills,iterations},pageErrors:errors,externalRequests:external,failedRequests:failed,pauseFreeze:true,restart:true,scorePersistence:true,portraitTouch:true,directEndlessMode:true,drawAndUpdateMs:{p50:q(.5),p95:q(.95),p99:q(.99)},samples:frames.length,liveVoices:metrics.voices,notes:'CPU headless Chromium on ARM64 musl; frame work timings include drawing, simulation and HUD, but exclude compositor and display latency. Screenshots are unedited browser captures from reachable input-driven states.'};
writeFileSync(root+'/browser-verification.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await browser.close();
