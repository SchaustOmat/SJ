/* =========================================================
   SPIELAUTOMATEN  (Grabkammer = Buch-Spiel, Glutofen = Früchte)
   ========================================================= */
const R_=(a,k)=>{const o={};k.forEach((s,i)=>o[s]=a[i]);return o;};
const BK=['10','J','Q','K','A','ANKH','SKARAB','PYRAMIDE','MASKE','BUCH'];
const FK=['KIRSCHE','ZITRONE','ORANGE','PFLAUME','TRAUBE','MELONE','SIEBEN','STERN'];
SlotEngine.setup('book',[R_([6,6,5,5,4,3,2,2,1,1],BK),R_([7,7,6,6,5,3,3,2,1,1],BK),R_([7,7,6,6,5,3,3,2,1,2],BK),R_([8,7,7,6,6,3,3,2,1,1],BK),R_([8,8,7,7,6,3,3,2,1,1],BK)],101);
SlotEngine.setup('fruit',[R_([4,5,5,5,3,3,2,1],FK),R_([4,5,5,5,3,3,2,1],FK),R_([4,5,5,5,3,3,2,1],FK),R_([4,5,5,5,3,3,2,1],FK),R_([4,5,5,5,3,3,2,2],FK)],202);
(function(){
  const BASE=[[6,6,6,5,5,3,3,2,1,1],[7,7,6,6,5,3,3,2,2,1],[7,7,6,6,5,3,3,2,2,2],[8,7,7,6,6,3,3,2,2,1],[8,8,7,7,6,3,3,2,1,1]];
  const MINEFS=[[6,6,6,5,5,3,3,2,1,1],[7,7,6,6,5,3,3,2,5,1],[7,7,6,6,5,3,3,2,5,2],[8,7,7,6,6,3,3,2,5,1],[8,8,7,7,6,3,3,2,1,1]];
  const K={viking:['10','J','Q','K','A','AXT','SCHILD','DRACHE','HELM','RUNE'],mine:['10','J','Q','K','A','LATERNE','HACKE','NUGGET','DIAMANT','LORE'],
    reef:['10','J','Q','K','A','FISCH','SEESTERN','PERLE','DELFIN','MUSCHEL'],temple:['10','J','Q','K','A','KELCH','SCHLANGE','STATUE','FEUER','TEMPEL']};
  const mk=(id,rows)=>rows.map(a=>R_(a,K[id]));
  SlotEngine.setup('viking',mk('viking',BASE),301,null,1.34);
  SlotEngine.setup('mine',mk('mine',BASE),302,mk('mine',MINEFS),1.48);
  SlotEngine.setup('reef',mk('reef',BASE),303,null,.8);
  SlotEngine.setup('temple',mk('temple',BASE),304,null,1.35);
})();
const GAMEINFO={book:{rtp:'94,4',fs:'187',hit:'2,7'},fruit:{rtp:'94,1',fs:null,hit:'5,2'},viking:{rtp:'94',fs:'203',hit:'3,3'},mine:{rtp:'94',fs:'203',hit:'3,3'},reef:{rtp:'94',fs:'203',hit:'3,3'},temple:{rtp:'94',fs:'203',hit:'3,3'}};
const stripsFor=m=>SlotEngine.stripsOf(m.G,!!m.useFs);
const LINECOL=['#ffd23a','#ff3a3a','#3adf5a','#4af0ff','#ff5ab0','#ff8a1a','#b07aff','#e8e8e8','#7aff5a','#5a8aff'];

/* ---------- symbol art (procedural, 48px) ---------- */
const SYMC={};
function symCanvas(id){
  if(SYMC[id])return SYMC[id];
  const c=document.createElement('canvas');c.width=c.height=48;const g=c.getContext('2d');
  const gold=(y0,y1)=>{const gr=g.createLinearGradient(0,y0,0,y1);gr.addColorStop(0,'#fff2a0');gr.addColorStop(.45,'#e8b020');gr.addColorStop(1,'#8a5a08');return gr;};
  const letter=(t,c1,c2,size)=>{px(g,size||26);g.textAlign='center';g.textBaseline='middle';
    const gr=g.createLinearGradient(0,8,0,40);gr.addColorStop(0,c1);gr.addColorStop(1,c2);
    g.lineWidth=6;g.strokeStyle='#120a04';g.strokeText(t,25,27);g.lineWidth=2;g.strokeStyle=gold(8,40);g.strokeText(t,24,26);g.fillStyle=gr;g.fillText(t,24,26);};
  switch(id){
    case '10':letter('10','#ffb060','#c04a00',18);break;
    case 'J':letter('J','#7affd8','#0a8a6a');break;
    case 'Q':letter('Q','#ff9aff','#9a1a9a');break;
    case 'K':letter('K','#8ac8ff','#1a4ac0');break;
    case 'A':letter('A','#ff8a8a','#b01020');break;
    case 'ANKH':{g.lineCap='round';g.strokeStyle='#3a2404';g.lineWidth=9;
      g.beginPath();g.ellipse(24,14,7,9,0,0,TAU);g.moveTo(24,23);g.lineTo(24,44);g.moveTo(11,26);g.lineTo(37,26);g.stroke();
      g.strokeStyle=gold(4,44);g.lineWidth=5;g.beginPath();g.ellipse(24,14,7,9,0,0,TAU);g.moveTo(24,23);g.lineTo(24,44);g.moveTo(11,26);g.lineTo(37,26);g.stroke();break;}
    case 'SKARAB':{g.fillStyle='#ff8a1a';g.beginPath();g.arc(24,8,6,0,TAU);g.fill();
      g.strokeStyle=gold(10,46);g.lineWidth=2;for(let i=0;i<3;i++){g.beginPath();g.moveTo(16,22+i*7);g.lineTo(6,18+i*9);g.moveTo(32,22+i*7);g.lineTo(42,18+i*9);g.stroke();}
      g.fillStyle='#0a3a3a';g.beginPath();g.ellipse(24,30,11,14,0,0,TAU);g.fill();
      const gr=g.createLinearGradient(12,18,36,44);gr.addColorStop(0,'#5af0d0');gr.addColorStop(1,'#0a5a8a');g.fillStyle=gr;
      g.beginPath();g.ellipse(19,31,6,12,-.15,0,TAU);g.fill();g.beginPath();g.ellipse(29,31,6,12,.15,0,TAU);g.fill();
      g.fillStyle='#1a1a1a';g.beginPath();g.ellipse(24,16,6,4,0,0,TAU);g.fill();g.fillStyle=gold(14,20);g.fillRect(21,15,6,2);break;}
    case 'PYRAMIDE':{const sg=g.createRadialGradient(36,10,1,36,10,12);sg.addColorStop(0,'#fff2a0');sg.addColorStop(1,'rgba(255,140,30,0)');g.fillStyle=sg;g.fillRect(20,0,28,24);
      g.fillStyle='#d8a050';g.beginPath();g.moveTo(24,6);g.lineTo(46,42);g.lineTo(2,42);g.closePath();g.fill();
      g.fillStyle='#8a5a20';g.beginPath();g.moveTo(24,6);g.lineTo(46,42);g.lineTo(26,42);g.closePath();g.fill();
      g.strokeStyle='rgba(60,30,0,.5)';g.lineWidth=1;for(let y=14;y<42;y+=6){g.beginPath();g.moveTo(24-(y-6)*.61,y);g.lineTo(24+(y-6)*.61,y);g.stroke();}
      g.fillStyle='#fff';g.beginPath();g.ellipse(20,30,5,3,0,0,TAU);g.fill();g.fillStyle='#1a4ac0';g.beginPath();g.arc(20,30,2,0,TAU);g.fill();
      g.strokeStyle='#120a04';g.lineWidth=1.5;g.beginPath();g.moveTo(14,27);g.quadraticCurveTo(20,24,26,27);g.stroke();break;}
    case 'MASKE':{g.fillStyle='#1a3a9a';g.beginPath();g.moveTo(10,10);g.lineTo(38,10);g.lineTo(46,44);g.lineTo(2,44);g.closePath();g.fill();
      g.fillStyle=gold(4,46);for(let i=0;i<7;i++){g.beginPath();const y=12+i*4.6;g.moveTo(10-(y-10)*.24,y);g.lineTo(38+(y-10)*.24,y);g.lineTo(38+(y+2)*.24-2.4,y+2);g.lineTo(10-(y+2)*.24+2.4,y+2);g.fill();}
      g.fillStyle=gold(2,14);g.beginPath();g.ellipse(24,8,14,6,0,Math.PI,TAU);g.fill();g.fillRect(10,7,28,5);
      g.fillStyle=gold(12,40);g.beginPath();g.ellipse(24,26,10,13,0,0,TAU);g.fill();
      g.fillStyle='#120a04';g.fillRect(16,22,6,2);g.fillRect(26,22,6,2);g.fillRect(14,23,2,1);g.fillRect(32,23,2,1);
      g.fillStyle='#fff';g.fillRect(18,22,2,2);g.fillRect(28,22,2,2);g.fillStyle='#8a3a10';g.fillRect(21,33,6,2);
      g.fillStyle='#1a3a9a';g.fillRect(21,38,6,8);g.fillStyle=gold(38,46);g.fillRect(21,40,6,1);g.fillRect(21,43,6,1);
      g.fillStyle='#ff3a2a';g.beginPath();g.arc(24,6,2.5,0,TAU);g.fill();break;}
    case 'BUCH':{g.fillStyle='#e8dcb0';g.fillRect(9,6,33,38);g.fillStyle='#b0a070';for(let y=8;y<44;y+=2)g.fillRect(40,y,2,1);
      const cg=g.createLinearGradient(4,4,40,44);cg.addColorStop(0,'#c03a1a');cg.addColorStop(1,'#5a1006');g.fillStyle=cg;g.fillRect(5,4,33,38);
      g.strokeStyle=gold(4,42);g.lineWidth=2;g.strokeRect(7,6,29,34);g.strokeRect(10,9,23,28);
      g.fillStyle=gold(14,34);g.beginPath();g.arc(21.5,23,7,0,TAU);g.fill();g.fillStyle='#5a1006';g.beginPath();g.arc(21.5,23,4,0,TAU);g.fill();
      g.fillStyle=gold(14,34);g.fillRect(13,22,17,2);g.fillStyle='rgba(255,255,255,.25)';g.fillRect(5,4,3,38);break;}
    case 'KIRSCHE':{g.strokeStyle='#2a8a1a';g.lineWidth=3;g.beginPath();g.moveTo(16,30);g.quadraticCurveTo(20,10,32,6);g.moveTo(32,32);g.quadraticCurveTo(32,16,32,6);g.stroke();
      g.fillStyle='#3adf5a';g.beginPath();g.ellipse(38,8,8,4,-.4,0,TAU);g.fill();
      [[15,34],[32,36]].forEach(([x,y])=>{const r=g.createRadialGradient(x-3,y-3,1,x,y,10);r.addColorStop(0,'#ff8a8a');r.addColorStop(.5,'#e8102a');r.addColorStop(1,'#6a0010');g.fillStyle=r;g.beginPath();g.arc(x,y,9.5,0,TAU);g.fill();});break;}
    case 'ZITRONE':{const r=g.createRadialGradient(18,18,2,24,26,20);r.addColorStop(0,'#fffac0');r.addColorStop(.6,'#ffe020');r.addColorStop(1,'#b08a00');g.fillStyle=r;
      g.beginPath();g.ellipse(24,26,18,14,-.2,0,TAU);g.fill();g.beginPath();g.ellipse(6,30,4,3,0,0,TAU);g.ellipse(42,22,4,3,0,0,TAU);g.fill();break;}
    case 'ORANGE':{const r=g.createRadialGradient(18,20,2,24,26,19);r.addColorStop(0,'#ffd090');r.addColorStop(.6,'#ff8a10');r.addColorStop(1,'#a04a00');g.fillStyle=r;
      g.beginPath();g.arc(24,27,17,0,TAU);g.fill();g.fillStyle='rgba(120,50,0,.35)';for(let i=0;i<20;i++)g.fillRect(12+(i*7%24),16+(i*11%22),1,1);
      g.fillStyle='#2a8a1a';g.beginPath();g.ellipse(30,9,8,3.5,-.5,0,TAU);g.fill();break;}
    case 'PFLAUME':{const r=g.createRadialGradient(18,20,2,24,27,19);r.addColorStop(0,'#e0a0ff');r.addColorStop(.55,'#7a2aba');r.addColorStop(1,'#2a0a4a');g.fillStyle=r;
      g.beginPath();g.ellipse(24,27,15,18,.3,0,TAU);g.fill();g.strokeStyle='rgba(30,0,40,.5)';g.lineWidth=1.5;g.beginPath();g.moveTo(22,11);g.quadraticCurveTo(30,26,24,44);g.stroke();
      g.strokeStyle='#5a3a10';g.lineWidth=2.5;g.beginPath();g.moveTo(22,10);g.lineTo(26,3);g.stroke();break;}
    case 'TRAUBE':{g.strokeStyle='#5a3a10';g.lineWidth=2.5;g.beginPath();g.moveTo(24,8);g.lineTo(26,2);g.stroke();g.fillStyle='#3adf5a';g.beginPath();g.ellipse(33,7,8,4,.3,0,TAU);g.fill();
      const pts=[[16,13],[24,12],[32,13],[12,21],[20,21],[28,21],[36,21],[16,29],[24,29],[32,29],[20,37],[28,37],[24,44]];
      pts.forEach(([x,y])=>{const r=g.createRadialGradient(x-2,y-2,.5,x,y,5.5);r.addColorStop(0,'#c8a0ff');r.addColorStop(.6,'#5a2a9a');r.addColorStop(1,'#1a0a3a');g.fillStyle=r;g.beginPath();g.arc(x,y,5.2,0,TAU);g.fill();});break;}
    case 'MELONE':{const r=g.createRadialGradient(18,18,2,24,25,21);r.addColorStop(0,'#a0ff80');r.addColorStop(.6,'#2a9a2a');r.addColorStop(1,'#0a4a0a');g.fillStyle=r;
      g.beginPath();g.ellipse(24,25,20,17,0,0,TAU);g.fill();g.strokeStyle='#0a4a0a';g.lineWidth=2.5;for(let i=-2;i<=2;i++){g.beginPath();g.ellipse(24,25,Math.abs(i)*5+1,17,0,0,TAU);g.stroke();}break;}
    case 'SIEBEN':{px(g,36);g.textAlign='center';g.textBaseline='middle';g.lineWidth=7;g.strokeStyle='#ffe020';g.strokeText('7',25,27);
      const gr=g.createLinearGradient(0,8,0,44);gr.addColorStop(0,'#ff6a6a');gr.addColorStop(1,'#8a0010');g.fillStyle=gr;g.fillText('7',25,27);g.lineWidth=1;g.strokeStyle='#5a0000';g.strokeText('7',25,27);break;}
    case 'STERN':{const sg=g.createRadialGradient(24,24,2,24,24,24);sg.addColorStop(0,'rgba(255,240,120,.9)');sg.addColorStop(1,'rgba(255,140,0,0)');g.fillStyle=sg;g.fillRect(0,0,48,48);
      g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?8:20;g.lineTo(24+Math.cos(a)*r,25+Math.sin(a)*r);}g.closePath();
      const gr=g.createLinearGradient(0,6,0,44);gr.addColorStop(0,'#fff8a0');gr.addColorStop(1,'#ff9a00');g.fillStyle=gr;g.fill();g.strokeStyle='#8a4a00';g.lineWidth=2;g.stroke();break;}
    default:if(typeof EXTRA_SYM!=='undefined'&&EXTRA_SYM[id])EXTRA_SYM[id](g);
  }
  SYMC[id]=c;return c;
}
const SYMNAME={'10':'ZEHN','J':'BUBE','Q':'DAME','K':'KÖNIG','A':'ASS','ANKH':'ANKH','SKARAB':'SKARABÄUS','PYRAMIDE':'PYRAMIDE','MASKE':'MASKE','BUCH':'BUCH',
  'KIRSCHE':'KIRSCHE','ZITRONE':'ZITRONE','ORANGE':'ORANGE','PFLAUME':'PFLAUME','TRAUBE':'TRAUBE','MELONE':'MELONE','SIEBEN':'SIEBEN','STERN':'STERN'};

/* ---------- cabinet ---------- */
const BTN_DEF=[['INFO',-.345,.095],['RISIKO',-.225,.115],['LINIEN',-.09,.115],['EINSATZ',.045,.115],['AUTO',.17,.095],['START',.315,.16]];
function buildMachine(F,x,z,rotY,gameId,accent){
  const G=SlotEngine.GAMES[gameId];
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rotY;F.group.add(g);
  const body=lam({map:T.metal,color:0x2a2a34}),trim=lam({map:T.metal,color:accent}),dark=lam({color:0x0c0a10}),chrome=lam({map:T.metal,color:0xd0d4e0});
  box(.9,.95,.75,body,0,.475,0,g);
  box(.92,.05,.77,chrome,0,.96,0,g);
  box(.5,.07,.12,dark,0,.52,.39,g);
  const deck=new THREE.Group();deck.position.set(0,1.03,.33);deck.rotation.x=.32;g.add(deck);
  box(.9,.05,.34,dark,0,0,0,deck);
  box(.9,.02,.02,trim,0,.02,.17,deck);
  box(.9,.78,.5,body,0,1.48,-.1,g);
  const scrTex=canvasTex(320,240,null);
  const scrMesh=mesh(new THREE.PlaneGeometry(.72,.54),bas({map:scrTex}),0,1.47,.153,g);
  [[0,1.76,.8,.04],[0,1.18,.8,.04]].forEach(([bx,by,w,h])=>box(w,h,.04,trim,bx,by,.15,g));
  box(.04,.62,.04,trim,-.38,1.47,.15,g);box(.04,.62,.04,trim,.38,1.47,.15,g);
  box(.9,.52,.44,body,0,2.13,-.13,g);
  const topTex=canvasTex(256,128,null);
  mesh(new THREE.PlaneGeometry(.74,.37),bas({map:topTex}),0,2.13,.093,g);
  const crown=bas({color:accent});box(.94,.09,.48,crown,0,2.44,-.13,g);
  const brand=labelTex(160,20,(c,w,h)=>{c.fillStyle='#0a0610';c.fillRect(0,0,w,h);px(c,9);c.textAlign='center';c.textBaseline='middle';c.fillStyle='#fff';c.fillStyle='#ff2e88';c.fillText('SPIELOMAT '+SPIELOMAT.ver,w/2,h/2+1);});
  mesh(new THREE.PlaneGeometry(.5,.065),bas({map:brand}),0,1.82,.155,g);
  const ledMat=bas({color:accent});
  box(.03,2.2,.03,ledMat,-.465,1.3,.1,g);box(.03,2.2,.03,ledMat,.465,1.3,.1,g);
  // stool
  const stool=new THREE.Group();g.add(stool);stool.position.set(0,0,.98);
  mesh(new THREE.CylinderGeometry(.04,.14,.65,6),lam({color:0x2a2a30}),0,.32,0,stool);
  mesh(new THREE.CylinderGeometry(.23,.23,.09,8),lam({color:0x6a1020}),0,.69,0,stool);
  const m={F,G,defG:G,scrMesh,group:g,deck,scr:scrTex,top:topTex,ledMat,accent,btns:{},state:'idle',lines:G.lines.length,betIdx:0,win:0,disp:0,
    reels:[0,1,2,3,4].map(i=>({pos:Math.random()*G.strips[i].length,spin:false,stopAt:0,target:0,bounce:0,teased:false})),
    stops:[0,0,0,0,0],grid:null,ev:null,present:null,fs:null,gamble:null,auto:false,info:false,npc:null,demoNext:now+3+Math.random()*6,demo:false,
    msg:'',dirty:true,topDirty:true,stateT:0,timer:0,expand:null,history:[]};
  m.stops=m.reels.map(r=>Math.floor(r.pos)%1000);m.reels.forEach((r,i)=>{r.pos=Math.floor(r.pos);m.stops[i]=r.pos;});
  m.grid=SlotEngine.grid(G,m.stops);
  BTN_DEF.forEach(([key,bx,bw])=>{
    const tex=labelTex(64,40,null);
    const top=bas({map:tex,color:0x666666});
    const side=lam({color:0x1a1a1a});
    const b=mesh(new THREE.BoxGeometry(bw,.03,.085),[side,side,top,side,side,side],bx,.035,.03,deck);
    const act={type:'mbtn',m,key};b.userData.act=act;F.hits.push(b);
    m.btns[key]={mesh:b,tex,mat:top,label:'',color:'',lit:false,blink:false,press:0};
  });
  const fx=Math.sin(rotY),fz=Math.cos(rotY);
  const act={type:'machine',m,label:G.title,sub:'Hinsetzen und spielen',pos:new THREE.Vector3(x+fx*.6,1.2,z+fz*.6),reach:2.2};
  const hitList=[];g.traverse(o=>{if(o.isMesh&&!o.userData.act){o.userData.act=act;F.hits.push(o);}});F.acts.push(act);
  const ax=Math.abs(fx)>.5;col(F,x,z,ax?.85:1,ax?1:.85);
  F.machines.push(m);
  slotIdleMsg(m);updateButtons(m);drawTop(m);drawScreen(m);
  return m;
}
function slotIdleMsg(m){const G=m.G;m.msg=G.id==='book'?'3 BÜCHER = 10 FREISPIELE':G.free?'3 '+SYMNAME[G.scatter]+' = '+G.free.count+' FREISPIELE':'VIEL GLÜCK';}
function betLine(m){return m.G.betOpts[m.betIdx];}
function totalBet(m){return betLine(m)*m.lines;}

/* ---------- buttons ---------- */
const BTNCOL={white:['#f4f0e8','#1a1a1a'],red:['#ff3a3a','#1a0000'],amber:['#ffb020','#1a0a00'],blue:['#4a9aff','#00081a'],green:['#3adf5a','#001a04'],black:['#2a2a2a','#f4f0e8'],yellow:['#ffe040','#1a1000']};
function setBtn(m,key,label,color,lit,blink){
  const b=m.btns[key];if(b.label!==label||b.color!==color){b.label=label;b.color=color;
    const c=b.tex.userData.ctx,[bg,fg]=BTNCOL[color]||BTNCOL.white;
    c.fillStyle=bg;c.fillRect(0,0,64,40);c.fillStyle='rgba(255,255,255,.35)';c.fillRect(0,0,64,6);c.fillStyle='rgba(0,0,0,.25)';c.fillRect(0,34,64,6);
    c.fillStyle=fg;px(c,label.length>6?7:label.length>4?8:10);c.textAlign='center';c.textBaseline='middle';c.fillText(label,32,21);b.tex.needsUpdate=true;}
  b.lit=lit;b.blink=blink;
}
const SVKEYS=['MENU','INFO','LINIEN','EINSATZ','AUTO','KARTE','LEITER','START'];
function btnModel(m){
  const s=m.state,G=m.G,idle=s==='idle',show=s==='show',o={};
  const B=(k,label,color,lit,blink)=>{o[k]={label,color,lit:!!lit,blink:!!blink};};
  if(s==='boot'||s==='menu'){smButtons(m,B);return o;}
  if((s==='gamble'||s==='gambleNext')&&m.gamble){
    const live=s==='gamble'&&!m.gamble.busy;
    B('INFO','INFO','white',false);B('LINIEN','LINIEN','amber',false);B('EINSATZ','EINSATZ','amber',false);B('AUTO','AUTO','blue',false);
    if(m.gamble.kind==='rb'){B('KARTE','ROT','red',live,live);B('LEITER','SCHWARZ','black',live,live);}
    else{B('KARTE','KARTE','red',false);B('LEITER','LEITER ▲','yellow',live,live);}
    B('START','NEHMEN','green',live);B('MENU','MENÜ','white',false);return o;
  }
  B('MENU','MENÜ','white',idle&&!m.fs);
  B('INFO','INFO','white',idle||show);
  B('LINIEN','LINIEN','amber',idle&&G.lineOpts.length>1);
  B('EINSATZ','EINSATZ','amber',idle);
  B('AUTO',m.auto?'STOP':'AUTO','blue',idle||show||m.auto,m.auto);
  const canRisk=(show||(s==='count'&&!m.pendingFs))&&m.win>0;
  B('KARTE','RISIKO KARTE','red',canRisk,canRisk);
  const canLadder=canRisk&&m.win>=LADDER[0];
  B('LEITER','RISIKO LEITER','yellow',canLadder,canLadder);
  B('START',s==='spin'?'STOP':show?'NEHMEN':'START','green',idle||show||(s==='spin'&&!m.fs));
  return o;
}
function updateButtons(m){
  const o=btnModel(m);m.btnModel=o;
  const map={INFO:'INFO',RISIKO:'KARTE',LINIEN:'LINIEN',EINSATZ:'EINSATZ',AUTO:'AUTO',START:'START'};
  for(const k in map){const b=o[map[k]];setBtn(m,k,b.label,b.color,b.lit,b.blink);}
  if(typeof svButtons==='function')svButtons(m);
}
function pressButton(m,key){
  if(key==='RISIKO')key='KARTE';
  if(m.state==='gambleNext'&&m.gamble&&m.gamble.kind==='ladder'&&(key==='LEITER'||key==='START')){m.timer=0;timerDone(m);if(m.state!=='gamble')return;}
  if(m.btns[key])m.btns[key].press=1;SFX.btn();
  const b=(m.btnModel||btnModel(m))[key];if(!b||!b.lit)return;
  const s=m.state;
  if(s==='menu'||s==='boot'){smPress(m,key);updateButtons(m);return;}
  if(key==='MENU'){smOpen(m);return;}
  if(s==='gamble'){
    const gm=m.gamble;
    if(gm.kind==='rb'){if(key==='KARTE')gambleRB(m,true);else if(key==='LEITER')gambleRB(m,false);else if(key==='START')collect(m,true);}
    else{if(key==='LEITER')ladderPress(m);else if(key==='START')collect(m,true);}
    return;
  }
  switch(key){
    case 'INFO':m.info=!m.info;m.dirty=true;break;
    case 'LINIEN':{const o=m.G.lineOpts;m.lines=o[(o.indexOf(m.lines)+1)%o.length];m.info=false;m.msg='LINIEN: '+m.lines;m.dirty=true;break;}
    case 'EINSATZ':{m.betIdx=(m.betIdx+1)%m.G.betOpts.length;m.info=false;m.msg='EINSATZ: '+totalBet(m)+' ('+m.lines+'×'+betLine(m)+')';m.dirty=true;break;}
    case 'AUTO':m.auto=!m.auto;if(m.auto&&s==='idle')startSpin(m);else if(m.auto&&s==='show'){collect(m);startSpin(m);}break;
    case 'KARTE':case 'LEITER':
      if(s==='count'&&!m.pendingFs){m.timer=0;m.disp=m.win;m.state='show';}
      if(m.state==='show')startGamble(m,key==='KARTE'?'rb':'ladder');break;
    case 'START':
      if(s==='idle')startSpin(m);
      else if(s==='show'){collect(m);startSpin(m);}
      else if(s==='spin'&&!m.fs)quickStop(m);
      break;
  }
  updateButtons(m);
}
/* ---------- spin flow ---------- */
function startSpin(m,demo){
  m.info=false;m.demo=!!demo;
  if(!demo&&!m.fs){const tb=totalBet(m);if(chips<tb){m.msg='GUTHABEN ZU NIEDRIG';m.auto=false;m.dirty=true;SFX.lose();updateButtons(m);return;}setChips(chips-tb);}
  m.useFs=!!m.fs;
  m.stops=SlotEngine.randStops(m.G,Math.random,m.useFs);
  m.grid=SlotEngine.grid(m.G,m.stops,m.useFs);
  m.ev=SlotEngine.evaluate(m.G,m.grid,m.lines,betLine(m),m.fs?m.fs.special:null,m.useFs);
  const fast=m.auto?.75:1;
  m.reels.forEach((r,i)=>{r.spin=true;r.target=m.stops[i];r.stopAt=now+(.55+i*.2)*fast;r.teased=false;r.speed=26;});
  m.state='spin';m.present=null;m.expand=null;m.msg=m.fs?('FREISPIEL '+(m.fs.n+1)+' VON '+m.fs.total):m.demo?'':'VIEL GLÜCK!';
  if(!demo)SFX.reelStart();
  m.dirty=true;updateButtons(m);
}
function quickStop(m){m.reels.forEach((r,i)=>{if(r.spin)r.stopAt=Math.min(r.stopAt,now+i*.04);});}
function scatterOnReel(m,i){for(let r=0;r<3;r++)if(m.grid[r][i]===m.G.scatter)return true;return false;}
function updReels(m,dt){
  let any=false;
  m.reels.forEach((r,i)=>{
    if(r.bounce>0)r.bounce=Math.max(0,r.bounce-dt*6);
    if(!r.spin)return;any=true;
    r.pos-=r.speed*dt;
    if(now>=r.stopAt){r.spin=false;r.pos=r.target;r.bounce=1;
      if(!m.demo)SFX.clunk();
      let sc=0;for(let k=0;k<=i;k++)if(scatterOnReel(m,k))sc++;
      if(scatterOnReel(m,i)&&!m.demo)SFX.scatter(sc);
      if(m.G.free&&sc>=2&&i<4&&!m.demo){const nx=m.reels[i+1];if(!nx.teased){nx.teased=true;const ext=.9;for(let k=i+1;k<5;k++)m.reels[k].stopAt+=ext;SFX.tease(sc);m.msg='SPANNUNG...';}}
    }
  });
  if(!any&&m.state==='spin')onResult(m);
  if(any)m.dirty=true;
}
function onResult(m){
  const ev=m.ev;
  m.present={items:[...ev.wins],idx:0,t:0};if(ev.scatter)m.present.items.push({scatter:true,...ev.scatter});
  if(m.demo){m.state='idle';m.demo=false;m.msg=ev.total?'GEWINN '+fmt(ev.total):'';m.dirty=true;return;}
  const lineWin=ev.total-(ev.expand?ev.expand.amount:0);
  if(m.fs){
    m.fs.n++;m.win+=lineWin;
    m.state='fsShow';m.timer=lineWin>0?1.3:.5;if(lineWin>0)SFX.win();
    m.msg=lineWin>0?('GEWINN '+fmt(lineWin)):('FREISPIEL '+m.fs.n+' VON '+m.fs.total);
  } else {
    if(ev.total>0){m.win=ev.total;m.state='count';m.timer=Math.min(2.6,.6+ev.total/totalBet(m)*.12);
      const big=ev.total>=totalBet(m)*10;big?SFX.big():SFX.win();if(big&&!m.demo)mpWin('gewinnt '+fmt(ev.total)+' an '+m.G.title+'!');
      m.msg=describeWin(m,m.present.items[0]);}
    else {m.state='idle';m.msg=m.auto?'AUTOSTART':'';if(!m.auto)slotIdleMsg(m);m.timer=m.auto?.5:0;}
    if(ev.trigger){m.pendingFs=true;}
  }
  m.dirty=true;m.topDirty=true;updateButtons(m);
}
function describeWin(m,it){if(!it)return '';if(it.scatter)return it.count+'× '+SYMNAME[m.G.scatter]+' = '+fmt(it.amount);return 'LINIE '+(it.line+1)+': '+it.count+'× '+SYMNAME[it.sym]+' = '+fmt(it.amount);}
function collect(m){
  store('nk_slotpend',null);m.savedWin=0;
  if(m.win>0){setChips(chips+m.win,true);if(!m.auto)SFX.chip();}
  m.win=0;m.disp=0;m.gamble=null;m.state='idle';m.present=null;slotIdleMsg(m);m.dirty=true;m.topDirty=true;updateButtons(m);
}
function slotStep(m,dt){
  m.stateT+=dt;
  if(m.state==='spin')updReels(m,dt);else m.reels.forEach(r=>{if(r.bounce>0){r.bounce=Math.max(0,r.bounce-dt*6);m.dirty=true;}});
  if(m.present&&m.present.items.length){m.present.t+=dt;if(m.present.t>1.1){m.present.t=0;m.present.idx=(m.present.idx+1)%m.present.items.length;if(m.state==='show'||m.state==='count')m.msg=describeWin(m,m.present.items[m.present.idx]);m.dirty=true;}}
  // win counter
  if(m.disp<m.win){const step=Math.max(1,Math.ceil((m.win-m.disp)*dt*4));m.disp=Math.min(m.win,m.disp+step);if(Math.random()<.5)SFX.count();m.dirty=true;}
  else if(m.disp>m.win){m.disp=m.win;m.dirty=true;}
  if(m.timer>0){m.timer-=dt;if(m.timer<=0)timerDone(m);}
  if(m.state==='fsIntro'){m.dirty=true;}
  if(m.state==='expand'){m.expand.p=Math.min(1,m.expand.p+dt*1.4);m.dirty=true;}
  if(m.state==='gamble'||m.state==='gambleNext'||m.state==='menu'||m.state==='boot')m.dirty=true;
  // LEDs
  const hot=m.fs||m.state==='count'||m.state==='show';
  if(hot){const h=(now*.6)%1;m.ledMat.color.setHSL(h,1,.55);}else m.ledMat.color.setHex(m.accent);
  // button blink & press
  for(const k in m.btns){const b=m.btns[k];const on=b.lit&&(!b.blink||Math.floor(now*3)%2===0);b.mat.color.setHex(on?0xffffff:b.lit?0xaaaaaa:0x3a3a3a);
    if(b.press>0){b.press=Math.max(0,b.press-dt*7);}b.mesh.position.y=.035-b.press*.012;}
}
function timerDone(m){
  switch(m.state){
    case 'count':
      if(m.pendingFs){m.pendingFs=false;startFsIntro(m);break;}
      m.state='show';m.disp=m.win;updateButtons(m);
      if(m.auto){m.timer=.7;}
      break;
    case 'show':if(m.auto){collect(m);startSpin(m);}break;
    case 'idle':if(m.auto)startSpin(m);break;
    case 'fsIntro':m.state='fsWait';m.timer=.3;m.topDirty=true;break;
    case 'fsWait':startSpin(m);break;
    case 'fsShow':{
      const ev=m.ev;
      if(ev.expand){m.state='expand';m.expand={reels:ev.expand.reels,sym:ev.expand.sym,p:0,amount:ev.expand.amount};SFX.expand();m.timer=2.2;m.msg='SONDERSYMBOL WÄCHST!';break;}
      afterFsSpin(m);break;}
    case 'expand':m.win+=m.expand.amount;SFX.big();m.msg='SONDERGEWINN '+fmt(m.expand.amount);m.state='expandShow';m.timer=1.6;break;
    case 'expandShow':afterFsSpin(m);break;
    case 'fsRetrig':m.state='fsWait';m.timer=.4;break;
    case 'fsEnd':
      mpWin('holt '+fmt(m.win)+' in den Freispielen!');m.fs=null;m.expand=null;m.state='show';m.disp=0;m.msg='GESAMTGEWINN '+fmt(m.win);m.topDirty=true;updateButtons(m);if(m.auto)m.timer=1.5;break;
    case 'gambleNext':m.gamble.busy=false;
      {const cap=m.gamble.kind==='ladder'?99:5;
      if(m.win<=0){m.gamble=null;m.state='idle';slotIdleMsg(m);}
      else if(m.gamble.n>=cap||(m.gamble.kind==='ladder'&&m.gamble.idx>=LADDER.length-1)){m.state='gamble';m.msg='MAXIMUM ERREICHT';collect(m,true);}
      else{m.state='gamble';m.msg=m.gamble.kind==='ladder'?'LEITER DRÜCKEN ODER NEHMEN':'ROT ODER SCHWARZ?';}}
      m.dirty=true;m.topDirty=true;updateButtons(m);break;
  }
}
function afterFsSpin(m){
  m.fs.left--;m.expand=null;
  if(m.ev.trigger){const n=m.G.free.count;m.fs.left+=n;m.fs.total+=n;m.state='fsRetrig';m.timer=2;m.msg='+'+n+' FREISPIELE!';SFX.fsIntro();m.topDirty=true;return;}
  if(m.fs.left>0){m.state='fsWait';m.timer=.5;}
  else{m.state='fsEnd';m.timer=3.4;m.msg='FREISPIELE BEENDET';SFX.big();}
  m.topDirty=true;
}
function startFsIntro(m){const FC=m.G.free.count;mpWin('hat '+FC+' Freispiele an '+m.G.title+'!');
  const cand=m.G.syms.filter(s=>s!==m.G.wild);
  m.fs={left:FC,total:FC,n:0,special:m.G.free.expanding?cand[Math.random()*cand.length|0]:null};
  m.state='fsIntro';m.timer=m.fs.special?4.2:3;m.stateT=0;m.msg=FC+' FREISPIELE!';SFX.fsIntro();m.auto=false;m.topDirty=true;updateButtons(m);
}

/* ---------- gamble ---------- */
function startGamble(m,kind){
  m.present=null;m.auto=false;
  if(kind==='ladder'){
    let idx=-1;for(let i=0;i<LADDER.length;i++)if(LADDER[i]<=m.win)idx=i;
    if(idx<0){m.msg='GEWINN ZU KLEIN FÜR DIE LEITER';updateButtons(m);return;}
    const rest=m.win-LADDER[idx];if(rest>0){setChips(chips+rest);}
    m.win=LADDER[idx];m.disp=m.win;
    if(idx>=LADDER.length-1){collect(m);return;}
    m.gamble={kind:'ladder',n:0,busy:false,idx,last:null};m.state='gamble';m.msg=rest>0?('REST '+fmt(rest)+' GUTGESCHRIEBEN · DRÜCKEN!'):'LEITER DRÜCKEN ODER NEHMEN';}
  else{m.gamble={kind:'rb',n:0,busy:false,card:null};m.state='gamble';m.msg='ROT ODER SCHWARZ?';}
  m.dirty=true;m.topDirty=true;updateButtons(m);
}
// Leiter: feine Stufen (~x1,25). Chance pro Stufe so, dass Drücken fair ist (minimal unter 50/50 der Wertänderung):
// p = (L[i]-L[i-1]) / (L[i+1]-L[i-1]) * 0.97  ->  meist 42-46 % hoch
const LADDER=[10,13,16,20,25,30,40,50,60,80,100,130,160,200,250,300,400,500,600,800,1000,1300,1600,2000,2500,3000,4000,5000,6000,8000,
  10000,13000,16000,20000,25000,30000,40000,50000,60000,80000,100000,130000,160000,200000,250000,300000,400000,500000];
const ladderUp=i=>i>=LADDER.length-1?0:(LADDER[i]-(i>0?LADDER[i-1]:0))/(LADDER[i+1]-(i>0?LADDER[i-1]:0))*.97;
function ladderPress(m){
  const gm=m.gamble;if(gm.busy)return;gm.busy=true;m.stateT=0;
  gm.up=Math.random()<ladderUp(gm.idx);gm.last=gm.idx;
  if(gm.up&&gm.idx>=LADDER.length-1){gm.busy=false;collect(m);return;}
  if(gm.up){gm.idx++;m.win=LADDER[gm.idx];m.disp=m.win;m.msg='HOCH! '+fmt(m.win);SFX.win();}
  else if(gm.idx>0){gm.idx--;m.win=LADDER[gm.idx];m.disp=m.win;m.msg='RUNTER AUF '+fmt(m.win)+' · WEITER?';SFX.lose();}
  else{gm.idx=-1;m.msg='ABGESTÜRZT';m.win=0;m.disp=0;SFX.lose();}
  m.state='gambleNext';m.timer=.45;updateButtons(m);
}
function gambleRB(m,red){
  const gm=m.gamble;if(gm.busy)return;gm.busy=true;
  const c=Math.random()*52|0,isRed=((c/13|0)===1||(c/13|0)===2);gm.card=c;m.history.unshift(c);if(m.history.length>6)m.history.pop();
  SFX.card();
  if(isRed===red){m.win*=2;gm.n++;m.msg='RICHTIG! '+fmt(m.win);SFX.win();}
  else{m.msg='VERLOREN';m.win=0;m.disp=0;SFX.lose();}
  m.state='gambleNext';m.timer=isRed===red?1.3:2.2;m.dirty=true;updateButtons(m);
}
/* ---------- screen rendering ---------- */
const RX=22,RY=27,CW=55.2,CH=51;
function bgFor(m,g){
  const BGC={viking:['#0a1a30','#04101e'],mine:['#1a1410','#0a0806'],reef:['#03304a','#011a2a'],temple:['#3a1004','#1a0602']}[m.G.id];
  if(BGC){const gr=g.createLinearGradient(0,0,0,240);gr.addColorStop(0,BGC[0]);gr.addColorStop(1,BGC[1]);g.fillStyle=gr;g.fillRect(0,0,320,240);return;}
  if(m.G.id==='book'){const gr=g.createLinearGradient(0,0,0,240);gr.addColorStop(0,'#3a2208');gr.addColorStop(.5,'#1a0e04');gr.addColorStop(1,'#2a1606');g.fillStyle=gr;g.fillRect(0,0,320,240);
    g.fillStyle='rgba(232,176,32,.18)';for(let i=0;i<16;i++){g.fillRect(i*20+4,2,8,2);g.fillRect(i*20+8,236,6,2);}}
  else{const gr=g.createLinearGradient(0,0,0,240);gr.addColorStop(0,'#5a0a04');gr.addColorStop(.6,'#2a0402');gr.addColorStop(1,'#8a2a04');g.fillStyle=gr;g.fillRect(0,0,320,240);
    for(let i=0;i<24;i++){const x=i*14,h=8+Math.sin(now*3+i)*4+6;g.fillStyle='rgba(255,140,20,.25)';g.fillRect(x,240-h-46,10,h);}}
}
function drawReelArea(m,g){
  const G=m.G;
  g.fillStyle='#000';g.fillRect(RX-3,RY-3,CW*5+6,CH*3+6);
  for(let i=0;i<5;i++){
    const x=RX+i*CW,r=m.reels[i],S=stripsFor(m)[i],L=S.length;
    g.save();g.beginPath();g.rect(x+1,RY,CW-2,CH*3);g.clip();
    const rg=g.createLinearGradient(0,RY,0,RY+CH*3);
    const RC={book:['#5a4020','#e8d8b0'],fruit:['#3a0a08','#f4e8d0'],viking:['#1a2a4a','#dce6f4'],mine:['#2a2014','#e8dcc8'],reef:['#0a3a5a','#d8f0f8'],temple:['#4a1a08','#f4dcc0']}[G.id];
    rg.addColorStop(0,RC[0]);rg.addColorStop(.5,RC[1]);rg.addColorStop(1,RC[0]);
    g.fillStyle=rg;g.fillRect(x+1,RY,CW-2,CH*3);
    const fl=Math.floor(r.pos),off=r.pos-fl,bo=r.bounce>0?Math.sin(r.bounce*Math.PI)*6:0;
    for(let k=0;k<4;k++){
      const idx=((fl+k-1)%L+L)%L,y=RY+(k-off)*CH+bo;
      const sym=S[idx];
      let alpha=1;
      if(m.present&&m.present.items.length&&!r.spin&&(m.state==='show'||m.state==='count'||m.state==='fsShow')){const it=m.present.items[m.present.idx];const row=k;
        alpha=it.cells.some(([cr,cc])=>cr===row&&cc===i)?1:.45;}
      g.globalAlpha=alpha;
      if(r.spin){g.globalAlpha=.85;g.drawImage(symCanvas(sym),x+(CW-46)/2,y+(CH-46)/2-6,46,58);}
      else g.drawImage(symCanvas(sym),x+(CW-46)/2,y+(CH-46)/2,46,46);
      g.globalAlpha=1;
    }
    g.restore();
    g.fillStyle='rgba(0,0,0,.6)';g.fillRect(x,RY,1,CH*3);
  }
  // expanding
  if(m.useFs&&m.ev&&m.ev.wildReels&&!m.reels.some(r=>r.spin)){ // Joker füllt die Walze
    m.ev.wildReels.forEach(c=>{const x=RX+c*CW;const eg=g.createLinearGradient(0,RY,0,RY+CH*3);eg.addColorStop(0,'#ffe080');eg.addColorStop(1,'#ff6a10');
      g.fillStyle=eg;g.fillRect(x+1,RY,CW-2,CH*3);for(let r=0;r<3;r++)g.drawImage(symCanvas(m.G.wild),x+(CW-46)/2,RY+r*CH+(CH-46)/2,46,46);
      g.strokeStyle=Math.floor(now*6)%2?'#fff':'#ffd23a';g.lineWidth=2;g.strokeRect(x+2,RY+1,CW-4,CH*3-2);});
  }
  if(m.expand){
    m.expand.reels.forEach(c=>{const x=RX+c*CW,h=CH*3*ease(m.expand.p);
      g.save();g.beginPath();g.rect(x+1,RY,CW-2,h);g.clip();
      const eg=g.createLinearGradient(0,RY,0,RY+CH*3);eg.addColorStop(0,'#fff2a0');eg.addColorStop(1,'#c08a10');g.fillStyle=eg;g.fillRect(x+1,RY,CW-2,CH*3);
      for(let r=0;r<3;r++)g.drawImage(symCanvas(m.expand.sym),x+(CW-46)/2,RY+r*CH+(CH-46)/2,46,46);
      g.restore();g.strokeStyle=Math.floor(now*6)%2?'#fff':'#ffd23a';g.lineWidth=2;g.strokeRect(x+2,RY+1,CW-4,h-2);});
  }
  // paylines markers
  for(let li=0;li<G.lines.length;li++){
    const p=G.lines[li],active=li<m.lines,yL=RY+p[0]*CH+CH/2+((li%3)-1)*10,yR=RY+p[4]*CH+CH/2+((li%3)-1)*10;
    g.fillStyle=active?LINECOL[li]:'#3a3a3a';g.fillRect(2,yL-5,16,10);g.fillRect(302,yR-5,16,10);
    g.fillStyle='#000';px(g,6);g.textAlign='center';g.textBaseline='middle';g.fillText(String(li+1),10,yL+1);g.fillText(String(li+1),310,yR+1);
  }
  // highlighted win
  if(m.present&&m.present.items.length&&(m.state==='show'||m.state==='count'||m.state==='fsShow')){
    const it=m.present.items[m.present.idx];
    if(!it.scatter){const p=G.lines[it.line];g.strokeStyle=LINECOL[it.line];g.lineWidth=3;g.beginPath();
      g.moveTo(18,RY+p[0]*CH+CH/2);for(let c=0;c<5;c++)g.lineTo(RX+c*CW+CW/2,RY+p[c]*CH+CH/2);g.lineTo(302,RY+p[4]*CH+CH/2);g.stroke();}
    g.strokeStyle=it.scatter?'#fff':LINECOL[it.line||0];g.lineWidth=2;
    it.cells.forEach(([r,c])=>g.strokeRect(RX+c*CW+2,RY+r*CH+2,CW-4,CH-4));
  }
}
function drawBar(m,g){
  const y=RY+CH*3+5;
  g.fillStyle='rgba(0,0,0,.75)';g.fillRect(0,y,320,240-y);
  const fields=[[m.remote?cleanText(m.remote.name,10):'GUTHABEN',fmt(m.remote?m.remote.credit:chips)],[m.fs?'FREISPIEL':'EINSATZ',m.fs?(Math.min(m.fs.n+ (m.state==='spin'?1:0),m.fs.total)+'/'+m.fs.total):fmt(totalBet(m))],['GEWINN',fmt(m.disp)]];
  fields.forEach(([l,v],i)=>{const x=4+i*105;g.fillStyle='#1a1424';g.fillRect(x,y+3,101,30);g.strokeStyle=i===2&&m.disp>0?'#ffd23a':'#3a2c52';g.strokeRect(x+.5,y+3.5,100,29);
    g.fillStyle='#9b8fb3';px(g,7);g.textAlign='left';g.textBaseline='top';g.fillText(l,x+4,y+5);
    g.fillStyle=i===2?'#ffd23a':'#f4f0e8';px(g,11);g.textAlign='right';g.fillText(v,x+97,y+17);});
  g.fillStyle=Math.floor(now*2)%2&&(m.state==='show')?'#ffd23a':'#f4f0e8';px(g,8);g.textAlign='center';g.textBaseline='middle';
  g.fillText(m.msg||'',160,y+42);
}
function drawHeader(m,g){
  g.fillStyle='rgba(0,0,0,.55)';g.fillRect(0,0,320,RY-4);
  px(g,8);g.textBaseline='middle';g.textAlign='left';g.fillStyle='#ffd23a';g.fillText(m.G.title,6,12);
  g.textAlign='right';g.fillStyle='#e8e0cc';px(g,6);g.fillText(m.lines+' LINIEN × '+betLine(m),314,12);
}
function drawInfo(m,g){
  g.fillStyle='rgba(10,6,16,.94)';g.fillRect(RX-3,RY-3,CW*5+6,CH*3+6);
  const G=m.G,syms=Object.keys(G.pay).reverse();
  px(g,6);g.textBaseline='middle';
  syms.forEach((s,i)=>{const col=i%2,row=i/2|0,x=RX+4+col*140,y=RY+6+row*26;
    g.drawImage(symCanvas(s),x,y,22,22);g.fillStyle='#f4f0e8';g.textAlign='left';
    const p=G.pay[s],parts=[];for(let n=5;n>=2;n--)if(p[n])parts.push(n+'×'+p[n]);g.fillText(parts.join(' '),x+26,y+11);});
  const y=RY+CH*3-26;g.fillStyle='#ffd23a';g.textAlign='left';
  const sc=G.scatter;g.drawImage(symCanvas(sc),RX+4,y-4,22,22);
  g.fillText((G.wild?'JOKER + ':'')+'SCATTER: 5×'+G.scatterPay[5]+' 4×'+G.scatterPay[4]+' 3×'+G.scatterPay[3]+' EINS.',RX+30,y+7);
  g.fillStyle='#9b8fb3';const I=GAMEINFO[G.id];
  g.fillText('QUOTE CA. '+I.rtp+'% · GEWINN JEDES '+I.hit+'. SPIEL'+(I.fs?' · FREISPIELE CA. 1:'+I.fs:''),RX+4,y+22);
}
function drawFsIntro(m,g){
  g.fillStyle='rgba(10,4,0,.9)';g.fillRect(RX-3,RY-3,CW*5+6,CH*3+6);
  if(!m.fs.special){ // Spiele ohne Buch: Freispiele mit eigener Besonderheit
    const t=m.stateT,F=m.G.free,cx=160,cy=RY+CH*1.5,pulse=1+Math.sin(t*8)*.06;
    g.save();g.translate(cx,cy-12);g.scale(pulse,pulse);g.drawImage(symCanvas(m.G.scatter),-36,-36,72,72);g.restore();
    g.textAlign='center';g.textBaseline='middle';px(g,14);g.fillStyle='#ffd23a';g.fillText(F.count+' FREISPIELE',cx,RY+12);
    px(g,9);g.fillStyle=Math.floor(now*4)%2?'#fff':'#ffd23a';g.fillText(F.desc[1],cx,RY+CH*3-12);return;
  }
  const t=m.stateT,cx=160,cy=RY+CH*1.5;
  const open=clamp(t/.8,0,1);
  g.save();g.translate(cx,cy);
  g.fillStyle='#5a1006';g.fillRect(-70*open-6,-58,6,116);
  g.fillStyle='#e8dcb0';g.fillRect(-70*open,-56,70*open,112);g.fillRect(0,-56,70,112);
  g.fillStyle='#c03a1a';g.fillRect(70,-58,6,116);
  g.strokeStyle='#b0a070';g.beginPath();g.moveTo(0,-56);g.lineTo(0,56);g.stroke();
  const cand=m.G.syms.filter(s=>s!==m.G.wild);
  const speed=t<1?0:t<2.6?Math.max(.06,.3-(t-1)*.15):null;
  let sym=m.fs.special;
  if(speed!==null){const k=Math.floor(t/speed);sym=cand[k%cand.length];if(Math.floor((t-.016)/speed)!==k)SFX.tick();}
  const img=symCanvas(sym);g.drawImage(img,8,-36,56,56);g.drawImage(img,-64*open,-36,56*open,56);
  g.restore();
  g.fillStyle='#ffd23a';px(g,12);g.textAlign='center';g.textBaseline='middle';g.fillText(m.G.free.count+' FREISPIELE',cx,RY+10);
  if(t>2.6){g.fillStyle=Math.floor(now*4)%2?'#fff':'#ffd23a';px(g,8);g.fillText('SONDERSYMBOL: '+SYMNAME[m.fs.special],cx,RY+CH*3-8);}
}
function drawGamble(m,g){
  const gm=m.gamble;
  g.fillStyle='rgba(6,10,20,.95)';g.fillRect(RX-3,RY-3,CW*5+6,CH*3+6);
  const drawCard=(c,x,y,w,h,faceUp,hi)=>{g.fillStyle='#f4eedc';g.fillRect(x,y,w,h);
    if(faceUp){const r=c%13,s=c/13|0,red=s===1||s===2;g.fillStyle=red?'#c8182c':'#141018';px(g,w>40?12:8);g.textAlign='left';g.textBaseline='top';g.fillText(RANKN[r],x+4,y+4);
      g.font='bold '+(w*.55|0)+'px "DejaVu Sans",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(SUITS[s],x+w/2,y+h*.6);}
    else{for(let yy=y+3;yy<y+h-3;yy+=3)for(let xx=x+3;xx<x+w-3;xx+=3){g.fillStyle=((xx+yy)/3|0)%2?'#7a1426':'#3a0812';g.fillRect(xx,yy,3,3);}}
    if(hi){g.strokeStyle=hi;g.lineWidth=3;g.strokeRect(x-1,y-1,w+2,h+2);}};
  px(g,8);g.fillStyle='#ffd23a';g.textAlign='center';g.textBaseline='middle';
  if(gm.kind==='ladder'){
    px(g,9);g.fillText('RISIKOLEITER',160,RY+9);
    const result=m.state==='gambleNext',cur=gm.idx;
    const blink=Math.floor(now*7)%2===0;
    if(!result&&Math.floor(now*7)!==Math.floor((now-.016)*7))SFX.gambleTick(blink);
    const rows=8,h=17,start=clamp((result?gm.last:cur)-3,0,Math.max(0,LADDER.length-rows));
    const yb=RY+CH*3-12;
    for(let i=0;i<rows;i++){const k=start+i;if(k>=LADDER.length)break;const y=yb-(i+1)*h;
      let fill='#1a1424',txt='#9b8fb3';
      if(result){if(k===cur){fill=gm.up?'#3adf5a':'#ffd23a';txt='#1a1000';}}
      else{if(k===cur){fill='#ffd23a';txt='#1a1000';}
        if(k===cur+1&&blink){fill='#3adf5a';txt='#001a04';}
        if(k===cur-1&&!blink){fill='#ff3a3a';txt='#1a0000';}}
      g.fillStyle=fill;g.fillRect(100,y,120,h-3);g.strokeStyle='#3a2c52';g.strokeRect(100.5,y+.5,119,h-4);
      px(g,9);g.fillStyle=txt;g.fillText(fmt(LADDER[k]),160,y+h/2-1);}
    const zeroLit=(result&&cur<0)||(!result&&cur===0&&!blink);
    g.fillStyle=zeroLit?'#ff3a3a':'#3a0a0a';g.fillRect(100,yb-1,120,10);px(g,7);g.fillStyle='#fff';g.fillText('0',160,yb+4);
    px(g,7);g.textAlign='left';g.fillStyle='#ffd23a';g.fillText('STUFE:',230,RY+52);px(g,10);g.fillText(fmt(m.win),230,RY+68);
    px(g,7);g.fillStyle='#9b8fb3';g.fillText('TOP '+fmt(LADDER[LADDER.length-1]),230,RY+92);
    g.textAlign='right';px(g,7);g.fillStyle='#3adf5a';g.fillText('▲ HOCH',92,RY+52);g.fillStyle='#ff3a3a';g.fillText('▼ RUNTER',92,RY+72);
    g.fillStyle='#9b8fb3';g.fillText('UNTER 0 = WEG',92,RY+92);
    return;
  }
  if(gm.kind==='rb'){
    g.fillText('RISIKO  '+fmt(m.win)+' → '+fmt(m.win*2),160,RY+10);
    m.history.slice(0,6).forEach((c,i)=>drawCard(c,RX+8+i*30,RY+24,24,34,true));
    const blinkRed=Math.floor(now*3)%2===0;
    if(m.state==='gambleNext'&&gm.card!==null)drawCard(gm.card,160-30,RY+66,60,84,true,'#fff');
    else{drawCard(0,160-30,RY+66,60,84,false,blinkRed?'#ff3a3a':'#888');if(Math.floor(now*3)!==Math.floor((now-.02)*3))SFX.gambleTick(blinkRed);}
    px(g,7);g.fillStyle='#ff3a3a';g.fillText('◄ ROT',70,RY+110);g.fillStyle='#e8e8e8';g.fillText('SCHWARZ ►',250,RY+110);
  }
}
function drawScreen(m){
  const g=m.scr.userData.ctx;
  if(m.state==='boot'||m.state==='menu'){smDraw(m,g);m.scr.needsUpdate=true;m.dirty=false;return;}
  bgFor(m,g);drawHeader(m,g);
  if(m.state==='fsIntro')drawFsIntro(m,g);
  else if(m.state==='gamble'||(m.state==='gambleNext'&&m.gamble))drawGamble(m,g);
  else{drawReelArea(m,g);if(m.info)drawInfo(m,g);
    if(m.state==='fsRetrig'||m.state==='fsEnd'){g.fillStyle='rgba(0,0,0,.7)';g.fillRect(RX+20,RY+40,CW*5-40,70);g.fillStyle='#ffd23a';px(g,12);g.textAlign='center';g.textBaseline='middle';
      g.fillText(m.state==='fsEnd'?'GEWONNEN':'+'+m.G.free.count+' FREISPIELE',160,RY+64);px(g,10);g.fillStyle='#fff';g.fillText(m.state==='fsEnd'?fmt(m.win):'NOCHMAL!',160,RY+90);}}
  drawBar(m,g);
  m.scr.needsUpdate=true;m.dirty=false;
}
function drawTop(m){
  const g=m.top.userData.ctx,G=m.G;
  const gr=g.createLinearGradient(0,0,0,128);
  const TOPC={book:['#1a0a30','#3a1a04'],fruit:['#3a0000','#a03a00'],viking:['#06142a','#2a4a6a'],mine:['#101018','#3a2a10'],reef:['#002a3a','#0a6a8a'],temple:['#2a0a00','#8a2a00']}[G.id];
  gr.addColorStop(0,TOPC[0]);gr.addColorStop(1,TOPC[1]);
  g.fillStyle=gr;g.fillRect(0,0,256,128);
  if(m.fs){g.fillStyle='#ffd23a';px(g,12);g.textAlign='center';g.textBaseline='middle';g.fillText('FREISPIELE',128,24);
    px(g,16);g.fillStyle='#fff';g.fillText(Math.min(m.fs.n+1,m.fs.total)+' / '+m.fs.total,128,56);
    if(m.fs.special){g.drawImage(symCanvas(m.fs.special),104,72,48,48);px(g,6);g.fillStyle='#ffd23a';g.fillText('SONDERSYMBOL',128,124);}
    else{px(g,9);g.fillStyle='#ffd23a';g.fillText(G.free.desc[1],128,96);}}
  else{
    if(G.id==='book'){g.fillStyle='#d8a050';g.beginPath();g.moveTo(200,30);g.lineTo(250,118);g.lineTo(150,118);g.closePath();g.fill();g.drawImage(symCanvas('BUCH'),8,58,60,60);}
    else if(G.id==='fruit'){g.drawImage(symCanvas('SIEBEN'),6,60,56,56);g.drawImage(symCanvas('KIRSCHE'),194,60,56,56);}
    else{g.drawImage(symCanvas(G.wild),6,60,56,56);g.drawImage(symCanvas(G.scatter),194,60,56,56);}
    g.textAlign='center';g.textBaseline='middle';px(g,G.title.length>9?18:22);
    g.lineWidth=6;g.strokeStyle='#000';g.strokeText(G.title,128,38);
    const tg=g.createLinearGradient(0,22,0,54);tg.addColorStop(0,'#fff8c0');tg.addColorStop(.5,'#ffc020');tg.addColorStop(1,'#a05a00');g.fillStyle=tg;g.fillText(G.title,128,38);
    px(g,8);g.fillStyle='#f4f0e8';g.fillText(G.sub,128,66);
    px(g,7);g.fillStyle='#ffd23a';
    const D=G.id==='book'?['10 FREISPIELE MIT','WACHSENDEM SYMBOL']:G.free?G.free.desc:['5 LINIEN · RISIKO','KARTE ODER LEITER'];
    g.fillText(D[0],128,88);g.fillText(D[1],128,100);
  }
  m.top.needsUpdate=true;m.topDirty=false;m.topVer=(m.topVer||0)+1;
}

/* ---------- per frame ---------- */
function updMachines(dt,F,focusM){
  F.machines.forEach(m=>{
    const d=Math.hypot(m.group.position.x-camera.position.x,m.group.position.z-camera.position.z);
    if(m===focusM){slotStep(m,dt);}
    else if(m.npc){ // demo play
      if(m.state==='idle'&&now>m.demoNext){startSpin(m,true);m.demoNext=now+4+Math.random()*5;}
      if(m.state==='spin')updReels(m,dt);else m.reels.forEach(r=>{if(r.bounce>0){r.bounce=Math.max(0,r.bounce-dt*6);m.dirty=true;}});
    }
    if(m.topDirty)drawTop(m);
    if(m===focusM&&m.win!==m.savedWin){m.savedWin=m.win;store('nk_slotpend',m.win>0?m.win:null);}
    if(m.dirty&&(m===focusM||d<9))drawScreen(m);
    if(m===focusM)svDraw(m);
    if(m!==focusM)m.ledMat.color.setHex(m.accent);
  });
}
