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
let AC=null,master=null,muted=false,verb=null,amb=null;
function initAudio(){
  try{
    AC=new (window.AudioContext||window.webkitAudioContext)();
    // Kompressor hält alles zusammen (laute Gewinne übersteuern nicht, leise Töne bleiben hörbar)
    master=AC.createGain();master.gain.value=.5;const comp=AC.createDynamicsCompressor();
    comp.threshold.value=-18;comp.knee.value=14;comp.ratio.value=3.5;comp.attack.value=.004;comp.release.value=.2;master.connect(comp);comp.connect(AC.destination);
    // Raumhall der Spielhalle (selbst erzeugte Hallfahne), Glocken und Melodien bekommen etwas davon ab
    const sr=AC.sampleRate,len=sr*1.9|0,ir=AC.createBuffer(2,len,sr);
    for(let ch=0;ch<2;ch++){const a=ir.getChannelData(ch);for(let i=0;i<len;i++){const t=i/len;a[i]=i<sr*.015?0:(Math.random()*2-1)*Math.pow(1-t,3.4)*(1+.3*Math.sin(i*.0007*(ch+1)));}}
    const cv=AC.createConvolver();cv.buffer=ir;verb=AC.createGain();verb.gain.value=.25;
    const hp=AC.createBiquadFilter();hp.type='highpass';hp.frequency.value=300;verb.connect(hp);hp.connect(cv);cv.connect(master);
    // Atmosphäre: leises Stimmengemurmel (gefiltertes rosa Rauschen) statt Brummen
    const nb=AC.createBuffer(1,sr*4,sr),d=nb.getChannelData(0);let b0=0,b1=0,b2=0;
    for(let i=0;i<d.length;i++){const w=Math.random()*2-1;b0=.997*b0+w*.03;b1=.985*b1+w*.06;b2=.95*b2+w*.1;d[i]=(b0+b1+b2)*.35;}
    const src=AC.createBufferSource();src.buffer=nb;src.loop=true;const bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=520;bp.Q.value=.8;
    amb=AC.createGain();amb.gain.value=.03;src.connect(bp);bp.connect(amb);amb.connect(master);src.start();
    const l=AC.createOscillator(),lg=AC.createGain();l.frequency.value=.11;lg.gain.value=170;l.connect(lg);lg.connect(bp.frequency);l.start();
    setInterval(ambTick,1300);
  }catch(e){AC=null;}
}
// Ferne Automaten in der Halle: ab und zu leise Gewinnglöckchen mit viel Hall; am Automaten wird es ruhiger
function ambTick(){if(!AC||muted)return;const sit=typeof focus!=='undefined'&&focus;
  if(amb)amb.gain.setTargetAtTime(sit?.012:.03,AC.currentTime,.6);
  if(sit||Math.random()>.28)return;const base=[79,81,84,86][Math.random()*4|0],n=3+(Math.random()*4|0);
  for(let k=0;k<n;k++)farBell(NOTE(base+[0,4,7,12,7,12,16][k]),.5,.018,k*.09);}
function farBell(fr,d,v,when){if(!AC||!verb)return;const t=AC.currentTime+(when||0);const o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.value=fr;
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+.005);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(verb);const g2=AC.createGain();g2.gain.value=.25;g.connect(g2);g2.connect(master);o.start(t);o.stop(t+d+.05);}
function tone(fr,d,type,v,when,slide){
  if(!AC||muted)return;const t=AC.currentTime+(when||0);
  const o=AC.createOscillator(),g=AC.createGain();o.type=type||'square';o.frequency.setValueAtTime(fr,t);
  if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+d);
  g.gain.setValueAtTime(v||.12,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  o.connect(g);g.connect(master);o.start(t);o.stop(t+d+.03);
}
// Glocke (FM): heller Spielhallen-"Ding"-Klang wie bei den Merkur-Geräten (selbst erzeugt, keine Originaldateien)
function bell(fr,d,v,when,ratio){
  if(!AC||muted)return;const t=AC.currentTime+(when||0);
  const c=AC.createOscillator(),m=AC.createOscillator(),mg=AC.createGain(),g=AC.createGain();
  c.type='sine';m.type='sine';c.frequency.value=fr;m.frequency.value=fr*(ratio||3.5);
  mg.gain.setValueAtTime(fr*2.2,t);mg.gain.exponentialRampToValueAtTime(fr*.05,t+d);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v||.12,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  m.connect(mg);mg.connect(c.frequency);c.connect(g);g.connect(master);if(verb)g.connect(verb);c.start(t);m.start(t);c.stop(t+d+.05);m.stop(t+d+.05);
}
// weicher Synth-Ton (gefilterte Rechteckwelle) für Melodien und Fanfaren
function soft(fr,d,v,when,type){
  if(!AC||muted)return;const t=AC.currentTime+(when||0);
  const o=AC.createOscillator(),f=AC.createBiquadFilter(),g=AC.createGain();o.type=type||'square';o.frequency.value=fr;
  f.type='lowpass';f.frequency.setValueAtTime(fr*6,t);f.frequency.exponentialRampToValueAtTime(fr*1.5,t+d);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v||.08,t+.01);g.gain.setValueAtTime(v||.08,t+d*.6);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  o.connect(f);f.connect(g);g.connect(master);if(verb&&d>.1)g.connect(verb);o.start(t);o.stop(t+d+.05);
}
const NOTE=n=>440*Math.pow(2,(n-69)/12); // MIDI-Nummer -> Hz
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
  count(){bell(NOTE(96+(Math.random()*3|0)*2),.06,.035);}, // schnelles helles Hochzählen
  ding(){tone(1318,.7,'sine',.2);tone(1046,.9,'sine',.16,.28);},
  win(){[72,76,79,84].forEach((n,i)=>{bell(NOTE(n+12),.35,.09,i*.075);soft(NOTE(n),.12,.05,i*.075);});bell(NOTE(91),.6,.07,.33);},
  big(){[[72,0],[76,.1],[79,.2],[84,.3],[79,.45],[84,.55],[88,.65],[91,.8]].forEach(([n,t])=>{soft(NOTE(n),.2,.07,t);bell(NOTE(n+12),.5,.07,t);});soft(NOTE(48),1.1,.06,.8,'sawtooth');bell(NOTE(96),1.2,.08,.8);},
  lose(){tone(220,.35,'square',.07,0,90);},
  clunk(){noise(.06,.14,600);tone(140,.06,'square',.06);},
  reelStart(){noise(.12,.06,1400);soft(NOTE(60),.06,.04);soft(NOTE(67),.06,.04,.05);}, // kurzes Start-Signal
  tease(i){for(let k=0;k<8;k++)bell(NOTE(79+i*2+(k%2)*5),.12,.05,k*.06);}, // Spannungs-Triller wie bei Merkur
  scatter(i){const n=[84,88,91,96,100][Math.min(4,Math.max(0,i-1))];bell(NOTE(n),.7,.13);bell(NOTE(n+7),.5,.06,.05);}, // Scatter: aufsteigende Glocken
  hum(){tone(65,3,'sawtooth',.06,0,95);noise(2.8,.03,120);},
  doors(){noise(1,.05,400);},
  fsIntro(){[[67,0],[72,.14],[76,.28],[79,.42],[76,.6],[79,.72],[84,.86]].forEach(([n,t])=>{soft(NOTE(n),.24,.08,t);bell(NOTE(n+12),.4,.06,t);});soft(NOTE(48),1.3,.07,.86,'sawtooth');soft(NOTE(55),1.3,.05,.86,'sawtooth');bell(NOTE(96),1.4,.09,.86);},
  expand(){for(let k=0;k<10;k++)bell(NOTE(72+k*2),.25,.07,k*.045);},
  // Leiter: hoch = hell und kurz (je Stufe etwas höher), runter = zwei fallende Töne, verloren = tiefer Abschluss
  ladUp(k){const b=81+Math.min(12,Math.max(0,k||0));soft(NOTE(b+12),.09,.06,0,'square');bell(NOTE(b+19),.35,.07,.05);},
  ladDown(){soft(NOTE(81),.08,.05,0,'square');soft(NOTE(76),.14,.05,.08,'square');},
  ladZero(){soft(NOTE(69),.12,.06,0,'square');soft(NOTE(64),.14,.06,.11,'square');soft(NOTE(57),.35,.06,.24,'square');},
  gambleTick(on){ // Leiter-Blinken nach dem Video: Hoch-Phase A6 mit kurzem H5, Runter-Phase schnelle Folge D6-A5-C6-D6-F5-D6-A5 und D6
    if(on){soft(NOTE(93),.16,.05,0,'square');soft(NOTE(71),.035,.03,.07,'square');return;}
    [[86,.05],[81,.012],[84,.015],[86,.012],[77,.04],[86,.03],[81,.08],[86,.14]].reduce((t,[n,d])=>{soft(NOTE(n),d+.01,.045,t,'square');return t+d;},0);},
  reelStop(i){tone(150-i*6,.09,'sine',.22,0,70);noise(.025,.12,1800+i*120);}, // dumpfes Holz-Tock wie beim Walzenstopp
  boom(){noise(.5,.22,160);tone(80,.55,'sine',.3,0,32);},
  whoosh(){noise(.3,.12,1800);tone(300,.3,'sawtooth',.03,0,1200);},
  sparkle(){[2093,2637,3136,4186].forEach((f,i)=>tone(f,.07,'square',.025,i*.035));},
  tierUp(i){[523,659,784,1046,1318].forEach((f,k)=>tone(f*(1+i*.2),.15,'square',.09,k*.055));noise(.35,.14,500);tone(70,.4,'sine',.25,0,40);},
  riseTick(p){tone(500+p*1600,.03,'square',.035);},
  heart(){tone(58,.13,'sine',.4);tone(52,.16,'sine',.32,.17);},
  coinUp(i){bell(NOTE(83+Math.min(i,24)),.18,.06);},
  ausTick(k){tone(1000+k*600,.035,'square',.05);}, // Ausspielung: helle Ticks, Tonhöhe steigt (k = 0..1)
  ausFan(){tone(1760,.06,'square',.06);[[587,.06],[698,.06],[880,.09],[1175,.12]].reduce((t,[f,d])=>{tone(f,d,'square',.07,t);return t+d+.005;},.07);}, // hoher Pieps, dann D-F-A-D
  unlock(){tone(523,.08,'square',.07);tone(784,.08,'square',.07,.08);tone(1046,.18,'square',.08,.16);noise(.08,.12,2500,.02);},
  wildLand(){bell(NOTE(67),.8,.12,0,1.5);bell(NOTE(91),.4,.05,.04);noise(.1,.06,4000);},
  spinTick(){noise(.018,.035,2600);} // leises Rattern der laufenden Walzen
};
let beatTimer=null,beatN=0;
function setBeat(on){
  if(beatTimer){clearInterval(beatTimer);beatTimer=null;}
  if(!on)return;
  beatTimer=setInterval(()=>{if(!AC||muted||focus||(typeof RADIO!=='undefined'&&RADIO.st&&RADIO.st.p<0))return;beatN++;tone(62,.18,'sine',.2,0,38);if(beatN%2===0)noise(.04,.03,7000,.25);if(beatN%4===2)tone(110,.12,'square',.04,.25);},500);
}

/* ---------- three ---------- */
const cv=$('#game');
const renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(1);
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x07050c);
scene.fog=new THREE.Fog(0x0a0712,4,24);
const camera=new THREE.PerspectiveCamera(70,1,.03,60);
camera.rotation.order='YXZ';
const snapRes={value:new THREE.Vector2(160,120)};
// früher PS1-Wackeln der Ecken (Vertex-Snapping); für die edle Optik aus
const PSX_SNAP=false;
function psx(m){
  if(!PSX_SNAP)return m;
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
// Bildschirmschrift: klare, kräftige Schmalschrift wie an echten Geräten (Größen wie früher bei der Pixelschrift, daher ×1,5)
const SCR_FONT='"Barlow Condensed","Arial Narrow",Arial,sans-serif';
function px(g,size,w){g.font=(w||700)+' '+(Math.round(size*3)/2)+'px '+SCR_FONT;}
// größte Schrift bis max, bei der t in die Breite w passt
function pxFit(g,t,w,max,min,wt){let s=max;px(g,s,wt);while(s>(min||4)&&g.measureText(t).width>w){s-=.5;px(g,s,wt);}return s;}

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
