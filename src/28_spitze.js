/* =========================================================
   ALLES SPITZE (nach dem Merkur-Klassiker): eine Walze, drei Gewinnleitern.
   Kleeblatt 1–10×, Glückspfennig 3–50×, Marienkäfer 10–350× Einsatz (je 5 Stufen).
   Jeder Treffer rückt seine Leiter vor und zahlt den Stufenwert in den CASHPOT.
   Oben zahlt jeder weitere Treffer den Höchstwert. König hebt alle drei Leitern,
   Teufel löscht Leitern und Cashpot. Alle drei oben = Jackpot 500×.
   Cashpot jederzeit nehmen (danach Risiko möglich). Quote ~97 % bei sofortigem Nehmen.
   ========================================================= */
const SPL={KLEE:[1,2,3,5,10],PFEN:[3,6,10,20,50],KAEF:[10,25,50,100,350]},SP_JP=500,SP_KEYS=['KLEE','PFEN','KAEF'];
const SP_NAME={KLEE:'KLEEBLATT',PFEN:'GLÜCKSPFENNIG',KAEF:'MARIENKÄFER',KOEN:'KÖNIG',TEUF:'TEUFEL',LEER:'LEER'};
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
  KOEN(g){const gr=g.createLinearGradient(0,4,0,22);gr.addColorStop(0,'#fff6a0');gr.addColorStop(1,'#c88a10');g.fillStyle=gr;
    g.beginPath();g.moveTo(8,22);g.lineTo(10,6);g.lineTo(17,14);g.lineTo(24,3);g.lineTo(31,14);g.lineTo(38,6);g.lineTo(40,22);g.closePath();g.fill();g.strokeStyle='#6a4000';g.lineWidth=1.2;g.stroke();
    g.fillStyle='#e01020';[[10,6],[24,3],[38,6]].forEach(([x,y])=>{g.beginPath();g.arc(x,y,2.4,0,TAU);g.fill();});
    const fg=g.createLinearGradient(0,22,0,44);fg.addColorStop(0,'#ffd8a8');fg.addColorStop(1,'#c88a5a');g.fillStyle=fg;g.beginPath();g.ellipse(24,32,12,12,0,0,TAU);g.fill();
    g.fillStyle='#1a1010';g.fillRect(18,29,3,3);g.fillRect(27,29,3,3);g.fillStyle='#b01818';g.fillRect(20,37,8,2);
    g.fillStyle='#e8e0d0';g.beginPath();g.moveTo(14,36);g.quadraticCurveTo(24,50,34,36);g.quadraticCurveTo(24,43,14,36);g.fill();jokerBanner(g);},
  TEUF(g){const gr=g.createRadialGradient(20,20,2,24,26,20);gr.addColorStop(0,'#ff7a5a');gr.addColorStop(1,'#7a0000');g.fillStyle=gr;
    g.beginPath();g.ellipse(24,28,15,16,0,0,TAU);g.fill();
    g.fillStyle='#3a0000';g.beginPath();g.moveTo(12,18);g.lineTo(8,2);g.lineTo(18,13);g.fill();g.beginPath();g.moveTo(36,18);g.lineTo(40,2);g.lineTo(30,13);g.fill();
    g.fillStyle='#ffe040';g.beginPath();g.moveTo(15,24);g.lineTo(22,27);g.lineTo(15,29);g.fill();g.beginPath();g.moveTo(33,24);g.lineTo(26,27);g.lineTo(33,29);g.fill();
    g.strokeStyle='#1a0000';g.lineWidth=2;g.beginPath();g.moveTo(15,35);g.quadraticCurveTo(24,42,33,35);g.stroke();
    g.fillStyle='#fff';g.beginPath();g.moveTo(18,36);g.lineTo(20,39);g.lineTo(22,37);g.fill();g.beginPath();g.moveTo(30,36);g.lineTo(28,39);g.lineTo(26,37);g.fill();},
  LEER(){}
});
function spOf(m){return m.sp||(m.sp={lv:{KLEE:0,PFEN:0,KAEF:0},pot:0,jp:false,hit:{}});}
// Ergebnis eines Drehs
function spitzeResult(m){
  const S=spOf(m),bet=totalBet(m),sym=m.grid[1][2];m.present=null;
  const up=k=>{if(S.lv[k]<5)S.lv[k]++;const v=SPL[k][S.lv[k]-1]*bet;S.pot+=v;S.hit[k]=now;
    fxBurst(m,SP_BX[k]+SP_BW/2,RY+88-S.lv[k]*13.6,14,{spd:90,life:.7});return v;};
  if(sym==='KOEN'){let s=0;SP_KEYS.forEach(k=>s+=up(k));m.msg='KÖNIG! ALLE LEITERN +'+fmt(s);SFX.big();fxFlash(m,.6,'255,220,120');fxShake(m,.4,true);}
  else if(sym==='TEUF'){const had=S.pot>0||SP_KEYS.some(k=>S.lv[k]);S.lv={KLEE:0,PFEN:0,KAEF:0};S.pot=0;S.jp=false;
    m.msg=had?'TEUFEL! LEITERN UND CASHPOT WEG':'TEUFEL';SFX.lose();if(had){SFX.boom();fxFlash(m,.7,'255,30,30');fxShake(m,.6,true);}}
  else if(SPL[sym]){const v=up(sym);m.msg=SP_NAME[sym]+(S.lv[sym]>=5?' OBEN!':'')+' +'+fmt(v);v>=bet*10?SFX.big():SFX.win();if(S.lv[sym]>=5)fxFlash(m,.35,'255,230,140');}
  else m.msg=S.pot>0?'CASHPOT NEHMEN ODER WEITER':'VIEL GLÜCK';
  if(!S.jp&&SP_KEYS.every(k=>S.lv[k]>=5)){S.jp=true;S.pot+=SP_JP*bet;m.msg='JACKPOT! +'+fmt(SP_JP*bet);SFX.ausFan();startBigSp(m);}
  m.state='idle';m.timer=m.auto?.55:0;
  if(m.auto&&S.pot>=10*bet)spitzeTake(m);
  m.dirty=true;m.topDirty=true;updateButtons(m);
}
function startBigSp(m){fxFlash(m,1);fxShake(m,.8,true);fxBurst(m,160,100,80,{coin:true,spd:200,up:110,sz:5,life:1.8});}
// Cashpot nehmen: wird zum Gewinn (danach Risiko oder Nehmen wie gewohnt); Leitern bleiben stehen
function spitzeTake(m){const S=spOf(m);if(S.pot<=0)return;m.win=S.pot;S.pot=0;m.disp=0;m.state='count';m.timer=.9;m.msg='CASHPOT '+fmt(m.win);SFX.chip();
  fxBurst(m,68,RY+120,24,{coin:true,sz:4,spd:120,up:90,life:1.2});m.dirty=true;updateButtons(m);}
// --- Bildschirm ---
const SP_BX={KLEE:24,PFEN:116,KAEF:208},SP_BW=88;
function drawSpitze(m,g){
  const S=spOf(m),bet=totalBet(m),blink=Math.floor(now*3)%2;
  g.fillStyle='#000';g.fillRect(RX-3,RY-3,CW*5+6,CH*3+6);
  const bg=g.createLinearGradient(0,RY,0,RY+CH*3);bg.addColorStop(0,'#14204a');bg.addColorStop(1,'#060a1a');g.fillStyle=bg;g.fillRect(RX,RY,CW*5,CH*3);
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
  const fr=g.createLinearGradient(0,wy-4,0,wy+wh+4);fr.addColorStop(0,'#fff0a0');fr.addColorStop(1,'#8a5a08');g.strokeStyle=fr;g.lineWidth=3;g.strokeRect(wx-2.5,wy-2.5,ww+5,wh+5);
  g.save();g.beginPath();g.rect(wx,wy,ww,wh);g.clip();
  const rg=g.createLinearGradient(0,wy,0,wy+wh);rg.addColorStop(0,'#2a2450');rg.addColorStop(.5,'#f4f0ff');rg.addColorStop(1,'#2a2450');g.fillStyle=rg;g.fillRect(wx,wy,ww,wh);
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
  box(24,'CASHPOT',S.pot,S.pot>0,'#3adf5a');box(208,'JACKPOT',SP_JP*bet,S.jp,'#ff3a3a');
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
  const L=['EINE WALZE · DREI GEWINNLEITERN','KLEEBLATT, PFENNIG, KÄFER: LEITER +1, WERT IN DEN CASHPOT','OBEN ZAHLT JEDER WEITERE TREFFER DEN HÖCHSTWERT',
    'KÖNIG: ALLE DREI LEITERN +1','TEUFEL: LEITERN UND CASHPOT AUF 0','ALLE DREI OBEN: JACKPOT 500× EINSATZ','CASHPOT JEDERZEIT NEHMEN (DANN RISIKO MÖGLICH)',
    'AUTO NIMMT DEN CASHPOT AB 10× EINSATZ','QUOTE CA. 97 % BEI SOFORTIGEM NEHMEN'];
  L.forEach((t,i)=>{g.fillStyle=i===0?'#ffd23a':i>=7?'#9b8fb3':'#f4f0e8';fitL(g,t,RX+4,RY+10+i*16,CW*5-8,7);});
}
