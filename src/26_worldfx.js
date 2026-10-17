/* =========================================================
   HALLEN-ATMOSPHÄRE: Lichtkegel unter den Lampen, Staub in der Luft,
   pulsierende Neonschilder, Automaten im Lockmodus
   ========================================================= */
let coneTex=null;
function coneTexture(){
  if(coneTex)return coneTex;
  coneTex=canvasTex(8,64,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.25,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,.12)');g.fillStyle=gr;g.fillRect(0,0,w,h);});
  return coneTex;
}
function addAtmos(F){
  F.atmos={cones:[],dust:null};
  // Lichtkegel
  F.lights.forEach(L=>{const p=L.l.position,h=p.y,c=new THREE.Color(L.l.color);
    const mat=new THREE.MeshBasicMaterial({map:coneTexture(),color:c,transparent:true,opacity:.11,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false});
    const m=new THREE.Mesh(new THREE.ConeGeometry(Math.min(2.2,L.l.distance*.2),h,18,1,true),mat);m.position.set(p.x,h/2,p.z);F.group.add(m);
    F.atmos.cones.push({m,L,ph:Math.random()*6});});
  // Staub
  const N=320,pos=new Float32Array(N*3),seed=[];
  for(let i=0;i<N;i++){pos[i*3]=(Math.random()-.5)*23;pos[i*3+1]=.2+Math.random()*3.6;pos[i*3+2]=(Math.random()-.5)*23;seed.push(Math.random()*TAU);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const dust=new THREE.Points(geo,new THREE.PointsMaterial({color:0xffe8c8,size:.035,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false}));
  F.group.add(dust);F.atmos.dust={pts:dust,pos,seed};
}
function worldFxStep(F,dt){
  if(!F.atmos)addAtmos(F);
  const A=F.atmos;
  A.cones.forEach(c=>{const k=c.L.base?c.L.l.intensity/c.L.base:1;c.m.material.opacity=(.11+.035*Math.sin(now*1.3+c.ph))*k;});
  const D=A.dust,p=D.pos;
  for(let i=0;i<D.seed.length;i++){const s=D.seed[i];p[i*3]+=Math.sin(now*.3+s)*dt*.08;p[i*3+1]+=Math.cos(now*.25+s*1.7)*dt*.05+dt*.02;p[i*3+2]+=Math.cos(now*.2+s)*dt*.08;
    if(p[i*3+1]>3.9)p[i*3+1]=.2;}
  D.pts.geometry.attributes.position.needsUpdate=true;
  // Neonschilder atmen und flackern ab und zu
  (F.signs||[]).forEach((m,i)=>{const fl=Math.random()<.004?.35:1;m.material.color.setScalar((.78+.22*Math.sin(now*2.2+i*1.7))*fl);});
}
