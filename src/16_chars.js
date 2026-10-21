/* =========================================================
   FIGUREN MIT SKELETT UND ECHTEN ANIMATIONEN (seit 2026-10-21)
   Körper: Quaternius-Mannequins (CC0), Animationen: Quaternius Universal Animation Library 1+2 (CC0),
   alles auf einem 65-Knochen-Skelett (assets/chars/anim.glb = Mann + 25 Clips, mannequin_f.glb = Frau).
   npc() in 11_world.js baut erst die alte Klötzchen-Figur (sofort da, Rückfall ohne Netz) und ruft chAttach();
   sobald die Dateien geladen sind, wird die Figur durch das Skelett-Modell ersetzt: n.head/n.armL/n.armR zeigen
   dann auf Knochen (Head, hand_l, hand_r), n.rig hält Mixer und Clips. animNPC() -> chAnimate() mit Überblendung.
   Eigener Körper (Ich-Perspektive): CHR.fp folgt mpLocalState() (Stehen/Gehen/Sitzen), Kopf ausgeblendet,
   Kamera hängt weich am Kopfknochen (chEye) -> Schrittgefühl aus der Lauf-Animation, Blick nach unten zeigt Beine.
   ========================================================= */
const CHR={ready:false,fail:false,clips:{},male:null,female:null,pending:[],all:[],fp:null,seedN:0,sitOff:null,eye:null,base:(window.NK_ASSET_BASE||'')};
const CH_SUITS=[0x1a1a22,0x2a1a3a,0x3a1414,0x10243a,0x1e2a1a,0x3a2a10,0x262630,0x4a1a2a,0x0e2a2a];
const chV=new THREE.Vector3(),chV2=new THREE.Vector3();
function chLoad(){
  if(typeof THREE.GLTFLoader!=='function'||typeof THREE.SkeletonUtils==='undefined'){CHR.fail=true;return;}
  const L=new THREE.GLTFLoader();const load=u=>new Promise((res,rej)=>L.load(CHR.base+u,res,undefined,rej));
  Promise.all([load('assets/chars/anim.glb'),load('assets/chars/mannequin_f.glb')]).then(([a,f])=>{
    a.animations.forEach(c=>{CHR.clips[c.name.split('|').pop()]=c;});
    CHR.male=chPrep(a.scene);CHR.female=chPrep(f.scene);CHR.ready=true;
    const p=CHR.pending;CHR.pending=[];p.forEach(([n,o])=>chAttach(n,o));
  }).catch(e=>{CHR.fail=true;console.warn('Figuren nicht geladen, Klötzchen bleiben',e);});
}
function chPrep(scene){scene.traverse(o=>{if(o.isMesh&&!o.isSkinnedMesh)o.visible=false;if(o.isSkinnedMesh){o.frustumCulled=false;o.castShadow=false;o.receiveShadow=false;}});return scene;}
// alte Figur durch Skelett-Modell ersetzen
function chAttach(n,o){
  if(CHR.fail||n.rig)return;if(!CHR.ready){CHR.pending.push([n,o]);return;}
  const fem=o.female!==undefined?!!o.female:(/IN$/.test(o.name||'')||o.hair===0xb02a5a||o.hair===0x8a1a2a);
  const model=THREE.SkeletonUtils.clone(fem?CHR.female:CHR.male);
  const col=o.color!==undefined?o.color:CH_SUITS[(++CHR.seedN)%CH_SUITS.length];
  const bones={};model.traverse(x=>{if(x.isBone)bones[x.name]=x;
    if(x.isSkinnedMesh){const ms=Array.isArray(x.material)?x.material:[x.material];
      const nm=ms.map(mt=>new THREE.MeshLambertMaterial({color:/joint/i.test(mt.name)?0x121216:col,skinning:true}));x.material=Array.isArray(x.material)?nm:nm[0];
      if(n.act){x.userData.act=n.act;if(n.F&&n.F.hits)n.F.hits.push(x);}}});
  while(n.root.children.length)n.root.remove(n.root.children[0]);
  n.root.add(model);
  const mixer=new THREE.AnimationMixer(model);
  n.rig={model,bones,mixer,cur:'',curAct:null,sit:!!o.sit,speed:.92+Math.random()*.16,fem,seatH:o.seatH||.58,tScale:1};
  n.head=bones.Head||n.head;n.neck=bones.neck_01;n.armL=bones.hand_l||n.armL;n.armR=bones.hand_r||n.armR;n.torso=bones.spine_03||n.torso;n.items=null;
  if(n.rig.sit){model.position.y=chSitOffset(n)+ (o.sitLift||0);}
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
// ---- eigener Körper in der Ich-Perspektive ----
function chFPStep(dt){
  if(CHR.fail||!CHR.ready||!started)return;
  if(!CHR.fp){const n={root:new THREE.Group(),anim:'idle',t:0,ph:0,lines:[],name:'ICH',F:null,bubbleUntil:0,bubbleEl:null,lx:P.x,lz:P.z,v:0};scene.add(n.root);chAttach(n,{color:0x2a2a36,female:false,seatH:.55});if(!n.rig)return;n.rig.hideHead=true;CHR.fp=n;}
  const n=CHR.fp,R=n.rig;if(!R)return;
  const s=typeof mpLocalState==='function'?mpLocalState():{x:P.x,z:P.z,y:P.yaw+Math.PI,a:'walk'};
  const sitting=s.a==='slot'||s.a==='poker'||s.a==='hilo'||s.a==='mtable';
  if(sitting!==R.sit){R.sit=sitting;R.model.position.y=sitting?chSitOffset(n):0;}
  n.root.position.set(s.x,0,s.z);n.root.rotation.y=s.y;
  const d=Math.hypot(s.x-n.lx,s.z-n.lz);n.lx=s.x;n.lz=s.z;const v=dt>0?d/dt:0;n.v+=(v-n.v)*Math.min(1,dt*10);
  if(sitting)n.anim=s.a;else if(s.a==='elev')n.anim='idle';else n.anim=n.v>3.2?'run':n.v>.25?'walk':'idle';
  R.tScale=n.anim==='walk'?clamp(n.v/1.35,.7,1.6):n.anim==='run'?clamp(n.v/3.4,.8,1.5):1;
  n.root.visible=!locked&&EL.phase!=='moving'&&!(openId);
  chAnimate(n,dt);n.root.updateMatrixWorld(true);
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
