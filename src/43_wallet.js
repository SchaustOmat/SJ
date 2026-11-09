// ---------- Portemonnaie mit Scheinen (2026-11-09) ----------
// chips (Cent) bleibt der Bargeld-Stand; die Scheine sind nur seine Aufteilung (gierig, Rest unter 5 € = Münzen).
// Schein in der Hand: WERFEN / ABLEGEN / GEBEN / ZURÜCK. Liegende Scheine: nk_drops beim Besitzer (Geld geht nie verloren),
// Präsenz dr (liegend) / dg (vergeben an Kontonummer) / pk (ich will aufheben) / wk (bei mir gutgeschrieben = Bestätigung).
const BILLS=[50000,20000,10000,5000,2000,1000,500];
const BILL_COL={500:['#8a9a8c','#4c5c50'],1000:['#c8645a','#7a2a24'],2000:['#5a84c8','#22406e'],5000:['#e09040','#7a4410'],10000:['#5aa86a','#1e5a2c'],20000:['#d8b848','#76601a'],50000:['#9a6ac0','#4a2a6a']};
const WL={st:'off',t:0,held:0,obj:null,bills:[],heldObj:null,lastC:-1,hover:-1,drops:[],done:[],claims:[],others:new Map(),wkSeen:new Map(),room:undefined,tick:0,atmFx:null,fly:[]};
function billSplit(c){c=Math.max(0,Math.round(c));const b={};for(const v of BILLS){const n=Math.floor(c/v);if(n>0){b[v]=n;c-=n*v;}}return {b,coins:c};}
const BILL_CV={},BILL_TX={},BILL_URL={};
function billCanvas(v){if(BILL_CV[v])return BILL_CV[v];const cv=document.createElement('canvas');cv.width=256;cv.height=128;const g=cv.getContext('2d');const [a,b]=BILL_COL[v]||['#999','#444'];
  const gr=g.createLinearGradient(0,0,256,128);gr.addColorStop(0,a);gr.addColorStop(1,b);g.fillStyle=gr;g.fillRect(0,0,256,128);
  g.globalAlpha=.22;g.strokeStyle='#fff';g.lineWidth=1; // Guillochen
  for(let k=0;k<9;k++){g.beginPath();for(let x=0;x<=256;x+=4){const y=64+Math.sin(x*.05+k*.7)*(18+k*4)*Math.cos(x*.013+k);x?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();}
  g.globalAlpha=1;g.strokeStyle='rgba(255,240,200,.75)';g.lineWidth=3;g.strokeRect(5,5,246,118);g.lineWidth=1;g.strokeRect(10,10,236,108);
  g.fillStyle='rgba(255,245,220,.25)';g.beginPath();g.arc(170,66,34,0,7);g.fill();g.strokeStyle='rgba(255,240,200,.7)';g.lineWidth=2;g.beginPath();g.arc(170,66,34,0,7);g.stroke();
  g.fillStyle='#fff8e0';g.textAlign='center';g.textBaseline='middle';g.font='bold 28px Georgia,serif';g.fillText('SJ',170,67);
  const t=String(v/100);g.textAlign='left';g.font='bold '+(t.length>2?40:46)+'px Georgia,serif';g.lineWidth=4;g.strokeStyle='rgba(0,0,0,.45)';g.strokeText(t,16,38);g.fillText(t,16,38);
  g.textAlign='right';g.font='bold 22px Georgia,serif';g.strokeText(t,242,104);g.fillText(t,242,104);
  g.textAlign='left';g.font='bold 11px Georgia,serif';g.fillStyle='rgba(255,248,224,.9)';g.fillText('SJ SPIELBANK',18,76);g.font='10px monospace';g.fillText('SJ'+(v*7919%1000000).toString().padStart(6,'0'),18,104);
  return BILL_CV[v]=cv;}
function billTex(v){if(!BILL_TX[v]){const t=new THREE.CanvasTexture(billCanvas(v));t.anisotropy=4;BILL_TX[v]=t;}return BILL_TX[v];}
function billUrl(v){return BILL_URL[v]||(BILL_URL[v]=billCanvas(v).toDataURL());}
function billsHtml(c,cls){const s=billSplit(c);let h='';for(const v of BILLS)if(s.b[v])h+='<button type="button" class="gb'+(cls?' '+cls:'')+'" data-v="'+v+'" style="background-image:url('+billUrl(v)+')"><b>×'+s.b[v]+'</b></button>';
  if(s.coins>0)h+='<button type="button" class="gb coin'+(cls?' '+cls:'')+'" data-v="'+s.coins+'">MÜNZEN '+fmt(s.coins)+'</button>';return h;}
function walletGateHtml(){return billsHtml(chips)||'<span class="gate-x">KEIN BARGELD</span>';}
// Schein in den Automaten: wird Guthaben des Automaten (m.cash), beim Aufstehen zurück (slotCashOut)
function slotFeed(m,v){v=Math.round(+v||0);if(!m||!(v>0)||chips<v||isMine(m))return false;
  m.cash=(m.cash||0)+v;m.cashOn=true;slotPendSave();setChips(chips-v);m.dirty=true;if(typeof updateButtons==='function')updateButtons(m);if(typeof svCardSync==='function')svCardSync();SFX.chip();return true;}
// Geldautomat: Scheine anzeigen, beim Abheben kommen sie rein, beim Einzahlen fliegen sie raus
function atmBillsHtml(){const fx=WL.atmFx&&Date.now()-WL.atmFx.t<900?WL.atmFx:null;let h='<div class="atm-bills">'+billsHtml(chips,fx&&fx.k==='come'?'come':'');
  if(fx&&fx.k==='go')h+=billsHtml(fx.a,'go');return h+'</div>';}
function walletAtmFx(k,a){WL.atmFx={k,a,t:Date.now()};}

/* ---------- 3D: Portemonnaie und Schein in der Hand (HD.rig = Kamera-Raum) ---------- */
const WL_BW=.13,WL_BH=.065;
function wlBadge(n){const cv=document.createElement('canvas');cv.width=64;cv.height=40;const g=cv.getContext('2d');g.fillStyle='#1a0a00';g.beginPath();g.arc(20,20,18,0,7);g.arc(44,20,18,0,7);g.fill();g.strokeStyle='#ffcf3a';g.lineWidth=3;g.stroke();
  g.fillStyle='#ffcf3a';g.font='bold 22px Georgia,serif';g.textAlign='center';g.textBaseline='middle';g.fillText('×'+n,32,21);const t=new THREE.CanvasTexture(cv);return t;}
function wlCoinTex(c){const cv=document.createElement('canvas');cv.width=256;cv.height=48;const g=cv.getContext('2d');g.fillStyle='#ffcf3a';g.font='bold 26px Georgia,serif';g.textAlign='center';g.textBaseline='middle';g.fillText(c>0?'MÜNZEN '+fmt(c):'SJ',128,25);return new THREE.CanvasTexture(cv);}
function wlLeather(){const cv=document.createElement('canvas');cv.width=128;cv.height=64;const g=cv.getContext('2d');g.fillStyle='#4a2a16';g.fillRect(0,0,128,64);
  for(let i=0;i<500;i++){g.fillStyle='rgba('+(Math.random()<.5?'0,0,0':'255,220,180')+','+(Math.random()*.08)+')';g.fillRect(Math.random()*128,Math.random()*64,2,2);}
  g.strokeStyle='rgba(255,210,150,.5)';g.setLineDash([3,3]);g.strokeRect(4,4,120,56);return new THREE.CanvasTexture(cv);}
function wlBuild(){const G=new THREE.Group();const lm=new THREE.MeshLambertMaterial({map:wlLeather()});
  const back=new THREE.Mesh(new THREE.BoxGeometry(.2,.1,.012),lm);back.position.set(0,-.01,-.012);G.add(back);
  const pk=new THREE.Mesh(new THREE.BoxGeometry(.204,.052,.01),lm);pk.position.set(0,-.036,.022);G.add(pk);
  const cl=new THREE.Mesh(new THREE.PlaneGeometry(.16,.03),new THREE.MeshBasicMaterial({map:wlCoinTex(0),transparent:true,depthTest:false}));cl.position.set(0,-.036,.028);cl.renderOrder=5;G.add(cl);G.userData.coin=cl;
  G.userData.bills=new THREE.Group();G.add(G.userData.bills);G.visible=false;HD.rig.add(G);return G;}
function wlFill(){const G=WL.obj,B=G.userData.bills;while(B.children.length){const c=B.children.pop();c.traverse(o=>{if(o.material&&o.material.map&&o.userData.own)o.material.map.dispose();});}
  const s=billSplit(chips),vs=BILLS.filter(v=>s.b[v]).reverse();WL.bills=[];const n=vs.length;
  vs.forEach((v,k)=>{const piv=new THREE.Group();const a=n>1?(.55-1.1*k/(n-1)):0;piv.position.set((k-(n-1)/2)*.012,-.05,.008+k*.0015);piv.rotation.z=a;
    const m=new THREE.Mesh(new THREE.PlaneGeometry(WL_BW,WL_BH),new THREE.MeshLambertMaterial({map:billTex(v),side:THREE.DoubleSide}));m.position.set(0,.075,0);m.rotation.z=-Math.PI/2;piv.add(m);
    if(s.b[v]>1){const bd=new THREE.Mesh(new THREE.PlaneGeometry(.03,.019),new THREE.MeshBasicMaterial({map:wlBadge(s.b[v]),transparent:true,depthTest:false}));bd.renderOrder=6;bd.userData.own=1;bd.position.set(0,.148,.002);piv.add(bd);}
    m.userData.v=v;B.add(piv);WL.bills.push({v,piv,m,up:0});});
  const cl=G.userData.coin;cl.material.map.dispose();cl.material.map=wlCoinTex(s.coins);WL.lastC=chips;}
function wlPlace(){ // Lage im Kamera-Raum: unten mittig, Größe passend zum Bild
  const tv=Math.tan(camera.fov*Math.PI/360),asp=LW()/LH(),d=PC?.42:asp<1?.36:.3;const wide=asp>=1;let s=Math.min((wide?.4:.8)*2*tv*asp*d/.26,(wide?.42:.62)*2*tv*d/.2);s=Math.min(s,1.8);
  return {d,s,x:0,y:-tv*d*(asp<1?.28:.45)};}
function walletShow(){if(atSlot())return;if(HD.packSt!=='off'&&typeof packHide==='function')packHide();if(!WL.obj)WL.obj=wlBuild();if(chips!==WL.lastC)wlFill();
  WL.st='in';WL.t=0;WL.obj.visible=true;HD.cx=LW()/2;HD.cy=LH()*.62;if(typeof HSFX!=='undefined'&&HSFX.take)HSFX.take();hdUi();}
function walletClose(){if(WL.st==='off'||WL.st==='out')return;WL.st='out';WL.t=0;WL.hover=-1;hdUi();}
function wlHeldMesh(){if(!WL.heldObj){WL.heldObj=new THREE.Mesh(new THREE.PlaneGeometry(WL_BW,WL_BH),new THREE.MeshLambertMaterial({side:THREE.DoubleSide}));HD.rig.add(WL.heldObj);}return WL.heldObj;}
function wlHeldPose(){const tv=Math.tan(camera.fov*Math.PI/360),asp=LW()/LH(),d=PC?.4:.34;const s=Math.min(1.6,Math.max(1,.5*2*tv*asp*d/WL_BW));return {p:[tv*asp*d*(asp<1?.25:.4),-tv*d*.45,-d],s};}
function wlTake(v){if(chips<v)return;WL.held=v;const h=wlHeldMesh();h.material.map=billTex(v);h.material.needsUpdate=true;h.visible=true;WL.heldT=0;walletClose();SFX.click();hdUi();}
function wlPick(x,y){if(!WL.obj||WL.st!=='open'||!WL.bills.length)return -1;hdV.set(x/LW()*2-1,-(y/LH())*2+1);hdRay.setFromCamera(hdV,camera);HD.rig.updateMatrixWorld(true);
  const ms=WL.bills.map(b=>b.m);const h=hdRay.intersectObjects(ms,false)[0];if(h)return ms.indexOf(h.object);
  if(PC)return -1;let best=-1,bd=50;WL.bills.forEach((b,k)=>{const p=b.m.localToWorld(new THREE.Vector3(.03,0,0)).project(camera);const sx=(p.x+1)/2*LW(),sy=(1-p.y)/2*LH();const dd=Math.hypot(sx-x,sy-y);if(dd<bd){bd=dd;best=k;}});return best;}
function walletTap(x,y){if(WL.st!=='open')return false;const pt=handsCursorActive()?[HD.cx,HD.cy]:(PC&&!mouseLocked()?[CUR.x,CUR.y]:[x,y]);const k=wlPick(pt[0],pt[1]);
  if(k>=0){wlTake(WL.bills[k].v);return true;}return false;}
function walletAvail(o){if(atSlot())return;if(WL.held){o.push(['bthrow','WERFEN','V'],['bdrop','ABLEGEN','B'],['bgive','GEBEN','C'],['bback','ZURÜCK','G']);return;}
  if(HD.cig&&HD.cig.where==='hand')return;o.push(['wallet',WL.st==='off'||WL.st==='out'?'GELD':'GELD ZU','G']);}
function walletAction(k){
  if(k==='wallet'){if(WL.held){wlBack();return true;}if(WL.st==='off'||WL.st==='out'){if(HD.cig&&HD.cig.where==='hand'){toast('Erst die Kippe aus der Hand.');return true;}if(chips<=0){toast('Kein Bargeld. Geld gibt es am Geldautomaten.');return true;}walletShow();}else walletClose();return true;}
  if(!WL.held)return k==='bthrow'||k==='bdrop'||k==='bgive'||k==='bback';
  if(k==='bback'){wlBack();return true;}if(k==='bthrow'){wlThrow();return true;}if(k==='bdrop'){wlDrop();return true;}if(k==='bgive'){wlGive();return true;}return false;}
function wlBack(){WL.held=0;if(WL.heldObj)WL.heldObj.visible=false;walletShow();}
function wlHeldEnd(){WL.held=0;if(WL.heldObj)WL.heldObj.visible=false;hdUi();}

/* ---------- liegende Scheine ---------- */
function dropsSave(){store('nk_drops',WL.drops.length?JSON.stringify(WL.drops.map(d=>({i:d.i,v:d.v,x:+d.x.toFixed(2),y:+d.y.toFixed(3),z:+d.z.toFixed(2),f:d.f,r:+(d.r||0).toFixed(2),t:d.t,g:d.g||'',gn:d.gn||'',l:d.l?1:0}))):null);}
function walletDropSum(){return WL.drops.reduce((s,d)=>s+d.v,0);}
function wlId(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
function wlMesh(v,x,y,z,f,r,act){const g=new THREE.Group();const m=new THREE.Mesh(new THREE.PlaneGeometry(.15,.075),new THREE.MeshLambertMaterial({map:billTex(v),side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;g.add(m);
  const hit=new THREE.Mesh(new THREE.PlaneGeometry(.34,.24),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));hit.rotation.x=-Math.PI/2;hit.position.y=.01;g.add(hit);
  g.position.set(x,y+.004,z);g.rotation.y=r||0;const Fl=floors[f]||floors[0];Fl.group.add(g);
  if(act){act.pos=new THREE.Vector3(x,y,z);hit.userData.act=act;m.userData.act=act;Fl.hits.push(hit,m);Fl.acts.push(act);}
  g.userData={F:Fl,hits:[hit,m],act};return g;}
function wlUnmesh(g){if(!g)return;const u=g.userData,Fl=u.F;Fl.group.remove(g);u.hits.forEach(h=>{const i=Fl.hits.indexOf(h);if(i>=0)Fl.hits.splice(i,1);h.geometry.dispose();});if(u.act){const i=Fl.acts.indexOf(u.act);if(i>=0)Fl.acts.splice(i,1);}}
function wlDropMesh(d){if(d.mesh||!d.l||d.g)return;d.mesh=wlMesh(d.v,d.x,d.y,d.z,d.f,d.r,{type:'bill',label:'AUFHEBEN',sub:fmt(d.v)+' · DEIN SCHEIN',reach:1.6,own:1,i:d.i});}
function wlRefund(d,why){const i=WL.drops.indexOf(d);if(i<0||d.g)return;WL.drops.splice(i,1);wlUnmesh(d.mesh);d.mesh=null;dropsSave();setChips(chips+d.v,true);if(why)toast(why);wlPres();}
function wlNew(v,o){chips>=v||(v=0);if(!v)return null;const d=Object.assign({i:wlId(),v,f:floorIdx,t:Date.now(),g:'',gn:'',l:0,r:Math.random()*6.28},o);WL.drops.push(d);dropsSave();setChips(chips-v);return d;}
function wlSurfaceY(x,z,maxY){const rc=new THREE.Raycaster(new THREE.Vector3(x,maxY,z),new THREE.Vector3(0,-1,0),0,maxY+.1);
  const h=rc.intersectObjects(hitList(),false).filter(h=>h.object.visible&&!(h.object.userData.act&&h.object.userData.act.type==='bill'));for(const k of h){const n=k.face?k.face.normal.clone().transformDirection(k.object.matrixWorld):null;if(n&&n.y>.6)return k.point.y;}return 0;}
function wlFwd(){const v=new THREE.Vector3();camera.getWorldDirection(v);return v;}
function wlThrow(){const v=WL.held;const h=WL.heldObj;HD.rig.updateMatrixWorld(true);const p=h.getWorldPosition(new THREE.Vector3());
  const d=wlNew(v,{x:p.x,y:p.y,z:p.z});if(!d)return wlHeldEnd();const fw=wlFwd();d.vel=fw.multiplyScalar(5.5).add(new THREE.Vector3(0,2,0));d.spin=(Math.random()-.5)*14;d.age=0;
  d.mesh=wlMesh(v,p.x,p.y,p.z,d.f,d.r,null);WL.fly.push(d);wlHeldEnd();if(typeof HSFX!=='undefined'&&HSFX.flick)HSFX.flick();}
function wlLand(d){d.l=1;d.vel=null;const i=WL.fly.indexOf(d);if(i>=0)WL.fly.splice(i,1);wlUnmesh(d.mesh);d.mesh=null;if(WL.drops.includes(d)){wlDropMesh(d);dropsSave();wlPres();}}
function wlFlyStep(dt){const rc=new THREE.Raycaster();WL.fly.slice().forEach(d=>{
  if(d.give){d.age+=dt;const a=d.to&&MP.avatars?MP.avatars.get(d.to):null;const k=Math.min(1,d.age/.6);if(a){const q=a.m.g.position;d.mesh.position.set(d.sx+(q.x-d.sx)*k,d.sy+(1.1-d.sy)*k+Math.sin(k*Math.PI)*.4,d.sz+(q.z-d.sz)*k);}d.mesh.rotation.y+=dt*8;
    if(k>=1||!a){WL.fly.splice(WL.fly.indexOf(d),1);wlUnmesh(d.mesh);d.mesh=null;}return;}
  d.age+=dt;const v=d.vel;v.y-=6.5*dt;v.multiplyScalar(Math.exp(-1.1*dt));v.x+=Math.sin(d.age*9+d.r)*dt*.8;
  const p=new THREE.Vector3(d.x,d.y,d.z),step=v.clone().multiplyScalar(dt),len=step.length();
  if(len>1e-5){rc.set(p,step.clone().normalize());rc.far=len+.02;const h=rc.intersectObjects(hitList(),false).filter(h=>h.object.visible&&!(h.object.userData.act&&h.object.userData.act.type==='bill'))[0];
    if(h){const n=h.face?h.face.normal.clone().transformDirection(h.object.matrixWorld):new THREE.Vector3(0,1,0);
      if(n.y>.6){d.x=h.point.x;d.y=h.point.y;d.z=h.point.z;return wlLand(d);}
      v.reflect(n).multiplyScalar(.3);p.copy(h.point).addScaledVector(n,.03);d.x=p.x;d.y=p.y;d.z=p.z;}
    else{d.x+=step.x;d.y+=step.y;d.z+=step.z;}}
  if(d.x<-12||d.x>12){d.x=clamp(d.x,-12,12);v.x*=-.3;}if(d.z<-14.5||d.z>12){d.z=clamp(d.z,-14.5,12);v.z*=-.3;}
  if(d.y<=0||d.age>6){d.y=Math.max(0,d.age>6?wlSurfaceY(d.x,d.z,Math.max(d.y,.1)):0);return wlLand(d);}
  d.r+=d.spin*dt;d.mesh.position.set(d.x,d.y,d.z);d.mesh.rotation.set(Math.sin(d.age*7)*.7,d.r,Math.cos(d.age*5)*.5);});}
function wlDrop(){const fw=wlFwd();fw.y=0;fw.normalize();const x=clamp(P.x+fw.x*.6,-12,12),z=clamp(P.z+fw.z*.6,-14.5,12);const y=wlSurfaceY(x,z,1.5);
  const d=wlNew(WL.held,{x,y,z,l:1});wlHeldEnd();if(!d)return;wlDropMesh(d);dropsSave();wlPres();SFX.click();}
function wlGive(){const fw=wlFwd();fw.y=0;fw.normalize();let best=null,bd=3.5;
  if(typeof MP!=='undefined'&&MP.avatars)MP.avatars.forEach((a,k)=>{if(a.f!==floorIdx||!a.kn)return;const q=a.m.g.position,dx=q.x-P.x,dz=q.z-P.z,dd=Math.hypot(dx,dz);if(dd>bd||(dx*fw.x+dz*fw.z)/(dd||1)<.75)return;bd=dd;best=[k,a];});
  if(!best){toast('Niemand vor dir. Schau die Person an (bis 3,5 m).');return;}
  const [peer,a]=best;HD.rig.updateMatrixWorld(true);const p=WL.heldObj.getWorldPosition(new THREE.Vector3());const v=WL.held;
  const d=wlNew(v,{x:p.x,y:p.y,z:p.z,g:a.kn,gn:cleanText(a.name,14),give:1});wlHeldEnd();if(!d)return;
  WL.fly.push({give:1,to:peer,age:0,sx:p.x,sy:p.y,sz:p.z,mesh:wlMesh(v,p.x,p.y,p.z,floorIdx,0,null)});wlPres();toast(fmt(v)+' an '+a.name+' gegeben.');SFX.chip();}
function billPick(act){
  if(act.own){const d=WL.drops.find(x=>x.i===act.i);if(d&&!d.g){wlRefund(d);toast(fmt(d.v)+' aufgehoben.');SFX.chip();}return;}
  const o=WL.others.get(act.key);if(!o)return;if(WL.claims.some(c=>c.key===act.key))return;WL.claims.push({key:act.key,o:act.o,i:act.i,v:act.v,t:Date.now()});o.mesh.visible=false;wlPres();SFX.click();}
function wlPres(){if(typeof MP==='undefined')return;const me=MP.me;if(!me)return;
  me.dr=WL.drops.filter(d=>d.l&&!d.g).slice(-16).map(d=>[d.i,d.v,Math.round(d.x*100),Math.round(d.y*1000),Math.round(d.z*100),d.f,Math.round((d.r||0)*100)]);
  me.dg=WL.drops.filter(d=>d.g).slice(-12).map(d=>[d.i,d.g,d.v]);
  me.pk=WL.claims.slice(-6).map(c=>[c.o,c.i]);const t=Date.now();me.wk=[...WL.wkSeen].filter(e=>t-e[1]<60000).map(e=>e[0]).slice(-12);MP.dirty=true;}
// pro Mitspieler aus der Präsenz (nach bankPeer, a.kn ist gesetzt)
function walletPeer(a,pr){if(!a.kn)return;let ch=false,pres=false;
  // 1) jemand will meinen Schein: der Erste bekommt ihn
  if(Array.isArray(pr.pk))pr.pk.slice(0,6).forEach(c=>{if(!Array.isArray(c)||c[0]!==BANK.konto)return;const d=WL.drops.find(x=>x.i===c[1]);if(!d||d.g||!d.l)return;
    d.g=a.kn;d.gn=cleanText(a.name,14);wlUnmesh(d.mesh);d.mesh=null;ch=true;toast(a.name+' hat deinen Schein ('+fmt(d.v)+') aufgehoben.');});
  // 2) Bestätigung: bei ihm gutgeschrieben -> bei mir löschen
  if(Array.isArray(pr.wk)){const w=pr.wk.filter(x=>typeof x==='string');for(let k=WL.drops.length-1;k>=0;k--){const d=WL.drops[k];if(d.g===a.kn&&w.includes(BANK.konto+'|'+d.i)){WL.drops.splice(k,1);ch=true;}}}
  // 3) an mich vergeben: genau einmal gutschreiben
  if(Array.isArray(pr.dg))pr.dg.slice(0,12).forEach(e=>{if(!Array.isArray(e)||e[1]!==BANK.konto||typeof e[0]!=='string'||e[0].length>16)return;const v=Math.round(+e[2]);if(!(v>0&&v<=50000))return;
    const key=a.kn+'|'+e[0];if(!WL.done.includes(key)){WL.done.push(key);if(WL.done.length>200)WL.done.splice(0,WL.done.length-200);store('nk_dropdone',JSON.stringify(WL.done));setChips(chips+v,true);
      const cl=WL.claims.findIndex(c=>c.key===a.peer+'|'+e[0]);if(cl>=0){WL.claims.splice(cl,1);toast(fmt(v)+' aufgehoben.');}else toast(a.name+' hat dir '+fmt(v)+' gegeben!');SFX.chip();}
    if(!WL.wkSeen.has(key))pres=true;WL.wkSeen.set(key,Date.now());});
  // 4) seine liegenden Scheine anzeigen
  const seen=new Set();if(Array.isArray(pr.dr))pr.dr.slice(0,16).forEach(e=>{if(!Array.isArray(e)||typeof e[0]!=='string'||e[0].length>16)return;const v=Math.round(+e[1]);if(!(v>0&&v<=50000))return;
    const key=a.peer+'|'+e[0];seen.add(key);if(WL.others.has(key))return;const x=clamp(e[2]/100,-12,12),y=clamp(e[3]/1000,0,3),z=clamp(e[4]/100,-14.5,12),f=e[5]===1?1:0;
    const act={type:'bill',label:'AUFHEBEN',sub:fmt(v)+' · von '+a.name,reach:1.6,key,o:a.kn,i:e[0],v};WL.others.set(key,{peer:a.peer,mesh:wlMesh(v,x,y,z,f,e[6]/100,act)});});
  WL.others.forEach((o,k)=>{if(o.peer===a.peer&&!seen.has(k)){wlUnmesh(o.mesh);WL.others.delete(k);}});
  if(ch)dropsSave();if(ch||pres)wlPres();}
function walletPoses(n,ctx){if(!ctx||!ctx.cam||HD.packSt!=='off')return;
  if(WL.obj&&WL.obj.visible&&!HD.drink){const o=WL.obj.position,s=WL.obj.scale.x;const P=chCamPose('wallet',ctx.cam,null,null,'l',[o.x-.09*s,o.y-.02*s,-o.z]);if(P)ctx.l=P;}
  if(WL.held&&WL.heldObj&&WL.heldObj.visible&&!(HD.cig&&HD.cig.where==='hand')){const o=WL.heldObj.position;const P=chCamPose('wallet',ctx.cam,null,null,'r',[o.x,o.y-.03,-o.z]);if(P)ctx.r=P;}}
CH_FPV.wallet=Object.assign({},CH_FPV.pack,{rate:8});
function walletStep(dt){
  // Raumwechsel: liegende (nicht vergebene) Scheine zurück, fremde weg
  const room=typeof MP!=='undefined'?MP.room||null:null;if(room!==WL.room){if(WL.room!==undefined){WL.drops.filter(d=>!d.g&&!WL.fly.includes(d)).forEach(d=>wlRefund(d,fmt(d.v)+' zurück im Portemonnaie.'));WL.others.forEach(o=>wlUnmesh(o.mesh));WL.others.clear();WL.claims=[];}WL.room=room;}
  wlFlyStep(dt);
  if((WL.tick-=dt)<=0){WL.tick=1;const t=Date.now();
    WL.drops.filter(d=>!d.g&&d.l&&t-d.t>600000).forEach(d=>wlRefund(d,'Dein Schein ('+fmt(d.v)+') ist zurück im Portemonnaie.'));
    WL.claims.slice().forEach(c=>{if(t-c.t>9000){WL.claims.splice(WL.claims.indexOf(c),1);const o=WL.others.get(c.key);if(o)o.mesh.visible=true;toast('Jemand war schneller.');wlPres();}});
    if(typeof MP!=='undefined'&&MP.avatars)WL.others.forEach((o,k)=>{if(!MP.avatars.has(o.peer)){wlUnmesh(o.mesh);WL.others.delete(k);}});}
  // Hand-Ansicht
  const vis=started&&(!focus)&&!locked&&!openId;
  if((!vis||atSlot())&&(WL.st==='in'||WL.st==='open'))walletClose();
  if(WL.held&&(!vis||atSlot())){WL.held=0;if(WL.heldObj)WL.heldObj.visible=false;hdUi();}
  if(WL.heldObj&&WL.held){const H=wlHeldPose();WL.heldT=Math.min(1,(WL.heldT||0)+dt*4);const e=1-Math.pow(1-WL.heldT,3);WL.heldObj.position.set(H.p[0],H.p[1]-.25*(1-e),H.p[2]);WL.heldObj.scale.setScalar(H.s);WL.heldObj.rotation.set(-.35,.25,-.15+Math.sin(now*1.3)*.03);}
  if(!WL.obj||WL.st==='off')return;
  if(chips!==WL.lastC){if(chips<=0){walletClose();}else wlFill();}
  WL.t+=dt;const k=Math.min(1,WL.t/.3),e=WL.st==='in'?1-Math.pow(1-k,3):WL.st==='out'?Math.pow(1-k,2):1;
  if(WL.st==='in'&&k>=1)WL.st='open';if(WL.st==='out'&&k>=1){WL.st='off';WL.obj.visible=false;hdUi();return;}
  const L=wlPlace();WL.obj.scale.setScalar(L.s);WL.obj.position.set(L.x,L.y-(1-e)*L.d*.7,-L.d);WL.obj.rotation.set(-.18,0,0);
  let hv=-1;if(WL.st==='open'&&PC){const pt=handsPointer();hv=wlPick(pt[0],pt[1]);}WL.hover=hv;
  WL.bills.forEach((b,i)=>{b.up+=((i===hv?.022:0)-b.up)*Math.min(1,dt*14);b.m.position.y=.075+b.up;});}
// Start: alte Scheine vom letzten Mal (nicht vergeben) zurück ins Portemonnaie, vergebene warten auf Bestätigung
{try{const d=JSON.parse(localStorage.getItem('nk_drops')||'[]');if(Array.isArray(d))WL.drops=d.filter(x=>x&&typeof x.i==='string'&&x.v>0);}catch(e){}
 try{const d=JSON.parse(localStorage.getItem('nk_dropdone')||'[]');if(Array.isArray(d))WL.done=d.filter(x=>typeof x==='string');}catch(e){}
 const back=WL.drops.filter(d=>!d.g);if(back.length){const s=back.reduce((a,d)=>a+d.v,0);WL.drops=WL.drops.filter(d=>d.g);dropsSave();chips+=s;try{localStorage.setItem('nk_chips',String(chips));}catch(e){}}}
