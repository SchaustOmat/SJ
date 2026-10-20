/* =========================================================
   HÖHER / TIEFER  (Karten-Risiko, 3D-Tisch im 2. Stock)
   ========================================================= */
const HL={F:null,cx:4,cz:7,state:'bet',stakes:[10,20,50,100,200,500,1000,2000,5000],si:3,pending:0,open:null,hidden:[],meshes:[],openMesh:null,pick:-1,msg:'',round:0,btns:{},tex:null,timer:0,next:null};
const HLBTN=[['MINUS',.12,'white'],['PLUS',.12,'white'],['GEBEN',.26,'green'],['NEHMEN',.26,'yellow'],['WEITER',.26,'red']];
function buildHilo(F){
  HL.F=F;const cx=HL.cx,cz=HL.cz;
  const g=new THREE.Group();g.position.set(cx,0,cz);F.group.add(g);HL.group=g;
  const top=mesh(new THREE.CylinderGeometry(1,1,.1,56),[lam({map:T.wood}),lam({color:0x5a1424}),lam({map:T.wood})],0,.84,0,g);top.scale.set(1.15,1,.75);
  const rim=mesh(new THREE.CylinderGeometry(1,1,.12,56),lam({color:0x2a1408}),0,.82,0,g);rim.scale.set(1.22,1,.82);
  mesh(new THREE.CylinderGeometry(.3,.5,.76,24),lam({color:0x120c18}),0,.38,0,g);
  const act={type:'hilo',label:'HÖHER/TIEFER',sub:'Karten-Risiko · Hinsetzen',pos:new THREE.Vector3(cx,1,cz+1.2),reach:2.2};
  tagAct(F,g,act);act.pos=new THREE.Vector3(cx,1,cz+1.1);
  col(F,cx,cz,2.5,1.7);
  const hs=new THREE.Group();hs.position.set(cx,0,cz+1.25);F.group.add(hs);
  mesh(new THREE.CylinderGeometry(.04,.14,.6,16),lam({color:0x2a2a30}),0,.3,0,hs);mesh(new THREE.CylinderGeometry(.24,.24,.09,24),lam({color:0x6a1020}),0,.62,0,hs);
  HL.dealer=npc(F,{x:cx,z:cz-1.05,rot:0,anim:'dealer',lines:["Höher gewinnt doppelt.","Gleich bleibt gleich.","Na, traust du dich?"],name:'KARTENGEBER',color:0x1a1a1e,glasses:true});
  // printed felt labels
  const lt=labelTex(256,32,(c)=>{c.clearRect(0,0,256,32);px(c,10);c.textAlign='center';c.textBaseline='middle';c.fillStyle='rgba(255,207,58,.8)';c.fillText('BANK          WÄHLE EINE KARTE',128,16);});
  const lm=mesh(new THREE.PlaneGeometry(1.7,.21),new THREE.MeshBasicMaterial({map:lt,transparent:true}),cx+.08,.892,cz-.33,F.group);lm.rotation.x=-Math.PI/2;
  // console
  const cg=new THREE.Group();HL.cg=cg;cg.position.set(cx,1.0,cz+.72);cg.rotation.x=.55;F.group.add(cg);
  box(1.2,.04,.4,lam({color:0x120c18}),0,0,0,cg);box(1.22,.02,.02,bas({color:0xffcf3a}),0,.025,.2,cg);
  HL.tex=canvasTex(320,64,null);const d=mesh(new THREE.PlaneGeometry(1.1,.22),bas({map:HL.tex}),0,.022,-.07,cg);d.rotation.x=-Math.PI/2;
  let x=-((HLBTN.reduce((a,b)=>a+b[1],0)+.03*(HLBTN.length-1))/2);
  HLBTN.forEach(([key,w,colr])=>{const tex=labelTex(64,40,null);const topM=bas({map:tex,color:0x666666});const side=lam({color:0x1a1a1a});
    const b=mesh(new THREE.BoxGeometry(w,.035,.11),[side,side,topM,side,side,side],x+w/2,.035,.12,cg);x+=w+.03;
    b.userData.act={type:'hlbtn',key};F.hits.push(b);HL.btns[key]={mesh:b,tex,mat:topM,label:'',color:colr,lit:false,press:0};});
  hlUpdate();
}
function setHBtn(key,label,lit){const b=HL.btns[key];if(b.label!==label){b.label=label;const c=b.tex.userData.ctx,[bg,fg]=BTNCOL[b.color];
  c.fillStyle=bg;c.fillRect(0,0,64,40);c.fillStyle='rgba(255,255,255,.35)';c.fillRect(0,0,64,6);c.fillStyle='rgba(0,0,0,.25)';c.fillRect(0,34,64,6);
  c.fillStyle=fg;px(c,label.length>6?7:9);c.textAlign='center';c.textBaseline='middle';c.fillText(label,32,21);b.tex.needsUpdate=true;}b.lit=lit;}
function hlStake(){return HL.stakes[HL.si];}
function hlUpdate(){
  const s=HL.state;
  setHBtn('MINUS','−',s==='bet'&&HL.si>0);setHBtn('PLUS','+',s==='bet'&&HL.si<HL.stakes.length-1);
  setHBtn('GEBEN','GEBEN',s==='bet'&&chips>=hlStake());
  setHBtn('NEHMEN','NEHMEN',s==='decide');setHBtn('WEITER','WEITER ×2',s==='decide');
  const c=HL.tex.userData.ctx;c.fillStyle='#07040c';c.fillRect(0,0,320,64);c.strokeStyle='#3a2c52';c.strokeRect(.5,.5,319,63);
  px(c,8);c.textBaseline='middle';c.textAlign='left';c.fillStyle='#9b8fb3';
  if(s==='bet'){c.fillText('EINSATZ',8,13);c.fillStyle='#ffcf3a';c.fillText(fmt(hlStake()),78,13);}
  else{c.fillText('IM SPIEL',8,13);c.fillStyle='#ffcf3a';c.fillText(fmt(HL.pending),88,13);c.textAlign='right';c.fillStyle='#9b8fb3';c.fillText('RUNDE '+HL.round,312,13);}
  c.textAlign='center';px(c,9);c.fillStyle=s==='pick'?'#3adf5a':'#f4f0e8';c.fillText(HL.msg||(s==='bet'?'EINSATZ WÄHLEN, DANN GEBEN':''),160,36);
  px(c,7);c.fillStyle='#ff5ab0';
  if(s==='pick'||s==='decide')c.fillText('HÖHER ×2 · GLEICH BLEIBT · TIEFER WEG',160,54);
  if(s==='decide')c.fillText('WEITER: '+fmt(HL.pending)+' AUF '+fmt(HL.pending*2),160,54);
  HL.tex.needsUpdate=true;
  if(typeof hlBarSync==='function')hlBarSync();
}
function hlClearCards(){HL.meshes.forEach(m=>{m.parent&&m.parent.remove(m);const i=HL.F.hits.indexOf(m);if(i>=0)HL.F.hits.splice(i,1);});HL.meshes=[];if(HL.openMesh&&HL.openMesh.parent)HL.openMesh.parent.remove(HL.openMesh);HL.openMesh=null;}
function hlDeal(){
  hlClearCards();
  const deck=[...Array(52).keys()];for(let i=51;i>0;i--){const j=Math.random()*(i+1)|0;[deck[i],deck[j]]=[deck[j],deck[i]];}
  let oi=deck.findIndex(c=>c%13!==12);[deck[0],deck[oi]]=[deck[oi],deck[0]];
  HL.open=deck[0];HL.hidden=deck.slice(1,5);
  // mindestens eine verdeckte Karte ist gleich oder höher als die Bankkarte
  if(!HL.hidden.some(c=>c%13>=HL.open%13)){const j=deck.findIndex((c,i)=>i>=5&&c%13>=HL.open%13);if(j>=0)HL.hidden[Math.random()*4|0]=deck[j];}HL.pick=-1;HL.round++;
  const F=HL.F,cx=HL.cx,cz=HL.cz,src=new THREE.Vector3(cx,1.0,cz-.85);
  const om=makeCard(F.group);om.rotation.z=Math.PI;om.position.copy(src);setCardFace(om,HL.open);HL.openMesh=om;
  setTimeout(()=>{SFX.card();moveTo(om,new THREE.Vector3(cx-.62,.905,cz-.05),.3,.2,()=>flipTo(om,true,.3));},0);
  for(let i=0;i<4;i++){const m=makeCard(F.group);m.rotation.z=Math.PI;m.position.copy(src);m.visible=false;HL.meshes.push(m);
    m.userData.act={type:'hlcard',idx:i};F.hits.push(m);
    setTimeout(()=>{m.visible=true;SFX.card();moveTo(m,new THREE.Vector3(cx-.18+i*.31,.905,cz-.05),.3,.2);},250+i*140);}
  HL.state='deal';HL.msg='';hlUpdate();
  hlLater(1.0,()=>{HL.state='pick';HL.msg='WELCHE KARTE IST HÖHER ALS '+RANKN[HL.open%13]+'?';hlUpdate();SFX.ding();});
}
function hlLater(t,fn){HL.timer=t;HL.next=fn;}
function hlPress(key){
  const b=HL.btns[key];b.press=1;SFX.btn();if(!b.lit)return;
  if(key==='MINUS'){HL.si--;hlUpdate();}
  else if(key==='PLUS'){HL.si++;hlUpdate();}
  else if(key==='GEBEN'){const st=hlStake();if(chips<st)return;setChips(chips-st);HL.pending=st;HL.round=0;store('nk_hlpend',st);hlDeal();}
  else if(key==='NEHMEN'){hlCollect();}
  else if(key==='WEITER'){hlDeal();}
}
function hlCollect(){if(HL.pending>=1000)mpWin('kassiert '+fmt(HL.pending)+' bei Höher/Tiefer!');if(HL.pending>0){setChips(chips+HL.pending,true);SFX.chip();HL.msg='+'+fmt(HL.pending)+' KASSIERT';
  UFX.burst(LW()/2,LH()*.6,24,{coin:true,sz:9,spd:300,up:260,life:1.3});UFX.flyChips(LW()/2,LH()*.5,HL.pending);}HL.pending=0;store('nk_hlpend',null);HL.state='bet';hlClearCards();hlUpdate();}
function hlPick(i){
  if(HL.state!=='pick')return;HL.pick=i;HL.state='reveal';
  const m=HL.meshes[i];setCardFace(m,HL.hidden[i]);SFX.card();
  moveTo(m,m.position.clone().add(new THREE.Vector3(0,.1,.14)),.3);UFX.tension('hilo',true);
  const a=HL.open%13,b=HL.hidden[i]%13,old=HL.pending;
  const res=b>a?'up':b===a?'eq':'down';
  HL.pending=res==='up'?old*2:res==='eq'?old:0;store('nk_hlpend',HL.pending||null);
  setTimeout(()=>{UFX.tension('hilo',false);if(HL.state!=='reveal'||HL.pick!==i)return;
  flipTo(m,true,.35,()=>{
    const cx=LW()/2,cy=LH()*.42,st=hlStake();
    if(res==='up'){HL.msg='HÖHER! JETZT '+fmt(HL.pending);SFX.win();if(HL.pending>=5000)say(HL.dealer,'Starke Nerven.',2);
      if(HL.round>=2)SFX.tierUp(Math.min(3,HL.round-2));
      if(HL.pending>=st*8)UFX.banner(HL.pending>=st*32?'WAHNSINN!':'HÖHER!',HL.pending,HL.pending>=st*32?2:1,'RUNDE '+HL.round);
      else{UFX.flash(.35,'160,255,170');UFX.burst(cx,cy,30,{cols:['#a8ffb0','#ffd23a','#fff'],spd:320});UFX.float(cx,cy,'×2 = '+fmt(HL.pending),'#3adf5a');}}
    else if(res==='eq'){HL.msg='GLEICH. EINSATZ BLEIBT '+fmt(HL.pending);SFX.click();UFX.float(cx,cy,'GLEICH','#f4f0e8');}
    else{HL.msg='TIEFER. '+fmt(old)+' VERLOREN';SFX.lose();SFX.boom();UFX.flash(.5,'255,30,30');UFX.shake(.5);if(Math.random()<.5)say(HL.dealer,'Pech. Nochmal?',2);}
    hlUpdate();
    hlLater(.6,()=>{HL.meshes.forEach((mm,j)=>{if(j!==i){setCardFace(mm,HL.hidden[j]);flipTo(mm,true,.3);}});
      hlLater(.9,()=>{if(HL.pending>0){HL.state='decide';}else{HL.state='bet';}hlUpdate();});});
  });},650);
  hlUpdate();
}
function hilloStep(dt){
  if(HL.next){HL.timer-=dt;if(HL.timer<=0){const f=HL.next;HL.next=null;f();}}
  for(const k in HL.btns){const b=HL.btns[k];b.mat.color.setHex(b.lit?0xe8e8e8:0x3a3a3a);if(b.press>0)b.press=Math.max(0,b.press-dt*7);b.mesh.position.y=.035-b.press*.012;}
  if(HL.state==='pick')HL.meshes.forEach((m,i)=>{m.position.y=.905+Math.max(0,Math.sin(now*4-i*.7))*.02;});
}
function hlLeave(){UFX.tension('hilo',false);if(HL.state==='reveal'||HL.state==='deal'){HL.next=null;}if(HL.pending>0&&(HL.state==='decide'||HL.state==='pick'||HL.state==='deal'||HL.state==='reveal'))hlCollect();else{HL.state='bet';hlClearCards();hlUpdate();}}
try{const hp=+localStorage.getItem('nk_hlpend');if(hp>0){chips+=hp;localStorage.removeItem('nk_hlpend');localStorage.setItem('nk_chips',String(chips));}}catch(e){}
