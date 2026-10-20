/* =========================================================
   SPIELOMAT V0.1 – das Automaten-System der SJ Spielbank
   Startbildschirm, Spielauswahl mit allen Spielen, MENÜ-Taste im Spiel.
   ========================================================= */
const SPIELOMAT={ver:'V0.1',games:[['pharao','PHARAO'],['spitze','KLEE'],['zent','ZENT'],['tizona','SCHWERT'],['doppel','FORSCH']]};
const SM_TILE={x0:11,y0:42,w:70,h:56,gx:6,gy:4,cols:4};
// Kachelposition; die letzte, nicht volle Reihe steht mittig
function smTileXY(i){const T=SM_TILE,n=SPIELOMAT.games.length,c=i%T.cols,r=i/T.cols|0,inRow=Math.min(T.cols,n-r*T.cols);
  return [T.x0+c*(T.w+T.gx)+(T.cols-inRow)*(T.w+T.gx)/2,T.y0+r*(T.h+T.gy)];}
function setMachineGame(m,id){
  if(!SPIELOMAT.games.some(x=>x[0]===id))id='pharao'; // nur noch echte Merkur-Spiele
  const G=SlotEngine.GAMES[id];if(!G||m.G===G)return;
  if(m.sp&&m.sp.pot>0&&!m.remote){setChips(chips+m.sp.pot,true);m.sp.pot=0;}m.sp=null;if(typeof slotPendSave==='function')slotPendSave();
  m.G=G;m.power=null;m.myst=null;m.fx=null;if(/^(fs|expand|ssSpin)/.test(m.state))m.state='idle';m.lines=G.lineOpts[G.lineOpts.length-1];m.betIdx=0;m.fs=null;m.useFs=false;m.info=false;m.present=null;m.expand=null;m.win=0;m.disp=0;
  m.reels.forEach((r,i)=>{r.spin=false;r.bounce=0;r.pos=Math.floor(Math.random()*G.strips[i].length);m.stops[i]=r.pos;});
  m.grid=SlotEngine.grid(G,m.stops);m.ev=null;slotIdleMsg(m);m.dirty=true;m.topDirty=true;
}
function smOpen(m){
  m.menuIdx=Math.max(0,SPIELOMAT.games.findIndex(g=>g[0]===m.G.id));m.info=false;m.auto=false;
  if(!m.booted){m.booted=true;m.state='boot';m.stateT=0;m.timer=0;SFX.ding();}else m.state='menu';
  m.dirty=true;updateButtons(m);
}
function smStart(m){const id=SPIELOMAT.games[m.menuIdx][0];setMachineGame(m,id);m.state='splash';m.stateT=0;m.timer=2;m.msg='VIEL GLÜCK!';SFX.fsIntro();m.dirty=true;m.topDirty=true;updateButtons(m);}
function smButtons(m,B){
  const menu=m.state==='menu';
  B('MENU','MENÜ','white',false);B('INFO','INFO','white',false);B('AUTO','AUTO','blue',false);B('KARTE','RISIKO KARTE','red',false);B('LEITER','RISIKO LEITER','yellow',false);
  B('LINIEN','◄ ZURÜCK','amber',menu);B('EINSATZ','WEITER ►','amber',menu);B('START','SPIELEN','green',menu,menu);
}
function smPress(m,key){
  if(m.state!=='menu')return;const n=SPIELOMAT.games.length;
  if(key==='LINIEN'){m.menuIdx=(m.menuIdx+n-1)%n;SFX.tick();}
  else if(key==='EINSATZ'){m.menuIdx=(m.menuIdx+1)%n;SFX.tick();}
  else if(key==='START')smStart(m);
  m.dirty=true;
}
function smTap(m,uv){
  if(m.state==='gamble'&&m.gamble&&m.gamble.kind==='ladder'&&uv){const x=uv.x*320,y=(1-uv.y)*240;if(Math.abs(x-LAD_TEILEN.x)<22&&Math.abs(y-LAD_TEILEN.y)<12){pressButton(m,'KARTE');return true;}}
  if(typeof tzBuyTap==='function'&&tzBuyTap(m,uv))return true;
  if(typeof spitzeTap==='function'&&m.state!=='menu'&&spitzeTap(m,uv))return true;
  if(m.state==='poffer')return offerTap(m,uv);
  if(m.state!=='menu'||!uv)return false;
  const x=uv.x*320,y=(1-uv.y)*240,T=SM_TILE;
  for(let i=0;i<SPIELOMAT.games.length;i++){const [tx,ty]=smTileXY(i);
    if(x>=tx&&x<=tx+T.w&&y>=ty&&y<=ty+T.h){if(m.menuIdx===i)smStart(m);else{m.menuIdx=i;SFX.tick();m.dirty=true;}return true;}}
  return false;
}
function smDraw(m,g){
  const t=m.stateT;
  // edel: tiefes Bordeaux-Schwarz, goldener Schimmer, feiner Goldrahmen
  const bg=g.createRadialGradient(160,90,10,160,120,230);bg.addColorStop(0,'#2a0c12');bg.addColorStop(.6,'#12060a');bg.addColorStop(1,'#050204');g.fillStyle=bg;g.fillRect(0,0,320,240);
  g.strokeStyle='rgba(214,160,42,.45)';g.lineWidth=1;g.strokeRect(4.5,4.5,311,231);g.strokeStyle='rgba(214,160,42,.18)';g.strokeRect(7.5,7.5,305,225);
  const gold=(y0,y1)=>{const gg=g.createLinearGradient(0,y0,0,y1);gg.addColorStop(0,'#fff4c8');gg.addColorStop(.5,'#e8b840');gg.addColorStop(1,'#9a6a10');return gg;};
  g.textAlign='center';g.textBaseline='middle';
  if(m.state==='boot'){
    const k=clamp(t/1.6,0,1);
    px(g,24,800);g.lineWidth=6;g.lineJoin='round';g.strokeStyle='#1a0800';g.strokeText('SPIELOMAT',160,92);g.fillStyle=gold(76,108);g.fillText('SPIELOMAT',160,92);
    px(g,9);g.fillStyle='#b8a888';g.fillText(SPIELOMAT.ver,160,120);
    g.fillStyle='#1a1008';lRR(g,60,150,200,8,4);g.fill();g.fillStyle=gold(150,158);lRR(g,60,150,Math.max(8,200*k),8,4);g.fill();
    px(g,7);g.fillStyle='#b8a888';g.fillText(k<1?'LADE SPIELE… '+Math.round(k*SPIELOMAT.games.length)+'/'+SPIELOMAT.games.length:'BEREIT',160,174);
    g.fillText('© SJ SPIELBANK',160,222);
    if(t>1.9){m.state='menu';updateButtons(m);}
    return;
  }
  px(g,12,800);g.fillStyle=gold(8,24);g.textAlign='left';g.fillText('SPIELOMAT',14,17);const tw=g.measureText('SPIELOMAT').width;px(g,6);g.fillStyle='#b8a888';g.fillText(SPIELOMAT.ver,20+tw,18);
  g.textAlign='right';g.fillStyle='#ffcf3a';px(g,8);g.fillText(isMine(m)?'GUTHABEN '+fmt(chips):'KARTE STECKEN',308,16);
  g.textAlign='center';px(g,7);g.fillStyle='#e8dcc0';g.fillText('WÄHLE DEIN SPIEL',160,33);
  const T=SM_TILE,blink=Math.floor(now*3)%2===0;
  SPIELOMAT.games.forEach(([id,icon],i)=>{
    const G=SlotEngine.GAMES[id],[x,y]=smTileXY(i),sel=i===m.menuIdx;
    const TOPC={pharao:['#8a1010','#2a0000'],spitze:['#1a4a1a','#04100a'],zent:['#1a4a8a','#0a1a2a'],tizona:['#1a3a6a','#06142a'],doppel:['#4a2a6a','#1a0a04']}[id];
    const tg=g.createLinearGradient(0,y,0,y+T.h);tg.addColorStop(0,TOPC[0]);tg.addColorStop(1,TOPC[1]);g.fillStyle=tg;g.fillRect(x,y,T.w,T.h);
    SYMSET=id;g.drawImage(symCanvas(icon),x+T.w/2-15,y+4,30,30);SYMSET=m.G.id;
    px(g,G.title.length>9?5:6);g.fillStyle='#ffd23a';g.fillText(G.title,x+T.w/2,y+42);
    px(g,5);g.fillStyle='#e8e0cc';g.fillText(G.special?'3 LEITERN':G.doppel?'EINZEL/DOPPEL':G.power?'POWER SPINS':G.free?(G.free.count+' FS'+(G.free.mult>1?' ×'+G.free.mult:'')):'5 LINIEN',x+T.w/2,y+51);
    if(sel){g.save();g.shadowColor='rgba(255,210,90,.9)';g.shadowBlur=8+4*Math.sin(now*5);g.lineWidth=2.5;g.strokeStyle='#ffd870';g.strokeRect(x,y,T.w,T.h);g.restore();m.dirty=true;}
    else{g.lineWidth=1;g.strokeStyle='rgba(214,160,42,.45)';g.strokeRect(x+.5,y+.5,T.w-1,T.h-1);}
  });
  g.fillStyle='#8a7a5a';pxFit(g,'ANTIPPEN ODER ◄ ► · NOCHMAL TIPPEN / SPIELEN = START',296,6);g.fillText('ANTIPPEN ODER ◄ ► · NOCHMAL TIPPEN / SPIELEN = START',160,224);
}
