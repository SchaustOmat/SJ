/* =========================================================
   ALLES SPITZE (Regeln wie bei Merkur): eine Walze, drei Cashpot-Türme.
   Kleeblatt 1–10×, Münze 3–50×, Marienkäfer 10–350× Einsatz (je 5 Stufen, Werte wie der Spielplan bei Level 20).
   Jeder Treffer hebt seinen Turm um eine Stufe. Der CASHPOT ist die Summe der Türme.
   Ganz oben = Direktgewinn. Sonne (Joker) hebt alle drei Türme. Teufel setzt alles auf 0.
   Alle drei Türme voll = 500× (statt 10 Action Games). Annahme bucht den Cashpot, die Türme fangen neu an.
   Quote ~97 % bei sofortigem Nehmen (tools: spitze3.js).
   ========================================================= */
const SPL={KLEE:[1,2,3,5,10],PFEN:[3,6,10,20,50],KAEF:[10,25,50,100,350]},SP_JP=500,SP_KEYS=['KLEE','PFEN','KAEF'];
const SP_NAME={KLEE:'KLEEBLATT',PFEN:'MÜNZE',KAEF:'MARIENKÄFER',KOEN:'SONNE',TEUF:'TEUFEL',LEER:'LEER'};
Object.assign(SYMNAME,SP_NAME);
// --- Symbole (48er Raster) ---
Object.assign(EXTRA_SYM,{
  KLEE(g){g.fillStyle='#0a3a08';g.fillRect(22,30,4,16);
    [[24,13],[35,24],[24,35],[13,24]].forEach(([x,y])=>{const gr=g.createRadialGradient(x-3,y-3,1,x,y,11);gr.addColorStop(0,'#b8ff80');gr.addColorStop(1,'#1a8a10');g.fillStyle=gr;
      g.beginPath();g.arc(x-4,y,7,0,TAU);g.arc(x+4,y,7,0,TAU);g.fill();});
    g.fillStyle='#e8ffb0';g.beginPath();g.arc(24,24,3,0,TAU);g.fill();},
  PFEN(g){const gr=g.createRadialGradient(18,16,2,24,24,21);gr.addColorStop(0,'#ffe0b0');gr.addColorStop(.5,'#d07a30');gr.addColorStop(1,'#6a3008');
    g.fillStyle=gr;g.beginPath();g.arc(24,24,20,0,TAU);g.fill();g.strokeStyle='#4a2004';g.lineWidth=2;g.stroke();
    g.strokeStyle='rgba(255,230,190,.7)';g.lineWidth=1.5;g.beginPath();g.arc(24,24,15,0,TAU);g.stroke();
    px(g,14);g.textAlign='center';g.textBaseline='middle';g.fillStyle='#4a2004';g.fillText('1',25,26);g.fillStyle='#ffe8c0';g.fillText('1',24,25);},
  KAEF(g){g.fillStyle='#111';g.beginPath();g.arc(24,12,8,0,TAU);g.fill();
    const gr=g.createRadialGradient(18,22,2,24,28,20);gr.addColorStop(0,'#ff8a7a');gr.addColorStop(.6,'#e01010');gr.addColorStop(1,'#6a0000');g.fillStyle=gr;
    g.beginPath();g.ellipse(24,29,17,15,0,0,TAU);g.fill();g.strokeStyle='#111';g.lineWidth=2;g.beginPath();g.moveTo(24,14);g.lineTo(24,44);g.stroke();
    g.fillStyle='#111';[[16,24],[32,24],[15,34],[33,34],[24,38]].forEach(([x,y])=>{g.beginPath();g.arc(x,y,3.2,0,TAU);g.fill();});
    g.fillStyle='#fff';g.beginPath();g.arc(21,10,1.5,0,TAU);g.arc(27,10,1.5,0,TAU);g.fill();},
  KOEN(g){// Joker: lachende Sonne
    g.fillStyle='#ffd020';for(let k=0;k<14;k++){const a=k/14*TAU;g.beginPath();g.moveTo(24+Math.cos(a)*12,24+Math.sin(a)*12);g.lineTo(24+Math.cos(a+.16)*22,24+Math.sin(a+.16)*22);g.lineTo(24+Math.cos(a+.3)*12,24+Math.sin(a+.3)*12);g.fill();}
    const gr=g.createRadialGradient(21,20,2,24,24,14);gr.addColorStop(0,'#ffffff');gr.addColorStop(.6,'#fff4c0');gr.addColorStop(1,'#f0c020');g.fillStyle=gr;g.beginPath();g.arc(24,24,13,0,TAU);g.fill();
    g.strokeStyle='#d09000';g.lineWidth=1.2;g.stroke();g.fillStyle='#2a1a08';g.beginPath();g.arc(19,21,1.8,0,TAU);g.arc(29,21,1.8,0,TAU);g.fill();
    g.strokeStyle='#2a1a08';g.lineWidth=1.6;g.beginPath();g.arc(24,25,6,.2,Math.PI-.2);g.stroke();},
  TEUF(g){const gr=g.createRadialGradient(20,20,2,24,26,20);gr.addColorStop(0,'#ff7a5a');gr.addColorStop(1,'#7a0000');g.fillStyle=gr;
    g.beginPath();g.ellipse(24,28,15,16,0,0,TAU);g.fill();
    g.fillStyle='#3a0000';g.beginPath();g.moveTo(12,18);g.lineTo(8,2);g.lineTo(18,13);g.fill();g.beginPath();g.moveTo(36,18);g.lineTo(40,2);g.lineTo(30,13);g.fill();
    g.fillStyle='#ffe040';g.beginPath();g.moveTo(15,24);g.lineTo(22,27);g.lineTo(15,29);g.fill();g.beginPath();g.moveTo(33,24);g.lineTo(26,27);g.lineTo(33,29);g.fill();
    g.strokeStyle='#1a0000';g.lineWidth=2;g.beginPath();g.moveTo(15,35);g.quadraticCurveTo(24,42,33,35);g.stroke();
    g.fillStyle='#fff';g.beginPath();g.moveTo(18,36);g.lineTo(20,39);g.lineTo(22,37);g.fill();g.beginPath();g.moveTo(30,36);g.lineTo(28,39);g.lineTo(26,37);g.fill();},
  LEER(){}
});
function spOf(m){return m.sp||(m.sp={lv:{KLEE:0,PFEN:0,KAEF:0},pot:0,jp:false,hit:{}});}
// Cashpot = Summe der Türme, die noch nicht voll sind (volle Türme sind schon als Direktgewinn ausgezahlt)
function spPot(S,bet){return SP_KEYS.reduce((a,k)=>a+(S.lv[k]>0&&S.lv[k]<5?SPL[k][S.lv[k]-1]*bet:0),0);}
// Ergebnis eines Drehs
function spitzeResult(m){
  const S=spOf(m),bet=totalBet(m),sym=m.grid[1][2];m.present=null;let direct=0;
  const up=k=>{if(S.lv[k]>=5)return 0;S.lv[k]++;S.hit[k]=now;fxBurst(m,SP_BX[k]+SP_BW/2,RY+88-S.lv[k]*13.6,14,{spd:90,life:.7});
    if(S.lv[k]===5){const v=SPL[k][4]*bet;direct+=v;return v;}return SPL[k][S.lv[k]-1]*bet;};
  if(sym==='KOEN'){SP_KEYS.forEach(up);m.msg='SONNE! ALLE TÜRME +1';SFX.big();fxFlash(m,.6,'255,220,120');fxShake(m,.4,true);}
  else if(sym==='TEUF'){const had=S.pot>0||SP_KEYS.some(k=>S.lv[k]);S.lv={KLEE:0,PFEN:0,KAEF:0};S.pot=0;
    m.msg=had?'TEUFEL! CASHPOT AUF 0':'TEUFEL';SFX.lose();if(had){SFX.boom();fxFlash(m,.7,'255,30,30');fxShake(m,.6,true);}}
  else if(SPL[sym]){const v=up(sym);m.msg=v?SP_NAME[sym]+' +'+fmt(v):SP_NAME[sym]+' (VOLL)';v>=bet*10?SFX.big():v?SFX.win():SFX.click();}
  else m.msg=S.pot>0?'CASHPOT NEHMEN ODER WEITER':'VIEL GLÜCK';
  let jp=0;if(SP_KEYS.every(k=>S.lv[k]>=5)){jp=SP_JP*bet;S.lv={KLEE:0,PFEN:0,KAEF:0};SFX.ausFan();startBigSp(m);}
  S.pot=spPot(S,bet);
  if(direct||jp){m.win=direct+jp;m.disp=0;m.state='count';m.timer=1.1;m.msg=jp?'ALLE DREI VOLL! +'+fmt(m.win):'DIREKTGEWINN '+fmt(direct);
    fxBurst(m,160,RY+60,40,{coin:true,sz:4,spd:150,up:90,life:1.2});m.dirty=true;m.topDirty=true;updateButtons(m);return;}
  m.state='idle';m.timer=m.auto?.55:0;
  if(m.auto&&S.pot>0)spitzeTake(m);
  m.dirty=true;m.topDirty=true;updateButtons(m);
}
function startBigSp(m){fxFlash(m,1);fxShake(m,.8,true);fxBurst(m,160,100,80,{coin:true,spd:200,up:110,sz:5,life:1.8});}
// Cashpot nehmen: wird zum Gewinn (danach Risiko oder Nehmen wie gewohnt); Leitern bleiben stehen
function spitzeTake(m){const S=spOf(m);if(S.pot<=0)return;m.win=S.pot;S.pot=0;SP_KEYS.forEach(k=>{if(S.lv[k]<5)S.lv[k]=0;});m.disp=0;m.state='count';m.timer=.9;m.msg='CASHPOT '+fmt(m.win);SFX.chip();
  fxBurst(m,68,RY+120,24,{coin:true,sz:4,spd:120,up:90,life:1.2});m.dirty=true;updateButtons(m);}
// --- Bildschirm ---
const SP_BX={KLEE:24,PFEN:116,KAEF:208},SP_BW=88;
function drawSpitze(m,g){
  const S=spOf(m),bet=totalBet(m),blink=Math.floor(now*3)%2;
  g.fillStyle='#000';g.fillRect(RX-3,RY-3,CW*5+6,CH*3+6);
  const bg=g.createLinearGradient(0,RY,0,RY+CH*3);bg.addColorStop(0,'#000000');bg.addColorStop(.55,'#3a0800');bg.addColorStop(1,'#c83a08');g.fillStyle=bg;g.fillRect(RX,RY,CW*5,CH*3);
  // Flammen wie im Original (bewegt)
  for(let i=0;i<22;i++){const x=RX+i*13,h=26+Math.sin(now*4+i*1.7)*10+Math.sin(now*7+i)*6;const fg=g.createLinearGradient(0,RY+CH*3-h,0,RY+CH*3);fg.addColorStop(0,'rgba(255,200,40,0)');fg.addColorStop(.5,'rgba(255,120,20,.55)');fg.addColorStop(1,'rgba(255,230,120,.8)');g.fillStyle=fg;g.beginPath();g.moveTo(x,RY+CH*3);g.quadraticCurveTo(x+7,RY+CH*3-h*1.2,x+14,RY+CH*3);g.fill();}
  m.dirty=true;
  // drei Gewinntafeln oben nebeneinander
  const COL={KLEE:'#3adf5a',PFEN:'#ff9a40',KAEF:'#ff3a3a'};
  SP_KEYS.forEach(k=>{const x=SP_BX[k],w=SP_BW,lv=S.lv[k],c=COL[k],rh=12.6,full=lv>=5;
    g.fillStyle='rgba(0,0,0,.45)';g.fillRect(x-2,RY+1,w+4,89);g.strokeStyle=full&&blink?c:'#3a2c52';g.lineWidth=1;g.strokeRect(x-1.5,RY+1.5,w+3,88);
    g.drawImage(symCanvas(k),x+3,RY+3,16,16);
    px(g,5);g.textAlign='left';g.textBaseline='middle';g.fillStyle=c;fitL(g,SP_NAME[k],x+22,RY+11,w-38,5);
    // Pfeil: leuchtet, wenn die Tafel voll ist
    g.fillStyle=full?(blink?'#ffd23a':'#fff'):'#2a2238';g.beginPath();g.moveTo(x+w-8,RY+4);g.lineTo(x+w-1,RY+15);g.lineTo(x+w-15,RY+15);g.closePath();g.fill();
    for(let i=0;i<5;i++){const y=RY+88-(i+1)*(rh+1),on=i<lv,cur=i===lv-1,fl=cur&&S.hit[k]&&now-S.hit[k]<.6;
      const rg=g.createLinearGradient(0,y,0,y+rh);if(on){rg.addColorStop(0,fl&&blink?'#ffffff':'#fff2a0');rg.addColorStop(1,c);}else{rg.addColorStop(0,'#2a2238');rg.addColorStop(1,'#120c1e');}
      g.fillStyle=rg;g.fillRect(x+2,y,w-4,rh);if(cur){g.strokeStyle='#fff';g.lineWidth=1.2;g.strokeRect(x+2.5,y+.5,w-5,rh-1);}
      const t=fmt(SPL[k][i]*bet).replace(' €','');px(g,Math.min(7,Math.floor((w-10)/t.length)));g.textAlign='center';g.fillStyle=on?'#1a0e00':'#9b8fb3';g.fillText(t,x+w/2,y+rh/2+1);}});
  // großes Walzenfenster unten in der Mitte
  const wx=116,ww=88,wy=RY+94,wh=58,r=m.reels[2],St=G_strip(m),L=St.length,fl=Math.floor(r.pos),off=r.pos-fl,cell=46;
  g.fillStyle='#000';g.fillRect(wx-4,wy-4,ww+8,wh+8);
  const fr=g.createLinearGradient(0,wy-4,0,wy+wh+4);fr.addColorStop(0,'#ffe060');fr.addColorStop(.5,'#ff6a10');fr.addColorStop(1,'#c01808');g.strokeStyle=fr;g.lineWidth=4;g.shadowColor='#ff6a10';g.shadowBlur=10;g.strokeRect(wx-2.5,wy-2.5,ww+5,wh+5);g.shadowBlur=0;
  g.save();g.beginPath();g.rect(wx,wy,ww,wh);g.clip();
  const rg=g.createLinearGradient(0,wy,0,wy+wh);rg.addColorStop(0,'#000');rg.addColorStop(.5,'#1a0a04');rg.addColorStop(1,'#000');g.fillStyle=rg;g.fillRect(wx,wy,ww,wh);
  // Die Walze zeigt nur Symbole; ein "LEER"-Feld ist die Lücke zwischen zwei Symbolen (dort bleibt sie halb versetzt stehen)
  const VM=spVis(St),c=spVisPos(VM,r.pos),j0=Math.floor(c)-1;
  for(let j=j0;j<=j0+3;j++){const sym=VM.vs[((j%VM.n)+VM.n)%VM.n],y=wy+wh/2-cell/2+(j-c)*cell,im=symCanvas(sym),z=cell*.92;
    if(r.spin&&Math.abs(r.vel||0)>9){g.globalAlpha=.35;g.drawImage(im,wx+(ww-z)/2,y+(cell-z)/2-12,z,z*1.35);g.globalAlpha=.85;}
    else if(!r.spin&&Math.abs(j-c)<.01){const p=1+Math.abs(Math.sin(now*5))*.06;g.drawImage(im,wx+(ww-z*p)/2,y+(cell-z*p)/2,z*p,z*p);continue;}
    g.drawImage(im,wx+(ww-z)/2,y+(cell-z)/2,z,z);g.globalAlpha=1;}
  g.restore();g.globalAlpha=1;
  // Cashpot links, Jackpot rechts
  const box=(x,label,val,on,col)=>{g.fillStyle='#000';g.fillRect(x,wy-2,SP_BW,wh+4);g.strokeStyle=on?(blink?'#ffd23a':col):'#3a2c52';g.lineWidth=2;g.strokeRect(x+1,wy-1,SP_BW-2,wh+2);
    px(g,7);g.textAlign='center';g.textBaseline='middle';g.fillStyle='#9b8fb3';g.fillText(label,x+SP_BW/2,wy+10);
    const t=fmt(val).replace(' €','');px(g,Math.min(13,Math.floor((SP_BW-8)/t.length)));g.fillStyle=on?'#ffd23a':'#e8e0cc';g.fillText(t,x+SP_BW/2,wy+34);};
  box(24,'CASHPOT',S.pot,S.pot>0,'#3adf5a');box(208,'ALLE 3 VOLL',SP_JP*bet,SP_KEYS.every(k=>S.lv[k]>=4),'#ff3a3a');
}
function G_strip(m){return m.G.strips[2];}
// Abbildung Walzenposition -> Anzeigeposition (nur Symbole; Lücken liegen genau zwischen zwei Symbolen)
const SPVC=new WeakMap();
function spVis(St){let M=SPVC.get(St);if(M)return M;const vs=[],V=[];let n=0;
  St.forEach(x=>{if(x==='LEER')V.push(n-.5);else{V.push(n);vs.push(x);n++;}});M={vs,V,n,L:St.length};SPVC.set(St,M);return M;}
function spVisPos(M,p){const L=M.L,i=Math.floor(p),f=p-i,wrap=Math.floor(i/L),a=((i%L)+L)%L,b=(a+1)%L;
  let va=M.V[a],vb=M.V[b];if(b<a)vb+=M.n;return wrap*M.n+va+(vb-va)*f;}
function drawSpitzeInfo(m,g){
  g.fillStyle='rgba(10,6,16,.95)';g.fillRect(RX-3,RY-3,CW*5+6,CH*3+6);g.fillStyle='#ffd23a';
  const L=['EINE WALZE · DREI CASHPOT-TÜRME','KLEEBLATT, MÜNZE, KÄFER: TURM +1 STUFE','CASHPOT = SUMME DER TÜRME',
    'TURM GANZ OBEN: DIREKTGEWINN','SONNE (JOKER): ALLE DREI TÜRME +1','TEUFEL: CASHPOT AUF 0','ALLE DREI VOLL: 500× EINSATZ',
    'ANNAHME BUCHT DEN CASHPOT (AUTO NIMMT SOFORT)','QUOTE CA. 97 % BEI SOFORTIGEM NEHMEN'];
  L.forEach((t,i)=>{g.fillStyle=i===0?'#ffd23a':i>=7?'#9b8fb3':'#f4f0e8';fitL(g,t,RX+4,RY+10+i*16,CW*5-8,7);});
}
