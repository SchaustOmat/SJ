/* =========================================================
   ZUSCHAUEN: was spielen die anderen gerade?
   Jeder schickt in der Presence "gx" eine kurze Beschreibung seines Spiels.
   - Automaten: der Automat in deiner Welt zeigt live seine Walzen, seinen Gewinn und sein Guthaben.
   - Poker / Höher-Tiefer / Roulette: Karte oben mit seinen Karten und Ergebnissen, wenn du daneben stehst.
   ========================================================= */
function allMachines(){return floors.flatMap(f=>f.machines);}
function mpActivity(){
  if(!focus){if(openId==='pRoulette'){const t=$('#rRes').textContent;let sum=0;for(const k in R.bets)sum+=R.bets[k];return {g:'roulette',msg:cleanText(t,40),b:sum,sp:R.spinning?1:0,rid:R.rid,ri:R.ridx,rt:R.act?R.act.id:0,re:R.W.anim?Math.round(R.W.anim.t*10)/10:0};}return null;}
  if(focus.type==='slot'){const m=focus.m;
    return {g:'slot',gid:m.G.id,mi:allMachines().indexOf(m),st:m.stops.slice(),sp:m.state==='spin'?1:0,w:Math.round(m.disp),msg:cleanText(m.msg,40),l:m.lines,bi:m.betIdx,
      fs:m.fs?[m.fs.n,m.fs.total]:0,sx:m.fs?m.fs.special:'',gm:m.gamble?(m.gamble.kind==='ladder'?'LEITER':'KARTE'):'',my:m.myst&&m.myst.open&&m.state!=='spin'?[m.myst.reels,m.myst.sym]:0};}
  if(focus.type==='poker'){const h=PK.human;return {g:'poker',c:h.hole.slice(0,2),bd:PK.board.slice(0,5),pot:potTotal(),msg:cleanText(PK.info||PK.msg||'',40),f:h.folded?1:0};}
  if(focus.type==='hilo'){return {g:'hilo',o:HL.open===null?-1:HL.open,p:HL.pick>=0&&HL.state!=='pick'?HL.hidden[HL.pick]:-1,pe:HL.pending,msg:cleanText(HL.msg||'',40)};}
  return null;
}
const GNAME={slot:'AUTOMAT',poker:'POKER',hilo:'HÖHER/TIEFER',roulette:'ROULETTE'};
function cleanGx(gx){
  if(!gx||typeof gx!=='object'||!GNAME[gx.g])return null;
  const num=(x,lo,hi)=>Number.isFinite(+x)?clamp(Math.round(+x),lo,hi):0;
  const cards=a=>Array.isArray(a)?a.filter(validCard).slice(0,5):[];
  return {g:gx.g,gid:typeof gx.gid==='string'&&SlotEngine.GAMES[gx.gid]?gx.gid:'',mi:num(gx.mi,-1,99),st:Array.isArray(gx.st)?gx.st.slice(0,5).map(x=>num(x,0,999)):null,sp:gx.sp?1:0,w:num(gx.w,0,1e9),msg:cleanText(gx.msg,40),
    l:num(gx.l,1,10),bi:num(gx.bi,0,20),fs:Array.isArray(gx.fs)?[num(gx.fs[0],0,999),num(gx.fs[1],0,999)]:0,sx:cleanText(gx.sx,10),gm:cleanText(gx.gm,8),my:Array.isArray(gx.my)&&Array.isArray(gx.my[0])?[gx.my[0].map(x=>num(x,0,4)).slice(0,5),cleanText(gx.my[1],10)]:0,
    c:cards(gx.c),bd:cards(gx.bd),pot:num(gx.pot,0,1e9),f:gx.f?1:0,o:validCard(gx.o)?gx.o:-1,p:validCard(gx.p)?gx.p:-1,pe:num(gx.pe,0,1e9),b:num(gx.b,0,1e9),rid:num(gx.rid,0,1e9),ri:num(gx.ri,0,36),rt:num(gx.rt,0,3),re:Number.isFinite(+gx.re)?clamp(+gx.re,0,WHEEL_DUR):0};
}
// Automat eines Mitspielers in der eigenen Welt nachspielen
function mirrorSlot(a,gx,credit){
  const list=allMachines(),m=list[gx.mi];
  if(a.mirror&&a.mirror!==m)releaseMirror(a);
  if(!m||m.npc||(focus&&focus.m===m))return;
  a.mirror=m;m.remote={name:a.name,credit};m.demo=true;
  if(gx.gid&&m.G.id!==gx.gid)setMachineGame(m,gx.gid);
  m.lines=m.G.lineOpts.includes(gx.l)?gx.l:m.lines;m.betIdx=Math.min(gx.bi,m.G.betOpts.length-1);
  m.msg=gx.msg;m.disp=gx.w;m.win=gx.w;
  if(gx.fs&&!m.fs)m.fs={n:gx.fs[0],total:gx.fs[1],left:0,special:SYMC&&gx.sx&&m.G.syms.includes(gx.sx)?gx.sx:m.G.syms[0]};
  if(m.fs&&gx.fs){m.fs.n=gx.fs[0];m.fs.total=gx.fs[1];}
  if(!gx.fs&&m.fs){m.fs=null;m.topDirty=true;}
  if(gx.sp&&m.state!=='rspin'){m.state='rspin';m.present=null;m.reels.forEach(r=>{r.spin=true;r.speed=24;r.stopAt=now+30;});}
  if(!gx.sp&&gx.st&&gx.st.length===5){
    const same=gx.st.every((s,i)=>m.stops[i]===s);
    if(!same||m.state==='rspin'){m.stops=gx.st.map((s,i)=>s%m.G.strips[i].length);m.grid=SlotEngine.grid(m.G,m.stops);
      m.reels.forEach((r,i)=>{r.target=m.stops[i];if(!r.spin){r.spin=true;r.speed=24;}r.stopAt=now+.1+i*.15;r.teased=true;});m.state='rstop';}
  }
  m.myst=!gx.sp&&gx.my&&m.G.syms.includes(gx.my[1])?{reels:gx.my[0],sym:gx.my[1],open:true}:null;
  m.dirty=true;
}
function releaseMirror(a){const m=a.mirror;if(!m)return;a.mirror=null;setMachineGame(m,m.defG.id);m.remote=null;m.demo=false;m.fs=null;m.win=0;m.disp=0;m.state='idle';m.reels.forEach(r=>{if(r.spin){r.spin=false;r.pos=Math.round(r.pos);}});slotIdleMsg(m);m.dirty=true;m.topDirty=true;}
// Roulette eines Mitspielers live mitdrehen (Rad im Zuschauer-Fenster + 3D-Tisch)
function remoteRoulette(a,gx){
  if(!a.rw)a.rw=newWheel();
  if(gx.sp&&gx.rid&&gx.rid!==a.rid){a.rid=gx.rid;wheelStart(a.rw,gx.ri,gx.re+.2);a.rwT=gx.rt;a.rwF=a.f;const r=floors[a.f]&&floors[a.f].roulettes[gx.rt];if(r)r.spin=true;}
}
function stepMirrors(dt){
  MP.avatars.forEach(a=>{if(!a.rw)return;const busy=!!a.rw.anim,res=wheelStep(a.rw,dt,false);
    if(busy&&res!==null){const r=floors[a.rwF]&&floors[a.rwF].roulettes[a.rwT];if(r)r.spin=false;}});
  if(watchBest&&watchBest.rw&&watchBest.gx&&watchBest.gx.g==='roulette'){const c=$('#wcWheel');if(c&&!c.hidden)drawWheelCanvas(c.getContext('2d'),c.width,watchBest.rw);}
  allMachines().forEach(m=>{if(!m.remote)return;if(m.reels.some(r=>r.spin)){updReels(m,dt);}if(m.state==='rstop'&&!m.reels.some(r=>r.spin))m.state='idle_r';});
}
function mpApplyActivity(a,pr){
  const gx=cleanGx(pr.gx);a.gx=gx;
  if(gx&&gx.g==='slot'&&a.f===floorIdx)mirrorSlot(a,gx,typeof pr.k==='number'?pr.k:0);
  else if(a.mirror)releaseMirror(a);
  if(gx&&gx.g==='roulette')remoteRoulette(a,gx);
}
// Karte oben: Spiel des nächsten Mitspielers, neben dem du stehst
let watchT=0,watchBest=null;
function updWatchCard(dt){
  watchT-=dt;if(watchT>0)return;watchT=.25;
  const el=$('#watchCard');if(!el)return;
  let best=null,bd=5.5;
  if(!focus&&!openId)MP.avatars.forEach(a=>{if(!a.gx||a.f!==floorIdx)return;const d=Math.hypot(a.m.g.position.x-P.x,a.m.g.position.z-P.z)-(a.gx.g==='roulette'?0:1.9);if(d<bd){bd=d;best=a;}});
  watchBest=best;const wc=$('#wcWheel');if(wc)wc.hidden=!(best&&best.gx.g==='roulette');
  if(!best){el.hidden=true;return;}
  const g=best.gx;let html='<div class="wc-h">'+esc(best.name)+' · '+GNAME[g.g]+'</div>';
  if(g.g==='poker'){
    html+='<div class="pcards"><div class="pcg"><span class="pcl">SEINE KARTEN</span><div class="pcs">'+(g.c.length===2?cardHTML(g.c[0],1)+cardHTML(g.c[1],1):'<span class="pc sm empty"></span><span class="pc sm empty"></span>')+'</div></div>'+
      '<div class="pcg"><span class="pcl">TISCH</span><div class="pcs">'+[0,1,2,3,4].map(i=>g.bd[i]!==undefined?cardHTML(g.bd[i],1):'<span class="pc sm empty"></span>').join('')+'</div></div></div>';
    html+='<div class="wc-m">POT '+fmt(g.pot)+(g.f?' · GEPASST':'')+'</div>';
  } else if(g.g==='hilo'){
    html+='<div class="pcards"><div class="pcg"><span class="pcl">BANK</span><div class="pcs">'+(g.o>=0?cardHTML(g.o,1):'<span class="pc sm empty"></span>')+'</div></div>'+
      '<div class="pcg"><span class="pcl">GEZOGEN</span><div class="pcs">'+(g.p>=0?cardHTML(g.p,1):'<span class="pc sm empty"></span>')+'</div></div></div>';
    html+='<div class="wc-m">IM SPIEL '+fmt(g.pe)+'</div>';
  } else if(g.g==='slot'){
    html+='<div class="wc-m">'+(g.fs?'FREISPIEL '+g.fs[0]+'/'+g.fs[1]+' · ':'')+(g.gm?'RISIKO '+g.gm+' · ':'')+'GEWINN '+fmt(g.w)+'</div>';
  } else if(g.g==='roulette'){
    html+='<div class="wc-m">EINSATZ '+fmt(g.b)+(g.sp?' · KUGEL ROLLT':'')+'</div>';
  }
  if(g.msg)html+='<div class="wc-s">'+esc(g.msg)+'</div>';
  const body=$('#wcBody');if(body.innerHTML!==html)body.innerHTML=html;el.hidden=false;
}
