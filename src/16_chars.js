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
const CH_DRESS=[0x7a1020,0x101014,0x0e2a4a,0x1e4a2a,0x3a1a4a,0x8a6a1a,0x2a1a3a,0x5a1a2a,0x101010,0x1a3a4a,0x4a1010]; // Kleider: Bordeaux, Schwarz, Nachtblau, Smaragd, Pflaume, Gold, …
const CH_SHIRTS=[0xf6f4ee,0xf0ece4,0xe4ecf4,0xf4efe0],CH_TIES=[0x6a1020,0x14244a,0x1a1a1e,0x8a6a1a,0x1e3a2a,0x4a1a3a]; // Hemden: Weiß, Ivory, Hellblau; Krawatten: Bordeaux, Navy, Schwarz, Gold, Grün, Aubergine
const CH_HAIR_F=['Hair_Long','Hair_Buns','Hair_SimpleParted','Hair_BuzzedFemale'],CH_HAIR_M=['Hair_SimpleParted','Hair_Buzzed','Hair_Long','Hair_Buns'];
const CH_SKIN=[1.32,1.18,1.06,.94]; // Hautton: Faktor auf die Hauttextur, hell bis gebräunt (Justin 2026-10-23: Figuren nach seinem Freundeskreis; vorher bis .62)
// ---- eigenes Aussehen (nk_look): g Körper (0 Mann, 1 Frau), h Frisur, hc Haarfarbe, s Anzug/Kleid, k Hautton, b Bart ----
function chLookClean(l){const n=(v,max)=>Math.max(0,Math.min(max-1,Math.round(+v)||0));l=l&&typeof l==='object'?l:{};return {g:l.g?1:0,h:n(l.h,4),hc:n(l.hc,CH_HAIR.length),s:n(l.s,CH_SUITS.length),k:n(l.k,CH_SKIN.length),b:l.b?1:0};}
function chLookSave(l){try{localStorage.setItem('nk_look',JSON.stringify(l));}catch(e){}}
function chLook(){if(CHR.look)return CHR.look;let l=null;try{l=JSON.parse(localStorage.getItem('nk_look')||'null');}catch(e){}
  if(!l){const r=Math.random;l={g:r()<.5?1:0,h:(r()*4)|0,hc:(r()*CH_HAIR.length)|0,s:(r()*CH_SUITS.length)|0,k:(r()*CH_SKIN.length)|0,b:0};chLookSave(l);}
  CHR.look=chLookClean(l);return CHR.look;}
function chLookOpts(l){l=chLookClean(l);const fem=l.g===1;return {female:fem,hairStyle:(fem?CH_HAIR_F:CH_HAIR_M)[l.h],hair:CH_HAIR[l.hc],color:fem?CH_DRESS[l.s%CH_DRESS.length]:CH_SUITS[l.s],skin:CH_SKIN[l.k],beard:!fem&&l.b===1};}
function chLookSet(key,delta){const l=chLook();const max={g:2,h:4,hc:CH_HAIR.length,s:CH_SUITS.length,k:CH_SKIN.length,b:2}[key];if(!max)return;l[key]=((l[key]+delta)%max+max)%max;chLookSave(l);CHR.look=l;
  const o=chLookOpts(l);if(CHR.fp)chRelook(CHR.fp,Object.assign({seatH:.55,glow:.45},o));if(CHR.mirror)chRelook(CHR.mirror,o);
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
  sw('lkHC',CH_HAIR[l.hc]);sw('lkS',l.g?CH_DRESS[l.s%CH_DRESS.length]:CH_SUITS[l.s]);const k=CH_SKIN[l.k],sk=Math.round(Math.min(255,170*k));const e=document.getElementById('lkK');if(e)e.style.background='rgb('+sk+','+Math.round(sk*.72)+','+Math.round(sk*.55)+')';
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
  // Kleidung wird im Shader pro Pixel aus der Bind-Pose-Position gemalt (chBodyMat, seit 2026-10-23 – vorher Zonen je Vertex: gezackte
  // Kanten und Streifen an den Übergängen). Hier nur noch: Arm-Kennung für die Ich-Perspektive und die Körpermaße (gemessen in der T-Pose, /H)
  ['Body_M','Body_F'].forEach(nm=>{const m=scene.getObjectByName(nm);if(!m)return;const g=m.geometry,pos=g.attributes.position,n=pos.count;g.computeBoundingBox();const H=g.boundingBox.max.y;
    const fem=nm==='Body_F';
    m.userData.dim={H,wrist:fem?.35:.385,seam:fem?.115:.135,neck:fem?.84:.855,fem:fem?1:0}; // Handgelenk, Ärmelnaht an der Schulter, Halsansatz (alles /H)
    // Arm-Kennung (T-Pose: Arme waagerecht): 1 = Arm/Hand, 0 = Rest – für die Ich-Perspektive am Automaten (nur Arme zeichnen)
    let y0=1e9,y1=-1e9;for(let i=0;i<n;i++){if(Math.abs(pos.getX(i))>H*.3){const y=pos.getY(i);if(y<y0)y0=y;if(y>y1)y1=y;}}
    const aw=new Float32Array(n);for(let i=0;i<n;i++){const y=pos.getY(i);aw[i]=(Math.abs(pos.getX(i))>H*.135&&y>y0-H*.01&&y<y1+H*.01)?1:0;}
    g.setAttribute('armw',new THREE.BufferAttribute(aw,1));});
  return scene;
}
// Körper-Material: Haut aus der Textur (getönt), Kleidung flächig pro Pixel aus der Bind-Pose-Position (Shader-Zusatz auf Lambert).
// pal: 0 Hautton, 1 Jacke/Weste/Kleid, 2 Hose, 3 Schuhe, 4 Hemd, 5 Ärmel, 6 Krawatte/Fliege, 7 Schmuck/Knöpfe. style 0 Anzug, 1 Kleid, 2 Weste (Croupier).
// Alle Maße in Anteilen der Körperhöhe (T-Pose, gemessen 2026-10-23): Handgelenk, Ärmelnaht, Halsansatz je Körper (dim)
const CH_CLOTH_GLSL=`
varying vec3 vP;varying float vArm;uniform vec3 pal[8];uniform float fpCut;uniform vec4 uDim;uniform float uStyle;uniform float uPin;
float chHash(vec3 p){return fract(sin(dot(floor(p),vec3(12.9898,78.233,37.719)))*43758.5453);}
bool chTri(vec2 p,vec2 a,vec2 b,vec2 c){float d1=(p.x-b.x)*(a.y-b.y)-(a.x-b.x)*(p.y-b.y),d2=(p.x-c.x)*(b.y-c.y)-(b.x-c.x)*(p.y-c.y),d3=(p.x-a.x)*(c.y-a.y)-(c.x-a.x)*(p.y-a.y);bool n=(d1<0.0)||(d2<0.0)||(d3<0.0),q=(d1>0.0)||(d2>0.0)||(d3>0.0);return !(n&&q);}
vec3 chCloth(vec3 skin){
  float ax=abs(vP.x),y=vP.y,z=vP.z;float wrist=uDim.x,seam=uDim.y,neckY=uDim.z,fem=uDim.w;
  float g=0.95+0.10*chHash(vP*650.0); // Stoffkorn (Webstruktur, nur aus der Nähe sichtbar)
  vec3 c=skin;
  if(y<0.05)return pal[3]*(0.92+0.16*chHash(vP*300.0)); // Schuhe
  if(uStyle>0.5&&uStyle<1.5){ // ---- Kleid: Oberteil auf dem Körper, der Rock ist ein eigenes Netz (chSkirt) ----
    if(ax>0.175)return skin; // kurze Ärmel
    float u=clamp(ax/0.07,0.0,1.0);float top=z>0.0?0.80+0.035*u*u:0.83; // runder Ausschnitt vorn, hinten höher
    if(y>top||y<0.50)return skin;
    c=pal[1]*g;
    if(ax>0.165)c*=0.8; // Ärmelkante
    if(abs(y-0.60)<0.005)c=pal[7]*0.95; // schmaler Goldgürtel
    if(z>0.0){float q=ax/0.05;float yc=0.805-0.028*(1.0-q*q);if(ax<0.05&&abs(y-yc)<0.0018)c=pal[7];if(length(vec2(ax*1.2,y-0.772))<0.006)c=pal[7];} // feine Kette mit Anhänger
    return c;
  }
  // ---- Anzug (0) / Weste (2) ----
  float vest=step(1.5,uStyle);
  if(ax>wrist)return skin; // Hände
  if(y>neckY+0.016)return skin; // Hals über dem Kragen, Kopf
  if(y>neckY-0.012&&ax<0.055)return pal[4]*g; // Hemdkragen: schmales Band um den Hals (nicht über die Schultern)
  float pinB=(uPin>0.5&&vest<0.5)?0.14:0.0; // Nadelstreifen
  if(ax>seam){ // Ärmel
    if(vest>0.5)return pal[4]*g; // Weste: weiße Hemdärmel
    if(ax>wrist-0.025)return pal[4]*g; // Manschette
    c=pal[5]*g*(1.0+pinB*step(fract(y*55.0),0.06));if(ax>wrist-0.031)c*=0.75;return c; // Jackenärmel mit Kante, Streifen längs
  }
  float hem=vest>0.5?0.525:0.47;
  if(y<hem){c=pal[2]*g*(1.0+pinB*step(fract(ax*55.0),0.06));if(vest>0.5&&y>hem-0.015)c=vec3(0.12,0.09,0.06);if(z>0.0&&abs(ax-0.05)<0.0018&&y<0.44)c*=0.82;return c;} // Hose (Bügelfalte), bei der Weste Gürtel
  c=pal[1]*g*(1.0+pinB*step(fract(ax*55.0),0.06));
  float vTop=neckY-0.012,vBot=vest>0.5?0.60:0.62;
  if(z>0.0){ // Vorderseite
    float t=clamp((y-vBot)/(vTop-vBot),0.0,1.0);float vh=(vest>0.5?0.03:0.045)*t; // V-Ausschnitt: oben so breit wie der Hals, unten am obersten Knopf geschlossen
    if(ax<vh){c=pal[4]*g; // Hemd im Ausschnitt
      if(vest<0.5){float bw=mix(0.012,0.021,clamp((0.80-y)/0.14,0.0,1.0));if(y<=0.80&&ax<bw)c=pal[6]*g;} // Krawattenblatt
    }else{float lw=0.04*(0.45+0.55*t);if(ax<vh+lw){c=pal[1]*1.12*g+0.04;if(ax<vh+0.003||ax>vh+lw-0.0025)c=pal[1]*0.5;}} // Revers (etwas heller) mit dunklen Kanten
    if(y<vBot){if(ax<0.003)c=pal[1]*0.5; // Schließkante
      float by=vBot-0.008;for(int i=0;i<3;i++){if(i<2||vest>0.5){float d=length(vec2((ax-0.006)*1.3,y-by));if(d<0.009)c=pal[7];if(d<0.0045)c=pal[7]*0.65;}by-=vest>0.5?0.032:0.058;} // Knöpfe (Anzug 2, Weste 3)
      if(vest<0.5&&abs(y-0.52)<0.0025&&ax>0.045&&ax<0.105)c=pal[1]*0.55;} // Taschenklappen
    if(vest<0.5&&vP.x>0.0&&abs(y-0.70)<0.0022&&ax>0.05&&ax<0.085)c=pal[1]*0.55; // Brusttasche links
    if(chTri(vec2(ax,y),vec2(0.012,0.846),vec2(0.056,0.846),vec2(0.030,0.795)))c=pal[4]*g; // Kragenspitzen liegen über dem Revers
    if(vest<0.5&&y>0.800&&y<0.842&&ax<0.017)c=pal[6]*0.8; // Krawattenknoten zwischen den Kragenspitzen
    if(vest>0.5&&ax<0.032&&abs(y-0.822)<mix(0.006,0.013,clamp((ax-0.006)/0.026,0.0,1.0))){c=pal[6];if(ax<0.006)c*=0.6;} // Fliege
  }
  return c;
}`;
function chBodyMat(map,pal,dim,style,glow,pin){
  const m=new THREE.MeshPhongMaterial({map,skinning:true,shininess:16,specular:new THREE.Color(0x1c1c1c)});m.userData.glow={value:glow||0};m.userData.pin={value:pin?1:0}; // Phong: leichter Stoff-/Hautglanz statt flachem Lambert
  while(pal.length<8)pal.push(pal[pal.length-1]);
  m.userData.pal=pal.map(c=>new THREE.Color(c));m.userData.cut={value:0}; // cut 1 = nur Arme zeichnen (eigener Körper am Automaten)
  m.userData.dim={value:new THREE.Vector4(dim.wrist,dim.seam,dim.neck,dim.fem)};m.userData.style={value:style||0};
  m.onBeforeCompile=sh=>{sh.uniforms.pal=({value:m.userData.pal});sh.uniforms.fpCut=m.userData.cut;sh.uniforms.uDim=m.userData.dim;sh.uniforms.uStyle=m.userData.style;sh.uniforms.uH={value:dim.H};sh.uniforms.uGlow=m.userData.glow;sh.uniforms.uPin=m.userData.pin;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float armw;varying float vArm;varying vec3 vP;uniform float uH;').replace('#include <uv_vertex>','#include <uv_vertex>\nvArm=armw;vP=position/uH;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+CH_CLOTH_GLSL+'\nuniform float uGlow;')
      .replace('#include <map_fragment>','#include <map_fragment>\nif(fpCut>.5&&vArm<.5)discard;\ndiffuseColor.rgb=chCloth(diffuseColor.rgb*pal[0]);')
      .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=diffuseColor.rgb*uGlow;');}; // uGlow: eigener Körper leuchtet etwas von selbst (Hände am Automaten sonst schwarz)
  return m;
}
function chLamMat(src,tint){const key=src.uuid+'|'+(tint||'');if(CHR.mats[key])return CHR.mats[key];const m=new THREE.MeshLambertMaterial({map:src.map||null,color:tint!==undefined?tint:0xffffff,skinning:true,transparent:!!src.transparent,alphaTest:src.alphaTest||0});return CHR.mats[key]=m;}
// Rock für Kleider: eigenes Netz am selben Skelett (oben Becken, unten Oberschenkel), damit er wie Stoff hängt, beim Gehen mitschwingt
// und beim Sitzen auf dem Schoß liegt. Maße in Anteilen der Körperhöhe (Hüfte ≈ .49, Knie ≈ .29); hinten bleibt mehr Becken-Gewicht, damit er hängt
function chSkirt(body,color){
  const bones=body.skeleton.bones,bi=nm=>bones.findIndex(b=>b.name===nm),iP=bi('pelvis'),iL=bi('thigh_l'),iR=bi('thigh_r');if(iP<0||iL<0||iR<0)return null;
  const H=(body.userData.dim&&body.userData.dim.H)||1.77,SEG=28,ROWS=7,pos=[],nor=[],si=[],sw=[],idx=[];
  const y0=.575,y1=.305,rx0=.108,rz0=.082,rx1=.15,rz1=.13,zc=-.013;
  for(let r=0;r<=ROWS;r++){const t=r/ROWS,y=(y0+(y1-y0)*t)*H,rx=(rx0+(rx1-rx0)*t)*H,rz=(rz0+(rz1-rz0)*t)*H;
    for(let k=0;k<=SEG;k++){const a=k/SEG*Math.PI*2,cx=Math.cos(a),sz=Math.sin(a);pos.push(cx*rx,y,zc*H+sz*rz);nor.push(cx/rx,0,sz/rz);
      const wp=1-t*(sz>0?.7:.45),side=THREE.MathUtils.smoothstep(cx,-.5,.5),wt=1-wp;si.push(iP,iL,iR,0);sw.push(wp,wt*side,wt*(1-side),0);}}
  for(let r=0;r<ROWS;r++)for(let k=0;k<SEG;k++){const a=r*(SEG+1)+k,b=a+SEG+1;idx.push(a,b,a+1,a+1,b,b+1);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.normalizeNormals();
  g.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(si,4));g.setAttribute('skinWeight',new THREE.Float32BufferAttribute(sw,4));g.setIndex(idx);
  const m=new THREE.SkinnedMesh(g,new THREE.MeshPhongMaterial({color,skinning:true,side:THREE.DoubleSide,shininess:22,specular:new THREE.Color(0x262626)}));m.frustumCulled=false;m.castShadow=false;m.receiveShadow=false;m.name='Skirt';
  m.position.copy(body.position);m.quaternion.copy(body.quaternion);m.scale.copy(body.scale);m.bind(body.skeleton,body.bindMatrix);body.parent.add(m);return m;}
// alte Figur durch Skelett-Modell ersetzen
function chAttach(n,o){
  if(CHR.fail||n.rig)return;if(!CHR.ready){CHR.pending.push([n,o]);return;}
  CHR.seedN++;const seed=CHR.seedN;
  const fem=o.female!==undefined?!!o.female:(/IN$/.test(o.name||'')||o.hair===0xb02a5a||o.hair===0x8a1a2a||(o.name==='GAST'&&seed%2===1));
  const col=o.color!==undefined?o.color:CH_SUITS[seed%CH_SUITS.length];
  let model,skirt=null;const bones={};
  if(CHR.lib){
    model=THREE.SkeletonUtils.clone(CHR.lib);model.traverse(x=>{if(x.isBone){bones[x.name]=x;if(CH_FINGER_RE.test(x.name))x.userData.rest=x.quaternion.clone();}});
    const hairName=o.hairStyle||(fem?CH_HAIR_F[(seed*3+1)%CH_HAIR_F.length]:CH_HAIR_M[(seed*2+1)%3]);const beard=o.beard!==undefined?!!o.beard:(!fem&&(seed%3===0));const skin=o.skin||CH_SKIN[(seed*3+1)%CH_SKIN.length];
    const hairCol=o.hair!==undefined?o.hair:CH_HAIR[(seed*2+3)%CH_HAIR.length]; // (Faktoren teilerfremd zur Listenlänge, sonst hätten alle denselben Ton – war bis 2026-10-22 so)
    const vest=o.vest!==undefined?!!o.vest:/CROUPIER|DEALERIN|KARTENGEBER/.test(o.name||''); // Croupier: schwarze Weste, weißes Hemd mit weißen Ärmeln, Fliege (Sinan 2026-10-22)
    const style=vest?2:fem?1:0; // 0 Anzug mit Hemd und Krawatte, 1 Kleid, 2 Weste
    const dress=o.color!==undefined?o.color:CH_DRESS[(seed*5+2)%CH_DRESS.length];
    const shirt=vest?0xf6f4ee:CH_SHIRTS[(seed*3)%CH_SHIRTS.length],shoes=0x151214,trousers=vest?0x101014:(o.pants||col),jacket=vest?0x101014:(fem?dress:col),sleeves=vest?0xf6f4ee:col;
    const tie=vest?0x0a0a0c:CH_TIES[(seed*7+1)%CH_TIES.length],acc=fem&&!vest?0xd6a02a:0x1a1612; // Krawatte je Figur, Kette gold, Knöpfe dunkel
    const sk=new THREE.Color(skin,skin,skin);const pal=[sk,jacket,trousers,shoes,shirt,sleeves,tie,acc];
    model.traverse(x=>{if(!x.isSkinnedMesh)return;const nm=x.name;const bodyOf=fem?'F':'M';
      const show=nm==='Body_'+bodyOf||nm==='Eyes_'+bodyOf||nm==='Eyes_'+bodyOf+'.001'||nm==='Brows_'+bodyOf||nm===hairName||(beard&&nm==='Hair_Beard');
      x.visible=show;if(!show)return;
      const src=Array.isArray(x.material)?x.material[0]:x.material;
      if(nm.startsWith('Body_'))x.material=chBodyMat(src.map,pal,x.userData.dim||{H:1.8,wrist:.385,seam:.135,neck:.855,fem:0},style,o.glow||0,style===0&&seed%3===1);
      else if(nm.startsWith('Hair_')||nm.startsWith('Brows_'))x.material=chLamMat(src,hairCol); // Brauen in Haarfarbe (waren weiß, Sinan 2026-10-22)
      else x.material=chLamMat(src);
      if(n.act){x.userData.act=n.act;if(n.F&&n.F.hits)n.F.hits.push(x);}});
    if(style===1){const body=model.getObjectByName('Body_F');if(body){skirt=chSkirt(body,pal[1]);if(skirt&&n.act){skirt.userData.act=n.act;if(n.F&&n.F.hits)n.F.hits.push(skirt);}}}
  }else{ // Rückfall: Mannequin aus anim.glb
    model=THREE.SkeletonUtils.clone(CHR.male);model.traverse(x=>{if(x.isBone)bones[x.name]=x;
      if(x.isSkinnedMesh){const ms=Array.isArray(x.material)?x.material:[x.material];const nm=ms.map(mt=>new THREE.MeshLambertMaterial({color:/joint/i.test(mt.name)?0x121216:col,skinning:true}));x.material=Array.isArray(x.material)?nm:nm[0];
        if(n.act){x.userData.act=n.act;if(n.F&&n.F.hits)n.F.hits.push(x);}}});
  }
  while(n.root.children.length)n.root.remove(n.root.children[0]);
  n.root.add(model);
  const mixer=new THREE.AnimationMixer(model);
  n.rig={model,bones,mixer,cur:'',curAct:null,sit:!!o.sit,speed:.92+Math.random()*.16,fem,seatH:o.seatH||.58,tScale:1,skirt};
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
const CH_FING=['thumb','index','middle','ring','pinky'],CH_FINGER_RE=/^(thumb|index|middle|ring|pinky)_0[1-3]_[lr]$/;
const CH_IKBONES=['spine_01','spine_02','neck_01','upperarm_r','lowerarm_r','hand_r','upperarm_l','lowerarm_l','hand_l'];
['r','l'].forEach(sd=>CH_FING.forEach(f=>{for(let j=1;j<=3;j++)CH_IKBONES.push(f+'_0'+j+'_'+sd);}));
// Fingerhaltung je Finger (Daumen, Zeige, Mittel, Ring, Klein): 0 = gestreckt (Datei-Pose), 1 = so gekrümmt wie in der Animation (Faust)
// Fingerhaltung je Finger (Daumen, Zeige, Mittel, Ring, Klein): Beugung der drei Glieder in Grad ab der gestreckten Datei-Pose.
// Gedreht wird um die lokale X-Achse des Fingerknochens (so beugen auch die Animationen, an der Faust gemessen), das Daumen-Grundglied
// um seine gemessene Achse. Feste Winkel statt Mischung mit der Animation: so sehen die Finger in jedem Clip gleich sauber aus.
const CH_FPOSE={
  flat:[[18,14,8,14],[10,16,12],[12,18,14],[15,22,16],[18,26,18]],  // Hand liegt entspannt auf der Taste: Finger leicht gebogen, Daumen angelegt (4. Wert = Daumen zur Hand, Grad)
  press:[[14,20,30],[12,20,12],[12,20,12],[14,22,14],[16,24,16]],  // Taste flach mit vier Fingern drücken (Nutzer 2026-10-22), Daumen locker
  cig:[[10,14,22],[16,16,10],[20,18,12],[70,82,58],[76,86,62]],    // Kippe zwischen Zeige- und Mittelfinger, Ring/Klein locker eingerollt
  glass:[[14,22,34],[46,58,30],[50,62,34],[50,62,34],[52,64,38]],  // Finger ums Glas
  pack:[[30,40,20],[45,60,35],[48,62,36],[50,64,38],[52,66,40]],  // Schachtel steht in der Handfläche, Finger greifen hinten hoch, Daumen liegt quer vorn auf (wie Nutzer-Video)
  packPush:[[10,10,5],[45,60,35],[48,62,36],[50,64,38],[52,66,40]]}; // Daumen streckt sich nach oben und drückt den Deckel auf // Daumen gestreckt nach oben: drückt den Deckel auf   // Schachtel in der Hand: Finger liegen hinten flach an, nur die Spitzen greifen über die Oberkante, Daumen vorn
const CH_THUMB_AX=new THREE.Vector3(.55,.8,-.23).normalize(); // Daumen-Grundglied: Drehachse aus den Animationen gemessen (links gespiegelt)
function chBoneBase(bone){const u=bone.userData;if(!u.q0){u.q0=new THREE.Quaternion();u.q1=new THREE.Quaternion();u.qset=false;}
  if(u.qset&&bone.quaternion.equals(u.q1))bone.quaternion.copy(u.q0);u.q0.copy(bone.quaternion);}
function chBoneDone(bone){const u=bone.userData;u.q1.copy(bone.quaternion);u.qset=true;}
function boneRotWorld(bone,axis,angle){ // dreht den Knochen um eine Welt-Achse
  if(!bone||!angle)return;ikQ.setFromAxisAngle(ikC.copy(axis).normalize(),angle);const pq=bone.parent.getWorldQuaternion(ikQ2);const lq=ikQ3.copy(pq).invert().multiply(ikQ).multiply(pq);bone.quaternion.premultiply(lq);bone.updateMatrixWorld(true);
}
function boneRotWorldQ(bone,q){ // dreht den Knochen um eine Welt-Drehung q (Quaternion)
  if(!bone)return;const pq=bone.parent.getWorldQuaternion(ikQ2);const lq=ikQ3.copy(pq).invert().multiply(q).multiply(pq);bone.quaternion.premultiply(lq);bone.updateMatrixWorld(true);
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
// Handgelenk: gewünschte Finger- (fd) und Handflächenrichtung (pal). Die Verdrehung um die Unterarm-Achse übernimmt der Unterarm
// (Pronation/Supination, höchstens ~95°), die Hand selbst beugt nur noch (höchstens ~70°) – so verdreht sich das Handgelenk nie unnatürlich.
const wrM=new THREE.Matrix4(),wrQ=new THREE.Quaternion(),wrQ2=new THREE.Quaternion(),wrT=new THREE.Quaternion();
function chFrameQ(fw,pal,out){const c=new THREE.Vector3().crossVectors(fw,pal).normalize();wrM.makeBasis(fw,pal,c);return out.setFromRotationMatrix(wrM);}
function chTwist(q,axis,out){ // Anteil der Drehung q um die Achse (Swing-Twist-Zerlegung), Winkel mit Vorzeichen
  const d=q.x*axis.x+q.y*axis.y+q.z*axis.z;out.set(axis.x*d,axis.y*d,axis.z*d,q.w);if(out.lengthSq()<1e-10)out.set(0,0,0,1);else out.normalize();
  let a=2*Math.atan2(out.x*axis.x+out.y*axis.y+out.z*axis.z,out.w);if(a>Math.PI)a-=2*Math.PI;if(a<-Math.PI)a+=2*Math.PI;return a;}
function chWrist(B,sd,fd,pal,w,free){ // free: eigene Figur mit Pose fest im Bild – weitere Grenzen (~150° / ~90°), damit die Hand so liegt wie gezeichnet
  const hb=B['hand_'+sd],lo=B['lowerarm_'+sd];if(!hb||!lo||w<=0)return;const rollMax=free?2.6:1.66,swingMax=free?1.57:1.22;
  const want=fd.clone().normalize();let pd=pal?pal.clone():null;if(pd){pd.sub(want.clone().multiplyScalar(pd.dot(want)));if(pd.lengthSq()<1e-6)pd=null;else pd.normalize();}
  const u=hb.getWorldPosition(new THREE.Vector3()).sub(lo.getWorldPosition(new THREE.Vector3())).normalize();
  for(let pass=0;pass<2;pass++){
    const pw=chPalmWorld(B,sd);if(!pw)return;
    let q;if(pd){chFrameQ(pw.fw,pw.pal,wrQ);chFrameQ(want,pd,wrQ2);q=wrQ2.clone().multiply(wrQ.invert());}else q=new THREE.Quaternion().setFromUnitVectors(pw.fw,want);
    const tw=chTwist(q,u,wrT);
    if(pass===0){const roll=Math.max(-rollMax,Math.min(rollMax,tw));if(Math.abs(roll)>1e-4)boneRotWorld(lo,u,roll*w);} // Unterarm rollt
    else{const sw=q.multiply(wrT.clone().invert());const ang=2*Math.acos(Math.min(1,Math.abs(sw.w)));if(ang<1e-4)return; // Rest = Beugen/Seitneigen der Hand
      if(ang>swingMax)sw.slerp(ikI,1-swingMax/ang);if(w<1)sw.slerp(ikI,1-w);boneRotWorldQ(hb,sw);}
  }
}
CHR.press=null;
// Taste am Automaten gedrückt (von pressButton): die passende Hand geht zur Taste (sitzend immer, stehend bis 1,7 m)
function chPress(m,key){if(!CHR.fp||!CHR.fp.rig||!m||!m.btns)return;const near=(focus&&focus.m===m)||Math.hypot(m.group.position.x-P.x,m.group.position.z-P.z)<1.7;if(!near)return;
  const k=key==='KARTE'?'RISIKO':key,bk=m.btns[k]?k:'START';CHR.press={m,key:bk,side:chBtnSide(k),t:0};CHR.restKey=bk;} // die Hand bleibt danach auf dieser Taste liegen (Nutzer 2026-10-22: bei LEITER nicht zurück zu START)
// Ruhelage auf einer Taste: Hand liegt locker auf der zuletzt gedrückten Taste (Fingerspitzen knapp über der Taste)
function chBtnRest(m,key,fx,fz,k){const b=chBtnPos(m,m.btns&&m.btns[key]?key:'START',new THREE.Vector3());if(!b)return null;b.x-=fx*.165;b.z-=fz*.165;b.y+=.112-.02*(k||0); // Ruhelage: Hand flach geneigt (~20°), Fingerspitzen auf der Taste; k = Druck (Hand geht nur 2 cm runter, Nutzer 2026-10-23: kein Hochspringen)
  const pal=CH_DECK_N.clone().negate().applyQuaternion(m.group.getWorldQuaternion(new THREE.Quaternion()));return {p:b,fd:new THREE.Vector3(fx*.95,-.3,fz*.95).normalize(),pal,fp:CH_FPOSE.flat,pole:new THREE.Vector3(-fx,-.35,-fz),free:true};} // Ellbogen hinten (Pult liegt auf Schulterhöhe: so bleibt der Unterarm flach und die Hand kann abwärts zeigen)
function chBtnSide(k){return 'r';} // am Automaten bedient nur die rechte Hand alle Tasten (Nutzer 2026-10-22); bei den linken Tasten dreht der Oberkörper mit
function chBtnPos(m,key,out){const b=m&&m.btns&&(m.btns[key]||m.btns.START);if(!b||!b.mesh)return null;return b.mesh.getWorldPosition(out);}
// Handgelenk-Ziel beim Drücken: hinter und über der Taste, der gestreckte Zeigefinger (ca. 23 cm ab Handgelenk) zeigt schräg nach vorn-unten auf die Taste (k=1: gedrückt)
function chBtnWrist(m,key,fx,fz,k){const b=chBtnPos(m,key,new THREE.Vector3());if(!b)return null;b.x-=fx*.15;b.z-=fz*.15;b.y+=.17-.012*(k||0);return b;} // Fingerspitzen (ca. 19 cm ab Handgelenk, flach ~35° abwärts) landen auf der Taste
function chBtnFd(fx,fz){return new THREE.Vector3(fx*.82,-.57,fz*.82).normalize();}
// Ruhelage am Pult: Handballen liegt vorn auf der schrägen Pultkante, die Finger liegen flach Richtung Taste (rechts START, links EINSATZ)
const CH_DECK_N=new THREE.Vector3(0,Math.cos(.32),Math.sin(.32)); // Pultfläche ist um 0,32 rad zum Spieler gekippt (buildMachine)
function chDeckRest(m,key,side){
  const b=m&&m.btns&&m.btns[key];if(!b||!b.mesh)return null;const g=m.group,q=g.getWorldQuaternion(new THREE.Quaternion());
  const p=g.localToWorld(new THREE.Vector3(b.mesh.position.x+(side==='r'?.015:-.015),1.015,.56));
  const fd=new THREE.Vector3(0,.36,-.93).normalize().applyQuaternion(q),pal=CH_DECK_N.clone().negate().applyQuaternion(q);
  return {p,fd,pal,fp:CH_FPOSE.flat};}
// Handposen (Welt): Handgelenk p, Fingerrichtung fd, Handflächenrichtung pal (die Kippe ragt aus dem Handrücken, also Richtung -pal), Fingerhaltung fp, Ellbogen-Hinweis pole.
// F.pt(vor,rechts,unter) ab Auge/Kopf und F.v(vor,rechts,hoch) in Körperrichtung (waagerecht); F.M = Mundpunkt, F.mf/mr/mu = Blickrichtung vorn/rechts/oben
// (eigene Figur: mit Kamera-Neigung, damit die Hand am Mund immer unten im Bild bleibt, egal wohin man schaut)
// Eigene Figur (F.fp): die Hände werden so gehalten, dass man sie unten im Bild sieht (Blickrichtung = F.mf/mr/mu, mit Kamera-Neigung),
// Hochformat rückt sie zur Mitte (F.ax). Mitspieler: natürliche Haltung ab Kopf (F.pt).
function chHandPose(kind,F){
  const v=F.v,m=(a,b,c)=>new THREE.Vector3().addScaledVector(F.mf,a).addScaledVector(F.mr,b).addScaledVector(F.mu,c).normalize();
  const fp=!!F.fp,ax=F.ax||1;
  switch(kind){
    case 'cig':if(fp){const c=m(.3,-.35*ax,.9),fd=m(.7,.55*ax,-.2);fd.sub(c.clone().multiplyScalar(fd.dot(c))).normalize();const far=(1-ax)*2; // Hand vor der Brust, Handrücken zum Auge (Knöchel sichtbar), Kippe steht nach vorn-oben heraus; Hochformat etwas weiter weg (kleiner)
        return {p:F.sp(.23+.05*far,.08*ax,.14+.02*far),fd,pal:c.negate(),fp:CH_FPOSE.cig};}
      return {p:F.pt(.12,.21,.36),fd:v(.5,.05,-.85),pal:v(-.45,-.85,-.25),fp:CH_FPOSE.cig}; // Arm hängt locker (Schulter liegt ~27 cm hinter dem Auge), Kippe zeigt nach vorn-außen
    case 'cigAsh':if(fp){const fd=m(.5,.2*ax,-.84),pal=m(-.3,-.9,-.2);pal.sub(fd.clone().multiplyScalar(pal.dot(fd))).normalize();return {p:F.sp(.24,.13*ax,.15),fd,pal,fp:CH_FPOSE.cig};} // Hand kippt: Finger nach vorn-unten, Handfläche nach innen, Glut zeigt nach unten
      return {p:F.pt(.08,.25,.40),fd:v(.75,.2,-.6),pal:v(-.1,-.35,.93),fp:CH_FPOSE.cig};
    case 'cigMouth':{const c=m(.8,.1,.6),fd=m(-.3,-.7,.52);fd.sub(c.clone().multiplyScalar(fd.dot(c))).normalize();const pal=c.clone().negate(); // Filter an den Lippen, Finger quer vor dem Mund nach oben-links, Kippe zeigt nach vorn-oben
      const at=F.M.clone();if(fp)at.addScaledVector(F.mf,.05+.08*(1-ax)*2).addScaledVector(F.mu,-.01); // eigene Figur: die Lippen liegen unter dem Bildrand, darum Hand und Kippe nach vorn (unten im Bild sichtbar; Hochformat weiter weg, sonst füllt die Hand das Bild)
      return {p:at.clone().addScaledVector(fd,-.13).addScaledVector(pal,-.02),at,fd,pal,fp:CH_FPOSE.cig,pole:m(.2,.5,-1)};}
    case 'glass':if(fp){const fd=m(.55,.8*ax,-.25),pal=m(-.5,.4,.3);return {p:F.sp(.24,-.16*ax,.13),fd,pal,fp:CH_FPOSE.glass};} // Glas vor der Brust, Handfläche zur Mitte
      return {p:F.pt(.12,-.21,.36),fd:v(.8,.2,-.3),pal:v(-.4,.85,0),fp:CH_FPOSE.glass}; // Glas hängt locker an der Seite, Handfläche zur Mitte
    case 'glassSip':{const fd=m(.6,.2,.5),pal=m(-.5,.8,0);pal.sub(fd.clone().multiplyScalar(pal.dot(fd))).normalize();
      const axv=F.mu.clone().multiplyScalar(Math.cos(.8)).addScaledVector(F.mf,-Math.sin(.8)); // Glasachse beim Schluck (wie drinkStep/itemsAvatarsStep: Rand kippt zum Gesicht)
      const rim=fp?F.sp(.13,-.01,.055):F.M.clone(); // eigene Figur: Glasrand am unteren Bildrand (die Lippen selbst liegen darunter)
      const base=rim.addScaledVector(axv,-.085);
      return {p:base.clone().addScaledVector(fd,-.12).addScaledVector(pal,-.04),at:base,fd,pal,fp:CH_FPOSE.glass,pole:m(.2,-.5,-1)};}
  }return null;
}
// Griff-Korrektur: hängt der Gegenstand (Kippe, Glas, Schachtel) schon am Handknochen, wird das Handgelenk so gesetzt, dass der
// Gegenstand selbst am Zielpunkt (pose.at) landet. Der Versatz Handgelenk -> Gegenstand ist in Handkoordinaten fest (item.position) und wird
// mit der GEWÜNSCHTEN Handlage in die Welt gedreht (nicht mit der aktuellen, sonst schaukelt sich Ziel und Lage gegenseitig auf)
function chGripFix(pose,item,B,sd){const hand=B&&B['hand_'+sd];if(!pose||!pose.at||!item||!hand||item.parent!==hand||typeof hdHandFrame!=='function')return pose;
  const fr=hdHandFrame(B,sd);if(!fr||!fr.pal)return pose;
  const fd=pose.fd.clone().normalize();const pd=pose.pal?pose.pal.clone():null;if(!pd)return pose;pd.sub(fd.clone().multiplyScalar(pd.dot(fd)));if(pd.lengthSq()<1e-6)return pose;pd.normalize();
  chFrameQ(fr.fd,fr.pal,wrQ);chFrameQ(fd,pd,wrQ2);const R=wrQ2.clone().multiply(wrQ.invert()); // Handkoordinaten -> gewünschte Weltlage
  pose.p.copy(pose.at).sub(item.position.clone().applyQuaternion(R));return pose;}
// ---- Posen fest im Bild (Kamera-Koordinaten: x rechts, y hoch, z vorn, in m ab Auge) ----
// Die Hand steht damit wie in einem Ego-Shooter fest vor der Kamera (kein Nachziehen beim Laufen, kein Schaukeln), der Arm wird per IK
// von der Schulter aus dazugerechnet. p = Handgelenk oder at = Ankerpunkt des Gegenstands am Handknochen (das Handgelenk ergibt sich daraus),
// fd = Fingerrichtung, pal = Handflächenrichtung (aus der Fläche heraus), pole = Ellbogenrichtung, fp = Fingerhaltung, rate = Tempo pro s
const CH_FPV={
  pack:{fd:[.15,.4,.9],pal:[.5,.85,-.1],pole:[-.9,-.8,-.3],fp:'pack',rate:9,packUp:[0,.96,.28],packFront:[-.12,.28,-.95],packAt:[.03,.07,.045]}, // Schachtel seitlich gehalten wie im Nutzer-Video: Handfläche hinten links, Finger hinten herum, Daumen vorn; Schachtel aufrecht, Vorderseite zu dir // gerade gehalten, Vorderseite schaut zu dir (Nutzer 2026-10-22) // Hochformat (fdP/palP): frontaler, weil der weite Bildwinkel nahe Dinge am Rand stark verzerrt // Schachtel liegt in der Handfläche: Hand schräg von unten links, Vorderseite leicht gedreht und gekippt zur Kamera (man sieht die Oberseite), Daumen vorn, Finger hinten herum
};
const fpvV=(cm,a)=>new THREE.Vector3().addScaledVector(cm.cx,a[0]).addScaledVector(cm.cy,a[1]).addScaledVector(cm.cz,a[2]); // Kamera -> Welt (Richtung)
const fpvP=(cm,a)=>cm.eye.clone().add(fpvV(cm,a)); // Kamera -> Welt (Punkt)
function chCamFrame(){const cq=camera.quaternion;return {eye:camera.position,cx:new THREE.Vector3(1,0,0).applyQuaternion(cq),cy:new THREE.Vector3(0,1,0).applyQuaternion(cq),cz:new THREE.Vector3(0,0,-1).applyQuaternion(cq),ax:typeof HD!=='undefined'&&HD.ax?HD.ax:1};}
function chCamPose(kind,cm,item,B,sd,at){
  const D=CH_FPV[kind];if(!D)return null;const mir=sd==='r'&&D.mirror!==false?-1:1; // Posen sind für die linke Hand gedacht, rechts gespiegelt
  const port=cm.ax<.9,Dfd=port&&D.fdP?D.fdP:D.fd,Dpal=port&&D.palP?D.palP:D.pal;const fd=new THREE.Vector3(Dfd[0]*mir,Dfd[1],Dfd[2]).normalize(),pal=new THREE.Vector3(Dpal[0]*mir,Dpal[1],Dpal[2]);pal.sub(fd.clone().multiplyScalar(pal.dot(fd))).normalize();
  const q=chFrameQ(fd,pal,new THREE.Quaternion());let p;
  const anchor=at?new THREE.Vector3().fromArray(at):D.at?new THREE.Vector3(D.at[0]*mir*cm.ax,D.at[1],D.at[2]):null;
  if(anchor){const fr=item&&B&&typeof hdHandFrame==='function'?hdHandFrame(B,sd):null;
    if(fr&&fr.pal&&item.parent===B['hand_'+sd]){chFrameQ(fr.fd,fr.pal,wrQ);const R=q.clone().multiply(wrQ.clone().invert());p=anchor.clone().sub(item.position.clone().applyQuaternion(R));} // Versatz Handgelenk->Gegenstand mit der gewünschten Handlage gedreht
    else p=anchor.clone().addScaledVector(fd,-.12);}
  else p=new THREE.Vector3(D.p[0]*mir*cm.ax,D.p[1],D.p[2]);
  return {cam:true,p,q,pole:D.pole?new THREE.Vector3(D.pole[0]*mir,D.pole[1],D.pole[2]):null,fp:CH_FPOSE[D.fp]||CH_FPOSE.flat,rate:D.rate||8};
}
// Schachtel in der Hand: Schachtelmitte fest vor der Kamera (hdPackTarget), beim Rausholen/Wegstecken kommt sie von unten / geht nach unten
function chPackPose(n,side,cm){
  if(typeof HD==='undefined'||!HD.pack||!HD.pack.visible||!HD.pack.parent||!HD.pack.parent.isBone)return null;
  const hand=n.rig.bones['hand_'+side];if(HD.pack.parent!==hand)return null;
  const t=hdPackTarget();const e=Math.min(1,HD.packT/.35),lift=HD.packSt==='out'?e:HD.packSt==='in'?1-e:0;
  const P=chCamPose('pack',cm,HD.pack,n.rig.bones,side,[t[0],t[1]-.3*lift,-t[2]]);if(P)P.coll={obj:HD.pack,hx:.028,hy:.044,hz:.011};if(P&&HD.thumbPush&&now-HD.thumbPush<.45)P.fp=CH_FPOSE.packPush;return P; // Finger stoßen an die Schachtel (Kollision in chFingers) // beim Öffnen streckt sich der Daumen zum Deckel
}
// Ziele für beide Hände je nach Lage, dann IK mit weicher Gewichtung (auch für Mitspieler-Figuren)
function chArmsStep(n,dt,ctx){
  const ik=n.ik||(n.ik={r:{w:0,cur:new THREE.Vector3(),has:false},l:{w:0,cur:new THREE.Vector3(),has:false},lean:0});
  const B=n.rig.bones;CH_IKBONES.forEach(k=>{if(B[k])chBoneBase(B[k]);});n.root.updateMatrixWorld(true);
  ik.lean=(ik.lean||0)+((ctx.lean||0)-(ik.lean||0))*Math.min(1,dt*5);
  if(ik.lean>.001){const ax=new THREE.Vector3(ctx.rx,0,ctx.rz);boneRotWorld(B.spine_01,ax,-ik.lean*.26);boneRotWorld(B.spine_02,ax,-ik.lean*.34);boneRotWorld(B.neck_01,ax,ik.lean*.4);} // vorbeugen zum Pult, Kopf bleibt am Bildschirm
  const want={r:ctx.r||null,l:ctx.l||null};
  if(ctx.press){const p=ctx.press;p.t+=dt;const k=p.t<.1?p.t/.1:p.t<.26?1:Math.max(0,1-(p.t-.26)/.14);const r=chBtnRest(p.m,p.key,ctx.fx,ctx.fz,k);if(r)want[p.side]=r;} // Druck = Ruhelage, nur 2 cm tiefer
  // weit entfernte Tasten (links): Mitspieler drehen den Oberkörper mit; die eigene Figur lehnt sich stattdessen seitlich rüber (chFPStep, ik.reach),
  // sonst schwenkt die Drehung den anderen Arm durchs Bild (Nutzer 2026-10-23)
  {const t=want.r;ik.helpT=0;ik.reachT=0;if(t&&t.free){if(ctx.fp&&ctx.base){const lat=(t.p.x-ctx.base.x)*ctx.rx+(t.p.z-ctx.base.z)*ctx.rz;ik.reachT=Math.max(0,Math.min(.2,-.25-lat));} // Taste weiter als 42 cm links der Schulter (Schulter sitzt 17 cm rechts der Mitte)
    else if(B.upperarm_r){const d=B.upperarm_r.getWorldPosition(new THREE.Vector3()).distanceTo(t.p);ik.helpT=Math.max(0,Math.min(1,(d-.46)/.18));}}}
  ik.help=(ik.help||0)+((ik.helpT||0)-(ik.help||0))*Math.min(1,dt*4);ik.reach=(ik.reach||0)+((ik.reachT||0)-(ik.reach||0))*Math.min(1,dt*5);
  if(ik.help>.001){const ax=new THREE.Vector3(ctx.rx,0,ctx.rz),up=new THREE.Vector3(0,1,0);boneRotWorld(B.spine_01,up,ik.help*.3);boneRotWorld(B.spine_02,up,ik.help*.35);boneRotWorld(B.spine_02,ax,-ik.help*.3);boneRotWorld(B.neck_01,up,-ik.help*.5);} // Drehung um die Hochachse bringt die rechte Schulter nach vorn-links, Kopf bleibt am Bildschirm
  ['r','l'].forEach(sd=>{const K=ik[sd],tgt=want[sd];
    if(tgt&&tgt.cam){const cm=ctx.cam,k=Math.min(1,dt*(tgt.rate||8)); // Pose fest im Bild: Glättung in Kamera-Koordinaten (zieht beim Laufen nicht nach)
      if(!K.cp){K.cp=new THREE.Vector3();K.cq=new THREE.Quaternion();}
      if(!K.camMode||!K.has){const hb=B['hand_'+sd],hp=hb.getWorldPosition(new THREE.Vector3()).sub(cm.eye);K.cp.set(hp.dot(cm.cx),hp.dot(cm.cy),hp.dot(cm.cz)); // Einstieg: ab der jetzigen Handlage
        const pw=chPalmWorld(B,sd);let ok=false;if(pw){const f=new THREE.Vector3(pw.fw.dot(cm.cx),pw.fw.dot(cm.cy),pw.fw.dot(cm.cz)).normalize(),pl=new THREE.Vector3(pw.pal.dot(cm.cx),pw.pal.dot(cm.cy),pw.pal.dot(cm.cz));pl.sub(f.clone().multiplyScalar(pl.dot(f)));if(pl.lengthSq()>1e-6){chFrameQ(f,pl.normalize(),K.cq);ok=true;}}
        if(!ok)K.cq.copy(tgt.q);K.camMode=true;K.has=true;}
      K.cp.lerp(tgt.p,k);K.cq.slerp(tgt.q,k);K.cur.copy(fpvP(cm,K.cp.toArray()));
      K.fd=fpvV(cm,new THREE.Vector3(1,0,0).applyQuaternion(K.cq).toArray());K.pal=fpvV(cm,new THREE.Vector3(0,1,0).applyQuaternion(K.cq).toArray());K.pole=tgt.pole?fpvV(cm,tgt.pole.toArray()):null;K.free=true;
      K.w=Math.min(1,K.w+dt*4);K.fp=tgt.fp||null;K.coll=tgt.coll||null;}
    else if(tgt){K.camMode=false;K.free=!!tgt.free;K.coll=tgt.coll||null;const rp=n.root.getWorldPosition(new THREE.Vector3()),off=tgt.p.clone().sub(rp);if(!K.has||!K.off){K.off=off;K.has=true;K.lift=0;}else{const dd=K.off.distanceTo(off);if(tgt.free)K.lift=Math.max(K.lift||0,Math.min(1,dd/.14));K.off.lerp(off,Math.min(1,dt*(ctx.fast?18:7)));}K.lift=(K.lift||0)*Math.max(0,1-dt*5);K.cur.copy(rp).add(K.off);if(K.lift>.001)K.cur.y+=K.lift*.05;K.w=Math.min(1,K.w+dt*4);K.fd=tgt.fd||null;K.pal=tgt.pal||null;K.fp=tgt.fp||null;K.pole=tgt.pole||null;} // 7/s: der Arm zieht weich nach, relativ zum Körper (beim Laufen bleibt die Hand im Bild); beim Wechsel zu einer anderen Taste hebt sich die Hand kurz an (K.lift, bis 5 cm) und setzt dann auf
    else{K.w=Math.max(0,K.w-dt*4);if(K.w<=0){K.has=false;K.camMode=false;K.off=null;}}
    if(K.w>0&&K.has){const o=sd==='r'?.45:-.45;const pole=K.pole||new THREE.Vector3(ctx.rx*o,-1,ctx.rz*o);chArmIK(n,sd,K.cur,K.w,pole); // Ellbogen eher unten als seitlich
      if(K.fd)chWrist(B,sd,K.fd,K.pal,K.w,K.free);
      chFingers(B,sd,K,dt);}});
  CH_IKBONES.forEach(k=>{if(B[k])chBoneDone(B[k]);});
}
// Hand in Weltkoordinaten: fw = Richtung Finger, pal = aus der Handfläche heraus (Finger x Handbreite; Vorzeichen je Seite an der Faust gemessen)
function chPalmWorld(B,sd){const hb=B['hand_'+sd],mid=B['middle_01_'+sd],i1=B['index_01_'+sd],p1=B['pinky_01_'+sd];if(!hb||!mid||!i1||!p1)return null;
  const h=hb.getWorldPosition(new THREE.Vector3()),fw=mid.getWorldPosition(new THREE.Vector3()).sub(h).normalize();
  const ac=p1.getWorldPosition(new THREE.Vector3()).sub(i1.getWorldPosition(new THREE.Vector3()));
  const pal=sd==='r'?new THREE.Vector3().crossVectors(fw,ac):new THREE.Vector3().crossVectors(ac,fw);pal.sub(fw.clone().multiplyScalar(pal.dot(fw)));if(pal.lengthSq()<1e-8)return null;pal.normalize();
  return {h,fw,pal};}
// Finger: jedes Glied weich auf seinen Zielwinkel (ab Datei-Pose), Gewicht wie der Arm
const chFAx=new THREE.Vector3();
// Kollision mit einem gehaltenen Gegenstand (K.coll = {obj, hx,hy,hz} Quader in Objekt-Koordinaten): jedes Glied wird höchstens so weit gebeugt,
// dass das nächste Gelenk, die Gliedmitte und die Fingerspitze außen bleiben (Fingerdicke 8 mm) – die Finger liegen an, statt durchzugehen
const chCP=new THREE.Vector3(),chCP2=new THREE.Vector3(),chQA=new THREE.Quaternion();
function chCollHit(C,b){const ch=b.children.find(c=>c.isBone);if(!ch)return false;const sc=C.obj.scale.x||1,r=.008/sc;
  b.getWorldPosition(chCP2);ch.getWorldPosition(chCP);
  const t=(p)=>{C.obj.worldToLocal(p);return Math.abs(p.x)<C.hx+r&&Math.abs(p.y)<C.hy+r&&Math.abs(p.z)<C.hz+r;};
  const mid=chCP2.clone().add(chCP).multiplyScalar(.5);return t(chCP)||t(mid);}
const chQS=new THREE.Quaternion();
function chFingers(B,sd,K,dt){
  if(!K.fp&&!K.fc)return;const tgt=K.fp||CH_FPOSE.flat;if(!K.fc)K.fc=tgt.map(f=>f.slice());
  const C=K.coll&&K.coll.obj&&K.coll.obj.visible?K.coll:null;if(C)C.obj.updateMatrixWorld(true);
  for(let i=0;i<5;i++)for(let j=0;j<3;j++){const b=B[CH_FING[i]+'_0'+(j+1)+'_'+sd];if(!b||!b.userData.rest)continue;
    K.fc[i][j]+=(tgt[i][j]-K.fc[i][j])*Math.min(1,dt*8);
    if(j===0){const spT=tgt[i][3]||0;K.fc[i][3]=(K.fc[i][3]||0)+(spT-(K.fc[i][3]||0))*Math.min(1,dt*8);}
    if(i===0&&j===0){chFAx.copy(CH_THUMB_AX);if(sd==='l'){chFAx.y=-chFAx.y;chFAx.z=-chFAx.z;}}else chFAx.set(1,0,0);
    const ax=chFAx.clone();chQA.copy(b.quaternion);const sp=j===0?(K.fc[i][3]||0)*Math.PI/180*(sd==='l'?-1:1):0;
    const setA=a=>{ikQ.setFromAxisAngle(ax,a*Math.PI/180);ikQ2.copy(b.userData.rest).multiply(ikQ);
      if(sp){if(i===0){chQS.setFromAxisAngle(new THREE.Vector3(0,0,1),sp*.6);ikQ2.multiply(chQS);chQS.setFromAxisAngle(new THREE.Vector3(0,1,0),-sp*.6);ikQ2.multiply(chQS);}else{chQS.setFromAxisAngle(new THREE.Vector3(0,0,1),sp);ikQ2.multiply(chQS);}} // Daumen zur Hand (Z/Y, gemessen 2026-10-23), Finger spreizen um Z
      b.quaternion.copy(chQA).slerp(ikQ2,K.w);};
    setA(K.fc[i][j]);
    if(C){b.updateMatrixWorld(true);if(chCollHit(C,b)){let lo=-25,hi=K.fc[i][j];setA(lo);b.updateMatrixWorld(true);
        if(!chCollHit(C,b)){for(let it=0;it<7;it++){const m=(lo+hi)/2;setA(m);b.updateMatrixWorld(true);if(chCollHit(C,b))hi=m;else lo=m;}setA(lo);}
        else setA(K.fc[i][j]);}
      b.updateMatrixWorld(true);}}
  if(!K.fp&&K.w<=0)K.fc=null;
}
// ---- eigener Körper in der Ich-Perspektive ----
function chFPStep(dt){
  if(CHR.fail||!CHR.ready||!started)return;
  if(!CHR.fp){const n={root:new THREE.Group(),anim:'idle',t:0,ph:0,lines:[],name:'ICH',F:null,bubbleUntil:0,bubbleEl:null,lx:P.x,lz:P.z,v:0};scene.add(n.root);chAttach(n,Object.assign({seatH:.55,glow:.45},chLookOpts(chLook())));if(!n.rig)return;n.rig.hideHead=true;CHR.fp=n;}
  if(CHR.mirror&&CHR.mirror.rig)chAnimate(CHR.mirror,dt);
  const n=CHR.fp,R=n.rig;if(!R)return;
  const s=typeof mpLocalState==='function'?mpLocalState():{x:P.x,z:P.z,y:P.yaw+Math.PI,a:'walk'};
  const sitting=s.a==='slot'||s.a==='poker'||s.a==='hilo'||s.a==='mtable';
  if(sitting!==R.sit){R.sit=sitting;R.model.position.y=sitting?chSitOffset(n):0;}
  const lean=s.a==='slot'&&n.ik?n.ik.lean||0:0,reach=s.a==='slot'&&n.ik?n.ik.reach||0:0;n.base={x:s.x,z:s.z};
  n.root.position.set(s.x+Math.sin(s.y)*.18*lean+Math.cos(s.y)*reach,0,s.z+Math.cos(s.y)*.18*lean-Math.sin(s.y)*reach);n.root.rotation.y=s.y; // am Automaten etwas vorrücken (Hände ans Pult) und für linke Tasten nach links lehnen (rechts = (-cos,sin))
  const d=Math.hypot(s.x-n.lx,s.z-n.lz);n.lx=s.x;n.lz=s.z;const v=dt>0?d/dt:0;n.v+=(v-n.v)*Math.min(1,dt*10);
  if(sitting)n.anim=s.a;else if(s.a==='elev')n.anim='idle';else n.anim=n.v>4.6?'sprint':n.v>2.3?'run':n.v>.25?'walk':'idle';
  R.tScale=n.anim==='walk'?clamp(n.v/1.5,.6,1.7):n.anim==='run'?clamp(n.v/3.2,.75,1.5):n.anim==='sprint'?clamp(n.v/6,.8,1.3):1;
  n.root.visible=!locked&&EL.phase!=='moving'&&!(openId)&&(!focus||focus.type==='slot'); // nur frei laufend oder am Automaten; an Crash-Terminal/Tischen stünde der Körper vor der Kamera (Nutzer 2026-10-22)
  const cut=sitting&&s.a==='slot'?1:0;if(R.cutVal!==cut){R.cutVal=cut;R.model.traverse(x=>{if(x.isSkinnedMesh&&x.material&&x.material.userData.cut)x.material.userData.cut.value=cut;});if(R.skirt)R.skirt.visible=!cut;} // am Automaten nur Arme + Hände (Shader-Schnitt)
  chAnimate(n,dt);n.root.updateMatrixWorld(true);
  chFPArms(n,dt,s,sitting);
}
// Hände des eigenen Körpers: am Pult, an Tasten, mit Kippe oder Glas
function chFPArms(n,dt,s,sitting){
  const slotM=sitting&&s.a==='slot'&&typeof focus!=='undefined'&&focus&&focus.m?focus.m:null;
  const eye=camera.position;const f=chV.set(0,0,-1).applyQuaternion(camera.quaternion);f.y=0;if(f.lengthSq()<1e-6)f.set(-Math.sin(P.yaw),0,-Math.cos(P.yaw));f.normalize();
  if(slotM)f.set(Math.sin(s.y),0,Math.cos(s.y)); // am Automaten zählt die Sitzrichtung (Kamera fährt erst noch hin)
  const fx=f.x,fz=f.z,rx=-fz,rz=fx;const r=new THREE.Vector3(rx,0,rz); // rechts = vorn x oben
  const ax=typeof HD!=='undefined'&&HD.ax?HD.ax:1; // Hochformat: seitliche Posen näher zur Mitte, sonst sind sie aus dem Bild
  const F={fp:true,ax,pt:(fw,ri,d)=>new THREE.Vector3(eye.x+fx*fw+rx*ri*ax,eye.y-d,eye.z+fz*fw+rz*ri*ax),v:(a,b,c)=>new THREE.Vector3(fx*a+rx*b,c,fz*a+rz*b).normalize()};
  F.sp=(fw,ri,d)=>eye.clone().addScaledVector(F.mf,fw).addScaledVector(F.mr,ri).addScaledVector(F.mu,-d); // Punkt im Blick (vor, rechts, unter dem Auge), folgt der Kamera-Neigung
  if(slotM){const H=n.rig.bones.Head.getWorldPosition(new THREE.Vector3());F.M=H.clone().addScaledVector(f,.1).add(new THREE.Vector3(0,.04,0));F.mf=f.clone();F.mr=r.clone();F.mu=new THREE.Vector3(0,1,0);} // sitzend: Mund am Kopfknochen (Kamera steht vorm Bildschirm)
  else{const cq=camera.quaternion;F.mf=new THREE.Vector3(0,0,-1).applyQuaternion(cq);F.mr=new THREE.Vector3(1,0,0).applyQuaternion(cq);F.mu=new THREE.Vector3(0,1,0).applyQuaternion(cq);
    const mp=typeof HD_MOUTH!=='undefined'?HD_MOUTH:[.012,-.064,-.084];F.M=eye.clone().addScaledVector(F.mr,mp[0]).addScaledVector(F.mu,mp[1]).addScaledVector(F.mf,-mp[2]);} // Mund = Lippen unterhalb der Kamera, wie die Kippe im Mund (hdMouth)
  const ctx={fx,fz,rx,rz,r:null,l:null,press:null,fast:false,cam:chCamFrame(),fp:true,base:n.base||{x:s.x,z:s.z}};
  if(slotM){ctx.lean=1;const pr=chBtnRest(slotM,CHR.restKey||'START',fx,fz);if(pr)ctx.r=pr;} // nur die rechte Hand liegt am Pult (START), die linke bleibt im Schoß (Nutzer 2026-10-22)
  if(typeof HD!=='undefined'){const C=HD.cig,B=n.rig.bones;
    if(C&&C.where==='hand'){const st=HD.seq.length?HD.seq[0].to:'hand';ctx.r=chGripFix(chHandPose(st==='handMouth'?'cigMouth':st==='handAsh'?'cigAsh':'cig',F),HD.mc,B,'r');ctx.fast=st==='handAsh';}
    if(HD.drink){const st=HD.gq&&HD.gq.length?HD.gq[0].to:'glass';
      if(st==='glassSip')ctx.l=chGripFix(chHandPose('glassSip',F),HD.glass,B,'l');
      else if(slotM){const g=slotM.group;ctx.l={p:g.localToWorld(new THREE.Vector3(-.36,1.1,.64)),fd:F.v(.86,0,-.5),pal:F.v(0,1,0),fp:CH_FPOSE.glass};} // Glas aufrecht in der Hand links vorn am Pult (Handfläche zur Mitte)
      else ctx.l=chHandPose('glass',F);}
    if(HD.packSt!=='off'){const pr=chPackPose(n,'r',ctx.cam),pl=chPackPose(n,'l',ctx.cam);if(pr)ctx.r=pr;if(pl)ctx.l=pl;}} // Schachtel in der Hand (links, beim Trinken rechts), fest im Bild
  if(CHR.press){ctx.press=CHR.press;if(CHR.press.t>.5)CHR.press=null;}
  if(ctx.r||ctx.l||ctx.press||ctx.lean||(n.ik&&(n.ik.r.w>0||n.ik.l.w>0||n.ik.lean>.001)))chArmsStep(n,dt,ctx);
}
// Mitspieler: Arm zum Mund beim Ziehen oder Schluck, Hand an der Starttaste beim neuen Dreh, am Automaten Hände aufs Pult
function chAvatarArms(a,dt){
  const n=a.n;if(!n||!n.rig||!n.root.visible)return;const it=a.it;
  const slot=a.mirror&&n.rig.sit&&a.mirror.btns?a.mirror:null;const L=n.ik?n.ik.lean||0:0;n.root.position.z=slot||L>.001?.18*L:0;
  if(!slot&&!(it&&(it.c===2||it.d))&&!a.press&&!(n.ik&&(n.ik.r.w>0||n.ik.l.w>0||n.ik.lean>.001)))return;
  n.root.updateMatrixWorld(true);const f=chV.set(0,0,1).applyQuaternion(n.root.getWorldQuaternion(ikQ2));f.y=0;if(f.lengthSq()<1e-6)return;f.normalize();
  const fx=f.x,fz=f.z,rx=-fz,rz=fx;const r=new THREE.Vector3(rx,0,rz);const ctx={fx,fz,rx,rz,r:null,l:null,press:null,fast:false};const H=n.head.getWorldPosition(new THREE.Vector3());
  const F={pt:(fw,ri,d)=>new THREE.Vector3(H.x+fx*fw+rx*ri,H.y-d,H.z+fz*fw+rz*ri),v:(a,b,c)=>new THREE.Vector3(fx*a+rx*b,c,fz*a+rz*b).normalize(),
    M:H.clone().addScaledVector(f,.1).add(new THREE.Vector3(0,.04,0)),mf:f.clone(),mr:r.clone(),mu:new THREE.Vector3(0,1,0)};F.sp=F.pt;
  if(slot){ctx.lean=1;const pr=chBtnRest(slot,a.restKey||'START',fx,fz);if(pr)ctx.r=pr;} // wie beim eigenen Körper: nur die rechte Hand am Pult
  const I=n.items;if(it&&it.c===2)ctx.r=chGripFix(chHandPose((a.itDrag&&now-a.itDrag<1.3)?'cigMouth':'cig',F),I&&I.ch,n.rig.bones,'r');
  if(it&&it.d)ctx.l=chGripFix(chHandPose((a.itSip&&now-a.itSip<1.2)?'glassSip':'glass',F),I&&I.gl,n.rig.bones,'l');
  if(a.press){ctx.press=a.press;if(a.press.t>.5)a.press=null;}
  chArmsStep(n,dt,ctx);
}
// Kamera weich am Kopfknochen: v wird gefüllt, true wenn verfügbar (nur beim Gehen/Stehen, nicht im Spiel-Fokus)
function chEye(v,dt){
  const n=CHR.fp;if(!n||!n.rig||!n.root.visible||n.rig.sit)return false;
  const h=n.rig.bones.Head.getWorldPosition(chV);const r=n.root.position;const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw);
  // Auge = Versatz zum Kopfknochen (seitliches Wiegen halb, 13 cm vor das Gesicht, sonst sieht man Hals und Schultern von innen).
  // Nur der Versatz wird geglättet, nie die Spielerposition selbst: sonst hängt die Kamera beim Laufen hinter dem Kopf im Körper (Handy, 30 fps)
  // Kopf-Versatz zum Körper: nach vorn voll (Lauf- und Sprint-Animation beugen den Kopf 10-25 cm vor), seitlich nur halb (Wiegen)
  const dx=h.x-r.x,dz=h.z-r.z,fw=dx*fx+dz*fz,sx=dx-fx*fw,sz=dz-fz*fw;
  const ox=fx*(fw+.13)+sx*.5,oz=fz*(fw+.13)+sz*.5,oy=1.6*.35+(h.y+.06)*.65;
  const k=1-Math.exp(-(dt||.016)*14);
  if(!CHR.eye)CHR.eye=new THREE.Vector3(ox,oy,oz);else{CHR.eye.x+=(ox-CHR.eye.x)*k;CHR.eye.y+=(oy-CHR.eye.y)*k;CHR.eye.z+=(oz-CHR.eye.z)*k;}
  v.set(P.x+CHR.eye.x,CHR.eye.y,P.z+CHR.eye.z);return true;
}
chLoad();
