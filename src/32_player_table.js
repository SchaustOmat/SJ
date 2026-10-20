/* =========================================================
   SPIELERTISCHE: Texas Hold'em nur mit echten Mitspielern
   Pro Tisch ist ein sitzender Spieler die "Bank" (Autorität): die bisherige Bank bleibt,
   sonst übernimmt die kleinste Peer-ID. Alles läuft über die Presence:
     ts = Platzwunsch {t:Tisch,s,b,tok}   ta = Aktion {t,h,k,a,x}   tt = Tischzustand (nur Bank, mit id)
   ========================================================= */
const MT_N=6,MT_TURN=25000;
const MT={tok:'',buy:0,deducted:'',table:'',raiseTo:0,turnKey:'',feed:[]};
const TABLES={};
const TEXR=T; // globale Texturen (T wird unten lokal für Tische benutzt)
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const validCard=c=>Number.isInteger(c)&&c>=0&&c<52;
function mtSeatPos(T,i,r){const a=Math.PI/2+i*TAU/MT_N;return {x:T.cx+Math.cos(a)*r,z:T.cz+Math.sin(a)*r,a};}
function isBetting(V){return V&&(V.stage==='pre'||V.stage==='flop'||V.stage==='turn'||V.stage==='river');}
const potOf=V=>V?V.seats.reduce((a,s)=>a+(s?s.t:0),0):0;

/* ---------- 3D ---------- */
function buildMTable(F,o){
  const T={id:o.id,name:o.name,F,floor:o.floor,cx:o.x,cz:o.z,R:1.75,sb:o.sb,bb:o.bb,buy:o.buy,color:o.color,
    seats3d:[],board3d:[],S:null,deck:[],deckHand:-1,lastK:{},lastTT:null,authId:null,view:null,viewKey:'',lastPub:0,lastActs:{},lastBoard:0};
  TABLES[T.id]=T;
  const g=new THREE.Group();g.position.set(T.cx,0,T.cz);F.group.add(g);
  const felt=upTex(64,64,pokerFeltT,4);
  mesh(new THREE.CylinderGeometry(1.15,1.15,.1,56),[lam({map:TEXR.wood}),lam({map:felt}),lam({map:TEXR.wood})],0,.84,0,g);
  mesh(new THREE.CylinderGeometry(1.25,1.25,.12,56),lam({color:0x2a1408}),0,.82,0,g);
  mesh(new THREE.CylinderGeometry(.3,.55,.76,24),lam({color:0x120c18}),0,.38,0,g);
  box(1.6,.08,.6,bas({color:o.color}),0,3.2,0,g);
  const act={type:'mtable',T,label:T.name,sub:'Hold\'em mit echten Leuten · Blinds '+(T.sb/100)+'/'+(T.bb/100)+' €',pos:new THREE.Vector3(T.cx,1,T.cz),reach:2.9};
  tagAct(F,g,act);col(F,T.cx,T.cz,2.5,2.5);
  for(let i=0;i<MT_N;i++){
    const p=mtSeatPos(T,i,T.R);
    const st=new THREE.Group();st.position.set(p.x,0,p.z);F.group.add(st);
    mesh(new THREE.CylinderGeometry(.04,.14,.6,16),lam({color:0x2a2a30}),0,.3,0,st);
    mesh(new THREE.CylinderGeometry(.24,.24,.09,24),lam({color:o.stool}),0,.62,0,st);
    st.traverse(m=>{if(m.isMesh){m.userData.act=act;F.hits.push(m);}});
    const lab=spriteLabel(192,56,.2);lab.position.set(p.x,1.95,p.z);F.group.add(lab);
    const cp=mtSeatPos(T,i,.78),ry=Math.atan2(Math.cos(p.a),Math.sin(p.a));
    const cards=[-1,1].map(side=>{const m=makeCard(F.group);
      m.position.set(cp.x+Math.cos(p.a+Math.PI/2)*.15*side,.9,cp.z+Math.sin(p.a+Math.PI/2)*.15*side);m.rotation.y=ry;m.visible=false;return m;});
    const chipsG=new THREE.Group();const c2=mtSeatPos(T,i,.5);chipsG.position.set(c2.x,.9,c2.z);F.group.add(chipsG);
    T.seats3d.push({lab,cards,chipsG,key:''});
  }
  for(let i=0;i<5;i++){const m=makeCard(F.group);m.position.set(T.cx-.62+i*.31,.9,T.cz);m.visible=false;T.board3d.push(m);}
  T.potSprite=spriteLabel(256,64,.2);T.potSprite.position.set(T.cx,1.12,T.cz-.42);F.group.add(T.potSprite);
  const dbt=labelTex(32,32,c=>{c.fillStyle='#f4f0e8';c.beginPath();c.arc(16,16,15,0,TAU);c.fill();c.fillStyle='#141018';px(c,14);c.textAlign='center';c.textBaseline='middle';c.fillText('D',16,17);});
  T.dbtn=mesh(new THREE.CylinderGeometry(.07,.07,.02,12),[lam({color:0xe8e8e8}),lam({map:dbt}),lam({color:0xe8e8e8})],T.cx,.9,T.cz,F.group);T.dbtn.visible=false;
  sign(F,T.name,'#'+o.color.toString(16).padStart(6,'0'),T.cx,3.55,T.cz,0,.4);
  mtRender(T,null);return T;
}
function mtLabel(T,i,s,V){
  const S3=T.seats3d[i];const turn=V&&V.toAct===i&&isBetting(V);
  const key=s?[s.n,s.st,s.l,turn,s.p===MP.myPeer].join('|'):'free';if(S3.key===key)return;S3.key=key;
  const t=S3.lab.userData.tex,c=t.userData.ctx;c.clearRect(0,0,192,56);
  c.fillStyle=turn?'rgba(255,207,58,.94)':'rgba(10,6,16,.84)';c.fillRect(0,0,192,56);
  c.strokeStyle=s&&s.p===MP.myPeer?'#29f0ff':s?'#ffcf3a':'#3a2c52';c.lineWidth=2;c.strokeRect(1,1,190,54);
  c.textAlign='center';c.textBaseline='middle';
  if(!s){px(c,10);c.fillStyle='#6a5a88';c.fillText('FREI',96,28);t.needsUpdate=true;return;}
  px(c,10);c.fillStyle=turn?'#140e18':'#f4f0e8';c.fillText(s.n,96,13);
  c.fillStyle=turn?'#140e18':'#ffcf3a';c.fillText(fmt(s.st),96,31);
  px(c,8);c.fillStyle=turn?'#3a1a00':'#9b8fb3';c.fillText(turn?'IST DRAN':(s.l||''),96,47);t.needsUpdate=true;
}
function mtRender(T,V){
  for(let i=0;i<MT_N;i++){
    const s=V?V.seats[i]:null,S3=T.seats3d[i];mtLabel(T,i,s,V);
    const show=V&&s&&s.c&&!s.f;
    S3.cards.forEach((m,k)=>{
      if(!show){m.visible=false;return;}
      m.visible=true;const mine=s.p===MP.myPeer,reveal=V.stage==='show'&&V.rv;
      if(mine||reveal){if(m.userData.face!==s.c[k])setCardFace(m,s.c[k]);}else if(m.userData.face!==null)setCardBack(m);
    });
    setStack(S3.chipsG,s?s.b:0);
  }
  T.board3d.forEach((m,i)=>{const c=V&&V.board[i];if(c===undefined||!V){m.visible=false;return;}m.visible=true;if(m.userData.face!==c)setCardFace(m,c);});
  if(V&&V.dealer>=0&&V.seats[V.dealer]){const p=mtSeatPos(T,V.dealer,.95);T.dbtn.position.set(p.x,.9,p.z);T.dbtn.visible=true;}else T.dbtn.visible=false;
  const t=T.potSprite.userData.tex,c=t.userData.ctx;c.clearRect(0,0,256,64);
  c.fillStyle='rgba(10,6,16,.85)';c.fillRect(0,0,256,64);c.strokeStyle='#'+T.color.toString(16).padStart(6,'0');c.lineWidth=2;c.strokeRect(1,1,254,62);
  c.textAlign='center';c.textBaseline='middle';px(c,11);c.fillStyle='#ffcf3a';
  c.fillText(isBetting(V)?'POT '+fmt(potOf(V)):V&&V.stage==='show'?'SHOWDOWN':T.name,128,18);
  fitText(c,V?V.msg||'':'NUR ECHTE SPIELER · '+(T.sb/100)+'/'+(T.bb/100)+' €',128,44,248,8);
  t.needsUpdate=true;
}

/* ---------- Bank-Logik (nur Autorität) ---------- */
function mtFresh(T){return {id:T.id,v:1,hand:0,stage:'wait',seats:new Array(MT_N).fill(null),board:[],dealer:-1,toAct:-1,curBet:0,minRaise:T.bb,msg:'',dl:0,adv:0,next:0,rv:0};}
function mtNext(S,i,pred){for(let k=1;k<=MT_N;k++){const j=((i+k)%MT_N+MT_N)%MT_N,s=S.seats[j];if(s&&pred(s))return j;}return -1;}
const mtLive=s=>s&&s.c&&!s.f;const mtCan=s=>mtLive(s)&&!s.a;
function mtPost(S,i,amt,lbl){const s=S.seats[i],a=Math.min(amt,s.st);s.st-=a;s.b+=a;s.t+=a;if(!s.st)s.a=1;s.l=lbl;}
function mtStartHand(T,S){
  const ids=[];S.seats.forEach((s,i)=>{if(s&&!s.gone&&s.st>0)ids.push(i);});if(ids.length<2)return false;
  const deck=[...Array(52).keys()];for(let i=51;i>0;i--){const j=Math.random()*(i+1)|0;[deck[i],deck[j]]=[deck[j],deck[i]];}
  S.hand++;T.deck=deck;T.deckHand=S.hand;S.board=[];S.rv=0;
  S.seats.forEach(s=>{if(s){s.b=0;s.t=0;s.a=0;s.l='';s.acted=0;s.c=null;s.f=1;}});
  ids.forEach(i=>{const s=S.seats[i];s.f=0;s.c=[deck.pop(),deck.pop()];});
  S.dealer=mtNext(S,S.dealer<0?MT_N-1:S.dealer,s=>s.c);
  const sb=ids.length===2?S.dealer:mtNext(S,S.dealer,s=>s.c),bb=mtNext(S,sb,s=>s.c);
  mtPost(S,sb,T.sb,'SMALL BLIND');mtPost(S,bb,T.bb,'BIG BLIND');
  S.curBet=T.bb;S.minRaise=T.bb;S.stage='pre';S.msg='PREFLOP';
  S.toAct=mtNext(S,bb,mtCan);S.dl=Date.now()+MT_TURN;mtSettle(T,S);return true;
}
function mtSettle(T,S){
  if(!isBetting(S)||S.adv)return;
  const live=S.seats.filter(mtLive);if(live.length<=1){mtUncontested(S);return;}
  const ca=S.seats.filter(mtCan);
  const done=ca.length===0||(ca.length===1&&ca[0].b>=S.curBet)||ca.every(x=>x.acted&&x.b===S.curBet);
  if(done){S.toAct=-1;S.adv=Date.now()+700;}
  else if(S.toAct<0||!mtCan(S.seats[S.toAct])){S.toAct=mtNext(S,S.toAct<0?S.dealer:S.toAct,mtCan);S.dl=Date.now()+MT_TURN;}
}
function mtApply(T,S,i,act,to){
  const s=S.seats[i];if(!s||S.toAct!==i||!mtCan(s)||S.adv)return false;
  const toCall=Math.max(0,S.curBet-s.b);
  if(act==='check'&&toCall>0)act='call';
  if(act==='fold'){s.f=1;s.l='FOLD';}
  else if(act==='check'){s.l='CHECK';}
  else if(act==='call'){const a=Math.min(toCall,s.st);s.st-=a;s.b+=a;s.t+=a;s.l=!s.st?'ALL IN':toCall?'CALL '+fmt(a):'CHECK';if(!s.st)s.a=1;}
  else if(act==='raise'){
    const max=s.b+s.st,min=Math.min(max,S.curBet+S.minRaise);to=clamp(Math.floor(+to)||0,min,max);
    if(to<=S.curBet)return mtApply(T,S,i,'call');
    const a=to-s.b;s.st-=a;s.b=to;s.t+=a;const inc=to-S.curBet;
    if(inc>=S.minRaise){S.minRaise=inc;S.seats.forEach(o=>{if(o&&o!==s)o.acted=0;});}S.curBet=to;
    if(!s.st){s.a=1;s.l='ALL IN '+fmt(to);}else s.l=(toCall?'RAISE ':'BET ')+fmt(to);
  } else return false;
  s.acted=1;S.toAct=mtNext(S,i,mtCan);S.dl=Date.now()+MT_TURN;mtSettle(T,S);return true;
}
function mtStreet(T,S){
  S.seats.forEach(s=>{if(s){s.b=0;s.acted=0;if(mtCan(s))s.l='';}});S.curBet=0;S.minRaise=T.bb;
  const d=T.deck;
  if(S.stage==='pre'){S.board.push(d.pop(),d.pop(),d.pop());S.stage='flop';S.msg='FLOP';}
  else if(S.stage==='flop'){S.board.push(d.pop());S.stage='turn';S.msg='TURN';}
  else if(S.stage==='turn'){S.board.push(d.pop());S.stage='river';S.msg='RIVER';}
  else{mtShowdown(S);return;}
  if(S.seats.filter(mtCan).length<=1){S.toAct=-1;S.adv=Date.now()+1300;return;}
  S.toAct=mtNext(S,S.dealer,mtCan);S.dl=Date.now()+MT_TURN;
}
function mtUncontested(S){
  const w=S.seats.find(mtLive);const pot=potOf(S);
  if(w){w.st+=pot;w.l='+'+fmt(pot);S.msg=w.n+' GEWINNT '+fmt(pot);}
  mtEndHand(S,3500,0);
}
function mtShowdown(S){
  const arr=S.seats.map(s=>s?{total:s.t,folded:!mtLive(s)}:{total:0,folded:true});
  const sc=S.seats.map(s=>mtLive(s)?PokerCore.evalBest(s.c.concat(S.board)):-1);
  const won=new Array(MT_N).fill(0);
  PokerCore.pots(arr).forEach(p=>{if(!p.elig.length)return;let best=-1;p.elig.forEach(i=>{if(sc[i]>best)best=sc[i];});
    const ws=p.elig.filter(i=>sc[i]===best),sh=Math.floor(p.amount/ws.length);ws.forEach(i=>won[i]+=sh);won[ws[0]]+=p.amount-sh*ws.length;});
  let bi=-1;won.forEach((w,i)=>{const s=S.seats[i];if(!s)return;if(mtLive(s))s.l=PokerCore.handName(sc[i]);if(w>0){s.st+=w;s.l='+'+fmt(w)+' '+PokerCore.handName(sc[i]);if(bi<0||sc[i]>sc[bi])bi=i;}});
  S.msg=bi>=0?S.seats[bi].n+' GEWINNT · '+PokerCore.handName(sc[bi]):'';
  mtEndHand(S,6500,1);
}
function mtEndHand(S,ms,reveal){S.stage='show';S.rv=reveal;S.toAct=-1;S.adv=0;S.seats.forEach(s=>{if(s){s.b=0;s.t=0;}});S.next=Date.now()+ms;}
function mtCleanup(S){
  S.seats.forEach((s,i)=>{if(!s)return;if(s.gone){S.seats[i]=null;return;}s.t=0;s.b=0;s.c=null;s.f=1;s.a=0;if(s.l&&s.l[0]!=='+')s.l='';if(s.st<=0)s.l='PLEITE';});
  S.stage='wait';S.board=[];S.rv=0;S.next=0;S.curBet=0;
}
function mtRefundHand(S){
  if(S.stage==='show'){mtCleanup(S);return;}
  S.seats.forEach(s=>{if(!s)return;s.st+=s.t;s.t=0;s.b=0;s.c=null;s.f=1;s.a=0;s.l='';});
  S.stage='wait';S.board=[];S.toAct=-1;S.adv=0;S.next=0;S.rv=0;S.msg='HAND ABGEBROCHEN, EINSÄTZE ZURÜCK';
}
function mtPeerPresence(p){if(p===MP.myPeer)return MP.me;const x=(MP.peersAll||[]).find(q=>q.peer===p);return x?x.presence||{}:null;}
function mtEachPeer(fn){(MP.peersAll||[]).forEach(q=>{if(!q.isMe&&q.kind==='viewer')fn(q.peer,q.presence||{});});if(MP.myPeer)fn(MP.myPeer,MP.me);}
function mtRequests(T){
  const out={};
  mtEachPeer((p,pr)=>{const r=pr.ts;if(!r||typeof r!=='object'||r.t!==T.id)return;const tok=typeof r.tok==='string'?r.tok.slice(0,12):'';if(!tok)return;
    out[p]={s:Number.isInteger(r.s)?r.s:-1,b:clamp(Math.floor(+r.b)||0,0,1e9),tok,n:cleanText(pr.n,14)||'GAST'};});
  return out;
}
function mtAuthTick(T){
  const S=T.S,t=Date.now();let ch=false;const reqs=mtRequests(T);
  S.seats.forEach((s,i)=>{if(!s||s.gone)return;const r=reqs[s.p];
    if(!r||r.tok!==s.tok){if(isBetting(S)&&mtLive(s)){s.f=1;s.gone=1;s.l='WEG';if(S.toAct===i){S.toAct=mtNext(S,i,mtCan);S.dl=t+MT_TURN;}mtSettle(T,S);}else if(S.stage==='show'&&s.c)s.gone=1;else S.seats[i]=null;ch=true;}});
  for(const p in reqs){
    if(S.seats.some(s=>s&&s.p===p&&!s.gone))continue;const r=reqs[p];if(r.b<T.bb*5)continue;
    const idx=r.s>=0&&r.s<MT_N&&!S.seats[r.s]?r.s:S.seats.findIndex(x=>!x);if(idx<0)continue;
    S.seats[idx]={p,n:r.n,tok:r.tok,st:r.b,b:0,t:0,f:1,a:0,l:'NEU',c:null,acted:0};ch=true;
  }
  if(isBetting(S)&&S.toAct>=0&&!S.adv){const s=S.seats[S.toAct];
    const pr=s&&mtPeerPresence(s.p),ta=pr&&pr.ta;
    if(ta&&ta.t===T.id&&ta.h===S.hand&&+ta.k>(T.lastK[s.p]||0)){T.lastK[s.p]=+ta.k;if(mtApply(T,S,S.toAct,String(ta.a),ta.x))ch=true;}
    else if(t>S.dl){const tc=S.curBet>s.b;mtApply(T,S,S.toAct,tc?'fold':'check');s.l+=' (ZEIT)';ch=true;}
  }
  if(S.adv&&t>=S.adv){S.adv=0;mtStreet(T,S);ch=true;}
  if(S.stage==='show'&&t>=S.next){mtCleanup(S);ch=true;}
  if(S.stage==='wait'){
    const n=S.seats.filter(s=>s&&!s.gone&&s.st>0).length;
    const msg=n>=2?'NÄCHSTE HAND GLEICH':n?'WARTE AUF MITSPIELER':'TISCH FREI';
    if(S.msg!==msg&&!(S.msg.startsWith('HAND ABG')&&S.next)){S.msg=msg;ch=true;}
    if(n>=2){if(!S.next)S.next=t+3000;else if(t>=S.next){S.next=0;mtStartHand(T,S);ch=true;}}else S.next=0;
  }
  if(ch||t-T.lastPub>2000){S.v++;T.lastPub=t;MP.me.tt=mtPack(S);MP.dirty=true;}
}
function mtPack(S){return {id:S.id,v:S.v,hand:S.hand,stage:S.stage,board:S.board.slice(),dealer:S.dealer,toAct:S.toAct,curBet:S.curBet,minRaise:S.minRaise,msg:S.msg,dl:S.dl,rv:S.rv,
  seats:S.seats.map(s=>s?{p:s.p,n:s.n,tok:s.tok,st:s.st,b:s.b,t:s.t,f:s.f,a:s.a,l:s.l,c:s.c,acted:s.acted,gone:s.gone||0}:null)};}
function mtUnpack(T,tt){
  if(!tt||typeof tt!=='object'||tt.id!==T.id||!Array.isArray(tt.seats)||tt.seats.length!==MT_N)return null;
  const num=(x,d)=>Number.isFinite(+x)?+x:d;
  return {id:T.id,v:num(tt.v,0),hand:num(tt.hand,0)|0,stage:['wait','pre','flop','turn','river','show'].includes(tt.stage)?tt.stage:'wait',
    board:Array.isArray(tt.board)?tt.board.filter(validCard).slice(0,5):[],dealer:num(tt.dealer,-1)|0,toAct:num(tt.toAct,-1)|0,curBet:Math.max(0,num(tt.curBet,0)),
    minRaise:Math.max(T.bb,num(tt.minRaise,T.bb)),msg:cleanText(tt.msg,48),dl:num(tt.dl,0),rv:tt.rv?1:0,adv:0,next:0,
    seats:tt.seats.map(s=>{if(!s||typeof s!=='object'||typeof s.p!=='string')return null;
      return {p:s.p.slice(0,64),n:cleanText(s.n,14)||'GAST',tok:String(s.tok||'').slice(0,12),st:Math.max(0,num(s.st,0)),b:Math.max(0,num(s.b,0)),t:Math.max(0,num(s.t,0)),
        f:s.f?1:0,a:s.a?1:0,l:cleanText(s.l,24),c:Array.isArray(s.c)&&s.c.length===2&&s.c.every(validCard)?s.c.slice():null,acted:s.acted?1:0,gone:s.gone?1:0};})};
}

/* ---------- Client ---------- */
function mtAuthority(T){
  const ids=[],pubs=[];
  mtEachPeer((p,pr)=>{if(pr.ts&&pr.ts.t===T.id&&pr.ts.tok){ids.push(p);if(pr.tt&&pr.tt.id===T.id)pubs.push(p);}});
  pubs.sort();ids.sort();return pubs[0]||ids[0]||null;
}
function mtMySeat(T){T=T||TABLES[MT.table];const V=T&&T.view;if(!V||!MT.tok||MT.table!==T.id)return -1;return V.seats.findIndex(s=>s&&s.p===MP.myPeer&&s.tok===MT.tok&&!s.gone);}
function mtStep(){
  for(const id in TABLES)mtStepTable(TABLES[id]);
  // eigener Platz: Buy-in abziehen, Stack merken
  const T=TABLES[MT.table],my=mtMySeat(T);
  if(my>=0){const s=T.view.seats[my];if(MT.deducted!==MT.tok){setChips(chips-MT.buy);MT.deducted=MT.tok;}store('nk_mtstack',s.st);}
  const V=T&&T.view;
  const tk=V&&my>=0&&V.toAct===my&&isBetting(V)?V.hand+'/'+V.board.length+'/'+V.curBet:'';
  if(tk&&tk!==MT.turnKey){MT.turnKey=tk;SFX.ding();MT.raiseTo=0;if(focus&&focus.type==='mtable')mtBarSync();}
  if(focus&&focus.type==='mtable'){const fv=focus.m.view;if(fv&&isBetting(fv)&&fv.toAct>=0)mtTimer(fv);}
}
function mtStepTable(T){
  if(!MP.room){if(T.view){T.view=null;T.S=null;T.viewKey='';mtRender(T,null);}return;}
  const auth=mtAuthority(T);
  if(auth!==T.authId){
    T.authId=auth;
    if(auth&&auth===MP.myPeer){
      T.S=(T.lastTT&&mtUnpack(T,T.lastTT))||mtFresh(T);
      if(T.S.stage!=='wait'&&T.deckHand!==T.S.hand)mtRefundHand(T.S);
      T.lastK={};T.S.v=Math.max(T.S.v,1)+1;
    } else {T.S=null;if(MP.me.tt&&MP.me.tt.id===T.id){MP.me.tt=null;MP.dirty=true;}}
  }
  let V=null;
  if(auth&&auth===MP.myPeer){mtAuthTick(T);V=T.S;T.lastTT=MP.me.tt;}
  else if(auth){const pr=mtPeerPresence(auth);if(pr&&pr.tt&&pr.tt.id===T.id){T.lastTT=pr.tt;V=mtUnpack(T,pr.tt);}}
  else T.lastTT=null;
  T.view=V;
  const key=V?V.v+'|'+auth:'none';
  if(key!==T.viewKey){
    T.viewKey=key;mtRender(T,V);
    if(V){if(V.board.length&&T.lastBoard!==V.board.length)SFX.card();T.lastBoard=V.board.length;mtAnnounce(T,V);}
    if(focus&&focus.type==='mtable'&&focus.m===T)mtBarSync();
  }
}
// Züge der anderen groß anzeigen: Sprechblase über der Figur und Zeile in der Leiste
function mtAnnounce(T,V){
  V.seats.forEach(s=>{
    if(!s)return;const prev=T.lastActs[s.p];T.lastActs[s.p]=s.l;
    if(!s.l||s.l===prev||s.l==='NEU'||s.l==='PLEITE'||s.p===MP.myPeer)return;
    const a=MP.avatars.get(s.p);if(a&&a.f===floorIdx)say(a.n,s.l,2.6);
    if(focus&&focus.type==='mtable'&&focus.m===T){MT.feed.unshift(s.n+': '+s.l);MT.feed.length=Math.min(MT.feed.length,3);}
  });
}
function mtTimer(V){const e=$('#mtTime');if(!e)return;const s=Math.max(0,Math.ceil((V.dl-Date.now())/1000));const txt=s+'s';if(e.textContent!==txt)e.textContent=txt;}
function mtRequestSeat(T){
  const need=T.bb*5;if(chips<need){toast('Du brauchst mindestens '+fmt(need)+'. Der Barkeeper im EG hilft.');return;}
  MT.buy=chips;MT.tok=Math.random().toString(36).slice(2,10);MT.deducted='';MT.table=T.id;MT.feed=[];
  MP.me.ts={t:T.id,s:-1,b:MT.buy,tok:MT.tok};MP.dirty=true;MP.lastSent=0;toast('Du setzt dich mit allen '+fmt(MT.buy)+'.');
}
function mtLeaveSeat(){
  const T=TABLES[MT.table],my=mtMySeat(T);
  if(MT.deducted&&MT.deducted===MT.tok){let st=0;if(my>=0)st=T.view.seats[my].st;else{try{st=+(localStorage.getItem('nk_mtstack')||0)||0;}catch(e){}}setChips(chips+st,st>0);}
  MT.tok='';MT.deducted='';MT.buy=0;store('nk_mtstack',null);
  if(MP.me.ts){MP.me.ts=null;MP.dirty=true;MP.lastSent=0;}
}
function mtAct(a,x){
  const T=TABLES[MT.table],V=T&&T.view;if(!V)return;const my=mtMySeat(T);if(my<0||V.toAct!==my)return;
  MP.me.ta={t:T.id,h:V.hand,k:Date.now(),a,x:x||0};MP.dirty=true;MP.lastSent=0;SFX.chip();
}

/* ---------- Leiste unten ---------- */
const MTB={btn:{}};
function mtBarInit(){
  ['FOLD','CALL','MINUS','RAISE','PLUS','ALLIN','SIT'].forEach(k=>{const b=$('#mt-'+k);MTB.btn[k]=b;
    b.addEventListener('pointerdown',e=>{e.preventDefault();mtPress(k);b.classList.add('down');setTimeout(()=>b.classList.remove('down'),120);});});
}
function mtPress(k){
  SFX.btn();const T=focus&&focus.type==='mtable'?focus.m:TABLES[MT.table];if(!T)return;const V=T.view,my=mtMySeat(T);
  if(k==='SIT'){
    if(MT.tok&&MT.table===T.id&&my>=0&&V.seats[my].st<=0&&!isBetting(V)){mtLeaveSeat();mtRequestSeat(T);}
    else if(!MT.tok)mtRequestSeat(T);
    else{mtLeaveSeat();toast('Du schaust jetzt nur zu.');}
    mtBarSync();return;
  }
  if(!V||my<0||V.toAct!==my||!isBetting(V))return;
  const s=V.seats[my],minTo=Math.min(s.b+s.st,V.curBet+V.minRaise),maxTo=s.b+s.st,step=Math.max(T.bb,Math.round(potOf(V)/4/10)*10);
  MT.raiseTo=clamp(MT.raiseTo||minTo,minTo,maxTo);
  if(k==='FOLD')mtAct('fold');
  else if(k==='CALL')mtAct(V.curBet>s.b?'call':'check');
  else if(k==='MINUS'){MT.raiseTo=clamp(MT.raiseTo-step,minTo,maxTo);mtBarSync();}
  else if(k==='PLUS'){MT.raiseTo=clamp(MT.raiseTo+step,minTo,maxTo);mtBarSync();}
  else if(k==='RAISE')mtAct('raise',MT.raiseTo);
  else if(k==='ALLIN')mtAct('raise',maxTo);
}
function mtBarSync(){
  const T=focus&&focus.type==='mtable'?focus.m:null;if(!T)return;
  const V=T.view,my=mtMySeat(T),s=my>=0?V.seats[my]:null;
  const turn=!!(s&&V.toAct===my&&isBetting(V));
  // Effekte wie am Bot-Tisch: Sieg-Banner, Verlust-Blitz, Herzschlag bei All-in
  if(V&&V.stage==='show'&&s&&MT.fxKey!==V.next){MT.fxKey=V.next;
    if(s.l&&s.l[0]==='+'){SFX.big();UFX.banner('DU GEWINNST',0,1);UFX.float(LW()/2,LH()*.56,cleanText(s.l,30),'#ffd23a');UFX.burst(LW()/2,LH()*.5,40,{coin:true,sz:9,spd:380,up:240,life:1.5});}
    else if(s.c&&!s.f){SFX.lose();UFX.flash(.4,'255,40,40');UFX.shake(.35);}}
  UFX.tension('mtable',!!(s&&isBetting(V)&&s.c&&!s.f&&V.seats.some(x=>x&&x.a&&!x.f)));
  const toCall=s?Math.max(0,V.curBet-s.b):0,minTo=s?Math.min(s.b+s.st,V.curBet+V.minRaise):0,maxTo=s?s.b+s.st:0;
  if(s&&turn)MT.raiseTo=clamp(MT.raiseTo||minTo,minTo,maxTo);
  const B=(k,label,lit)=>{const b=MTB.btn[k];if(b.textContent!==label)b.textContent=label;b.classList.toggle('lit',!!lit);};
  B('FOLD','FOLD',turn);B('CALL',toCall>0?'CALL '+fmt(Math.min(toCall,s?s.st:0)):'CHECK',turn);
  B('MINUS','−',turn&&maxTo>minTo);B('RAISE',(V&&V.curBet>0?'RAISE ':'BET ')+fmt(MT.raiseTo||minTo||T.bb),turn&&maxTo>V.curBet&&s.st>toCall);
  B('PLUS','+',turn&&maxTo>minTo);B('ALLIN','ALL IN',turn&&s.st>0);
  const free=V?V.seats.filter(x=>!x).length:MT_N;
  let sit='HINSETZEN MIT '+fmt(chips),sitLit=chips>=T.bb*5&&free>0&&!MT.tok;
  if(MT.tok&&MT.table!==T.id){sit='DU SITZT AN EINEM ANDEREN TISCH';sitLit=false;}
  else if(MT.tok&&my<0){sit='PLATZ WIRD GESUCHT…';sitLit=false;}
  if(s){if(s.st<=0&&!isBetting(V)){sit='NACHKAUFEN';sitLit=chips>=T.bb*5;}else{sit='AUFSTEHEN UND ZUSCHAUEN';sitLit=!s.c||s.f||V.stage==='wait';}}
  if(!MT.tok&&free===0){sit='TISCH VOLL · DU SCHAUST ZU';sitLit=false;}
  B('SIT',sit,sitLit);
  $('#mtInfo').innerHTML=(s?'STACK '+fmt(s.st)+' · ':'')+'POT '+fmt(potOf(V))+(turn?' · <span id="mtTime"></span>':'');
  const who=V&&isBetting(V)&&V.toAct>=0&&V.seats[V.toAct]&&V.toAct!==my?V.seats[V.toAct].n+' IST DRAN':'';
  $('#mtMsg').textContent=turn?(toCall>0?'DU BIST DRAN · '+fmt(toCall)+' ZAHLEN':'DU BIST DRAN'):(!V?'NOCH KEINER AM TISCH':who||V.msg||'');
  $('#mtMsg').classList.toggle('go',turn);
  $('#mtFeed').textContent=MT.feed.join('  ·  ');
  let html='';
  if(V&&(V.board.length||s&&s.c)){
    html+='<div class="pcg"><span class="pcl">TISCH</span><div class="pcs">';for(let i=0;i<5;i++)html+=V.board[i]!==undefined?cardHTML(V.board[i]):'<span class="pc empty"></span>';html+='</div></div>';
    if(s&&s.c)html+='<div class="pcg me'+(s.f?' fold':'')+'"><span class="pcl">DU</span><div class="pcs">'+cardHTML(s.c[0])+cardHTML(s.c[1])+'</div></div>';
  }
  if(V&&V.stage==='show'&&V.rv)html+='<div class="pshow">'+V.seats.filter((x,i)=>x&&i!==my&&x.c&&!x.f).map(x=>'<span class="psn">'+esc(x.n)+'</span>'+cardHTML(x.c[0],1)+cardHTML(x.c[1],1)).join('')+'</div>';
  const el=$('#mtCards');if(el.innerHTML!==html)el.innerHTML=html;el.hidden=!html;
  if(turn)mtTimer(V);
}
try{const ms=+localStorage.getItem('nk_mtstack');if(ms>0){chips+=ms;localStorage.setItem('nk_chips',String(chips));}localStorage.removeItem('nk_mtstack');}catch(e){}
