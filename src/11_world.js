/* ---------- world helpers ---------- */
const floors=[];
function makeFloor(name){const F={name,group:new THREE.Group(),cols:[],hits:[],acts:[],npcs:[],machines:[],roulettes:[],lights:[],speakers:[],doors:null,hallInd:null};scene.add(F.group);floors.push(F);return F;}
const globalHits=[],globalActs=[],globalCols=[];
function mesh(geo,mat,x,y,z,parent){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m;}
function box(w,h,d,mat,x,y,z,parent){return mesh(new THREE.BoxGeometry(w,h,d),mat,x,y,z,parent);}
function col(F,x,z,w,d){(F?F.cols:globalCols).push({x,z,w,d});}
function blocker(F,m){m.userData.block=true;(F?F.hits:globalHits).push(m);}
function tagAct(F,obj,act){obj.traverse(m=>{if(m.isMesh){m.userData.act=act;(F?F.hits:globalHits).push(m);}});if(act.pos)(F?F.acts:globalActs).push(act);}
function faceTo(x,z,cx,cz){return Math.atan2(cx-x,cz-z);}
function planeUV(w,h,sx,sy,tw,th,oy){const g=new THREE.PlaneGeometry(w,h,sx||1,sy||1);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/tw,(uv.getY(i)*h+(oy||0))/th);return g;}

function signTex(text,color,bg){
  // edles Schild: dunkles Holz, doppelter Goldrahmen, Goldschrift in Cinzel (hoch aufgelöst)
  const S=4,fs=17*S,c0=document.createElement('canvas').getContext('2d');c0.font='700 '+fs+'px Cinzel, Georgia, serif';
  const cw=Math.ceil(c0.measureText(text).width/S+28)*S;
  return canvasTex(cw,32*S,(g,w,h)=>{const bg2=g.createLinearGradient(0,0,0,h);bg2.addColorStop(0,'#2a1608');bg2.addColorStop(1,'#120804');g.fillStyle=bg2;g.fillRect(0,0,w,h);
    g.strokeStyle='#d4a849';g.lineWidth=2*S;g.strokeRect(S*2,S*2,w-S*4,h-S*4);g.strokeStyle='rgba(212,168,73,.45)';g.lineWidth=S*.8;g.strokeRect(S*5,S*5,w-S*10,h-S*10);
    g.font='700 '+fs+'px Cinzel, Georgia, serif';g.textAlign='center';g.textBaseline='middle';
    const gr=g.createLinearGradient(0,h*.2,0,h*.8);gr.addColorStop(0,'#fff4d0');gr.addColorStop(.5,'#e8c060');gr.addColorStop(1,'#9a6a18');
    g.shadowColor='rgba(232,192,96,.6)';g.shadowBlur=6*S;g.fillStyle=gr;g.fillText(text,w/2,h/2+S);g.shadowBlur=0;},null,null,true);
}
function sign(F,text,color,x,y,z,rotY,h){
  h=h||.55;const t=signTex(text,color);const w=h*t.image.width/t.image.height;
  const m=mesh(new THREE.PlaneGeometry(w,h),bas({map:t,side:THREE.DoubleSide}),x,y,z,F.group);m.rotation.y=rotY||0;(F.signs||(F.signs=[])).push(m);return m;
}
function decal(F,tex,w,h,x,y,z,rotY){const m=mesh(new THREE.PlaneGeometry(w,h),lam({map:tex,transparent:true,alphaTest:.5}),x,y,z,F.group);m.rotation.y=rotY;return m;}
function pointLight(F,color,x,y,z,int,dist,flicker){const l=new THREE.PointLight(color,int,dist,1.4);l.position.set(x,y,z);(F?F.group:scene).add(l);if(F)F.lights.push({l,base:int,flicker:!!flicker});return l;}

const DOOR_X=6,DOOR_W=1.8,DOOR_H=2.7;
function buildRoom(F,th){
  const g=F.group;
  const fl=mesh(new THREE.PlaneGeometry(24,24,24,24),lam({map:th.floor}),0,0,0,g);fl.rotation.x=-Math.PI/2;fl.userData.floor=true;F.hits.push(fl);
  const ce=mesh(new THREE.PlaneGeometry(24,24,12,12),lam({map:th.ceil}),0,4,0,g);ce.rotation.x=Math.PI/2;
  const wm=lam({map:th.wall});
  [[0,12,Math.PI],[-12,0,Math.PI/2],[12,0,-Math.PI/2]].forEach(([x,z,r])=>{const w=mesh(planeUV(24,4,24,4,2,4),wm,x,2,z,g);if(x)w.position.set(x,2,0);else w.position.set(0,2,z);w.rotation.y=r;blocker(F,w);});
  // north wall with elevator opening
  const L=DOOR_X-DOOR_W/2,R=DOOR_X+DOOR_W/2;
  const nl=mesh(planeUV(L+12,4,18,4,2,4),wm,(-12+L)/2,2,-12,g);blocker(F,nl);
  const nr=mesh(planeUV(12-R,4,5,4,2,4),wm,(R+12)/2,2,-12,g);blocker(F,nr);
  const nt=mesh(planeUV(DOOR_W,4-DOOR_H,2,1,2,4,DOOR_H),wm,DOOR_X,(4+DOOR_H)/2,-12,g);blocker(F,nt);
  col(F,0,12.5,26,1);col(F,-12.5,0,1,26);col(F,12.5,0,1,26);
  col(F,(-13+L)/2,-12.5,L+13,1);col(F,(R+13)/2,-12.5,13-R,1);
  const nb=bas({color:th.strip});
  box(24,.06,.04,nb,0,.12,11.97,g);box(.04,.06,24,nb,-11.97,.12,0,g);box(.04,.06,24,nb,11.97,.12,0,g);
  box(L+12-.5,.06,.04,nb,(-12+L-.5)/2,.12,-11.97,g);box(12-R-.6,.06,.04,nb,(R+.6+12)/2,.12,-11.97,g);
  if(th.lux){// goldene Deckenleiste statt Rohren
    const gm=lam({color:0xc8962a,emissive:0x2a1800});box(24,.1,.08,gm,0,3.95,11.95,g);box(.08,.1,24,gm,-11.95,3.95,0,g);box(.08,.1,24,gm,11.95,3.95,0,g);box(24,.1,.08,gm,0,3.95,-11.95,g);return;}
  const pm=lam({map:T.metal,color:0x8a8a9a});
  [-8,-1,7].forEach(z=>{const p=mesh(new THREE.CylinderGeometry(.08,.08,24,6),pm,0,3.78,z,g);p.rotation.z=Math.PI/2;});
  [-9,9].forEach(x=>{const p=mesh(new THREE.CylinderGeometry(.11,.11,24,6),pm,x,3.74,0,g);p.rotation.x=Math.PI/2;});
}
function pillar(F,x,z,mat,ring){const p=box(.7,4,.7,mat,x,2,z,F.group);blocker(F,p);col(F,x,z,.75,.75);if(ring){box(.74,.08,.74,bas({color:ring}),x,2.6,z,F.group);}}

/* ---------- roulette table ---------- */
function buildRoulette(F,x,z,label){
  const g=new THREE.Group();g.position.set(x,0,z);F.group.add(g);
  const wood=lam({map:T.wood}),felt=lam({map:T.felt}),dark=lam({color:0x14101a});
  mesh(new THREE.BoxGeometry(3.6,.14,2),[wood,wood,felt,wood,wood,wood],0,.86,0,g);
  box(3.8,.12,.14,wood,0,.97,1.05,g);box(3.8,.12,.14,wood,0,.97,-1.05,g);box(.14,.12,2.24,wood,1.87,.97,0,g);box(.14,.12,2.24,wood,-1.87,.97,0,g);
  box(2.8,.8,1.3,dark,0,.4,0,g);
  mesh(new THREE.CylinderGeometry(.66,.6,.12,16),wood,-1.15,.98,0,g);
  const wheel=new THREE.Group();wheel.position.set(-1.15,1.05,0);g.add(wheel);
  const metal=lam({map:T.metal});
  mesh(new THREE.CylinderGeometry(.54,.54,.05,24),[metal,lam({map:T.wheel}),metal],0,0,0,wheel);
  mesh(new THREE.ConeGeometry(.1,.16,6),lam({color:0xc8b070}),0,.09,0,wheel);
  const cm=[0x3a6ad6,0xc42a3a,0x1a1a1a,0x2a9a5a];
  for(let i=0;i<5;i++){const s=1+(i*7%4);mesh(new THREE.CylinderGeometry(.07,.07,.03*s,8),lam({color:cm[i%4]}),.3+i*.32,.93+.015*s,(i%2?.35:-.3),g);}
  box(2.6,.1,.7,bas({color:0xffd38a}),0,3.1,0,g);
  const act={type:'roulette',id:F.roulettes.length,label:'ROULETTE',sub:'Tippen zum Spielen',pos:new THREE.Vector3(x,1,z),reach:3.1,title:label};
  F.roulettes.push({wheel,spin:false});
  tagAct(F,g,act);col(F,x,z,3.95,2.35);
}
function buildBar(F){
  // edle Bar: dunkle Holztheke mit Feldern und Goldkante, warmes Licht, beleuchtete Spiegelwand, echte Flaschen
  const g=F.group,wood=lam({map:T.wood}),darkWood=lam({map:T.wood,color:0x6a4a3a}),gold=lam({color:0xd6a02a,emissive:0x3a2400});
  const c=box(.9,1.1,8.4,darkWood,9.8,.55,-1,g);blocker(F,c);
  for(let i=0;i<7;i++){box(.02,.7,1,lam({map:T.wood,color:0x8a6248}),9.34,.55,-4.6+i*1.2,g);box(.025,.72,.02,gold,9.335,.55,-5.1+i*1.2,g);}
  box(1.05,.08,8.6,wood,9.8,1.14,-1,g);box(1.07,.02,8.62,gold,9.8,1.1,-1,g);
  box(.04,.03,8.4,bas({color:0xffc060}),9.33,.06,-1,g); // warmes Licht am Fuß der Theke
  box(.35,2.4,8.8,darkWood,11.78,1.6,-1,g);
  const mirror=lam({color:0x3a3640,emissive:0x2a1a0a});box(.02,1.9,8.2,mirror,11.6,1.85,-1,g);
  box(.03,.05,8.4,bas({color:0xffcf7a}),11.58,2.82,-1,g);
  const glassC=[0x8a4a10,0x1a4a20,0xd8e4e4,0x3a1a0a,0x2a5a8a,0xc8a040,0x6a0a1a];
  const bMat=glassC.map(cc=>lam({color:cc,emissive:new THREE.Color(cc).multiplyScalar(.35),transparent:true,opacity:.88}));
  const capM=lam({color:0xc8a040,emissive:0x2a1800}),label=lam({color:0xf0e6d0});
  const bodyG=PGEO('bt1',()=>new THREE.CylinderGeometry(.042,.042,.2,12)),shG=PGEO('bt2',()=>new THREE.SphereGeometry(.042,12,6,0,TAU,0,Math.PI/2)),
    neckG=PGEO('bt3',()=>new THREE.CylinderGeometry(.013,.016,.1,8)),capG=PGEO('bt4',()=>new THREE.CylinderGeometry(.016,.016,.025,8)),labG=PGEO('bt5',()=>new THREE.CylinderGeometry(.0435,.0435,.07,12,1,true,-.9,1.8));
  const shelf=new THREE.Group();g.add(shelf);
  for(let s=0;s<3;s++){const y=1.3+s*.6;box(.4,.03,8.6,lam({color:0x8a7a6a,emissive:0x1a1208}),11.6,y,-1,g);box(.41,.012,8.6,gold,11.6,y+.018,-1,g);
    for(let i=0;i<22;i++){if(rnd()<.2)continue;const z=-5.1+i*.39+(rnd()-.5)*.06,k=(i*3+s*5)%glassC.length,sc=.85+rnd()*.35,b=new THREE.Group();b.position.set(11.55,y+.015,z);b.scale.setScalar(sc);shelf.add(b);
      mesh(bodyG,bMat[k],0,.1,0,b);mesh(shG,bMat[k],0,.2,0,b);mesh(neckG,bMat[k],0,.27,0,b);mesh(capG,capM,0,.33,0,b);const lb=mesh(labG,label,0,.09,0,b);lb.rotation.y=-Math.PI/2;}}
  bakeGroup(shelf,true);
  [-3.4,-1.2,1.2].forEach(z=>{const chrome=lam({color:0xc8ccd4,emissive:0x101010});
    mesh(PGEO('st1',()=>new THREE.CylinderGeometry(.24,.26,.03,20)),chrome,8.9,.015,z,g);mesh(PGEO('st2',()=>new THREE.CylinderGeometry(.03,.03,.78,10)),chrome,8.9,.4,z,g);
    const ft=mesh(PGEO('st3',()=>new THREE.TorusGeometry(.17,.012,6,20)),chrome,8.9,.3,z,g);ft.rotation.x=Math.PI/2;
    mesh(PGEO('st4',()=>new THREE.CylinderGeometry(.22,.2,.09,20)),lam({color:0x6a1020}),8.9,.83,z,g);mesh(PGEO('st5',()=>new THREE.TorusGeometry(.21,.025,8,20)),lam({color:0x4a0a16}),8.9,.86,z,g).rotation.x=Math.PI/2;col(F,8.9,z,.4,.4);});
  col(F,9.8,-1,1,8.6);col(F,11.4,-1,1.2,9);
}
function sofa(F,x,z,rot,colr){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;F.group.add(g);const m=lam({color:colr});
  box(2.2,.45,.8,m,0,.23,0,g);box(2.2,.6,.22,m,0,.7,-.32,g);box(.22,.6,.8,m,-1.1,.4,0,g);box(.22,.6,.8,m,1.1,.4,0,g);
  g.traverse(o=>{if(o.isMesh)blocker(F,o);});
  const ax=Math.abs(Math.sin(rot))>.5;col(F,x,z,ax?.9:2.4,ax?2.4:.9);
}
function speaker(F,x,z,rot){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;F.group.add(g);
  box(.9,1.7,.7,lam({color:0x0c0a10}),0,.85,0,g);
  const cone=mesh(new THREE.CylinderGeometry(.3,.3,.04,10),lam({color:0x2a2a34}),0,.6,.36,g);cone.rotation.x=Math.PI/2;
  const tw=mesh(new THREE.CylinderGeometry(.12,.12,.04,8),lam({color:0x2a2a34}),0,1.3,.36,g);tw.rotation.x=Math.PI/2;
  box(.92,.04,.72,lam({color:0xd6a02a,emissive:0x3a2400}),0,1.72,0,g);
  F.speakers.push(cone,tw);col(F,x,z,1,1);g.traverse(o=>{if(o.isMesh)blocker(F,o);});
}

/* ---------- NPCs ---------- */
const LINES={
  generic:["Heute geht noch was.","Nicht starren.","Noch eine Runde, dann geh ich.","Hast du 'n Chip für mich?","Bleib cool, Neuer.","Hier unten gibt's keine Uhren."],
  roulette:["Rot. Immer Rot.","Die Kugel hasst mich.","Alles auf die 17!","Ich spür das heute.","Nicht schon wieder Null..."],
  slot:["Gleich kommt das Buch...","Drei Bücher. Nur drei.","Risiko? Immer Risiko.","Psst. Ich bin im Flow.","Der hier ist heiß, ich spür's."],
  busy:["Besetzt! Such dir 'nen eigenen.","Finger weg, der ist meiner.","Der gibt gleich. Geh weiter."],
  bouncer:["Aufzug geht in den 2. Stock. Benimm dich da oben.","Oben spielen die Großen.","Keine Fotos.","Ausgang? Welcher Ausgang?"],
  bartender:["Champagner geht aufs Haus. Zum Wohl.","Willkommen in der SJ Spielbank.","Pleite? Dann komm zu mir. Ich hab 200 € für dich."],
  dealer:["Faites vos jeux.","Einsätze bitte.","Rien ne va plus.","Setz oder geh weiter."],
  vip:["Hier oben wird's ernst.","Gestern hab ich den Laden fast leergeräumt.","Setz dich, wenn du dich traust.","Die Musik ist zu laut. Perfekt."],
  poker:["All-in. Spaß.","Ich hab nix. Oder doch?","Zeig mal deine Karten.","Du blinzelst. Bluff.","Der Flop gehört mir.","River, sei nett."]
};
const SKINS=['#e8b98f','#c68a5c','#8d5a3b','#f1cfb0','#6a4430'];
const JACKETS=[0x5a1a6a,0x1a3a6a,0x6a1a24,0x2a4a2a,0x3a3a44,0x8a6a1a,0x1a1a1e,0x6a2a5a];
const HAIRS=[0x111111,0x3a2210,0x8a7a5a,0xb02a5a,0x2a2a2a,0xc8c8c8];
let npcSeed=0;
// Teile mit gleichem Material zu einem Teil zusammenfassen (viel weniger Zeichenaufrufe, wichtig fürs Handy)
function mergeGeos(items){
  let nv=0,ni=0;items.forEach(({g})=>{nv+=g.attributes.position.count;ni+=g.index?g.index.count:g.attributes.position.count;});
  const pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),uv=new Float32Array(nv*2),idx=new (nv>65535?Uint32Array:Uint16Array)(ni);
  let vo=0,io=0;const v=new THREE.Vector3(),nm=new THREE.Matrix3();
  items.forEach(({g,m})=>{const P=g.attributes.position,N=g.attributes.normal,U=g.attributes.uv;nm.getNormalMatrix(m);
    for(let i=0;i<P.count;i++){const j=vo+i;v.fromBufferAttribute(P,i).applyMatrix4(m);pos[j*3]=v.x;pos[j*3+1]=v.y;pos[j*3+2]=v.z;
      if(N){v.fromBufferAttribute(N,i).applyMatrix3(nm).normalize();nor[j*3]=v.x;nor[j*3+1]=v.y;nor[j*3+2]=v.z;}
      if(U){uv[j*2]=U.getX(i);uv[j*2+1]=U.getY(i);}}
    if(g.index){for(let i=0;i<g.index.count;i++)idx[io+i]=g.index.getX(i)+vo;io+=g.index.count;}
    else{for(let i=0;i<P.count;i++)idx[io+i]=vo+i;io+=P.count;}
    vo+=P.count;});
  const out=new THREE.BufferGeometry();out.setAttribute('position',new THREE.BufferAttribute(pos,3));out.setAttribute('normal',new THREE.BufferAttribute(nor,3));
  out.setAttribute('uv',new THREE.BufferAttribute(uv,2));out.setIndex(new THREE.BufferAttribute(idx,1));out.computeBoundingSphere();return out;}
// deep=false: nur direkte Kinder (Figuren: Kopf/Arme bleiben beweglich); deep=true: alles darunter (feste Deko)
function bakeGroup(grp,deep){
  grp.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(grp.matrixWorld).invert(),by=new Map();
  const take=o=>{if(!o.isMesh||Array.isArray(o.material)||o.userData.act||o.userData.keep)return;const k=o.material.uuid;
    if(!by.has(k))by.set(k,{mat:o.material,list:[]});by.get(k).list.push(o);};
  const walk=o=>{if(o!==grp&&o.userData.noBake)return;if(o!==grp)take(o);o.children.forEach(walk);};
  if(deep)walk(grp);else grp.children.forEach(take);
  by.forEach(({mat,list})=>{if(list.length<2)return;
    const geo=mergeGeos(list.map(o=>({g:o.geometry,m:new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld)})));
    list.forEach(o=>o.parent.remove(o));grp.add(new THREE.Mesh(geo,mat));});
  if(deep){const empty=[];grp.traverse(o=>{if(o!==grp&&!o.isMesh&&!o.isLight&&!o.userData.noBake&&o.children.length===0)empty.push(o);});empty.forEach(o=>o.parent.remove(o));}}
// geteilte Formen für alle Figuren (spart Speicher)
const PGEOS={};function PGEO(k,f){return PGEOS[k]||(PGEOS[k]=f());}
function npc(F,o){
  npcSeed++;
  const skinHex=o.skin||SKINS[npcSeed%SKINS.length];
  const root=new THREE.Group();root.position.set(o.x,0,o.z);root.rotation.y=o.rot!==undefined?o.rot:0;F.group.add(root);
  const skin=lam({color:skinHex}),jacket=lam({color:o.color!==undefined?o.color:JACKETS[npcSeed%JACKETS.length]}),pants=lam({color:o.pants||0x16161e}),hair=lam({color:o.hair!==undefined?o.hair:HAIRS[npcSeed%HAIRS.length]});
  const sit=!!o.sit,hip=sit?.66:.9;
  // runde, weich geformte Figur (statt Klötzchen): Beine, Becken, ovaler Oberkörper, Kopf mit Gesicht und Frisur
  const shoe=lam({color:0x0c0a0c}),shirt=lam({color:o.shirt||0xf0ece4}),dark=lam({color:0x14100e});
  const cyl=(rt,rb,h,mat,x,y,z,p,seg)=>mesh(PGEO('c'+rt+rb+h+(seg||10),()=>new THREE.CylinderGeometry(rt,rb,h,seg||10)),mat,x,y,z,p);
  const sph=(r,mat,x,y,z,p,sx,sy,sz)=>{const s=mesh(PGEO('s'+r,()=>new THREE.SphereGeometry(r,14,10)),mat,x,y,z,p);if(sx)s.scale.set(sx,sy,sz);return s;};
  if(!sit){[-.1,.1].forEach(lx=>{cyl(.078,.062,.86,pants,lx,.47,0,root);sph(.07,shoe,lx,.045,.05,root,1,.6,1.7);});}
  else{[-.1,.1].forEach(lx=>{const th=cyl(.082,.074,.46,pants,lx,hip,.2,root);th.rotation.x=Math.PI/2;cyl(.07,.062,.6,pants,lx,.33,.42,root);sph(.07,shoe,lx,.045,.48,root,1,.6,1.7);});}
  cyl(.17,.16,.16,pants,0,hip+.02,0,root,12).scale.z=.72;
  const torso=cyl(.235,.175,.62,jacket,0,hip+.36,0,root,14);torso.scale.z=.62;
  sph(.235,jacket,0,hip+.66,0,root,1,.32,.62);
  box(.09,.24,.02,shirt,0,hip+.52,.115,root).rotation.x=-.06; // Hemdkragen-V
  if(o.color===0x1a1a1e||o.color===0x0c0c10)box(.03,.2,.022,lam({color:0x8a1020}),0,hip+.49,.122,root); // Fliege/Krawatte bei Personal
  cyl(.048,.055,.1,skin,0,hip+.74,0,root,8);
  const head=new THREE.Group();head.position.set(0,hip+.86,0);root.add(head);
  sph(.125,skin,0,0,0,head,1,1.14,1.06);
  const eyeM=lam({color:0x1a1210}),browM=hair;
  [-1,1].forEach(s=>{sph(.016,eyeM,s*.043,.018,.122,head);box(.04,.008,.01,browM,s*.045,.052,.124,head).rotation.z=-s*.12;sph(.024,skin,s*.118,0,0,head,.5,1,.8);});
  sph(.018,skin,0,-.012,.135,head,1,1.2,1);box(.05,.008,.01,lam({color:0x8a3a36}),0,-.062,.122,head);
  if(o.glasses){const gm=lam({color:0x050505});[-1,1].forEach(s=>{const r=mesh(PGEO('gl',()=>new THREE.TorusGeometry(.03,.006,6,14)),gm,s*.045,.018,.135,head);});box(.03,.006,.006,gm,0,.022,.137,head);}
  // Frisur: Kappe oben/hinten, längere Haare bei manchen
  const cap=mesh(PGEO('hair',()=>new THREE.SphereGeometry(.137,16,10,0,TAU,0,Math.PI*.55)),hair,0,.02,-.006,head);cap.scale.set(1,1.12,1.08);cap.rotation.x=-.28;
  if(npcSeed%3===1)cyl(.12,.13,.2,hair,0,-.06,-.05,head,12).scale.z=.7;
  const arm=(sx)=>{const a=new THREE.Group();a.position.set(sx*.26,hip+.6,0);root.add(a);
    sph(.07,jacket,0,0,0,a);cyl(.06,.052,.32,jacket,0,-.17,0,a);cyl(.052,.045,.28,jacket,0,-.44,0,a);sph(.048,skin,0,-.61,0,a,.9,1.1,.8);return a;};
  const armL=arm(-1),armR=arm(1);
  bakeGroup(root);bakeGroup(head);bakeGroup(armL);bakeGroup(armR);
  const n={root,head,armL,armR,torso,anim:o.anim||'idle',baseAnim:o.anim||'idle',t:Math.random()*10,ph:Math.random()*6,lines:o.lines||LINES.generic,special:o.special,F,bubbleEl:null,bubbleUntil:0,name:o.name||'GAST'};
  const act={type:'npc',npc:n,label:o.name||'GAST',sub:'Ansprechen',pos:new THREE.Vector3(o.x,1.4,o.z),reach:2.2};
  if(!o.noTag)tagAct(F,root,act);F.npcs.push(n);
  if(!o.noCol)col(F,o.x,o.z,.55,.55);
  return n;
}
function animNPC(n,dt){
  n.t+=dt;const t=n.t,p=n.ph;
  n.armL.rotation.z=0;n.armR.rotation.z=0;
  switch(n.anim){
    case 'slot':{const c=(t+p)%4.2;n.armR.rotation.x=c<.25?-1.0:-.85;n.armL.rotation.x=-.75;n.head.rotation.x=-.12;n.head.rotation.y=Math.sin(t*.3)*.1;break;}
    case 'cards':n.armL.rotation.x=-1.0+Math.sin(t*1.3+p)*.08;n.armR.rotation.x=-1.1+Math.sin(t*2.1+p)*.14;n.head.rotation.y=Math.sin(t*.4+p)*.35;n.head.rotation.x=.12;break;
    case 'folded':n.armL.rotation.x=-.2;n.armR.rotation.x=-.2;n.head.rotation.y=Math.sin(t*.3+p)*.6;n.head.rotation.x=-.05;break;
    case 'dealer':n.armL.rotation.x=-.9;n.armR.rotation.x=-.9+Math.sin(t*.9)*.2;n.armR.rotation.z=Math.sin(t*.9)*.25;n.head.rotation.y=Math.sin(t*.5)*.5;break;
    case 'bar':n.armR.rotation.x=-1.25;n.armR.rotation.z=Math.sin(t*4)*.35;n.armL.rotation.x=-.2;n.head.rotation.y=Math.sin(t*.4)*.3;break;
    case 'drink':{const c=(t+p)%6;n.armR.rotation.x=c<1.2?-2.4:-1.0;n.head.rotation.x=c<1.2?-.25:.05;break;}
    case 'dance':n.root.position.y=Math.abs(Math.sin(t*Math.PI*2))*.06;n.armL.rotation.x=-2.6+Math.sin(t*6.28)*.4;n.armR.rotation.x=-.4+Math.sin(t*6.28+1)*.5;n.head.rotation.z=Math.sin(t*3.14)*.15;break;
    case 'walk':n.armL.rotation.x=Math.sin(t*9)*.6;n.armR.rotation.x=-Math.sin(t*9)*.6;n.root.position.y=Math.abs(Math.sin(t*9))*.03;break;
    case 'cheer':n.armL.rotation.x=-2.9;n.armR.rotation.x=-2.9+Math.sin(t*10)*.3;break;
    case 'watch':n.armL.rotation.x=0;n.armR.rotation.x=0;n.armL.rotation.z=-.08;n.armR.rotation.z=.08;n.head.rotation.y=Math.sin(t*.35+p)*.7;break;
    default:n.head.rotation.y=Math.sin(t*.5+p)*.4;n.armL.rotation.x=Math.sin(t*.8+p)*.06;n.armR.rotation.x=-Math.sin(t*.8+p)*.06;
  }
}
let now=0;
function say(n,text,dur){
  if(!n.bubbleEl){n.bubbleEl=document.createElement('div');n.bubbleEl.className='bubble';$('#bubbles').appendChild(n.bubbleEl);}
  n.bubbleEl.textContent=text;n.bubbleUntil=now+(dur||3.2);n.bubbleEl.hidden=false;
}
