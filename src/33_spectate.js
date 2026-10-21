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
    return {g:'slot',gid:m.G.id,mi:allMachines().indexOf(m),st:m.stops.slice(),sp:m.state==='spin'?1:0,sid:m.spinId||0,el:m.state==='spin'?Math.round((now-(m.spinT||now))*100)/100:0,fa:m.spinFast||1,uf:m.useFs==='buy'?2:(m.useFs?1:0),w:Math.round(m.disp),msg:cleanText(m.msg,40),l:m.lines,bi:m.betIdx,
      fs:m.fs?[m.fs.n,m.fs.total]:0,sx:m.fs&&m.fs.special?(Array.isArray(m.fs.special)?m.fs.special:[m.fs.special]):0,db:m.dbl?1:0,sh:m.fs?m.fs.sh||0:0,
      gr:m.state!=='spin'&&m.grid?[0,1,2].flatMap(r=>m.grid[r].map(s=>m.G.syms.indexOf(s))):0,ww:m.ww&&m.ww.length?m.ww.map(w=>[w.c,w.r,w.h,w.fresh?1:0]):0,hd:m.ssHeld?Object.keys(m.ssHeld).map(k=>{const [r,c]=k.split(',');return r*5+ +c;}):0,gm:m.gamble?(m.gamble.kind==='ladder'?'LEITER':'KARTE'):'',my:m.myst&&m.myst.open&&m.state!=='spin'?[m.myst.cells.map(q=>q[0]*5+q[1]),m.myst.sym]:0,
      ps:m.state,pm:m.pmult||0,ls:m.sp?[m.sp.lv.KLEE,m.sp.lv.PFEN,m.sp.lv.KAEF,m.sp.pot]:0,
      lg:m.gamble&&m.gamble.kind==='ladder'?[m.gamble.idx,m.gamble.up?1:0,m.gamble.last===null?-1:m.gamble.last]:0,
      cd:m.gamble&&m.gamble.kind==='rb'?[m.gamble.card===null?-1:m.gamble.card].concat(m.history.slice(0,6)):0,
      pw:m.power?{c:m.power.count,l:m.power.left,t:m.power.total,mu:m.power.mult,sp:m.power.spinning?1:0,su:m.power.sum,s:m.power.sets.map(S=>S.stops.slice()),my:m.power.sets.map(S=>S.myst?[S.myst.cells.map(q=>q[0]*5+q[1]),S.myst.sym]:0)}:0};}
  }
// Weitere eigene Automaten (Karte steckt), die gerade laufen: alle im Raum sehen sie drehen (max. 4, der Hauptautomat steht schon in gx)
function mpActivityList(){
  if(typeof RESVS==='undefined'||!RESVS.size)return 0;
  const main=mpActivity(),mainMi=main&&main.g==='slot'?main.mi:-1,L=allMachines(),out=[];
  for(const m of RESVS){const mi=L.indexOf(m);if(mi<0||mi===mainMi)continue;if(m.state==='idle'&&!m.auto&&!m.fs)continue;out.push(slotGx(m));if(out.length>=4)break;}
  return out.length?out:0;
}
function mpActivity2(){
  if(focus.type==='poker'){const h=PK.human;return {g:'poker',c:h.hole.slice(0,2),bd:PK.board.slice(0,5),pot:potTotal(),msg:cleanText(PK.info||PK.msg||'',40),f:h.folded?1:0};}
  if(focus.type==='hilo'){return {g:'hilo',o:HL.open===null?-1:HL.open,p:HL.pick>=0&&HL.state!=='pick'?HL.hidden[HL.pick]:-1,pe:HL.pending,msg:cleanText(HL.msg||'',40)};}
  return null;
}
// Automat, in dem ein Mitspieler seine Karte stecken hat (Name oder '')
function machineHeld(m){const i=allMachines().indexOf(m);let n='';MP.avatars.forEach(a=>{if(a.rs===i||(a.rl&&a.rl.includes(i)))n=a.name||'Jemand';});return n;}
const GNAME={slot:'AUTOMAT',poker:'POKER',hilo:'HÖHER/TIEFER',roulette:'ROULETTE'};
function cleanGx(gx){
  if(!gx||typeof gx!=='object'||!GNAME[gx.g])return null;
  const num=(x,lo,hi)=>Number.isFinite(+x)?clamp(Math.round(+x),lo,hi):0;
  const cards=a=>Array.isArray(a)?a.filter(validCard).slice(0,5):[];
  return {g:gx.g,sid:num(gx.sid,0,1e9),el:Number.isFinite(+gx.el)?clamp(+gx.el,0,30):0,fa:+gx.fa===.75?.75:1,uf:+gx.uf===2?2:(gx.uf?1:0),gid:typeof gx.gid==='string'&&SlotEngine.GAMES[gx.gid]?gx.gid:'',mi:num(gx.mi,-1,99),st:Array.isArray(gx.st)?gx.st.slice(0,5).map(x=>num(x,0,999)):null,sp:gx.sp?1:0,w:num(gx.w,0,1e9),msg:cleanText(gx.msg,40),
    l:num(gx.l,1,20),bi:num(gx.bi,0,20),fs:Array.isArray(gx.fs)?[num(gx.fs[0],0,999),num(gx.fs[1],0,999)]:0,sx:Array.isArray(gx.sx)?gx.sx.slice(0,2).map(x=>cleanText(x,10)):(gx.sx?[cleanText(gx.sx,10)]:[]),
    db:gx.db?1:0,sh:num(gx.sh,0,999),gr:Array.isArray(gx.gr)&&gx.gr.length===15?gx.gr.map(x=>num(x,-1,40)):0,
    ww:Array.isArray(gx.ww)?gx.ww.slice(0,5).filter(Array.isArray).map(w=>[num(w[0],0,4),num(w[1],0,2),num(w[2],1,3),w[3]?1:0]):0,hd:Array.isArray(gx.hd)?gx.hd.slice(0,15).map(x=>num(x,0,14)):0,gm:cleanText(gx.gm,8),my:Array.isArray(gx.my)&&Array.isArray(gx.my[0])?[gx.my[0].slice(0,15).map(x=>num(x,0,14)),cleanText(gx.my[1],10)]:0,
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
  if(ps==='ssSpin'){if(m.state!=='ssSpin'){m.state='ssSpin';m.present=null;}m.dirty=true;return;}
  if((ps==='expand'||ps==='expandShow')&&m.fs&&m.fs.special&&m.grid){if(!m.expand){const ev=SlotEngine.evaluate(m.G,m.grid,m.lines,payLine(m),m.fs.special,true);
      if(ev.expand)m.expand={reels:ev.expand.reels,sym:ev.expand.sym,list:ev.expand.list,p:1,amount:ev.expand.amount};}m.state='expand';m.dirty=true;return;}
  if(m.expand&&ps!=='expand'&&ps!=='expandShow'){m.expand=null;}
  if(m.reels.some(r=>r.spin))return;
  if((ps==='show'||ps==='count'||ps==='myst'||ps==='fsShow')&&m.grid){const ev=SlotEngine.evaluate(m.G,m.grid,m.lines,payLine(m));
    if(ev.total>0){if(m.state!=='show'||!m.present)m.present={items:[...ev.wins],idx:0,t:0};if(ev.scatter&&!m.present.items.some(i=>i.scatter))m.present.items.push({scatter:true,...ev.scatter});m.state='show';m.dirty=true;return;}}
  if(m.state==='show'||m.state==='gamble'||m.state==='gambleNext'||m.state==='poffer'||m.state==='power'){m.state='idle_r';m.present=null;m.dirty=true;}
}
// Automat eines Mitspielers in der eigenen Welt nachspielen
function mirrorSlot(a,gx,credit){
  const list=allMachines(),m=list[gx.mi];
  if(a.mirror&&a.mirror!==m){const old=a.mirror;a.mirror=null;releaseOne(old);}
  if(!m||m.npc||(focus&&focus.m===m)||isMine(m))return;
  if(a.mirrors&&a.mirrors.has(m))a.mirrors.delete(m);
  a.mirror=m;mirrorInto(a,m,gx,credit);
}
// weitere laufende Automaten desselben Mitspielers (Presence gl)
function mirrorExtras(a,list,credit){
  const L=allMachines(),keep=new Set();
  (list||[]).forEach(gx=>{const m=L[gx.mi];if(!m||m.npc||m===a.mirror||(focus&&focus.m===m)||isMine(m))return;
    if(m.remote&&m.remote.peer&&m.remote.peer!==a.peer)return; // gehört gerade einem anderen Mitspieler
    if(!a.mirrors)a.mirrors=new Set();a.mirrors.add(m);keep.add(m);mirrorInto(a,m,gx,credit);});
  if(a.mirrors)[...a.mirrors].forEach(m=>{if(!keep.has(m)){a.mirrors.delete(m);releaseOne(m);}});
}
function mirrorInto(a,m,gx,credit){
  m.remote={name:a.name,credit,peer:a.peer};m.demo=true;
  if(gx.gid&&m.G.id!==gx.gid)setMachineGame(m,gx.gid);
  m.lines=m.G.lineOpts.includes(gx.l)?gx.l:m.lines;m.betIdx=Math.min(gx.bi,m.G.betOpts.length-1);
  m.msg=gx.msg;m.disp=gx.w;m.win=gx.w;
  m.dbl=!!gx.db;
  const sxs=(gx.sx||[]).filter(x=>m.G.syms.includes(x)),spc=m.G.free&&m.G.free.expanding&&sxs.length?(sxs.length>1?sxs:sxs[0]):null;
  if(gx.fs&&!m.fs){m.fs={n:gx.fs[0],total:gx.fs[1],left:0,sh:gx.sh,special:spc};m.topDirty=true;}
  if(m.fs&&gx.fs){m.fs.n=gx.fs[0];m.fs.total=gx.fs[1];m.fs.special=spc;if(m.fs.sh!==gx.sh){m.fs.sh=gx.sh;m.topDirty=true;}}
  if(!gx.fs&&m.fs){m.fs=null;m.topDirty=true;}
  // neuer Spin: Ergebnis steht schon fest -> Walzen im selben Takt wie beim Spieler drehen und anhalten lassen
  if(gx.sp&&gx.sid&&gx.sid!==m.rSid&&gx.st&&gx.st.length===5){m.rSid=gx.sid;m.state='rstop';m.present=null;m.expand=null;m.ssHeld=null;m.ovr=null;m.myst=null;
    m.stops=gx.st.map((s,i)=>s%SlotEngine.stripsOf(m.G,(gx.uf===2?'buy':!!gx.uf))[i].length);m.useFs=gx.uf===2?'buy':!!gx.uf;m.grid=SlotEngine.grid(m.G,m.stops,(gx.uf===2?'buy':!!gx.uf));const el=gx.el||0,f=gx.fa||1;
    m.reels.forEach((r,i)=>{if(m.G.special&&i!==2)return;r.spin=true;r.target=m.stops[i];r.teased=false;r.land=null;r.vel=0;r.speed=28;
      r.t0=now-el+i*.045;r.stopAt=Math.max(now+.05+i*.06,now-el+(m.G.special?.75:(.55+i*.2))*f);});}
  else if(gx.sp&&m.state!=='rspin'&&m.state!=='rstop'){m.state='rspin';m.present=null;m.expand=null;m.ssHeld=null;m.ovr=null;m.reels.forEach((r,i)=>{if(m.G.special&&i!==2)return;r.spin=true;r.speed=24;r.stopAt=now+30;});}
  if(!gx.sp&&gx.st&&gx.st.length===5){
    const same=gx.st.every((s,i)=>m.stops[i]===s);
    if((!same&&m.state!=='rstop')||m.state==='rspin'){m.useFs=gx.uf===2?'buy':!!gx.uf;m.stops=gx.st.map((s,i)=>s%SlotEngine.stripsOf(m.G,(gx.uf===2?'buy':!!gx.uf))[i].length);m.grid=SlotEngine.grid(m.G,m.stops,(gx.uf===2?'buy':!!gx.uf));
      m.reels.forEach((r,i)=>{if(m.G.special&&i!==2){r.pos=r.target=m.stops[i];return;}r.target=m.stops[i];if(!r.spin){r.spin=true;r.speed=24;}r.stopAt=now+.1+i*.15;r.teased=false;});m.state='rstop';}
  }
  m.myst=!gx.sp&&gx.my&&m.G.syms.includes(gx.my[1])?{cells:gx.my[0].map(v=>[v/5|0,v%5]),sym:gx.my[1],open:true}:null;
  if(m.myst&&m.grid){m.grid=SlotEngine.grid(m.G,m.stops);m.myst.cells.forEach(([r,c])=>{m.grid[r][c]=m.myst.sym;});}
  if(Array.isArray(gx.ls)&&m.G.special){const S=spOf(m);S.lv={KLEE:gx.ls[0],PFEN:gx.ls[1],KAEF:gx.ls[2]};S.pot=gx.ls[3];} // Alles Spitze: Türme und Cashpot
  if(!gx.sp&&gx.gr&&m.grid&&!m.reels.some(r=>r.spin)){const gg=[0,1,2].map(r=>[0,1,2,3,4].map(c=>{const k=gx.gr[r*5+c];return k>=0&&m.G.syms[k]?m.G.syms[k]:m.grid[r][c];}));
    if(m.G.free&&m.G.free.superspin){const base=SlotEngine.grid(m.G,m.stops,!!m.fs);m.ovr=gg.some((row,r)=>row.some((s,c)=>s!==base[r][c]))?gg:null;}
    m.grid=gg;}
  m.ssHeld=gx.hd?Object.fromEntries(gx.hd.map(v=>[(v/5|0)+','+(v%5),1])):null;
  if(m.G.walkWild){const ww=gx.ww?gx.ww.map(w=>({c:w[0],r:w[1],h:w[2],fresh:!!w[3]})):[];const key=JSON.stringify(gx.ww||0);
    if(key!==m.wwKey){m.wwKey=key;m.ww=ww;m.wwc=wwCells(ww);m.wwT=now;}}
  m.rgx=gx;if(gx.sp===1){m.present=null;m.power=null;m.gamble=null;}else remotePhase(m);
  m.dirty=true;
}
function releaseMirror(a){if(a.mirrors){a.mirrors.forEach(releaseOne);a.mirrors.clear();}const m=a.mirror;if(!m)return;a.mirror=null;releaseOne(m);}
function releaseOne(m){setMachineGame(m,m.defG.id);m.remote=null;m.rgx=null;m.power=null;m.gamble=null;m.present=null;m.myst=null;m.demo=false;m.fs=null;m.ww=[];m.wwc=null;m.wwKey='';m.ssHeld=null;m.ovr=null;m.expand=null;m.dbl=false;m.win=0;m.disp=0;m.state='idle';m.reels.forEach(r=>{if(r.spin){r.spin=false;r.pos=Math.round(r.pos);}});slotIdleMsg(m);m.dirty=true;m.topDirty=true;}
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
    if(m.state==='gamble'||m.state==='gambleNext'||m.state==='poffer'||m.state==='power'||m.state==='ssSpin'||m.expand||(m.ww&&m.ww.length))m.dirty=true;});
}
function mpApplyActivity(a,pr){
  const gx=cleanGx(pr.gx);a.gx=gx;
  const credit=typeof pr.k==='number'?pr.k:0;
  if(gx&&gx.g==='slot'&&a.f===floorIdx)mirrorSlot(a,gx,credit);
  else if(a.mirror){const old=a.mirror;a.mirror=null;releaseOne(old);}
  mirrorExtras(a,a.f===floorIdx&&Array.isArray(pr.gl)?pr.gl.slice(0,4).map(cleanGx).filter(x=>x&&x.g==='slot'):[],credit);
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
