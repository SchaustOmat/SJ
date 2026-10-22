/* =========================================================
   FIGUREN MIT SKELETT UND ECHTEN ANIMATIONEN (seit 2026-10-21)
   Körper: Quaternius "Universal Base Characters" (Mann/Frau mit Gesicht, Augen, Brauen, 6 Frisuren, Bart; CC0),
   Animationen: Quaternius Universal Animation Library 1+2 (CC0), alles auf einem 65-Knochen-Skelett.
   Dateien: assets/chars/chars.glb (alle Körperteile, jede Datei mit eigener Bind-Pose -> wird beim Laden an EIN Skelett gebunden),
            assets/chars/anim.glb (25 Clips + Mannequin als Rückfall).
   Kleidung: der Körper trägt nur Unterwäsche, darum malt ein kleiner Shader-Zusatz Anzug, Hose, Schuhe und Hemd
   nach Körperzonen (aus der Bind-Pose berechnetes Attribut "zone"); Farben je Figur über Uniforms (chBodyMat).
   npc() in 11_world.js baut erst die alte Klötzchen-Figur (sofort da, Rückfall ohne Netz) und ruft chAttach();
   sobald geladen, ersetzt das Skelett-Modell die Figur: n.head/n.armL/n.armR zeigen auf Knochen (Head, hand_l, hand_r),
   n.rig hält Mixer und Clips. animNPC() -> chAnimate() mit Überblendung.
   Eigener Körper (Ich-Perspektive): CHR.fp folgt mpLocalState(), Kopf ausgeblendet, Kamera weich am Kopfknochen (chEye).
   ========================================================= */
const CHR={ready:false,fail:false,clips:{},lib:null,male:null,female:null,pending:[],all:[],fp:null,seedN:0,sitOff:null,eye:null,base:(window.NK_ASSET_BASE||''),mats:{}};
const CH_SUITS=[0x1a1a22,0x2a1a3a,0x3a1414,0x10243a,0x1e2a1a,0x3a2a10,0x262630,0x4a1a2a,0x0e2a2a,0x5a4a3a,0x2a2a2a];
const CH_HAIR=[0x111111,0x2a1a10,0x4a2a14,0x7a4a20,0xb08a50,0x8a1a2a,0x3a3a3a];
const CH_HAIR_F=['Hair_Long','Hair_Buns','Hair_SimpleParted','Hair_BuzzedFemale'],CH_HAIR_M=['Hair_SimpleParted','Hair_Buzzed','Hair_Long','Hair_Buns'];
const CH_SKIN=[1.32,1.14,1.0,.82,.62]; // Hautton: Faktor auf die Hauttextur (hell … dunkel)
// ---- eigenes Aussehen (nk_look): g Körper (0 Mann, 1 Frau), h Frisur, hc Haarfarbe, s Anzug/Kleid, k Hautton, b Bart ----
function chLookClean(l){const n=(v,max)=>Math.max(0,Math.min(max-1,Math.round(+v)||0));l=l&&typeof l==='object'?l:{};return {g:l.g?1:0,h:n(l.h,4),hc:n(l.hc,CH_HAIR.length),s:n(l.s,CH_SUITS.length),k:n(l.k,CH_SKIN.length),b:l.b?1:0};}
function chLookSave(l){try{localStorage.setItem('nk_look',JSON.stringify(l));}catch(e){}}
function chLook(){if(CHR.look)return CHR.look;let l=null;try{l=JSON.parse(localStorage.getItem('nk_look')||'null');}catch(e){}
  if(!l){const r=Math.random;l={g:r()<.5?1:0,h:(r()*4)|0,hc:(r()*CH_HAIR.length)|0,s:(r()*CH_SUITS.length)|0,k:(r()*CH_SKIN.length)|0,b:0};chLookSave(l);}
  CHR.look=chLookClean(l);return CHR.look;}
function chLookOpts(l){l=chLookClean(l);const fem=l.g===1;return {female:fem,hairStyle:(fem?CH_HAIR_F:CH_HAIR_M)[l.h],hair:CH_HAIR[l.hc],color:CH_SUITS[l.s],skin:CH_SKIN[l.k],beard:!fem&&l.b===1};}
function chLookSet(key,delta){const l=chLook();const max={g:2,h:4,hc:CH_HAIR.length,s:CH_SUITS.length,k:CH_SKIN.length,b:2}[key];if(!max)return;l[key]=((l[key]+delta)%max+max)%max;chLookSave(l);CHR.look=l;
  const o=chLookOpts(l);if(CHR.fp)chRelook(CHR.fp,Object.assign({seatH:.55},o));if(CHR.mirror)chRelook(CHR.mirror,o);
  if(typeof MP!=='undefined'&&MP.room){MP.dirty=true;MP.lastSent=0;}chLookUi();}
// Figur mit neuem Aussehen neu aufbauen (Sitzen/Kopf-ausblenden bleibt)
function chRelook(n,o){if(!n)return;const sit=n.rig?n.rig.sit:!!o.sit,hide=n.rig?n.rig.hideHead:false;n.rig=null;n.items=null;chAttach(n,Object.assign({},o,{sit}));if(n.rig)n.rig.hideHead=hide;}
// Spiegel: eine Kopie der eigenen Figur 2 m vor dem Spieler, zum Spieler gedreht (solange das Figur-Fenster offen ist)
function chMirrorShow(){if(!CHR.ready||CHR.fail)return;chMirrorHide();const n={root:new THREE.Group(),anim:'idle',t:0,ph:0,lines:[],name:'',F:null,bubbleUntil:0,bubbleEl:null};
  const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw);n.root.position.set(P.x+fx*2.1,0,P.z+fz*2.1);n.root.rotation.y=P.yaw;scene.add(n.root);chAttach(n,chLookOpts(chLook()));CHR.mirror=n;document.body.classList.add('lookopen');chLookUi();}
function chMirrorHide(){if(CHR.mirror){scene.remove(CHR.mirror.root);CHR.mirror=null;}document.body.classList.remove('lookopen');}
function chLookUi(){const el=document.getElementById('pLook');if(!el||el.hidden)return;const l=chLook();
  const set=(id,t)=>{const e=document.getElementById(id);if(e&&e.textContent!==t)e.textContent=t;};
  set('lkG',l.g?'Frau':'Mann');set('lkH',['Lang','Dutt','Scheitel','Kurz'][l.g?l.h:[2,3,0,1][l.h]]||String(l.h+1));set('lkB',l.b?'Ja':'Nein');
  const sw=(id,hex)=>{const e=document.getElementById(id);if(e)e.style.background='#'+hex.toString(16).padStart(6,'0');};
  sw('lkHC',CH_HAIR[l.hc]);sw('lkS',CH_SUITS[l.s]);const k=CH_SKIN[l.k],sk=Math.round(Math.min(255,170*k));const e=document.getElementById('lkK');if(e)e.style.background='rgb('+sk+','+Math.round(sk*.72)+','+Math.round(sk*.55)+')';
  const rb=document.getElementById('lkBrow');if(rb)rb.hidden=!!l.g;}
{const el=document.getElementById('pLook');if(el)el.addEventListener('click',e=>{const b=e.target.closest('[data-lk]');if(!b)return;SFX.click();chLookSet(b.dataset.lk,+b.dataset.d||1);});}
const chV=new THREE.Vector3(),chV2=new THREE.Vector3();
function chLoad(){
  if(typeof THREE.GLTFLoader!=='function'||typeof THREE.SkeletonUtils==='undefined'){CHR.fail=true;return;}
  const L=new THREE.GLTFLoader();const load=u=>new Promise((res,rej)=>L.load(CHR.base+u,res,undefined,rej));
  load('assets/chars/anim.glb').then(a=>{
    a.animations.forEach(c=>{CHR.clips[c.name.split('|').pop()]=c;});CHR.male=chPrep(a.scene);
    return load('assets/chars/chars.glb').then(c=>{CHR.lib=chLibPrep(c.scene);}).catch(e=>{console.warn('Körper nicht geladen, Mannequin bleibt',e);});
  }).then(()=>{CHR.ready=true;const p=CHR.pending;CHR.pending=[];p.forEach(([n,o])=>chAttach(n,o));})
  .catch(e=>{CHR.fail=true;console.warn('Figuren nicht geladen, Klötzchen bleiben',e);});
}
function chPrep(scene){scene.traverse(o=>{if(o.isMesh&&!o.isSkinnedMesh)o.visible=false;if(o.isSkinnedMesh){o.frustumCulled=false;o.castShadow=false;o.receiveShadow=false;}});return scene;}
// chars.glb: alle Teile an das Skelett des Mannes binden (eigene Bind-Inverse behalten), andere Armaturen entfernen
function chLibPrep(scene){
  // Der glTF-Export hängt an doppelte Knochennamen _1, _2 … an (mehrere Armaturen in einer Datei): Namen auf die 65 Grundnamen zurückführen
  const names=new Set();if(CHR.male)CHR.male.traverse(o=>{if(o.isBone)names.add(o.name);});
  const norm=n=>names.has(n)?n:(names.has(n.replace(/_\d+$/,''))?n.replace(/_\d+$/,''):n);
  const arm=scene.getObjectByName('Arm_M');const canon={};arm.traverse(o=>{if(o.isBone){o.name=norm(o.name);canon[o.name]=o;}});
  const meshes=[];scene.traverse(o=>{if(o.isSkinnedMesh)meshes.push(o);});
  meshes.forEach(m=>{m.frustumCulled=false;m.castShadow=false;
    if(!m.skeleton.bones.every(b=>canon[norm(b.name)]===b)){const bones=m.skeleton.bones.map(b=>canon[norm(b.name)]||b);m.bind(new THREE.Skeleton(bones,m.skeleton.boneInverses.map(x=>x.clone())),m.bindMatrix);}
    if(m.parent!==arm)arm.add(m);
    m.visible=false;m.userData.part=m.name;});
  [...scene.children].forEach(c=>{if(c!==arm)scene.remove(c);});
  // Körperzonen für die Kleidung (Bind-Pose = T-Pose): 0 Haut, 1 Jacke/Kleid, 2 Hose, 3 Schuhe, 4 Hemd
  ['Body_M','Body_F'].forEach(nm=>{const m=scene.getObjectByName(nm);if(!m)return;const g=m.geometry,pos=g.attributes.position,n=pos.count;g.computeBoundingBox();const H=g.boundingBox.max.y;
    const z=new Float32Array(n);const fem=nm==='Body_F';
    for(let i=0;i<n;i++){const x=pos.getX(i),y=pos.getY(i),zz=pos.getZ(i),ax=Math.abs(x);let v=1;
      if(y>H*.875||(y>H*.845&&ax<H*.05))v=0;else if(ax>H*.41)v=0;else if(y<H*.045)v=3;else if(fem){v=y<H*.33?0:1;}else if(y<H*.53)v=2;else if(zz>H*.015&&ax<H*.036&&y>H*.63&&y<H*.85)v=4; // Kopf und Hals Haut, Hemd als V vom Kragen abwärts, Schultern Jacke
      z[i]=v;}
    g.setAttribute('zone',new THREE.BufferAttribute(z,1));});
  return scene;
}
// Körper-Material: Textur für Haut, Kleidungszonen in Figurfarben (Shader-Zusatz auf Lambert)
function chBodyMat(map,cols){
  const m=new THREE.MeshLambertMaterial({map,skinning:true});
  m.userData.pal=cols.map(c=>new THREE.Color(c));
  m.onBeforeCompile=sh=>{sh.uniforms.pal=({value:m.userData.pal});
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float zone;varying float vZone;').replace('#include <uv_vertex>','#include <uv_vertex>\nvZone=zone;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vZone;uniform vec3 pal[5];')
      .replace('#include <map_fragment>','#include <map_fragment>\n{float sh_=clamp(diffuseColor.r*1.7,.55,1.15);vec3 c=vZone<.5?diffuseColor.rgb*pal[0]:vZone<1.5?pal[1]*sh_:vZone<2.5?pal[2]*sh_:vZone<3.5?pal[3]*sh_:pal[4]*sh_;diffuseColor.rgb=c;}');};
  return m;
}
function chLamMat(src,tint){const key=src.uuid+'|'+(tint||'');if(CHR.mats[key])return CHR.mats[key];const m=new THREE.MeshLambertMaterial({map:src.map||null,color:tint!==undefined?tint:0xffffff,skinning:true,transparent:!!src.transparent,alphaTest:src.alphaTest||0});return CHR.mats[key]=m;}
// alte Figur durch Skelett-Modell ersetzen
function chAttach(n,o){
  if(CHR.fail||n.rig)return;if(!CHR.ready){CHR.pending.push([n,o]);return;}
  CHR.seedN++;const seed=CHR.seedN;
  const fem=o.female!==undefined?!!o.female:(/IN$/.test(o.name||'')||o.hair===0xb02a5a||o.hair===0x8a1a2a||(o.name==='GAST'&&seed%2===1));
  const col=o.color!==undefined?o.color:CH_SUITS[seed%CH_SUITS.length];
  let model;const bones={};
  if(CHR.lib){
    model=THREE.SkeletonUtils.clone(CHR.lib);model.traverse(x=>{if(x.isBone)bones[x.name]=x;});
    const hairName=o.hairStyle||(fem?CH_HAIR_F[seed%CH_HAIR_F.length]:CH_HAIR_M[seed%2]);const beard=o.beard!==undefined?!!o.beard:(!fem&&(seed%3===0));const skin=o.skin||CH_SKIN[(seed*5+1)%CH_SKIN.length];
    const hairCol=o.hair!==undefined?o.hair:CH_HAIR[(seed*7+3)%CH_HAIR.length];
    const shirt=0xf0ece4,shoes=0x151214,trousers=o.pants||col;
    const sk=new THREE.Color(skin,skin,skin);const pal=fem?[sk,col,col,shoes,shirt]:[sk,col,trousers,shoes,shirt];
    model.traverse(x=>{if(!x.isSkinnedMesh)return;const nm=x.name;const bodyOf=fem?'F':'M';
      const show=nm==='Body_'+bodyOf||nm==='Eyes_'+bodyOf||nm==='Eyes_'+bodyOf+'.001'||nm==='Brows_'+bodyOf||nm===hairName||(beard&&nm==='Hair_Beard');
      x.visible=show;if(!show)return;
      const src=Array.isArray(x.material)?x.material[0]:x.material;
      if(nm.startsWith('Body_'))x.material=chBodyMat(src.map,pal);
      else if(nm.startsWith('Hair_'))x.material=chLamMat(src,hairCol);
      else x.material=chLamMat(src);
      if(n.act){x.userData.act=n.act;if(n.F&&n.F.hits)n.F.hits.push(x);}});
  }else{ // Rückfall: Mannequin aus anim.glb
    model=THREE.SkeletonUtils.clone(CHR.male);model.traverse(x=>{if(x.isBone)bones[x.name]=x;
      if(x.isSkinnedMesh){const ms=Array.isArray(x.material)?x.material:[x.material];const nm=ms.map(mt=>new THREE.MeshLambertMaterial({color:/joint/i.test(mt.name)?0x121216:col,skinning:true}));x.material=Array.isArray(x.material)?nm:nm[0];
        if(n.act){x.userData.act=n.act;if(n.F&&n.F.hits)n.F.hits.push(x);}}});
  }
  while(n.root.children.length)n.root.remove(n.root.children[0]);
  n.root.add(model);
  const mixer=new THREE.AnimationMixer(model);
  n.rig={model,bones,mixer,cur:'',curAct:null,sit:!!o.sit,speed:.92+Math.random()*.16,fem,seatH:o.seatH||.58,tScale:1};
  n.head=bones.Head||n.head;n.neck=bones.neck_01;n.armL=bones.hand_l||n.armL;n.armR=bones.hand_r||n.armR;n.torso=bones.spine_03||n.torso;n.items=null;
  if(n.rig.sit){model.position.y=chSitOffset(n)+(o.sitLift||0);}
  CHR.all.push(n);
}
// Sitz-Clip: wie hoch sitzt das Becken? Figur so anheben, dass es auf der Hockerhöhe liegt
function chSitOffset(n){
  if(CHR.sitOff===null){const R=n.rig;const a=R.mixer.clipAction(CHR.clips.Sitting_Idle_Loop);a.play();R.mixer.update(0);R.model.updateMatrixWorld(true);
    const py=R.bones.pelvis.getWorldPosition(chV).y-n.root.getWorldPosition(chV2).y-R.model.position.y;CHR.sitOff=py;a.stop();R.mixer.uncacheAction(CHR.clips.Sitting_Idle_Loop);}
  return Math.max(0,n.rig.seatH-CHR.sitOff);
}
// Welcher Clip passt zum Zustand der Figur?
function chClipFor(n){
  const a=n.anim,sit=n.rig.sit,ph=n.ph||0;
  switch(a){
    case 'walk':return 'Walk_Loop';case 'run':return 'Jog_Fwd_Loop';case 'sprint':return 'Sprint_Loop';
    case 'dance':return 'Dance_Loop';case 'cheer':return 'Yes';case 'watch':return 'Idle_FoldArms_Loop';
    case 'dealer':return 'Idle_Talking_Loop';case 'bar':return 'Idle_Rail_Loop';
    case 'drink':return sit?'Sitting_Idle_Loop':'Consume';
    case 'cards':return ((n.t+ph)%14)<4?'Sitting_Talking_Loop':'Sitting_Idle_Loop';
    case 'slot':case 'poker':case 'hilo':case 'mtable':case 'folded':return 'Sitting_Idle_Loop';
    case 'talk':return sit?'Sitting_Talking_Loop':'Idle_Talking_Loop';
    default:return sit?'Sitting_Idle_Loop':(n.bubbleUntil>now?'Idle_Talking_Loop':'Idle_Loop');
  }
}
function chPlay(n,name,fade){
  const R=n.rig;if(R.cur===name)return;const clip=CHR.clips[name];if(!clip)return;
  const act=R.mixer.clipAction(clip);act.reset();act.enabled=true;act.setEffectiveWeight(1);act.setLoop(THREE.LoopRepeat,Infinity);
  if(R.curAct){act.crossFadeFrom(R.curAct,fade===undefined?.3:fade,false);}else{act.time=Math.random()*clip.duration;}
  act.play();R.curAct=act;R.cur=name;
}
function chAnimate(n,dt){
  n.t+=dt;const R=n.rig;const want=chClipFor(n);chPlay(n,want);
  R.mixer.update(dt*R.speed*(R.tScale||1));
  if(R.hideHead){R.bones.Head.scale.setScalar(.001);}
}
// ---- Arm-Steuerung (zwei Knochen: Oberarm, Unterarm; Ziel = Handgelenk in Weltkoordinaten) ----
const ikI=new THREE.Quaternion(),ikA=new THREE.Vector3(),ikB=new THREE.Vector3(),ikQ=new THREE.Quaternion(),ikQ2=new THREE.Quaternion(),ikQ3=new THREE.Quaternion();
function boneAim(bone,fromW,toW,w){ // dreht den Knochen in der Welt so, dass Richtung fromW zu toW wird (Anteil w)
  const cur=ikA.copy(fromW).normalize(),des=ikB.copy(toW).normalize();if(cur.lengthSq()<1e-8||des.lengthSq()<1e-8)return;
  ikQ.setFromUnitVectors(cur,des);if(w<1)ikQ.slerp(ikI,1-w);
  const pq=bone.parent.getWorldQuaternion(ikQ2);const lq=ikQ3.copy(pq).invert().multiply(ikQ).multiply(pq);bone.quaternion.premultiply(lq);bone.updateMatrixWorld(true);
}
const ikC=new THREE.Vector3();
// three.js schreibt einen Knochen nur neu, wenn sich der Animationswert ändert; bei ruhigen Posen bliebe unsere Drehung
// sonst stehen und würde sich Bild für Bild aufsummieren -> Ausgangswert merken und vor jeder Änderung zurücksetzen
const CH_IKBONES=['spine_01','spine_02','neck_01','upperarm_r','lowerarm_r','hand_r','upperarm_l','lowerarm_l','hand_l'];
function chBoneBase(bone){const u=bone.userData;if(!u.q0){u.q0=new THREE.Quaternion();u.q1=new THREE.Quaternion();u.qset=false;}
  if(u.qset&&bone.quaternion.equals(u.q1))bone.quaternion.copy(u.q0);u.q0.copy(bone.quaternion);}
function chBoneDone(bone){const u=bone.userData;u.q1.copy(bone.quaternion);u.qset=true;}
function boneRotWorld(bone,axis,angle){ // dreht den Knochen um eine Welt-Achse
  if(!bone||!angle)return;ikQ.setFromAxisAngle(ikC.copy(axis).normalize(),angle);const pq=bone.parent.getWorldQuaternion(ikQ2);const lq=ikQ3.copy(pq).invert().multiply(ikQ).multiply(pq);bone.quaternion.premultiply(lq);bone.updateMatrixWorld(true);
}
function chArmIK(n,side,target,w,pole){
  const B=n.rig.bones,up=B['upperarm_'+side],lo=B['lowerarm_'+side],ha=B['hand_'+side];if(!up||!lo||!ha||w<=0)return;
  const S=up.getWorldPosition(new THREE.Vector3()),E=lo.getWorldPosition(new THREE.Vector3()),W=ha.getWorldPosition(new THREE.Vector3());
  const L1=S.distanceTo(E),L2=E.distanceTo(W);const toT=target.clone().sub(S);let d=toT.length();const dmax=(L1+L2)*.985;if(d>dmax){toT.multiplyScalar(dmax/d);d=dmax;}if(d<.02)return;
  const cosA=Math.max(-1,Math.min(1,(L1*L1+d*d-L2*L2)/(2*L1*d))),a=Math.acos(cosA);
  const dir=toT.clone().normalize();const pv=(pole?pole.clone():new THREE.Vector3(0,-1,0));pv.sub(dir.clone().multiplyScalar(pv.dot(dir)));if(pv.lengthSq()<1e-6){pv.set(0,-1,0);pv.sub(dir.clone().multiplyScalar(pv.dot(dir)));}if(pv.lengthSq()<1e-6)return;pv.normalize();
  const Edes=S.clone().add(dir.clone().multiplyScalar(Math.cos(a)*L1)).add(pv.multiplyScalar(Math.sin(a)*L1));
  boneAim(up,E.clone().sub(S),Edes.sub(S),w);
  const E2=lo.getWorldPosition(new THREE.Vector3()),W2=ha.getWorldPosition(new THREE.Vector3());
  boneAim(lo,W2.sub(E2),S.clone().add(toT).sub(E2),w);
}
CHR.press=null;
// Taste am Automaten gedrückt (von pressButton): die passende Hand geht zur Taste (sitzend immer, stehend bis 1,7 m)
function chPress(m,key){if(!CHR.fp||!CHR.fp.rig||!m||!m.btns)return;const near=(focus&&focus.m===m)||Math.hypot(m.group.position.x-P.x,m.group.position.z-P.z)<1.7;if(!near)return;
  const k=key==='KARTE'?'RISIKO':key;CHR.press={m,key:m.btns[k]?k:'START',side:chBtnSide(k),t:0};}
function chBtnSide(k){return /INFO|LINIEN|EINSATZ|AUTO/.test(k)?'l':'r';}
function chBtnPos(m,key,out){const b=m&&m.btns&&(m.btns[key]||m.btns.START);if(!b||!b.mesh)return null;return b.mesh.getWorldPosition(out);}
// Handgelenk-Ziel über einer Taste: etwas zum Spieler hin und darüber, damit die Finger auf der Taste liegen (k=1: gedrückt)
function chBtnWrist(m,key,fx,fz,k){const b=chBtnPos(m,key,new THREE.Vector3());if(!b)return null;b.x-=fx*.085;b.z-=fz*.085;b.y+=.075-.04*(k||0);return b;}
// Handposen (Welt): Handgelenk p, Fingerrichtung fd, Handflächenrichtung pal; pt(vor,rechts,unter) ab Auge/Kopf, f/r = vorn/rechts
function chHandPose(kind,pt,f,r,mouth){
  const v=(a,b,c)=>new THREE.Vector3(f.x*a+r.x*b,c,f.z*a+r.z*b).normalize(); // a=vor, b=rechts, c=hoch
  switch(kind){
    case 'cig':return {p:pt(.3,.2,.3),fd:v(.45,.1,-.85),pal:v(-.6,-.6,-.3)}; // Kippe locker vor dem Bauch, Glut nach vorn-außen
    case 'cigMouth':{const p=pt(.12,.07,.17);return {p,fd:v(.15,-.9,.35),pal:mouth.clone().sub(p)};} // Handfläche zum Mund, Finger quer unter dem Gesicht
    case 'cigAsh':return {p:pt(.31,.23,.38),fd:v(.7,.2,-.65),pal:v(-.3,-.5,-.8)};
    case 'glass':return {p:pt(.28,-.2,.33),fd:v(.8,.2,-.3),pal:v(-.4,.85,0)}; // Glas vor dem Bauch, Handfläche zur Mitte
    case 'glassSip':{const fd=v(.6,.2,.5),pal=v(-.5,.8,0);const g=mouth.clone().addScaledVector(new THREE.Vector3(f.x,0,f.z),.05).add(new THREE.Vector3(0,-.04,0));return {p:g.addScaledVector(fd,-.055).addScaledVector(pal,-.035),fd,pal};} // Glasboden etwas vor und unter dem Mund, Rand kippt an die Lippen
  }return null;
}
// Ziele für beide Hände je nach Lage, dann IK mit weicher Gewichtung (auch für Mitspieler-Figuren)
function chArmsStep(n,dt,ctx){
  const ik=n.ik||(n.ik={r:{w:0,cur:new THREE.Vector3(),has:false},l:{w:0,cur:new THREE.Vector3(),has:false},lean:0});
  const B=n.rig.bones;CH_IKBONES.forEach(k=>{if(B[k])chBoneBase(B[k]);});n.root.updateMatrixWorld(true);
  ik.lean=(ik.lean||0)+((ctx.lean||0)-(ik.lean||0))*Math.min(1,dt*5);
  if(ik.lean>.001){const ax=new THREE.Vector3(ctx.rx,0,ctx.rz);boneRotWorld(B.spine_01,ax,-ik.lean*.26);boneRotWorld(B.spine_02,ax,-ik.lean*.34);boneRotWorld(B.neck_01,ax,ik.lean*.4);} // vorbeugen zum Pult, Kopf bleibt am Bildschirm
  const want={r:ctx.r||null,l:ctx.l||null};
  if(ctx.press){const p=ctx.press;p.t+=dt;const k=p.t<.1?p.t/.1:p.t<.28?1:Math.max(0,1-(p.t-.28)/.17);const b=chBtnWrist(p.m,p.key,ctx.fx,ctx.fz,k);if(b)want[p.side]={p:b,fd:new THREE.Vector3(ctx.fx*.8,-.6,ctx.fz*.8),pal:new THREE.Vector3(0,-1,0)};}
  ['r','l'].forEach(sd=>{const K=ik[sd],tgt=want[sd];
    if(tgt){if(!K.has){K.cur.copy(tgt.p);K.has=true;}else K.cur.lerp(tgt.p,Math.min(1,dt*(ctx.fast?18:10)));K.w=Math.min(1,K.w+dt*4);K.fd=tgt.fd||null;K.pal=tgt.pal||null;}
    else{K.w=Math.max(0,K.w-dt*4);if(K.w<=0)K.has=false;}
    if(K.w>0&&K.has){const o=sd==='r'?.45:-.45;const pole=new THREE.Vector3(ctx.rx*o,-1,ctx.rz*o);chArmIK(n,sd,K.cur,K.w,pole); // Ellbogen eher unten als seitlich
      const hb=B['hand_'+sd],mid=B['middle_01_'+sd],th=B['thumb_01_'+sd];
      if(hb&&mid&&K.fd){const hp=hb.getWorldPosition(new THREE.Vector3()),mp=mid.getWorldPosition(new THREE.Vector3());boneAim(hb,mp.sub(hp),K.fd,K.w);} // Finger in Zielrichtung
      if(hb&&mid&&th&&K.pal){ // Handfläche: um die Fingerachse drehen, bis sie in die gewünschte Richtung zeigt
        const hp=hb.getWorldPosition(new THREE.Vector3()),fw=mid.getWorldPosition(new THREE.Vector3()).sub(hp).normalize(),tw=th.getWorldPosition(new THREE.Vector3()).sub(hp).normalize();
        const cur=sd==='r'?new THREE.Vector3().crossVectors(fw,tw):new THREE.Vector3().crossVectors(tw,fw); // aus der Handfläche heraus
        const pc=cur.sub(fw.clone().multiplyScalar(cur.dot(fw))),pd=K.pal.clone().sub(fw.clone().multiplyScalar(K.pal.dot(fw)));
        if(pc.lengthSq()>1e-6&&pd.lengthSq()>1e-6){pc.normalize();pd.normalize();const ang=Math.atan2(new THREE.Vector3().crossVectors(pc,pd).dot(fw),pc.dot(pd));boneRotWorld(hb,fw,ang*K.w);}}}});
  CH_IKBONES.forEach(k=>{if(B[k])chBoneDone(B[k]);});
}
// ---- eigener Körper in der Ich-Perspektive ----
function chFPStep(dt){
  if(CHR.fail||!CHR.ready||!started)return;
  if(!CHR.fp){const n={root:new THREE.Group(),anim:'idle',t:0,ph:0,lines:[],name:'ICH',F:null,bubbleUntil:0,bubbleEl:null,lx:P.x,lz:P.z,v:0};scene.add(n.root);chAttach(n,Object.assign({seatH:.55},chLookOpts(chLook())));if(!n.rig)return;n.rig.hideHead=true;CHR.fp=n;}
  if(CHR.mirror&&CHR.mirror.rig)chAnimate(CHR.mirror,dt);
  const n=CHR.fp,R=n.rig;if(!R)return;
  const s=typeof mpLocalState==='function'?mpLocalState():{x:P.x,z:P.z,y:P.yaw+Math.PI,a:'walk'};
  const sitting=s.a==='slot'||s.a==='poker'||s.a==='hilo'||s.a==='mtable';
  if(sitting!==R.sit){R.sit=sitting;R.model.position.y=sitting?chSitOffset(n):0;}
  const lean=s.a==='slot'&&n.ik?n.ik.lean||0:0;n.root.position.set(s.x+Math.sin(s.y)*.18*lean,0,s.z+Math.cos(s.y)*.18*lean);n.root.rotation.y=s.y; // am Automaten etwas vorrücken (Hände ans Pult)
  const d=Math.hypot(s.x-n.lx,s.z-n.lz);n.lx=s.x;n.lz=s.z;const v=dt>0?d/dt:0;n.v+=(v-n.v)*Math.min(1,dt*10);
  if(sitting)n.anim=s.a;else if(s.a==='elev')n.anim='idle';else n.anim=n.v>4.6?'sprint':n.v>2.3?'run':n.v>.25?'walk':'idle';
  R.tScale=n.anim==='walk'?clamp(n.v/1.5,.6,1.7):n.anim==='run'?clamp(n.v/3.2,.75,1.5):n.anim==='sprint'?clamp(n.v/6,.8,1.3):1;
  n.root.visible=!locked&&EL.phase!=='moving'&&!(openId);
  chAnimate(n,dt);n.root.updateMatrixWorld(true);
  chFPArms(n,dt,s,sitting);
}
// Hände des eigenen Körpers: am Pult, an Tasten, mit Kippe oder Glas
function chFPArms(n,dt,s,sitting){
  const slotM=sitting&&s.a==='slot'&&typeof focus!=='undefined'&&focus&&focus.m?focus.m:null;
  const eye=camera.position;const f=chV.set(0,0,-1).applyQuaternion(camera.quaternion);f.y=0;if(f.lengthSq()<1e-6)f.set(-Math.sin(P.yaw),0,-Math.cos(P.yaw));f.normalize();
  if(slotM)f.set(Math.sin(s.y),0,Math.cos(s.y)); // am Automaten zählt die Sitzrichtung (Kamera fährt erst noch hin)
  const fx=f.x,fz=f.z,rx=-fz,rz=fx;const r=new THREE.Vector3(rx,0,rz); // rechts = vorn x oben
  const pt=(fw,ri,d)=>new THREE.Vector3(eye.x+fx*fw+rx*ri,eye.y-d,eye.z+fz*fw+rz*ri);const ctx={fx,fz,rx,rz,r:null,l:null,press:null,fast:false};
  const dn=new THREE.Vector3(fx*.8,-.6,fz*.8),down=new THREE.Vector3(0,-1,0); // Finger nach vorn-unten, Handfläche aufs Pult
  if(slotM){ctx.lean=1;const pr=chBtnWrist(slotM,'START',fx,fz,0),pl=chBtnWrist(slotM,'EINSATZ',fx,fz,0);if(pr)ctx.r={p:pr,fd:dn,pal:down};if(pl)ctx.l={p:pl,fd:dn,pal:down};}
  if(typeof HD!=='undefined'){const C=HD.cig;const mouth=pt(.07,0,.1);
    if(C&&C.where==='hand'){const st=HD.seq.length?HD.seq[0].to:'hand';ctx.r=chHandPose(st==='handMouth'?'cigMouth':st==='handAsh'?'cigAsh':'cig',pt,f,r,mouth);ctx.fast=st==='handAsh';}
    if(HD.drink){const st=HD.gq&&HD.gq.length?HD.gq[0].to:'glass';
      if(st==='glassSip')ctx.l=chHandPose('glassSip',pt,f,r,mouth);
      else if(slotM){const b=chBtnWrist(slotM,'EINSATZ',fx,fz,0);if(b){b.y+=.06;ctx.l={p:b,fd:new THREE.Vector3(fx*.8-rx*.2,-.3,fz*.8-rz*.2).normalize(),pal:new THREE.Vector3(-fx*.4+rx*.85,0,-fz*.4+rz*.85).normalize()};}}
      else ctx.l=chHandPose('glass',pt,f,r,mouth);}}
  if(CHR.press){ctx.press=CHR.press;if(CHR.press.t>.45)CHR.press=null;}
  if(ctx.r||ctx.l||ctx.press||ctx.lean||(n.ik&&(n.ik.r.w>0||n.ik.l.w>0||n.ik.lean>.001)))chArmsStep(n,dt,ctx);
}
// Mitspieler: Arm zum Mund beim Ziehen oder Schluck, Hand an der Starttaste beim neuen Dreh, am Automaten Hände aufs Pult
function chAvatarArms(a,dt){
  const n=a.n;if(!n||!n.rig||!n.root.visible)return;const it=a.it;
  const slot=a.mirror&&n.rig.sit&&a.mirror.btns?a.mirror:null;const L=n.ik?n.ik.lean||0:0;n.root.position.z=slot||L>.001?.18*L:0;
  if(!slot&&!(it&&(it.c===2||it.d))&&!a.press&&!(n.ik&&(n.ik.r.w>0||n.ik.l.w>0||n.ik.lean>.001)))return;
  n.root.updateMatrixWorld(true);const f=chV.set(0,0,1).applyQuaternion(n.root.getWorldQuaternion(ikQ2));f.y=0;if(f.lengthSq()<1e-6)return;f.normalize();
  const fx=f.x,fz=f.z,rx=-fz,rz=fx;const r=new THREE.Vector3(rx,0,rz);const ctx={fx,fz,rx,rz,r:null,l:null,press:null,fast:false};const H=n.head.getWorldPosition(new THREE.Vector3());
  const pt=(fw,ri,d)=>new THREE.Vector3(H.x+fx*fw+rx*ri,H.y-d,H.z+fz*fw+rz*ri);
  const dn=new THREE.Vector3(fx*.8,-.6,fz*.8),down=new THREE.Vector3(0,-1,0),mouth=pt(.1,0,-.04);
  if(slot){ctx.lean=1;const pr=chBtnWrist(slot,'START',fx,fz,0),pl=chBtnWrist(slot,'EINSATZ',fx,fz,0);if(pr)ctx.r={p:pr,fd:dn,pal:down};if(pl)ctx.l={p:pl,fd:dn,pal:down};}
  if(it&&it.c===2)ctx.r=chHandPose((a.itDrag&&now-a.itDrag<1.3)?'cigMouth':'cig',pt,f.clone(),r,mouth);
  if(it&&it.d)ctx.l=chHandPose((a.itSip&&now-a.itSip<1.2)?'glassSip':'glass',pt,f.clone(),r,mouth);
  if(a.press){ctx.press=a.press;if(a.press.t>.45)a.press=null;}
  chArmsStep(n,dt,ctx);
}
// Kamera weich am Kopfknochen: v wird gefüllt, true wenn verfügbar (nur beim Gehen/Stehen, nicht im Spiel-Fokus)
function chEye(v){
  const n=CHR.fp;if(!n||!n.rig||!n.root.visible||n.rig.sit)return false;
  const h=n.rig.bones.Head.getWorldPosition(chV);const r=n.root.position;const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw);
  // Auge ein Stück vor dem Kopfknochen (Gesicht), sonst sieht man Schultern und Hals von innen; seitliches Wiegen nur halb
  const tx=P.x+(h.x-r.x)*.5+fx*.13,tz=P.z+(h.z-r.z)*.5+fz*.13,ty=1.6*.35+(h.y+.06)*.65;
  if(!CHR.eye)CHR.eye=new THREE.Vector3(tx,ty,tz);else{const k=Math.min(1,.2);CHR.eye.x+=(tx-CHR.eye.x)*k;CHR.eye.y+=(ty-CHR.eye.y)*k;CHR.eye.z+=(tz-CHR.eye.z)*k;}
  if(Math.hypot(CHR.eye.x-P.x,CHR.eye.z-P.z)>.5){CHR.eye.set(tx,ty,tz);}
  v.copy(CHR.eye);return true;
}
chLoad();
