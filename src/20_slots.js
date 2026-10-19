/* =========================================================
   SPIELAUTOMATEN  (Grabkammer = Buch-Spiel, Glutofen = Früchte)
   ========================================================= */
const R_=(a,k)=>{const o={};k.forEach((s,i)=>o[s]=a[i]);return o;};
// Feinabstimmung der Walzen pro Spiel (Quote ~97 % bei glatten Gewinnbeträgen, per Simulation)
const ADJ=(rows,d)=>rows.map(r=>r.map((v,i)=>Math.max(1,v+(d[i]||0))));
const BK=['10','J','Q','K','A','ANKH','SKARAB','PYRAMIDE','MASKE','BUCH'];
const FK=['KIRSCHE','ZITRONE','ORANGE','PFLAUME','TRAUBE','MELONE','SIEBEN','STERN'];
SlotEngine.setup('book',ADJ([[6,6,5,5,4,3,2,2,1,1],[7,7,6,6,5,3,3,2,1,1],[7,7,6,6,5,3,3,2,1,2],[8,7,7,6,6,3,3,2,1,1],[8,8,7,7,6,3,3,2,1,1]],[-1]).map(a=>R_(a,BK)),101);
SlotEngine.setup('fruit',ADJ([[4,5,5,5,3,3,2,1],[4,5,5,5,3,3,2,1],[4,5,5,5,3,3,2,1],[4,5,5,5,3,3,2,1],[4,5,5,5,3,3,2,2]],[-1]).map(a=>R_(a,FK)),202);
(function(){
  const BASE=[[6,6,6,5,5,3,3,2,1,1],[7,7,6,6,5,3,3,2,2,1],[7,7,6,6,5,3,3,2,2,2],[8,7,7,6,6,3,3,2,2,1],[8,8,7,7,6,3,3,2,1,1]];
  const MINEFS=[[6,6,6,5,5,3,3,2,1,1],[7,7,6,6,5,3,3,2,5,1],[7,7,6,6,5,3,3,2,5,2],[8,7,7,6,6,3,3,2,5,1],[8,8,7,7,6,3,3,2,1,1]];
  const K={viking:['10','J','Q','K','A','AXT','SCHILD','DRACHE','HELM','RUNE'],mine:['10','J','Q','K','A','LATERNE','HACKE','NUGGET','DIAMANT','LORE'],
    reef:['10','J','Q','K','A','FISCH','SEESTERN','PERLE','DELFIN','MUSCHEL'],temple:['10','J','Q','K','A','KELCH','SCHLANGE','STATUE','FEUER','TEMPEL']};
  const mk=(id,rows)=>rows.map(a=>R_(a,K[id]));
  SlotEngine.setup('viking',mk('viking',ADJ(BASE,[1,1,0,0,-1])),301);
  SlotEngine.setup('mine',mk('mine',ADJ(BASE,[1,0,0,1])),302,mk('mine',ADJ(MINEFS,[1,0,0,1])));
  SlotEngine.setup('reef',mk('reef',ADJ(BASE,[-1])),303);
  SlotEngine.setup('temple',mk('temple',ADJ(BASE,[1,1,0,0,-1])),304);
  const PH=['10','J','Q','K','A','SMARAGD','SAPHIR','RUBIN','BRILLANT','PHARAO'];
  SlotEngine.setup('spitze',[0,1,2,3,4].map(()=>({LEER:180,KLEE:95,PFEN:38,KAEF:10,KOEN:4,TEUF:50})),501);
  const TIZ_ROWS=[[16,16,16,14,13,9,9,6,6,4,1,3],[16,16,16,14,13,9,9,6,6,4,1,3],[16,16,16,14,13,9,9,6,6,4,1,3],[16,16,16,14,13,9,9,6,6,4,1,3],[16,16,16,14,13,9,9,6,6,4,1,3]];
  const ZK=['9','10','J','Q','K','A','FUELL','VASE','HARFE','OLYMP','ZENT','MUENZE'],TK=['10','J','Q','K','A','TRUHE','HANDS','BURG','ROSS','RITTER','SCHWERT','SCHILD'],DK=['10','J','Q','K','A','SKARAB','GREIF','MASKE','FORSCH','BUCH'];
  SlotEngine.setup('zent',[[20,15,22,24,16,12,14,1,1,1,1,3],[18,15,17,19,13,12,12,22,1,1,1,3],[13,14,2,24,5,9,1,1,11,2,1,3],[13,10,12,0,0,0,13,9,8,8,1,3],[8,9,3,12,5,6,5,10,10,14,1,3]].map(a=>R_(a,ZK)),704);
  SlotEngine.setup('tizona',TIZ_ROWS.map(a=>R_(a,TK)),706);
  SlotEngine.setup('doppel',[[4,2,6,4,2,1,1,4,3,1],[4,6,6,7,5,2,1,3,6,1],[7,6,6,6,5,4,1,2,3,2],[9,6,8,4,4,2,4,2,3,1],[6,7,7,6,5,2,2,2,1,1]].map(a=>R_(a,DK)),706);
  SlotEngine.setup('pharao',[[7,12,9,11,6,18,11,1,1,1],[17,17,15,0,12,1,1,4,1,1],[15,8,18,18,14,3,2,5,7,1],[1,21,2,13,1,9,12,1,3,1],[17,3,13,0,6,1,1,6,1,1]].map(a=>R_(a,PH)),401);
})();
const GAMEINFO={book:{rtp:'96,2',fs:'174',hit:'2,8'},fruit:{rtp:'96,2',fs:null,hit:'5,7'},viking:{rtp:'97,7',fs:'218',hit:'3,1'},mine:{rtp:'96,8',fs:'231',hit:'3,2'},reef:{rtp:'97,1',fs:'191',hit:'3,3'},temple:{rtp:'96,5',fs:'217',hit:'3,3'},pharao:{rtp:'97',fs:null,hit:'3,6',power:'13'},spitze:{rtp:'97',fs:null,hit:'2,6'},zent:{rtp:'98',fs:'150',hit:'4'},tizona:{rtp:'97',fs:'170',hit:'3'},doppel:{rtp:'97',fs:'148',hit:'3'}};
const stripsFor=m=>SlotEngine.stripsOf(m.G,!!m.useFs);
const LINECOL=['#ffd23a','#ff3a3a','#3adf5a','#4af0ff','#ff5ab0','#ff8a1a','#b07aff','#e8e8e8','#7aff5a','#5a8aff'];

/* ---------- symbol art (procedural, 48px) ---------- */
const SYMC={};
let SYMSET=''; // Spiel-ID: eigene Symbolsätze für pharao/tizona/zent/doppel
function symCanvas(id){
  const SS=SYMSET==='pharao'?LP_SYM:(typeof SYM_SETS!=='undefined'?SYM_SETS[SYMSET]:null);
  if(SS&&SS[id]){const k=SYMSET+'_'+id;if(SYMC[k])return SYMC[k]; // eigene 96er-Symbole je Merkur-Spiel
    const c=document.createElement('canvas');c.width=c.height=144;const lg=c.getContext('2d');lg.scale(1.5,1.5);SS[id](lg);return SYMC[k]=c;}
  if(SYMC[id])return SYMC[id];
  const c=document.createElement('canvas');c.width=c.height=144;const g=c.getContext('2d');g.scale(3,3); // dreifach scharf für den HD-Bildschirm
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
  const stool=gamingChair(g,accent);stool.position.set(0,0,.98);stool.rotation.y=.25;g.userData.chair=stool; // Gaming-Stuhl, beim Hinsetzen ausgeblendet
  // Kartenschlitz unter dem Bildschirm rechts: Chromrahmen, dunkler Schlitz, LED daneben
  const slotFr=box(.22,.055,.04,chrome,.2,1.125,.17,g);box(.17,.014,.044,dark,.2,1.125,.172,g);
  const cardLed=new THREE.MeshBasicMaterial({color:0x2a0000});box(.045,.045,.046,cardLed,.36,1.125,.171,g);
  const m={cardSlot:slotFr,cardLed,F,G,defG:G,scrMesh,group:g,deck,scr:scrTex,top:topTex,ledMat,accent,btns:{},state:'idle',lines:G.lines.length,betIdx:0,win:0,disp:0,
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
function slotIdleMsg(m){const G=m.G;m.msg=G.special?'KLEE · MÜNZE · KÄFER · SONNE':G.power?'AB 4× EINSATZ GEWINN: POWER SPINS':G.id==='book'?'3 BÜCHER = 10 FREISPIELE':G.walkWild?'3/4/5 SCHILDE = 10/15/20 FREISPIELE':G.free?'3 '+SYMNAME[G.scatter]+' = '+G.free.count+' FREISPIELE':'VIEL GLÜCK';}
function betLine(m){return m.G.betOpts[m.betIdx];}
function totalBet(m){return betLine(m)*m.lines*(m.G.doppel&&m.dbl?2:1)/(m.G.lineDiv||1);}
function payLine(m){return betLine(m)*(m.G.doppel&&m.dbl?1.39:1)/(m.G.lineDiv||1);}
function wwPend(m){return !!(m.G.walkWild&&SlotEngine.wwPending(m.ww));}
function wwCells(ww){const o={};(ww||[]).forEach(w=>{const hh=Math.min(3,w.h),r0=Math.max(0,Math.min(3-hh,w.r-(hh>1?1:0)));for(let i=0;i<hh;i++)o[(r0+i)+','+w.c]=1;});return o;}

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
  if(s==='splash'){SVKEYS.forEach(k=>B(k,k==='START'?'START':k==='MENU'?'MENÜ':k,'white',false));return o;}
  if(s==='poffer'){const can=pOffer(m);
    B('MENU','MENÜ','white',false);B('INFO','INFO','white',false);B('KARTE','RISIKO KARTE','red',false);B('LEITER','RISIKO LEITER','yellow',false);
    B('LINIEN','ANNEHMEN','white',true);B('EINSATZ','− ERFOLG','amber',can.lo);B('AUTO','+ ERFOLG','amber',can.hi);B('START','POWER SPINS','green',can.n>0,true);return o;}
  if(s==='power'&&m.power){SVKEYS.forEach(k=>B(k,k==='START'?'POWER':k==='MENU'?'MENÜ':k,k==='START'?'green':'white',false));return o;}
  if((s==='gamble'||s==='gambleNext')&&m.gamble){
    const live=s==='gamble'&&!m.gamble.busy;
    B('INFO','INFO','white',false);B('LINIEN','LINIEN','amber',false);B('EINSATZ','EINSATZ','amber',false);B('AUTO','AUTO','blue',false);
    if(m.gamble.kind==='rb'){B('KARTE','ROT','red',live,live);B('LEITER','SCHWARZ','black',live,live);}
    else{const nx=s==='gambleNext'&&m.win>0,sp=(live||nx)&&m.gamble.idx>=1;B('KARTE','TEILEN','amber',sp,sp&&live);B('LEITER','LEITER ▲','yellow',live||nx,live);}
    B('START','NEHMEN','green',live||(s==='gambleNext'&&m.gamble.kind==='ladder'&&m.win>0));B('MENU','MENÜ','white',false);return o;
  }
  B('MENU','MENÜ','white',idle&&!m.fs&&!wwPend(m));
  B('INFO','INFO','white',idle||show);
  const canPower=G.power&&(show||(s==='count'&&!m.pendingFs))&&m.win>=4*totalBet(m);
  if(canPower)B('LINIEN','POWER SPINS','green',true,!m.auto);
  else if(G.special){const pot=idle&&m.sp&&m.sp.pot>0;B('LINIEN','CASHPOT','green',pot,pot);}
  else if(G.doppel)B('LINIEN',m.dbl?'DOPPELBUCH':'EINZELBUCH','amber',idle,false);
  else B('LINIEN','LINIEN','amber',idle&&G.lineOpts.length>1);
  B('EINSATZ','EINSATZ','amber',idle&&!wwPend(m));
  B('AUTO',m.auto?'STOP':'AUTO','blue',idle||show||m.auto,m.auto);
  const canRisk=(show||(s==='count'&&!m.pendingFs))&&m.win>0;
  B('KARTE','RISIKO KARTE','red',canRisk,canRisk);
  const canLadder=canRisk; // Leiter geht bei jedem Gewinn
  if(m.auto&&!canLadder)B('LEITER',m.autoRisk?'AUTO-RISIKO AN':'AUTO-RISIKO','yellow',true,m.autoRisk); // Risiko-Automatik bis zur Ausspielung
  else B('LEITER','RISIKO LEITER','yellow',canLadder,canLadder);
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
  // Leiter ist immer drückbar (Anzeige wird sofort abgeschlossen) – nur die AUSSPIELUNG läuft immer komplett durch
  if(m.gamble&&m.gamble.run){if(key==='LEITER'||key==='START'){m.gamble.queued=key;if(m.btns[key])m.btns[key].press=1;SFX.btn();}return;} // Druck wird gemerkt und nach der Ausspielung ausgeführt
  if(m.state==='gambleNext'&&m.gamble&&m.gamble.kind==='ladder'&&(key==='LEITER'||key==='START'||key==='KARTE')){for(let n=0;n<3&&m.state==='gambleNext';n++){m.timer=0;timerDone(m);}if(m.state!=='gamble')return;}
  if(typeof svGateOn==='function'&&svGateOn(m))return;
  if(m.btns[key])m.btns[key].press=1;SFX.btn();
  if(m.state==='count'&&key==='START'&&!m.pendingFs){skipCount(m);return;}
  const b=(m.btnModel||btnModel(m))[key];if(!b||!b.lit)return;
  const s=m.state;
  if(s==='menu'||s==='boot'){smPress(m,key);updateButtons(m);return;}
  if(key==='MENU'){smOpen(m);return;}
  if(s==='power'||s==='splash')return;
  if(s==='poffer'){
    if(key==='START')startPowerRun(m);
    else if(key==='LINIEN'){m.state='show';m.disp=m.win;m.msg='ANGENOMMEN · RISIKO ODER NEHMEN';SFX.click();m.dirty=true;updateButtons(m);}
    else if(key==='AUTO'||key==='EINSATZ'){const c=pOffer(m);if(key==='EINSATZ'&&c.lo)m.pmult--;if(key==='AUTO'&&c.hi)m.pmult++;SFX.tick();m.dirty=true;updateButtons(m);}
    return;
  }
  if(key==='LINIEN'&&m.G.power&&(s==='show'||s==='count')&&m.win>=4*totalBet(m)){if(s==='count'){m.timer=0;m.disp=m.win;}openOffer(m);return;}
  if(s==='gamble'){
    const gm=m.gamble;
    if(gm.kind==='rb'){if(key==='KARTE')gambleRB(m,true);else if(key==='LEITER')gambleRB(m,false);else if(key==='START')collect(m,true);}
    else{if(key==='LEITER')ladderPress(m);else if(key==='KARTE')ladderSplit(m);else if(key==='START')collect(m,true);}
    return;
  }
  switch(key){
    case 'INFO':m.info=!m.info;m.dirty=true;break;
    case 'LINIEN':{if(m.G.special){spitzeTake(m);break;}if(m.G.doppel){m.dbl=!m.dbl;m.msg=m.dbl?'DOPPELBUCH: 15 FREISPIELE, 2 SONDERSYMBOLE':'EINZELBUCH: 10 FREISPIELE, 1 SONDERSYMBOL';m.dirty=true;m.topDirty=true;break;}const o=m.G.lineOpts;m.lines=o[(o.indexOf(m.lines)+1)%o.length];m.info=false;m.msg='LINIEN: '+m.lines;m.dirty=true;break;}
    case 'EINSATZ':{m.betIdx=(m.betIdx+1)%m.G.betOpts.length;m.info=false;m.msg='EINSATZ: '+fmt(totalBet(m));m.dirty=true;break;}
    case 'AUTO':m.auto=!m.auto;if(m.auto&&s==='idle')startSpin(m);else if(m.auto&&s==='show'){collect(m);startSpin(m);}break;
    case 'KARTE':case 'LEITER':
      if(key==='LEITER'&&m.auto&&!(s==='show'||s==='count')){m.autoRisk=!m.autoRisk;m.msg=m.autoRisk?'AUTO-RISIKO AN · BIS '+fmt(ladOf(m)[AUS_I]):'AUTO-RISIKO AUS';SFX.click();break;}
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
/* ---------- EFFEKTE: Funken, Münzen, Blitz, Wackeln, große Gewinne ---------- */
let camShake=0;
const easeBack=t=>{const c=1.25,u=t-1;return 1+(c+1)*u*u*u+c*u*u;};
const BIGT=[{x:10,t:'BIG WIN',c:['#fff8c0','#ffc020','#a04a00']},{x:25,t:'MEGA WIN',c:['#ffe0ff','#ff4ad0','#6a0060']},
  {x:50,t:'SUPER WIN',c:['#e0ffff','#2ae0ff','#00406a']},{x:100,t:'MONSTER WIN',c:['#ffffff','#ff3030','#5a0000']}];
const SPARK=['#fff','#ffd23a','#ff9a20','#fff4a0'];
function fxOf(m){return m.fx||(m.fx={parts:[],flash:0,fcol:'255,255,255',shake:0,big:null});}
function fxBurst(m,x,y,n,o){const F=fxOf(m);o=o||{};
  for(let i=0;i<n&&F.parts.length<320;i++){const a=Math.random()*TAU,sp=(o.spd||90)*(.35+Math.random()*.9);
    F.parts.push({x:x+(Math.random()-.5)*(o.w||0),y:y+(Math.random()-.5)*(o.h||0),vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-(o.up===undefined?40:o.up),g:o.g===undefined?220:o.g,
      life:0,max:(o.life||.8)*(.6+Math.random()*.7),col:(o.cols||SPARK)[Math.random()*(o.cols||SPARK).length|0],sz:o.sz||2,coin:!!o.coin,ph:Math.random()*TAU});}}
function fxFlash(m,a,col){const F=fxOf(m);F.flash=Math.max(F.flash,a);F.fcol=col||'255,255,255';m.dirty=true;}
function fxShake(m,a,cam){const F=fxOf(m);F.shake=Math.max(F.shake,a);if(cam&&typeof focus!=='undefined'&&focus&&focus.m===m)camShake=Math.max(camShake,a);}
function cellXY(r,c){return [RX+c*CW+CW/2,RY+r*CH+CH/2];}
function bigTier(x){let t=-1;BIGT.forEach((b,i)=>{if(x>=b.x)t=i;});return t;}
function startBig(m,amount){const x=amount/totalBet(m),F=fxOf(m);
  const dur=x>=100?8:x>=50?6.5:x>=25?5:3.6;
  F.big={t:0,dur,amount,tier:-1,acc:0,out:0,tick:0,popT:now};m.disp=0;m.state='count';m.timer=dur+1.2;
  SFX.boom();fxFlash(m,1);fxShake(m,.7,true);fxBurst(m,160,100,50,{coin:true,spd:160,up:90,sz:5,life:1.6});}
function skipCount(m){const B=m.fx&&m.fx.big;m.disp=m.win;if(B&&!B.out){B.t=B.dur;}m.timer=Math.min(m.timer,B?.9:.25);m.dirty=true;}
function fxStep(m,dt){
  const F=m.fx;if(!F)return;
  if(F.parts.length){for(const p of F.parts){p.life+=dt;p.vx*=1-dt*1.1;p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;}
    F.parts=F.parts.filter(p=>p.life<p.max&&p.y<260);m.dirty=true;}
  if(F.flash>0){F.flash=Math.max(0,F.flash-dt*2.6);m.dirty=true;}
  if(F.shake>0){F.shake=Math.max(0,F.shake-dt*2.4);m.dirty=true;}
  const B=F.big;if(!B)return;m.dirty=true;
  if(m.state!=='count'){B.out+=dt;if(B.out>.45)F.big=null;return;}
  B.t=Math.min(B.dur,B.t+dt);const k=B.t/B.dur,e=k<1?1-Math.pow(1-k,2.2):1;
  m.disp=Math.min(m.win,Math.floor(m.win*e));if(k>=1)m.disp=m.win;
  const tier=bigTier(m.disp/totalBet(m));
  if(tier>B.tier){B.tier=tier;B.popT=now;if(tier>=0){SFX.tierUp(tier);fxFlash(m,.8);fxShake(m,.55+tier*.15,true);fxBurst(m,160,80,40+tier*15,{coin:true,spd:170,up:100,sz:5,life:1.6});}}
  B.tick+=dt;if(k<1&&B.tick>.055){B.tick=0;SFX.riseTick(k);}
  B.acc+=dt*(30+Math.max(0,B.tier)*15);
  while(B.acc>1){B.acc--;F.parts.push({x:Math.random()*320,y:-6,vx:(Math.random()-.5)*30,vy:40+Math.random()*80,g:150,life:0,max:2.2,col:'#ffd23a',sz:4+Math.random()*2,coin:true,ph:Math.random()*TAU});}
}
function unlockShow(m){
  m.unlockT=now;SFX.unlock();SFX.ausFan();fxFlash(m,1,'120,255,140');fxShake(m,.6,true);
  fxBurst(m,160,110,70,{coin:true,spd:200,up:110,sz:5,life:1.6});fxBurst(m,160,110,60,{cols:['#3adf5a','#a8ffb0','#fff','#ffd23a'],spd:240,life:1});
  m.dirty=true;}
function drawUnlock(m,g){const t=now-(m.unlockT||-9);if(t>2.2)return;m.dirty=true;
  const a=t<.15?t/.15:t>1.8?Math.max(0,(2.2-t)/.4):1;g.save();g.globalAlpha=a;
  g.fillStyle='rgba(0,30,8,.72)';g.fillRect(0,0,320,240);
  g.save();g.translate(160,100);g.rotate(now*.9);for(let i=0;i<16;i++){g.rotate(TAU/16);g.fillStyle=i%2?'rgba(60,255,120,.22)':'rgba(255,230,120,.12)';g.beginPath();g.moveTo(0,0);g.lineTo(-22,-260);g.lineTo(22,-260);g.closePath();g.fill();}g.restore();
  // Schloss springt auf
  const op=clamp((t-.2)/.35,0,1),pop=1+Math.max(0,.35-Math.abs(t-.55))*1.2;g.save();g.translate(160,78);g.scale(pop,pop);
  g.lineWidth=7;g.strokeStyle='#d8dce8';g.beginPath();g.arc(0,-14-op*10,15,Math.PI,0);g.lineTo(15,-14-op*10+(op>0?0:0));g.stroke();
  const bg=g.createLinearGradient(0,-14,0,22);bg.addColorStop(0,'#fff2a0');bg.addColorStop(1,'#c88a10');g.fillStyle=bg;g.fillRect(-22,-14,44,36);g.strokeStyle='#5a3a00';g.lineWidth=2;g.strokeRect(-22,-14,44,36);
  g.fillStyle='#3a2000';g.beginPath();g.arc(0,2,5,0,TAU);g.fill();g.fillRect(-2,2,4,10);g.restore();
  const sc=1+Math.sin(t*10)*.04+(t<.5?(.5-t)*1.2:0);g.save();g.translate(160,140);g.scale(sc,sc);g.textAlign='center';g.textBaseline='middle';px(g,22);
  g.lineWidth=8;g.strokeStyle='#002a08';g.strokeText('ENTSPERRT',0,0);const tg=g.createLinearGradient(0,-11,0,11);tg.addColorStop(0,'#e8ffe0');tg.addColorStop(.5,'#3adf5a');tg.addColorStop(1,'#0a6a1a');g.fillStyle=tg;g.fillText('ENTSPERRT',0,0);g.restore();
  px(g,7);g.textAlign='center';g.fillStyle='#f4f0e8';g.fillText('DER AUTOMAT GEHÖRT DIR',160,168);
  g.restore();}
function fxDraw(m,g){
  drawUnlock(m,g);
  const F=m.fx;if(!F)return;
  if(F.big)drawBig(m,g);
  for(const p of F.parts){const a=1-p.life/p.max;
    if(p.coin){const w=Math.max(.6,Math.abs(Math.cos(p.ph+p.life*11)))*p.sz;g.globalAlpha=Math.min(1,a*2);
      g.fillStyle='#7a4a00';g.fillRect(p.x-w/2-1,p.y-p.sz/2-1,w+2,p.sz+2);g.fillStyle='#ffd23a';g.fillRect(p.x-w/2,p.y-p.sz/2,w,p.sz);
      g.fillStyle='#fff6c0';g.fillRect(p.x-w/2,p.y-p.sz/2,Math.max(1,w/3),Math.max(1,p.sz/3));}
    else{g.globalCompositeOperation='lighter';g.globalAlpha=a;g.fillStyle=p.col;const z=p.sz*(.6+a*.6);g.fillRect(p.x-z/2,p.y-z/2,z,z);g.globalCompositeOperation='source-over';}}
  g.globalAlpha=1;
  if(F.flash>0){g.fillStyle='rgba('+F.fcol+','+(F.flash*.55).toFixed(3)+')';g.fillRect(0,0,320,240);}
}
function drawBig(m,g){
  const B=m.fx.big,a=B.out?Math.max(0,1-B.out/.45):Math.min(1,B.t/.2);if(a<=0)return;
  g.save();g.globalAlpha=a;
  g.fillStyle='rgba(0,0,0,.74)';g.fillRect(0,0,320,240);
  g.save();g.translate(160,92);g.rotate(now*.5);
  for(let i=0;i<18;i++){g.rotate(TAU/18);g.fillStyle=i%2?'rgba(255,200,40,.2)':'rgba(255,80,20,.12)';g.beginPath();g.moveTo(0,0);g.lineTo(-24,-280);g.lineTo(24,-280);g.closePath();g.fill();}
  g.restore();
  const T=BIGT[Math.max(0,B.tier)],pop=Math.max(0,1-(now-B.popT)/.35),sc=(1+pop*.3)*(1+Math.sin(now*7)*.035);
  const sz=Math.min(28,Math.floor(270/(T.t.length*1.35)));
  g.save();g.translate(160,76);g.rotate(Math.sin(now*3.2)*.045);g.scale(sc,sc);g.textAlign='center';g.textBaseline='middle';px(g,sz);
  g.lineWidth=Math.max(5,sz*.35);g.strokeStyle='#1a0400';g.strokeText(T.t,0,3);g.strokeText(T.t,0,0);
  const tg=g.createLinearGradient(0,-sz/2,0,sz/2);tg.addColorStop(0,T.c[0]);tg.addColorStop(.55,T.c[1]);tg.addColorStop(1,T.c[2]);g.fillStyle=tg;g.fillText(T.t,0,0);
  const sx=((now*.9)%1.6-.3)*sz*T.t.length;g.globalCompositeOperation='lighter';g.globalAlpha=a*.5;g.fillStyle='#fff';
  g.save();g.beginPath();g.rect(sx-sz*.6,-sz,sz*1.2,sz*2);g.clip();g.fillText(T.t,0,0);g.restore();
  g.restore();
  g.globalAlpha=a;g.globalCompositeOperation='source-over';
  const bw=210,bx=160-bw/2,by=112;g.fillStyle='#000';g.fillRect(bx-3,by-3,bw+6,42);
  const bg=g.createLinearGradient(0,by,0,by+36);bg.addColorStop(0,'#fff0a0');bg.addColorStop(.5,'#c88a10');bg.addColorStop(1,'#6a3a00');g.fillStyle=bg;g.fillRect(bx,by,bw,36);
  g.fillStyle='#120a02';g.fillRect(bx+3,by+3,bw-6,30);
  const txt=fmt(m.disp),tz=Math.min(20,Math.floor((bw-16)/txt.length));px(g,tz);g.textAlign='center';g.textBaseline='middle';
  g.fillStyle=B.t>=B.dur&&Math.floor(now*4)%2?'#fff':'#ffd23a';g.fillText(txt,160,by+19);
  if(B.t<B.dur){px(g,6);g.fillStyle='#e8e0cc';g.fillText('START = SOFORT',160,by+50);}
  g.restore();
}
// Gewinn fliegt in Päckchen vom GEWINN-Feld ins GUTHABEN-Feld (Geld ist sofort gebucht, nur die Anzeige zählt mit)
const FLY_TO=[54,203];
function startFly(m,amount){const fast=!!m.auto,vals=splitWin(amount,fast?6:10),n=vals.length,G=fast?.12:.42,S=fast?.07:.11,D=fast?.38:.55,sp=Math.min(24,100/n);
  m.fly={amount,pending:amount,unl:amount,lastHit:-9,hits:0,pk:vals.map((v,i)=>({v,gx:clamp(264+(i-(n-1)/2)*sp,30,300),gy:174-(i%2)*9,born:i*.03,launch:G+i*S,dur:D,t:0,st:0,bend:(i%2?1:-1)*(10+i*3)}))};m.dirty=true;}
function flyXY(p){const k=clamp((p.t-p.launch)/p.dur,0,1),e=k*k*(3-2*k),cx=(p.gx+FLY_TO[0])/2+p.bend,cy=96,u=1-e;
  return [u*u*p.gx+2*u*e*cx+e*e*FLY_TO[0],u*u*p.gy+2*u*e*cy+e*e*FLY_TO[1],k];}
function flyStep(m,dt){const F=m.fly;if(!F)return;m.dirty=true;
  for(const p of F.pk){p.t+=dt;
    if(p.st===0&&p.t>=p.launch){p.st=1;F.unl-=p.v;}
    if(p.st===1){const [x,y]=flyXY(p);if(Math.random()<.7)fxBurst(m,x,y,1,{spd:12,up:0,g:0,life:.35,sz:2});
      if(p.t>=p.launch+p.dur){p.st=2;F.pending-=p.v;F.lastHit=now;F.hits++;SFX.coinUp(F.hits);fxBurst(m,FLY_TO[0]+30,FLY_TO[1],8,{spd:70,up:30,life:.45});}}}
  if(F.pk.every(p=>p.st===2))m.fly=null;}
function drawFly(m,g){const F=m.fly;if(!F)return;
  for(const p of F.pk){if(p.st===2||p.t<p.born)continue;const a=clamp((p.t-p.born)/.12,0,1),[x,y,k]=flyXY(p);
    const sc=p.st===0?.7+.3*a+Math.sin(p.t*16)*.05:1.2-k*.4,txt='+'+fmt(p.v),sz=Math.max(6,Math.round(9*sc));
    px(g,sz);g.textAlign='center';g.textBaseline='middle';g.globalAlpha=a;g.lineWidth=3;g.lineJoin='round';g.strokeStyle='#1a0800';g.strokeText(txt,x,y);
    g.fillStyle=p.st===1?'#fff4a0':'#ffd23a';g.fillText(txt,x,y);g.globalAlpha=1;}}
function winFx(m,ev){
  const x=ev.total/totalBet(m);
  const cells=[];(m.present?m.present.items:[]).forEach(it=>it.cells.forEach(c=>cells.push(c)));
  cells.forEach(([r,c])=>{const [cx,cy]=cellXY(r,c);fxBurst(m,cx,cy,x>=3?9:5,{spd:80,up:30,life:.7});});
  fxFlash(m,x>=3?.5:.3,'255,230,140');if(x>=3)fxShake(m,.3);if(x>=5)SFX.sparkle();
}
/* ---------- spin flow ---------- */
function startSpin(m,demo){
  m.info=false;m.demo=!!demo;
  m.rsp=!demo&&m.G.walkWild&&SlotEngine.wwPending(m.ww); // Schwert steht noch: Spin ist gratis und zählt nicht als Freispiel
  if(!demo&&!m.fs&&!m.rsp){const tb=totalBet(m);if(chips<tb){m.msg='GUTHABEN ZU NIEDRIG';m.auto=false;m.dirty=true;SFX.lose();updateButtons(m);return;}setChips(chips-tb);}
  m.useFs=!!m.fs;
  m.stops=SlotEngine.randStops(m.G,Math.random,m.useFs);
  m.grid=SlotEngine.grid(m.G,m.stops,m.useFs);
  m.myst=demo?null:SlotEngine.mystery(m.G,m.grid,Math.random,m.useFs);
  if(m.myst){const n=m.myst.cells.length,o=[...Array(n).keys()].sort(()=>Math.random()-.5);m.myst.at=[];o.forEach((ci,k)=>m.myst.at[ci]=MY_T0+k*MY_DT);m.myst.fxn=0;}
  m.ovr=null;
  if(m.G.walkWild&&!demo){let sc=0;for(let r=0;r<3;r++)for(let c=0;c<5;c++)if(m.grid[r][c]===m.G.scatter)sc++;m.shN=sc; // vor dem Schwert zählen
    if(m.fs&&m.G.free.shields){const l0=SlotEngine.tizLevel(m.fs.sh);m.fs.sh=(m.fs.sh||0)+sc;m.fs.lvUp=SlotEngine.tizLevel(m.fs.sh)>l0;}
    const h=m.fs?SlotEngine.tizHeight(m.fs.sh):1;m.ww=SlotEngine.walk(m.G,m.grid,m.ww,h);m.wwc=wwCells(m.ww);m.wwT=now;
    if(m.fs){const fr=m.ww.filter(w=>w.fresh).length;if(fr){m.fs.left+=fr;m.fs.total+=fr;m.topDirty=true;}}} // Merkur: jedes neue Schwert = +1 Freispiel
  else if(!m.G.walkWild){m.ww=null;m.wwc=null;}
  if(m.fs&&m.G.free&&m.G.free.superspin&&!demo){const ss=SlotEngine.superspin(m.G,m.grid,m.lines,payLine(m),Math.random,true);if(ss.grid!==m.grid){m.ovr=ss.grid;m.grid=ss.grid;m.ssSteps=ss.steps;}m.ev=ss.ev;}
  else if(m.G.walkWild&&m.fs&&!demo)m.ev=SlotEngine.tizEval(m.G,m.grid,m.lines,payLine(m),m.fs.sh,true);
  else m.ev=SlotEngine.evaluate(m.G,m.grid,m.lines,payLine(m),m.fs?m.fs.special:null,m.useFs);
  if(m.G.walkWild&&!demo)m.ev.trigger=m.shN>=3;
  const fast=m.auto?.75:1;
  m.reels.forEach((r,i)=>{r.spin=true;r.target=m.stops[i];r.stopAt=now+(.55+i*.2)*fast;r.teased=false;r.speed=28;r.t0=now+i*.045;r.land=null;r.vel=0;});
  if(m.G.special){m.reels.forEach((r,i)=>{if(i!==2)r.spin=false;});m.reels[2].stopAt=now+.75*fast;m.reels[2].t0=now;}
  m.state='spin';m.present=null;m.expand=null;m.msg=m.rsp?'SCHWERT WANDERT · GRATIS':m.fs?('FREISPIEL '+(m.fs.n+1)+' VON '+m.fs.total):m.demo?'':'VIEL GLÜCK!';
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
    if(!r.land){const t=now-(r.t0||0);r.vel=t<0?0:t<.08?-6:r.speed*Math.min(1,(t-.08)/.14)*(r.teased?1.4:1);r.pos-=r.vel*dt;
      if(r.teased&&Math.random()<dt*25)fxBurst(m,RX+i*CW+CW/2,RY+CH*3,2,{spd:30,up:90,g:-20,life:.6,w:CW-8});
      if(now>=r.stopAt){const v=Math.max(8,r.vel),d=2+(((r.pos-r.target-2)%1)+1)%1;r.land={t0:now,d,dur:clamp(4.25*d/v,.24,.5)};r.pos=r.target+d;
        // Spannung schon beim Abbremsen entscheiden, damit die nächsten Walzen noch laufen
        if(!m.demo&&m.G.free&&i<4){let sc=0;for(let k=0;k<=i;k++)if(scatterOnReel(m,k))sc++;
          if(sc>=2){const nx=m.reels[i+1];if(!nx.teased){nx.teased=true;for(let k=i+1;k<5;k++)m.reels[k].stopAt+=.9;SFX.tease(sc);m.msg='SPANNUNG...';}}}}
      return;}
    {const L=r.land,t=(now-L.t0)/L.dur;if(t<1){r.pos=r.target+L.d*(1-easeBack(t));r.vel=0;return;}}
    {r.spin=false;r.land=null;r.pos=r.target;r.vel=0;
      if(!m.demo){SFX.reelStop(i);
        if(m.grid&&m.G.wild&&m.state==='spin'&&!(m.myst&&m.myst.cells.some(q=>q[1]===i))){let wc=0;for(let k=0;k<3;k++)if(m.grid[k][i]===m.G.wild){wc++;const [cx,cy]=cellXY(k,i);fxBurst(m,cx,cy,10,{spd:70,up:20,life:.6});}
          if(wc){SFX.wildLand();fxFlash(m,.18,'255,220,120');}}}
      let sc=0;for(let k=0;k<=i;k++)if(scatterOnReel(m,k))sc++;
      if(scatterOnReel(m,i)&&!m.demo)SFX.scatter(sc);
    }
  });
  if(!any&&m.state==='spin'){
    if(m.myst&&!m.myst.open){m.state='myst';m.stateT=0;m.timer=MY_T0+m.myst.cells.length*MY_DT+.45;m.msg='ZUFALLSSYMBOLE!';SFX.tease(3);SFX.whoosh();updateButtons(m);}
    else onResult(m);}
  if(any)m.dirty=true;
}
function onResult(m){
  if(m.G.special==='spitze'){if(m.demo){m.state='idle';m.demo=false;m.dirty=true;return;}spitzeResult(m);return;}
  const ev=m.ev;
  m.present={items:[...ev.wins],idx:0,t:0};if(ev.scatter)m.present.items.push({scatter:true,...ev.scatter});
  if(m.demo){m.state='idle';m.demo=false;m.msg=ev.total?'GEWINN '+fmt(ev.total):'';m.dirty=true;return;}
  const lineWin=ev.total-(ev.expand?ev.expand.amount:0);
  if(m.fs){
    if(!m.rsp)m.fs.n++;m.win+=lineWin;
    if(m.fs.lvUp){m.fs.lvUp=false;SFX.big();fxFlash(m,.6,'255,220,120');m.topDirty=true;}
    m.state='fsShow';m.timer=lineWin>0?1.3:.5;if(lineWin>0){SFX.win();winFx(m,ev);}
    m.msg=lineWin>0?('GEWINN '+fmt(lineWin)):m.rsp?'SCHWERT WANDERT':('FREISPIEL '+m.fs.n+' VON '+m.fs.total);
  } else {
    if(ev.total>0){m.win=ev.total;m.state='count';m.timer=Math.min(2.6,.6+ev.total/totalBet(m)*.12);
      const big=ev.total>=totalBet(m)*10;big?SFX.big():SFX.win();if(big&&!m.demo)mpWin('gewinnt '+fmt(ev.total)+' an '+m.G.title+'!');
      m.msg=describeWin(m,m.present.items[0]);winFx(m,ev);if(big&&!ev.trigger)startBig(m,ev.total);}
    else if(ev.trigger){m.win=0;m.state='count';m.timer=.9;m.msg='FREISPIELE!';SFX.scatter(3);}
    else {m.state='idle';m.msg=m.auto?'AUTOSTART':'';if(!m.auto)slotIdleMsg(m);m.timer=m.auto?.5:0;
      if(wwPend(m)){m.msg='SCHWERT WANDERT · GRATIS-SPIN';m.timer=.7;}}
    if(ev.trigger){m.pendingFs=true;}
  }
  m.dirty=true;m.topDirty=true;updateButtons(m);
}
function describeWin(m,it){if(!it)return '';if(it.scatter)return it.count+'× '+SYMNAME[m.G.scatter]+' = '+fmt(it.amount);return 'LINIE '+(it.line+1)+': '+it.count+'× '+SYMNAME[it.sym]+' = '+fmt(it.amount);}
function collect(m){
  store('nk_slotpend',null);m.savedWin=0;
  if(m.win>0){setChips(chips+m.win,true);startFly(m,m.win);if(!m.auto){SFX.chip();fxBurst(m,265,RY+CH*3+20,Math.min(30,6+m.win/totalBet(m)|0),{coin:true,sz:4,spd:90,up:130,life:1.1});}}
  m.win=0;m.disp=0;m.gamble=null;m.power=null;m.state='idle';m.present=null;slotIdleMsg(m);m.dirty=true;m.topDirty=true;updateButtons(m);
}
function slotStep(m,dt){
  m.stateT+=dt;fxStep(m,dt);flyStep(m,dt);
  if(m.auto&&m.autoRisk&&m.state==='gamble'&&m.gamble&&m.gamble.kind==='ladder'&&!m.gamble.busy&&m.stateT>.4){
    if(m.win<=0||m.gamble.idx>=AUS_I){collect(m);if(m.auto)startSpin(m);}else ladderPress(m);}
  if(m.state==='gambleNext'&&m.gamble&&m.gamble.run){const t=Math.floor(m.stateT/.09);if(t!==m.gamble.rb&&m.stateT>.45){m.gamble.rb=t;SFX.ausTick(clamp(m.stateT/2.3,0,1));}}
  if(m.state==='myst'&&m.myst){const M=m.myst,n=M.cells.length;
    while(M.fxn<n){const ci=M.at.indexOf(MY_T0+M.fxn*MY_DT);if(m.stateT<MY_T0+M.fxn*MY_DT+MY_FL/2)break;const q=M.cells[ci>=0?ci:M.fxn],[cx,cy]=cellXY(q[0],q[1]);
      M.fxn++;SFX.coinUp(M.fxn*2);fxBurst(m,cx,cy,14,{spd:110,life:.7});fxFlash(m,.15,'255,230,140');
      if(M.fxn===n){SFX.sparkle();SFX.expand();fxFlash(m,.55,'255,230,140');fxShake(m,.4,true);}}}
  if(m.power)powerStep(m,dt);
  if(m.state==='spin')updReels(m,dt);else m.reels.forEach(r=>{if(r.bounce>0){r.bounce=Math.max(0,r.bounce-dt*6);m.dirty=true;}});
  if(m.present&&m.present.items.length){m.present.t+=dt;if(m.present.t>1.1){m.present.t=0;m.present.idx=(m.present.idx+1)%m.present.items.length;if(m.state==='show'||m.state==='count')m.msg=describeWin(m,m.present.items[m.present.idx]);m.dirty=true;}}
  // win counter
  if(m.fx&&m.fx.big&&m.state==='count'){}
  else if(m.gamble&&m.gamble.run){} // während der Ausspielung nichts verraten
  else if(m.disp<m.win){const step=Math.max(1,Math.ceil((m.win-m.disp)*dt*4));m.disp=Math.min(m.win,m.disp+step);if(Math.random()<.5)SFX.count();m.dirty=true;}
  else if(m.disp>m.win){m.disp=m.win;m.dirty=true;}
  if(m.timer>0){m.timer-=dt;if(m.timer<=0)timerDone(m);}
  if(m.state==='fsIntro'){m.dirty=true;}
  if(m.state==='expand'){m.expand.p=Math.min(1,m.expand.p+dt*1.4);m.dirty=true;}
  if(m.state==='gamble'||m.state==='gambleNext'||m.state==='menu'||m.state==='boot'||m.state==='poffer'||m.state==='power'||m.state==='splash'||m.state==='myst'||(m.state==='show'&&!m.auto))m.dirty=true;
  if(m.state!==m.prevState){m.prevState=m.state;m.stateAt=now;}
  // LEDs
  const hot=m.fs||m.state==='count'||m.state==='show';
  if(m.unlockT&&now-m.unlockT<2.2)m.ledMat.color.setHSL((now*3)%1,1,.55);
  else if(m.fx&&m.fx.big&&!m.fx.big.out)m.ledMat.color.setHex(Math.floor(now*14)%2?0xffffff:0xffc020);
  else if(hot){const h=(now*(m.state==='count'?2:.6))%1;m.ledMat.color.setHSL(h,1,.55);}else m.ledMat.color.setHex(m.accent);
  // button blink & press
  for(const k in m.btns){const b=m.btns[k];const on=b.lit&&(!b.blink||Math.floor(now*3)%2===0);b.mat.color.setHex(on?0xffffff:b.lit?0xaaaaaa:0x3a3a3a);
    if(b.press>0){b.press=Math.max(0,b.press-dt*7);}b.mesh.position.y=.035-b.press*.012;}
}
function timerDone(m){
  switch(m.state){
    case 'count':
      if(m.pendingFs){m.pendingFs=false;startFsIntro(m);break;}
      if(m.G.power&&m.win>=4*totalBet(m)&&!m.fs){m.auto=false;openOffer(m);break;}
      m.state='show';m.disp=m.win;updateButtons(m);
      if(m.auto||wwPend(m)){m.timer=wwPend(m)&&!m.auto?1.1:.7;}
      break;
    case 'show':if(m.auto&&m.autoRisk&&m.win>0&&m.G.id&&!wwPend(m)){startGamble(m,'ladder');break;}if(m.auto||wwPend(m)){collect(m);startSpin(m);}break;
    case 'idle':if(m.auto||wwPend(m))startSpin(m);break;
    case 'myst':m.myst.open=true;onResult(m);break;
    case 'power':if(m.power&&!m.power.spinning){if(m.power.left>0)powerSpin(m);else powerEnd(m);}break;
    case 'splash':m.state='idle';slotIdleMsg(m);m.dirty=true;updateButtons(m);break;
    case 'fsIntro':m.state='fsWait';m.timer=.3;m.topDirty=true;break;
    case 'fsWait':startSpin(m);break;
    case 'fsShow':{
      const ev=m.ev;
      if(ev.expand){m.state='expand';m.expand={reels:ev.expand.reels,sym:ev.expand.sym,list:ev.expand.list,p:0,amount:ev.expand.amount};SFX.expand();m.timer=2.2;m.msg='SONDERSYMBOL WÄCHST!';break;}
      afterFsSpin(m);break;}
    case 'expand':m.win+=m.expand.amount;SFX.big();fxFlash(m,.7,'255,230,140');fxShake(m,.5,true);m.expand.reels.forEach(c=>fxBurst(m,RX+c*CW+CW/2,RY+CH*1.5,18,{h:CH*3,spd:90}));m.msg='SONDERGEWINN '+fmt(m.expand.amount);m.state='expandShow';m.timer=1.6;break;
    case 'expandShow':afterFsSpin(m);break;
    case 'fsRetrig':m.state='fsWait';m.timer=.4;break;
    case 'fsEnd':
      mpWin('holt '+fmt(m.win)+' in den Freispielen!');m.fs=null;m.expand=null;m.ww=[];m.wwc=null;m.ovr=null;m.state='show';m.disp=0;m.msg='GESAMTGEWINN '+fmt(m.win);m.topDirty=true;
      if(m.win>=totalBet(m)*10){m.auto=false;startBig(m,m.win);}
      updateButtons(m);if(m.auto)m.timer=1.5;break;
    case 'gambleNext':if(m.gamble&&m.gamble.run){m.gamble.reveal();break;}m.gamble.busy=false;
      {const cap=m.gamble.kind==='ladder'?99:5;
      if(m.win<=0){m.gamble=null;m.state='idle';slotIdleMsg(m);if(m.auto)m.timer=.6;}
      else if(m.gamble.n>=cap||(m.gamble.kind==='ladder'&&m.gamble.idx>=ladOf(m).length-1)){m.state='gamble';m.msg='MAXIMUM ERREICHT';collect(m,true);}
      else{m.state='gamble';m.msg=m.gamble.kind==='ladder'?'LEITER DRÜCKEN ODER NEHMEN':'ROT ODER SCHWARZ?';}}
      m.dirty=true;m.topDirty=true;updateButtons(m);
      if(m.gamble&&m.gamble.queued&&m.state==='gamble'){const q=m.gamble.queued;m.gamble.queued=null;pressButton(m,q);}
      break;
  }
}
function afterFsSpin(m){
  if(!m.rsp)m.fs.left--;m.expand=null;
  const rn=m.G.free.byCount?m.G.free.byCount[Math.min(5,m.shN||0)]:(m.G.doppel&&m.dbl?15:m.G.free.count);
  if(m.ev.trigger&&rn){const n=rn;m.fs.left+=n;m.fs.total+=n;m.fs.plusN=n;m.state='fsRetrig';m.timer=2;m.msg='+'+n+' FREISPIELE!';SFX.fsIntro();m.topDirty=true;return;}
  if(m.fs.left>0||wwPend(m)){m.state='fsWait';m.timer=.5;}
  else{m.state='fsEnd';m.timer=3.4;m.msg='FREISPIELE BEENDET';SFX.big();}
  m.topDirty=true;
}
function startFsIntro(m){const F=m.G.free;let sc=0;for(let r=0;r<3;r++)for(let c=0;c<5;c++)if(m.grid[r][c]===m.G.scatter)sc++;if(m.G.walkWild)sc=m.shN||sc;
  const FC=F.byCount?F.byCount[Math.min(5,sc)]||F.count:(m.G.doppel&&m.dbl?15:F.count);m.ww=[];m.wwc=null;mpWin('hat '+FC+' Freispiele an '+m.G.title+'!');
  const cand=m.G.syms.filter(s=>s!==m.G.wild);
  let spc=null;if(m.G.free.expanding){const pool=cand.filter(s=>s!==m.G.scatter);spc=pool[Math.random()*pool.length|0];
    if(m.G.doppel&&m.dbl){let b;do{b=pool[Math.random()*pool.length|0];}while(b===spc);spc=[spc,b];}}
  m.fs={left:FC,total:FC,n:0,sh:0,special:spc};
  m.state='fsIntro';m.timer=m.fs.special?4.2:3;m.stateT=0;m.msg=FC+' FREISPIELE!';SFX.fsIntro();SFX.boom();fxFlash(m,1);fxShake(m,.8,true);fxBurst(m,160,100,60,{coin:true,spd:170,up:100,sz:5,life:1.6});m.auto=false;m.topDirty=true;updateButtons(m);
}

/* ---------- POWER SPINS: 4 Walzensätze gleichzeitig, bezahlt aus dem Gewinn ---------- */
const PMULTS=[1,2,5,10,20];
function pOffer(m){const tb=4*totalBet(m);let k=clamp(m.pmult||0,0,PMULTS.length-1);
  while(k>0&&Math.floor(m.win/(tb*PMULTS[k]))<1)k--;m.pmult=k;const mult=PMULTS[k],cost=tb*mult,n=Math.floor(m.win/cost);
  return {mult,cost,n,lo:k>0,hi:k<PMULTS.length-1&&Math.floor(m.win/(tb*PMULTS[k+1]))>=1};}
function openOffer(m){m.present=null;m.state='poffer';m.disp=m.win;if(m.pmult===undefined)m.pmult=0;m.stateT=0;m.msg='ANNEHMEN ODER POWER SPINS?';SFX.fsIntro();m.dirty=true;m.topDirty=true;updateButtons(m);}
function startPowerRun(m){
  const o=pOffer(m);if(o.n<1)return;
  const mk=()=>{const stops=SlotEngine.randStops(m.G,Math.random);return {stops,grid:SlotEngine.grid(m.G,stops),ev:null,reels:stops.map(p=>({pos:p,spin:false,stopAt:0,target:p}))};};
  m.win-=o.n*o.cost;m.disp=m.win;
  m.power={sets:[mk(),mk(),mk(),mk()],spinning:false,last:0,count:0,left:o.n,total:o.n,mult:o.mult,cost:o.cost,sum:0};
  m.state='power';m.msg=o.n+' POWER SPINS'+(o.mult>1?' · ERFOLGE ×'+o.mult:'');SFX.fsIntro();mpWin('spielt '+o.n+' POWER SPINS an '+m.G.title+'!');
  m.timer=1.2;m.dirty=true;m.topDirty=true;updateButtons(m);
}
function powerSpin(m){
  const P=m.power;if(P.spinning||P.left<=0)return;
  P.left--;P.spinning=true;P.last=0;P.count++;
  P.sets.forEach((S,si)=>{S.stops=SlotEngine.randStops(m.G,Math.random);S.grid=SlotEngine.grid(m.G,S.stops);S.myst=SlotEngine.mystery(m.G,S.grid,Math.random);S.ev=SlotEngine.evaluate(m.G,S.grid,m.lines,betLine(m)*P.mult);
    S.reels.forEach((r,i)=>{r.spin=true;r.target=S.stops[i];r.stopAt=now+.5+i*.11+si*.16;});});
  m.msg=P.left+' POWER SPINS ÜBRIG';SFX.reelStart();m.dirty=true;m.topDirty=true;updateButtons(m);
}
function powerStep(m,dt){
  const P=m.power;if(!P.spinning)return;let any=false;
  P.sets.forEach(S=>S.reels.forEach(r=>{if(!r.spin)return;any=true;r.pos-=24*dt;if(now>=r.stopAt){r.spin=false;r.pos=r.target;SFX.clunk();}}));
  m.dirty=true;
  if(!any){P.spinning=false;const w=P.sets.reduce((a,S)=>a+S.ev.total,0);P.last=w;P.sum+=w;m.win+=w;
    P.sets.forEach((S,si)=>{if(S.ev.total>0)fxBurst(m,RX-3+(si%2)*143+70,RY-3+(si/2|0)*82+38,S.ev.total>=P.cost?18:8,{spd:90,w:100,h:50});});
    if(w>=P.cost*5){fxFlash(m,.6,'255,230,140');fxShake(m,.5,true);}else if(w>0)fxFlash(m,.25,'255,230,140');
    if(w>0){w>=P.cost*5?SFX.big():SFX.win();m.msg='POWER GEWINN '+fmt(w);if(w>=P.cost*10)mpWin('gewinnt '+fmt(w)+' in den POWER SPINS!');}
    else m.msg=P.left>0?P.left+' POWER SPINS ÜBRIG':'POWER SPINS BEENDET';
    m.timer=P.left>0?(w>0?1.5:.8):1.6;m.topDirty=true;updateButtons(m);}
}
function powerEnd(m){
  if(!m.power||m.power.spinning)return;const sum=m.power.sum;m.power=null;m.auto=false;
  if(m.win>=4*totalBet(m)){openOffer(m);m.msg='POWER +'+fmt(sum)+' · NOCHMAL? + ERHÖHT';return;}
  if(m.win>0){m.state='show';m.disp=m.win;m.msg='POWER SPINS ENDE · '+fmt(m.win);}else{m.state='idle';slotIdleMsg(m);}
  m.dirty=true;m.topDirty=true;updateButtons(m);
}
function drawOffer(m,g){
  const o=pOffer(m),x=RX+6,y=RY+2,w=CW*5-12,h=CH*3-4;
  g.fillStyle='rgba(0,0,0,.55)';g.fillRect(RX-3,RY-3,CW*5+6,CH*3+6);
  const bg=g.createLinearGradient(0,y,0,y+h);bg.addColorStop(0,'#5a5e66');bg.addColorStop(1,'#24262c');g.fillStyle='#000';g.fillRect(x-2,y-2,w+4,h+4);g.fillStyle=bg;g.fillRect(x,y,w,h);
  g.strokeStyle='#9aa0aa';g.lineWidth=1;g.strokeRect(x+3.5,y+3.5,w-7,h-7);
  g.textAlign='center';g.textBaseline='middle';px(g,10);g.lineWidth=4;g.strokeStyle='#000';g.strokeText('HERZLICHEN GLÜCKWUNSCH',160,y+14);
  const tg=g.createLinearGradient(0,y+8,0,y+20);tg.addColorStop(0,'#fff2a0');tg.addColorStop(1,'#e08a10');g.fillStyle=tg;g.fillText('HERZLICHEN GLÜCKWUNSCH',160,y+14);
  const box=(bx,by,bw,bh,txt,col,sz)=>{g.fillStyle='#bfc4cc';g.fillRect(bx-2,by-2,bw+4,bh+4);g.fillStyle='#000';g.fillRect(bx,by,bw,bh);px(g,Math.min(sz,Math.floor((bw-6)/txt.length)));g.fillStyle=col;g.fillText(txt,bx+bw/2,by+bh/2+1);};
  box(x+16,y+28,108,26,fmt(m.win),'#ff3030',13);
  {const pl=o.n+' POWER SPIN'+(o.n===1?'':'S');box(x+w-124,y+28,108,26,pl,'#3adf5a',Math.min(9,Math.floor(100/pl.length)));}
  const blink=Math.floor(now*3)%2;
  const btn=(bx,by,bw,bh,txt,c1,c2,lit)=>{g.fillStyle='#000';g.fillRect(bx-2,by-2,bw+4,bh+4);const bgr=g.createLinearGradient(0,by,0,by+bh);bgr.addColorStop(0,c1);bgr.addColorStop(1,c2);g.fillStyle=bgr;g.fillRect(bx,by,bw,bh);
    if(lit){g.strokeStyle='#fff';g.lineWidth=1.5;g.strokeRect(bx+1,by+1,bw-2,bh-2);}px(g,8);g.fillStyle='#fff';g.fillText(txt,bx+bw/2,by+bh/2+1);};
  btn(x+14,y+64,92,22,'ANNEHMEN','#3a6ad6','#0a1a5a',false);
  px(g,9);g.fillStyle='#ffd23a';g.fillText('ODER',160,y+75);
  btn(x+w-106,y+64,92,22,'POWER SPINS','#3adf5a','#0a6a1a',blink);
  btn(x+18,y+100,26,22,'−','#ff5a5a','#8a0010',o.lo);btn(x+w-44,y+100,26,22,'+','#ff5a5a','#8a0010',o.hi&&blink);
  box(x+70,y+98,w-140,26,fmt(o.cost),'#ff3030',12);
  px(g,6);g.fillStyle='#f4f0e8';g.fillText('PRO POWER SPIN',160,y+134);
  g.fillText(o.mult>1?'ALLE ERFOLGE ×'+o.mult:'4 SPIELE JE '+fmt(totalBet(m)),160,y+144);
}
// Tippen auf die Knöpfe im Angebots-Fenster
function offerTap(m,uv){
  if(m.state!=='poffer'||!uv)return false;const x=uv.x*320,y=(1-uv.y)*240,ox=RX+6,oy=RY+2,w=CW*5-12;
  const hit=(bx,by,bw,bh)=>x>=bx-3&&x<=bx+bw+3&&y>=by-3&&y<=by+bh+3;
  if(hit(ox+14,oy+64,92,22)){pressButton(m,'LINIEN');return true;}
  if(hit(ox+w-106,oy+64,92,22)){pressButton(m,'START');return true;}
  if(hit(ox+18,oy+100,26,22)){pressButton(m,'EINSATZ');return true;}
  if(hit(ox+w-44,oy+100,26,22)){pressButton(m,'AUTO');return true;}
  return false;
}
function drawPower(m,g){
  const P=m.power,G=m.G,W=139,H=77,cw=W/5,ch=H/3;
  g.fillStyle='#000';g.fillRect(RX-3,RY-3,CW*5+6,CH*3+6);
  // Kopfzeile: N POWER SPINS
  g.fillStyle='#1a0400';g.fillRect(0,0,320,RY-4);g.textAlign='center';g.textBaseline='middle';px(g,12);
  const t=P.left+(P.spinning?1:0),lbl=t+' POWER SPIN'+(t===1?'':'S');g.lineWidth=4;g.strokeStyle='#000';g.strokeText(lbl,160,12);
  const hg=g.createLinearGradient(0,4,0,20);hg.addColorStop(0,'#d0ff80');hg.addColorStop(1,'#2a9a10');g.fillStyle=hg;g.fillText(lbl,160,12);
  if(P.mult>1){px(g,6);g.fillStyle='#ffd23a';g.textAlign='right';g.fillText('ERFOLGE ×'+P.mult,316,12);}
  P.sets.forEach((S,si)=>{const ox=RX-3+(si%2)*(W+4),oy=RY-3+(si/2|0)*(H+5);
    for(let c=0;c<5;c++){const r=S.reels[c],St=G.strips[c],L=St.length,x=ox+c*cw;
      g.save();g.beginPath();g.rect(x+.5,oy,cw-1,H);g.clip();
      g.drawImage(lpSand(),x,oy,cw,H);
      const fl=Math.floor(r.pos),off=r.pos-fl;
      for(let k=0;k<4;k++){const y=oy+(k-off)*ch;
        if(k<3&&!r.spin&&mystHas(S.myst,k,c)){if(P.spinning)mystCover(g,x+1,y+1,cw-2,ch-2);else{g.fillStyle='rgba(255,210,58,.35)';g.fillRect(x,y,cw,ch);g.drawImage(symCanvas(S.myst.sym),x+(cw-23)/2,y+(ch-23)/2,23,23);}continue;}
        g.globalAlpha=r.spin?.8:1;g.drawImage(symCanvas(St[((fl+k-1)%L+L)%L]),x+(cw-23)/2,y+(ch-23)/2,23,23);}
      g.globalAlpha=1;g.restore();}
    if(!P.spinning&&S.ev&&S.ev.total>0){const blink=Math.floor(now*3)%2;
      S.ev.wins.forEach(w=>{g.strokeStyle=blink?LINECOL[w.line%10]:'#fff';g.lineWidth=1.5;w.cells.forEach(([r,c])=>g.strokeRect(ox+c*cw+1.5,oy+r*ch+1.5,cw-3,ch-3));});
      g.fillStyle='rgba(0,0,0,.75)';g.fillRect(ox+W/2-34,oy+H-14,68,13);px(g,Math.min(8,Math.floor(66/('+'+fmt(S.ev.total)).length)));g.fillStyle='#ffd23a';g.textAlign='center';g.textBaseline='middle';g.fillText('+'+fmt(S.ev.total),ox+W/2,oy+H-7);}
    g.strokeStyle='#ffd23a';g.lineWidth=1;g.strokeRect(ox+.5,oy+.5,W-1,H-1);});
}

/* ---------- gamble ---------- */
function startGamble(m,kind){
  m.present=null;if(!(m.auto&&m.autoRisk&&kind==='ladder'))m.auto=false;
  if(kind==='ladder'){
    let idx=-1;for(let i=0;i<ladOf(m).length;i++)if(ladOf(m)[i]<=m.win)idx=i;
    // Gewinn unter der untersten Stufe: erster Druck geht auf die unterste Stufe oder 0 (fair)
    const rest=idx<0?0:m.win-ladOf(m)[idx];if(rest>0){setChips(chips+rest);}
    if(idx>=0)m.win=ladOf(m)[idx];m.disp=m.win;
    if(idx>=ladOf(m).length-1){collect(m);return;}
    m.gamble={kind:'ladder',n:0,busy:false,idx,last:null,t0:now,ph:0};m.stateT=0;m.state='gamble';m.msg=rest>0?('REST '+fmt(rest)+' GUTGESCHRIEBEN · DRÜCKEN!'):'LEITER DRÜCKEN ODER NEHMEN';
    if(idx>=AUS_I){m.gamble.last=idx;m.gamble.up=true;ausShow(m);m.dirty=true;m.topDirty=true;return;}}
  else{m.gamble={kind:'rb',n:0,busy:false,card:null};m.state='gamble';m.msg='ROT ODER SCHWARZ?';}
  m.dirty=true;m.topDirty=true;updateButtons(m);
}
// Leiter: beginnt beim Einsatz, Stufen in Vielfachen davon (~x1,4).
// Hoch = eine Stufe, daneben = zwei Stufen runter (unter der untersten = 0).
// p = (L[i]-L[i-2]) / (L[i+1]-L[i-2]) * 0.98  ->  meist 50-60 % hoch, Drücken bleibt fair (2 % Hausvorteil)
// Leiter wie am echten Merkur-Gerät (Werte bei Level 40), auf den Einsatz umgerechnet; unterste Stufe = Einsatz.
// Ab 400 (bei Level 40, also 10× Einsatz) beginnt die AUSSPIELUNG mit didididi.
// Feste Euro-Beträge wie am echten Gerät (unabhängig vom Einsatz). 100 € ist nur der Rückfall-Boden in RISIKO+.
const LAD_REAL=[15,30,60,120,240,400,800,1200,2000,3200,5200,8400,10000,14000,18000,22000,26000,30000];
const F_I=12;   // 100 € – Mindestrückfall in RISIKO+
const TOP_I=13; // 140 € – Spitze der normalen Leiter, ab hier RISIKO+
const PLUS_I=14; // erste Stufe der Risiko+-Spalte (180 €)
const AUS_I=5; // erste Stufe über dem Feld AUSSPIELUNG (4,00 €)
const ausIdx=m=>AUS_I;
function ladOf(m){return LAD_REAL;}
// Echte Leiter (merkur.com): normal fällt man Stufe für Stufe „irgendwann zurück auf Null“ (hier: 2 Stufen runter),
// in RISIKO+ (ab 140 €) nur auf mindestens 100 €. Von 100 € geht es hoch auf 140 € oder runter auf 52 €. Fair mit 2 % Vorteil.
const ladDown=i=>i>=TOP_I?F_I:i===F_I?TOP_I-3:i>=2?i-2:-1;
const ladNext=i=>i===TOP_I-2?TOP_I:i+1; // 84 € → 140 € (100 € liegt nur in der RISIKO+-Spalte)
// Ausspielung: das Licht landet meistens auf 4 €, ganz selten höher (bis 140 €)
const AUS_LAND=[90,6,2.2,1,.45,.2,.1,.05],AUS_IDX=[5,6,7,8,9,10,11,TOP_I]; // 4 8 12 20 32 52 84 140 €
const ausEV=L=>AUS_IDX.reduce((a,i,k)=>a+L[i]*AUS_LAND[k],0)/AUS_LAND.reduce((a,b)=>a+b,0);
function ausLand(){let r=Math.random()*AUS_LAND.reduce((a,b)=>a+b,0);for(let k=0;k<AUS_LAND.length;k++){r-=AUS_LAND[k];if(r<0)return AUS_IDX[k];}return AUS_I;}
const ladderUp=(L,i)=>{if(i>=L.length-1)return 0;const d=ladDown(i),D=d>=0?L[d]:0,nx=i===AUS_I-1?ausEV(L):L[ladNext(i)];return (L[i]-D)/(nx-D)*.98;};
// AUSSPIELUNG: nur Show – das Licht springt wild über die oberen Stufen (didididi) und landet auf dem erreichten Wert
function ausShow(m,then){const gm=m.gamble;gm.run=true;gm.busy=true;gm.rb=-1;m.state='gambleNext';m.stateT=0;m.timer=2.6;m.msg='AUSSPIELUNG!';SFX.ausFan();
  gm.reveal=()=>{gm.run=false;SFX.ausFan();fxFlash(m,.7,'255,210,80');fxShake(m,.5,true);fxBurst(m,239,RY+60,40,{coin:true,sz:4,spd:150,up:80,life:1.2});
    m.disp=m.win;m.msg=m.win>ladOf(m)[AUS_I]?'AUSSPIELUNG · HÖHER! '+fmt(m.win):'AUSSPIELUNG · '+fmt(m.win);m.stateT=0;m.timer=gm.queued?.35:.9;if(then)then();};
  m.dirty=true;updateButtons(m);}
function ladderPress(m){
  const gm=m.gamble;if(gm.busy)return;gm.busy=true;m.stateT=0;const L=ladOf(m);gm.last=gm.idx;
  if(gm.idx<0){const up=Math.random()<m.win/L[0]*.98;gm.target=up?0:-2;gm.up=up;ladderResult(m);return;}
  const up=Math.random()<ladderUp(L,gm.idx);if(up&&gm.idx>=L.length-1){gm.busy=false;collect(m);return;}
  gm.target=up?(gm.idx===AUS_I-1?ausLand():ladNext(gm.idx)):ladDown(gm.idx);gm.up=up;
  ladderResult(m);
}
function ladderResult(m){
  const gm=m.gamble,L=ladOf(m),from=gm.idx,t=gm.target;gm.run=false;gm.idx=t;
  if(t>from){m.win=L[t];m.disp=m.win;m.msg='HOCH! '+fmt(m.win);SFX.win();
    fxBurst(m,239,RY+70,22,{cols:['#a8ffb0','#ffd23a','#fff'],spd:110,w:70});fxFlash(m,.3,'160,255,170');if(m.win>=totalBet(m)*20)fxShake(m,.35,true);}
  else if(t>=0){m.win=L[t];m.disp=m.win;m.msg='RUNTER AUF '+fmt(m.win)+' · WEITER?';SFX.lose();fxFlash(m,.3,'255,60,60');fxShake(m,.3);}
  else{gm.idx=-1;m.msg='ABGESTÜRZT';m.win=0;m.disp=0;SFX.lose();SFX.boom();fxFlash(m,.7,'255,30,30');fxShake(m,.7,true);}
  m.state='gambleNext';m.timer=t<0?1.6:1.0;m.stateT=0;m.dirty=true;updateButtons(m);
  if(t>from&&t>=AUS_I&&from<AUS_I){m.disp=L[AUS_I];ausShow(m);}
}
// TEILEN: die Hälfte auszahlen, mit dem Rest (nächste Stufe darunter) weiterspielen
function ladderSplit(m){
  const gm=m.gamble;if(!gm||gm.busy||gm.idx<1)return;
  const half=m.win/2;let j=0;for(let i=0;i<ladOf(m).length;i++)if(ladOf(m)[i]<=half)j=i;
  const pay=m.win-ladOf(m)[j];setChips(chips+pay,true);gm.idx=j;m.win=ladOf(m)[j];m.disp=m.win;
  m.msg='GETEILT · '+fmt(pay)+' GUTGESCHRIEBEN';SFX.chip();fxBurst(m,100,RY+78,20,{coin:true,sz:4,spd:120,up:90,life:1.2});m.dirty=true;updateButtons(m);
}
function gambleRB(m,red){
  const gm=m.gamble;if(gm.busy)return;gm.busy=true;
  const c=Math.random()*52|0,isRed=((c/13|0)===1||(c/13|0)===2);gm.card=c;m.history.unshift(c);if(m.history.length>6)m.history.pop();
  SFX.card();
  if(isRed===red){m.win*=2;gm.n++;m.msg='RICHTIG! '+fmt(m.win);SFX.win();fxBurst(m,160,RY+108,26,{spd:120,w:60,h:80});fxFlash(m,.35,'255,230,140');}
  else{m.msg='VERLOREN';m.win=0;m.disp=0;SFX.lose();}
  m.state='gambleNext';m.timer=isRed===red?1.3:2.2;m.dirty=true;updateButtons(m);
}
/* ---------- RISIKO+ Leiter (wie am echten Gerät: goldene Stufen über den abgedunkelten Walzen) ---------- */
const LAD_HZ=1.5;
function goldRung(g,x,y,w,h,lit,txt,col,zone){
  const fr=g.createLinearGradient(0,y,0,y+h);fr.addColorStop(0,'#fff0a0');fr.addColorStop(.5,'#c88a10');fr.addColorStop(1,'#6a3a00');
  g.fillStyle='#000';g.fillRect(x-1,y-1,w+2,h+2);g.fillStyle=fr;g.fillRect(x,y,w,h);
  if(lit){const lf=g.createLinearGradient(0,y,0,y+h);lf.addColorStop(0,col==='red'?'#ff8a8a':col==='green'?'#a8ffb0':'#fffbb0');lf.addColorStop(1,col==='red'?'#d01020':col==='green'?'#1fb04a':'#ffc400');g.fillStyle=lf;}
  else g.fillStyle=zone?'#4a0610':'#120a02';
  g.fillRect(x+2,y+2,w-4,h-4);
  px(g,Math.min(h>14?9:h>11?8:7,Math.floor((w-6)/txt.length)));g.textAlign='center';g.textBaseline='middle';g.fillStyle=lit?'#1a0e00':'#f4f0e8';g.fillText(txt,x+w/2,y+h/2+1);
}
function drawLadder(m,g,gm){
  // Walzen abdunkeln
  g.fillStyle=gm.preview?'rgba(0,0,0,.5)':'rgba(0,0,0,.62)';g.fillRect(RX-3,RY-3,CW*5+6,CH*3+6);
  const run=m.state==='gambleNext'&&gm.run,result=m.state==='gambleNext'&&!run,cur=gm.idx,L=ladOf(m);
  const ph=Math.floor((gm.preview?now:m.stateT)*LAD_HZ*2)%2===0;
  if(!result&&!run&&ph!==gm.ph){gm.ph=ph;if(!gm.preview&&!m.remote)SFX.gambleTick(ph);}
  const slide=ease(clamp((now-gm.t0)/.35,0,1)),dy=-(1-slide)*240;
  const rh=10.4,x=194,W=86,yb=RY+CH*3+2+dy,pos=k=>k<AUS_I?k:k<F_I?k+1:k,yOf=p=>yb-rh*(p+2);
  g.save();g.beginPath();g.rect(0,0,320,RY+CH*3+4);g.clip();
  // laufendes Licht: über die oberen Stufen hin und her
  const st=Math.floor(m.stateT/.09),rk=m.stateT<.45?AUS_I-99:AUS_IDX[(st*7919+st*st*31+13)%AUS_IDX.length];
  const upT=ladNext(cur),dnT=ladDown(cur);
  for(let k=0;k<PLUS_I;k++){if(k===F_I)continue;const y=yOf(pos(k)),up=k>=AUS_I,w=up?W:W-14,xx=up?x:x+7;
    let lit=false,col='y';
    if(run){lit=k===rk;col='red';}
    else if(result){if(k===cur){lit=true;col=gm.up?'green':'y';}}
    else{if(k===upT&&ph)lit=true;if(k===dnT&&!ph)lit=true;}
    goldRung(g,xx,y,w,rh-1.4,lit,fmt(L[k]).replace(' €',''),col,up);
    if(!result&&!run&&k===cur){g.strokeStyle='#fff';g.lineWidth=1.2;g.strokeRect(xx-2,y-2,w+4,rh+2.6);}}
  {const y=yOf(AUS_I),lit=run?true:(!result&&cur===AUS_I-1&&ph);goldRung(g,x+3,y,W-6,rh-1.4,lit,'AUSSPIELUNG',lit?'red':'y',true);}
  const zl=!run&&((result&&cur<0)||(!result&&dnT<0&&!ph));
  goldRung(g,x+18,yb-rh,W-36,rh-1.4,zl,'0',zl&&result?'red':'y');
  // RISIKO+-Spalte (links neben der Leiter): 100 · 140 · 180 · 220 · 260 · 300 €
  {const PV=L.slice(F_I),bh=19,bx=118,bw=70;
    PV.forEach((v,q)=>{const y=RY+CH*3-8-(q+1)*(bh+3)+dy,k=L.indexOf(v);let lit=false,col='y';
      if(k>=F_I){if(result&&k===cur){lit=true;col=gm.up?'green':'y';}else if(!result&&!run){if(k===upT&&ph)lit=true;if(k===dnT&&!ph)lit=true;}}
      g.fillStyle='#000';g.fillRect(bx-2,y-2,bw+4,bh+4);g.fillStyle=lit?(col==='green'?'#3adf5a':'#ffd23a'):'#2a0608';g.fillRect(bx,y,bw,bh);
      g.strokeStyle=k===cur&&!run?'#fff':'#c01020';g.lineWidth=k===cur&&!run?2:1.5;g.strokeRect(bx+1,y+1,bw-2,bh-2);
      const t=fmt(v).replace(' €','');px(g,Math.min(9,Math.floor((bw-8)/t.length)));g.textAlign='center';g.textBaseline='middle';g.fillStyle=lit?'#1a0e00':'#d8b860';g.fillText(t,bx+bw/2,y+bh/2+1);});}
  // RISIKO+ Schriftzug und Erfolg ganz links
  g.textAlign='left';g.textBaseline='middle';px(g,13);g.lineWidth=5;g.strokeStyle='#000';g.strokeText('RISIKO',24,RY+16+dy);
  const tg=g.createLinearGradient(0,RY+8,0,RY+26);tg.addColorStop(0,'#fff6a0');tg.addColorStop(1,'#e07a00');g.fillStyle=tg;g.fillText('RISIKO',24,RY+16+dy);
  px(g,11);g.fillStyle='#ff3a3a';g.strokeText('+',100,RY+10+dy);g.fillText('+',100,RY+10+dy);
  px(g,7);g.fillStyle='#e8e0cc';g.fillText('ERFOLG',26,RY+48);
  g.fillStyle='#000';g.fillRect(24,RY+56,88,26);g.strokeStyle='#c88a10';g.lineWidth=2;g.strokeRect(24,RY+56,88,26);
  {const t=fmt(m.disp);px(g,Math.min(12,Math.floor(82/t.length)));g.textAlign='right';g.fillStyle=result&&cur<0?'#ff3a3a':'#ffd23a';g.fillText(t,108,RY+70);}
  g.fillStyle='#9b8fb3';
  fitL(g,run?'AUSSPIELUNG ...':result?(cur<0?'VERLOREN':gm.up?'GEWONNEN!':'RUNTER'):cur>=F_I?'RISIKO+ · MIND. 100':'LEITER = HOCH',26,RY+96,86,6);
  if(!result&&!run&&cur>=1){g.fillStyle=Math.floor(now*2)%2?'#ffd23a':'#fff';fitL(g,'TEILEN = HÄLFTE',26,RY+110,86,6);}
  g.fillStyle='#9b8fb3';fitL(g,'START = NEHMEN',26,RY+124,86,6);
  g.restore();
}
function drawSplash(m,g){
  const G=m.G,t=m.stateT;
  const bg=g.createRadialGradient(160,110,10,160,120,200);bg.addColorStop(0,'#ffcf3a');bg.addColorStop(.35,'#e0305a');bg.addColorStop(1,'#2a0010');g.fillStyle=bg;g.fillRect(0,0,320,240);
  for(let i=0;i<30;i++){const a=i/30*TAU+t*.4;g.fillStyle='rgba(255,230,150,'+(.08+.06*Math.sin(t*3+i))+')';g.beginPath();g.moveTo(160,110);g.lineTo(160+Math.cos(a)*300,110+Math.sin(a)*300);g.lineTo(160+Math.cos(a+.06)*300,110+Math.sin(a+.06)*300);g.fill();}
  const k=ease(clamp(t/.6,0,1)),sc=.6+.4*k;
  g.save();g.translate(160,92);g.scale(sc,sc);g.textAlign='center';g.textBaseline='middle';
  const words=G.title.split(' ');words.forEach((wd,i)=>{const y=(i-(words.length-1)/2)*34;px(g,26);g.lineWidth=8;g.strokeStyle='#3a0a00';g.strokeText(wd,0,y);
    const tg=g.createLinearGradient(0,y-14,0,y+14);tg.addColorStop(0,'#fff8c0');tg.addColorStop(.5,'#ffc020');tg.addColorStop(1,'#a04a00');g.fillStyle=tg;g.fillText(wd,0,y);});
  g.restore();
  if(t>.7){g.textAlign='center';g.textBaseline='middle';px(g,14);g.lineWidth=5;g.strokeStyle='#3a0a00';g.strokeText('VIEL GLÜCK!',160,190);g.fillStyle='#ffe040';g.fillText('VIEL GLÜCK!',160,190);}
}
/* ---------- verdeckte Walzen ---------- */
const MY_T0=.55,MY_DT=.2,MY_FL=.36;
const mystHas=(M,r,c)=>!!M&&M.cells.some(q=>q[0]===r&&q[1]===c);
function mystCover(g,x,y,w,h){const s=Math.min(w,h);g.drawImage(lpCover(),x+(w-s)/2,y+(h-s)/2,s,s);}
function drawMystCell(m,g,x,y,w,h,r,c){
  const M=m.myst,ci=M.cells.findIndex(q=>q[0]===r&&q[1]===c);let p=M.open?1:0;
  if(m.state==='myst'&&M.at)p=clamp((m.stateT-M.at[ci])/MY_FL,0,1);
  const cx=x+w/2,cy=y+h/2;g.save();
  if(p<=0){const pl=1+.035*Math.sin(now*9+ci);g.translate(cx,cy);g.scale(pl,pl);g.translate(-cx,-cy);mystCover(g,x,y,w,h);
    g.globalCompositeOperation='lighter';g.globalAlpha=.15+.12*Math.sin(now*7+ci*1.3);g.fillStyle='#ffc830';g.fillRect(x,y,w,h);}
  else if(p<.5){const k=1-p*2;g.translate(cx,cy);g.scale(Math.max(.03,k),1+p*.2);g.translate(-cx,-cy);mystCover(g,x,y,w,h);}
  else{const k=(p-.5)*2,pop=p<1?1+Math.sin(k*Math.PI)*.28:1;g.translate(cx,cy);g.scale(Math.max(.03,k)*pop,pop);g.translate(-cx,-cy);
    const gl=g.createRadialGradient(cx,cy,2,cx,cy,w*.7);gl.addColorStop(0,'rgba(255,230,140,.55)');gl.addColorStop(1,'rgba(255,200,60,0)');g.fillStyle=gl;g.fillRect(x-6,y-6,w+12,h+12);
    g.drawImage(symCanvas(M.sym),x+(w-46)/2,y+(h-46)/2,46,46);}
  g.restore();
}
/* ---------- screen rendering ---------- */
const RX=22,RY=27,CW=55.2,CH=51;
function bgFor(m,g){
  if(typeof MK_BG!=='undefined'&&MK_BG[m.G.id]){g.drawImage(MK_BG[m.G.id](m),0,0);return;}
  const BGC={viking:['#0a1a30','#04101e'],mine:['#1a1410','#0a0806'],reef:['#03304a','#011a2a'],temple:['#3a1004','#1a0602'],pharao:['#4a0808','#140202'],spitze:['#0a1030','#02040e'],zent:['#0a2a4a','#04101e'],tizona:['#2a1a0a','#0a0604'],doppel:['#3a2208','#120802']}[m.G.id];
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
    const RC={book:['#5a4020','#e8d8b0'],fruit:['#3a0a08','#f4e8d0'],viking:['#1a2a4a','#dce6f4'],mine:['#2a2014','#e8dcc8'],reef:['#0a3a5a','#d8f0f8'],temple:['#4a1a08','#f4dcc0'],pharao:['#3a0a0a','#f4e0c8'],zent:['#9aa4b4','#ffffff'],tizona:['#060c1a','#101c34'],doppel:['#000000','#0c0a08']}[G.id];
    rg.addColorStop(0,RC[0]);rg.addColorStop(.5,RC[1]);rg.addColorStop(1,RC[0]);
    if(G.id==='pharao')g.drawImage(lpSand(),x+1,RY,CW-2,CH*3);else if(G.id==='zent')g.drawImage(ztMarble(),x+1,RY,CW-2,CH*3);else{g.fillStyle=rg;g.fillRect(x+1,RY,CW-2,CH*3);}
    const fl=Math.floor(r.pos),off=r.pos-fl,bo=r.bounce>0?Math.sin(r.bounce*Math.PI)*6:0;
    for(let k=0;k<4;k++){
      const idx=((fl+k-1)%L+L)%L,y=RY+(k-off)*CH+bo;
      const sym=S[idx];
      let alpha=1,hl=false;
      if(m.present&&m.present.items.length&&!r.spin&&(m.state==='show'||m.state==='count'||m.state==='fsShow')){const it=m.present.items[m.present.idx];const row=k;
        hl=it.cells.some(([cr,cc])=>cr===row&&cc===i);alpha=hl?1:.4;}
      g.globalAlpha=alpha;
      if(k<3&&!r.spin&&m.wwc&&m.wwc[k+','+i]){g.globalAlpha=1;continue;} // Schwert kommt in drawWalkers drüber
      if(k<3&&!r.spin&&m.ovr&&m.ovr[k][i]!==sym){if(G.id==='zent')g.drawImage(ztRed(),x+1,y,CW-2,CH);else{g.fillStyle='rgba(60,200,255,.22)';g.fillRect(x+1,y,CW-2,CH);}g.drawImage(symCanvas(m.ovr[k][i]),x+(CW-46)/2,y+(CH-46)/2,46,46);g.globalAlpha=1;continue;}
      if(k<3&&!r.spin&&mystHas(m.myst,k,i)){drawMystCell(m,g,x+1,y,CW-2,CH,k,i);g.globalAlpha=1;continue;}
      const im=symCanvas(sym);
      if(r.spin&&Math.abs(r.vel||0)>9){g.globalAlpha=.28;g.drawImage(im,x+(CW-46)/2,y+(CH-46)/2-18,46,70);g.drawImage(im,x+(CW-46)/2,y+(CH-46)/2+4,46,70);
        g.globalAlpha=.8;g.drawImage(im,x+(CW-46)/2,y+(CH-46)/2-8,46,62);}
      else if(hl){const pl=Math.abs(Math.sin(now*7)),z=46*(1+pl*.12);
        g.globalCompositeOperation='lighter';g.globalAlpha=.25+pl*.3;g.drawImage(im,x+(CW-z*1.18)/2,y+(CH-z*1.18)/2,z*1.18,z*1.18);
        g.globalCompositeOperation='source-over';g.globalAlpha=1;g.drawImage(im,x+(CW-z)/2,y+(CH-z)/2,z,z);}
      else g.drawImage(im,x+(CW-46)/2,y+(CH-46)/2,46,46);
      g.globalAlpha=1;
    }
    g.restore();
    g.fillStyle='rgba(0,0,0,.6)';g.fillRect(x,RY,1,CH*3);
  }
  if(m.ww&&m.ww.length)drawWalkers(m,g);
  // Lockmodus: ruht der Automat, wandert ein Glanzstreifen über die Walzen
  if((m.state==='idle'||m.state==='idle_r')&&!m.info){const t=(now*.35+(m.group.position.x*.13))%1.6;if(t<1){const sx=RX-60+t*(CW*5+120);
    g.save();g.beginPath();g.rect(RX,RY,CW*5,CH*3);g.clip();g.globalCompositeOperation='lighter';
    const sg=g.createLinearGradient(sx-30,0,sx+30,0);sg.addColorStop(0,'rgba(255,240,200,0)');sg.addColorStop(.5,'rgba(255,240,200,.16)');sg.addColorStop(1,'rgba(255,240,200,0)');
    g.fillStyle=sg;g.beginPath();g.moveTo(sx-30,RY);g.lineTo(sx+30,RY);g.lineTo(sx,RY+CH*3);g.lineTo(sx-60,RY+CH*3);g.closePath();g.fill();g.restore();}}
  // Spannung: Walzen, die noch auf das letzte Symbol warten
  if(m.state==='spin')m.reels.forEach((r,i)=>{if(!r.spin||!r.teased||m.remote)return;const x=RX+i*CW;
    g.fillStyle='rgba(255,190,40,'+(.1+.08*Math.sin(now*20)).toFixed(3)+')';g.fillRect(x+1,RY,CW-2,CH*3);
    g.strokeStyle=Math.floor(now*10)%2?'#fff':'#ffb020';g.lineWidth=3;g.strokeRect(x+2.5,RY+1.5,CW-5,CH*3-3);});
  // expanding
  if(m.useFs&&m.ev&&m.ev.wildReels&&!m.reels.some(r=>r.spin)){ // Joker füllt die Walze
    m.ev.wildReels.forEach(c=>{const x=RX+c*CW;const eg=g.createLinearGradient(0,RY,0,RY+CH*3);eg.addColorStop(0,'#ffe080');eg.addColorStop(1,'#ff6a10');
      g.fillStyle=eg;g.fillRect(x+1,RY,CW-2,CH*3);for(let r=0;r<3;r++)g.drawImage(symCanvas(m.G.wild),x+(CW-46)/2,RY+r*CH+(CH-46)/2,46,46);
      g.strokeStyle=Math.floor(now*6)%2?'#fff':'#ffd23a';g.lineWidth=2;g.strokeRect(x+2,RY+1,CW-4,CH*3-2);});
  }
  if(m.expand)(m.expand.list||[m.expand]).forEach(E=>{
    E.reels.forEach(c=>{const x=RX+c*CW,h=CH*3*ease(m.expand.p);
      g.save();g.beginPath();g.rect(x+1,RY,CW-2,h);g.clip();
      const eg=g.createLinearGradient(0,RY,0,RY+CH*3);eg.addColorStop(0,'#fff2a0');eg.addColorStop(1,'#c08a10');g.fillStyle=eg;g.fillRect(x+1,RY,CW-2,CH*3);
      for(let r=0;r<3;r++)g.drawImage(symCanvas(E.sym),x+(CW-46)/2,RY+r*CH+(CH-46)/2,46,46);
      g.restore();g.strokeStyle=Math.floor(now*6)%2?'#fff':'#ffd23a';g.lineWidth=2;g.strokeRect(x+2,RY+1,CW-4,h-2);});
  });
  // Zentaurus: Tempelsäulen mit LINIEN 20
  if(G.id==='zent'){g.drawImage(ztColumn(),1,RY-4,19,CH*3+8);g.drawImage(ztColumn(),300,RY-4,19,CH*3+8);}
  // paylines markers
  for(let li=0;li<(G.lines.length>10?0:G.lines.length);li++){
    const p=G.lines[li],active=li<m.lines,yL=RY+p[0]*CH+CH/2+((li%3)-1)*10,yR=RY+p[4]*CH+CH/2+((li%3)-1)*10;
    g.fillStyle=active?LINECOL[li]:'#3a3a3a';g.fillRect(2,yL-5,16,10);g.fillRect(302,yR-5,16,10);
    g.fillStyle='#000';px(g,6);g.textAlign='center';g.textBaseline='middle';g.fillText(String(li+1),10,yL+1);g.fillText(String(li+1),310,yR+1);
  }
  // highlighted win
  if(m.present&&m.present.items.length&&(m.state==='show'||m.state==='count'||m.state==='fsShow')){
    const it=m.present.items[m.present.idx];
    if(!it.scatter){const p=G.lines[it.line];g.lineJoin='round';g.lineCap='round';g.beginPath();
      g.moveTo(18,RY+p[0]*CH+CH/2);for(let c=0;c<5;c++)g.lineTo(RX+c*CW+CW/2,RY+p[c]*CH+CH/2);g.lineTo(302,RY+p[4]*CH+CH/2);
      g.strokeStyle='rgba(0,0,0,.7)';g.lineWidth=7;g.stroke();g.strokeStyle=LINECOL[it.line%10];g.lineWidth=3.5;g.stroke();
      g.setLineDash([5,9]);g.lineDashOffset=-now*70;g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=1.5;g.stroke();g.setLineDash([]);g.lineCap='butt';g.lineJoin='miter';}
    const pl=Math.abs(Math.sin(now*7));g.strokeStyle=it.scatter?'#fff':LINECOL[(it.line||0)%10];g.lineWidth=2+pl*1.5;
    it.cells.forEach(([r,c])=>g.strokeRect(RX+c*CW+2,RY+r*CH+2,CW-4,CH-4));
  }
}
function drawBar(m,g){
  const y=RY+CH*3+5;
  g.fillStyle='rgba(0,0,0,.75)';g.fillRect(0,y,320,240-y);
  const F=m.remote?null:m.fly,wv=m.disp>0?m.disp:(F?F.unl:0),pop=F?Math.max(0,1-(now-F.lastHit)/.22):0;
  const own=m===RESV; // dein Guthaben steht nur auf dem Automaten, in dem deine Karte steckt
  const fields=[[m.remote?cleanText(m.remote.name,10):own?'GUTHABEN':'KARTE',m.remote?fmt(m.remote.credit):own?fmt(chips-(F?F.pending:0)):'STECKEN'],[m.fs?'FREISPIEL':'EINSATZ',m.fs?(Math.min(m.fs.n+ (m.state==='spin'?1:0),m.fs.total)+'/'+m.fs.total):fmt(totalBet(m))],[m.power?'POWER':'GEWINN',fmt(wv)]];
  fields.forEach(([l,v],i)=>{const x=4+i*105,hot=(i===2&&wv>0)||(i===0&&F);g.fillStyle=i===0&&pop>0?'rgba(255,210,58,'+(.12+pop*.3).toFixed(2)+')':'#1a1424';g.fillRect(x,y+3,101,30);
    g.strokeStyle=hot?'#ffd23a':'#3a2c52';g.strokeRect(x+.5,y+3.5,100,29);
    g.fillStyle='#9b8fb3';px(g,7);g.textAlign='left';g.textBaseline='top';g.fillText(l,x+4,y+5);
    g.fillStyle=i===2||(i===0&&F)?'#ffd23a':'#f4f0e8';g.textAlign='right';
    const vz=Math.min(11,Math.floor(94/v.length));
    if(i===0&&pop>0){const s=1+pop*.25;g.save();g.translate(x+97,y+23);g.scale(s,s);px(g,vz);g.textBaseline='middle';g.fillText(v,0,0);g.restore();}
    else{px(g,vz);g.textBaseline='middle';g.fillText(v,x+97,y+23);}});
  g.fillStyle=Math.floor(now*2)%2&&(m.state==='show')?'#ffd23a':'#f4f0e8';px(g,8);g.textAlign='center';g.textBaseline='middle';
  g.fillText(m.msg||'',160,y+42);
}
// Tizona-Freispiele: jedes Schild füllt eine Reihe, bei 4 kommt das nächste größere Schild
function drawShieldMeter(m,g){const sh=m.fs.sh||0,lv=SlotEngine.tizLevel(sh),fill=lv>=3?4:sh%4,x0=236,gold=lv>=3;
  g.fillStyle='rgba(0,0,0,.85)';g.fillRect(x0-4,0,88,RY-4);
  for(let i=0;i<4;i++){const on=i<fill;g.fillStyle=on?(gold?'#ffd23a':'#e03a2a'):'#2a1a12';g.fillRect(x0+i*13,16,11,4);
    g.fillStyle=on?(gold?'#fff4b0':'#ff8a6a'):'#3a2a20';g.fillRect(x0+i*13,16,11,1);}
  for(let k=0;k<4;k++){const z=7+k*2.4,cx=x0+5+k*13,on=k<=lv;g.globalAlpha=on?1:.28;g.drawImage(k===3?goldSword():symCanvas('SCHILD'),cx-z/2,8-z/2,z,z);g.globalAlpha=1;}
  px(g,6);g.fillStyle=gold?'#ffd23a':'#f4f0e8';g.textAlign='right';g.textBaseline='middle';g.fillText(String(sh),316,11);}
// großes, aufrechtes Schwert über die ganze Walze (Spitze unten), golden ab Stufe 4
function drawBigSword(g,H,gold){const top=-H/2,bot=H/2,bw=12;
  const M=gold?['#fff8c0','#ffc020','#8a4a00']:['#ffffff','#b8c4d0','#4a5462'];
  g.shadowColor=gold?'rgba(255,220,80,.9)':'rgba(0,0,0,.7)';g.shadowBlur=gold?12:5;
  const bg=g.createLinearGradient(-bw/2,0,bw/2,0);bg.addColorStop(0,M[2]);bg.addColorStop(.45,M[0]);bg.addColorStop(.55,M[1]);bg.addColorStop(1,M[2]);
  g.fillStyle=bg;g.beginPath();g.moveTo(-bw/2,top+34);g.lineTo(bw/2,top+34);g.lineTo(bw/2,bot-20);g.lineTo(0,bot-2);g.lineTo(-bw/2,bot-20);g.closePath();g.fill();g.shadowBlur=0;
  g.fillStyle='rgba(0,0,0,.25)';g.fillRect(-1,top+38,2,H-62);
  const cg=g.createLinearGradient(0,top+26,0,top+36);cg.addColorStop(0,gold?'#fff4a0':'#ffe080');cg.addColorStop(1,gold?'#a05a00':'#8a5a10');
  g.fillStyle=cg;g.fillRect(-22,top+27,44,8);g.fillRect(-25,top+25,6,12);g.fillRect(19,top+25,6,12);
  g.fillStyle=gold?'#6a2a00':'#5a1a08';g.fillRect(-4,top+8,8,19);g.fillStyle='rgba(255,255,255,.18)';for(let i=0;i<4;i++)g.fillRect(-4,top+10+i*4,8,1);
  g.fillStyle=cg;g.beginPath();g.arc(0,top+6,6,0,Math.PI*2);g.fill();
  g.fillStyle='#e02020';g.fillRect(-3,top+28,6,6);g.fillStyle='#ff9a9a';g.fillRect(-2,top+29,2,2);}
// Tizona: wandernde Schwerter. Bereits stehende Schwerter bleiben beim Drehen sichtbar und ziehen eine Walze nach links,
// neue erscheinen erst, wenn ihre Walze steht.
function drawWalkers(m,g){const gold=m.fs&&m.G.walkWild&&SlotEngine.tizLevel(m.fs.sh)>=3,k=clamp((now-(m.wwT||0))/.45,0,1),e=k*k*(3-2*k);
  g.save();g.beginPath();g.rect(RX,RY,CW*5,CH*3);g.clip();
  m.ww.forEach(w=>{if(w.fresh&&m.reels[w.c].spin)return;
    const cx=w.fresh?w.c:w.c+1-e,x=RX+cx*CW,hh=Math.min(3,w.h),r0=Math.max(0,Math.min(3-hh,w.r-(hh>1?1:0))),y=RY+r0*CH,H=hh*CH;
    g.fillStyle='rgba(30,18,8,.9)';g.fillRect(x+1,y,CW-2,H);
    const gl=g.createLinearGradient(x,0,x+CW,0);gl.addColorStop(0,gold?'rgba(255,200,40,.15)':'rgba(255,160,40,.12)');gl.addColorStop(.5,gold?'rgba(170,90,0,.8)':'rgba(255,220,130,.55)');gl.addColorStop(1,gold?'rgba(255,200,40,.15)':'rgba(255,160,40,.12)');
    g.fillStyle=gl;g.fillRect(x+1,y,CW-2,H);
    if(k<1&&!w.fresh){g.fillStyle='rgba(255,220,120,'+(.35*(1-k)).toFixed(3)+')';g.fillRect(x+CW-2,y,CW*(1-e)*.6,H);} // Schweif beim Rüberziehen
    if(hh===3){const pl=1+Math.sin(now*5+w.c)*.03;g.save();g.translate(x+CW/2,RY+CH*1.5);g.scale(pl,pl);drawBigSword(g,CH*3-8,gold);g.restore();
      if(gold&&Math.random()<.3)fxBurst(m,x+CW/2,RY+Math.random()*CH*3,1,{spd:20,up:30,life:.5,sz:2});}
    else for(let i=0;i<hh;i++)g.drawImage(symCanvas(m.G.wild),x+(CW-46)/2,y+i*CH+(CH-46)/2,46,46);
  });
  g.restore();}
function goldSword(){if(goldSword.c)return goldSword.c;const c=document.createElement('canvas');c.width=c.height=48;const x=c.getContext('2d');x.drawImage(symCanvas('SCHWERT'),0,0,48,48);
  x.globalCompositeOperation='source-atop';const gr=x.createLinearGradient(0,0,48,48);gr.addColorStop(0,'rgba(255,250,190,.75)');gr.addColorStop(.5,'rgba(255,190,30,.6)');gr.addColorStop(1,'rgba(180,90,0,.7)');x.fillStyle=gr;x.fillRect(0,0,48,48);return goldSword.c=c;}
function drawHeader(m,g){
  g.fillStyle='rgba(0,0,0,.55)';g.fillRect(0,0,320,RY-4);
  px(g,8);g.textBaseline='middle';g.textAlign='left';g.fillStyle='#ffd23a';g.fillText(m.G.title,6,12);
  g.textAlign='right';g.fillStyle='#e8e0cc';px(g,6);if(!(m.fs&&m.G.free&&m.G.free.shields))g.fillText(m.G.special||m.G.lineDiv?'EINSATZ '+fmt(totalBet(m)):m.lines+' LINIEN × '+fmt(betLine(m)),314,12);
  if(m.fs&&m.G.free&&m.G.free.shields&&!m.info)drawShieldMeter(m,g);
  if(m===RESV){const t=m.auto?'KARTE · AUTO':'KARTE';px(g,6);const w=t.length*6+10;g.fillStyle='#3adf5a';g.fillRect(160-w/2,5,w,13);g.fillStyle='#001a04';g.textAlign='center';g.fillText(t,160,12);}
}
// Text links ausgerichtet, schrumpft/staucht, damit er nie aus dem Feld läuft
function fitL(g,t,x,y,w,sz){let s=sz;px(g,s);while(s>4&&g.measureText(t).width>w){s--;px(g,s);}const mw=g.measureText(t).width;g.save();g.translate(x,y);if(mw>w)g.scale(w/mw,1);g.textAlign='left';g.fillText(t,0,0);g.restore();}
function drawInfo(m,g){
  g.fillStyle='rgba(10,6,16,.94)';g.fillRect(RX-3,RY-3,CW*5+6,CH*3+6);
  const G=m.G,syms=Object.keys(G.pay).reverse(),bl=payLine(m),tb=totalBet(m),e=v=>fmt(v).replace(' €','');
  g.textBaseline='middle';
  // Tabelle: Symbol | 5× | 4× | 3× (in € beim aktuellen Einsatz), zwei Spalten nebeneinander
  const half=Math.ceil(syms.length/2),rh=Math.min(22,Math.floor(108/half)),two=syms.some(s=>G.pay[s][2]);
  const NS=two?[5,4,3,2]:[5,4,3],cw=Math.floor(114/NS.length),cx=NS.map((n,k)=>24+k*cw+cw/2),tw=cw-3;
  [0,1].forEach(c=>{const x=RX+2+c*141;g.fillStyle='#ffd23a';NS.forEach((n,k)=>{px(g,6);g.textAlign='center';g.fillText(n+'×',x+cx[k],RY+5);});});
  syms.forEach((s,i)=>{const c=i<half?0:1,row=i<half?i:i-half,x=RX+2+c*141,y=RY+12+row*rh;
    if(row%2===0){g.fillStyle='rgba(255,255,255,.05)';g.fillRect(x,y,138,rh);}
    g.drawImage(symCanvas(s),x+2,y+(rh-20)/2,20,20);const p=G.pay[s];
    NS.forEach((n,k)=>{g.fillStyle=n===5?'#ffd23a':n===2?'#c8bce0':'#f4f0e8';const t=p[n]?e(p[n]*bl):'–';px(g,7);const w=g.measureText(t).width;
      g.save();g.translate(x+cx[k],y+rh/2+1);if(w>tw)g.scale(tw/w,1);g.textAlign='center';g.fillText(t,0,0);g.restore();});});
  const y=RY+CH*3-26;g.fillStyle='#ffd23a';
  const sc=G.scatter;
  if(!sc){g.drawImage(symCanvas(G.wild),RX+4,y-4,22,22);fitL(g,'PHARAO ERSETZT ALLE · LINKS, RECHTS, MITTE',RX+30,y+7,246,6);}
  else{g.drawImage(symCanvas(sc),RX+4,y-4,22,22);
    if(!G.scatterPay[5]&&G.free)fitL(g,(G.free.byCount?'3/4/5× = '+G.free.byCount.slice(3).join('/'):G.free.trigger+'× = '+G.free.count)+' FREISPIELE'+(G.wildMult?' · WILD ×2 JE ZENTAUR':G.walkWild?' · SCHWERT = GRATIS-SPINS':''),RX+30,y+7,246,6);
    else fitL(g,'SCATTER: 5×'+e(G.scatterPay[5]*tb)+' 4×'+e(G.scatterPay[4]*tb)+(G.scatterPay[3]?' 3×'+e(G.scatterPay[3]*tb):''),RX+30,y+7,246,6);}
  g.fillStyle='#9b8fb3';const I=GAMEINFO[G.id];
  fitL(g,'QUOTE '+I.rtp+'% · GEWINN JEDES '+I.hit+'. SPIEL'+(I.fs?' · FREISPIELE 1:'+I.fs:'')+(I.power?' · POWER 1:'+I.power:''),RX+4,y+22,CW*5-8,6);
}
function drawFsIntro(m,g){
  g.fillStyle='rgba(10,4,0,.9)';g.fillRect(RX-3,RY-3,CW*5+6,CH*3+6);
  if(!m.fs.special){ // Spiele ohne Buch: Freispiele mit eigener Besonderheit
    const t=m.stateT,F=m.G.free,cx=160,cy=RY+CH*1.5,pulse=1+Math.sin(t*8)*.06;
    g.save();g.translate(cx,cy-12);g.scale(pulse,pulse);g.drawImage(symCanvas(m.G.scatter),-36,-36,72,72);g.restore();
    g.textAlign='center';g.textBaseline='middle';px(g,14);g.fillStyle='#ffd23a';g.fillText(m.fs.total+' FREISPIELE',cx,RY+12);
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
  const SPs=fsSpecials(m);let sym=SPs[0],sym2=SPs[1]||SPs[0];
  if(speed!==null){const k=Math.floor(t/speed);sym=cand[k%cand.length];sym2=cand[(k+3)%cand.length];if(Math.floor((t-.016)/speed)!==k)SFX.tick();}
  g.drawImage(symCanvas(sym2),8,-36,56,56);g.drawImage(symCanvas(sym),-64*open,-36,56*open,56);
  g.restore();
  g.fillStyle='#ffd23a';px(g,12);g.textAlign='center';g.textBaseline='middle';g.fillText(m.fs.total+' FREISPIELE',cx,RY+10);
  if(t>2.6){g.fillStyle=Math.floor(now*4)%2?'#fff':'#ffd23a';fitL(g,(SPs.length>1?'SONDERSYMBOLE: ':'SONDERSYMBOL: ')+SPs.map(x=>SYMNAME[x]).join(' + '),RX+4,RY+CH*3-8,CW*5-8,8);}
}
function drawGamble(m,g){
  const gm=m.gamble;
  if(gm.kind!=='ladder'){g.fillStyle='rgba(6,10,20,.95)';g.fillRect(RX-3,RY-3,CW*5+6,CH*3+6);}
  const drawCard=(c,x,y,w,h,faceUp,hi)=>{g.fillStyle='#f4eedc';g.fillRect(x,y,w,h);
    if(faceUp){const r=c%13,s=c/13|0,red=s===1||s===2;g.fillStyle=red?'#c8182c':'#141018';px(g,w>40?12:8);g.textAlign='left';g.textBaseline='top';g.fillText(RANKN[r],x+4,y+4);
      g.font='bold '+(w*.55|0)+'px "DejaVu Sans",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(SUITS[s],x+w/2,y+h*.6);}
    else{for(let yy=y+3;yy<y+h-3;yy+=3)for(let xx=x+3;xx<x+w-3;xx+=3){g.fillStyle=((xx+yy)/3|0)%2?'#7a1426':'#3a0812';g.fillRect(xx,yy,3,3);}}
    if(hi){g.strokeStyle=hi;g.lineWidth=3;g.strokeRect(x-1,y-1,w+2,h+2);}};
  px(g,8);g.fillStyle='#ffd23a';g.textAlign='center';g.textBaseline='middle';
  if(gm.kind==='ladder'){drawLadder(m,g,gm);return;}
  if(gm.kind==='rb'){
    g.fillText('RISIKO  '+fmt(m.win)+' AUF '+fmt(m.win*2),160,RY+10);
    m.history.slice(0,6).forEach((c,i)=>drawCard(c,RX+8+i*30,RY+24,24,34,true));
    const blinkRed=Math.floor(now*3)%2===0;
    if(m.state==='gambleNext'&&gm.card!==null)drawCard(gm.card,160-30,RY+66,60,84,true,'#fff');
    else{drawCard(0,160-30,RY+66,60,84,false,blinkRed?'#ff3a3a':'#888');if(!m.remote&&Math.floor(now*3)!==Math.floor((now-.02)*3))SFX.gambleTick(blinkRed);}
    px(g,7);g.fillStyle='#ff3a3a';g.fillText('◄ ROT',70,RY+110);g.fillStyle='#e8e8e8';g.fillText('SCHWARZ ►',250,RY+110);
  }
}
function drawScreen(m){
  const g=m.scr.userData.ctx;SYMSET=m.G.id;
  if(m.state==='boot'||m.state==='menu'){smDraw(m,g);m.dirty=false;fxDraw(m,g);m.scr.needsUpdate=true;return;}
  if(m.state==='splash'){drawSplash(m,g);m.dirty=false;fxDraw(m,g);m.scr.needsUpdate=true;return;}
  const sh=m.fx&&m.fx.shake>0?m.fx.shake:0;
  g.save();if(sh){g.fillStyle='#000';g.fillRect(0,0,320,240);g.translate((Math.random()-.5)*sh*12,(Math.random()-.5)*sh*9);}
  bgFor(m,g);drawHeader(m,g);
  if(m.state==='power'&&m.power)drawPower(m,g);
  else if(m.state==='poffer'){drawReelArea(m,g);drawOffer(m,g);}
  else if(m.state==='splash')drawSplash(m,g);
  else if(m.state==='fsIntro')drawFsIntro(m,g);
  else if(m.state==='gamble'||(m.state==='gambleNext'&&m.gamble)){if(m.gamble.kind==='ladder'){if(m.G.special)drawSpitze(m,g);else drawReelArea(m,g);}drawGamble(m,g);}
  else{if(m.G.special)drawSpitze(m,g);else drawReelArea(m,g);if(m.info){if(m.G.special)drawSpitzeInfo(m,g);else drawInfo(m,g);}
    else if(m.G.power&&(m.state==='show'||m.state==='count')&&!(m.fx&&m.fx.big)){const pn=Math.floor(m.win/(4*totalBet(m)));
      if(pn>0){const t='= '+pn+' POWER SPIN'+(pn>1?'S':''),w=t.length*7+12;g.fillStyle='rgba(0,0,0,.8)';g.fillRect(RX+CW*5-w-2,RY+2,w,15);g.strokeStyle='#3adf5a';g.lineWidth=1;g.strokeRect(RX+CW*5-w-1.5,RY+2.5,w-1,14);
        px(g,7);g.textAlign='center';g.textBaseline='middle';g.fillStyle=Math.floor(now*3)%2?'#3adf5a':'#d0ff80';g.fillText(t,RX+CW*5-w/2-2,RY+10);}}
    if(m.state==='fsRetrig'||m.state==='fsEnd'){g.fillStyle='rgba(0,0,0,.7)';g.fillRect(RX+20,RY+40,CW*5-40,70);g.fillStyle='#ffd23a';px(g,12);g.textAlign='center';g.textBaseline='middle';
      g.fillText(m.state==='fsEnd'?'GEWONNEN':'+'+(m.fs&&m.fs.plusN||m.G.free.count)+' FREISPIELE',160,RY+64);px(g,10);g.fillStyle='#fff';g.fillText(m.state==='fsEnd'?fmt(m.win):'NOCHMAL!',160,RY+90);}}
  drawBar(m,g);drawFly(m,g);m.dirty=false;fxDraw(m,g);g.restore();
  m.scr.needsUpdate=true;
}
function drawTop(m){
  const g=m.top.userData.ctx,G=m.G;SYMSET=G.id;
  const gr=g.createLinearGradient(0,0,0,128);
  const TOPC={book:['#1a0a30','#3a1a04'],fruit:['#3a0000','#a03a00'],viking:['#06142a','#2a4a6a'],mine:['#101018','#3a2a10'],reef:['#002a3a','#0a6a8a'],temple:['#2a0a00','#8a2a00'],pharao:['#2a0000','#8a1010'],spitze:['#0a1a40','#1a4a1a'],zent:['#0a2a5a','#3a6a2a'],tizona:['#2a1a0a','#6a3a10'],doppel:['#1a0a30','#3a1a04']}[G.id];
  gr.addColorStop(0,TOPC[0]);gr.addColorStop(1,TOPC[1]);
  g.fillStyle=gr;g.fillRect(0,0,256,128);
  if(m.power){const P=m.power;g.textAlign='center';g.textBaseline='middle';px(g,14);g.lineWidth=5;g.strokeStyle='#000';g.strokeText('POWER SPINS',128,24);
    const hg=g.createLinearGradient(0,14,0,34);hg.addColorStop(0,'#d0ff80');hg.addColorStop(1,'#2a9a10');g.fillStyle=hg;g.fillText('POWER SPINS',128,24);
    px(g,18);g.fillStyle='#fff';g.fillText(Math.max(1,P.count)+' / '+P.total,128,58);
    px(g,8);g.fillStyle='#ffd23a';g.fillText('GEWONNEN '+fmt(P.sum),128,88);
    px(g,7);g.fillStyle='#f4f0e8';g.fillText(P.mult>1?'ERFOLGE ×'+P.mult:'4 WALZENSÄTZE',128,108);}
  else if(m.fs){g.fillStyle='#ffd23a';px(g,12);g.textAlign='center';g.textBaseline='middle';g.fillText('FREISPIELE',128,24);
    px(g,16);g.fillStyle='#fff';g.fillText(Math.min(m.fs.n+1,m.fs.total)+' / '+m.fs.total,128,56);
    if(m.fs.special){const SPs=fsSpecials(m);SPs.forEach((x,i)=>g.drawImage(symCanvas(x),SPs.length>1?76+i*56:104,72,48,48));px(g,6);g.fillStyle='#ffd23a';g.fillText(SPs.length>1?'SONDERSYMBOLE':'SONDERSYMBOL',128,124);}
    else if(G.free.shields){const lv=SlotEngine.tizLevel(m.fs.sh);px(g,9);g.fillStyle='#ffd23a';g.fillText('SCHILDE '+(m.fs.sh||0),128,92);px(g,7);g.fillStyle=lv>=3?'#ffd23a':'#f4f0e8';g.fillText(['SCHWERT: 1 FELD','SCHWERT: 2 FELDER','SCHWERT: GANZE WALZE','GOLDENE SCHWERTER'][lv],128,108);}
    else{px(g,9);g.fillStyle='#ffd23a';g.fillText(G.free.desc[1],128,96);}}
  else{
    if(G.id==='book'){g.fillStyle='#d8a050';g.beginPath();g.moveTo(200,30);g.lineTo(250,118);g.lineTo(150,118);g.closePath();g.fill();g.drawImage(symCanvas('BUCH'),8,58,60,60);}
    else if(G.id==='fruit'){g.drawImage(symCanvas('SIEBEN'),6,60,56,56);g.drawImage(symCanvas('KIRSCHE'),194,60,56,56);}
    else if(G.special){g.drawImage(symCanvas('KOEN'),6,60,56,56); /* Sonne */g.drawImage(symCanvas('KAEF'),194,60,56,56);}
    else{g.drawImage(symCanvas(G.wild),6,60,56,56);g.drawImage(symCanvas(G.scatter),194,60,56,56);}
    g.textAlign='center';g.textBaseline='middle';px(g,G.title.length>9?18:22);
    g.lineWidth=6;g.strokeStyle='#000';g.strokeText(G.title,128,38);
    const tg=g.createLinearGradient(0,22,0,54);tg.addColorStop(0,'#fff8c0');tg.addColorStop(.5,'#ffc020');tg.addColorStop(1,'#a05a00');g.fillStyle=tg;g.fillText(G.title,128,38);
    const fitC=(t,y,w,sz)=>{let z=sz;px(g,z);while(z>5&&g.measureText(t).width>w){z--;px(g,z);}g.textAlign='center';g.fillText(t,128,y);};
    g.fillStyle='#f4f0e8';fitC(G.sub,66,128,8);
    px(g,7);g.fillStyle='#ffd23a';
    const D=G.special?['3 TÜRME · CASHPOT','SONNE HEBT · TEUFEL NIMMT']:G.id==='book'?['10 FREISPIELE MIT','WACHSENDEM SYMBOL']:G.power?['LINKS, RECHTS, MITTE','POWER SPINS AB 4×']:G.free?G.free.desc:['5 LINIEN · RISIKO','KARTE ODER LEITER'];
    fitC(D[0],88,128,7);fitC(D[1],100,128,7);
  }
  m.top.needsUpdate=true;m.topDirty=false;m.topVer=(m.topVer||0)+1;
}

/* ---------- KARTE: Automat besetzen ----------
   Mit gesteckter Karte gehört der Automat dir: Aufstehen geht in jedem Zustand (Leiter, Power Spins …),
   alles bleibt stehen wie es ist. Läuft AUTO, spielt er weiter und hält bei Angeboten/Risiko von selbst an. */
let RESV=null;
function cardIn(m,quiet){
  if(RESV&&RESV!==m){const o=RESV;RESV=null;if(o.win>0||o.power||o.gamble){o.auto=false;if(o.power){o.win+=o.power.left*o.power.cost;o.power=null;}collect(o);}o.dirty=true;}
  RESV=m;m.dirty=true;svCardSync();if(!quiet)toast('Karte steckt. Der Automat bleibt für dich frei, auch wenn du aufstehst.');MP.dirty=true;}
function cardOut(m){if(RESV!==m)return;if(m.win>0||m.power||m.gamble){toast('Erst den Gewinn nehmen, dann die Karte ziehen.');return;}
  RESV=null;resvSave();m.auto=false;SFX.card();m.dirty=true;svCardSync();toast('Karte gezogen.');MP.dirty=true;if(SV.m===m)svGate(m);}
// Karte, Spiel und Einsatz überstehen ein Neuladen (offener Gewinn wird wie immer gutgeschrieben)
function resvKey(){return RESV?allMachines().indexOf(RESV)+'|'+RESV.G.id+'|'+RESV.betIdx:'';}
let resvSaved=null;
function resvSave(){const k=resvKey();if(k===resvSaved)return;resvSaved=k;store('nk_resv',k||null);}
function resvRestore(){let k='';try{k=localStorage.getItem('nk_resv')||'';}catch(e){}if(!k)return;
  const [i,g,b]=k.split('|'),m=allMachines()[+i];if(!m||m.npc||!SlotEngine.GAMES[g])return;
  setMachineGame(m,g);m.betIdx=clamp(+b||0,0,m.G.betOpts.length-1);m.booted=true;m.state='idle';slotIdleMsg(m);RESV=m;resvSaved=k;m.dirty=true;m.topDirty=true;updateButtons(m);}
function svCardSync(){const b=$('#svCard');if(!b||!SV.m)return;b.hidden=RESV!==SV.m;b.textContent='KARTE ZIEHEN';b.classList.add('on');}
/* ---------- HD-Bildschirm: beim Spielen werden Bildschirm und Kopf-Display dreifach scharf ---------- */
const HDS=3;
function setHD(m,on){
  [['scr',320,240],['top',256,128]].forEach(([k,w,h])=>{const t=m[k],U=t.userData;
    if(on){if(!U.hd){const c=document.createElement('canvas');c.width=w*HDS;c.height=h*HDS;U.hd={canvas:c,ctx:c.getContext('2d')};U.lo={canvas:U.canvas,ctx:U.ctx};}
      t.image=U.hd.canvas;U.canvas=U.hd.canvas;U.ctx=U.hd.ctx;U.ctx.setTransform(HDS,0,0,HDS,0,0);U.ctx.imageSmoothingEnabled=true;U.ctx.imageSmoothingQuality='high';t.magFilter=t.minFilter=THREE.LinearFilter;}
    else if(U.lo){t.image=U.lo.canvas;U.canvas=U.lo.canvas;U.ctx=U.lo.ctx;t.magFilter=t.minFilter=THREE.NearestFilter;}
    t.needsUpdate=true;});
  m.hdOn=on;m.dirty=true;m.topDirty=true;}
/* ---------- per frame ---------- */
function updMachines(dt,F,focusM){
  F.machines.forEach(m=>{
    const d=Math.hypot(m.group.position.x-camera.position.x,m.group.position.z-camera.position.z);
    if(m===focusM){slotStep(m,dt);}
    else if(m===RESV){const mu=muted;muted=true;try{slotStep(m,dt);}finally{muted=mu;}}
    else if(m.npc){ // demo play
      if(m.state==='idle'&&now>m.demoNext){startSpin(m,true);m.demoNext=now+4+Math.random()*5;}
      if(m.state==='spin')updReels(m,dt);else m.reels.forEach(r=>{if(r.bounce>0){r.bounce=Math.max(0,r.bounce-dt*6);m.dirty=true;}});
    }
    // Lockmodus flüssig am eigenen Automaten, in der Nähe sparsam (ca. 8 Bilder/s)
    if((m.state==='idle'||m.state==='idle_r')&&d<7&&now>(m.swT||0)){m.swT=now+(m===focusM?0:.12);m.dirty=true;}
    if(m.topDirty)drawTop(m);
    if(m===RESV)resvSave();
    {const un=m.unlockT&&now-m.unlockT<2.2,held=m.remote||(typeof machineHeld==='function'&&machineHeld(m));
      m.cardLed.color.setHex(un?(Math.floor(now*12)%2?0x7aff7a:0x0a6a1a):m===RESV?0x3adf5a:held?0xff2020:0x3a0606);}
    if(m===focusM||m===RESV){const pw=m.win+(m.power?m.power.left*m.power.cost:0)+(m.sp?m.sp.pot:0);if(pw!==m.savedWin){m.savedWin=pw;store('nk_slotpend',pw>0?pw:null);}}
    if(m.dirty&&(m===focusM||d<9))drawScreen(m);
    if(m===focusM)svDraw(m);
    if(m===RESV&&m!==focusM){m.fly=null;}
    else if(m!==focusM){m.fly=null;m.ledMat.color.setHex(m.accent);m.ledMat.color.multiplyScalar(.55+.45*Math.abs(Math.sin(now*2.2+m.group.position.x*.7+m.group.position.z)));}
  });
}
