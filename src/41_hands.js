/* =========================================================
   HÄNDE, INVENTAR, RAUCHEN & TRINKEN  (Ich-Perspektive)
   Eigene kleine Szene, die nach der Welt über alles gezeichnet wird (Tiefe wird vorher gelöscht):
   Schachtel mit Klappdeckel und 20 einzelnen Zigaretten, Zigarette im Mund oder in der Hand,
   Feuerzeug, Glut, Asche, Rauch (in der Welt), Glas mit Füllstand. Mitspieler sehen Kippe und Glas.
   Tasten (PC): R Schachtel raus/weg · Maus auf Schachtel = Deckel auf · Maus auf Kippe = kommt hoch · Klick = in den Mund
   F Feuerzeug · Q Ziehen · H Hand/Mund · X Abaschen · V Wegwerfen · T Trinken.  Handy: Tastenleiste unten (#itBar).
   Inventar (nk_inv): Zigaretten (Start 20), Nachschub und Getränke beim Barkeeper (barMenu).
   ========================================================= */
const INV={cigs:20};
try{const d=JSON.parse(localStorage.getItem('nk_inv')||'null');if(d&&typeof d==='object'&&Number.isFinite(+d.cigs))INV.cigs=clamp(Math.round(+d.cigs),0,400);}catch(e){}
function invSave(){store('nk_inv',JSON.stringify(INV));}
const HD={scene:new THREE.Scene(),rig:new THREE.Group(),cx:0,cy:0,cur:false,pack:null,lid:null,cigs:[],packSt:'off',packT:0,hover:-1,lidOpen:0,
  cig:null,mc:null,handR:null,handL:null,lighter:null,flame:null,drink:null,glass:null,buzz:0,barN:null,smokeT:0,seq:[],pose:{p:new THREE.Vector3(),r:new THREE.Euler()},hint:'',last:{}};
HD.scene.add(HD.rig);HD.scene.add(new THREE.AmbientLight(0xffffff,.8));{const l=new THREE.DirectionalLight(0xfff0d8,.9);l.position.set(.6,1,.8);HD.scene.add(l);}
renderer.autoClear=false; // 90_main löscht selbst vor der Welt (renderer.clear) und zeichnet danach die Hände
const hdRay=new THREE.Raycaster(),hdV=new THREE.Vector2(),hdTmp=new THREE.Vector3(),hdTmp2=new THREE.Vector3();
HD.ax=1;function PX(p){return [p[0]*HD.ax,p[1],p[2]];} // Hochformat (Handy): seitliche Posen näher zur Mitte
function atSlot(){return !!focus&&focus.type==='slot';} // am Automaten: Kippe bleibt im Mund und ist rauchbar
function mouthP(){return atSlot()?'mouthSlot':'mouth';}
// Posen im Kamera-Raum (x rechts, y hoch, z nach hinten; vorn ist -z)
const POSE={
  packOut:{p:[0,-.44,-.27],r:[-.5,0,0]},packIn:{p:[0,-.105,-.27],r:[-.5,0,0]},
  mouth:{p:[.012,-.074,-.072],r:[-1.3,.1,0]},mouthSlot:{p:[.02,-.095,-.14],r:[-1.35,.1,0]},mouthAsh:{p:[.02,-.115,-.13],r:[-1.1,.1,.3]}, // am Automaten (enger Blickwinkel): weiter weg und tiefer, nur die Spitze ragt über die Tastenleiste // Filter unten am Bildrand (Mund), Spitze nach vorn-oben, stark verkürzt wie echt
  hand:{p:[.21,-.22,-.40],r:[-.75,-.35,.45]},handMouth:{p:[.045,-.15,-.15],r:[-.95,.05,.3]},handAsh:{p:[.24,-.27,-.40],r:[-.55,-.35,.75]},
  lightOut:{p:[.26,-.44,-.30],r:[0,-.4,0]},lightIn:{p:[.03,-.112,-.145],r:[-.1,-.3,.08]},lightInSlot:{p:[.03,-.135,-.22],r:[-.1,-.3,.08]},
  glass:{p:[-.19,-.23,-.40],r:[.15,.3,-.1]},glassSip:{p:[-.02,-.095,-.19],r:[-.9,.1,-.15]},glassOut:{p:[-.2,-.5,-.4],r:[.15,.3,-.1]}};
const SM_MAT={white:lam({color:0xf4f0e8}),filter:lam({color:0xd89a4a}),ash:lam({color:0x9a9a9a}),skin:lam({color:0xe8b890}),nail:lam({color:0xf0d0c0}),
  red:lam({color:0xc81e1e}),gold:bas({color:0xd6a02a}),foil:lam({color:0xd0c8b8}),plastic:lam({color:0x1a3a9a}),metal:lam({color:0xb0b0b8}),
  ember:bas({color:0xff6a10}),emberHot:bas({color:0xffd080})};
// ---- Zigarette (Achse +y: 0 = Filterende/Mund, L = Spitze) ----
function cigMesh(L){
  const g=new THREE.Group();const r=.0039,fl=L*.28;
  const f=mesh(new THREE.CylinderGeometry(r,r,fl,10),SM_MAT.filter,0,fl/2,0,g);
  const b=mesh(new THREE.CylinderGeometry(r,r,L-fl,10),SM_MAT.white,0,fl+(L-fl)/2,0,g);
  const a=mesh(new THREE.CylinderGeometry(r*.96,r*.9,.012,10),SM_MAT.ash,0,L,0,g);a.visible=false;
  const e=mesh(new THREE.SphereGeometry(r*1.05,8,6),SM_MAT.ember,0,L,0,g);e.visible=false;
  const ring=mesh(new THREE.CylinderGeometry(r*1.01,r*1.01,.0015,10),SM_MAT.gold,0,fl,0,g);
  g.userData.parts={f,b,a,e,ring,L,fl};return g;
}
// Zustand (Brand 0..1, Asche 0..1, Glut) auf ein Zigaretten-Modell anwenden
function cigApply(g,burn,ash,ember,lit){
  const P=g.userData.parts,L=P.L,fl=P.fl;const len=Math.max(.004,(L-fl)*(1-burn));
  P.b.scale.y=len/(L-fl);P.b.position.y=fl+len/2;const tip=fl+len;
  P.a.visible=lit&&ash>0.04;P.a.scale.y=Math.max(.05,ash);P.a.position.y=tip+.006*ash;
  P.e.visible=lit;P.e.position.y=tip+(P.a.visible?.012*ash:0);P.e.material=ember>.5?SM_MAT.emberHot:SM_MAT.ember;const s=lit?(.9+ember*.6+Math.random()*.15):0;P.e.scale.set(s,s,s);
  return tip;
}
// ---- Hand (einfach, PS2-Stil): Handfläche + Daumen + 4 Finger ----
function handMesh(side){
  const g=new THREE.Group();const s=side||1;
  const palm=mesh(new THREE.SphereGeometry(.036,12,10),SM_MAT.skin,0,0,0,g);palm.scale.set(1.15,1.35,.55);
  for(let i=0;i<4;i++){const fg=new THREE.Group();fg.position.set((-.021+i*.014)*s,.042,0);fg.rotation.x=-.35-i*.05;g.add(fg);
    mesh(new THREE.CylinderGeometry(.0062,.0068,.034,8),SM_MAT.skin,0,.016,0,fg);
    mesh(new THREE.SphereGeometry(.0065,8,6),SM_MAT.nail,0,.034,.003,fg);}
  const th=new THREE.Group();th.position.set(.036*s,-.004,.01);th.rotation.z=-.9*s;th.rotation.x=-.3;g.add(th);
  mesh(new THREE.CylinderGeometry(.007,.0078,.03,8),SM_MAT.skin,0,.014,0,th);mesh(new THREE.SphereGeometry(.007,8,6),SM_MAT.nail,0,.03,.002,th);
  mesh(new THREE.CylinderGeometry(.03,.034,.06,10),SM_MAT.skin,0,-.058,0,g); // Handgelenk
  return g;
}
// ---- Aufbau: Schachtel, Zigarette, Hände, Feuerzeug, Glas ----
function hdBuild(){
  const R=HD.rig;
  // Schachtel mit Klappdeckel; 20 Zigaretten stehen drin (3 Reihen: 7-6-7), Filter oben
  const Pk=new THREE.Group();HD.pack=Pk;Pk.visible=false;R.add(Pk);
  const W=.056,H=.088,D=.022;
  const body=box(W,H*.72,D,SM_MAT.white,0,-H*.14,0,Pk);body.userData.part='pack';
  const band=box(W+.001,H*.22,D+.001,SM_MAT.red,0,-H*.39,0,Pk);band.userData.part='pack';
  const lt=labelTex(64,96,c=>{c.fillStyle='#f4f0e8';c.fillRect(0,0,64,96);c.fillStyle='#c81e1e';c.fillRect(0,62,64,34);c.fillStyle='#d6a02a';c.fillRect(0,59,64,3);
    px(c,10);c.textAlign='center';c.textBaseline='middle';c.fillStyle='#8a1010';c.fillText('SJ',32,18);px(c,5);c.fillStyle='#3a0a0a';c.fillText('ROYAL',32,34);c.fillText('FILTER',32,46);c.fillStyle='#fff';px(c,5);c.fillText('20 STÜCK',32,79);});
  const lab=mesh(new THREE.PlaneGeometry(W-.003,H*.72-.003),bas({map:lt}),0,-H*.14,D/2+.0007,Pk);lab.userData.part='pack';
  box(W-.006,.003,D-.006,SM_MAT.foil,0,H*.22-.001,0,Pk).userData.part='pack'; // Folienrand
  const lid=new THREE.Group();lid.position.set(0,H*.22,-D/2);Pk.add(lid);HD.lid=lid;
  box(W+.002,H*.28,D+.002,SM_MAT.white,0,H*.14,D/2,lid).userData.part='pack';
  box(W+.003,.0035,D+.003,SM_MAT.gold,0,.0017,D/2,lid).userData.part='pack';
  box(W-.002,H*.24,.003,SM_MAT.white,0,H*.12,.0015,lid).userData.part='pack'; // Deckelrückwand
  HD.cigs=[];let k=0;const hitM=new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false});
  [[7,-D*.3],[6,0],[7,D*.3]].forEach(([n,z])=>{for(let i=0;i<n;i++){const x=(i-(n-1)/2)*.0068;const c=cigMesh(.075);c.rotation.x=Math.PI;
    const base=-.044+.075+.009;c.position.set(x,base,z);c.userData={part:'cig',idx:k,base,rise:0};Pk.add(c);HD.cigs.push(c);
    const hit=mesh(new THREE.CylinderGeometry(.0055,.0055,.034,6),hitM,0,-.012,0,c);hit.userData={part:'cig',idx:k};k++;}}); // unsichtbarer, etwas dickerer Treffer-Zylinder am oberen Ende
  HD.handL=handMesh(1);HD.handL.position.set(0,-.08,-.004);HD.handL.rotation.set(.12,0,0);Pk.add(HD.handL); // Hand hält die Schachtel von unten, Finger hinten, Daumen rechts
  // Zigarette (im Mund / in der Hand)
  HD.mc=cigMesh(.084);HD.mc.visible=false;R.add(HD.mc);
  HD.handR=handMesh(1);HD.handR.visible=false;R.add(HD.handR);
  // Feuerzeug mit Flamme
  const Lg=new THREE.Group();HD.lighter=Lg;Lg.visible=false;R.add(Lg);
  box(.024,.058,.011,SM_MAT.plastic,0,0,0,Lg);box(.024,.012,.011,SM_MAT.metal,0,.035,0,Lg);
  mesh(new THREE.CylinderGeometry(.006,.006,.008,10),SM_MAT.metal,0,.042,-.002,Lg).rotation.z=Math.PI/2;
  const ft=canvasTex(32,64,g=>{const gr=g.createRadialGradient(16,44,2,16,30,30);gr.addColorStop(0,'rgba(255,255,220,1)');gr.addColorStop(.3,'rgba(255,200,60,.9)');gr.addColorStop(.6,'rgba(255,90,10,.5)');gr.addColorStop(1,'rgba(255,60,0,0)');g.fillStyle=gr;g.fillRect(0,0,32,64);},0,0,true);
  HD.flame=new THREE.Sprite(new THREE.SpriteMaterial({map:ft,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));HD.flame.position.set(0,.052,0);HD.flame.scale.set(.015,.03,1);HD.flame.visible=false;Lg.add(HD.flame);
  const hl=handMesh(1);hl.position.set(.002,-.066,-.012);hl.rotation.set(.1,0,0);Lg.add(hl); // Hand hinter/unter dem Feuerzeug, Daumen am Rädchen
  // Glas
  const Gl=new THREE.Group();HD.glass=Gl;Gl.visible=false;R.add(Gl);
  const gm=new THREE.MeshPhongMaterial({color:0xe8f4ff,transparent:true,opacity:.28,shininess:120,specular:0xffffff,side:THREE.DoubleSide});
  mesh(new THREE.CylinderGeometry(.03,.025,.085,16,1,true),gm,0,.0425,0,Gl);mesh(new THREE.CylinderGeometry(.025,.025,.004,16),gm,0,.002,0,Gl);
  HD.liquid=mesh(new THREE.CylinderGeometry(.027,.023,.07,16),lam({color:0xf0b020,transparent:true,opacity:.9}),0,.04,0,Gl);
  const hg=handMesh(-1);hg.position.set(-.012,-.03,.028);hg.rotation.set(.5,0,.2);Gl.add(hg);
  // Rauch in der Welt (Pool)
  const st=canvasTex(64,64,g=>{const gr=g.createRadialGradient(32,32,2,32,32,32);gr.addColorStop(0,'rgba(220,220,230,.55)');gr.addColorStop(.5,'rgba(200,200,210,.22)');gr.addColorStop(1,'rgba(200,200,210,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);},0,0,true);
  HD.smoke=[];for(let i=0;i<90;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:st,transparent:true,depthWrite:false,opacity:0}));s.visible=false;scene.add(s);HD.smoke.push({s,life:0,dur:1,v:new THREE.Vector3(),s0:.1,s1:.3,a:.5});}
}
hdBuild();
function smokePuff(pos,dir,n,s0,s1,dur,spread,alpha){
  for(let i=0;i<n;i++){const q=HD.smoke.find(x=>x.life<=0);if(!q)return;q.life=dur;q.dur=dur;q.s0=s0*(.8+Math.random()*.4);q.s1=s1*(.8+Math.random()*.5);q.a=alpha||.5;
    q.v.set(dir.x+(Math.random()-.5)*spread,dir.y+(Math.random()-.5)*spread*.6+.05,dir.z+(Math.random()-.5)*spread);
    q.s.position.set(pos.x+(Math.random()-.5)*.02,pos.y+(Math.random()-.5)*.02,pos.z+(Math.random()-.5)*.02);q.s.visible=true;q.s.material.opacity=q.a;q.s.scale.set(q.s0,q.s0,1);}
}
function smokeStep(dt){for(const q of HD.smoke){if(q.life<=0)continue;q.life-=dt;if(q.life<=0){q.s.visible=false;continue;}const t=1-q.life/q.dur;q.s.position.addScaledVector(q.v,dt);q.v.multiplyScalar(1-dt*.9);q.v.y+=dt*.06;
  const sz=q.s0+(q.s1-q.s0)*t;q.s.scale.set(sz,sz,1);q.s.material.opacity=q.a*(1-t)*(t<.1?t/.1:1);}}
// ---- Sounds (selbst erzeugt) ----
const HSFX={
  packOpen(){noise(.05,.08,1800);noise(.08,.05,900,.04);},packClose(){noise(.04,.07,1200);},
  take(){noise(.06,.05,2400);},lighterClick(){noise(.02,.14,5000);tone(2600,.02,'square',.04);noise(.04,.1,3600,.03);},lighterHiss(d){noise(d,.045,2200,.05);},
  drag(){noise(1.1,.035,900,0);noise(.9,.02,500,.1);},exhale(){noise(1.4,.03,1400,.1);},ash(){noise(.03,.05,2000);},
  throw(){noise(.1,.05,1200);},sip(){tone(180,.12,'sine',.06,0,120);noise(.25,.04,700,.08);tone(140,.1,'sine',.05,.3,90);},empty(){tone(900,.06,'square',.03);}
};
// ---- Zeiger: im normalen PC-Modus (Maus gefangen) wandert bei offener Schachtel ein Cursor statt der Kamera ----
function handsCursorActive(){return HD.packSt!=='off'&&PC&&mouseLocked()&&!aimActive();}
function handsMouse(mx,my){HD.cx=clamp(HD.cx+mx,0,LW());HD.cy=clamp(HD.cy+my,0,LH());}
function handsPointer(){if(handsCursorActive())return [HD.cx,HD.cy];if(PC&&!mouseLocked())return [CUR.x,CUR.y];return aimPos();}
function hdPick(x,y){if(!HD.pack.visible)return null;hdV.set(x/LW()*2-1,-(y/LH())*2+1);hdRay.setFromCamera(hdV,camera);hdRay.far=2;
  const hits=hdRay.intersectObject(HD.pack,true);for(const h of hits){let o=h.object;while(o&&o!==HD.pack&&!(o.userData&&o.userData.part))o=o.parent;if(o&&o.userData&&o.userData.part)return o.userData;}return null;}
// ---- Schachtel ----
function packShow(){
  if(HD.packSt!=='off')return;if(HD.cig&&HD.cig.where==='hand'){toast('Erst die Kippe in den Mund (H).');return;}
  HD.packSt='in';HD.packT=0;HD.pack.visible=true;HD.pack.position.fromArray(PX(POSE.packOut.p));HD.pack.rotation.fromArray(POSE.packOut.r);HD.lidOpen=0;HD.hover=-1;
  HD.cx=LW()/2;HD.cy=LH()*.62;hdSyncCigs();HSFX.take();hdUi();
}
function packHide(){if(HD.packSt==='off')return;HD.packSt='out';HD.packT=0;HD.hover=-1;if(HD.lidOpen>.5)HSFX.packClose();hdUi();}
function hdSyncCigs(){HD.cigs.forEach((c,i)=>{c.visible=i<INV.cigs;});}
function packStep(dt){
  const Pk=HD.pack;if(HD.packSt==='off')return;
  HD.packT+=dt;const k=Math.min(1,HD.packT/.35),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
  const fr=HD.packSt==='out'?POSE.packIn:POSE.packOut,tt=HD.packSt==='out'?POSE.packOut:POSE.packIn,fp=PX(fr.p),tp=PX(tt.p);
  Pk.position.set(fp[0]+(tp[0]-fp[0])*e,fp[1]+(tp[1]-fp[1])*e,fp[2]+(tp[2]-fp[2])*e);
  if(HD.packSt==='out'&&k>=1){HD.packSt='off';Pk.visible=false;hdUi();return;}
  if(HD.packSt==='in'&&k>=1){HD.packSt='open';if(!PC){HD.lidOpen=.51;HSFX.packOpen();}} // Handy: Deckel geht gleich auf (kein Drüberfahren möglich)
  // Deckel: Maus auf der Schachtel = auf
  let want=HD.lidOpen>.5?1:0,hov=-1;
  if(HD.packSt==='open'&&!HD.fly){const pt=handsPointer();const u=hdPick(pt[0],pt[1]);if(u){if(u.part==='pack')want=1;if(u.part==='cig'&&HD.lidOpen>.9&&u.idx<INV.cigs){hov=u.idx;want=1;}}}
  if(want&&HD.lidOpen<.01)HSFX.packOpen();
  HD.lidOpen+=((want?1:0)-HD.lidOpen)*Math.min(1,dt*9);HD.lid.rotation.x=HD.lidOpen*1.95;
  if(hov!==HD.hover){HD.hover=hov;if(hov>=0)noise(.02,.03,3000);}
  HD.cigs.forEach((c,i)=>{const u=c.userData;u.rise+=((i===hov?1:0)-u.rise)*Math.min(1,dt*12);c.position.y=u.base+u.rise*.02;});
}
// Klick/Tipp auf die Schachtel oder eine Zigarette
function handsTap(x,y){
  if(HD.packSt==='open'&&!HD.fly){const pt=handsCursorActive()?[HD.cx,HD.cy]:(PC&&!mouseLocked()?[CUR.x,CUR.y]:[x,y]);const u=hdPick(pt[0],pt[1]);
    if(u&&HD.lidOpen<.5){HD.lidOpen=.51;HSFX.packOpen();return true;} // erster Tipp auf die Schachtel: Deckel auf
    if(u&&u.part==='cig'&&u.idx<INV.cigs&&HD.lidOpen>.6){cigTake(u.idx);return true;}
    if(u&&u.part==='pack'){HD.lidOpen=.49;return true;}
    return true; // bei offener Schachtel geht kein Klick in die Welt
  }
  return false;
}
// Zigarette aus der Schachtel nehmen: fliegt in den Mund
function cigTake(idx){
  if(HD.cig){toast('Du hast schon eine.');return;}
  INV.cigs=Math.max(0,INV.cigs-1);invSave();const c=HD.cigs[idx];c.visible=false;hdSyncCigs();
  HD.rig.updateMatrixWorld(true);const start=c.getWorldPosition(new THREE.Vector3());HD.rig.worldToLocal(start);if(HD.mc.parent!==HD.rig)HD.rig.add(HD.mc);
  HD.cig={where:'mouth',lit:false,burn:0,ash:0,ember:0,dragT:0,x:0};HD.fly={t:0,from:start.toArray(),dur:.55};
  HD.mc.visible=true;HD.mc.position.copy(start);HD.mc.rotation.set(Math.PI,0,0);HSFX.take();packHide();hdUi();mpItems();
}
// ---- Zigarette: Posen-Ablauf (Warteschlange aus Schritten) ----
function seqStart(steps){HD.seq=steps.slice();HD.seqT=0;HD.seqFrom=null;}
function seqStep(dt,obj){
  if(!HD.seq.length)return false;const s=HD.seq[0];
  if(HD.seqFrom===null){HD.seqFrom={p:obj.position.clone(),r:obj.rotation.clone()};HD.seqT=0;if(s.at)s.at();}
  HD.seqT+=dt;const k=Math.min(1,HD.seqT/(s.dur||.4)),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
  if(s.to){const to=POSE[s.to]||s.to,tp=PX(to.p);obj.position.set(HD.seqFrom.p.x+(tp[0]-HD.seqFrom.p.x)*e,HD.seqFrom.p.y+(tp[1]-HD.seqFrom.p.y)*e,HD.seqFrom.p.z+(tp[2]-HD.seqFrom.p.z)*e);
    obj.rotation.set(HD.seqFrom.r.x+(to.r[0]-HD.seqFrom.r.x)*e,HD.seqFrom.r.y+(to.r[1]-HD.seqFrom.r.y)*e,HD.seqFrom.r.z+(to.r[2]-HD.seqFrom.r.z)*e);}
  if(k>=1){if(s.end)s.end();HD.seq.shift();HD.seqFrom=null;}
  return true;
}
function cigObj(){return HD.cig&&HD.cig.where==='hand'?HD.handR:HD.mc;}
function cigLight(){const C=HD.cig;if(!C||C.lit||HD.seq.length||HD.lighterOn)return;if(C.where!=='mouth'){toast('Zum Anzünden in den Mund (H).');return;}
  HD.lighterOn=true;const Lg=HD.lighter,li=atSlot()?'lightInSlot':'lightIn';Lg.visible=true;Lg.position.fromArray(PX(POSE.lightOut.p));Lg.rotation.fromArray(POSE.lightOut.r);HD.lq=[
    {to:li,dur:.45,at(){}},{to:li,dur:.15,at(){HSFX.lighterClick();HD.flame.visible=true;HSFX.lighterHiss(1.1);}},
    {to:li,dur:.9,end(){C.lit=true;C.ember=1;C.dragT=.6;HSFX.drag();mpItems();}},{to:'lightOut',dur:.45,at(){HD.flame.visible=false;},end(){Lg.visible=false;HD.lighterOn=false;hdUi();}}];
  HD.lqFrom=null;HD.lqT=0;hdUi();}
function lighterStep(dt){
  if(!HD.lighterOn)return;const Lg=HD.lighter;
  if(!HD.lq.length)return;const s=HD.lq[0];
  if(HD.lqFrom===null){HD.lqFrom={p:Lg.position.clone(),r:Lg.rotation.clone()};HD.lqT=0;if(s.at)s.at();}
  HD.lqT+=dt;const k=Math.min(1,HD.lqT/s.dur),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2,to=POSE[s.to],tp=PX(to.p);
  Lg.position.set(HD.lqFrom.p.x+(tp[0]-HD.lqFrom.p.x)*e,HD.lqFrom.p.y+(tp[1]-HD.lqFrom.p.y)*e,HD.lqFrom.p.z+(tp[2]-HD.lqFrom.p.z)*e);
  Lg.rotation.set(HD.lqFrom.r.x+(to.r[0]-HD.lqFrom.r.x)*e,HD.lqFrom.r.y+(to.r[1]-HD.lqFrom.r.y)*e,HD.lqFrom.r.z+(to.r[2]-HD.lqFrom.r.z)*e);
  if(HD.flame.visible){const f=.9+Math.random()*.35;HD.flame.scale.set(.015*f,.03*(1.1-f*.1),1);HD.flame.position.x=(Math.random()-.5)*.003;}
  if(k>=1){if(s.end)s.end();HD.lq.shift();HD.lqFrom=null;}
}
function cigDrag(){const C=HD.cig;if(!C||!C.lit||HD.seq.length||HD.lighterOn)return;
  if(C.where==='mouth'){const mp=mouthP();seqStart([{to:mp,dur:.1,at(){C.dragT=1.3;C.ember=1;HSFX.drag();}},{to:mp,dur:1.2},{to:mp,dur:.1,at(){cigExhale();}}]);}
  else{seqStart([{to:'handMouth',dur:.5},{to:'handMouth',dur:1.2,at(){C.dragT=1.3;C.ember=1;HSFX.drag();}},{to:'hand',dur:.5,at(){cigExhale();}}]);}
  hdUi();}
function cigExhale(){const C=HD.cig;if(!C)return;C.burn=Math.min(1,C.burn+.03);C.ash=Math.min(1,C.ash+.18);C.x=(C.x||0)+1;HSFX.exhale();
  camera.getWorldDirection(hdTmp);hdTmp2.copy(camera.position).addScaledVector(hdTmp,.22);hdTmp2.y-=.07;smokePuff(hdTmp2,hdTmp.clone().multiplyScalar(.45).add(new THREE.Vector3(0,.12,0)),12,.08,.42,2.8,.25,.42);mpItems();}
function cigToggleHand(){const C=HD.cig;if(!C||HD.seq.length||HD.lighterOn)return;if(atSlot()&&C.where==='mouth'){toast('Am Automaten bleibt sie im Mund.');return;}
  if(C.where==='mouth'){C.where='hand';HD.mc.visible=false;HD.handR.visible=true;HD.handR.position.fromArray(PX(POSE.handMouth.p));HD.handR.rotation.fromArray(POSE.handMouth.r);seqStart([{to:'hand',dur:.5}]);}
  else{seqStart([{to:'handMouth',dur:.5,end(){C.where='mouth';HD.handR.visible=false;HD.mc.visible=true;HD.mc.position.fromArray(PX(POSE[mouthP()].p));HD.mc.rotation.fromArray(POSE[mouthP()].r);seqStart([{to:mouthP(),dur:.1}]);mpItems();}}]);}
  mpItems();hdUi();}
function cigAsh(){const C=HD.cig;if(!C||HD.seq.length||HD.lighterOn)return;
  const doAsh=()=>{if(C.ash>.05){const tip=cigTipWorld();smokePuff(tip,new THREE.Vector3(0,-.5,0),4,.02,.03,.8,.1,.6);}C.ash=0;HSFX.ash();};
  if(C.where==='hand'){seqStart([{to:'handAsh',dur:.18},{to:'hand',dur:.1,at:doAsh},{to:'handAsh',dur:.12},{to:'hand',dur:.25,at:doAsh}]);}
  else if(atSlot()){seqStart([{to:'mouthAsh',dur:.22},{to:'mouthAsh',dur:.08,at:doAsh},{to:'mouthSlot',dur:.25}]);} // am Automaten: kurz zum Aschenbecher tippen
  else{cigToggleHand();HD.seq.push({to:'handAsh',dur:.18},{to:'hand',dur:.12,at:doAsh},{to:'handAsh',dur:.12},{to:'hand',dur:.25,at:doAsh});}
  hdUi();}
function cigThrow(){const C=HD.cig;if(!C||HD.lighterOn)return;HD.seq=[];HSFX.throw();
  const tip=cigTipWorld();if(C.lit)smokePuff(tip,new THREE.Vector3(0,.2,0),3,.03,.1,1.2,.2,.4);
  HD.cig=null;HD.mc.visible=false;HD.handR.visible=false;mpItems();hdUi();}
function cigTipWorld(){const P=HD.mc.userData.parts;hdTmp.set(0,P.fl+(P.L-P.fl)*(1-(HD.cig?HD.cig.burn:0)),0);HD.rig.updateMatrixWorld(true);return HD.mc.localToWorld(hdTmp.clone());}
function cigStep(dt){
  const C=HD.cig;if(!C)return;
  const obj=cigObj();
  if(HD.fly){HD.fly.t+=dt;const k=Math.min(1,HD.fly.t/HD.fly.dur),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;const f=HD.fly.from,to=POSE[mouthP()],tp=PX(to.p);
    HD.mc.position.set(f[0]+(tp[0]-f[0])*e,f[1]+(tp[1]-f[1])*e+Math.sin(k*Math.PI)*.05,f[2]+(tp[2]-f[2])*e);
    HD.mc.rotation.set(Math.PI+(to.r[0]-Math.PI)*e,to.r[1]*e,0);if(k>=1){HD.fly=null;hdUi();}return;}
  seqStep(dt,obj);
  if(C.lit){C.burn=Math.min(1,C.burn+dt/240);C.ash=Math.min(1,C.ash+dt/40);C.dragT=Math.max(0,C.dragT-dt);C.ember+=((C.dragT>0?1:.25+.15*Math.sin(now*7))-C.ember)*Math.min(1,dt*6);
    if(C.ash>=1){C.ash=.05;const tip=cigTipWorld();smokePuff(tip,new THREE.Vector3(0,-.5,0),3,.02,.03,.8,.1,.5);} // Asche fällt von selbst ab
    HD.smokeT-=dt;if(HD.smokeT<=0){HD.smokeT=C.dragT>0?.08:.3;const tip=cigTipWorld();smokePuff(tip,new THREE.Vector3(0,.18,0),1,.02,.12,2.2,.06,.3);}
    if(C.burn>=1){toast('Die Kippe ist runter.');cigThrow();return;}}
  cigApply(HD.mc,C.burn,C.ash,C.ember,C.lit);
  if(C.where==='hand'){ // Zigarette sitzt zwischen Zeige- und Mittelfinger
    if(HD.mc.parent!==HD.handR){HD.handR.add(HD.mc);HD.mc.visible=true;}HD.mc.position.set(.0,.058,-.004);HD.mc.rotation.set(-.35,0,0);}
  else{if(HD.mc.parent!==HD.rig){HD.rig.add(HD.mc);HD.mc.position.fromArray(PX(POSE[mouthP()].p));HD.mc.rotation.fromArray(POSE[mouthP()].r);}
    if(!HD.seq.length){const mp=POSE[mouthP()];HD.mc.position.lerp(hdTmp2.fromArray(PX(mp.p)),Math.min(1,dt*8));}} // Mund-Pose wechselt weich beim Hinsetzen/Aufstehen
}
// ---- Trinken ----
const DRINKS={bier:{n:'Bier',p:350,alc:.35,c:0xf0b020,op:.85},cola:{n:'Cola',p:250,alc:0,c:0x2a1408,op:.95},whisky:{n:'Whisky',p:600,alc:.7,c:0xc07a1a,op:.8},wasser:{n:'Wasser',p:150,alc:0,c:0xd8ecf8,op:.5},sekt:{n:'Sekt',p:500,alc:.4,c:0xf4e8a0,op:.6}};
function barMenu(n){HD.barN=n;const el=$('#pBar');if(!el)return;openPanel('pBar');const list=$('#barList');if(list)list.innerHTML=Object.keys(DRINKS).map(k=>'<button class="btn" data-drink="'+k+'">'+DRINKS[k].n+' <b>'+fmt(DRINKS[k].p)+'</b></button>').join('')+'<button class="btn" data-drink="cigs">Zigaretten (20) <b>'+fmt(800)+'</b></button>';
  const inv=$('#barInv');if(inv)inv.textContent='Du hast '+INV.cigs+' Zigaretten'+(HD.drink?' und ein Glas '+DRINKS[HD.drink.kind].n:'')+'.';}
function barBuy(k){
  const n=HD.barN;
  if(k==='cigs'){if(chips<800){toast('Nicht genug Geld.');return;}setChips(chips-800);INV.cigs=Math.min(400,INV.cigs+20);invSave();hdSyncCigs();closePanel();if(n)say(n,'Bitte sehr. Nicht alle auf einmal.',3);SFX.chip();return;}
  const D=DRINKS[k];if(!D)return;if(chips<D.p){toast('Nicht genug Geld.');return;}if(HD.drink&&HD.drink.level>.05){toast('Trink erst aus.');return;}
  setChips(chips-D.p);SFX.chip();closePanel();if(n)say(n,['Prost!','Wohl bekomm\'s.','Bitte sehr.'][Math.random()*3|0],3);
  HD.drink={kind:k,level:1,sips:0};HD.liquid.material.color.setHex(D.c);HD.liquid.material.opacity=D.op;HD.glass.visible=true;HD.glass.position.fromArray(PX(POSE.glassOut.p));HD.glass.rotation.fromArray(POSE.glassOut.r);HD.gq=[{to:'glass',dur:.5}];HD.gqFrom=null;hdUi();mpItems();
}
function drinkSip(){const D=HD.drink;if(!D||HD.gq.length)return;if(D.level<=.02){toast('Das Glas ist leer.');HSFX.empty();return;}
  HD.gq=[{to:'glassSip',dur:.5},{to:'glassSip',dur:.7,at(){HSFX.sip();D.level=Math.max(0,D.level-.17);D.sips++;const a=DRINKS[D.kind].alc;if(a)HD.buzz=Math.min(1.3,HD.buzz+a*.2);mpItems();}},{to:'glass',dur:.5,end(){if(D.level<=.02){toast('Leer. Noch eins an der Bar?');setTimeout(()=>{if(HD.drink===D){HD.drink=null;HD.glass.visible=false;hdUi();mpItems();}},1500);}}}];HD.gqFrom=null;hdUi();}
function drinkStep(dt){
  if(!HD.drink)return;const Gl=HD.glass;const L=HD.drink.level;HD.liquid.scale.y=Math.max(.02,L);HD.liquid.position.y=.006+.035*L;
  if(!HD.gq||!HD.gq.length)return;const s=HD.gq[0];
  if(HD.gqFrom===null||HD.gqFrom===undefined){HD.gqFrom={p:Gl.position.clone(),r:Gl.rotation.clone()};HD.gqT=0;if(s.at)s.at();}
  HD.gqT+=dt;const k=Math.min(1,HD.gqT/s.dur),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2,to=POSE[s.to],tp=PX(to.p);
  Gl.position.set(HD.gqFrom.p.x+(tp[0]-HD.gqFrom.p.x)*e,HD.gqFrom.p.y+(tp[1]-HD.gqFrom.p.y)*e,HD.gqFrom.p.z+(tp[2]-HD.gqFrom.p.z)*e);
  Gl.rotation.set(HD.gqFrom.r.x+(to.r[0]-HD.gqFrom.r.x)*e,HD.gqFrom.r.y+(to.r[1]-HD.gqFrom.r.y)*e,HD.gqFrom.r.z+(to.r[2]-HD.gqFrom.r.z)*e);
  if(k>=1){if(s.end)s.end();HD.gq.shift();HD.gqFrom=null;}
}
HD.gq=[];HD.gqFrom=null;HD.lq=[];
// ---- Tasten und Handy-Leiste ----
function handsAction(k){
  if(k==='pack'){if(HD.packSt==='off'){if(INV.cigs<=0&&!HD.cig){toast('Schachtel leer. Zigaretten gibt es an der Bar.');return;}packShow();}else packHide();}
  else if(k==='fire')cigLight();else if(k==='drag')cigDrag();else if(k==='hand')cigToggleHand();else if(k==='ash')cigAsh();else if(k==='throw')cigThrow();else if(k==='sip')drinkSip();
}
function handsKey(e){
  if(e.repeat)return false;const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return false;
  const map={KeyR:'pack',KeyF:'fire',KeyQ:'drag',KeyH:'hand',KeyX:'ash',KeyV:'throw',KeyT:'sip'};const k=map[e.code];if(!k)return false;
  handsAction(k);return true;
}
function handsAvail(){const C=HD.cig,o=[];
  if(HD.packSt!=='off')o.push(['pack','SCHACHTEL WEG','R']);else if(!C||C.where==='mouth')o.push(['pack',C?'SCHACHTEL':'ZIGARETTEN ('+INV.cigs+')','R']);
  if(C){if(!C.lit&&C.where==='mouth')o.push(['fire','FEUER','F']);if(C.lit)o.push(['drag','ZIEHEN','Q']);if(!atSlot()||C.where==='hand')o.push(['hand',C.where==='mouth'?'IN DIE HAND':'IN DEN MUND','H']);if(C.lit)o.push(['ash','ABASCHEN','X']);o.push(['throw','WEG','V']);}
  if(HD.drink)o.push(['sip','TRINKEN','T']);return o;}
function hdUi(){
  const bar=$('#itBar'),hint=$('#itHint');const vis=started&&(!focus||atSlot())&&!locked&&!openId;const av=vis?handsAvail():[];
  const key=av.map(a=>a.join('|')).join(';')+'|'+(PC?'pc':'ph')+(atSlot()?'|s':'');if(HD.last.ui===key)return;HD.last.ui=key;if(bar)bar.classList.toggle('fc',atSlot());if(hint)hint.classList.toggle('fc',atSlot());
  if(bar){if(!vis||PC||!av.length){bar.hidden=true;}else{bar.hidden=false;bar.innerHTML=av.map(a=>'<button type="button" class="itb" data-k="'+a[0]+'">'+a[1]+'</button>').join('');}}
  if(hint){const show=vis&&PC&&(HD.cig||HD.drink||HD.packSt!=='off');hint.hidden=!show;if(show)hint.textContent=av.map(a=>a[2]+' '+a[1]).join('  ·  ');}
}
{const bar=$('#itBar');if(bar)bar.addEventListener('pointerdown',e=>{const b=e.target.closest('button');if(!b)return;e.preventDefault();e.stopPropagation();SFX.click();handsAction(b.dataset.k);b.classList.add('down');setTimeout(()=>b.classList.remove('down'),120);});
 const bl=$('#barList');if(bl)bl.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&b.dataset.drink)barBuy(b.dataset.drink);});}
// ---- Mitspieler: Kippe im Mund / in der Hand, Glas, Rauchwölkchen ----
function itemsPresence(){const C=HD.cig;return (C||HD.drink)?{c:C?(C.where==='hand'?2:1):0,l:C&&C.lit?1:0,x:C?C.x||0:0,d:HD.drink?HD.drink.kind:'',s:HD.drink?HD.drink.sips:0}:0;}
function mpItems(){if(typeof MP!=='undefined'&&MP.room){MP.me.it=itemsPresence();MP.dirty=true;}}
function avItems(n){ // Anbauten an ein Figuren-Modell (stehend oder sitzend)
  if(n.items)return n.items;const c=cigMesh(.084);c.position.set(.018,-.062,.13);c.rotation.set(1.72,0,.1);c.visible=false;n.head.add(c);
  const ch=cigMesh(.084);ch.position.set(0,-.62,.03);ch.rotation.set(-1.2,0,0);ch.visible=false;n.armR.add(ch);
  const gl=new THREE.Group();gl.position.set(0,-.64,.03);gl.visible=false;n.armL.add(gl);
  const gm=new THREE.MeshPhongMaterial({color:0xe8f4ff,transparent:true,opacity:.3,shininess:100});mesh(new THREE.CylinderGeometry(.03,.025,.085,12,1,true),gm,0,.04,0,gl);const liq=mesh(new THREE.CylinderGeometry(.026,.022,.06,12),lam({color:0xf0b020,transparent:true,opacity:.9}),0,.035,0,gl);
  return n.items={cm:c,ch,gl,liq};}
function itemsPeer(a,pr){const it=pr&&pr.it&&typeof pr.it==='object'?pr.it:null;a.it=it?{c:+it.c===2?2:(+it.c===1?1:0),l:it.l?1:0,x:Math.max(0,Math.round(+it.x||0)),d:DRINKS[it.d]?it.d:'',s:Math.max(0,Math.round(+it.s||0))}:null;
  if(a.it&&a.itX!==undefined&&a.it.x!==a.itX&&a.it.l){const n=a.n;n.head.getWorldPosition(hdTmp);hdTmp.y-=.02;const dir=new THREE.Vector3(0,0,1).applyQuaternion(n.head.getWorldQuaternion(new THREE.Quaternion()));
    smokePuff(hdTmp.addScaledVector(dir,.16),dir.multiplyScalar(.4).add(new THREE.Vector3(0,.12,0)),10,.08,.4,2.6,.25,.4);a.itDrag=now;}
  a.itX=a.it?a.it.x:undefined;}
function itemsAvatarsStep(dt){
  if(typeof MP==='undefined')return;
  MP.avatars.forEach(a=>{[a.m.st,a.m.si].forEach(n=>{const I=avItems(n);const it=a.it;const vis=n.root.visible;
    I.cm.visible=!!(it&&it.c===1)&&vis;I.ch.visible=!!(it&&it.c===2)&&vis;I.gl.visible=!!(it&&it.d)&&vis;
    if(it&&it.d){I.liq.material.color.setHex(DRINKS[it.d].c);}
    if(it&&it.l&&vis){const g=it.c===2?I.ch:I.cm;cigApply(g,.3,.3,.3+.2*Math.sin(now*6),true);if(it.c===2&&n===a.n){n.armR.rotation.x=a.itDrag&&now-a.itDrag<1.3?-2.3:-1.35;n.armR.rotation.z=.25;}}
    else if(it&&it.c===2&&n===a.n){n.armR.rotation.x=-1.35;n.armR.rotation.z=.25;}
    if(it&&it.d&&n===a.n&&n.anim!=='drink'){n.armL.rotation.x=-1.2;}});
    if(a.it&&a.it.l&&a.f===floorIdx&&Math.random()<dt*2.5){const n=a.n;const g=a.it.c===2?n.items.ch:n.items.cm;const P=g.userData.parts;hdTmp.set(0,P.fl+(P.L-P.fl)*.7,0);g.updateMatrixWorld();g.localToWorld(hdTmp);smokePuff(hdTmp,new THREE.Vector3(0,.18,0),1,.02,.1,2,.06,.3);}});
}
// ---- pro Bild: Posen, Brennen, Rauch, Leiste; am Ende Hände über die Welt zeichnen ----
function handsStep(dt){
  smokeStep(dt);itemsAvatarsStep(dt);
  HD.ax=Math.min(1,Math.max(.55,LW()/LH()/1.3));
  const show=started&&(!focus||atSlot())&&!locked&&!openId&&EL.phase!=='moving';
  if(atSlot()&&HD.cig&&HD.cig.where==='hand'&&!HD.seq.length&&!HD.lighterOn){HD.cig.where='mouth';HD.handR.visible=false;HD.rig.add(HD.mc);HD.mc.visible=true;HD.mc.position.fromArray(PX(POSE.mouthSlot.p));HD.mc.rotation.fromArray(POSE.mouthSlot.r);mpItems();hdUi();} // hinsetzen: Kippe in den Mund
  HD.rig.position.copy(camera.position);HD.rig.quaternion.copy(camera.quaternion);HD.rig.visible=show;HD.rig.updateMatrixWorld(true);
  if(HD.buzz>0){HD.buzz=Math.max(0,HD.buzz-dt*.006);camera.rotation.z+=Math.sin(now*.9)*.014*HD.buzz;camera.rotation.x+=Math.sin(now*.6)*.007*HD.buzz;}
  packStep(dt);cigStep(dt);lighterStep(dt);drinkStep(dt);
  if(HD.packSt!=='off'&&((focus&&!atSlot())||locked||openId))packHide();
  hdUi();
}
function handsRender(){if(!HD.rig.visible)return;renderer.clearDepth();renderer.render(HD.scene,camera);}
