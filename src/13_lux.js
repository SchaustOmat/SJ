/* =========================================================
   SJ SPIELBANK – edle Ausstattung: Teppich mit Goldmuster, Holzvertäfelung mit Seidentapete,
   Kassettendecke, Marmorsäulen, Kronleuchter, Gemälde und Gaming-Stühle vor den Automaten.
   ========================================================= */
// Spielbank-Teppich: tiefes Rot (oder Grün) mit goldenem Rautenmuster und Blüten
function luxCarpet(base,gold,accent){return (g,w,h)=>{noisy(g,w,h,base,8);
  g.fillStyle=gold;for(let i=0;i<w;i++){g.fillRect(i,(i+w/2)%h,1,1);g.fillRect(i,(w/2*3-i)%h,1,1);g.fillRect(i,i%h,1,1);g.fillRect(i,(h-1-i+h)%h,1,1);}
  const flower=(cx,cy,c,r)=>{g.fillStyle=c;for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){const d=Math.abs(x)+Math.abs(y);if(d<=r&&(d===r||d===0))g.fillRect((cx+x+w)%w,(cy+y+h)%h,1,1);}};
  flower(0,0,gold,4);flower(w/2,h/2,gold,4);flower(w/2,0,accent,3);flower(0,h/2,accent,3);
  flower(w/4,h/4,accent,1);flower(w*3/4,h/4,accent,1);flower(w/4,h*3/4,accent,1);flower(w*3/4,h*3/4,accent,1);};}
// Wand: unten dunkle Holzvertäfelung mit Goldleiste, oben Seidentapete mit Damastmuster
function luxWall(silk,wood){return (g,w,h)=>{
  noisy(g,w,h,silk,10);g.fillStyle='rgba(255,215,120,.22)';
  for(let y=4;y<h/2;y+=12)for(let x=(y/12|0)%2?8:0;x<w;x+=16){g.fillRect(x+3,y,2,1);g.fillRect(x+2,y+1,4,1);g.fillRect(x+1,y+2,6,2);g.fillRect(x+2,y+4,4,1);g.fillRect(x+3,y+5,2,2);}
  for(let y=h/2;y<h;y++)for(let x=0;x<w;x++){g.fillStyle=shade(wood,Math.round(Math.sin(x*.7+y*.05)*5+(rnd()-.5)*8));g.fillRect(x,y,1,1);}
  g.fillStyle='rgba(0,0,0,.35)';[2,w/2+2].forEach(x=>{g.fillRect(x,h/2+5,w/2-4,1);g.fillRect(x,h-4,w/2-4,1);g.fillRect(x,h/2+5,1,h/2-9);g.fillRect(x+w/2-5,h/2+5,1,h/2-9);});
  g.fillStyle='rgba(255,220,150,.18)';[2,w/2+2].forEach(x=>{g.fillRect(x+1,h/2+6,w/2-6,1);g.fillRect(x+1,h/2+6,1,h/2-11);});
  g.fillStyle='#d6a02a';g.fillRect(0,h/2,w,2);g.fillStyle='#fff0a0';g.fillRect(0,h/2,w,1);g.fillStyle='#d6a02a';g.fillRect(0,0,w,1);};}
// Kassettendecke: dunkles Holz mit Goldrahmen
function luxCeil(g,w,h){noisy(g,w,h,'#2a1608',8);g.fillStyle='#120a04';g.fillRect(3,3,w-6,h-6);
  for(let y=4;y<h-4;y++)for(let x=4;x<w-4;x++){g.fillStyle=shade('#3a2010',Math.round((rnd()-.5)*8));g.fillRect(x,y,1,1);}
  g.fillStyle='#b8862a';g.fillRect(2,2,w-4,1);g.fillRect(2,2,1,h-4);g.fillRect(2,h-3,w-4,1);g.fillRect(w-3,2,1,h-4);
  g.fillStyle='#ffd870';g.fillRect(w/2-1,h/2-1,2,2);}
// Marmor (hell mit Adern) für Säulen und Bartresen
function luxMarble(base,vein){return (g,w,h)=>{noisy(g,w,h,base,10);g.fillStyle=vein;
  for(let k=0;k<3;k++){let x=rnd()*w,y=0;while(y<h){g.fillRect(x|0,y|0,1,1);x+=(rnd()-.5)*2.4;y+=.7;if(x<0)x+=w;if(x>=w)x-=w;}}};}
function luxPillar(F,x,z,mat){const g=F.group;const goldM=lam({color:0xd6a02a,emissive:0x2a1800});
  const p=mesh(new THREE.CylinderGeometry(.34,.34,3.6,12),mat,x,2,z,g);blocker(F,p);col(F,x,z,.75,.75);
  mesh(new THREE.CylinderGeometry(.44,.44,.2,12),goldM,x,.1,z,g);mesh(new THREE.CylinderGeometry(.4,.36,.14,12),goldM,x,.27,z,g);
  mesh(new THREE.CylinderGeometry(.36,.44,.16,12),goldM,x,3.74,z,g);mesh(new THREE.CylinderGeometry(.48,.48,.1,12),goldM,x,3.86,z,g);
  mesh(new THREE.CylinderGeometry(.345,.345,.05,12),goldM,x,2.6,z,g);}
// Kronleuchter: Goldringe, Kerzen, Kristalle, warmes Licht
function chandelier(F,x,z,s){s=s||1;const g=new THREE.Group();g.position.set(x,4,z);F.group.add(g);
  const goldM=lam({color:0xe8b840,emissive:0x3a2400}),cry=new THREE.MeshBasicMaterial({color:0xf4f8ff,transparent:true,opacity:.85}),flame=new THREE.MeshBasicMaterial({color:0xffe6a0});
  mesh(new THREE.CylinderGeometry(.02,.02,.5,4),goldM,0,-.25,0,g);
  [[.55,-.62,8],[.34,-.86,6]].forEach(([r,y,n])=>{const ring=mesh(new THREE.TorusGeometry(r*s,.025,4,16),goldM,0,y,0,g);ring.rotation.x=Math.PI/2;
    for(let i=0;i<n;i++){const a=i/n*TAU,cx=Math.cos(a)*r*s,cz=Math.sin(a)*r*s;
      mesh(new THREE.CylinderGeometry(.018,.018,.12,4),new THREE.MeshBasicMaterial({color:0xfff6e0}),cx,y+.07,cz,g);mesh(new THREE.OctahedronGeometry(.03),flame,cx,y+.16,cz,g);
      mesh(new THREE.OctahedronGeometry(.035),cry,cx,y-.12,cz,g);mesh(new THREE.OctahedronGeometry(.022),cry,cx,y-.2,cz,g);}});
  for(let i=0;i<10;i++){const a=i/10*TAU;mesh(new THREE.OctahedronGeometry(.03),cry,Math.cos(a)*.18*s,-1.02-(i%2)*.06,Math.sin(a)*.18*s,g);}
  mesh(new THREE.SphereGeometry(.09,8,6),cry,0,-1.06,0,g);
  pointLight(F,0xffd8a0,x,3.05,z,1.05,10);return g;}
// Gemälde mit Goldrahmen (abstrakte Landschaft, selbst gemalt)
function luxPainting(F,x,y,z,rotY,w,h,seedN){const tex=canvasTex(48,32,(g,W,H)=>{seed=seedN||77;
    const sky=g.createLinearGradient(0,0,0,H);sky.addColorStop(0,['#3a5a8a','#8a4a3a','#2a3a2a'][seedN%3]);sky.addColorStop(1,'#e8c890');g.fillStyle=sky;g.fillRect(0,0,W,H);
    for(let k=0;k<3;k++){g.fillStyle=['#4a3a20','#2a4a2a','#6a5a3a'][k];g.beginPath();g.moveTo(0,H);for(let x=0;x<=W;x+=4)g.lineTo(x,H*(.45+k*.15)+Math.sin(x*.2+k+seedN)*3+rnd()*2);g.lineTo(W,H);g.fill();}
    g.fillStyle='rgba(255,240,200,.6)';g.beginPath();g.arc(W*.7,H*.25,3,0,TAU);g.fill();});
  const grp=new THREE.Group();grp.position.set(x,y,z);grp.rotation.y=rotY;F.group.add(grp);
  box(w+.16,h+.16,.05,lam({color:0xc8962a,emissive:0x2a1800}),0,0,0,grp);mesh(new THREE.PlaneGeometry(w,h),lam({map:tex}),0,0,.03,grp);}
// Gaming-Stuhl im Rennsitz-Stil vor jedem Automaten (Farbe = Automatenfarbe)
function gamingChair(parent,accent){const c=new THREE.Group();parent.add(c);
  const blk=lam({color:0x16161a}),acc=lam({color:accent,emissive:new THREE.Color(accent).multiplyScalar(.12)}),chr=lam({color:0x9aa0aa});
  // Fußkreuz mit Rollen
  for(let i=0;i<5;i++){const a=i/5*TAU+.3,leg=box(.05,.04,.32,blk,Math.sin(a)*.16,.09,Math.cos(a)*.16,c);leg.rotation.y=a;
    mesh(new THREE.SphereGeometry(.035,6,4),blk,Math.sin(a)*.31,.035,Math.cos(a)*.31,c);}
  mesh(new THREE.CylinderGeometry(.03,.03,.36,6),chr,0,.28,0,c);mesh(new THREE.CylinderGeometry(.06,.07,.08,8),blk,0,.11,0,c);
  // Sitz mit Seitenwangen
  box(.5,.09,.5,blk,0,.5,0,c);box(.08,.07,.48,acc,-.23,.57,0,c);box(.08,.07,.48,acc,.23,.57,0,c);box(.24,.012,.4,acc,0,.548,0,c);
  // Armlehnen
  [-.29,.29].forEach(x=>{box(.04,.2,.04,blk,x,.62,.06,c);box(.07,.035,.24,blk,x,.73,.02,c);});
  // Rückenlehne mit Flügeln, Streifen, Kopfkissen und Gurtschlitzen (leicht nach hinten geneigt)
  const back=new THREE.Group();back.position.set(0,.55,.24);back.rotation.x=.14;c.add(back);
  box(.5,.86,.09,blk,0,.45,0,back);box(.1,.5,.1,acc,-.22,.38,-.005,back);box(.1,.5,.1,acc,.22,.38,-.005,back);
  box(.06,.7,.095,acc,-.12,.48,-.002,back);box(.06,.7,.095,acc,.12,.48,-.002,back);
  box(.56,.12,.1,blk,0,.82,0,back);box(.12,.08,.1,acc,-.25,.84,0,back);box(.12,.08,.1,acc,.25,.84,0,back);
  box(.05,.1,.1,new THREE.MeshBasicMaterial({color:0x050505}),-.1,.7,-.01,back);box(.05,.1,.1,new THREE.MeshBasicMaterial({color:0x050505}),.1,.7,-.01,back);
  box(.24,.12,.06,acc,0,.72,-.07,back);box(.24,.12,.07,acc,0,.22,-.07,back);
  return c;}
