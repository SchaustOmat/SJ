"use strict";
const $=s=>document.querySelector(s);
const TAU=Math.PI*2;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// Geld wird intern in Cent gezählt (10 = 0,10 €)
const fmt=n=>(Math.round(n)/100).toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2})+' €';
const app=$('#app');

/* ---------- chips ---------- */
let chips=20000;
try{const v=localStorage.getItem('nk_chips');if(v!==null&&isFinite(+v))chips=+v;
  const ps=localStorage.getItem('nk_pstack');if(ps!==null&&isFinite(+ps)&&+ps>0){chips+=+ps;localStorage.removeItem('nk_pstack');}
  const sp=+localStorage.getItem('nk_slotpend');if(sp>0)chips+=sp;localStorage.removeItem('nk_slotpend');
  localStorage.setItem('nk_chips',String(chips));
  if(localStorage.getItem('nk_v')!=='2'){chips=Math.max(chips,20000);localStorage.setItem('nk_v','2');}}catch(e){}
let chipsHold=0; // Teil des Guthabens, der gerade noch zum Zähler fliegt (nur Anzeige)
function showChips(){$('#chips').textContent=fmt(Math.max(0,chips-chipsHold));}
// Gewinn in Päckchen zerlegen: 1.250 -> 1.000, 200, 50 (große Stellen bis zu 3 Päckchen)
function splitWin(A,max){const out=[];let rest=Math.round(A);if(rest<=0)return out;let p=Math.pow(10,Math.floor(Math.log10(rest)));
  while(rest>0&&p>=1&&out.length<max){const k=Math.floor(rest/p);if(k>0){const n=Math.min(k,3,max-out.length);let left=k;
    for(let i=0;i<n;i++){const kk=i===n-1?left:Math.ceil(left/(n-i));out.push(kk*p);left-=kk;}rest-=k*p;}p=Math.round(p/10);if(p<1)break;}
  if(rest>0){if(out.length)out[out.length-1]+=rest;else out.push(rest);}
  return out.sort((a,b)=>b-a);}
function setChips(v,flash){
  chips=Math.max(0,Math.round(v));
  showChips();
  try{localStorage.setItem('nk_chips',String(chips));}catch(e){}
  if(typeof saveChanged==='function')saveChanged();
  if(flash){const t=$('#chipsTag');t.classList.remove('flash');void t.offsetWidth;t.classList.add('flash');}
}
function store(k,v){try{if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,String(v));}catch(e){}}

/* ---------- audio ---------- */
let AC=null,master=null,muted=false;
function initAudio(){
  try{
    AC=new (window.AudioContext||window.webkitAudioContext)();
    master=AC.createGain();master.gain.value=.5;master.connect(AC.destination);
    const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=260;
    const g=AC.createGain();g.gain.value=.045;f.connect(g);g.connect(master);
    [55,55.6,82.4].forEach(fr=>{const o=AC.createOscillator();o.type='sawtooth';o.frequency.value=fr;o.connect(f);o.start();});
    const l=AC.createOscillator(),lg=AC.createGain();l.frequency.value=.07;lg.gain.value=120;l.connect(lg);lg.connect(f.frequency);l.start();
  }catch(e){AC=null;}
}
function tone(fr,d,type,v,when,slide){
  if(!AC||muted)return;const t=AC.currentTime+(when||0);
  const o=AC.createOscillator(),g=AC.createGain();o.type=type||'square';o.frequency.setValueAtTime(fr,t);
  if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+d);
  g.gain.setValueAtTime(v||.12,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  o.connect(g);g.connect(master);o.start(t);o.stop(t+d+.03);
}
let noiseBuf=null;
function noise(d,v,freq,when){
  if(!AC||muted)return;
  if(!noiseBuf){noiseBuf=AC.createBuffer(1,AC.sampleRate*.5,AC.sampleRate);const a=noiseBuf.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;}
  const t=AC.currentTime+(when||0);const s=AC.createBufferSource();s.buffer=noiseBuf;
  const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=freq||800;const g=AC.createGain();
  g.gain.setValueAtTime(v||.1,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  s.connect(f);f.connect(g);g.connect(master);s.start(t);s.stop(t+d+.02);
}
const SFX={
  click(){tone(880,.05,'square',.07);},
  btn(){noise(.03,.12,2500);tone(520,.04,'square',.05);},
  chip(){tone(1500,.04,'square',.06);tone(2100,.05,'square',.04,.03);},
  card(){noise(.07,.1,3000);},
  step(){noise(.06,.06,260);},
  tick(){tone(2400,.015,'square',.035);},
  count(){tone(1760,.02,'square',.03);},
  ding(){tone(1318,.7,'sine',.2);tone(1046,.9,'sine',.16,.28);},
  win(){[523,659,784,1046,1318].forEach((f,i)=>tone(f,.18,'square',.08,i*.08));},
  big(){[523,659,784,1046,784,1046,1318,1568].forEach((f,i)=>tone(f,.16,'square',.09,i*.07));},
  lose(){tone(220,.35,'square',.07,0,90);},
  clunk(){noise(.06,.14,600);tone(140,.06,'square',.06);},
  reelStart(){noise(.15,.08,900);},
  tease(i){tone(300+i*90,.5,'sawtooth',.05,0,600+i*120);},
  scatter(i){tone(660+i*220,.25,'square',.09);tone(990+i*220,.25,'square',.06,.06);},
  hum(){tone(65,3,'sawtooth',.06,0,95);noise(2.8,.03,120);},
  doors(){noise(1,.05,400);},
  fsIntro(){[392,523,659,784,659,784,1046].forEach((f,i)=>tone(f,.22,'triangle',.11,i*.13));},
  expand(){[262,330,392,523,659,784].forEach((f,i)=>tone(f,.12,'square',.08,i*.05));},
  gambleTick(on){tone(on?1047:880,.045,'square',.05);}, // Leiter-Blinken: C6/A5 im Wechsel
  reelStop(i){noise(.05,.16,700+i*90);tone(120+i*14,.07,'square',.07);},
  boom(){noise(.5,.22,160);tone(80,.55,'sine',.3,0,32);},
  whoosh(){noise(.3,.12,1800);tone(300,.3,'sawtooth',.03,0,1200);},
  sparkle(){[2093,2637,3136,4186].forEach((f,i)=>tone(f,.07,'square',.025,i*.035));},
  tierUp(i){[523,659,784,1046,1318].forEach((f,k)=>tone(f*(1+i*.2),.15,'square',.09,k*.055));noise(.35,.14,500);tone(70,.4,'sine',.25,0,40);},
  riseTick(p){tone(500+p*1600,.03,'square',.035);},
  heart(){tone(58,.13,'sine',.4);tone(52,.16,'sine',.32,.17);},
  coinUp(i){const f=Math.pow(1.0595,Math.min(i,24));tone(988*f,.07,'square',.06);tone(1976*f,.05,'square',.03,.03);},
  ausTick(k){tone(1000+k*600,.035,'square',.05);}, // Ausspielung: helle Ticks, Tonhöhe steigt (k = 0..1)
  ausFan(){tone(1760,.06,'square',.06);[[587,.06],[698,.06],[880,.09],[1175,.12]].reduce((t,[f,d])=>{tone(f,d,'square',.07,t);return t+d+.005;},.07);}, // hoher Pieps, dann D-F-A-D
  unlock(){tone(523,.08,'square',.07);tone(784,.08,'square',.07,.08);tone(1046,.18,'square',.08,.16);noise(.08,.12,2500,.02);},
  wildLand(){tone(196,.25,'square',.08,0,392);tone(1568,.12,'square',.04,.05);noise(.12,.12,3000);}
};
let beatTimer=null,beatN=0;
function setBeat(on){
  if(beatTimer){clearInterval(beatTimer);beatTimer=null;}
  if(!on)return;
  beatTimer=setInterval(()=>{if(!AC||muted||focus||(typeof RADIO!=='undefined'&&RADIO.st&&RADIO.st.p<0))return;beatN++;tone(62,.18,'sine',.2,0,38);if(beatN%2===0)noise(.04,.03,7000,.25);if(beatN%4===2)tone(110,.12,'square',.04,.25);},500);
}

/* ---------- three ---------- */
const cv=$('#game');
const renderer=new THREE.WebGLRenderer({canvas:cv,antialias:false,powerPreference:'default'});
renderer.setPixelRatio(1);
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x07050c);
scene.fog=new THREE.Fog(0x0a0712,4,24);
const camera=new THREE.PerspectiveCamera(70,1,.03,60);
camera.rotation.order='YXZ';
const snapRes={value:new THREE.Vector2(160,120)};
function psx(m){
  m.onBeforeCompile=sh=>{
    sh.uniforms.uSnap=snapRes;
    sh.vertexShader='uniform vec2 uSnap;\n'+sh.vertexShader.replace('#include <project_vertex>',
      '#include <project_vertex>\n  gl_Position.xy = floor(gl_Position.xy / gl_Position.w * uSnap + 0.5) / uSnap * gl_Position.w;');
  };
  return m;
}
const lam=o=>psx(new THREE.MeshLambertMaterial(o));
const bas=o=>psx(new THREE.MeshBasicMaterial(o));

/* ---------- textures ---------- */
let seed=1337;const rnd=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
function canvasTex(w,h,draw,rx,ry,smooth){
  const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=false;if(draw)draw(g,w,h);
  const t=new THREE.CanvasTexture(c);t.magFilter=smooth?THREE.LinearFilter:THREE.NearestFilter;t.minFilter=smooth?THREE.LinearFilter:THREE.NearestFilter;t.generateMipmaps=false;
  t.wrapS=t.wrapT=rx?THREE.RepeatWrapping:THREE.ClampToEdgeWrapping;if(rx)t.repeat.set(rx,ry||rx);t.userData={canvas:c,ctx:g};return t;
}
function shade(hex,d){const n=parseInt(hex.slice(1),16);let r=(n>>16)+d,g=((n>>8)&255)+d,b=(n&255)+d;r=clamp(r,0,255);g=clamp(g,0,255);b=clamp(b,0,255);return 'rgb('+r+','+g+','+b+')';}
function noisy(g,w,h,base,amp){for(let y=0;y<h;y++)for(let x=0;x<w;x++){g.fillStyle=shade(base,Math.round((rnd()-.5)*amp));g.fillRect(x,y,1,1);}}
const T={};
function carpet(base,line,a,b){return (g,w,h)=>{noisy(g,w,h,base,10);for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  if((x+y)%16===0||(x-y+32)%16===0){g.fillStyle=line;g.fillRect(x,y,1,1);}}
  const dot=(cx,cy,c,r)=>{g.fillStyle=c;for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++)if(x*x+y*y<=r*r+1)g.fillRect(cx+x,cy+y,1,1);};
  dot(8,0,a,2);dot(24,16,a,2);dot(8,32,a,2);dot(0,8,b,1);dot(16,8,b,1);dot(32,8,b,1);dot(0,24,b,1);dot(16,24,b,1);dot(32,24,b,1);};}
function concrete(g,w,h){noisy(g,w,h,'#3a3e4c',14);for(let i=0;i<5;i++){g.fillStyle='rgba(10,8,14,.35)';g.fillRect(rnd()*w|0,rnd()*h|0,2+rnd()*6|0,1+rnd()*3|0);}
  g.fillStyle='#262834';let x=rnd()*w|0;for(let y=0;y<14;y++){g.fillRect(x,y,1,1);x+=(rnd()*3|0)-1;}
  const gr=g.createLinearGradient(0,h*.7,0,h);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(8,6,10,.55)');g.fillStyle=gr;g.fillRect(0,0,w,h);}
function brick(g,w,h){g.fillStyle='#1a0a0c';g.fillRect(0,0,w,h);for(let r=0;r<4;r++){const off=r%2?8:0;for(let c=-1;c<3;c++){const bx=c*16+off,by=r*8;
  for(let y=by+1;y<by+8;y++)for(let x=bx+1;x<bx+16;x++){if(x<0||x>=w)continue;g.fillStyle=shade('#5a1a20',Math.round((rnd()-.5)*22));g.fillRect(x,y,1,1);}}}}
function ceilingT(g,w,h){noisy(g,w,h,'#17131f',8);g.fillStyle='#0a080e';g.fillRect(0,0,w,1);g.fillRect(0,0,1,h);g.fillRect(0,16,w,1);g.fillRect(16,0,1,h);}
function woodT(g,w,h){for(let y=0;y<h;y++){const b=Math.sin(y*.9)*8+(rnd()-.5)*10;for(let x=0;x<w;x++){g.fillStyle=shade('#4a2814',Math.round(b+(rnd()-.5)*8));g.fillRect(x,y,1,1);}}}
function metalT(g,w,h){noisy(g,w,h,'#5c6070',10);for(let i=0;i<6;i++){g.fillStyle='rgba(255,255,255,.08)';g.fillRect(rnd()*w|0,0,1,h);}}
function checkerT(g,w,h){for(let y=0;y<h;y++)for(let x=0;x<w;x++){const c=((x>>3)+(y>>3))%2?'#2a2a32':'#5a5a66';g.fillStyle=shade(c,Math.round((rnd()-.5)*8));g.fillRect(x,y,1,1);}}
function feltT(g,w,h){noisy(g,w,h,'#0f5a3e',8);g.fillStyle='#e8e0cc';
  const x0=22,y0=6,cw=3,ch=6;g.fillRect(x0-1,y0-1,12*cw+1,1);g.fillRect(x0-1,y0+3*ch,12*cw+1,1);
  for(let r=0;r<3;r++)for(let c=0;c<12;c++){const n=c*3+(3-r);g.fillStyle=REDS.has(n)?'#b01828':'#141018';g.fillRect(x0+c*cw,y0+r*ch,cw-1,ch-1);}
  g.fillStyle='#1f9a4a';g.fillRect(x0-4,y0,3,3*ch-1);g.fillStyle='#e8e0cc';g.fillRect(x0,y0+3*ch+2,12*cw-1,1);g.fillRect(x0,y0+3*ch+6,12*cw-1,1);
  g.strokeStyle='#e8e0cc';g.lineWidth=1;g.beginPath();g.arc(9,16,7,0,TAU);g.stroke();}
function pokerFeltT(g,w,h){noisy(g,w,h,'#0d4a3a',7);g.strokeStyle='rgba(232,224,204,.5)';g.lineWidth=1;g.beginPath();g.ellipse(w/2,h/2,w*.36,h*.36,0,0,TAU);g.stroke();}
function wheelTop(g,w,h){const cx=w/2,cy=h/2;g.fillStyle='#3a2010';g.fillRect(0,0,w,h);const step=TAU/37;
  for(let i=0;i<37;i++){const n=ORDER[i];g.fillStyle=colOf(n);g.beginPath();g.moveTo(cx,cy);g.arc(cx,cy,w/2-1,i*step,(i+1)*step);g.closePath();g.fill();}
  if(w>=96){g.fillStyle='#fff';g.font='bold '+(w*.055|0)+'px Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';
    for(let i=0;i<37;i++){const an=(i+.5)*step;g.save();g.translate(cx+Math.cos(an)*w*.43,cy+Math.sin(an)*w*.43);g.rotate(an+Math.PI/2);g.fillText(String(ORDER[i]),0,0);g.restore();}
    g.strokeStyle='#d8b860';g.lineWidth=1;g.beginPath();g.arc(cx,cy,w*.38,0,TAU);g.stroke();}
  g.fillStyle='#5a3418';g.beginPath();g.arc(cx,cy,w*.3,0,TAU);g.fill();g.fillStyle='#c8b070';g.beginPath();g.arc(cx,cy,w*.1,0,TAU);g.fill();}
function graffiti(text,col){return (g,w,h)=>{g.clearRect(0,0,w,h);g.font='italic 900 '+(h*.62|0)+'px Impact,"Arial Black",sans-serif';g.textAlign='center';g.textBaseline='middle';
  g.lineWidth=4;g.strokeStyle='#000';g.strokeText(text,w/2,h/2);g.fillStyle=col;g.fillText(text,w/2,h/2);
  for(let i=0;i<6;i++){g.fillStyle=col;g.fillRect(w*.15+rnd()*w*.7|0,h*.72|0,1,4+rnd()*8|0);}}}
function fitText(c,txt,x,y,maxW,size){let s=size;px(c,s);while(s>5&&c.measureText(txt).width>maxW){s--;px(c,s);}c.textAlign='center';c.textBaseline='middle';c.fillStyle='#f4f0e8';c.fillText(txt,x,y);}
function labelTex(w,h,draw){return canvasTex(w,h,draw,0,0,false);}
function px(g,size){g.font=size+'px "Press Start 2P", monospace';}

/* ---------- roulette data ---------- */
const ORDER=[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
const REDS=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
function colOf(n){return n===0?'#1f9a4a':REDS.has(n)?'#c81e2e':'#141018';}

/* ---------- playing cards (3D) ---------- */
const RANKN=['2','3','4','5','6','7','8','9','10','B','D','K','A'];
const SUITS=['♠','♥','♦','♣'];
const cardTexCache={};
function cardFaceTex(c){
  if(cardTexCache[c])return cardTexCache[c];
  const r=c%13,s=(c/13)|0,red=s===1||s===2;
  const t=canvasTex(128,180,(g,w,h)=>{
    g.fillStyle='#f6f0de';g.fillRect(0,0,w,h);g.strokeStyle='#b8ae90';g.lineWidth=4;g.strokeRect(2,2,w-4,h-4);
    g.fillStyle=red?'#d0102a':'#101018';
    g.font='bold 54px "Arial Black",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(RANKN[r],w/2,52);
    g.font='bold 72px "DejaVu Sans","Segoe UI Symbol",Arial,sans-serif';g.fillText(SUITS[s],w/2,124);
  },0,0,true);
  cardTexCache[c]=t;return t;
}
let backTex=null;
function cardBackTex(){if(backTex)return backTex;backTex=canvasTex(64,90,(g,w,h)=>{g.fillStyle='#f4eedc';g.fillRect(0,0,w,h);
  for(let y=4;y<h-4;y++)for(let x=4;x<w-4;x++){g.fillStyle=((x+y)>>2)%2?'#7a1426':'#3a0812';g.fillRect(x,y,1,1);}
  g.fillStyle='#ffcf3a';px(g,10);g.textAlign='center';g.textBaseline='middle';g.fillText('SK',w/2,h/2);},0,0,true);return backTex;}
const cardEdge=new THREE.MeshLambertMaterial({color:0xe8e0c8});
const CARD_W=.27,CARD_H=.38;
function makeCard(parent){
  const m=new THREE.Mesh(new THREE.BoxGeometry(CARD_W,.006,CARD_H),[cardEdge,cardEdge,new THREE.MeshLambertMaterial({map:cardBackTex()}),new THREE.MeshLambertMaterial({map:cardBackTex()}),cardEdge,cardEdge]);
  m.userData.face=null;parent.add(m);return m;
}
function setCardFace(m,c){m.material[2].map=cardFaceTex(c);m.material[2].needsUpdate=true;m.userData.face=c;}
function setCardBack(m){m.material[2].map=cardBackTex();m.material[2].needsUpdate=true;m.userData.face=null;}

/* ---------- tweens ---------- */
const tweens=[];
function tween(dur,fn,done){tweens.push({t:0,dur,fn,done});}
function updTweens(dt){for(let i=tweens.length-1;i>=0;i--){const w=tweens[i];w.t+=dt;const k=Math.min(1,w.t/w.dur);w.fn(k);if(k>=1){tweens.splice(i,1);w.done&&w.done();}}}
const ease=t=>1-Math.pow(1-t,3);
function moveTo(obj,to,dur,arc,done){const from=obj.position.clone();tween(dur,k=>{const e=ease(k);obj.position.lerpVectors(from,to,e);if(arc)obj.position.y+=Math.sin(k*Math.PI)*arc;},done);}
function flipTo(obj,faceUp,dur,done){const a=obj.rotation.z,b=faceUp?0:Math.PI;const y0=obj.position.y;tween(dur,k=>{obj.rotation.z=a+(b-a)*ease(k);obj.position.y=y0+Math.sin(k*Math.PI)*.08;},()=>{obj.position.y=y0;done&&done();});}

/* ---------- sprite label ---------- */
function spriteLabel(w,h,scale){
  const t=canvasTex(w,h,null,0,0,false);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:true,fog:false}));
  s.scale.set(scale*w/h,scale,1);s.userData.tex=t;return s;
}
