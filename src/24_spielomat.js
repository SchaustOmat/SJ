/* =========================================================
   SPIELOMAT V0.1 – das Automaten-System von Sinan's Keller
   Startbildschirm, Spielauswahl mit allen Spielen, MENÜ-Taste im Spiel.
   ========================================================= */
const SPIELOMAT={ver:'V0.1',games:[['book','BUCH'],['fruit','SIEBEN'],['viking','HELM'],['mine','DIAMANT'],['reef','DELFIN'],['temple','FEUER'],['pharao','PHARAO']]};
const SM_TILE={x0:11,y0:44,w:70,h:78,gx:6,gy:8,cols:4};
function setMachineGame(m,id){
  const G=SlotEngine.GAMES[id];if(!G||m.G===G)return;
  m.G=G;m.power=null;m.myst=null;m.fx=null;m.lines=G.lineOpts[G.lineOpts.length-1];m.betIdx=0;m.fs=null;m.useFs=false;m.info=false;m.present=null;m.expand=null;m.win=0;m.disp=0;
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
  if(m.state==='poffer')return offerTap(m,uv);
  if(m.state!=='menu'||!uv)return false;
  const x=uv.x*320,y=(1-uv.y)*240,T=SM_TILE;
  for(let i=0;i<SPIELOMAT.games.length;i++){const c=i%T.cols,r=i/T.cols|0,tx=T.x0+c*(T.w+T.gx),ty=T.y0+r*(T.h+T.gy);
    if(x>=tx&&x<=tx+T.w&&y>=ty&&y<=ty+T.h){if(m.menuIdx===i)smStart(m);else{m.menuIdx=i;SFX.tick();m.dirty=true;}return true;}}
  return false;
}
function smDraw(m,g){
  const t=m.stateT;
  const bg=g.createLinearGradient(0,0,0,240);bg.addColorStop(0,'#160a2a');bg.addColorStop(1,'#04020a');g.fillStyle=bg;g.fillRect(0,0,320,240);
  g.strokeStyle='rgba(255,46,136,.18)';g.lineWidth=1;for(let y=8;y<240;y+=16){g.beginPath();g.moveTo(0,y);g.lineTo(320,y);g.stroke();}
  g.textAlign='center';g.textBaseline='middle';
  if(m.state==='boot'){
    const k=clamp(t/1.6,0,1);
    px(g,22);g.lineWidth=6;g.strokeStyle='#000';g.strokeText('SPIELOMAT',160,92);
    const tg=g.createLinearGradient(0,78,0,106);tg.addColorStop(0,'#ff9ad0');tg.addColorStop(1,'#ff2e88');g.fillStyle=tg;g.fillText('SPIELOMAT',160,92);
    px(g,10);g.fillStyle='#29f0ff';g.fillText(SPIELOMAT.ver,160,120);
    g.fillStyle='#2a1a40';g.fillRect(60,150,200,10);g.fillStyle='#ffcf3a';g.fillRect(60,150,200*k,10);
    px(g,7);g.fillStyle='#9b8fb3';g.fillText(k<1?'LADE SPIELE… '+Math.round(k*SPIELOMAT.games.length)+'/'+SPIELOMAT.games.length:'BEREIT',160,174);
    g.fillText('© KELLERSOFT · SINAN\'S KELLER',160,222);
    if(t>1.9){m.state='menu';updateButtons(m);}
    return;
  }
  px(g,11);g.fillStyle='#ff2e88';g.textAlign='left';g.fillText('SPIELOMAT',12,16);px(g,7);g.fillStyle='#29f0ff';g.fillText(SPIELOMAT.ver,128,17);
  g.textAlign='right';g.fillStyle='#ffcf3a';px(g,8);g.fillText(m===RESV?'GUTHABEN '+fmt(chips):'KARTE STECKEN',308,16);
  g.textAlign='center';px(g,8);g.fillStyle='#f4f0e8';g.fillText('WÄHLE DEIN SPIEL',160,33);
  const T=SM_TILE,blink=Math.floor(now*3)%2===0;
  SPIELOMAT.games.forEach(([id,icon],i)=>{
    const G=SlotEngine.GAMES[id],c=i%T.cols,r=i/T.cols|0,x=T.x0+c*(T.w+T.gx),y=T.y0+r*(T.h+T.gy),sel=i===m.menuIdx;
    const TOPC={book:['#3a1a50','#1a0a04'],fruit:['#6a0a00','#2a0400'],viking:['#1a3a6a','#06142a'],mine:['#4a3a20','#101010'],reef:['#0a6a8a','#002a3a'],temple:['#8a2a00','#2a0a00'],pharao:['#8a1010','#2a0000']}[id];
    const tg=g.createLinearGradient(0,y,0,y+T.h);tg.addColorStop(0,TOPC[0]);tg.addColorStop(1,TOPC[1]);g.fillStyle=tg;g.fillRect(x,y,T.w,T.h);
    g.drawImage(symCanvas(icon),x+T.w/2-20,y+6,40,40);
    px(g,G.title.length>9?5:6);g.fillStyle='#ffd23a';g.fillText(G.title,x+T.w/2,y+56);
    px(g,5);g.fillStyle='#e8e0cc';g.fillText(G.power?'POWER SPINS':G.free?(G.id==='book'?'10 FS · BUCH':G.free.count+' FS'+(G.free.mult>1?' ×'+G.free.mult:'')):'5 LINIEN',x+T.w/2,y+70);
    g.lineWidth=sel?3:1;g.strokeStyle=sel?(blink?'#ffffff':'#ffcf3a'):'#3a2c52';g.strokeRect(x+.5,y+.5,T.w-1,T.h-1);
  });
  px(g,6);g.fillStyle='#9b8fb3';g.fillText('ANTIPPEN ODER ◄ ► · NOCHMAL TIPPEN / SPIELEN = START',160,226);
}
