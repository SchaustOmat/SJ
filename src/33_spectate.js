/* =========================================================
   ZUSCHAUEN: was spielen die anderen gerade?
   Jeder schickt in der Presence "gx" eine kurze Beschreibung seines Spiels.
   - Automaten: der Automat in deiner Welt zeigt live seine Walzen, seinen Gewinn und sein Guthaben.
   - Poker / Höher-Tiefer / Roulette: Karte oben mit seinen Karten und Ergebnissen, wenn du daneben stehst.
   ========================================================= */
function allMachines(){return floors.flatMap(f=>f.machines);}
function mpActivity(){
  if(!focus&&RESV&&openId!=='pRoulette')return slotGx(RESV);
  if(!focus){if(openId==='pRoulette'){const t=$('#rRes').textContent;let sum=0;for(const k in R.bets)sum+=R.bets[k];return {g:'roulette',msg:cleanText(t,40),b:sum,sp:R.spinning?1:0,rid:R.rid,ri:R.ridx,rt:R.act?R.act.id:0,re:R.W.anim?Math.round(R.W.anim.t*10)/10:0};}return null;}
  if(focus.type==='slot')return slotGx(focus.m);
  return mpActivity2();
}
function slotGx(m){{
    return {g:'slot',gid:m.G.id,mi:allMachines().indexOf(m),st:m.stops.slice(),sp:m.state==='spin'?1:0,w:Math.round(m.disp),msg:cleanText(m.msg,40),l:m.lines,bi:m.betIdx,
      fs:m.fs?[m.fs.n,m.fs.total]:0,sx:m.fs?m.fs.special:'',gm:m.gamble?(m.gamble.kind==='ladder'?'LEITER':'KARTE'):'',my:m.myst&&m.myst.open&&m.state!=='spin'?[m.myst.cells.map(q=>q[0]*5+q[1]),m.myst.sym]:0,
      ps:m.state,pm:m.pmult||0,ls:m.sp?[m.sp.lv.KLEE,m.sp.lv.PFEN,m.sp.lv.KAEF,m.sp.pot]:0,
      lg:m.gamble&&m.gamble.kind==='ladder'?[m.gamble.idx,m.gamble.up?1:0,m.gamble.last===null?-1:m.gamble.last]:0,
      cd:m.gamble&&m.gamble.kind==='rb'?[m.gamble.card===null?-1:m.gamble.card].concat(m.history.slice(0,6)):0,
      pw:m.power?{c:m.power.count,l:m.power.left,t:m.power.total,mu:m.power.mult,sp:m.power.spinning?1:0,su:m.power.sum,s:m.power.sets.map(S=>S.stops.slice()),my:m.power.sets.map(S=>S.myst?[S.myst.cells.map(q=>q[0]*5+q[1]),S.myst.sym]:0)}:0};}
  }
function mpActivity2(){
  if(focus.type==='poker'){const h=PK.human;return {g:'poker',c:h.hole.slice(0,2),bd:PK.board.slice(0,5),pot:potTotal(),msg:cleanText(PK.info||PK.msg||'',40),f:h.folded?1:0};}
  if(focus.type==='hilo'){return {g:'hilo',o:HL.open===null?-1:HL.open,p:HL.pick>=0&&HL.state!=='pick'?HL.hidden[HL.pick]:-1,pe:HL.pending,msg:cleanText(HL.msg||'',40)};}
  return null;
}
// Automat, in dem ein Mitspieler seine Karte stecken hat (Name oder '')
function machineHeld(m){const i=allMachines().indexOf(m);let n='';MP.avatars.forEach(a=>{if(a.rs===i&&a.f===floorIdx)n=a.name||'Jemand';});return n;}
const GNAME={slot:'AUTOMAT',poker:'POKER',hilo:'HÖHER/TIEFER',roulette:'ROULETTE'};
function cleanGx(gx){
  if(!gx||typeof gx!=='object'||!GNAME[gx.g])return null;
  const num=(x,lo,hi)=>Number.isFinite(+x)?clamp(Math.round(+x),lo,hi):0;
  const cards=a=>Array.isArray(a)?a.filter(validCard).slice(0,5):[];
  return {g:gx.g,gid:typeof gx.gid==='string'&&SlotEngine.GAMES[gx.gid]?gx.gid:'',mi:num(gx.mi,-1,99),st:Array.isArray(gx.st)?gx.st.slice(0,5).map(x=>num(x,0,999)):null,sp:gx.sp?1:0,w:num(gx.w,0,1e9),msg:cleanText(gx.msg,40),
    l:num(gx.l,1,10),bi:num(gx.bi,0,20),fs:Array.isArray(gx.fs)?[num(gx.fs[0],0,999),num(gx.fs[1],0,999)]:0,sx:cleanText(gx.sx,10),gm:cleanText(gx.gm,8),my:Array.isArray(gx.my)&&Array.isArray(gx.my[0])?[gx.my[0].slice(0,15).map(x=>num(x,0,14)),cleanText(gx.my[1],10)]:0,
    ps:cleanText(gx.ps,12),ls:Array.isArray(gx.ls)?gx.ls.slice(0,4).map((x,i)=>num(x,0,i<3?5:1e9)):0,pm:num(gx.pm,0,9),lg:Array.isArray(gx.lg)?[num(gx.lg[0],-1,99),gx.lg[1]?1:0,num(gx.lg[2],-1,99)]:0,
    cd:Array.isArray(gx.cd)?gx.cd.slice(0,7).map(x=>num(x,-1,51)):0,pw:cleanPw(gx.pw),
    c:cards(gx.c),bd:cards(gx.bd),pot:num(gx.pot,0,1e9),f:gx.f?1:0,o:validCard(gx.o)?gx.o:-1,p:validCard(gx.p)?gx.p:-1,pe:num(gx.pe,0,1e9),b:num(gx.b,0,1e9),rid:num(gx.rid,0,1e9),ri:num(gx.ri,0,36),rt:num(gx.rt,0,3),re:Number.isFinite(+gx.re)?clamp(+gx.re,0,WHEEL_DUR):0};
}
function cleanPw(p){if(!p||typeof p!=='object'||!Array.isArray(p.s))return 0;const n=(x,lo,hi)=>Number.isFinite(+x)?clamp(Math.round(+x),lo,hi):0;
  return {c:n(p.c,0,9999),l:n(p.l,0,9999),t:n(p.t,0,9999),mu:n(p.mu,1,99),sp:p.sp?1:0,su:n(p.su,0,1e9),s:p.s.slice(0,4).map(a=>Array.isArray(a)?a.slice(0,5).map(x=>n(x,0,999)):[0,0,0,0,0]),
    my:Array.isArray(p.my)?p.my.slice(0,4).map(q=>Array.isArray(q)&&Array.isArray(q[0])?[q[0].slice(0,15).map(x=>n(x,0,14)),cleanText(q[1],10)]:0):[]};}
// Zustand des Mitspieler-Automaten nachbauen: Gewinnlinien, Angebot, Power Spins, Leiter, Karte
function remotePhase(m){
  const gx=m.rgx;if(!gx)return;const ps=gx.ps;
  if(gx.pw){const p=gx.pw,G=m.G;
    if(!m.power||m.power.count!==p.c||m.power.spinning!==!!p.sp){const old=m.power;
      const sets=p.s.map((st,si)=>{const stops=st.map((x,i)=>x%G.strips[i].length),grid=SlotEngine.grid(G,stops);const q=p.my&&p.my[si];
        let myst=null;if(q&&G.syms.includes(q[1])){myst={cells:q[0].map(v=>[v/5|0,v%5]),sym:q[1],open:true};myst.cells.forEach(([r,c])=>{grid[r][c]=q[1];});}
        const prev=old&&old.sets[si];const reels=stops.map((x,i)=>{const r=prev?prev.reels[i]:{pos:x,spin:false,stopAt:0,target:x};
          if(p.sp&&!(old&&old.count===p.c&&old.spinning)){r.spin=true;r.target=x;r.stopAt=now+.5+i*.11+si*.16;}else if(!p.sp){r.spin=false;r.pos=x;r.target=x;}return r;});
        return {stops,grid,myst,reels,ev:SlotEngine.evaluate(G,grid,m.lines,betLine(m)*p.mu)};});
      m.power={sets,spinning:!!p.sp,count:p.c,left:p.l,total:p.t,mult:p.mu,cost:0,sum:p.su,last:0};}
    m.power.left=p.l;m.power.sum=p.su;m.state='power';m.gamble=null;m.topDirty=true;m.dirty=true;return;}
  if(m.power){m.power=null;m.topDirty=true;}
  if(gx.lg){const L=gx.lg;if(!m.gamble||m.gamble.kind!=='ladder')m.gamble={kind:'ladder',n:0,busy:false,idx:L[0],last:null,t0:now,ph:0};
    const gm=m.gamble;if(gm.idx!==L[0]||gm.last!==(L[2]<0?null:L[2]))m.stateT=0;gm.idx=L[0];gm.up=!!L[1];gm.last=L[2]<0?null:L[2];m.state=ps==='gambleNext'?'gambleNext':'gamble';m.dirty=true;return;}
  if(gx.cd){const c=gx.cd;if(!m.gamble||m.gamble.kind!=='rb')m.gamble={kind:'rb',n:0,busy:false,card:null};m.gamble.card=c[0]<0?null:c[0];m.history=c.slice(1);m.state=ps==='gambleNext'?'gambleNext':'gamble';m.dirty=true;return;}
  m.gamble=null;
  if(ps==='poffer'){m.state='poffer';m.pmult=gx.pm;m.dirty=true;return;}
  if(m.reels.some(r=>r.spin))return;
  if((ps==='show'||ps==='count'||ps==='myst')&&m.grid){const ev=SlotEngine.evaluate(m.G,m.grid,m.lines,betLine(m));
    if(ev.total>0){if(m.state!=='show'||!m.present)m.present={items:[...ev.wins],idx:0,t:0};if(ev.scatter&&!m.present.items.some(i=>i.scatter))m.present.items.push({scatter:true,...ev.scatter});m.state='show';m.dirty=true;return;}}
  if(m.state==='show'||m.state==='gamble'||m.state==='gambleNext'||m.state==='poffer'||m.state==='power'){m.state='idle_r';m.present=null;m.dirty=true;}
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
  m.myst=!gx.sp&&gx.my&&m.G.syms.includes(gx.my[1])?{cells:gx.my[0].map(v=>[v/5|0,v%5]),sym:gx.my[1],open:true}:null;
  if(m.myst&&m.grid){m.grid=SlotEngine.grid(m.G,m.stops);m.myst.cells.forEach(([r,c])=>{m.grid[r][c]=m.myst.sym;});}
  if(gx.sp&&Array.isArray(gx.sp)&&m.G.special){const S=spOf(m);S.lv={KLEE:gx.sp[0],PFEN:gx.sp[1],KAEF:gx.sp[2]};S.pot=gx.sp[3];}
  m.rgx=gx;if(gx.sp===1){m.present=null;m.power=null;m.gamble=null;}else remotePhase(m);
  m.dirty=true;
}
function releaseMirror(a){const m=a.mirror;if(!m)return;a.mirror=null;setMachineGame(m,m.defG.id);m.remote=null;m.rgx=null;m.power=null;m.gamble=null;m.present=null;m.myst=null;m.demo=false;m.fs=null;m.win=0;m.disp=0;m.state='idle';m.reels.forEach(r=>{if(r.spin){r.spin=false;r.pos=Math.round(r.pos);}});slotIdleMsg(m);m.dirty=true;m.topDirty=true;}
// Roulette eines Mitspielers live mitdrehen (Rad im Zuschauer-Fenster + 3D-Tisch)
function remoteRoulette(a,gx){
  if(!a.rw)a.rw=newWheel();
  if(gx.sp&&gx.rid&&gx.rid!==a.rid){a.rid=gx.rid;wheelStart(a.rw,gx.ri,gx.re+.2);a.rwT=gx.rt;a.rwF=a.f;const r=floors[a.f]&&floors[a.f].roulettes[gx.rt];if(r)r.spin=true;}
}
function stepMirrors(dt){
  MP.avatars.forEach(a=>{if(!a.rw)return;const busy=!!a.rw.anim,res=wheelStep(a.rw,dt,false);
    if(busy&&res!==null){const r=floors[a.rwF]&&floors[a.rwF].roulettes[a.rwT];if(r)r.spin=false;}});
  if(watchBest&&watchBest.rw&&watchBest.gx&&watchBest.gx.g==='roulette'){const c=$('#wcWheel');if(c&&!c.hidden)drawWheelCanvas(c.getContext('2d'),c.width,watchBest.rw);}
  allMachines().forEach(m=>{if(!m.remote)return;m.stateT+=dt;
    if(m.reels.some(r=>r.spin)){updReels(m,dt);}
    if(m.state==='rstop'&&!m.reels.some(r=>r.spin)){m.state='idle_r';remotePhase(m);}
    if(m.power){let any=false;m.power.sets.forEach(S=>S.reels.forEach(r=>{if(!r.spin)return;any=true;r.pos-=24*dt;if(now>=r.stopAt){r.spin=false;r.pos=r.target;}}));if(any)m.dirty=true;}
    if(m.present&&m.present.items.length&&m.state==='show'){m.present.t+=dt;if(m.present.t>1.1){m.present.t=0;m.present.idx=(m.present.idx+1)%m.present.items.length;}m.dirty=true;}
    if(m.state==='gamble'||m.state==='gambleNext'||m.state==='poffer'||m.state==='power')m.dirty=true;});
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
  let best=null,bd=2.6;
  if(!focus&&!openId)MP.avatars.forEach(a=>{if(!a.gx||a.f!==floorIdx||a.gx.g==='slot')return;const d=Math.hypot(a.m.g.position.x-P.x,a.m.g.position.z-P.z)-(a.gx.g==='roulette'?0:1.9);if(d<bd){bd=d;best=a;}});
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
