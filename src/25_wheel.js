/* =========================================================
   ROULETTE-RAD: großes Rad mit Zahlen, Kugel läuft aus und fällt ins Fach
   Wird für das eigene Spiel und fürs Zuschauen benutzt.
   ========================================================= */
const WHEEL_DUR=6.5,W_STEP=TAU/37;
function newWheel(){return {a:0,b:-Math.PI/2,r:.65,anim:null,res:-1,resT:0,pk:-1};}
const W_LAND=.84;
const wEaseA=k=>1-Math.pow(1-k,2.6);
// idx = Position in ORDER, in die die Kugel fällt; am Ende steht das Fach oben unter dem Zeiger
function wheelStart(W,idx,elapsed){
  const a0=W.a,b0=W.b,base=-Math.PI/2-(idx+.5)*W_STEP;
  const a1=base+TAU*Math.ceil((a0+TAU*3-base)/TAU);
  const target=a0+(a1-a0)*wEaseA(W_LAND)+(idx+.5)*W_STEP;
  const b1=target-TAU*Math.ceil((target-(b0-TAU*7))/TAU);
  W.anim={t:0,dur:WHEEL_DUR,a0,a1,b0,b1,idx,lastP:-1};W.res=-1;W.pk=-1;
  if(elapsed>0)wheelStep(W,Math.min(elapsed,WHEEL_DUR-.05),false);
}
// liefert die gezogene Zahl, sobald die Kugel liegt, sonst null
function wheelStep(W,dt,sound){
  const A=W.anim;
  if(!A){W.a+=dt*.35;if(W.pk>=0)W.b=W.a+(W.pk+.5)*W_STEP;return null;}
  A.t+=dt;const k=Math.min(1,A.t/A.dur);
  W.a=A.a0+(A.a1-A.a0)*wEaseA(k);
  if(k<W_LAND){const kb=k/W_LAND;W.b=A.b0+(A.b1-A.b0)*(1-Math.pow(1-kb,1.8));
    const s=clamp((k-.5)/(W_LAND-.5),0,1);W.r=.88-.23*(s*s*(3-2*s))+(k>.55?Math.abs(Math.sin(k*70))*.04*(1-s*.6):0);}
  else{const d=(1-(k-W_LAND)/(1-W_LAND));W.b=W.a+(A.idx+.5)*W_STEP+Math.sin(k*90)*.06*d*d;W.r=.65;}
  if(sound&&k>.45&&k<W_LAND){const pk=Math.floor((((W.b-W.a)%TAU)+TAU)%TAU/W_STEP);if(pk!==A.lastP){A.lastP=pk;if(typeof SFX!=='undefined')SFX.tick();}}
  if(k>=1){W.anim=null;W.pk=A.idx;W.b=W.a+(A.idx+.5)*W_STEP;W.r=.65;W.res=ORDER[A.idx];W.resT=performance.now();return W.res;}
  return null;
}
function drawWheelCanvas(g,S,W){
  const c=S/2,R=S/2-2;g.clearRect(0,0,S,S);
  // Holzrand + Kugelbahn
  let gr=g.createRadialGradient(c,c,R*.85,c,c,R);gr.addColorStop(0,'#6a3a18');gr.addColorStop(1,'#2a1206');g.fillStyle=gr;g.beginPath();g.arc(c,c,R,0,TAU);g.fill();
  gr=g.createRadialGradient(c,c,R*.8,c,c,R*.93);gr.addColorStop(0,'#3a2412');gr.addColorStop(1,'#8a5a30');g.fillStyle=gr;g.beginPath();g.arc(c,c,R*.93,0,TAU);g.fill();
  g.strokeStyle='#c8a050';g.lineWidth=Math.max(1,S/180);g.beginPath();g.arc(c,c,R*.93,0,TAU);g.stroke();
  // Zahlenring + Fächer
  const fs=Math.max(7,Math.round(S*.042));
  for(let i=0;i<37;i++){const n=ORDER[i],a0=W.a+i*W_STEP,a1=a0+W_STEP;
    g.fillStyle=colOf(n);g.beginPath();g.arc(c,c,R*.82,a0,a1);g.arc(c,c,R*.68,a1,a0,true);g.closePath();g.fill();
    g.fillStyle=n===0?'#147a38':REDS.has(n)?'#9a1020':'#0a080c';g.beginPath();g.arc(c,c,R*.68,a0,a1);g.arc(c,c,R*.56,a1,a0,true);g.closePath();g.fill();
    g.save();g.translate(c+Math.cos(a0+W_STEP/2)*R*.75,c+Math.sin(a0+W_STEP/2)*R*.75);g.rotate(a0+W_STEP/2+Math.PI/2);
    g.fillStyle='#fff';g.font='bold '+fs+'px "DejaVu Sans",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(String(n),0,0);g.restore();}
  g.strokeStyle='#d8b860';g.lineWidth=Math.max(1,S/240);
  for(let i=0;i<37;i++){const a=W.a+i*W_STEP;g.beginPath();g.moveTo(c+Math.cos(a)*R*.56,c+Math.sin(a)*R*.56);g.lineTo(c+Math.cos(a)*R*.82,c+Math.sin(a)*R*.82);g.stroke();}
  g.beginPath();g.arc(c,c,R*.82,0,TAU);g.stroke();g.beginPath();g.arc(c,c,R*.68,0,TAU);g.stroke();
  // Kegel in der Mitte mit Drehkreuz
  gr=g.createRadialGradient(c-R*.1,c-R*.1,R*.05,c,c,R*.56);gr.addColorStop(0,'#a06a38');gr.addColorStop(1,'#3a1c0a');g.fillStyle=gr;g.beginPath();g.arc(c,c,R*.56,0,TAU);g.fill();
  g.strokeStyle='#e8d080';g.lineWidth=Math.max(2,S/70);g.lineCap='round';
  for(let i=0;i<4;i++){const a=W.a+i*Math.PI/2;g.beginPath();g.moveTo(c,c);g.lineTo(c+Math.cos(a)*R*.3,c+Math.sin(a)*R*.3);g.stroke();
    g.fillStyle='#fff2b0';g.beginPath();g.arc(c+Math.cos(a)*R*.3,c+Math.sin(a)*R*.3,R*.03,0,TAU);g.fill();}
  g.fillStyle='#f4e0a0';g.beginPath();g.arc(c,c,R*.07,0,TAU);g.fill();
  // Ergebnis groß in der Mitte
  if(W.res>=0&&!W.anim&&performance.now()-W.resT<6000){
    g.fillStyle=colOf(W.res);g.strokeStyle='#ffcf3a';g.lineWidth=Math.max(2,S/90);g.beginPath();g.arc(c,c,R*.26,0,TAU);g.fill();g.stroke();
    g.fillStyle='#fff';g.font='bold '+Math.round(S*.15)+'px "DejaVu Sans",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(String(W.res),c,c+S*.005);}
  // Zeiger oben
  g.fillStyle='#ffcf3a';g.strokeStyle='#000';g.lineWidth=1.5;g.beginPath();g.moveTo(c-S*.03,1);g.lineTo(c+S*.03,1);g.lineTo(c,S*.06);g.closePath();g.fill();g.stroke();
  // Kugel
  const bx=c+Math.cos(W.b)*R*W.r,by=c+Math.sin(W.b)*R*W.r,br=Math.max(2.5,R*.035);
  g.fillStyle='rgba(0,0,0,.45)';g.beginPath();g.arc(bx+br*.3,by+br*.4,br,0,TAU);g.fill();
  gr=g.createRadialGradient(bx-br*.4,by-br*.4,br*.1,bx,by,br);gr.addColorStop(0,'#ffffff');gr.addColorStop(1,'#a8a8b8');g.fillStyle=gr;g.beginPath();g.arc(bx,by,br,0,TAU);g.fill();
}
