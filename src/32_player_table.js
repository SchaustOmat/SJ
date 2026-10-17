/* =========================================================
   SPIELERTISCH: Texas Hold'em mit echten Mitspielern
   Ein Spieler am Tisch ist "Bank" (Autorität, kleinste Peer-ID).
   Alles läuft über die Presence: ts = Platzwunsch, ta = Aktion, tt = Tischzustand (nur Bank).
   ========================================================= */
const MT_N=6,MT_SB=10,MT_BB=20,MT_TURN=25000,MT_BUY=2000;
const MT={cx:5,cz:8.2,R:1.75,F:null,seats3d:[],board3d:[],S:null,deck:[],deckHand:-1,lastK:{},lastTT:null,authId:null,
  tok:'',buy:0,deducted:'',raiseTo:0,view:null,viewKey:'',turnKey:'',potSprite:null,dbtn:null,lastPub:0};
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function mtSeatPos(i,r){const a=Math.PI/2+i*TAU/MT_N;return {x:MT.cx+Math.cos(a)*r,z:MT.cz+Math.sin(a)*r,a};}
const validCard=c=>Number.isInteger(c)&&c>=0&&c<52;

/* ---------- 3D ---------- */
function buildMTable(F){
  MT.F=F;const g=new THREE.Group();g.position.set(MT.cx,0,MT.cz);F.group.add(g);
  const felt=canvasTex(64,64,pokerFeltT);
  mesh(new THREE.CylinderGeometry(1.15,1.15,.1,18),[lam({map:T.wood}),lam({map:felt}),lam({map:T.wood})],0,.84,0,g);
  mesh(new THREE.CylinderGeometry(1.25,1.25,.12,18),lam({color:0x2a1408}),0,.82,0,g);
  mesh(new THREE.CylinderGeometry(.3,.55,.76,8),lam({color:0x120c18}),0,.38,0,g);
  box(1.6,.08,.6,bas({color:0x7ad8ff}),0,3.2,0,g);
  const act={type:'mtable',label:'SPIELERTISCH',sub:'Hold\'em mit echten Leuten',pos:new THREE.Vector3(MT.cx,1,MT.cz),reach:2.9};
  tagAct(F,g,act);col(F,MT.cx,MT.cz,2.5,2.5);
  for(let i=0;i<MT_N;i++){
    const p=mtSeatPos(i,MT.R);
    const st=new THREE.Group();st.position.set(p.x,0,p.z);F.group.add(st);
    mesh(new THREE.CylinderGeometry(.04,.14,.6,6),lam({color:0x2a2a30}),0,.3,0,st);
    mesh(new THREE.CylinderGeometry(.24,.24,.09,8),lam({color:0x0a5a7a}),0,.62,0,st);
    st.traverse(o=>{if(o.isMesh){o.userData.act=act;F.hits.push(o);}});
    const lab=spriteLabel(192,56,.2);lab.position.set(p.x,1.95,p.z);F.group.add(lab);
    const cp=mtSeatPos(i,.78),ry=Math.atan2(Math.cos(p.a),Math.sin(p.a));
    const cards=[-1,1].map(side=>{const m=makeCard(F.group);
      m.position.set(cp.x+Math.cos(p.a+Math.PI/2)*.15*side,.9,cp.z+Math.sin(p.a+Math.PI/2)*.15*side);m.rotation.y=ry;m.visible=false;return m;});
    const chipsG=new THREE.Group();const c2=mtSeatPos(i,.5);chipsG.position.set(c2.x,.9,c2.z);F.group.add(chipsG);
    MT.seats3d.push({lab,cards,chipsG,key:''});
  }
  for(let i=0;i<5;i++){const m=makeCard(F.group);m.position.set(MT.cx-.62+i*.31,.9,MT.cz);m.visible=false;MT.board3d.push(m);}
  MT.potSprite=spriteLabel(256,64,.2);MT.potSprite.position.set(MT.cx,1.12,MT.cz-.42);F.group.add(MT.potSprite);
  const dbt=labelTex(32,32,c=>{c.fillStyle='#f4f0e8';c.beginPath();c.arc(16,16,15,0,TAU);c.fill();c.fillStyle='#141018';px(c,14);c.textAlign='center';c.textBaseline='middle';c.fillText('D',16,17);});
  MT.dbtn=mesh(new THREE.CylinderGeometry(.07,.07,.02,12),[lam({color:0xe8e8e8}),lam({map:dbt}),lam({color:0xe8e8e8})],MT.cx,.9,MT.cz,F.group);MT.dbtn.visible=false;
  sign(F,'SPIELERTISCH','#29f0ff',MT.cx,3.55,MT.cz,0,.4);
  mtRender(null);
}
function mtLabel(i,s,V){
  const S3=MT.seats3d[i];const turn=V&&V.toAct===i&&isBetting(V);
  const key=s?[s.n,s.st,s.l,turn,s.p===MP.myPeer].join('|'):'free';if(S3.key===key)return;S3.key=key;
  const t=S3.lab.userData.tex,c=t.userData.ctx;c.clearRect(0,0,192,56);
  c.fillStyle=turn?'rgba(255,207,58,.94)':'rgba(10,6,16,.84)';c.fillRect(0,0,192,56);
  c.strokeStyle=s&&s.p===MP.myPeer?'#29f0ff':s?'#ffcf3a':'#3a2c52';c.lineWidth=2;c.strokeRect(1,1,190,54);
  c.textAlign='center';c.textBaseline='middle';
  if(!s){px(c,10);c.fillStyle='#6a5a88';c.fillText('FREI',96,28);t.needsUpdate=true;return;}
  px(c,10);c.fillStyle=turn?'#140e18':'#f4f0e8';c.fillText(s.n,96,13);
  c.fillStyle=turn?'#140e18':'#ffcf3a';c.fillText(fmt(s.st),96,31);
  px(c,8);c.fillStyle=turn?'#3a1a00':'#9b8fb3';c.fillText(s.l||'',96,47);t.needsUpdate=true;
}
function isBetting(V){return V&&(V.stage==='pre'||V.stage==='flop'||V.stage==='turn'||V.stage==='river');}
function mtRender(V){
  for(let i=0;i<MT_N;i++){
    const s=V?V.seats[i]:null,S3=MT.seats3d[i];mtLabel(i,s,V);
    const show=V&&s&&s.c&&!s.f;
    S3.cards.forEach((m,k)=>{
      if(!show){m.visible=false;return;}
      m.visible=true;const mine=s.p===MP.myPeer,reveal=V.stage==='show'&&V.rv;
      if(mine||reveal){if(m.userData.face!==s.c[k])setCardFace(m,s.c[k]);}else if(m.userData.face!==null)setCardBack(m);
    });
    setStack(S3.chipsG,s?s.b:0);
  }
  MT.board3d.forEach((m,i)=>{const c=V&&V.board[i];if(c===undefined||!V){m.visible=false;return;}m.visible=true;if(m.userData.face!==c)setCardFace(m,c);});
  if(V&&V.dealer>=0&&V.seats[V.dealer]){const p=mtSeatPos(V.dealer,.95);MT.dbtn.position.set(p.x,.9,p.z);MT.dbtn.visible=true;}else MT.dbtn.visible=false;
  const t=MT.potSprite.userData.tex,c=t.userData.ctx;c.clearRect(0,0,256,64);
  if(V){const pot=V.seats.reduce((a,s)=>a+(s?s.t:0),0);c.fillStyle='rgba(10,6,16,.85)';c.fillRect(0,0,256,64);c.strokeStyle='#29f0ff';c.lineWidth=2;c.strokeRect(1,1,254,62);
    c.textAlign='center';c.textBaseline='middle';px(c,11);c.fillStyle='#ffcf3a';c.fillText(isBetting(V)?'POT '+fmt(pot):V.stage==='show'?'SHOWDOWN':'SPIELERTISCH',128,18);fitText(c,V.msg||'',128,44,248,8);}
  t.needsUpdate=true;
}

/* ---------- Bank-Logik (nur Autorität) ---------- */
function mtFresh(){return {v:1,hand:0,stage:'wait',seats:new Array(MT_N).fill(null),board:[],dealer:-1,toAct:-1,curBet:0,minRaise:MT_BB,msg:'',dl:0,adv:0,next:0,rv:0};}
function mtNext(S,i,pred){for(let k=1;k<=MT_N;k++){const j=((i+k)%MT_N+MT_N)%MT_N,s=S.seats[j];if(s&&pred(s))return j;}return -1;}
const mtLive=s=>s&&s.c&&!s.f;const mtCan=s=>mtLive(s)&&!s.a;
function mtPost(S,i,amt,lbl){const s=S.seats[i],a=Math.min(amt,s.st);s.st-=a;s.b+=a;s.t+=a;if(!s.st)s.a=1;s.l=lbl;}
function mtStartHand(S){
  const ids=[];S.seats.forEach((s,i)=>{if(s&&!s.gone&&s.st>0)ids.push(i);});if(ids.length<2)return false;
  const deck=[...Array(52).keys()];for(let i=51;i>0;i--){const j=Math.random()*(i+1)|0;[deck[i],deck[j]]=[deck[j],deck[i]];}
  S.hand++;MT.deck=deck;MT.deckHand=S.hand;S.board=[];S.rv=0;
  S.seats.forEach(s=>{if(s){s.b=0;s.t=0;s.a=0;s.l='';s.acted=0;s.c=null;s.f=1;}});
  ids.forEach(i=>{const s=S.seats[i];s.f=0;s.c=[deck.pop(),deck.pop()];});
  S.dealer=mtNext(S,S.dealer<0?MT_N-1:S.dealer,s=>s.c);
  const sb=ids.length===2?S.dealer:mtNext(S,S.dealer,s=>s.c),bb=mtNext(S,sb,s=>s.c);
  mtPost(S,sb,MT_SB,'SMALL BLIND');mtPost(S,bb,MT_BB,'BIG BLIND');
  S.curBet=MT_BB;S.minRaise=MT_BB;S.stage='pre';S.msg='PREFLOP';
  S.toAct=mtNext(S,bb,mtCan);S.dl=Date.now()+MT_TURN;mtSettle(S);return true;
}
function mtSettle(S){
  if(!isBetting(S)||S.adv)return;
  const live=S.seats.filter(mtLive);if(live.length<=1){mtUncontested(S);return;}
  const ca=S.seats.filter(mtCan);
  const done=ca.length===0||(ca.length===1&&ca[0].b>=S.curBet)||ca.every(x=>x.acted&&x.b===S.curBet);
  if(done){S.toAct=-1;S.adv=Date.now()+700;}
  else if(S.toAct<0||!mtCan(S.seats[S.toAct])){S.toAct=mtNext(S,S.toAct<0?S.dealer:S.toAct,mtCan);S.dl=Date.now()+MT_TURN;}
}
function mtApply(S,i,act,to){
  const s=S.seats[i];if(!s||S.toAct!==i||!mtCan(s)||S.adv)return false;
  const toCall=Math.max(0,S.curBet-s.b);
  if(act==='check'&&toCall>0)act='call';
  if(act==='fold'){s.f=1;s.l='FOLD';}
  else if(act==='check'){s.l='CHECK';}
  else if(act==='call'){const a=Math.min(toCall,s.st);s.st-=a;s.b+=a;s.t+=a;s.l=!s.st?'ALL-IN':toCall?'CALL '+fmt(a):'CHECK';if(!s.st)s.a=1;}
  else if(act==='raise'){
    const max=s.b+s.st,min=Math.min(max,S.curBet+S.minRaise);to=clamp(Math.floor(+to)||0,min,max);
    if(to<=S.curBet)return mtApply(S,i,'call');
    const a=to-s.b;s.st-=a;s.b=to;s.t+=a;const inc=to-S.curBet;
    if(inc>=S.minRaise){S.minRaise=inc;S.seats.forEach(o=>{if(o&&o!==s)o.acted=0;});}S.curBet=to;
    if(!s.st){s.a=1;s.l='ALL-IN '+fmt(to);}else s.l=(toCall?'RAISE ':'BET ')+fmt(to);
  } else return false;
  s.acted=1;S.toAct=mtNext(S,i,mtCan);S.dl=Date.now()+MT_TURN;mtSettle(S);return true;
}
function mtStreet(S){
  S.seats.forEach(s=>{if(s){s.b=0;s.acted=0;if(mtCan(s))s.l='';}});S.curBet=0;S.minRaise=MT_BB;
  const d=MT.deck;
  if(S.stage==='pre'){S.board.push(d.pop(),d.pop(),d.pop());S.stage='flop';S.msg='FLOP';}
  else if(S.stage==='flop'){S.board.push(d.pop());S.stage='turn';S.msg='TURN';}
  else if(S.stage==='turn'){S.board.push(d.pop());S.stage='river';S.msg='RIVER';}
  else{mtShowdown(S);return;}
  if(S.seats.filter(mtCan).length<=1){S.toAct=-1;S.adv=Date.now()+1300;return;}
  S.toAct=mtNext(S,S.dealer,mtCan);S.dl=Date.now()+MT_TURN;
}
function mtUncontested(S){
  const w=S.seats.find(mtLive);const pot=S.seats.reduce((a,s)=>a+(s?s.t:0),0);
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
function mtRequests(){
  const out={};
  const add=(p,pr)=>{const r=pr&&pr.ts;if(!r||typeof r!=='object')return;const tok=typeof r.tok==='string'?r.tok.slice(0,12):'';if(!tok)return;
    out[p]={s:Number.isInteger(r.s)?r.s:-1,b:clamp(Math.floor(+r.b)||0,0,1e7),tok,n:cleanText(pr.n,14)||'GAST'};};
  (MP.peersAll||[]).forEach(q=>{if(!q.isMe&&q.kind==='viewer')add(q.peer,q.presence||{});});
  if(MP.myPeer)add(MP.myPeer,MP.me);
  return out;
}
function mtAuthTick(){
  const S=MT.S,t=Date.now();let ch=false;const reqs=mtRequests();
  S.seats.forEach((s,i)=>{if(!s||s.gone)return;const r=reqs[s.p];
    if(!r||r.tok!==s.tok){if(isBetting(S)&&mtLive(s)){s.f=1;s.gone=1;s.l='WEG';if(S.toAct===i){S.toAct=mtNext(S,i,mtCan);S.dl=t+MT_TURN;}mtSettle(S);}else if(S.stage==='show'&&s.c)s.gone=1;else S.seats[i]=null;ch=true;}});
  for(const p in reqs){
    if(S.seats.some(s=>s&&s.p===p&&!s.gone))continue;const r=reqs[p];if(r.b<100)continue;
    let idx=r.s>=0&&r.s<MT_N&&!S.seats[r.s]?r.s:S.seats.findIndex(x=>!x);if(idx<0)continue;
    S.seats[idx]={p,n:r.n,tok:r.tok,st:r.b,b:0,t:0,f:1,a:0,l:'NEU',c:null,acted:0};ch=true;
  }
  if(isBetting(S)&&S.toAct>=0&&!S.adv){const s=S.seats[S.toAct];
    const pr=s&&mtPeerPresence(s.p),ta=pr&&pr.ta;
    if(ta&&ta.h===S.hand&&+ta.k>(MT.lastK[s.p]||0)){MT.lastK[s.p]=+ta.k;if(mtApply(S,S.toAct,String(ta.a),ta.x))ch=true;}
    else if(t>S.dl){const tc=S.curBet>s.b;mtApply(S,S.toAct,tc?'fold':'check');s.l+=' (ZEIT)';ch=true;}
  }
  if(S.adv&&t>=S.adv){S.adv=0;mtStreet(S);ch=true;}
  if(S.stage==='show'&&t>=S.next){mtCleanup(S);ch=true;}
  if(S.stage==='wait'){
    const n=S.seats.filter(s=>s&&!s.gone&&s.st>0).length;
    const msg=n>=2?'NÄCHSTE HAND GLEICH':n?'WARTE AUF MITSPIELER':'TISCH FREI';if(S.msg!==msg&&!(S.msg.startsWith('HAND ABG')&&S.next)){S.msg=msg;ch=true;}
    if(n>=2){if(!S.next){S.next=t+3000;}else if(t>=S.next){S.next=0;mtStartHand(S);ch=true;}}else S.next=0;
  }
  if(ch||t-MT.lastPub>2000){S.v++;MT.lastPub=t;MP.me.tt=mtPack(S);MP.dirty=true;}
}
function mtPack(S){return {v:S.v,hand:S.hand,stage:S.stage,board:S.board.slice(),dealer:S.dealer,toAct:S.toAct,curBet:S.curBet,minRaise:S.minRaise,msg:S.msg,dl:S.dl,rv:S.rv,
  seats:S.seats.map(s=>s?{p:s.p,n:s.n,tok:s.tok,st:s.st,b:s.b,t:s.t,f:s.f,a:s.a,l:s.l,c:s.c,acted:s.acted,gone:s.gone||0}:null)};}
function mtUnpack(tt){
  if(!tt||typeof tt!=='object'||!Array.isArray(tt.seats)||tt.seats.length!==MT_N)return null;
  const num=(x,d)=>Number.isFinite(+x)?+x:d;
  const S={v:num(tt.v,0),hand:num(tt.hand,0)|0,stage:['wait','pre','flop','turn','river','show'].includes(tt.stage)?tt.stage:'wait',
    board:Array.isArray(tt.board)?tt.board.filter(validCard).slice(0,5):[],dealer:num(tt.dealer,-1)|0,toAct:num(tt.toAct,-1)|0,curBet:Math.max(0,num(tt.curBet,0)),
    minRaise:Math.max(MT_BB,num(tt.minRaise,MT_BB)),msg:cleanText(tt.msg,48),dl:num(tt.dl,0),rv:tt.rv?1:0,adv:0,next:0,
    seats:tt.seats.map(s=>{if(!s||typeof s!=='object'||typeof s.p!=='string')return null;
      return {p:s.p.slice(0,64),n:cleanText(s.n,14)||'GAST',tok:String(s.tok||'').slice(0,12),st:Math.max(0,num(s.st,0)),b:Math.max(0,num(s.b,0)),t:Math.max(0,num(s.t,0)),
        f:s.f?1:0,a:s.a?1:0,l:cleanText(s.l,24),c:Array.isArray(s.c)&&s.c.length===2&&s.c.every(validCard)?s.c.slice():null,acted:s.acted?1:0,gone:s.gone?1:0};})};
  return S;
}

/* ---------- Client ---------- */
function mtAuthority(){
  // Die bisherige Bank bleibt Bank, solange sie am Tisch ist. Sonst übernimmt die kleinste Peer-ID.
  const ids=[],pubs=[];
  (MP.peersAll||[]).forEach(q=>{const pr=q.presence;if(!q.isMe&&pr&&pr.ts&&pr.ts.tok){ids.push(q.peer);if(pr.tt)pubs.push(q.peer);}});
  if(MP.myPeer&&MP.me.ts&&MP.me.ts.tok){ids.push(MP.myPeer);if(MP.me.tt)pubs.push(MP.myPeer);}
  pubs.sort();ids.sort();return pubs[0]||ids[0]||null;
}
function mtMySeat(V){V=V||MT.view;if(!V||!MT.tok)return -1;return V.seats.findIndex(s=>s&&s.p===MP.myPeer&&s.tok===MT.tok&&!s.gone);}
function mtStep(){
  if(!MP.room){if(MT.view){MT.view=null;MT.S=null;mtRender(null);}return;}
  const auth=mtAuthority();
  if(auth!==MT.authId){
    MT.authId=auth;
    if(auth&&auth===MP.myPeer){
      MT.S=MT.lastTT?mtUnpack(MT.lastTT):mtFresh();if(!MT.S)MT.S=mtFresh();
      if(MT.S.stage!=='wait'&&MT.deckHand!==MT.S.hand)mtRefundHand(MT.S);
      MT.lastK={};MT.S.v=Math.max(MT.S.v,1)+1;
    } else {MT.S=null;if(MP.me.tt){MP.me.tt=null;MP.dirty=true;}}
  }
  let V=null;
  if(auth&&auth===MP.myPeer){mtAuthTick();V=MT.S;}
  else if(auth){const pr=mtPeerPresence(auth);if(pr&&pr.tt){MT.lastTT=pr.tt;V=mtUnpack(pr.tt);}}
  else{
    // niemand sitzt: letzten Stand der früheren Bank zeigen (falls einer da war) oder leeren Tisch
    V=null;MT.lastTT=null;
  }
  if(auth===MP.myPeer&&MT.S)MT.lastTT=MP.me.tt;
  MT.view=V;
  // eigener Platz: Buy-in abziehen, Stack merken
  const my=mtMySeat(V);
  if(my>=0){const s=V.seats[my];
    if(MT.deducted!==MT.tok){setChips(chips-MT.buy);MT.deducted=MT.tok;}
    store('nk_mtstack',s.st);
  }
  const key=V?V.v+'|'+auth:'none';
  if(key!==MT.viewKey){
    const prev=MT.viewKey;MT.viewKey=key;mtRender(V);
    if(V&&prev&&V.board.length&&MT.lastBoardLen!==V.board.length)SFX.card();MT.lastBoardLen=V?V.board.length:0;
    if(focus&&focus.type==='mtable')mtBarSync();
  }
  const tk=V&&my>=0&&V.toAct===my&&isBetting(V)?V.hand+'/'+V.board.length+'/'+V.curBet:'';
  if(tk&&tk!==MT.turnKey){MT.turnKey=tk;SFX.ding();MT.raiseTo=0;if(focus&&focus.type==='mtable')mtBarSync();}
  if(focus&&focus.type==='mtable'&&V&&isBetting(V)&&V.toAct>=0)mtTimer(V);
}
function mtTimer(V){const e=$('#mtTime');if(!e)return;const s=Math.max(0,Math.ceil((V.dl-Date.now())/1000));const txt=s+'s';if(e.textContent!==txt)e.textContent=txt;}
function mtRequestSeat(){
  if(chips<100){toast('Du brauchst mindestens 100 Chips. Der Barkeeper im EG hilft.');return;}
  MT.buy=Math.min(chips,MT_BUY);MT.tok=Math.random().toString(36).slice(2,10);MT.deducted='';
  MP.me.ts={s:-1,b:MT.buy,tok:MT.tok};MP.dirty=true;MP.lastSent=0;toast('Du setzt dich mit '+fmt(MT.buy)+' Chips.');
}
function mtLeaveSeat(){
  const V=MT.view,my=mtMySeat(V);
  if(MT.deducted&&MT.deducted===MT.tok){const st=my>=0?V.seats[my].st:+(localStorage.getItem('nk_mtstack')||0)||0;setChips(chips+st,st>0);}
  MT.tok='';MT.deducted='';MT.buy=0;store('nk_mtstack',null);
  if(MP.me.ts){MP.me.ts=null;MP.dirty=true;MP.lastSent=0;}
}
function mtAct(a,x){
  const V=MT.view;if(!V)return;const my=mtMySeat(V);if(my<0||V.toAct!==my)return;
  MP.me.ta={h:V.hand,k:Date.now(),a,x:x||0};MP.dirty=true;MP.lastSent=0;SFX.chip();
}

/* ---------- Leiste unten ---------- */
const MTB={btn:{}};
function mtBarInit(){
  ['FOLD','CALL','MINUS','RAISE','PLUS','ALLIN','SIT'].forEach(k=>{const b=$('#mt-'+k);MTB.btn[k]=b;
    b.addEventListener('pointerdown',e=>{e.preventDefault();mtPress(k);b.classList.add('down');setTimeout(()=>b.classList.remove('down'),120);});});
}
function mtPress(k){
  SFX.btn();const V=MT.view,my=mtMySeat(V);
  if(k==='SIT'){if(MT.tok&&my>=0&&V.seats[my].st<=0){mtLeaveSeat();mtRequestSeat();}else if(!MT.tok)mtRequestSeat();else{mtLeaveSeat();toast('Du schaust jetzt nur zu.');}mtBarSync();return;}
  if(!V||my<0||V.toAct!==my||!isBetting(V))return;
  const s=V.seats[my],minTo=Math.min(s.b+s.st,V.curBet+V.minRaise),maxTo=s.b+s.st,pot=V.seats.reduce((a,x)=>a+(x?x.t:0),0),step=Math.max(MT_BB,Math.round(pot/4/10)*10);
  MT.raiseTo=clamp(MT.raiseTo||minTo,minTo,maxTo);
  if(k==='FOLD')mtAct('fold');
  else if(k==='CALL')mtAct(V.curBet>s.b?'call':'check');
  else if(k==='MINUS'){MT.raiseTo=clamp(MT.raiseTo-step,minTo,maxTo);mtBarSync();}
  else if(k==='PLUS'){MT.raiseTo=clamp(MT.raiseTo+step,minTo,maxTo);mtBarSync();}
  else if(k==='RAISE')mtAct('raise',MT.raiseTo);
  else if(k==='ALLIN')mtAct('raise',maxTo);
}
function mtBarSync(){
  const V=MT.view,my=mtMySeat(V),s=my>=0?V.seats[my]:null;
  const turn=!!(s&&V.toAct===my&&isBetting(V)&&!(MP.me.ta&&MP.me.ta.h===V.hand&&MP.me.ta.k>Date.now()-1500&&false));
  const toCall=s?Math.max(0,V.curBet-s.b):0,minTo=s?Math.min(s.b+s.st,V.curBet+V.minRaise):0,maxTo=s?s.b+s.st:0;
  if(s&&turn)MT.raiseTo=clamp(MT.raiseTo||minTo,minTo,maxTo);
  const B=(k,label,lit)=>{const b=MTB.btn[k];if(b.textContent!==label)b.textContent=label;b.classList.toggle('lit',!!lit);};
  B('FOLD','FOLD',turn);B('CALL',toCall>0?'CALL '+fmt(Math.min(toCall,s?s.st:0)):'CHECK',turn);
  B('MINUS','−',turn&&maxTo>minTo);B('RAISE',(V&&V.curBet>0?'RAISE ':'BET ')+fmt(MT.raiseTo||minTo||MT_BB),turn&&maxTo>V.curBet&&s.st>toCall);
  B('PLUS','+',turn&&maxTo>minTo);B('ALLIN','ALL IN',turn&&s.st>0);
  const free=V?V.seats.filter(x=>!x).length:MT_N;
  let sit='HINSETZEN ('+fmt(Math.min(chips,MT_BUY))+')',sitLit=chips>=100&&free>0;
  if(MT.tok&&my<0){sit='PLATZ WIRD GESUCHT…';sitLit=false;}
  if(s){if(s.st<=0&&!isBetting(V)){sit='NACHKAUFEN';sitLit=chips>=100;}else{sit='NUR ZUSCHAUEN';sitLit=!s.c||s.f||V.stage==='wait';}}
  if(!MT.tok&&free===0){sit='TISCH VOLL · ZUSCHAUEN';sitLit=false;}
  B('SIT',sit,sitLit);
  const pot=V?V.seats.reduce((a,x)=>a+(x?x.t:0),0):0;
  $('#mtInfo').innerHTML=(s?'STACK '+fmt(s.st)+' · ':'')+'POT '+fmt(pot)+(turn?' · <span id="mtTime"></span>':'');
  $('#mtMsg').textContent=turn?(toCall>0?'DU BIST DRAN · '+fmt(toCall)+' ZAHLEN':'DU BIST DRAN'):(!V?'NOCH KEINER AM TISCH':V.msg||'');
  $('#mtMsg').classList.toggle('go',turn);
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
