/* =========================================================
   AUFZUG
   ========================================================= */
const EL={open:0,target:0,phase:'idle',closeAt:0,t:0,dest:0,swapped:false,dispTex:null,lastDisp:''};
function buildHall(F,label){
  const g=F.group,z=-12;
  const frame=lam({map:T.metal,color:0x9aa0b0});
  [[-1.02,1.5,.24,3,.26],[1.02,1.5,.24,3,.26],[0,2.86,2.28,.32,.26]].forEach(([dx,y,w,h,d])=>{const b=box(w,h,d,frame,DOOR_X+dx,y,z+.13,g);blocker(F,b);});
  const dm=lam({map:T.metal,color:0xc8ccd8});
  const dl=box(.92,DOOR_H,.06,dm,DOOR_X-.46,DOOR_H/2,z+.06,g),dr=box(.92,DOOR_H,.06,dm,DOOR_X+.46,DOOR_H/2,z+.06,g);
  box(.02,DOOR_H,.065,lam({color:0x2a2a30}),DOOR_X,DOOR_H/2,z+.06,g);
  const it=canvasTex(64,32,null);
  const ind=mesh(new THREE.PlaneGeometry(.5,.25),bas({map:it}),DOOR_X,3.3,z+.02,g);
  const pan=box(.2,.42,.05,frame,DOOR_X+1.45,1.3,z+.03,g);
  const callM=mesh(new THREE.CylinderGeometry(.045,.045,.03,10),bas({color:0x6dff8a}),DOOR_X+1.45,1.3,z+.07,g);callM.rotation.x=Math.PI/2;
  const act={type:'ecall',label:'AUFZUG RUFEN',sub:'Knopf drücken',pos:new THREE.Vector3(DOOR_X+.6,1.3,z+.6),reach:2.4};
  [dl,dr,pan,callM].forEach(m=>{m.userData.act=act;F.hits.push(m);});F.acts.push(act);
  F.doors={dl,dr,ind:it,label,callM};
}
function buildCabin(){
  const g=new THREE.Group();scene.add(g);
  const x0=DOOR_X-1,x1=DOOR_X+1,z0=-12,z1=-14.4,H=3.0,cz=(z0+z1)/2;
  const wall=lam({map:canvasTex(16,16,metalT,1,1),color:0xb8b0a0});
  const fl=mesh(new THREE.PlaneGeometry(2,2.4,4,4),lam({map:canvasTex(32,32,checkerT,2,2)}),DOOR_X,.005,cz,g);fl.rotation.x=-Math.PI/2;fl.userData.floor=true;globalHits.push(fl);
  const ce=mesh(new THREE.PlaneGeometry(2,2.4),lam({color:0x2a2630}),DOOR_X,H,cz,g);ce.rotation.x=Math.PI/2;
  const bw=mesh(new THREE.PlaneGeometry(2,H,4,4),wall,DOOR_X,H/2,z1,g);blocker(null,bw);
  const ww=mesh(new THREE.PlaneGeometry(2.4,H,4,4),wall,x0,H/2,cz,g);ww.rotation.y=Math.PI/2;blocker(null,ww);
  const ew=mesh(new THREE.PlaneGeometry(2.4,H,4,4),wall,x1,H/2,cz,g);ew.rotation.y=-Math.PI/2;blocker(null,ew);
  const li=mesh(new THREE.PlaneGeometry(2,H-DOOR_H),wall,DOOR_X,(H+DOOR_H)/2,z0-.01,g);li.rotation.y=Math.PI;
  [x0+.05,x1-.05].forEach(x=>{const s=mesh(new THREE.PlaneGeometry(.1,H),wall,x,H/2,z0-.01,g);s.rotation.y=Math.PI;});
  box(1.8,.04,.04,lam({color:0xd0d4e0}),DOOR_X,1.0,z1+.08,g);
  box(1.2,.03,.9,bas({color:0xfff0c8}),DOOR_X,H-.02,cz,g);
  const mirror=mesh(new THREE.PlaneGeometry(1.2,1.2),lam({color:0x4a5a6a}),DOOR_X,1.75,z1+.01,g);
  pointLight(null,0xffe8c0,DOOR_X,2.7,cz,1.1,4.5);
  // panel
  box(.03,.62,.28,lam({map:T.metal,color:0x9aa0b0}),x1-.02,1.3,-12.85,g);
  const mk=(lbl,y,dest)=>{const t=labelTex(32,32,(c)=>{c.fillStyle='#e8e0cc';c.beginPath();c.arc(16,16,15,0,TAU);c.fill();c.fillStyle='#141018';px(c,lbl.length>1?9:13);c.textAlign='center';c.textBaseline='middle';c.fillText(lbl,16,17);});
    const side=lam({color:0x8a8a94});const mat=bas({map:t});
    const b=mesh(new THREE.BoxGeometry(.03,.11,.11),[side,mat,side,side,side,side],x1-.045,y,-12.85,g);
    const act={type:'ebtn',dest,label:dest==='open'?'TÜR AUF':dest===1?'2. STOCK':'ERDGESCHOSS',sub:'Aufzugknopf',pos:new THREE.Vector3(x1-.3,1.3,-12.85),reach:1.6,mesh:b,mat};
    b.userData.act=act;globalHits.push(b);globalActs.push(act);return act;};
  EL.btn2=mk('2',1.48,1);EL.btn0=mk('EG',1.3,0);EL.btnO=mk('◄►',1.12,'open');
  EL.dispTex=canvasTex(64,32,null);
  const dsp=mesh(new THREE.PlaneGeometry(.46,.23),bas({map:EL.dispTex}),DOOR_X,2.86,z0-.03,g);dsp.rotation.y=Math.PI;
  col(null,x0-.3,-13.3,.6,3);col(null,x1+.3,-13.3,.6,3);col(null,DOOR_X,z1-.3,2.6,.6);
}
function inCabin(){return P.z<-12.12&&Math.abs(P.x-DOOR_X)<.98;}
function inDoorway(){return P.z>-12.5&&P.z<-11.45&&Math.abs(P.x-DOOR_X)<1.0;}
function elevCall(){SFX.btn();if(EL.phase==='idle'){if(EL.target<1)SFX.doors();EL.target=1;EL.closeAt=now+6;}}
function elevGo(dest,act){
  SFX.btn();if(act){act.press=1;}
  if(EL.phase!=='idle')return;
  if(dest==='open'||dest===floorIdx){if(EL.target<1)SFX.doors();EL.target=1;EL.closeAt=now+6;return;}
  EL.dest=dest;EL.swapped=false;EL.target=0;EL.phase='closing';SFX.doors();
}
function drawElevDisp(){
  const arrow=EL.phase==='moving'?(EL.dest===1?'▲':'▼'):'';
  const lbl=floorIdx===1?'2':'EG';const key=lbl+arrow;if(key===EL.lastDisp)return;EL.lastDisp=key;
  [EL.dispTex].concat(floors.map(f=>f.doors&&f.doors.ind)).forEach((t,i)=>{if(!t)return;const c=t.userData.ctx;c.fillStyle='#120400';c.fillRect(0,0,64,32);
    px(c,12);c.textAlign='center';c.textBaseline='middle';c.fillStyle='#ff6a1a';const own=i===0?lbl:(floors[i-1].doors.label);
    c.fillText((arrow?arrow+' ':'')+(i===0?lbl:own),32,17);t.needsUpdate=true;});
}
function elevStep(dt){
  EL.open+=clamp(EL.target-EL.open,-dt*1.15,dt*1.15);
  floors.forEach(f=>{if(!f.doors)return;f.doors.dl.position.x=DOOR_X-.46-EL.open*.9;f.doors.dr.position.x=DOOR_X+.46+EL.open*.9;});
  [EL.btn2,EL.btn0,EL.btnO].forEach(a=>{if(!a)return;a.press=Math.max(0,(a.press||0)-dt*6);a.mesh.position.x=DOOR_X+1-.045+a.press*.012;
    const lit=(a.dest===EL.dest&&EL.phase!=='idle');a.mat.color.setHex(lit?0xffd23a:0xffffff);});
  switch(EL.phase){
    case 'idle':if(EL.open>.99&&now>EL.closeAt){if(inDoorway())EL.closeAt=now+1.5;else{EL.target=0;SFX.doors();}}break;
    case 'closing':
      if(inDoorway()&&EL.open>.04){EL.target=1;EL.phase='idle';EL.closeAt=now+3;toast('Lichtschranke: Tür geht wieder auf.');}
      else if(EL.open<.01){if(inCabin()){EL.phase='moving';EL.t=0;SFX.hum();}else EL.phase='idle';}
      break;
    case 'moving':
      EL.t+=dt;if(!EL.swapped&&EL.t>1.5){setFloor(EL.dest);EL.swapped=true;}
      if(EL.t>3.0){EL.phase='idle';SFX.ding();EL.target=1;EL.closeAt=now+7;}
      break;
  }
  drawElevDisp();
}

/* =========================================================
   WORLD BUILD
   ========================================================= */
let ambient,marker;
function buildWorld(){
  T.felt=canvasTex(64,32,feltT);
  T.wheel=canvasTex(128,128,wheelTop);
  T.wood=canvasTex(16,16,woodT,1,1);T.metal=canvasTex(16,16,metalT,1,1);
  // ----- EG -----
  const A=makeFloor('EG · HALLE');
  buildRoom(A,{floor:canvasTex(32,32,carpet('#1a0f2e','#3b1a5a','#b0206a','#127a7a'),12),wall:canvasTex(32,32,concrete,1,1),ceil:canvasTex(32,32,ceilingT,12),strip:0xff2e88});
  const conc=lam({map:canvasTex(32,32,concrete,1,4)});
  pillar(A,-5,-7,conc,0x29f0ff);pillar(A,5,-6.5,conc,0xff2e88);pillar(A,-5,4.5,conc,0xff2e88);pillar(A,5,4.5,conc,0x29f0ff);
  buildRoulette(A,0,-2,'ROULETTE · TISCH 1');
  const mA=[[-6.5,'book',0xd6a02a],[-4,'fruit',0xc42a3a],[-1.5,'book',0x2a6ad6],[1,'fruit',0xff6a1a]].map(([z,id,c])=>buildMachine(A,-11.6,z,Math.PI/2,id,c));
  // vier Freispiel-Automaten um die Ecke an der Nordwand
  [[-10.3,'viking',0x4a9aff],[-8.9,'mine',0x29f0ff],[-7.5,'reef',0x2ad8c8],[-6.1,'temple',0xff6a1a],[-4.7,'pharao',0xff2a2a]].forEach(([x,id,c])=>buildMachine(A,x,-11.6,0,id,c));
  buildBar(A);buildHall(A,'EG');buildATM(A,-2.4,-11.6,0);
  buildMTable(A,{id:'eg',name:'SPIELERTISCH',floor:0,x:5,z:8.2,sb:50,bb:100,buy:5000,color:0x29f0ff,stool:0x0a5a7a});
  sofa(A,-9.5,9.8,Math.PI,0x3a1240);sofa(A,-10.8,7,Math.PI/2,0x3a1240);
  box(.9,.4,.9,lam({map:T.wood}),-9.2,.2,7.6,A.group);col(A,-9.2,7.6,.9,.9);
  sign(A,"SINAN'S KELLER",'#ff2e88',-3.5,2.9,-11.9,0,.75);
  sign(A,'ROULETTE','#ffcf3a',0,3.5,-2,0,.45);
  sign(A,'SPIELHALLE','#29f0ff',-11.9,3.15,-2.75,Math.PI/2,.5);
  sign(A,'BAR','#29f0ff',11.55,3.25,-1,-Math.PI/2,.6);
  sign(A,'AUFZUG','#6dff8a',DOOR_X,3.62,-11.95,0,.32);
  sign(A,'KEIN AUSGANG','#ff3a3a',0,2.6,11.9,Math.PI,.4);
  decal(A,canvasTex(64,32,graffiti('SINAN','#ff5ab0')),2.4,1.2,-6,1.4,11.95,Math.PI);
  decal(A,canvasTex(64,32,graffiti('GLÜCK?','#ffd23a')),2,1,4,1.2,11.95,Math.PI);
  decal(A,canvasTex(64,32,graffiti('UNTEN','#4af0ff')),2.2,1.1,11.95,1.3,7,-Math.PI/2);
  decal(A,canvasTex(64,32,graffiti('RAUS','#7aff5a')),1.8,.9,-11.95,1.1,8,Math.PI/2);
  decal(A,canvasTex(64,32,graffiti('♠ ♥','#ff3a3a')),1.6,.8,2,1.8,-11.95,0);
  npc(A,{x:-1.3,z:-3.4,rot:0,anim:'dealer',lines:LINES.dealer,name:'CROUPIER',color:0x1a1a1e,hair:0x111111});
  const r1=npc(A,{x:.9,z:-3.45,rot:0,anim:'watch',lines:LINES.roulette,name:'STAMMGAST'});
  const r2=npc(A,{x:2.45,z:-2.2,rot:-Math.PI/2,anim:'watch',lines:LINES.roulette,name:'SPIELERIN',hair:0xb02a5a,color:0x6a1a24});
  mA[0].npc=npc(A,{x:-10.62,z:-6.5,rot:-Math.PI/2,sit:true,anim:'slot',lines:LINES.slot,name:'AUTOMATENOMA',hair:0xc8c8c8,color:0x6a2a5a,noCol:true});
  mA[3].npc=npc(A,{x:-10.62,z:1,rot:-Math.PI/2,sit:true,anim:'slot',lines:LINES.slot,name:'ZOCKER',noCol:true});
  npc(A,{x:10.9,z:-1,rot:-Math.PI/2,anim:'bar',lines:LINES.bartender,name:'BARKEEPER',special:'bartender',color:0xe8e8e8,noCol:true});
  npc(A,{x:8.85,z:1.2,rot:Math.PI/2,sit:true,anim:'drink',lines:LINES.generic,name:'GAST',noCol:true});
  npc(A,{x:3.9,z:-10.6,rot:.4,anim:'idle',lines:LINES.bouncer,name:'TÜRSTEHER',glasses:true,color:0x0c0c10,hair:0x111111});
  npc(A,{x:-9.4,z:9.7,rot:Math.PI,sit:true,anim:'idle',lines:LINES.generic,name:'GAST',noCol:true});
  A.rouletteFans=[r1,r2];
  pointLight(A,0xffc070,0,3.2,-2,1.7,8.5);
  pointLight(A,0xff2e88,-9.3,3,-2.7,1.5,9);
  pointLight(A,0x29f0ff,9.2,3,-1,1.3,9);
  pointLight(A,0x6dff8a,DOOR_X,3,-10,1.0,7);
  pointLight(A,0x8a5cff,-5,3,7.5,1.2,11,true);
  A.ambient=0x4a3a66;
  // ----- 2. STOCK -----
  seed=4242;
  const B=makeFloor('2. STOCK · VIP');
  buildRoom(B,{floor:canvasTex(32,32,carpet('#2a0a0e','#6a4a12','#b01a28','#d6a02a'),12),wall:canvasTex(32,32,brick,1,1),ceil:canvasTex(32,32,ceilingT,12),strip:0xffcf3a});
  const gold=lam({map:T.metal,color:0xd6a02a});
  pillar(B,0,-8.5,gold,0xff2e88);pillar(B,0,3,gold,0xff2e88);
  buildPoker(B);
  buildRoulette(B,4.5,-4.5,'ROULETTE · VIP');
  npc(B,{x:3.3,z:-5.9,rot:0,anim:'dealer',lines:LINES.dealer,name:'CROUPIER',color:0x1a1a1e});
  const v1=npc(B,{x:6.2,z:-5.9,rot:0,anim:'watch',lines:LINES.roulette,name:'HIGHROLLER',glasses:true,color:0x8a6a1a});
  const v2=npc(B,{x:7.0,z:-4.5,rot:-Math.PI/2,anim:'watch',lines:LINES.vip,name:'GAST'});
  B.rouletteFans=[v1,v2];
  const mB=[[1.5,'book',0xd6a02a],[4,'book',0xc42a3a],[6.5,'fruit',0xff6a1a]].map(([z,id,c])=>buildMachine(B,11.6,z,-Math.PI/2,id,c));
  mB[1].npc=npc(B,{x:10.62,z:4,rot:Math.PI/2,sit:true,anim:'slot',lines:LINES.slot,name:'ZOCKER',noCol:true});
  buildHilo(B);buildATM(B,-2.4,-11.6,0);
  sofa(B,-9.5,9.8,Math.PI,0x6a1020);sofa(B,-10.8,6.8,Math.PI/2,0x6a1020);
  npc(B,{x:-9.9,z:9.7,rot:Math.PI,sit:true,anim:'drink',lines:LINES.vip,name:'GAST',noCol:true});
  npc(B,{x:-10.7,z:6.5,rot:Math.PI/2,sit:true,anim:'idle',lines:LINES.vip,name:'GAST',noCol:true});
  speaker(B,-10.9,-10.9,Math.PI/4);speaker(B,10.9,10.9,-Math.PI*3/4);
  npc(B,{x:-8.6,z:8.4,rot:Math.PI*.8,anim:'dance',lines:["Hörst du den Bass?","Hier oben schläft keiner."],name:'TÄNZERIN',hair:0xb02a5a,color:0x2a4a2a});
  npc(B,{x:-7.6,z:9.4,rot:-Math.PI*.3,anim:'dance',lines:["Hörst du den Bass?","Einer noch!"],name:'TÄNZER'});
  buildHall(B,'2');
  npc(B,{x:3.9,z:-10.6,rot:.4,anim:'idle',lines:["Willkommen oben.","Hier wird nicht gedrängelt."],name:'TÜRSTEHERIN',glasses:true,color:0x0c0c10,hair:0x111111});
  sign(B,'VIP LOUNGE','#ffcf3a',-3.5,2.9,-11.9,0,.8);
  sign(B,'TEXAS HOLD\'EM','#ff2e88',-11.9,3,-4,Math.PI/2,.5);
  sign(B,'HÖHER/TIEFER','#ffcf3a',HL.cx,3.0,11.9,Math.PI,.45);
  sign(B,'SPIELHALLE','#ffcf3a',11.9,3.15,4,-Math.PI/2,.5);
  sign(B,'AUFZUG','#6dff8a',DOOR_X,3.62,-11.95,0,.32);
  decal(B,canvasTex(64,32,graffiti('BOSS','#ffd23a')),2.2,1.1,-11.95,1.5,1.5,Math.PI/2);
  decal(B,canvasTex(64,32,graffiti('ALL IN','#ff5ab0')),2.6,1.3,-1,1.4,11.95,Math.PI);
  pointLight(B,0xffb060,PK.cx,3.2,PK.cz,1.8,9);
  pointLight(B,0xff3040,4.5,3,-4.5,1.5,8.5);
  pointLight(B,0xffcf3a,9.3,3,4,1.3,9);
  pointLight(B,0x6dff8a,DOOR_X,3,-10,1.0,7);
  pointLight(B,0xff2e88,HL.cx-2,3,HL.cz,1.4,9,true);
  B.ambient=0x5a2a3a;
  buildMTable(B,{id:'vip',name:'HIGH ROLLER',floor:1,x:-3.6,z:5.2,sb:250,bb:500,buy:25000,color:0xffcf3a,stool:0x6a4a10});
  buildCabin();
  ambient=new THREE.AmbientLight(0x4a3a66,.6);scene.add(ambient);
  marker=mesh(new THREE.RingGeometry(.22,.32,8),bas({color:0x29f0ff,side:THREE.DoubleSide}),0,.03,0,scene);marker.rotation.x=-Math.PI/2;marker.visible=false;
}

/* =========================================================
   PLAYER, INPUT, FOCUS
   ========================================================= */
const P={x:0,z:9,yaw:0,pitch:-.05,bob:0,stepAcc:0};
let floorIdx=0,F=null,locked=true,started=false;
const joy={active:false,id:null,cx:0,cy:0,vx:0,vy:0};
const keys={};let walk=null;const pointers=new Map();
const joyBase=$('#joyBase'),joyKnob=$('#joyKnob'),joyHint=$('#joyHint');
let rot=0;try{rot=+(localStorage.getItem('nk_rot')||0);if(![0,90,-90].includes(rot))rot=0;}catch(e){}
function LW(){return rot?innerHeight:innerWidth;}
function LH(){return rot?innerWidth:innerHeight;}
function toLocal(x,y){if(rot===90)return [y,innerWidth-x];if(rot===-90)return [innerHeight-y,x];return [x,y];}
function applyRot(){
  if(!rot){app.style.width='';app.style.height='';app.style.transform='';}
  else{app.style.width=innerHeight+'px';app.style.height=innerWidth+'px';app.style.transform=rot===90?'rotate(90deg) translateY(-100%)':'rotate(-90deg) translateX(-100%)';}
  $('#rotBtn').setAttribute('aria-pressed',String(!!rot));app.classList.toggle('rotated',!!rot);resize();
}
function joyRest(){joyBase.style.left='calc(env(safe-area-inset-left,0px) + 90px)';joyBase.style.top='calc(100% - env(safe-area-inset-bottom,0px) - 98px)';joyKnob.style.transform='translate(0,0)';joyBase.classList.remove('on');
  joyHint.style.left='calc(env(safe-area-inset-left,0px) + 28px)';joyHint.style.top='calc(100% - env(safe-area-inset-bottom,0px) - 22px)';}
joyRest();
// PC: kein Joystick, Klick fängt die Maus (Umschauen mit der Maus), beim Spielen/Esc ist sie wieder frei
let PC=matchMedia('(hover:hover) and (pointer:fine)').matches,lockFail=false,lockOK=false,lockErrT=0;
const pcHint=$('#pcHint'),cross=$('#cross');
const mouseLocked=()=>document.pointerLockElement===cv;
function freeMouse(){if(mouseLocked())try{document.exitPointerLock();}catch(e){}}
function grabMouse(){if(!PC||mouseLocked())return;try{const r=cv.requestPointerLock();if(r&&r.catch)r.catch(()=>{});}catch(e){}}
function pcUi(){
  document.body.classList.toggle('pc',PC);
  const lk=mouseLocked(),hint=PC&&!lockFail&&started&&!lk&&!focus&&!openId;
  if(cross.hidden===lk)cross.hidden=!lk;if(pcHint.hidden===hint)pcHint.hidden=!hint;
}
document.addEventListener('pointerlockchange',()=>{if(mouseLocked())lockOK=true;pointers.clear();pcUi();});
// Browser ohne Maus-Fangen (z. B. eingebettet): dann wie bisher mit gedrückter Maus umschauen
// Hat es schon einmal geklappt, ist ein Fehler nur die Sperrzeit des Browsers direkt nach Esc: einfach nochmal klicken lassen
document.addEventListener('pointerlockerror',()=>{if(!lockOK){lockFail=true;pcUi();return;}
  if(performance.now()-lockErrT>1500){lockErrT=performance.now();toast('Kurz warten und nochmal klicken.');}});
document.addEventListener('mousemove',e=>{if(!mouseLocked()||locked||focus)return;
  P.yaw-=e.movementX*.0024*SENS;P.pitch=clamp(P.pitch-e.movementY*.0024*SENS,-1.2,1.1);});
addEventListener('pointerdown',e=>{if(e.pointerType==='touch'&&PC){PC=false;freeMouse();joyBase.hidden=!started||!!focus;joyHint.hidden=joyBase.hidden;pcUi();}},true);

let focus=null,camAnim=null;
function focusPose(){
  const asp=LW()/LH(),f=focus;const out={pos:new THREE.Vector3(),yaw:0,pitch:0,fov:60,look:true};
  if(f.type==='slot'){
    // Kamera fährt nah an den Automaten: Bildschirm füllt den freien Bereich über den Knöpfen, die Halle bleibt sichtbar
    const g=f.m.group,deck=$('.sv-side'),bh=deck&&!SV.el.hidden?deck.offsetHeight+16:120,top=asp<1?56:12,LHv=LH();
    const free=Math.max(.35,(LHv-bh-top)/LHv),shift=(top-bh)/LHv/2;
    const v=asp<1?60:50,tv=Math.tan(v*Math.PI/360),th=tv*asp;
    const H=asp<1?.74:.68,W=.86;
    const d=Math.max(H/(2*tv*free),W/(2*th))+.02,vis=2*d*tv;
    g.localToWorld(out.pos.set(0,1.47+shift*vis,.153+d));out.yaw=g.rotation.y;out.pitch=0;out.fov=v;
  } else if(f.type==='poker'||f.type==='hilo'||f.type==='mtable'){
    const cx=f.type==='poker'?PK.cx:HL.cx,cz=f.type==='poker'?PK.cz:HL.cz;
    const bar=f.type==='poker'?$('#pkBar'):f.type==='hilo'?$('#hlBar'):$('#mtBar');const top=110;
    const bh=bar&&!bar.hidden?bar.offsetHeight:150,LHv=LH();const free=Math.max(.35,(LHv-bh-top)/LHv),shift=(top-bh)/LHv/2;
    if(f.type==='mtable'){
      const T=f.m,si=mtMySeat(T),sa=si>=0?mtSeatPos(T,si,1).a:Math.PI/2,fx=-Math.cos(sa),fz=-Math.sin(sa);
      out.yaw=Math.atan2(-fx,-fz);
      if(asp<1){const hgt=2.7,rad=2.15;const t=rad/hgt/Math.min(1,asp)/free;out.fov=clamp(2*Math.atan(t)*180/Math.PI,40,140);
        const vis=2*hgt*Math.tan(out.fov*Math.PI/360);out.pos.set(T.cx+fx*shift*vis,.88+hgt,T.cz+fz*shift*vis);out.pitch=-Math.PI/2+.0001;out.look=false;}
      else{const d=T.R+1.35;out.pos.set(T.cx-fx*d,1.85,T.cz-fz*d);out.pitch=Math.atan2(.86-1.85,d)+shift*.9;out.fov=clamp(62/free*.82,58,90);}
      if(out.look){out.yaw+=f.ly||0;out.pitch+=f.lp||0;}
      return out;
    }
    if(asp<1){
      const hgt=f.type==='poker'?2.62:2.42,hw=f.type==='poker'?2.15:1.05,hz=f.type==='poker'?2.75:1.2;
      const t=Math.max(hz/hgt,hw/hgt/asp)/free;out.fov=clamp(2*Math.atan(t)*180/Math.PI,40,140);
      const vis=2*hgt*Math.tan(out.fov*Math.PI/360);
      out.pos.set(cx,.88+hgt,cz-(f.type==='poker'?.15:.05)-shift*vis);out.yaw=0;out.pitch=-Math.PI/2+.0001;out.look=false;
    } else {
      if(f.type==='poker'){out.pos.set(cx,1.55,cz+3.05);out.pitch=Math.atan2(.85-1.55,3.2);out.fov=clamp(62/free*.82,58,90);}
      else{out.pos.set(cx,1.6,cz+1.7);out.pitch=Math.atan2(.88-1.6,1.75);out.fov=clamp(56/free*.82,52,85);}
      out.pitch+=shift*out.fov*Math.PI/180;out.yaw=0;
    }
  }
  if(out.look){out.yaw+=f.ly||0;out.pitch+=f.lp||0;}
  return out;
}
function enterFocus(type,m){
  if(type==='poker'&&!pokerSit())return;
  if(type==='mtable'&&!MP.room){toast(window.NK_STANDALONE?'Erst oben auf MULTI tippen und einen Raum hosten oder beitreten.':'Der Spielertisch braucht eine Multiplayer-Verbindung.');return;}
  focus={type,m,ly:0,lp:0};freeMouse();
  camAnim={t:0,dur:.6,fromPos:camera.position.clone(),fromYaw:P.yaw,fromPitch:P.pitch,fromFov:camera.fov,dir:1};
  walk=null;marker.visible=false;joy.active=false;joy.vx=joy.vy=0;joyRest();
  $('#standBtn').hidden=type==='slot';if(type==='slot')svOpen(m);else barsFor(type);joyBase.hidden=true;joyHint.hidden=true;promptEl.hidden=true;curAct=null;
  // nichts zurücksetzen: der Automat zeigt genau das, wo du zuletzt warst (Menü nur beim allerersten Einschalten)
  if(type==='slot'){if(!m.booted&&RESV!==m)smOpen(m);else updateButtons(m);m.dirty=true;svCardSync();}
  if(type==='hilo'){HL.state='bet';hlUpdate();say(HL.dealer,'Einsatz wählen, dann GEBEN.',2.5);}
  if(type==='mtable'){const V=m.view;const free=V?V.seats.filter(x=>!x).length:MT_N;if(!MT.tok&&free>0&&chips>=m.bb*5)mtRequestSeat(m);MT.feed=[];mtBarSync();}
  resize();
}
function leaveFocus(){
  if(!focus)return;
  const f=focus;
  if(f.type==='slot'&&f.m===RESV){const m=f.m;const p=m.group.localToWorld(new THREE.Vector3(0,0,1.55));P.x=p.x;P.z=p.z;P.yaw=m.group.rotation.y;
    toast(m.auto?'Er spielt weiter und wartet bei Angeboten auf dich.':'Der Automat wartet auf dich.');}
  else if(f.type==='slot'){const m=f.m;if(['spin','count','fsIntro','fsWait','fsShow','expand','expandShow','fsRetrig','fsEnd','gambleNext','power','splash'].includes(m.state)){toast('Erst das Spiel beenden.');return;}
    if(m.win>0)collect(m);m.auto=false;m.state='idle';m.gamble=null;updateButtons(m);
    const p=m.group.localToWorld(new THREE.Vector3(0,0,1.55));P.x=p.x;P.z=p.z;P.yaw=m.group.rotation.y;}
  else if(f.type==='poker'){pokerLeave();P.x=PK.cx;P.z=PK.cz+3.25;P.yaw=0;}
  else if(f.type==='hilo'){if(['deal','pick','reveal'].includes(HL.state)){toast('Erst eine Karte wählen.');return;}hlLeave();P.x=HL.cx;P.z=HL.cz+1.95;P.yaw=0;}
  else if(f.type==='mtable'){const T=f.m,si=mtMySeat(T);mtLeaveSeat();const p=mtSeatPos(T,si>=0?si:0,T.R+.95);P.x=p.x;P.z=p.z;P.yaw=Math.atan2(-(T.cx-p.x),-(T.cz-p.z));}
  P.pitch=-.05;
  camAnim={t:0,dur:.5,fromPos:camera.position.clone(),fromYaw:camera.rotation.y,fromPitch:camera.rotation.x,fromFov:camera.fov,dir:-1};
  focus=null;svClose();barsFor(null);$('#standBtn').hidden=true;joyBase.hidden=PC;joyHint.hidden=PC;
  resize();
}
$('#standBtn').addEventListener('click',()=>{SFX.click();leaveFocus();});

cv.addEventListener('pointerdown',e=>{
  if(locked||!started)return;
  if(PC&&!lockFail&&e.pointerType==='mouse'&&!focus){if(e.button!==0)return;
    if(mouseLocked()){if(curAct)interact(curAct);else tapAt(LW()/2,LH()/2,true);}
    else grabMouse();
    return;}
  try{cv.setPointerCapture(e.pointerId);}catch(_){}
  const [lx,ly]=toLocal(e.clientX,e.clientY);
  const leftSide=!focus&&lx<LW()*.45&&e.pointerType!=='mouse';
  const p={x:lx,y:ly,t:performance.now(),mode:'look',moved:0};
  if(leftSide&&!joy.active){p.mode='joy';joy.active=true;joy.id=e.pointerId;joy.cx=lx;joy.cy=ly;joy.vx=joy.vy=0;joyBase.style.left=lx+'px';joyBase.style.top=ly+'px';joyBase.classList.add('on');}
  pointers.set(e.pointerId,p);
});
cv.addEventListener('pointermove',e=>{
  const p=pointers.get(e.pointerId);if(!p)return;
  const [lx,ly]=toLocal(e.clientX,e.clientY);const dx=lx-p.x,dy=ly-p.y;p.x=lx;p.y=ly;p.moved+=Math.abs(dx)+Math.abs(dy);
  if(locked)return;
  if(p.mode==='joy'){let vx=lx-joy.cx,vy=ly-joy.cy;const m=Math.hypot(vx,vy),R=52;if(m>R){vx*=R/m;vy*=R/m;}
    joyKnob.style.transform='translate('+vx+'px,'+vy+'px)';joy.vx=vx/R;joy.vy=vy/R;if(m>6)walk=null;}
  else{const s=(e.pointerType==='mouse'?.0045:.0062)*SENS;
    if(focus){if(p.moved>14){focus.ly=clamp(focus.ly-dx*s*.6,-.7,.7);focus.lp=clamp(focus.lp-dy*s*.6,-.45,.45);}}
    else{P.yaw-=dx*s;P.pitch=clamp(P.pitch-dy*s,-1.2,1.1);}}
});
function endPtr(e){
  const p=pointers.get(e.pointerId);if(!p)return;pointers.delete(e.pointerId);
  if(p.mode==='joy'){joy.active=false;joy.id=null;joy.vx=joy.vy=0;joyRest();}
  if(!locked&&e.type==='pointerup'&&p.moved<14&&performance.now()-p.t<420)tapAt(p.x,p.y);
}
cv.addEventListener('pointerup',endPtr);cv.addEventListener('pointercancel',endPtr);
addEventListener('keydown',e=>{keys[e.code]=true;
  if(e.code==='KeyE'&&curAct&&!locked&&!focus)interact(curAct);
  if(e.code==='Escape'&&focus)leaveFocus();
  if(focus&&focus.type==='slot'&&!e.repeat){const k=SVKEY_CODES[e.code];if(k){e.preventDefault();pressButton(focus.m,k);const b=SV.btn[k];if(b){b.classList.add('down');setTimeout(()=>b.classList.remove('down'),120);}}}});
// Tastatur am Automaten (am PC unter den Knöpfen angezeigt)
const SVKEY_CODES={Space:'START',Enter:'START',KeyA:'AUTO',KeyK:'KARTE',KeyL:'LEITER',KeyE:'EINSATZ',KeyN:'LINIEN',KeyI:'INFO',KeyM:'MENU'};
const SVHOT={START:'LEERTASTE',AUTO:'A',KARTE:'K',LEITER:'L',EINSATZ:'E',LINIEN:'N',INFO:'I',MENU:'M'};
addEventListener('keyup',e=>{keys[e.code]=false;});

const ray=new THREE.Raycaster(),v2=new THREE.Vector2();
function hitList(){return F.hits.concat(globalHits);}
function tapAt(x,y,noWalk){
  v2.set(x/LW()*2-1,-(y/LH())*2+1);ray.setFromCamera(v2,camera);ray.far=30;
  const hits=ray.intersectObjects(hitList(),false);if(!hits.length)return;
  if(focus){
    for(const h of hits){const a=h.object.userData.act;if(!a)continue;
      if(focus.type==='slot'&&h.object===focus.m.scrMesh&&smTap(focus.m,h.uv))return;
      if(focus.type==='slot'&&a.type==='mbtn'&&a.m===focus.m){pressButton(a.m,a.key);return;}
      if(focus.type==='hilo'&&a.type==='hlcard'){hlPick(a.idx);return;}
      if(a.type==='npc'){talk(a.npc);return;}
      if(h.distance>.3)break;}
    return;
  }
  const h=hits[0],act=h.object.userData.act;
  if(act&&act.pos){const d=Math.hypot(act.pos.x-P.x,act.pos.z-P.z);if(h.distance<4.2&&d<act.reach+1.6)interact(act);else startWalk(act.pos.x,act.pos.z,act);}
  else if(h.object.userData.floor&&!noWalk){startWalk(h.point.x,h.point.z,null);}
}
function startWalk(x,z,act){walk={x,z,act,t:0,lx:P.x,lz:P.z};marker.position.set(x,.03,z);marker.visible=!act;SFX.click();}
function collide(px,pz){
  const r=.33;const cols=F.cols.concat(globalCols);
  if(EL.open<.75)cols.push({x:DOOR_X,z:-11.94,w:1.9,d:.14});
  for(let it=0;it<2;it++)for(const c of cols){
    const hx=c.w/2,hz=c.d/2,cx=clamp(px,c.x-hx,c.x+hx),cz=clamp(pz,c.z-hz,c.z+hz);
    const dx=px-cx,dz=pz-cz,d2=dx*dx+dz*dz;
    if(d2<r*r){if(d2>1e-8){const d=Math.sqrt(d2);px=cx+dx/d*r;pz=cz+dz/d*r;}
      else{const l=px-(c.x-hx),rr=(c.x+hx)-px,t=pz-(c.z-hz),b=(c.z+hz)-pz,m=Math.min(l,rr,t,b);
        if(m===l)px=c.x-hx-r;else if(m===rr)px=c.x+hx+r;else if(m===t)pz=c.z-hz-r;else pz=c.z+hz+r;}}
  }
  return [clamp(px,-11.65,11.65),clamp(pz,-14.1,11.65)];
}
function angLerp(a,b,t){let d=((b-a+Math.PI)%TAU+TAU)%TAU-Math.PI;return a+d*Math.min(1,t);}

let curAct=null,promptT=0;
const promptEl=$('#prompt');
promptEl.addEventListener('click',()=>{if(curAct&&!locked&&!focus)interact(curAct);});
function updatePrompt(){
  let best=null;
  v2.set(0,0);ray.setFromCamera(v2,camera);ray.far=4.2;
  const h=ray.intersectObjects(hitList(),false)[0];
  if(h&&h.object.userData.act&&h.object.userData.act.pos)best=h.object.userData.act;
  if(!best){let bd=1e9;const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw);
    for(const a of F.acts.concat(globalActs)){const dx=a.pos.x-P.x,dz=a.pos.z-P.z,d=Math.hypot(dx,dz);if(d>a.reach+.4)continue;if((dx*fx+dz*fz)/(d||1)<.25)continue;if(d<bd){bd=d;best=a;}}}
  if(best!==curAct){curAct=best;if(best){promptEl.innerHTML='';promptEl.append(document.createTextNode('▶ '+best.label));const s=document.createElement('small');s.textContent=best.sub;promptEl.append(s);promptEl.hidden=false;}else promptEl.hidden=true;}
}
function interact(act){
  walk=null;marker.visible=false;
  switch(act.type){
    case 'roulette':openRoulette(act);break;
    case 'machine':if(act.m.remote){toast(act.m.remote.name+' spielt hier gerade.');SFX.click();}
      else if(machineHeld(act.m)){toast(machineHeld(act.m)+' hat hier eine Karte stecken.');SFX.click();}else if(act.m.npc){say(act.m.npc,LINES.busy[Math.random()*LINES.busy.length|0],2.5);SFX.click();}else enterFocus('slot',act.m);break;
    case 'poker':enterFocus('poker');break;
    case 'hilo':enterFocus('hilo');break;
    case 'mtable':enterFocus('mtable',act.T);break;
    case 'ecall':elevCall();break;
    case 'ebtn':elevGo(act.dest,act);break;
    case 'npc':talk(act.npc);break;
    case 'atm':atmOpen();break;
  }
}
function talk(n){
  SFX.click();
  if(n.special==='bartender'&&chips<BAR_MIN&&BANK.bal>=BAR_MIN){say(n,'Du hast doch noch '+fmt(BANK.bal)+' auf der Bank. Geh zum Geldautomaten.',4);return;}
  if(n.special==='bartender'&&chips<BAR_MIN){setChips(chips+20000,true);say(n,'Knapp bei Kasse? Hier, 20.000 € aufs Haus. Sag\'s keinem.',4);SFX.big();mpWin('holt sich 20.000 € beim Barkeeper.');return;}
  say(n,n.lines[Math.random()*n.lines.length|0]);
}
let toastT=null;
function toast(t){const e=$('#toast');e.textContent=t;e.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>e.hidden=true,2600);}

/* =========================================================
   PANELS (Roulette, Hilfe)
   ========================================================= */
let openId=null,busy=false;
function openPanel(id){freeMouse();if(openId)closePanel();openId=id;$('#'+id).hidden=false;$('#veil').hidden=false;locked=true;joy.active=false;joy.vx=joy.vy=0;joyRest();pointers.clear();promptEl.hidden=true;SFX.click();}
function closePanel(){if(!openId)return;
  if(openId==='pAtm')atmClosed();
  if(openId==='pMulti'&&typeof lobbyClose==='function')lobbyClose();
  if(openId==='pRoulette'&&!R.spinning){let s=0;for(const k in R.bets)s+=R.bets[k];if(s>0){setChips(chips+s);toast(fmt(s)+' Einsatz zurück.');}R.bets={};}$('#'+openId).hidden=true;$('#veil').hidden=true;openId=null;locked=false;curAct=null;}
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>{if(!b.disabled)closePanel();}));
$('#veil').addEventListener('click',()=>{if(!busy)closePanel();});
function setBusy(v){busy=v;document.querySelectorAll('[data-close]').forEach(b=>b.disabled=v);}
function chipSel(el,vals,init,onPick){
  let cur=init;el.innerHTML='';
  vals.forEach(v=>{const b=document.createElement('button');b.className='chip c'+v;b.textContent=v;b.setAttribute('aria-pressed',String(v===cur));
    b.addEventListener('click',()=>{cur=v;el.querySelectorAll('.chip').forEach(c=>c.setAttribute('aria-pressed',String(+c.textContent===cur)));SFX.chip();onPick&&onPick(v);});el.appendChild(b);});
  return ()=>cur;
}
const R={bets:{},last:{},spinning:false,W:newWheel(),act:null,rid:0,ridx:0};
const rChip=chipSel($('#rChips'),[10,50,100,500],10);
const rCan=$('#rCan'),rCtx=rCan.getContext('2d');
const OUTS=[['red','ROT','r'],['black','SCHWARZ','b'],['even','GERADE',''],['odd','UNGERADE',''],['low','1–18',''],['high','19–36',''],['d1','1–12',''],['d2','13–24',''],['d3','25–36','']];
const betBtns={};
function mkBet(parent,key,label,cls){const b=document.createElement('button');b.className='bet '+cls;b.textContent=label;const a=document.createElement('span');a.className='amt';a.hidden=true;b.appendChild(a);
  b.addEventListener('click',()=>placeBet(key));parent.appendChild(b);betBtns[key]={b,a};return b;}
OUTS.forEach(([k,l,c])=>mkBet($('#rOuts'),k,l,c));
(function(){const g=$('#rNums');mkBet(g,'n0','0','z');
  for(let r=0;r<3;r++)for(let c=0;c<12;c++){const n=c*3+(3-r);const b=mkBet(g,'n'+n,String(n),REDS.has(n)?'r':'b');b.style.gridRow=String(r+1);b.style.gridColumn=String(c+2);}})();
function renderBets(){let sum=0;for(const k in betBtns){const v=R.bets[k]||0;sum+=v;const a=betBtns[k].a;a.hidden=!v;a.textContent=v>=1000?(v/1000).toFixed(1).replace('.0','')+'k':v;}
  $('#rSum').textContent=fmt(sum);$('#rAgain').disabled=R.spinning||!Object.keys(R.last).length;$('#rSpin').disabled=R.spinning;$('#rClear').disabled=R.spinning||!sum;}
function rMsg(t,cls){const e=$('#rRes');e.textContent=t;e.className='res'+(cls?' '+cls:'');}
function placeBet(k){if(R.spinning)return;const v=rChip();if(chips<v){rMsg('NICHT GENUG GELD','lose');SFX.lose();return;}
  setChips(chips-v);R.bets[k]=(R.bets[k]||0)+v;SFX.chip();renderBets();
  const bb=betBtns[k];if(bb){const [x,y]=UFX.elXY(bb.b);UFX.burst(x,y,7,{spd:150,up:60,life:.5,sz:4});bb.a.classList.remove('pop');void bb.a.offsetWidth;bb.a.classList.add('pop');}}
$('#rClear').addEventListener('click',()=>{let s=0;for(const k in R.bets)s+=R.bets[k];setChips(chips+s);R.bets={};renderBets();rMsg('SETZ DEINE CHIPS');SFX.click();});
$('#rAgain').addEventListener('click',()=>{let need=0;for(const k in R.last)need+=R.last[k];if(chips<need){rMsg('NICHT GENUG GELD','lose');return;}
  setChips(chips-need);for(const k in R.last)R.bets[k]=(R.bets[k]||0)+R.last[k];renderBets();SFX.chip();});
$('#rSpin').addEventListener('click',()=>{
  let sum=0;for(const k in R.bets)sum+=R.bets[k];if(!sum){rMsg('ERST CHIPS SETZEN','lose');return;}
  R.spinning=true;setBusy(true);renderBets();rMsg('RIEN NE VA PLUS');
  const idx=Math.random()*37|0;R.rid=Date.now()%1e9;R.ridx=idx;
  wheelStart(R.W,idx);$('.rwrap').classList.add('big');$('#pRoulette').scrollTop=0;
  if(R.act)F.roulettes[R.act.id].spin=true;SFX.reelStart();SFX.whoosh();
});
function payMult(k,n){const red=REDS.has(n);switch(k){case'red':return n&&red?2:0;case'black':return n&&!red?2:0;case'even':return n&&n%2===0?2:0;case'odd':return n%2===1?2:0;
  case'low':return n>=1&&n<=18?2:0;case'high':return n>=19?2:0;case'd1':return n>=1&&n<=12?3:0;case'd2':return n>=13&&n<=24?3:0;case'd3':return n>=25?3:0;default:return +k.slice(1)===n?36:0;}}
function finishSpin(n){
  let win=0,stake=0;for(const k in R.bets){stake+=R.bets[k];win+=R.bets[k]*payMult(k,n);}
  R.last=Object.assign({},R.bets);R.bets={};
  const cname=n===0?'GRÜN':REDS.has(n)?'ROT':'SCHWARZ';
  if(win>0){if(win>=500)mpWin('gewinnt '+fmt(win)+' beim Roulette!');setChips(chips+win,true);rMsg(n+' '+cname+' · GEWINN +'+fmt(win),'win');win>=stake*5?SFX.big():SFX.win();
    const x=win/stake,[wx,wy]=UFX.elXY(rCan);
    if(x>=3){UFX.banner(x>=10?'MEGA GEWINN':'GROSSER GEWINN',win,x>=10?2:1,n+' '+cname);UFX.flyChips(LW()/2,LH()*.55,win,x>=10?2.6:2);}
    else{UFX.flash(.35,'255,230,140');UFX.burst(wx,wy,30,{coin:true,sz:8,spd:300,up:200,life:1.2});UFX.flyChips(wx,wy,win);}}
  else{rMsg(n+' '+cname+' · VERLOREN','lose');SFX.lose();UFX.flash(.35,'255,40,40');UFX.shake(.25);}
  R.spinning=false;setBusy(false);renderBets();
  if(R.act)F.roulettes[R.act.id].spin=false;
  const fans=F.rouletteFans||[];const f=fans[Math.random()*fans.length|0];
  if(f)say(f,win>0?['Glückspilz.','Na sieh mal an!','Das war MEINE Zahl!'][Math.random()*3|0]:['Pech, Kumpel.','Die Bank gewinnt immer.','Haha. Nochmal?'][Math.random()*3|0],3);
}
function updRoulette(dt){
  const W=R.W,done=wheelStep(W,dt,true);
  UFX.tension('roulette',!!(W.anim&&openId==='pRoulette'&&W.anim.t/W.anim.dur>.6));
  if(done!==null){finishSpin(done);setTimeout(()=>{if(!R.spinning)$('.rwrap').classList.remove('big');},2600);}
  if(openId==='pRoulette')drawWheelCanvas(rCtx,rCan.width,W);
}
function openRoulette(act){R.act=act;$('#rTitle').textContent=act.title||'ROULETTE';$('#pRoulette').classList.toggle('vip',floorIdx===1);renderBets();rMsg('SETZ DEINE CHIPS');$('.rwrap').classList.remove('big');openPanel('pRoulette');}

/* =========================================================
   FLOORS, RESIZE, LOOP
   ========================================================= */
function setFloor(i){
  floorIdx=i;floors.forEach((f,k)=>f.group.visible=k===i);F=floors[i];
  ambient.color.setHex(F.ambient);$('#floorTag').textContent=F.name;
  setBeat(i===1);curAct=null;
  floors.forEach(f=>f.npcs.forEach(n=>{if(n.bubbleEl)n.bubbleEl.hidden=true;n.bubbleUntil=0;}));
  EL.lastDisp='';
}
const BAR_MIN=2000; // darunter gibt der Barkeeper 20.000
let SENS=1;try{SENS=clamp(+(localStorage.getItem('nk_sens')||1)||1,.2,3);}catch(e){}
let GFX='sharp';try{GFX=localStorage.getItem('nk_gfx')||'sharp';}catch(e){}
function resize(){
  const w=LW(),h=LH();let iw,ih;
  if(GFX==='sharp'){
    // scharf: volle Auflösung (bis 2x auf Retina), bei sehr großen Bildschirmen etwas begrenzt
    let pr=Math.min(window.devicePixelRatio||1,2);while(pr>1&&w*h*pr*pr>3.2e6)pr-=.25;
    iw=Math.round(w*pr);ih=Math.round(h*pr);
  } else {
    let s=clamp(Math.round(Math.min(w,h)/190),2,4);if(focus)s=(focus.type==='poker'||focus.type==='hilo'||focus.type==='mtable')?1:Math.max(1,s-1);
    iw=Math.ceil(w/s);ih=Math.ceil(h/s);
  }
  renderer.setSize(iw,ih,false);document.body.classList.toggle('gfx-sharp',GFX==='sharp');
  camera.aspect=w/h;if(!focus)camera.fov=w<h?82:64;camera.updateProjectionMatrix();if(GFX==='sharp')snapRes.value.set(Math.max(320,iw/2),Math.max(240,ih/2));else snapRes.value.set(iw/(focus?1:2),ih/(focus?1:2));
  if(typeof svLayout==='function')svLayout();
}
addEventListener('resize',()=>{if(rot)applyRot();else resize();});
$('#sndBtn').addEventListener('click',()=>{muted=!muted;if(master)master.gain.value=muted?0:.5;$('#sndBtn').style.opacity=muted?.4:1;});
$('#helpBtn').addEventListener('click',()=>openPanel('pHelp'));
function gfxLabel(){$('#gfxBtn').textContent='GRAFIK: '+(GFX==='sharp'?'SCHARF':'RETRO (PS1)');}
const sensIn=$('#sensIn');sensIn.value=String(SENS);$('#sensVal').textContent=SENS.toFixed(1)+'×';
sensIn.addEventListener('input',()=>{SENS=clamp(+sensIn.value||1,.2,3);$('#sensVal').textContent=SENS.toFixed(1)+'×';store('nk_sens',SENS);});
$('#gfxBtn').addEventListener('click',()=>{GFX=GFX==='sharp'?'retro':'sharp';store('nk_gfx',GFX);gfxLabel();resize();});gfxLabel();
$('#chatBtn').addEventListener('click',()=>{openPanel('pChat');});
$('#onlineTag').addEventListener('click',()=>{if(window.NK_STANDALONE){openPanel('pMulti');lobbyOpen();return;}if(!MP.room)toast('Nicht verbunden. Der Link allein reicht nicht: Du musst über TEILEN mit deiner E-Mail eingeladen sein und eingeloggt mit genau dieser E-Mail öffnen.');else if(!MP.online)toast('Verbunden. Warte auf deinen Kollegen…');else toast((MP.online+1)+' Spieler im Keller.');});
document.querySelectorAll('#pChat [data-say]').forEach(b=>b.addEventListener('click',()=>{mpSay(b.dataset.say);closePanel();}));
$('#chatForm').addEventListener('submit',e=>{e.preventDefault();const i=$('#chatIn');mpSay(i.value);i.value='';closePanel();});
$('#chatIn').addEventListener('keydown',e=>e.stopPropagation());
$('#rotBtn').addEventListener('click',()=>{rot=rot===0?90:rot===90?-90:0;store('nk_rot',rot||null);applyRot();toast(rot?'Querformat: Handy drehen. Nochmal tippen = andere Richtung.':'Hochformat');});

const clock=new THREE.Clock(),tmpV=new THREE.Vector3();
let chatterT=4,flickT=0;
function frame(){
  requestAnimationFrame(frame);
  const dt=Math.min(.05,clock.getDelta());now+=dt;pcUi();
  if(F){
    updTweens(dt);elevStep(dt);
    let mx=0,mz=0;
    const canMove=!locked&&!focus&&EL.phase!=='moving';
    if(canMove){
      let ix=joy.vx,iy=joy.vy;
      if(keys.KeyW||keys.ArrowUp)iy-=1;if(keys.KeyS||keys.ArrowDown)iy+=1;if(keys.KeyA||keys.ArrowLeft)ix-=1;if(keys.KeyD||keys.ArrowRight)ix+=1;
      const m=Math.hypot(ix,iy);if(m>1){ix/=m;iy/=m;}
      if(m>.08){walk=null;marker.visible=false;}
      const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw),rx=Math.cos(P.yaw),rz=-Math.sin(P.yaw);
      mx=(fx*-iy+rx*ix);mz=(fz*-iy+rz*ix);
      if(walk){const dx=walk.x-P.x,dz=walk.z-P.z,d=Math.hypot(dx,dz);
        if(walk.act&&d<walk.act.reach){const a=walk.act;walk=null;interact(a);}
        else if(!walk.act&&d<.25){walk=null;marker.visible=false;}
        else{mx=dx/d;mz=dz/d;P.yaw=angLerp(P.yaw,Math.atan2(-dx,-dz),dt*5);
          walk.t+=dt;if(walk.t>.6){const mv=Math.hypot(P.x-walk.lx,P.z-walk.lz);walk.lx=P.x;walk.lz=P.z;walk.t=0;
            if(mv<.15){if(walk.act&&d<walk.act.reach+2.2){const a=walk.act;walk=null;interact(a);}else{walk=null;marker.visible=false;}}}}}
    }
    const mm=Math.hypot(mx,mz);
    const spr=(keys.ShiftLeft||keys.ShiftRight)&&mm>.01&&canMove;P.spr=(P.spr||0)+((spr?1:0)-(P.spr||0))*Math.min(1,dt*8);const spd=3.3*(1+P.spr*.75);
    if(mm>.01&&canMove){const [nx,nz]=collide(P.x+mx*spd*dt,P.z+mz*spd*dt);const real=Math.hypot(nx-P.x,nz-P.z);P.x=nx;P.z=nz;
      P.bob+=real*3.1*(1-(P.spr||0)*.3);P.stepAcc+=real;if(P.stepAcc>.85*(1+(P.spr||0)*.8)&&now-(P.stepT||0)>.3){P.stepAcc=0;P.stepT=now;SFX.step();}}
    // camera
    let tp,ty,tpi,tf;
    if(focus){const fp=focusPose();tp=fp.pos;ty=fp.yaw;tpi=fp.pitch;tf=fp.fov;}
    else{tp=tmpV.set(P.x,1.6+Math.sin(P.bob)*.035,P.z);ty=P.yaw;tpi=P.pitch;tf=(LW()<LH()?82:64)+(P.spr||0)*7;}
    if(camAnim){camAnim.t+=dt;const k=ease(Math.min(1,camAnim.t/camAnim.dur));
      camera.position.lerpVectors(camAnim.fromPos,tp,k);camera.rotation.set(camAnim.fromPitch+(tpi-camAnim.fromPitch)*k,angLerp(camAnim.fromYaw,ty,k),0);camera.fov=camAnim.fromFov+(tf-camAnim.fromFov)*k;
      if(camAnim.t>=camAnim.dur)camAnim=null;}
    else{camera.position.copy(tp);camera.rotation.set(tpi,ty,0);camera.fov=tf;}
    if(EL.phase==='moving'){camera.position.y+=Math.sin(now*37)*.006+(Math.random()-.5)*.006;camera.rotation.z=Math.sin(now*23)*.004;}
    if(camShake>0){const k=camShake*camShake;camera.position.x+=(Math.random()-.5)*.045*k;camera.position.y+=(Math.random()-.5)*.045*k;camera.rotation.z+=(Math.random()-.5)*.03*k;camShake=Math.max(0,camShake-dt*2.2);}
    camera.updateProjectionMatrix();
    if(marker.visible)marker.rotation.z+=dt*2;
    F.roulettes.forEach(r=>r.wheel.rotation.y+=dt*(r.spin?7:.6));
    F.npcs.forEach(n=>animNPC(n,dt));worldFxStep(F,dt);
    flickT-=dt;F.lights.forEach(L=>{if(L.flicker&&flickT<=0)L.l.intensity=Math.random()<.18?L.base*.15:L.base;});if(flickT<=0)flickT=.08+Math.random()*.25;
    const beat=floorIdx===1?Math.max(0,1-((now%.5)/.5)*4):0;F.speakers.forEach(s=>s.scale.set(1+beat*.25,1,1+beat*.25));
    updMachines(dt,F,focus&&focus.type==='slot'?focus.m:null);
    pokerStep(dt);hilloStep(dt);mpStep(dt);
    if(!locked&&!focus){chatterT-=dt;if(chatterT<=0){chatterT=6+Math.random()*6;const near=F.npcs.filter(n=>Math.hypot(n.root.position.x-P.x,n.root.position.z-P.z)<9&&n.bubbleUntil<now);
      if(near.length){const n=near[Math.random()*near.length|0];say(n,n.lines[Math.random()*n.lines.length|0]);}}}
    const lw=LW(),lh=LH();
    for(const n of F.npcs.concat(mpVisibleAvatars())){if(!n.bubbleEl)continue;if(n.bubbleUntil<now||openId){n.bubbleEl.hidden=true;continue;}
      n.head.getWorldPosition(tmpV);tmpV.y+=.42;const dist=tmpV.distanceTo(camera.position);tmpV.project(camera);
      if(tmpV.z>1||dist>13||Math.abs(tmpV.x)>1.1||Math.abs(tmpV.y)>1.1){n.bubbleEl.hidden=true;continue;}
      n.bubbleEl.hidden=false;const bw=n.bubbleEl.offsetWidth||120,bh=n.bubbleEl.offsetHeight||30;const bx=clamp((tmpV.x*.5+.5)*lw-bw/2,8,lw-bw-8),by=clamp((-tmpV.y*.5+.5)*lh-bh-8,60,lh-bh-8);n.bubbleEl.style.transform='translate('+(bx|0)+'px,'+(by|0)+'px)';}
    if(!locked&&!focus){promptT-=dt;if(promptT<=0){promptT=.15;updatePrompt();}}else if(!promptEl.hidden)promptEl.hidden=true;
    if(openId==='pRoulette'||R.W.anim)updRoulette(dt);
  }
  renderer.render(scene,camera);
}

/* ---------- boot ---------- */
const fontWait=Promise.race([Promise.all([document.fonts.load('16px "Press Start 2P"'),document.fonts.load('20px VT323')]),new Promise(r=>setTimeout(r,2500))]).catch(()=>{});
fontWait.then(()=>{
  setChips(chips);mtBarInit();
  buildWorld();setFloor(0);P.x=0;P.z=9;P.yaw=0;
  camera.position.set(P.x,1.6,P.z);camera.rotation.set(P.pitch,P.yaw,0);
  applyRot();
  frame();
  const go=$('#startGo');go.textContent='TIPPEN ZUM STARTEN';go.dataset.loading='false';
  const ni=$('#nameIn');ni.value=MP.name;
  ni.addEventListener('click',e=>e.stopPropagation());ni.addEventListener('pointerdown',e=>e.stopPropagation());
  ni.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')$('#start').click();});
  mpInit();cloudSaveInit();
  $('#start').addEventListener('click',()=>{
    MP.name=cleanText(ni.value,14).trim().toUpperCase()||'GAST';store('nk_name',MP.name);MP.started=true;MP.dirty=true;mpTag();
    initAudio();$('#start').hidden=true;$('#hudTop').hidden=false;joyBase.hidden=PC;joyHint.hidden=PC;locked=false;started=true;
    let seen=false;try{seen=localStorage.getItem('nk_help2')==='1';localStorage.setItem('nk_help2','1');}catch(e){}
    if(!seen)openPanel('pHelp');
    try{navigator.wakeLock&&navigator.wakeLock.request('screen').catch(()=>{});}catch(e){}
  });
});
