// Stummer Headless-Test (Edge über CDP): lädt eine Kopie von index.html, führt Schritte aus, macht Screenshots.
//   node tools/headless_shot.mjs <prefix> <breite> <hoehe> <schritte.json>
// Schritte: [{"js":"...","wait":500,"shot":"name","dump":"name"}] – js läuft im Spiel-Scope (alle Variablen erreichbar),
// "shot" = Bildschirmfoto, "dump" = ein data:-URL-Ergebnis (z. B. focus.m.scr.image.toDataURL()) als PNG speichern.
// Ausgabe landet in %TEMP%\sj_shots (oder SHOT_DIR). Passwort und Highscore-Sperre (NK_HS_LOCAL) werden automatisch gesetzt,
// damit Tests nie gegen die echte Highscore-Tafel laufen. Hochformat (breite<hoehe) = Handy-Emulation; PC=false ggf. per js setzen.
import {spawn,execSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const [,,out,W,H,stepsFile]=process.argv;
if(!stepsFile){console.log('Aufruf: node tools/headless_shot.mjs <prefix> <breite> <hoehe> <schritte.json>');process.exit(1);}
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=(process.env.SHOT_DIR||path.join(os.tmpdir(),'sj_shots')).split(path.sep).join('/');fs.mkdirSync(dir,{recursive:true});
const steps=JSON.parse(fs.readFileSync(stepsFile,'utf8'));
const port=9300+Math.floor(Math.random()*500),prof=dir+'/prof'+port;
{const h=fs.readFileSync(path.join(repo,'index.html'),'utf8');const i=h.lastIndexOf('})();');
 const inj='<head><script>window.NK_HS_LOCAL=true;try{localStorage.setItem("nk_pw","sjs1")}catch(e){}</script>';
 const h2=h.replace('<head>',inj);const i2=h2.lastIndexOf('})();');
 fs.writeFileSync(dir+'/t.html',h2.slice(0,i2)+'window.__ev=s=>eval(s);'+String.fromCharCode(10)+h2.slice(i2));}
const edge=spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',['--headless=new','--mute-audio','--remote-debugging-port='+port,'--user-data-dir='+prof,'--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows','--disable-background-timer-throttling','--window-size='+W+','+H,'about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const killEdge=()=>{try{execSync('taskkill /PID '+edge.pid+' /T /F',{stdio:'ignore'});}catch(e){}
  try{const ps=dir+'/kill'+port+'.ps1';fs.writeFileSync(ps,"Get-CimInstance Win32_Process -Filter \"Name='msedge.exe'\" | Where-Object { $_.CommandLine -like '*prof"+port+"*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }");
    execSync('powershell -NoProfile -ExecutionPolicy Bypass -File "'+ps+'"',{stdio:'ignore',timeout:30000});fs.rmSync(ps,{force:true});}catch(e){}};
setTimeout(()=>{console.log('TIMEOUT');killEdge();process.exit(2);},170000);
let tabs;for(let i=0;i<150;i++){try{tabs=await (await fetch('http://127.0.0.1:'+port+'/json')).json();break;}catch(e){await sleep(200);}}
const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pend={},errs=[];
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pend[m.id]){pend[m.id](m);delete pend[m.id];}
  if(m.method==='Runtime.exceptionThrown')errs.push((m.params.exceptionDetails.exception&&m.params.exceptionDetails.exception.description)||m.params.exceptionDetails.text);};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend[i]=r;ws.send(JSON.stringify({id:i,method,params}));});
const ev=async x=>{const r=await send('Runtime.evaluate',{expression:'window.__ev('+JSON.stringify(x)+')',awaitPromise:true,returnByValue:true});
  if(r.result.exceptionDetails)console.log('ERR',(r.result.exceptionDetails.exception&&r.result.exceptionDetails.exception.description||'').slice(0,300));return r.result.result&&r.result.result.value;};
await send('Runtime.enable');await send('Page.enable');await send('Page.bringToFront'); // sonst gilt die Seite als versteckt und requestAnimationFrame steht nach kurzer Zeit
await send('Emulation.setDeviceMetricsOverride',{width:+W,height:+H,deviceScaleFactor:1,mobile:+W<+H});
await send('Page.navigate',{url:'file:///'+dir+'/t.html'});
for(let i=0;i<80;i++){const r=await send('Runtime.evaluate',{expression:"typeof window.__ev==='function'&&document.querySelector('#startGo').dataset.loading==='false'",returnByValue:true});if(r.result.result&&r.result.result.value)break;await sleep(250);}
await sleep(300);
for(const s of steps){
  if(s.js){const v=await ev(s.js);if(s.dump&&typeof v==='string'&&v.startsWith('data:image')){fs.writeFileSync(dir+'/'+out+'_'+s.dump+'.png',Buffer.from(v.split(',')[1],'base64'));}else if(v!==undefined)console.log('>',JSON.stringify(v).slice(0,400));}
  if(s.wait)await sleep(s.wait);
  if(s.shot){const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(dir+'/'+out+'_'+s.shot+'.png',Buffer.from(r.result.data,'base64'));}
}
console.log('errors:',errs.length?errs.slice(0,5):'none','| Bilder in',dir);
ws.close();killEdge();await sleep(800);try{fs.rmSync(prof,{recursive:true,force:true});}catch(e){}
process.exit(0);
