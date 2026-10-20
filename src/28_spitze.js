/* =========================================================
   ALLES SPITZE (Regeln wie bei Merkur): eine Walze, drei Leitern (Kleeblatt, Münze, Marienkäfer).
   Kleeblatt 1–10×, Münze 3–50×, Marienkäfer 10–350× Einsatz (je 5 Stufen, Werte wie der Spielplan bei Level 20).
   Jeder Treffer hebt seine Leiter um eine Stufe. CASHPOT = Summe der Leitern, die noch nicht voll sind.
   Leiter oben angekommen = Höchstgewinn direkt; sie BLEIBT voll und zahlt bei jedem weiteren Treffer
   ihres Symbols wieder den Höchstgewinn, bis der Teufel kommt (Wunsch vom Nutzer).
   Sonne (Joker) hebt alle drei Leitern. Teufel setzt alles auf 0. Alle drei voll = 500×.
   Annahme bucht den Cashpot, nur die nicht vollen Leitern fangen neu an. Dauerstart stoppt ab einstellbarem Cashpot.
   Einsatz (auch mit Leiter-/Karte-Knopf) nur bei leeren Leitern änderbar, sonst ändern sich die Werte.
   Quote (Walze LEER 185, Klee 95, Münze 38, Käfer 10, Sonne 4, Teufel 45; tools/spitze_sim.js 1):
   sofort nehmen ~97 %, ab 10× ~98 %, ab 50× ~97 %, nie nehmen ~95 %.
   Bildschirm wie das echte Gerät: Titel im Feuer, Joker links, Walze im Flammenrahmen, Teufel rechts,
   Cashpot-Leiste mit Dauerstart-Stopp und Annahme; die drei Leitern stehen im Aufsatz.
   Alles Statische wird einmal vorgezeichnet (sonst ruckelt es auf dem Handy).
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
// Cashpot = Summe der Leitern, die noch nicht voll sind (volle zahlen ihren Höchstwert direkt aus)
function spPot(S,bet){return SP_KEYS.reduce((a,k)=>a+(S.lv[k]>0&&S.lv[k]<5?SPL[k][S.lv[k]-1]*bet:0),0);}
function spEmpty(m){const S=m.sp;return !S||SP_KEYS.every(k=>!S.lv[k]);}
// Dauerstart stoppt ab … (Vielfache vom Einsatz, 0 = aus)
const SP_STOP=[0,2,5,10,20,50,100];
function spStopIdx(m){return m.spStop===undefined?3:m.spStop;}
function spStopVal(m){return SP_STOP[spStopIdx(m)]*totalBet(m);}
// Ergebnis eines Drehs
function spitzeResult(m){
  const S=spOf(m),bet=totalBet(m),sym=m.grid[1][2];m.present=null;let direct=0;const full=[];
  const up=k=>{S.hit[k]=now;
    if(S.lv[k]>=5){direct+=SPL[k][4]*bet;S.again=k;return;} // volle Leiter getroffen: Höchstgewinn nochmal, sie bleibt voll
    S.lv[k]++;if(S.lv[k]===5){full.push(k);direct+=SPL[k][4]*bet;}};
  if(sym==='KOEN'){SP_KEYS.forEach(up);m.msg=full.length?'SONNE! '+full.map(k=>SP_NAME[k]).join(' + ')+' VOLL!':'SONNE! ALLE LEITERN +1';
    SFX.big();fxFlash(m,.6,'255,220,120');fxShake(m,.4,true);S.flash='KOEN';S.flashT=now;}
  else if(sym==='TEUF'){const had=spPot(S,bet)>0;S.lv={KLEE:0,PFEN:0,KAEF:0};
    m.msg=had?'TEUFEL! CASHPOT AUF 0':'TEUFEL';SFX.lose();S.flash='TEUF';S.flashT=now;if(had){SFX.boom();fxFlash(m,.7,'255,30,30');fxShake(m,.6,true);}}
  else if(SPL[sym]){up(sym);fxBurst(m,160,SP_WIN.y+SP_WIN.h/2,14,{spd:90,life:.7});
    m.msg=full.length?SP_NAME[sym]+'-LEITER VOLL!':direct?SP_NAME[sym]+' NOCHMAL: HÖCHSTGEWINN!':SP_NAME[sym]+' · STUFE '+S.lv[sym];
    if(full.length)SFX.tierUp(1);else if(direct)SFX.big();else SFX.win();}
  else m.msg=spPot(S,bet)>0?'ANNAHME ODER WEITER':'VIEL GLÜCK';
  let jp=0;if(SP_KEYS.every(k=>S.lv[k]>=5)){jp=SP_JP*bet;S.lv={KLEE:0,PFEN:0,KAEF:0};SFX.ausFan();startBigSp(m);}
  S.pot=spPot(S,bet);m.topDirty=true;
  if(direct||jp){m.win=direct+jp;m.disp=0;m.state='count';m.timer=1.1;m.msg=jp?'ALLE DREI VOLL! +'+fmt(m.win):(full.length?'LEITER VOLL · ':'')+'DIREKTGEWINN '+fmt(m.win);
    fxBurst(m,160,SP_WIN.y+SP_WIN.h/2,40,{coin:true,sz:4,spd:150,up:90,life:1.2});if(m.win>=bet*10)startBig(m,m.win);m.dirty=true;updateButtons(m);return;}
  m.state='idle';m.timer=m.auto?.55:0;
  // Dauerstart stoppt ab dem eingestellten Cashpot
  const lim=spStopVal(m);if(m.auto&&lim>0&&S.pot>=lim){m.auto=false;m.timer=0;m.msg='DAUERSTART GESTOPPT · CASHPOT '+fmt(S.pot);SFX.ausFan();}
  m.dirty=true;updateButtons(m);
}
function startBigSp(m){fxFlash(m,1);fxShake(m,.8,true);fxBurst(m,160,100,80,{coin:true,spd:200,up:110,sz:5,life:1.8});}
// Annahme: Cashpot wird zum Gewinn (danach Risiko oder Nehmen wie gewohnt); die nicht vollen Leitern fangen neu an
function spitzeTake(m){const S=spOf(m);S.pot=spPot(S,totalBet(m));if(S.pot<=0||m.state!=='idle')return;
  m.win=S.pot;S.pot=0;SP_KEYS.forEach(k=>{if(S.lv[k]<5)S.lv[k]=0;});m.disp=0;m.state='count';m.timer=.9;m.msg='ANNAHME · CASHPOT '+fmt(m.win);SFX.chip();
  fxBurst(m,SP_POT.x+SP_POT.w/2,SP_POT.y+SP_POT.h/2,24,{coin:true,sz:4,spd:120,up:90,life:1.2});m.topDirty=true;m.dirty=true;updateButtons(m);}
// Tippen auf den Bildschirm: Annahme-Knopf und Dauerstart-Pfeile
function spitzeTap(m,uv){if(!m.G.special||!uv||m.remote)return false;const x=uv.x*320,y=(1-uv.y)*240,hit=B=>x>=B.x-3&&x<=B.x+B.w+3&&y>=B.y-3&&y<=B.y+B.h+3;
  if(hit(SP_ANN)){if(spOf(m).pot>0&&m.state==='idle')spitzeTake(m);else SFX.click();return true;}
  if(hit(SP_UP)||hit(SP_DN)){const i=clamp(spStopIdx(m)+(hit(SP_UP)?1:-1),0,SP_STOP.length-1);m.spStop=i;SFX.tick();
    m.msg='DAUERSTART STOPPT AB '+(SP_STOP[i]?fmt(SP_STOP[i]*totalBet(m)):'– (AUS)');m.dirty=true;return true;}
  return false;}
// ---------- Bildschirm (320×240) ----------
const SP_WIN={x:110,y:52,w:100,h:62},SP_JOK={x:28,y:51,w:72,h:64},SP_DEV={x:220,y:51,w:72,h:64};
const SP_PANEL={x:24,y:134,w:272,h:46},SP_STOPD={x:60,y:145,w:38,h:22},SP_UP={x:102,y:143,w:14,h:12},SP_DN={x:102,y:157,w:14,h:12};
const SP_POT={x:124,y:145,w:80,h:22},SP_ANN={x:230,y:145,w:58,h:22};
// vorgezeichnete Bilder (3× scharf für den HD-Bildschirm)
const SPC={};
function spCache(key,w,h,draw){if(SPC[key])return SPC[key];const c=document.createElement('canvas');c.width=w*3;c.height=h*3;const x=c.getContext('2d');x.scale(3,3);draw(x,w,h);return SPC[key]=c;}
function spFrameBox(x,X,Y,W,H){ // Goldrahmen, dunkelrotes Feld
  x.fillStyle='#1a0400';lRR(x,X-2,Y-2,W+4,H+4,4);x.fill();
  const fr=x.createLinearGradient(0,Y,0,Y+H);fr.addColorStop(0,'#fff0a0');fr.addColorStop(.5,'#d89a20');fr.addColorStop(1,'#7a4a00');x.fillStyle=fr;lRR(x,X,Y,W,H,3.5);x.fill();
  const bg=x.createLinearGradient(0,Y,0,Y+H);bg.addColorStop(0,'#8a0a06');bg.addColorStop(.6,'#3a0202');bg.addColorStop(1,'#1a0000');x.fillStyle=bg;lRR(x,X+2.5,Y+2.5,W-5,H-5,2.5);x.fill();}
function spFire(){return spCache('fire',320,240,(x,w,h)=>{
  x.fillStyle='#000';x.fillRect(0,0,w,h);
  const gr=x.createLinearGradient(0,90,0,240);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(.5,'rgba(200,40,0,.55)');gr.addColorStop(1,'rgba(255,140,20,.7)');x.fillStyle=gr;x.fillRect(0,90,w,150);
  const r=hdRnd(77);x.globalCompositeOperation='lighter';
  for(let i=0;i<46;i++){const cx=r()*w,base=h-r()*30,ht=50+r()*120,wd=10+r()*26;
    const fg=x.createLinearGradient(0,base-ht,0,base);fg.addColorStop(0,'rgba(255,200,60,0)');fg.addColorStop(.45,'rgba(255,90,10,.22)');fg.addColorStop(1,'rgba(255,210,90,.35)');
    x.fillStyle=fg;x.beginPath();x.moveTo(cx-wd,base);x.bezierCurveTo(cx-wd*.6,base-ht*.5,cx+wd*.4*(r()-.5),base-ht*.8,cx+(r()-.5)*8,base-ht);x.bezierCurveTo(cx+wd*.3,base-ht*.6,cx+wd*.7,base-ht*.4,cx+wd,base);x.fill();}
  // Feuer auch oben am Rand (wie am Gerät)
  for(let i=0;i<26;i++){const cx=r()*w,ht=14+r()*30,wd=8+r()*16;const fg=x.createLinearGradient(0,0,0,ht);fg.addColorStop(0,'rgba(255,150,30,.35)');fg.addColorStop(1,'rgba(200,30,0,0)');
    x.fillStyle=fg;x.beginPath();x.moveTo(cx-wd,0);x.quadraticCurveTo(cx,ht*1.4,cx+wd,0);x.fill();}
  x.globalCompositeOperation='source-over';});}
function spFlames(){return spCache('flames',320,120,(x,w,h)=>{const r=hdRnd(91);x.globalCompositeOperation='lighter';
  for(let i=0;i<30;i++){const cx=r()*w,ht=30+r()*80,wd=8+r()*18;const fg=x.createLinearGradient(0,h-ht,0,h);fg.addColorStop(0,'rgba(255,220,90,0)');fg.addColorStop(.5,'rgba(255,110,20,.25)');fg.addColorStop(1,'rgba(255,230,140,.4)');
    x.fillStyle=fg;x.beginPath();x.moveTo(cx-wd,h);x.quadraticCurveTo(cx-wd*.2,h-ht*.7,cx,h-ht);x.quadraticCurveTo(cx+wd*.2,h-ht*.7,cx+wd,h);x.fill();}});}
// Hintergrund: vorgezeichnetes Feuer, das nur günstig flackert (zwei verschobene Flammenschichten)
function spBg(m,g){g.drawImage(spFire(),0,0,320,240);
  const f=spFlames(),k=Math.sin(now*7)*.5+.5;g.globalAlpha=.45+.35*k;g.drawImage(f,Math.sin(now*1.3)*6,240-120-36+Math.sin(now*5)*3,320,120);
  g.globalAlpha=.3+.3*(1-k);g.drawImage(f,-Math.sin(now*1.1)*8,240-120-30+Math.cos(now*6)*4,320,120);g.globalAlpha=1;}
function spTitle(){return spCache('title',200,24,(x,w,h)=>{x.font='700 19px Cinzel, Georgia, serif';x.textAlign='center';x.textBaseline='middle';
  x.shadowColor='rgba(255,200,40,.9)';x.shadowBlur=6;x.lineJoin='round';x.lineWidth=3.5;x.strokeStyle='#7a0a00';x.strokeText('Alles Spitze',w/2,h/2+1);x.shadowBlur=0;
  const gr=x.createLinearGradient(0,3,0,h-3);gr.addColorStop(0,'#fffbd0');gr.addColorStop(.45,'#ffd23a');gr.addColorStop(1,'#d07000');x.fillStyle=gr;x.fillText('Alles Spitze',w/2,h/2+1);
  x.lineWidth=.8;x.strokeStyle='rgba(120,20,0,.9)';x.strokeText('Alles Spitze',w/2,h/2+1);});}
function spJoker(){return spCache('joker',SP_JOK.w,SP_JOK.h,(x,w,h)=>{spFrameBox(x,2,2,w-4,h-4);
  x.font='700 7.5px Cinzel, Georgia, serif';x.textAlign='left';x.textBaseline='top';x.fillStyle='#ff3a2a';x.fillText('Joker',8,7);
  SYMSET='spitze';x.drawImage(symCanvas('KOEN'),w/2-17,10,34,34);
  ['KAEF','PFEN','KLEE'].forEach((k,i)=>{x.drawImage(symCanvas(k),w/2-27+i*20,h-17,11,11);
    if(i<2){x.fillStyle='#ffe8a0';x.font='700 7px '+SCR_FONT;x.textAlign='center';x.fillText('+',w/2-27+i*20+15.5,h-15.5);}});});}
function spDevil(){return spCache('devil',SP_DEV.w,SP_DEV.h,(x,w,h)=>{spFrameBox(x,2,2,w-4,h-4);
  SYMSET='spitze';x.drawImage(symCanvas('TEUF'),w/2-19,6,38,38);
  x.font='700 6.5px Cinzel, Georgia, serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#ff4a3a';x.fillText('Cashpot auf 0',w/2,h-10);});}
function spWinFrame(){const W=SP_WIN.w,H=SP_WIN.h,p=9;return spCache('winframe',W+p*2,H+p*2,(x,w,h)=>{
  x.shadowColor='rgba(255,120,20,1)';x.shadowBlur=9;const fr=x.createLinearGradient(0,0,0,h);fr.addColorStop(0,'#ffe060');fr.addColorStop(.5,'#ff6a10');fr.addColorStop(1,'#c01808');
  x.strokeStyle=fr;x.lineWidth=4;x.strokeRect(p-2,p-2,W+4,H+4);x.shadowBlur=0;x.lineWidth=1.5;x.strokeStyle='#ffe8a0';x.strokeRect(p-3.5,p-3.5,W+7,H+7);});}
function spPanel(){const P=SP_PANEL;return spCache('panel',P.w,P.h+10,(x,w,h)=>{const y0=10,H=P.h;
  x.fillStyle='#1a0400';lRR(x,0,y0,w,H,4);x.fill();const fr=x.createLinearGradient(0,y0,0,y0+H);fr.addColorStop(0,'#ffe080');fr.addColorStop(1,'#8a5a08');x.fillStyle=fr;lRR(x,1.5,y0+1.5,w-3,H-3,3.5);x.fill();
  const bg=x.createLinearGradient(0,y0,0,y0+H);bg.addColorStop(0,'#b0100a');bg.addColorStop(.5,'#6a0404');bg.addColorStop(1,'#3a0000');x.fillStyle=bg;lRR(x,4,y0+4,w-8,H-8,2.5);x.fill();
  x.font='700 15px Cinzel, Georgia, serif';x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';x.lineWidth=4;x.strokeStyle='#3a0000';x.strokeText('CASHPOT',w/2,y0+1);
  const tg=x.createLinearGradient(0,y0-8,0,y0+9);tg.addColorStop(0,'#fffbd0');tg.addColorStop(.5,'#ffd23a');tg.addColorStop(1,'#c06a00');x.fillStyle=tg;x.fillText('CASHPOT',w/2,y0+1);
  x.font='700 5.2px '+SCR_FONT;x.textAlign='left';x.fillStyle='#fff';['Dauer-','start','stoppt ab'].forEach((t,i)=>x.fillText(t,9,y0+15+i*6.5));
  const disp=B=>{const X=B.x-P.x,Y=B.y-P.y+y0;x.fillStyle='#000';lRR(x,X,Y,B.w,B.h,2);x.fill();x.strokeStyle='rgba(255,220,140,.35)';x.lineWidth=.8;lRR(x,X+.5,Y+.5,B.w-1,B.h-1,2);x.stroke();};
  disp(SP_STOPD);disp(SP_POT);
  [[SP_UP,1],[SP_DN,-1]].forEach(([B,d])=>{const X=B.x-P.x,Y=B.y-P.y+y0,gg=x.createLinearGradient(0,Y,0,Y+B.h);gg.addColorStop(0,'#8aff8a');gg.addColorStop(1,'#0a7a10');
    x.fillStyle='#062a06';lRR(x,X-.5,Y-.5,B.w+1,B.h+1,2);x.fill();x.fillStyle=gg;lRR(x,X+.5,Y+.5,B.w-1,B.h-1,1.5);x.fill();
    const cx=X+B.w/2,cy=Y+B.h/2;x.fillStyle='#fff';x.beginPath();
    if(d>0){x.moveTo(cx,cy-3.5);x.lineTo(cx+4.5,cy+3);x.lineTo(cx-4.5,cy+3);}else{x.moveTo(cx,cy+3.5);x.lineTo(cx+4.5,cy-3);x.lineTo(cx-4.5,cy-3);}x.closePath();x.fill();});});}
function spAnnBtn(on){return spCache('ann'+(on?1:0),SP_ANN.w,SP_ANN.h,(x,w,h)=>{const g1=x.createLinearGradient(0,0,0,h);
  if(on){g1.addColorStop(0,'#ffffff');g1.addColorStop(.5,'#c8ccd4');g1.addColorStop(1,'#6a707c');}else{g1.addColorStop(0,'#8a8e96');g1.addColorStop(1,'#3a3e46');}
  x.fillStyle='#111';lRR(x,0,0,w,h,2.5);x.fill();x.fillStyle=g1;lRR(x,1.2,1.2,w-2.4,h-2.4,2);x.fill();
  x.font='700 10px Cinzel, Georgia, serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle=on?'#1a1a1e':'#c8ccd4';x.fillText('Annahme',w/2,h/2+1);});}
function drawSpitze(m,g){
  const S=spOf(m),bet=totalBet(m),blink=Math.floor(now*3)%2;S.pot=spPot(S,bet);
  g.drawImage(spTitle(),66,25,188,22.5);
  // Joker links, Teufel rechts (leuchten kurz auf, wenn sie kommen)
  g.drawImage(spJoker(),SP_JOK.x,SP_JOK.y,SP_JOK.w,SP_JOK.h);g.drawImage(spDevil(),SP_DEV.x,SP_DEV.y,SP_DEV.w,SP_DEV.h);
  if(S.flash&&now-S.flashT<1.4){const B=S.flash==='KOEN'?SP_JOK:SP_DEV,a=(1-(now-S.flashT)/1.4)*(.5+.5*Math.sin(now*20));
    g.save();g.globalCompositeOperation='lighter';g.fillStyle=(S.flash==='KOEN'?'rgba(255,230,120,':'rgba(255,60,40,')+(a*.55).toFixed(3)+')';lRR(g,B.x+2,B.y+2,B.w-4,B.h-4,3);g.fill();g.restore();m.dirty=true;}
  // Walzenfenster im Flammenrahmen: ein großes Symbol, "LEER" = halb versetzt zwischen zwei Symbolen
  const W=SP_WIN,r=m.reels[2],St=G_strip(m),cell=W.h;
  g.drawImage(spWinFrame(),W.x-9,W.y-9,W.w+18,W.h+18);g.fillStyle='#000';g.fillRect(W.x,W.y,W.w,W.h);
  g.save();g.beginPath();g.rect(W.x,W.y,W.w,W.h);g.clip();
  const VM=spVis(St),c=spVisPos(VM,r.pos),j0=Math.floor(c)-1,z=cell*.86;
  for(let j=j0;j<=j0+2;j++){const sym=VM.vs[((j%VM.n)+VM.n)%VM.n],y=W.y+(j-c)*cell,im=symCanvas(sym);
    if(r.spin&&Math.abs(r.vel||0)>9){g.globalAlpha=.4;g.drawImage(im,W.x+(W.w-z)/2,y+(cell-z)/2-14,z,z*1.4);g.globalAlpha=.85;g.drawImage(im,W.x+(W.w-z)/2,y+(cell-z)/2,z,z);g.globalAlpha=1;}
    else if(!r.spin&&Math.abs(j-c)<.01){const p=1+Math.abs(Math.sin(now*5))*.05;g.drawImage(im,W.x+(W.w-z*p)/2,y+(cell-z*p)/2,z*p,z*p);}
    else g.drawImage(im,W.x+(W.w-z)/2,y+(cell-z)/2,z,z);}
  g.restore();
  // Cashpot-Leiste: Dauerstart-Stopp, Cashpot, Pfeil, Annahme
  const P=SP_PANEL;g.drawImage(spPanel(),P.x,P.y-10,P.w,P.h+10);
  g.textAlign='center';g.textBaseline='middle';
  const sv=SP_STOP[spStopIdx(m)],st=sv?fmt(sv*bet).replace(' €',''):'–';g.fillStyle='#ffd23a';pxFit(g,st,SP_STOPD.w-6,9,5,800);g.fillText(st,SP_STOPD.x+SP_STOPD.w/2,SP_STOPD.y+SP_STOPD.h/2+1);
  const pt=S.pot>0?fmt(S.pot).replace(' €',''):'0';g.fillStyle=S.pot>0?'#ffffff':'#e8e0cc';pxFit(g,pt,SP_POT.w-8,13,6,800);g.fillText(pt,SP_POT.x+SP_POT.w/2,SP_POT.y+SP_POT.h/2+1);
  const can=S.pot>0&&m.state==='idle'&&!m.remote;
  g.fillStyle=can&&blink?'#ffffff':'rgba(255,255,255,.45)';g.beginPath();g.moveTo(SP_POT.x+SP_POT.w+6,SP_POT.y+SP_POT.h/2);g.lineTo(SP_ANN.x-6,SP_POT.y+3);g.lineTo(SP_ANN.x-6,SP_POT.y+SP_POT.h-3);g.closePath();g.fill();
  g.drawImage(spAnnBtn(can),SP_ANN.x,SP_ANN.y,SP_ANN.w,SP_ANN.h);
}
// ---------- Aufsatz (256×128): die drei Leitern wie am Gerät oben ----------
function spDrawTop(m,g){
  const S=spOf(m),bet=totalBet(m),bl=Math.floor(now*3)%2;
  g.drawImage(spFire(),0,0,320,240,0,-20,256,192);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(0,0,256,128);
  g.textAlign='center';g.textBaseline='middle';
  g.font='700 9px Cinzel, Georgia, serif';g.fillStyle='#ffd870';g.fillText('ALLE 3 VOLL = '+fmt(SP_JP*bet),128,8);
  const COL={KLEE:'#3adf5a',PFEN:'#ffb050',KAEF:'#ff4a3a'};let anim=false;
  SP_KEYS.forEach((k,ti)=>{const x=10+ti*82,w=72,lv=S.lv[k],full=lv>=5,c=COL[k],rh=15.4,yb=104;
    g.fillStyle='#000';lRR(g,x-2,15,w+4,yb-13+22,4);g.fill();g.strokeStyle=full?(bl?'#fff':c):'rgba(214,160,42,.7)';g.lineWidth=full?2:1;lRR(g,x-1.5,15.5,w+3,yb-14+22,3.5);g.stroke();
    if(full)anim=true;
    for(let i=0;i<5;i++){const y=yb-(i+1)*(rh+1.4)+1,on=i<lv,cur=i===lv-1,hot=cur&&S.hit[k]&&now-S.hit[k]<.8,fl=hot&&bl;if(hot)anim=true;
      if(on){const lg=g.createLinearGradient(0,y,0,y+rh);lg.addColorStop(0,fl?'#ffffff':'#fff8c8');lg.addColorStop(1,c);g.fillStyle=lg;}else g.fillStyle='#2a0806';
      lRR(g,x+2,y,w-4,rh,2.5);g.fill();if(cur){g.strokeStyle='#fff';g.lineWidth=1.2;lRR(g,x+2.5,y+.5,w-5,rh-1,2.5);g.stroke();}
      const t=fmt(SPL[k][i]*bet).replace(' €','');g.fillStyle=on?'#1a0800':'#c8a060';pxFit(g,t,w-12,8,4,800);g.fillText(t,x+w/2,y+rh/2+1);}
    const nm=full?'VOLL!':SP_NAME[k];g.drawImage(symCanvas(k),x+3,yb+3,15,15);g.fillStyle=full?(bl?'#fff':'#ffd23a'):c;pxFit(g,nm,w-24,full?8:6.5,4,800);g.textAlign='left';g.fillText(nm,x+20,yb+11);g.textAlign='center';});
  m.topAnim=anim; // volle/gerade getroffene Leitern blinken: Aufsatz wird dann laufend neu gezeichnet
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
  const L=['EINE WALZE · DREI LEITERN (OBEN IM AUFSATZ)','KLEEBLATT, MÜNZE, KÄFER: LEITER +1 STUFE','LEITER OBEN = HÖCHSTGEWINN, SIE BLEIBT VOLL',
    'VOLL + SYMBOL NOCHMAL = WIEDER HÖCHSTGEWINN','SONNE (JOKER): ALLE DREI LEITERN +1','TEUFEL: ALLES AUF 0','ALLE DREI VOLL: 500× EINSATZ',
    'ANNAHME BUCHT DEN CASHPOT · DAUERSTART STOPPT AB …','QUOTE CA. 95–98 % · EINSATZ NUR BEI LEEREN LEITERN'];
  L.forEach((t,i)=>{g.fillStyle=i===0?'#ffd23a':i>=7?'#b8a888':'#f4f0e8';fitL(g,t,RX+4,RY+10+i*16,CW*5-8,7);});
}
