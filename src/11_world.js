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
function planeUV(w,h,sx,sy,tw,th){const g=new THREE.PlaneGeometry(w,h,sx||1,sy||1);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/tw,uv.getY(i)*h/th);return g;}

function signTex(text,color,bg){
  const fs=16,cw=text.length*fs+20;
  return canvasTex(cw,32,(g,w,h)=>{g.fillStyle=bg||'#0a0610';g.fillRect(0,0,w,h);g.strokeStyle=color;g.lineWidth=2;g.strokeRect(2,2,w-4,h-4);
    px(g,fs);g.textAlign='center';g.textBaseline='middle';g.shadowColor=color;g.shadowBlur=6;g.fillStyle=color;g.fillText(text,w/2,h/2+1);g.shadowBlur=0;g.fillStyle='#fff';g.globalAlpha=.55;g.fillText(text,w/2,h/2+1);g.globalAlpha=1;});
}
function sign(F,text,color,x,y,z,rotY,h){
  h=h||.55;const t=signTex(text,color);const w=h*t.image.width/32;
  const m=mesh(new THREE.PlaneGeometry(w,h),bas({map:t,side:THREE.DoubleSide}),x,y,z,F.group);m.rotation.y=rotY||0;return m;
}
function decal(F,tex,w,h,x,y,z,rotY){const m=mesh(new THREE.PlaneGeometry(w,h),lam({map:tex,transparent:true,alphaTest:.5}),x,y,z,F.group);m.rotation.y=rotY;return m;}
function pointLight(F,color,x,y,z,int,dist,flicker){const l=new THREE.PointLight(color,int,dist,1.4);l.position.set(x,y,z);(F?F.group:scene).add(l);if(F)F.lights.push({l,base:int,flicker:!!flicker});return l;}

const DOOR_X=6,DOOR_W=1.8,DOOR_H=2.7;
function buildRoom(F,th){
  const g=F.group;
  const fl=mesh(new THREE.PlaneGeometry(24,24,24,24),lam({map:th.floor}),0,0,0,g);fl.rotation.x=-Math.PI/2;fl.userData.floor=true;F.hits.push(fl);
  const ce=mesh(new THREE.PlaneGeometry(24,24,12,12),lam({map:th.ceil}),0,4,0,g);ce.rotation.x=Math.PI/2;
  const wm=lam({map:th.wall});
  [[0,12,Math.PI],[-12,0,Math.PI/2],[12,0,-Math.PI/2]].forEach(([x,z,r])=>{const w=mesh(planeUV(24,4,24,4,2,2),wm,x,2,z,g);if(x)w.position.set(x,2,0);else w.position.set(0,2,z);w.rotation.y=r;blocker(F,w);});
  // north wall with elevator opening
  const L=DOOR_X-DOOR_W/2,R=DOOR_X+DOOR_W/2;
  const nl=mesh(planeUV(L+12,4,18,4,2,2),wm,(-12+L)/2,2,-12,g);blocker(F,nl);
  const nr=mesh(planeUV(12-R,4,5,4,2,2),wm,(R+12)/2,2,-12,g);blocker(F,nr);
  const nt=mesh(planeUV(DOOR_W,4-DOOR_H,2,1,2,2),wm,DOOR_X,(4+DOOR_H)/2,-12,g);blocker(F,nt);
  col(F,0,12.5,26,1);col(F,-12.5,0,1,26);col(F,12.5,0,1,26);
  col(F,(-13+L)/2,-12.5,L+13,1);col(F,(R+13)/2,-12.5,13-R,1);
  const nb=bas({color:th.strip});
  box(24,.06,.04,nb,0,.12,11.97,g);box(.04,.06,24,nb,-11.97,.12,0,g);box(.04,.06,24,nb,11.97,.12,0,g);
  box(L+12-.5,.06,.04,nb,(-12+L-.5)/2,.12,-11.97,g);box(12-R-.6,.06,.04,nb,(R+.6+12)/2,.12,-11.97,g);
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
  const g=F.group,wood=lam({map:T.wood}),dark=lam({color:0x120c18});
  const c=box(.9,1.1,8.4,dark,9.8,.55,-1,g);blocker(F,c);
  box(1.05,.08,8.6,wood,9.8,1.14,-1,g);
  box(.04,.05,8.4,bas({color:0x29f0ff}),9.33,.9,-1,g);
  box(.35,2.4,8.8,dark,11.78,1.6,-1,g);
  const bc=[0x3adf5a,0xffaa22,0xff3a6a,0x4af0ff,0xc8a0ff,0xe8e8e8];
  for(let s=0;s<3;s++){box(.4,.04,8.6,wood,11.6,1.3+s*.6,-1,g);
    for(let i=0;i<14;i++){if(rnd()<.25)continue;const cc=bc[(i+s*3)%bc.length];mesh(new THREE.BoxGeometry(.09,.3,.09),lam({color:cc,emissive:cc,emissiveIntensity:.25}),11.55,1.47+s*.6,-5+i*.62,g);}}
  [-3.4,-1.2,1.2].forEach(z=>{mesh(new THREE.CylinderGeometry(.05,.14,.8,6),lam({color:0x2a2a30}),8.9,.4,z,g);mesh(new THREE.CylinderGeometry(.22,.22,.08,8),lam({color:0x6a1020}),8.9,.82,z,g);col(F,8.9,z,.4,.4);});
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
  box(.92,.04,.72,bas({color:0xff2e88}),0,1.72,0,g);
  F.speakers.push(cone,tw);col(F,x,z,1,1);g.traverse(o=>{if(o.isMesh)blocker(F,o);});
}

/* ---------- NPCs ---------- */
const LINES={
  generic:["Heute geht noch was.","Nicht starren.","Noch eine Runde, dann geh ich.","Hast du 'n Chip für mich?","Bleib cool, Neuer.","Hier unten gibt's keine Uhren."],
  roulette:["Rot. Immer Rot.","Die Kugel hasst mich.","Alles auf die 17!","Ich spür das heute.","Nicht schon wieder Null..."],
  slot:["Gleich kommt das Buch...","Drei Bücher. Nur drei.","Risiko? Immer Risiko.","Psst. Ich bin im Flow.","Der hier ist heiß, ich spür's."],
  busy:["Besetzt! Such dir 'nen eigenen.","Finger weg, der ist meiner.","Der gibt gleich. Geh weiter."],
  bouncer:["Aufzug geht in den 2. Stock. Benimm dich da oben.","Oben spielen die Großen.","Keine Fotos.","Ausgang? Welcher Ausgang?"],
  bartender:["Nur Wasser heute. Zum Wohl.","Der Keller hat schon Schlimmeres gesehen.","Pleite? Dann komm zu mir. Ich hab 20.000 für dich."],
  dealer:["Faites vos jeux.","Einsätze bitte.","Rien ne va plus.","Setz oder geh weiter."],
  vip:["Hier oben wird's ernst.","Gestern hab ich den Laden fast leergeräumt.","Setz dich, wenn du dich traust.","Die Musik ist zu laut. Perfekt."],
  poker:["All-in. Spaß.","Ich hab nix. Oder doch?","Zeig mal deine Karten.","Du blinzelst. Bluff.","Der Flop gehört mir.","River, sei nett."]
};
const SKINS=['#e8b98f','#c68a5c','#8d5a3b','#f1cfb0','#6a4430'];
const JACKETS=[0x5a1a6a,0x1a3a6a,0x6a1a24,0x2a4a2a,0x3a3a44,0x8a6a1a,0x1a1a1e,0x6a2a5a];
const HAIRS=[0x111111,0x3a2210,0x8a7a5a,0xb02a5a,0x2a2a2a,0xc8c8c8];
let npcSeed=0;
function faceTex(skin,glasses){return canvasTex(8,8,g=>{g.fillStyle=skin;g.fillRect(0,0,8,8);
  if(glasses){g.fillStyle='#050505';g.fillRect(1,3,6,2);g.fillStyle='#4af0ff';g.fillRect(2,3,1,1);}else{g.fillStyle='#1a1010';g.fillRect(2,3,1,2);g.fillRect(5,3,1,2);}
  g.fillStyle='#6a2a2a';g.fillRect(3,6,2,1);});}
function npc(F,o){
  npcSeed++;
  const skinHex=o.skin||SKINS[npcSeed%SKINS.length];
  const root=new THREE.Group();root.position.set(o.x,0,o.z);root.rotation.y=o.rot!==undefined?o.rot:0;F.group.add(root);
  const skin=lam({color:skinHex}),jacket=lam({color:o.color!==undefined?o.color:JACKETS[npcSeed%JACKETS.length]}),pants=lam({color:o.pants||0x16161e}),hair=lam({color:o.hair!==undefined?o.hair:HAIRS[npcSeed%HAIRS.length]});
  const sit=!!o.sit,hip=sit?.66:.9;
  if(!sit){box(.17,.9,.2,pants,-.12,.45,0,root);box(.17,.9,.2,pants,.12,.45,0,root);}
  else{[-.12,.12].forEach(lx=>{box(.17,.18,.5,pants,lx,hip,.2,root);box(.17,.62,.18,pants,lx,.31,.44,root);});}
  const torso=box(.5,.62,.28,jacket,0,hip+.33,0,root);
  const head=new THREE.Group();head.position.set(0,hip+.84,0);root.add(head);
  mesh(new THREE.BoxGeometry(.3,.32,.3),[skin,skin,hair,skin,lam({map:faceTex(skinHex,o.glasses)}),skin],0,0,0,head);
  box(.33,.09,.33,hair,0,.18,-.01,head);
  const arm=(sx)=>{const a=new THREE.Group();a.position.set(sx*.33,hip+.6,0);root.add(a);box(.13,.56,.15,jacket,0,-.27,0,a);box(.11,.11,.12,skin,0,-.6,0,a);return a;};
  const armL=arm(-1),armR=arm(1);
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
