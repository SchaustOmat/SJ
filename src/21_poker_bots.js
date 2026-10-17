/* =========================================================
   TEXAS HOLD'EM TISCH (2. Stock)
   ========================================================= */
const PK={F:null,group:null,cx:-5,cz:-4,seats:[],dealer:0,sb:50,bb:100,board:[],deck:[],stage:'off',toAct:-1,curBet:0,minRaise:100,
  wait:0,next:null,raiseTo:0,cards:[],boardMeshes:[],msg:'',info:'',human:null,consoleTex:null,potSprite:null,potStack:null,dbtn:null,handNo:0,btns:{}};
const BOT_DEF=[
  {name:'BOSS',pos:[-1.78,-.85],agg:.55,loose:.35,glasses:true,color:0x8a6a1a},
  {name:'DIE GRÄFIN',pos:[-1.78,.85],agg:.3,loose:.25,color:0x5a1a6a,hair:0xc8c8c8},
  {name:'KARTENHAI',pos:[1.78,.85],agg:.7,loose:.5,color:0x1a3a6a},
  {name:'NEUREICH',pos:[1.78,-.85],agg:.4,loose:.7,color:0x3a3a44,hair:0xb02a5a}
];
function buildPoker(F){
  PK.F=F;const cx=PK.cx,cz=PK.cz;
  const g=new THREE.Group();g.position.set(cx,0,cz);F.group.add(g);PK.group=g;
  const feltTex=canvasTex(64,64,pokerFeltT);
  const top=mesh(new THREE.CylinderGeometry(1,1,.1,20),[lam({map:T.wood}),lam({map:feltTex}),lam({map:T.wood})],0,.84,0,g);top.scale.set(1.2,1,2);
  const rim=mesh(new THREE.CylinderGeometry(1,1,.12,20),lam({color:0x2a1408}),0,.82,0,g);rim.scale.set(1.3,1,2.1);
  mesh(new THREE.CylinderGeometry(.35,.6,.76,8),lam({color:0x120c18}),0,.38,0,g);
  const act={type:'poker',label:'TEXAS HOLD\'EM',sub:'Hinsetzen · Blinds 50/100',pos:new THREE.Vector3(cx,1,cz+2.4),reach:2.2};
  tagAct(F,g,act);act.pos=new THREE.Vector3(cx,1,cz+2.3);
  col(F,cx,cz,2.8,4.4);
  // seats
  PK.seats=[];
  const human={name:'DU',human:true,pos:[0,2.62],stack:0,hole:[],bet:0,total:0,folded:true,allin:false,out:true,last:''};
  PK.human=human;
  const hs=new THREE.Group();hs.position.set(cx,0,cz+2.65);F.group.add(hs);
  mesh(new THREE.CylinderGeometry(.04,.14,.6,6),lam({color:0x2a2a30}),0,.3,0,hs);mesh(new THREE.CylinderGeometry(.24,.24,.09,8),lam({color:0x6a1020}),0,.62,0,hs);
  PK.seats.push(human);
  BOT_DEF.forEach(d=>{
    const wx=cx+d.pos[0],wz=cz+d.pos[1];
    const n=npc(F,{x:wx,z:wz,rot:faceTo(wx,wz,cx,cz),sit:true,anim:'cards',lines:LINES.poker,name:d.name,glasses:d.glasses,color:d.color,hair:d.hair,noCol:true});
    mesh(new THREE.BoxGeometry(.45,.06,.45),lam({color:0x6a1020}),wx,.6,wz,F.group);col(F,wx,wz,.55,.55);
    const lab=spriteLabel(192,56,.2);lab.position.set(wx,1.78,wz);F.group.add(lab);
    PK.seats.push({name:d.name,pos:d.pos,agg:d.agg,loose:d.loose,npc:n,label:lab,stack:20000,hole:[],bet:0,total:0,folded:false,allin:false,out:false,last:''});
  });
  const dl=npc(F,{x:cx,z:cz-2.55,rot:0,anim:'dealer',lines:["Blinds 50 und 100.","Setz dich, wenn du dich traust.","Karten kommen."],name:'DEALERIN',color:0x1a1a1e,hair:0xb02a5a});
  PK.dealerNpc=dl;
  // pot sprite
  PK.potSprite=spriteLabel(256,64,.2);PK.potSprite.position.set(cx,1.02,cz-.75);F.group.add(PK.potSprite);
  // dealer button
  const dbt=labelTex(32,32,(c)=>{c.fillStyle='#f4f0e8';c.beginPath();c.arc(16,16,15,0,TAU);c.fill();c.fillStyle='#141018';px(c,14);c.textAlign='center';c.textBaseline='middle';c.fillText('D',16,17);});
  PK.dbtn=mesh(new THREE.CylinderGeometry(.07,.07,.02,12),[lam({color:0xe8e8e8}),lam({map:dbt}),lam({color:0xe8e8e8})],cx,.9,cz,F.group);
  // chip stacks
  PK.seats.forEach(s=>{s.chips=new THREE.Group();F.group.add(s.chips);const p=seatSpot(s,.42);s.chips.position.set(p.x,.9,p.z);});
  PK.potStack=new THREE.Group();PK.potStack.position.set(cx+.55,.9,cz+.45);F.group.add(PK.potStack);
  // console
  buildConsole(F);
  drawPot();PK.seats.forEach(drawSeatLabel);
}
function seatSpot(s,k){return {x:PK.cx+s.pos[0]*k,z:PK.cz+s.pos[1]*k};}
const CHIPCOL=[0xe8e8e8,0xc42a3a,0x2a9a5a,0x1a1a1a,0x7a3ad6,0xd6a02a];
function setStack(grp,amount){
  while(grp.children.length)grp.remove(grp.children[0]);
  if(amount<=0)return;
  const n=clamp(Math.ceil(Math.log2(amount/10+1)*1.6),1,16);const cols=Math.ceil(n/8);
  for(let i=0;i<n;i++){const c=i%cols,h=Math.floor(i/cols);mesh(chipGeo,chipMats[(c*3+h)%CHIPCOL.length],c*.1,.006+h*.013,0,grp);}
}
const chipGeo=new THREE.CylinderGeometry(.045,.045,.012,10);
const chipMats=CHIPCOL.map(c=>new THREE.MeshLambertMaterial({color:c}));
function drawSeatLabel(s){
  if(!s.label)return;const t=s.label.userData.tex,c=t.userData.ctx;c.clearRect(0,0,192,56);
  const act=PK.stage!=='off'&&PK.toAct>=0&&PK.seats[PK.toAct]===s;
  c.fillStyle=act?'rgba(255,207,58,.92)':'rgba(10,6,16,.82)';c.fillRect(0,0,192,56);c.strokeStyle=s.folded&&PK.stage!=='off'?'#3a2c52':'#ffcf3a';c.lineWidth=2;c.strokeRect(1,1,190,54);
  c.textAlign='center';c.textBaseline='middle';px(c,10);c.fillStyle=act?'#140e18':'#f4f0e8';c.fillText(s.name,96,13);
  px(c,10);c.fillStyle=act?'#140e18':'#ffcf3a';c.fillText(fmt(s.stack),96,31);
  px(c,8);c.fillStyle=act?'#3a1a00':'#9b8fb3';c.fillText(s.last||'',96,47);t.needsUpdate=true;
}
function potTotal(){return PK.seats.reduce((a,s)=>a+s.total,0);}
function drawPot(){
  const t=PK.potSprite.userData.tex,c=t.userData.ctx;c.clearRect(0,0,256,64);
  if(PK.stage==='off'&&!PK.msg){return t.needsUpdate=true;}
  c.fillStyle='rgba(10,6,16,.85)';c.fillRect(0,0,256,64);c.strokeStyle='#ff2e88';c.lineWidth=2;c.strokeRect(1,1,254,62);
  c.textAlign='center';c.textBaseline='middle';px(c,11);c.fillStyle='#ffcf3a';c.fillText('POT '+fmt(potTotal()),128,18);
  fitText(c,PK.msg||'',128,44,248,8);t.needsUpdate=true;
}
/* console with buttons */
const PBTN=[['FOLD',.21,'red'],['CALL',.23,'green'],['MINUS',.1,'white'],['RAISE',.23,'amber'],['PLUS',.1,'white'],['ALLIN',.2,'yellow']];
function buildConsole(F){
  const g=new THREE.Group();g.position.set(PK.cx,1.0,PK.cz+2.12);g.rotation.x=.55;F.group.add(g);PK.console=g;
  box(1.36,.04,.42,lam({color:0x120c18}),0,0,0,g);
  box(1.38,.02,.02,bas({color:0xff2e88}),0,.025,.21,g);
  PK.consoleTex=canvasTex(320,64,null);
  const d=mesh(new THREE.PlaneGeometry(1.24,.24),bas({map:PK.consoleTex}),0,.022,-.07,g);d.rotation.x=-Math.PI/2;
  let x=-((PBTN.reduce((a,b)=>a+b[1],0)+.03*(PBTN.length-1))/2);
  PBTN.forEach(([key,w,colr])=>{
    const tex=labelTex(64,40,null);const topM=bas({map:tex,color:0x666666});const side=lam({color:0x1a1a1a});
    const b=mesh(new THREE.BoxGeometry(w,.035,.11),[side,side,topM,side,side,side],x+w/2,.035,.12,g);x+=w+.03;
    b.userData.act={type:'pbtn',key};F.hits.push(b);
    PK.btns[key]={mesh:b,tex,mat:topM,label:'',color:colr,lit:false,press:0};
  });
}
function setPBtn(key,label,lit){
  const b=PK.btns[key];if(b.label!==label){b.label=label;const c=b.tex.userData.ctx,[bg,fg]=BTNCOL[b.color];
    c.fillStyle=bg;c.fillRect(0,0,64,40);c.fillStyle='rgba(255,255,255,.35)';c.fillRect(0,0,64,6);c.fillStyle='rgba(0,0,0,.25)';c.fillRect(0,34,64,6);
    c.fillStyle=fg;px(c,label.length>7?6:label.length>5?7:9);c.textAlign='center';c.textBaseline='middle';c.fillText(label,32,21);b.tex.needsUpdate=true;}
  b.lit=lit;
}
function humanTurn(){return PK.stage!=='off'&&PK.seats[PK.toAct]===PK.human&&!PK.next;}
function updConsole(){
  const h=PK.human,my=humanTurn();
  const toCall=Math.max(0,PK.curBet-h.bet);
  const minTo=Math.min(h.bet+h.stack,PK.curBet+PK.minRaise),maxTo=h.bet+h.stack;
  if(my){PK.raiseTo=clamp(PK.raiseTo||minTo,minTo,maxTo);}
  setPBtn('FOLD','FOLD',my);
  setPBtn('CALL',toCall>0?('CALL '+fmt(Math.min(toCall,h.stack))):'CHECK',my);
  setPBtn('MINUS','−',my&&maxTo>minTo);
  setPBtn('RAISE',(PK.curBet>0?'RAISE ':'BET ')+fmt(PK.raiseTo||minTo),my&&maxTo>PK.curBet&&h.stack>toCall);
  setPBtn('PLUS','+',my&&maxTo>minTo);
  setPBtn('ALLIN','ALL IN',my&&h.stack>0);
  if(PK.stage==='off'&&h.out&&PK.sitting){setPBtn('CALL','NACHKAUFEN',chips>=100);}
  const c=PK.consoleTex.userData.ctx;c.fillStyle='#07040c';c.fillRect(0,0,320,64);c.strokeStyle='#3a2c52';c.strokeRect(.5,.5,319,63);
  px(c,8);c.textBaseline='middle';c.textAlign='left';c.fillStyle='#9b8fb3';c.fillText('STACK',8,12);c.fillStyle='#ffcf3a';c.fillText(fmt(h.stack),58,12);
  c.fillStyle='#9b8fb3';c.textAlign='right';c.fillText('POT',250,12);c.fillStyle='#ffcf3a';c.fillText(fmt(potTotal()),312,12);
  c.textAlign='center';px(c,9);c.fillStyle=my?'#3adf5a':'#f4f0e8';
  let line=PK.info||'';
  if(my)line=toCall>0?('DU BIST DRAN · '+fmt(toCall)+' ZU ZAHLEN'):'DU BIST DRAN';
  c.fillText(line,160,34);
  if(h.hole.length===2&&PK.stage!=='off'){const sc=PK.board.length>=3?PokerCore.evalBest(h.hole.concat(PK.board)):0;px(c,7);c.fillStyle='#ff5ab0';c.fillText('DEIN BLATT: '+(PK.board.length?PokerCore.handName(sc):(h.hole[0]%13===h.hole[1]%13?'POCKET-PAAR':'ZWEI KARTEN')),160,54);}
  PK.consoleTex.needsUpdate=true;
  if(typeof pkBarSync==='function')pkBarSync();
}
function pressPBtn(key){
  const b=PK.btns[key];b.press=1;SFX.btn();if(!b.lit)return;
  if(PK.stage==='off'&&key==='CALL'&&PK.human.out){rebuyHuman();return;}
  if(!humanTurn())return;
  const h=PK.human,minTo=Math.min(h.bet+h.stack,PK.curBet+PK.minRaise),maxTo=h.bet+h.stack,step=Math.max(PK.bb,Math.round(potTotal()/4/10)*10);
  switch(key){
    case 'FOLD':doAction(0,'fold');break;
    case 'CALL':doAction(0,PK.curBet>h.bet?'call':'check');break;
    case 'MINUS':PK.raiseTo=clamp(PK.raiseTo-step,minTo,maxTo);updConsole();break;
    case 'PLUS':PK.raiseTo=clamp(PK.raiseTo+step,minTo,maxTo);updConsole();break;
    case 'RAISE':doAction(0,'raise',PK.raiseTo);break;
    case 'ALLIN':doAction(0,'raise',maxTo);break;
  }
}

/* ---------- table flow ---------- */
function later(sec,fn){PK.wait=sec;PK.next=fn;}
function pokerSit(){
  if(PK.sitting)return true;
  const buy=chips;if(buy<500){toast('Du brauchst mindestens 500 Chips für den Tisch.');return false;}
  setChips(chips-buy);PK.human.stack=buy;PK.human.out=false;PK.sitting=true;store('nk_pstack',PK.human.stack);
  PK.info='BUY-IN '+fmt(buy)+' · GLEICH GEHT\'S LOS';PK.msg='NEUE RUNDE';drawPot();updConsole();
  say(PK.dealerNpc,'Willkommen am Tisch. Blinds 50 und 100.',3);
  later(1.6,newHand);return true;
}
function rebuyHuman(){const buy=chips;if(buy<500){PK.info='ZU WENIG CHIPS';updConsole();return;}setChips(chips-buy);PK.human.stack=buy;PK.human.out=false;store('nk_pstack',buy);PK.info='NACHGEKAUFT';updConsole();later(1,newHand);}
function pokerLeave(){
  const h=PK.human;
  if(PK.stage!=='off'&&!h.folded){h.folded=true;h.last='FOLD';}
  setChips(chips+h.stack,h.stack>0);h.stack=0;h.out=true;PK.sitting=false;store('nk_pstack',null);
  // finish table quietly
  clearTable();PK.stage='off';PK.next=null;PK.toAct=-1;PK.msg='';PK.info='';
  PK.seats.forEach(s=>{s.bet=0;s.total=0;s.last='';s.folded=false;if(s.npc)s.npc.anim='cards';drawSeatLabel(s);});
  PK.seats.forEach(s=>setStack(s.chips,0));setStack(PK.potStack,0);drawPot();updConsole();
}
function clearTable(){PK.cards.forEach(m=>m.parent&&m.parent.remove(m));PK.cards=[];PK.boardMeshes=[];PK.seats.forEach(s=>s.meshes=[]);}
function active(){return PK.seats.filter(s=>!s.out);}
function nextIdx(i,pred){for(let k=1;k<=PK.seats.length;k++){const j=(i+k)%PK.seats.length;if(pred(PK.seats[j]))return j;}return -1;}
function newHand(){
  PK.next=null;
  PK.seats.forEach(s=>{if(!s.human&&s.stack<=0){s.stack=20000;s.last='NACHGEKAUFT';say(s.npc,'Nachgekauft. Jetzt erst recht.',2.5);}});
  const h=PK.human;if(h.stack<=0){h.out=true;PK.stage='off';PK.info='KEINE CHIPS MEHR · NACHKAUFEN ODER AUFSTEHEN';PK.msg='';drawPot();updConsole();return;}
  clearTable();
  PK.handNo++;PK.board=[];
  PK.deck=[...Array(52).keys()];for(let i=51;i>0;i--){const j=Math.random()*(i+1)|0;[PK.deck[i],PK.deck[j]]=[PK.deck[j],PK.deck[i]];}
  PK.seats.forEach(s=>{s.hole=[];s.bet=0;s.total=0;s.folded=s.out;s.allin=false;s.last='';s.acted=false;s.meshes=[];if(s.npc)s.npc.anim='cards';});
  PK.dealer=nextIdx(PK.dealer,s=>!s.out);
  const n=active().length;
  const sbI=n===2?PK.dealer:nextIdx(PK.dealer,s=>!s.out),bbI=nextIdx(sbI,s=>!s.out);
  post(sbI,PK.sb,'SMALL BLIND');post(bbI,PK.bb,'BIG BLIND');store('nk_pstack',PK.human.stack);
  PK.curBet=PK.bb;PK.minRaise=PK.bb;PK.stage='pre';PK.msg='PREFLOP';PK.info='';
  const ds=seatSpot(PK.seats[PK.dealer],.55);PK.dbtn.position.set(ds.x+.25,.9,ds.z);
  // deal
  let k=0;
  for(let r=0;r<2;r++)for(let i=1;i<=PK.seats.length;i++){const s=PK.seats[(PK.dealer+i)%PK.seats.length];if(s.out)continue;const c=PK.deck.pop();s.hole.push(c);dealCardTo(s,r,c,k++*.12);}
  PK.toAct=nextIdx(bbI,s=>!s.out);
  refreshAll();
  later(k*.12+.6,askAction);
}
function post(i,amt,lbl){const s=PK.seats[i];const a=Math.min(amt,s.stack);s.stack-=a;s.bet+=a;s.total+=a;if(s.stack===0)s.allin=true;s.last=lbl;setStack(s.chips,s.bet);}
function dealCardTo(s,r,c,delay){
  const m=makeCard(PK.F.group);m.rotation.z=Math.PI;m.position.set(PK.cx,1.0,PK.cz-2.1);m.visible=false;PK.cards.push(m);s.meshes.push(m);
  let to;
  if(s.human){to=new THREE.Vector3(PK.cx-.16+r*.32,.905,PK.cz+1.5);}
  else{const p=seatSpot(s,.66),ang=Math.atan2(s.pos[0],s.pos[1]);to=new THREE.Vector3(p.x+Math.cos(ang)*(r?.14:-.14),.9,p.z-Math.sin(ang)*(r?.14:-.14));m.rotation.y=ang;}
  setTimeout(()=>{m.visible=true;SFX.card();moveTo(m,to,.32,.25,()=>{if(s.human){setCardFace(m,c);flipTo(m,true,.3);}});},delay*1000);
}
function dealBoard(n,done){
  for(let i=0;i<n;i++){const c=PK.deck.pop();PK.board.push(c);const idx=PK.board.length-1;
    const m=makeCard(PK.F.group);m.rotation.z=Math.PI;m.position.set(PK.cx,1.0,PK.cz-2.1);PK.cards.push(m);PK.boardMeshes.push(m);setCardFace(m,c);
    const to=new THREE.Vector3(PK.cx-.62+idx*.31,.9,PK.cz-.12);
    setTimeout(()=>{SFX.card();moveTo(m,to,.3,.2,()=>flipTo(m,true,.28));},i*180);}
  later(n*.18+.75,done);
}
function refreshAll(){PK.seats.forEach(s=>{drawSeatLabel(s);setStack(s.chips,s.bet);});setStack(PK.potStack,potTotal()-PK.seats.reduce((a,s)=>a+s.bet,0));drawPot();updConsole();}
function inHand(){return PK.seats.filter(s=>!s.folded);}
function canAct(){return PK.seats.filter(s=>!s.folded&&!s.allin);}
function roundDone(){
  const ca=canAct();
  if(inHand().length<=1)return true;
  if(ca.length===0)return true;
  if(ca.length===1&&ca[0].bet>=PK.curBet)return true;
  return ca.every(s=>s.acted&&s.bet===PK.curBet);
}
function askAction(){
  PK.next=null;
  if(inHand().length<=1){return endUncontested();}
  if(roundDone())return nextStage();
  let s=PK.seats[PK.toAct];
  if(s.folded||s.allin){PK.toAct=nextIdx(PK.toAct,x=>!x.folded&&!x.allin);s=PK.seats[PK.toAct];}
  refreshAll();
  if(s.human){PK.raiseTo=0;updConsole();SFX.ding();return;}
  s.last='DENKT...';drawSeatLabel(s);
  later(.8+Math.random()*.9,()=>botAct(PK.toAct));
}
function doAction(i,type,to){
  const s=PK.seats[i],toCall=Math.max(0,PK.curBet-s.bet);
  if(type==='check'&&toCall>0)type='call';
  if(type==='fold'){s.folded=true;s.last='FOLD';(s.meshes||[]).forEach(m=>moveTo(m,new THREE.Vector3(PK.cx,.9,PK.cz-1.6),.35,.1,()=>{m.visible=false;}));if(s.npc)s.npc.anim='folded';}
  else if(type==='check'){s.last='CHECK';SFX.click();}
  else if(type==='call'){const a=Math.min(toCall,s.stack);s.stack-=a;s.bet+=a;s.total+=a;if(s.stack===0){s.allin=true;s.last='ALL-IN';}else s.last='CALL '+fmt(a);SFX.chip();}
  else if(type==='raise'){
    to=Math.min(to,s.bet+s.stack);const a=to-s.bet;s.stack-=a;s.bet=to;s.total+=a;
    if(to>PK.curBet){const inc=to-PK.curBet;if(inc>=PK.minRaise){PK.minRaise=inc;PK.seats.forEach(o=>{if(o!==s)o.acted=false;});}PK.curBet=to;}
    if(s.stack===0){s.allin=true;s.last='ALL-IN '+fmt(to);}else s.last=(toCall>0?'RAISE ':'BET ')+fmt(to);
    SFX.chip();SFX.chip();
    if(s.npc&&Math.random()<.35)say(s.npc,s.allin?['All-in. Spaß.','Alles rein.','Zeig, was du hast.'][Math.random()*3|0]:['Erhöhe.','Wird teuer.','Mal sehen, ob du mitgehst.'][Math.random()*3|0],2.4);
  }
  s.acted=true;
  if(s.human)store('nk_pstack',s.stack);
  setStack(s.chips,s.bet);
  PK.toAct=nextIdx(i,x=>!x.folded&&!x.allin);
  if(PK.toAct<0)PK.toAct=i;
  refreshAll();
  later(.35,askAction);
}
function botAct(i){
  const s=PK.seats[i];if(PK.stage==='off')return;
  const toCall=Math.max(0,PK.curBet-s.bet),pot=potTotal();
  const opp=inHand().length-1;
  const eq=PokerCore.equity(s.hole,PK.board,Math.max(1,opp),80);
  const odds=toCall/(pot+toCall||1);
  const e=eq+(Math.random()-.5)*.12+(s.loose-.4)*.08;
  const strong=1/(opp+1)+.18;
  const bluff=Math.random()<s.agg*.08;
  const sizeTo=()=>{const frac=.5+Math.random()*.6*(.5+s.agg);let t=PK.curBet+Math.max(PK.minRaise,Math.round(pot*frac/10)*10);return Math.min(t,s.bet+s.stack);};
  if(toCall===0){
    if((e>strong&&Math.random()<.55+s.agg*.4)||bluff)return doAction(i,'raise',sizeTo());
    return doAction(i,'check');
  }
  if(e<odds-.04&&!bluff){if(Math.random()<s.loose*.25&&toCall<=PK.bb*2)return doAction(i,'call');return doAction(i,'fold');}
  if((e>strong+.12&&Math.random()<.35+s.agg*.5)||(bluff&&toCall<s.stack*.3)){return doAction(i,'raise',sizeTo());}
  if(toCall>=s.stack&&e<.45&&Math.random()>s.loose)return doAction(i,'fold');
  return doAction(i,'call');
}
function collectBets(){PK.seats.forEach(s=>{s.bet=0;s.acted=false;if(!s.folded&&!s.allin)s.last='';});PK.curBet=0;PK.minRaise=PK.bb;}
function nextStage(){
  collectBets();SFX.chip();refreshAll();
  const runout=canAct().length<=1;
  const go=()=>{PK.toAct=nextIdx(PK.dealer,x=>!x.folded&&!x.allin);if(PK.toAct<0)PK.toAct=PK.dealer;refreshAll();later(runout?1.0:.5,runout?nextStage:askAction);};
  if(PK.stage==='pre'){PK.stage='flop';PK.msg='FLOP';drawPot();dealBoard(3,go);}
  else if(PK.stage==='flop'){PK.stage='turn';PK.msg='TURN';drawPot();dealBoard(1,go);}
  else if(PK.stage==='turn'){PK.stage='river';PK.msg='RIVER';drawPot();dealBoard(1,go);}
  else showdown();
}
function endUncontested(){
  collectBets();const w=inHand()[0];const amt=potTotal();
  w.stack+=amt;PK.msg=w.name+' GEWINNT '+fmt(amt);w.last='GEWINNT';
  if(w.human){SFX.win();PK.info='ALLE GEPASST · +'+fmt(amt);UFX.banner('GEWONNEN',amt,0,'ALLE GEPASST');}else if(w.npc){w.npc.anim='cheer';setTimeout(()=>{if(w.npc.anim==='cheer')w.npc.anim='cards';},1500);}
  finishHand();
}
function showdown(){
  PK.stage='show';const ih=inHand();
  ih.forEach(s=>{if(!s.human)(s.meshes||[]).forEach((m,j)=>{setCardFace(m,s.hole[j]);flipTo(m,true,.35);});});
  const scores=PK.seats.map(s=>s.folded?-1:PokerCore.evalBest(s.hole.concat(PK.board)));
  const pots=PokerCore.pots(PK.seats);
  const won=PK.seats.map(()=>0);
  pots.forEach(p=>{if(!p.elig.length)return;let best=-1;p.elig.forEach(i=>{if(scores[i]>best)best=scores[i];});
    const ws=p.elig.filter(i=>scores[i]===best);const share=Math.floor(p.amount/ws.length);let rest=p.amount-share*ws.length;
    ws.forEach(i=>{won[i]+=share;});if(rest>0)won[ws[0]]+=rest;});
  let best=-1,bi=-1;won.forEach((w,i)=>{if(w>0){PK.seats[i].stack+=w;if(scores[i]>best){best=scores[i];bi=i;}}});
  ih.forEach(s=>{s.last=PokerCore.handName(scores[PK.seats.indexOf(s)]);});
  won.forEach((w,i)=>{if(w>0)PK.seats[i].last='+'+fmt(w)+' '+PokerCore.handName(scores[i]);});
  const W=PK.seats[bi];PK.msg=(W.human?'DU GEWINNST':W.name+' GEWINNT')+' · '+PokerCore.handName(best);
  if(won[0]>0){SFX.big();if(won[0]>=200)mpWin('gewinnt '+fmt(won[0])+' beim Poker mit '+PokerCore.handName(scores[0])+'!');PK.info='GEWONNEN +'+fmt(won[0])+' · '+PokerCore.handName(scores[0]);
    UFX.banner('DU GEWINNST',won[0],won[0]>=PK.bb*40?2:won[0]>=PK.bb*10?1:0,PokerCore.handName(scores[0]));}
  else if(!PK.human.folded){SFX.lose();PK.info='VERLOREN · '+(PK.human.out?'':PokerCore.handName(scores[0]));UFX.flash(.4,'255,40,40');UFX.shake(.35);}
  if(W.npc){W.npc.anim='cheer';say(W.npc,['Danke für die Spende.','So spielt man das.','Ha!','Lesen und weinen.'][Math.random()*4|0],2.6);setTimeout(()=>{if(W.npc.anim==='cheer')W.npc.anim='cards';},1800);}
  finishHand(5);
}
function finishHand(delay){
  PK.seats.forEach(s=>{s.bet=0;s.total=0;});PK.toAct=-1;
  if(PK.stage!=='show')PK.stage='done';
  store('nk_pstack',PK.human.stack);
  setStack(PK.potStack,0);refreshAll();
  later(delay||3,()=>{PK.stage='off';PK.msg='NÄCHSTE HAND';PK.info='';drawPot();updConsole();later(1,newHand);});
}
function pokerStep(dt){
  UFX.tension('poker',!!(typeof focus!=='undefined'&&focus&&focus.type==='poker'&&['pre','flop','turn','river'].includes(PK.stage)&&PK.human&&!PK.human.folded&&!PK.human.out&&PK.seats.some(s=>s.allin&&!s.folded)));
  if(PK.next){PK.wait-=dt;if(PK.wait<=0){const f=PK.next;PK.next=null;f();}}
  for(const k in PK.btns){const b=PK.btns[k];b.mat.color.setHex(b.lit?(k==='CALL'&&humanTurn()&&Math.floor(now*3)%2?0xffffff:0xe0e0e0):0x3a3a3a);if(b.press>0)b.press=Math.max(0,b.press-dt*7);b.mesh.position.y=.035-b.press*.012;}
}
