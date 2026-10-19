/* =========================================================
   TIZONA · ZENTAURUS · DOPPEL BUCH – große Symbole (96x96), selbst nachgezeichnet
   nach den Spielplan-Fotos: Bildkacheln mit Rahmen, Medaillons, Buchstaben im Stil des Originals.
   Gelten nur am jeweiligen Automaten (SYMSET = Spiel-ID). Keine Original-Grafiken.
   ========================================================= */
const MK_SERIF='Georgia,"Times New Roman","Noto Serif","DejaVu Serif",serif';
const MK_BLOCK='"Arial Black","Segoe UI Black",Impact,"Helvetica Neue",Arial,sans-serif';
function mkLin(g,x0,y0,x1,y1,stops){const gr=g.createLinearGradient(x0,y0,x1,y1);stops.forEach(([o,c])=>gr.addColorStop(o,c));return gr;}
function mkRad(g,x,y,r0,r1,stops){const gr=g.createRadialGradient(x,y,r0,x,y,r1);stops.forEach(([o,c])=>gr.addColorStop(o,c));return gr;}
function mkPoly(g,pts,fill,stroke,lw){g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();if(fill){g.fillStyle=fill;g.fill();}if(stroke){g.strokeStyle=stroke;g.lineWidth=lw||1;g.stroke();}}
function mkEll(g,x,y,rx,ry,fill,rot){g.beginPath();g.ellipse(x,y,rx,ry,rot||0,0,TAU);g.fillStyle=fill;g.fill();}
function mkGold(g,y0,y1){return mkLin(g,0,y0,0,y1,[[0,'#fff8c8'],[.3,'#f4c840'],[.65,'#b07810'],[1,'#5a3600']]);}
function mkSilver(g,y0,y1){return mkLin(g,0,y0,0,y1,[[0,'#ffffff'],[.4,'#c8d0dc'],[.7,'#7a8494'],[1,'#3a4250']]);}
function mkNoise(g,x,y,w,h,n,cols,seed){let s=seed||9;const r=()=>{s=(s*16807)%2147483647;return s/2147483647;};
  for(let i=0;i<n;i++){g.fillStyle=cols[r()*cols.length|0];g.fillRect(x+r()*w,y+r()*h,1+r()*1.6,1+r()*1.6);}}
// Bildkachel mit Farbverlauf, dunklem Rand und Glanzkante (Tizona)
function mkTile(g,c0,c1,frame){g.fillStyle='#0a0a12';g.fillRect(3,3,90,90);
  g.fillStyle=mkLin(g,0,6,0,90,[[0,c0],[1,c1]]);g.fillRect(6,6,84,84);
  g.strokeStyle=frame||'rgba(255,255,255,.35)';g.lineWidth=2;g.strokeRect(6,6,84,84);
  g.fillStyle='rgba(255,255,255,.18)';g.fillRect(6,6,84,3);g.fillStyle='rgba(0,0,0,.3)';g.fillRect(6,87,84,3);}
// Buchstabe: Serif mit dunklem Rand und Glanz (Tizona / Doppel Buch)
function mkLetter(g,t,c0,c1,c2,opt){opt=opt||{};g.save();g.translate(48,0);const sx=t==='10'?(opt.sx10||.62):(opt.sx||.85);g.scale(sx,1);
  g.font=(opt.italic?'italic ':'')+'bold '+(t==='10'?(opt.s10||74):(opt.size||84))+'px '+(opt.font||MK_SERIF);g.textAlign='center';g.textBaseline='alphabetic';const y=opt.y||82;
  g.lineJoin='round';g.lineWidth=opt.out||12;g.strokeStyle=opt.outC||'rgba(10,6,0,.92)';g.strokeText(t,2,y+2);
  if(opt.rim){g.lineWidth=6;g.strokeStyle=opt.rim(g);g.strokeText(t,0,y);}
  g.fillStyle=mkLin(g,0,14,0,86,[[0,c0],[.3,c1],[.65,c1],[1,c2]]);g.fillText(t,0,y);
  g.globalCompositeOperation='source-atop';g.fillStyle=mkLin(g,-30,8,20,60,[[0,'rgba(255,255,255,.6)'],[.45,'rgba(255,255,255,0)']]);g.fillRect(-70,0,140,96);
  if(opt.speckle)mkNoise(g,-60,8,120,80,260,['rgba(255,255,255,.35)','rgba(0,0,0,.35)'],t.charCodeAt(0));
  if(opt.cracks){let s=t.charCodeAt(0)*31+7;const r=()=>{s=(s*16807)%2147483647;return s/2147483647;};g.lineWidth=1.3;
    for(let k=0;k<9;k++){let x=-40+r()*80,y=12+r()*70;g.strokeStyle=r()<.6?'rgba(20,10,30,.55)':'rgba(255,255,255,.45)';g.beginPath();g.moveTo(x,y);
      for(let j=0;j<5;j++){x+=(r()-.5)*16;y+=(r()-.5)*16;g.lineTo(x,y);}g.stroke();}}
  g.restore();}
const mkCache={};
function mkCanvas(key,w,h,draw){if(mkCache[key])return mkCache[key];const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'));return mkCache[key]=c;}

/* ---------------- TIZONA ---------------- */
const TZ_SYM={
  '10':g=>mkLetter(g,'10','#ffd0a0','#ff6a10','#8a1a00',{rim:g=>mkGold(g,12,86)}),
  'J':g=>mkLetter(g,'J','#c0f0ff','#2aa8f0','#063a8a',{rim:g=>mkGold(g,12,86)}),
  'Q':g=>mkLetter(g,'Q','#ffc8f4','#e02ac0','#5a0a6a',{rim:g=>mkGold(g,12,86)}),
  'K':g=>mkLetter(g,'K','#d0ffb8','#2ac83a','#0a5a10',{rim:g=>mkGold(g,12,86)}),
  'A':g=>mkLetter(g,'A','#ffe0a0','#ff4a10','#7a0800',{rim:g=>mkGold(g,12,86)}),
  RITTER(g){mkTile(g,'#3a6ad0','#0a1a5a');
    // Mantel und Kettenhaube
    mkPoly(g,[[8,90],[14,70],[34,62],[62,62],[82,70],[88,90]],mkLin(g,0,62,0,90,[[0,'#c01818'],[1,'#5a0404']]));
    g.fillStyle=mkLin(g,0,30,0,72,[[0,'#b8c0cc'],[1,'#5a6474']]);g.beginPath();g.moveTo(26,72);g.quadraticCurveTo(20,40,30,28);g.lineTo(66,28);g.quadraticCurveTo(76,40,70,72);g.closePath();g.fill();
    mkNoise(g,22,30,52,42,180,['rgba(40,44,56,.6)','rgba(255,255,255,.4)'],3);
    // Gesicht
    g.fillStyle=mkLin(g,0,30,0,64,[[0,'#f0c098'],[1,'#b8784a']]);g.beginPath();g.moveTo(34,34);g.lineTo(62,34);g.quadraticCurveTo(64,52,58,60);g.lineTo(38,60);g.quadraticCurveTo(32,52,34,34);g.fill();
    // Bart
    g.fillStyle='#3a2414';g.beginPath();g.moveTo(34,46);g.quadraticCurveTo(36,66,48,70);g.quadraticCurveTo(60,66,62,46);g.quadraticCurveTo(56,54,48,55);g.quadraticCurveTo(40,54,34,46);g.fill();
    g.fillStyle='#4a2a16';g.fillRect(40,49,16,3);g.fillStyle='#8a3a2a';g.fillRect(43,55,10,2);
    // Augen, Brauen, Nase
    g.fillStyle='#2a1408';g.fillRect(37,39,9,2);g.fillRect(51,39,9,2);g.fillStyle='#fff';g.fillRect(39,42,6,3);g.fillRect(52,42,6,3);g.fillStyle='#3a2a1a';g.fillRect(41,42,3,3);g.fillRect(54,42,3,3);
    g.strokeStyle='#8a5030';g.lineWidth=1.5;g.beginPath();g.moveTo(48,43);g.lineTo(46,50);g.lineTo(50,50);g.stroke();
    // Krone mit Edelsteinen
    mkPoly(g,[[28,36],[28,22],[34,28],[41,16],[48,26],[55,16],[62,28],[68,22],[68,36]],mkGold(g,14,36),'#5a3600',1.5);
    g.fillStyle=mkGold(g,30,38);g.fillRect(27,32,42,6);[[34,35,'#e01818'],[48,35,'#1a6ae0'],[62,35,'#e01818']].forEach(([x,y,c])=>mkEll(g,x,y,3,2.4,c));
    [[41,16],[55,16]].forEach(([x,y])=>mkEll(g,x,y,2.4,2.4,'#fff6c0'));},
  BURG(g){mkTile(g,'#5aa8f0','#c8e4ff');
    mkPoly(g,[[6,70],[30,62],[60,66],[90,60],[90,90],[6,90]],mkLin(g,0,60,0,90,[[0,'#5a9a3a'],[1,'#1a4a1a']]));
    g.fillStyle=mkLin(g,6,0,90,0,[[0,'#3a7ac8'],[.5,'#9ad0ff'],[1,'#3a7ac8']]);g.beginPath();g.moveTo(6,84);g.quadraticCurveTo(40,74,90,80);g.lineTo(90,90);g.lineTo(6,90);g.fill();
    const wall=mkLin(g,0,20,0,76,[[0,'#f4d070'],[1,'#a07018']]);
    g.fillStyle=wall;g.fillRect(22,44,52,30);
    [[16,26,14],[32,18,14],[50,18,14],[66,26,14]].forEach(([x,y,w])=>{g.fillStyle=wall;g.fillRect(x,y,w,76-y);
      g.fillStyle='rgba(90,60,10,.35)';g.fillRect(x+w-4,y,4,76-y);for(let i=0;i<3;i++){g.fillStyle=wall;g.fillRect(x+i*5,y-5,3,5);}
      g.fillStyle='#2a1a08';g.fillRect(x+5,y+10,3,6);});
    g.fillStyle='#2a1a08';g.beginPath();g.arc(48,74,7,Math.PI,0);g.fill();g.fillStyle='rgba(120,80,20,.4)';for(let y=48;y<74;y+=6)g.fillRect(22,y,52,1);},
  ROSS(g){mkTile(g,'#f4e030','#c8a010');
    // Pferdekopf mit Rossstirn
    g.fillStyle=mkLin(g,0,10,0,90,[[0,'#3a3028'],[1,'#120c08']]);g.beginPath();g.moveTo(30,90);g.lineTo(34,56);g.quadraticCurveTo(26,30,40,14);g.quadraticCurveTo(62,6,74,26);
    g.lineTo(84,52);g.quadraticCurveTo(86,62,76,64);g.lineTo(62,58);g.quadraticCurveTo(58,74,66,90);g.closePath();g.fill();
    g.fillStyle=mkSilver(g,14,62);mkPoly(g,[[44,16],[66,14],[82,50],[76,60],[62,52],[48,30]],mkSilver(g,14,62),'#2a2a30',1.5);
    g.fillStyle='#1a1a20';g.beginPath();g.arc(58,30,6,0,TAU);g.fill();g.fillStyle='#e8eef8';g.beginPath();g.arc(58,30,3.5,0,TAU);g.fill();g.fillStyle='#000';g.beginPath();g.arc(58,30,2,0,TAU);g.fill();
    g.strokeStyle='#2a2a30';g.lineWidth=1.5;g.beginPath();g.moveTo(52,20);g.lineTo(76,56);g.stroke();
    g.fillStyle='#000';mkEll(g,78,58,2.5,1.6,'#000');g.fillStyle='#5a3a20';g.fillRect(36,60,20,4);},
  TRUHE(g){mkTile(g,'#7a5ab8','#2a1a5a');
    g.fillStyle=mkLin(g,0,40,0,84,[[0,'#a0602a'],[1,'#4a2408']]);g.fillRect(14,44,68,38);
    g.fillStyle=mkLin(g,0,18,0,46,[[0,'#c07a3a'],[1,'#6a3a10']]);g.beginPath();g.moveTo(14,46);g.lineTo(14,32);g.quadraticCurveTo(48,12,82,32);g.lineTo(82,46);g.closePath();g.fill();
    g.strokeStyle='rgba(40,20,4,.6)';g.lineWidth=1;for(let y=52;y<82;y+=7){g.beginPath();g.moveTo(14,y);g.lineTo(82,y);g.stroke();}
    const iron=mkSilver(g,20,84);g.fillStyle=iron;g.fillRect(12,44,72,4);g.fillRect(24,24,5,58);g.fillRect(67,24,5,58);g.fillRect(12,78,72,4);
    g.fillStyle=mkGold(g,48,66);g.fillRect(42,48,12,16);g.fillStyle='#1a0a00';g.fillRect(46,54,4,6);
    [[26,52],[26,70],[69,52],[69,70]].forEach(([x,y])=>{g.fillStyle='#2a2a30';g.beginPath();g.arc(x,y,1.5,0,TAU);g.fill();});},
  HANDS(g){mkTile(g,'#e8a050','#8a4a10');
    const st=mkSilver(g,10,86);g.fillStyle=st;
    g.beginPath();g.moveTo(26,88);g.lineTo(28,58);g.lineTo(66,56);g.lineTo(70,88);g.closePath();g.fill();
    [[26,22,9,38],[37,14,9,44],[48,14,9,44],[59,20,9,38]].forEach(([x,y,w,h])=>{g.fillStyle=st;g.fillRect(x,y,w,h);
      g.strokeStyle='#2a3040';g.lineWidth=1.2;for(let k=y+8;k<y+h;k+=9){g.beginPath();g.moveTo(x,k);g.lineTo(x+w,k);g.stroke();}
      g.fillStyle='rgba(255,255,255,.55)';g.fillRect(x+1,y+1,2,h-2);});
    g.fillStyle=st;mkPoly(g,[[66,58],[80,40],[86,46],[72,66]],st,'#2a3040',1.2);
    g.strokeStyle='#2a3040';g.lineWidth=1.5;g.strokeRect(28,58,40,30);g.fillStyle='#2a3040';for(let x=32;x<66;x+=8){g.beginPath();g.arc(x,74,1.4,0,TAU);g.fill();}},
  SCHILD(g){// freistehender Wappenschild: orange-rot, schwarzes Kreuz-Feld mit Adler
    const sh=[[14,10],[82,10],[84,40],[48,92],[12,40]];
    mkPoly(g,sh,mkLin(g,0,10,0,92,[[0,'#ffa060'],[.5,'#e04a18'],[1,'#8a1a04']]),'#3a1000',3);
    g.save();mkPoly(g,sh);g.clip();g.fillStyle='rgba(20,10,10,.9)';g.fillRect(14,10,34,32);g.fillRect(48,42,40,50);
    mkNoise(g,10,8,80,86,200,['rgba(255,220,180,.25)','rgba(60,10,0,.3)'],5);g.restore();
    g.strokeStyle=mkGold(g,8,92);g.lineWidth=2.5;mkPoly(g,[[17,13],[79,13],[81,40],[48,87],[15,40]],null,mkGold(g,8,92),2);
    // Adler
    g.fillStyle='#120808';g.beginPath();g.moveTo(48,30);g.lineTo(36,22);g.lineTo(40,34);g.lineTo(28,32);g.lineTo(40,42);g.lineTo(44,56);g.lineTo(48,50);g.lineTo(52,56);g.lineTo(56,42);g.lineTo(68,32);g.lineTo(56,34);g.lineTo(60,22);g.closePath();g.fill();
    g.fillStyle='#ffd23a';g.fillRect(47,26,2,2);mkEll(g,48,24,3,3,'#120808');},
  SCHWERT(g){// WILD: goldenes Schwert, Spitze nach unten, auf blauem Leuchten
    g.fillStyle='#06103a';g.fillRect(3,3,90,90);g.fillStyle=mkRad(g,48,40,4,56,[[0,'#bfe0ff'],[.35,'#2a6ae0'],[1,'#06144a']]);g.fillRect(5,5,86,86);
    g.strokeStyle='#8ab0f0';g.lineWidth=1.5;g.strokeRect(5,5,86,86);
    const bl=mkLin(g,42,0,54,0,[[0,'#8a94a8'],[.5,'#ffffff'],[1,'#6a7488']]);mkPoly(g,[[43,38],[53,38],[53,64],[48,74],[43,64]],bl,'#3a4250',1);
    g.fillStyle=mkGold(g,28,40);g.beginPath();g.moveTo(24,34);g.quadraticCurveTo(48,26,72,34);g.lineTo(70,40);g.quadraticCurveTo(48,34,26,40);g.closePath();g.fill();
    g.fillStyle=mkGold(g,10,32);g.fillRect(44,14,8,20);g.fillStyle='rgba(90,50,0,.6)';for(let y=16;y<32;y+=4)g.fillRect(44,y,8,1);
    mkEll(g,48,12,6,5,mkGold(g,6,18));mkEll(g,48,36,4,3,'#e01818');
    g.font='bold 22px "Old English Text MT","UnifrakturMaguntia",'+MK_SERIF;g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';
    g.lineWidth=5;g.strokeStyle='#0a1030';g.strokeText('Wild',48,84);g.fillStyle=mkSilver(g,74,92);g.fillText('Wild',48,84);}
};

/* ---------------- ZENTAURUS ---------------- */
// rundes Medaillon mit Mäander-Rand (silber-blau), innen weiß
function ztMedal(g,inner){g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.arc(49,50,44,0,TAU);g.fill();
  g.fillStyle=mkLin(g,0,4,0,92,[[0,'#ffffff'],[.5,'#b8c4d4'],[1,'#6a7a90']]);g.beginPath();g.arc(48,48,44,0,TAU);g.fill();
  g.fillStyle='#2a4a7a';g.beginPath();g.arc(48,48,38,0,TAU);g.fill();
  // Mäander als kleine Haken
  g.strokeStyle='#e8eef8';g.lineWidth=1.6;for(let i=0;i<20;i++){const a=i/20*TAU,ca=Math.cos(a),sa=Math.sin(a),r0=36,r1=42,x0=48+ca*r0,y0=48+sa*r0,x1=48+ca*r1,y1=48+sa*r1;
    const a2=a+TAU/40,x2=48+Math.cos(a2)*r1,y2=48+Math.sin(a2)*r1,x3=48+Math.cos(a2)*(r0+2),y3=48+Math.sin(a2)*(r0+2);
    g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.lineTo(x2,y2);g.lineTo(x3,y3);g.stroke();}
  g.save();g.beginPath();g.arc(48,48,34,0,TAU);g.clip();g.fillStyle=mkRad(g,44,40,4,40,[[0,'#ffffff'],[1,'#d8dee8']]);g.fillRect(0,0,96,96);inner(g);g.restore();
  g.strokeStyle='#1a2a4a';g.lineWidth=1.5;g.beginPath();g.arc(48,48,34,0,TAU);g.stroke();}
// Buchstaben wie beim Original: Marmor mit Rissen, goldener Rand
const ztL=(t,c0,c1,c2)=>g=>mkLetter(g,t,c0,c1,c2,{font:MK_BLOCK,size:76,s10:62,sx:.95,sx10:.72,out:9,cracks:true,y:80,rim:g=>mkGold(g,12,86)});
// quadratischer Goldrahmen mit Mäander (Wild und Münze)
function ztKeyFrame(g){g.fillStyle=mkGold(g,0,96);g.fillRect(2,2,92,92);g.fillStyle='#3a2a08';g.fillRect(11,11,74,74);
  g.strokeStyle='#4a3008';g.lineWidth=1.4;const step=7;
  const key=(x,y,dx,dy)=>{g.beginPath();g.moveTo(x,y);g.lineTo(x+dx*5,y+dy*5);g.lineTo(x+dx*5-dy*4,y+dy*5+dx*4);g.lineTo(x+dx*2-dy*4,y+dy*2+dx*4);g.lineTo(x+dx*2-dy*2,y+dy*2+dx*2);g.stroke();};
  for(let p=4;p<88;p+=step){key(p,4,1,0);key(p,92,1,0);key(4,p,0,1);key(92,p,0,1);}}
const ZT_SYM={
  '9':ztL('9','#fff6a0','#f0c010','#8a5a00'),
  '10':ztL('10','#e0c0ff','#7a3ae0','#2a0a6a'),
  'J':ztL('J','#b0fff0','#20b8a8','#04504a'),
  'Q':ztL('Q','#ffc0f0','#e02ab8','#6a0a50'),
  'K':ztL('K','#c8ffb0','#3ac81a','#0a5a04'),
  'A':ztL('A','#ffc0a0','#e0201a','#6a0400'),
  OLYMP(g){ztMedal(g,g=>{g.fillStyle=mkLin(g,0,14,0,60,[[0,'#6aa8e8'],[1,'#e8c890']]);g.fillRect(0,0,96,96);
    mkPoly(g,[[10,70],[30,40],[40,48],[56,26],[72,46],[86,70]],mkLin(g,0,26,0,70,[[0,'#a07a50'],[1,'#4a3018']]));
    mkPoly(g,[[50,34],[56,26],[62,34],[58,32],[54,36]],'#ffffff');mkPoly(g,[[26,46],[30,40],[34,45]],'#f4eee0');
    g.fillStyle='rgba(255,240,200,.5)';g.beginPath();g.ellipse(32,24,14,4,0,0,TAU);g.fill();g.beginPath();g.ellipse(66,18,10,3,0,0,TAU);g.fill();
    g.fillStyle=mkLin(g,0,64,0,86,[[0,'#6a8a3a'],[1,'#2a4a10']]);g.fillRect(0,66,96,30);});},
  HARFE(g){ztMedal(g,g=>{const gd=mkGold(g,14,82);g.strokeStyle=gd;g.lineWidth=6;g.lineCap='round';
    g.beginPath();g.moveTo(32,80);g.lineTo(32,22);g.quadraticCurveTo(52,10,64,26);g.quadraticCurveTo(54,44,66,80);g.stroke();
    g.lineWidth=4;g.beginPath();g.moveTo(30,80);g.lineTo(70,80);g.stroke();
    g.strokeStyle='#8a6a20';g.lineWidth=1;for(let i=0;i<7;i++){const x=37+i*4.2;g.beginPath();g.moveTo(x,22+Math.abs(i-2)*1.6);g.lineTo(x,78);g.stroke();}
    mkEll(g,64,26,4,4,mkGold(g,20,32));});},
  VASE(g){ztMedal(g,g=>{// schwarzfigurige Amphore
    const body=mkLin(g,26,0,70,0,[[0,'#1a0e08'],[.5,'#3a2014'],[1,'#120804']]);g.fillStyle=body;
    g.beginPath();g.moveTo(40,16);g.lineTo(56,16);g.lineTo(54,26);g.quadraticCurveTo(76,36,64,70);g.lineTo(58,80);g.lineTo(38,80);g.lineTo(32,70);g.quadraticCurveTo(20,36,42,26);g.closePath();g.fill();
    g.strokeStyle='#1a0e08';g.lineWidth=3;g.beginPath();g.moveTo(42,22);g.quadraticCurveTo(28,24,32,38);g.moveTo(54,22);g.quadraticCurveTo(68,24,64,38);g.stroke();
    g.fillStyle='#d8782a';g.fillRect(30,40,36,22);g.fillStyle='#1a0e08';
    // Figuren
    [[40,0],[56,1]].forEach(([x,f])=>{mkEll(g,x,44,2.6,2.6,'#1a0e08');g.fillRect(x-2,47,4,9);g.fillRect(x-4,56,3,6);g.fillRect(x+1,56,3,6);g.fillRect(f?x-6:x+2,48,4,2);});
    g.fillStyle='#d8782a';for(let x=32;x<66;x+=5){g.fillRect(x,64,3,2);g.fillRect(x,36,3,2);}
    mkEll(g,48,16,9,2.5,'#2a1810');});},
  FUELL(g){ztMedal(g,g=>{// Füllhorn
    g.fillStyle=mkLin(g,10,70,70,20,[[0,'#6a3a10'],[.5,'#e0a050'],[1,'#a06020']]);g.beginPath();g.moveTo(14,72);g.quadraticCurveTo(14,40,52,28);g.lineTo(62,46);g.quadraticCurveTo(32,50,22,76);g.closePath();g.fill();
    g.strokeStyle='rgba(60,30,4,.6)';g.lineWidth=1.4;for(let i=0;i<5;i++){g.beginPath();g.moveTo(20+i*8,66-i*7);g.quadraticCurveTo(24+i*8,56-i*6,30+i*8,58-i*7);g.stroke();}
    mkEll(g,58,37,10,6,'#5a2a08',-.6);
    [['#e01020',60,30,7],['#ffd020',70,38,6],['#3ab81a',54,24,6],['#8a2ad0',72,26,5],['#ff6a20',64,46,5],['#e01020',76,46,4]].forEach(([c,x,y,r])=>{g.fillStyle=mkRad(g,x-r*.3,y-r*.3,1,r,[[0,'#ffffff'],[.3,c],[1,'#1a0a00']]);g.beginPath();g.arc(x,y,r,0,TAU);g.fill();});
    g.fillStyle='#2a8a1a';mkPoly(g,[[52,20],[46,14],[56,16]],'#2a8a1a');});},
  MUENZE(g){// Scatter: Goldmünze mit Zentaur auf dunkelrotem Feld im Mäander-Goldrahmen
    ztKeyFrame(g);g.fillStyle=mkRad(g,48,48,6,46,[[0,'#a01818'],[1,'#3a0404']]);g.fillRect(11,11,74,74);
    g.fillStyle=mkRad(g,40,38,4,40,[[0,'#fff6c0'],[.5,'#e8b020'],[1,'#7a4a00']]);g.beginPath();g.arc(48,48,34,0,TAU);g.fill();
    g.strokeStyle='#7a4a00';g.lineWidth=2;g.stroke();g.strokeStyle='rgba(255,240,190,.7)';g.lineWidth=1.5;g.beginPath();g.arc(48,48,29,0,TAU);g.stroke();
    // Zentaur-Relief
    g.fillStyle='#9a6a10';g.fillRect(36,48,24,8);[[37,56],[42,56],[53,56],[58,56]].forEach(([x,y])=>g.fillRect(x,y,2.6,10));
    g.fillRect(52,32,6,18);mkEll(g,55,29,3.6,3.6,'#9a6a10');g.strokeStyle='#9a6a10';g.lineWidth=2;g.beginPath();g.arc(46,36,7,-1.3,1.3);g.stroke();
    g.fillStyle='rgba(255,250,210,.5)';g.fillRect(38,48,20,2);g.fillRect(53,32,2,14);},
  ZENT(g){// WILD: Zentaur-Porträt vor Himmel, Goldrahmen
    ztKeyFrame(g);g.save();g.beginPath();g.rect(11,11,74,74);g.clip();g.fillStyle=mkLin(g,0,6,0,90,[[0,'#5a8ac8'],[.6,'#a8c8e8'],[1,'#d8e4f0']]);g.fillRect(6,6,84,84);
    g.fillStyle='rgba(255,255,255,.6)';mkEll(g,24,24,14,5,'rgba(255,255,255,.6)');mkEll(g,72,18,12,4,'rgba(255,255,255,.5)');
    // Oberkörper
    g.fillStyle=mkLin(g,0,50,0,90,[[0,'#c88a50'],[1,'#7a4a20']]);g.beginPath();g.moveTo(12,90);g.quadraticCurveTo(14,62,36,58);g.lineTo(60,58);g.quadraticCurveTo(82,62,84,90);g.closePath();g.fill();
    g.strokeStyle='rgba(80,40,10,.6)';g.lineWidth=1.5;g.beginPath();g.moveTo(48,64);g.lineTo(48,88);g.moveTo(34,70);g.quadraticCurveTo(42,74,48,70);g.moveTo(62,70);g.quadraticCurveTo(54,74,48,70);g.stroke();
    // Kopf (kahl, spitze Ohren)
    g.fillStyle=mkLin(g,0,16,0,60,[[0,'#e8a868'],[1,'#a86830']]);g.beginPath();g.ellipse(48,36,14,19,0,0,TAU);g.fill();g.fillRect(42,50,12,10);
    mkPoly(g,[[34,32],[24,22],[34,40]],'#c88850');mkPoly(g,[[62,32],[72,22],[62,40]],'#c88850');
    g.fillStyle='#3a1a08';g.fillRect(38,32,8,2);g.fillRect(50,32,8,2);g.fillStyle='#fff';g.fillRect(40,35,5,2.5);g.fillRect(51,35,5,2.5);g.fillStyle='#1a0a00';g.fillRect(42,35,2,2.5);g.fillRect(53,35,2,2.5);
    g.strokeStyle='#8a4a20';g.lineWidth=1.5;g.beginPath();g.moveTo(48,37);g.lineTo(46,44);g.lineTo(50,44);g.moveTo(43,48);g.quadraticCurveTo(48,50,53,48);g.stroke();
    g.fillStyle='rgba(255,230,190,.35)';g.beginPath();g.ellipse(43,24,5,7,-.3,0,TAU);g.fill();
    g.restore();
    g.font='bold 19px '+MK_SERIF;g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';g.lineWidth=5;g.strokeStyle='#2a1404';g.strokeText('WILD',48,75);g.fillStyle=mkGold(g,66,84);g.fillText('WILD',48,75);}
};

/* ---------------- DOPPEL BUCH ---------------- */
const dbL=(t,c0,c1,c2)=>g=>mkLetter(g,t,c0,c1,c2,{rim:g=>mkLin(g,0,12,0,86,[[0,'#fff8d0'],[1,'#a07020']]),sx:.9});
const DB_SYM={
  '10':dbL('10','#f0c0ff','#b02ae0','#4a0a6a'),
  'J':dbL('J','#b0d8ff','#1a5ae0','#06106a'),
  'Q':dbL('Q','#c8ffb0','#2ab81a','#0a4a04'),
  'K':dbL('K','#ffb8a0','#e01a10','#6a0000'),
  'A':dbL('A','#fff8c0','#f0b818','#8a4a00'),
  BUCH(g){// Scatter/Wild: goldenes Buch mit Skarabäus, leuchtend
    g.fillStyle=mkRad(g,48,48,4,56,[[0,'rgba(255,240,160,.9)'],[1,'rgba(255,160,20,0)']]);g.fillRect(0,0,96,96);
    mkPoly(g,[[10,24],[48,30],[86,24],[86,80],[48,86],[10,80]],mkLin(g,0,20,0,86,[[0,'#ffe8a0'],[1,'#a06a10']]),'#4a2a00',2);
    mkPoly(g,[[14,26],[46,32],[46,82],[14,76]],mkLin(g,14,0,46,0,[[0,'#f4dca0'],[1,'#fff6d8']]));mkPoly(g,[[50,32],[82,26],[82,76],[50,82]],mkLin(g,50,0,82,0,[[0,'#fff6d8'],[1,'#e8cc88']]));
    g.strokeStyle='rgba(120,80,20,.5)';g.lineWidth=1;for(let y=38;y<74;y+=6){g.beginPath();g.moveTo(18,y);g.lineTo(42,y+3);g.moveTo(54,y+3);g.lineTo(78,y);g.stroke();}
    // Skarabäus mit Flügeln
    mkPoly(g,[[48,50],[26,40],[30,52],[48,58]],'#2a8ae0','#0a2a6a',1);mkPoly(g,[[48,50],[70,40],[66,52],[48,58]],'#2a8ae0','#0a2a6a',1);
    mkEll(g,48,56,7,9,mkLin(g,0,46,0,66,[[0,'#6ad0ff'],[1,'#0a3a9a']]));mkEll(g,48,46,4.5,3.6,'#0a2a6a');mkEll(g,48,42,5,3,'#e8b020');
    g.fillStyle='rgba(255,255,255,.6)';g.fillRect(45,51,2,6);},
  FORSCH(g){// Forscherin
    g.fillStyle='#0a0604';g.fillRect(3,3,90,90);g.fillStyle=mkRad(g,48,40,6,60,[[0,'#ffe8a0'],[.5,'#c88a30'],[1,'#3a2008']]);g.fillRect(6,6,84,84);
    // Haare
    g.fillStyle=mkLin(g,0,14,0,80,[[0,'#d8a050'],[1,'#7a4a18']]);g.beginPath();g.moveTo(24,82);g.quadraticCurveTo(16,40,30,22);g.quadraticCurveTo(48,8,66,22);g.quadraticCurveTo(80,40,72,82);g.closePath();g.fill();
    // Gesicht
    g.fillStyle=mkLin(g,0,26,0,66,[[0,'#ffd8b8'],[1,'#d89870']]);g.beginPath();g.ellipse(48,46,15,19,0,0,TAU);g.fill();
    // Kopftuch
    g.fillStyle=mkLin(g,0,16,0,34,[[0,'#3a9ad8'],[1,'#0a4a8a']]);g.beginPath();g.moveTo(28,32);g.quadraticCurveTo(48,12,68,32);g.quadraticCurveTo(48,24,28,32);g.fill();
    g.fillStyle='#3a2414';g.fillRect(38,40,8,2);g.fillRect(51,40,8,2);g.fillStyle='#fff';g.fillRect(39,43,6,3);g.fillRect(52,43,6,3);g.fillStyle='#2a6a3a';g.fillRect(41,43,3,3);g.fillRect(54,43,3,3);
    g.strokeStyle='#b06a48';g.lineWidth=1.4;g.beginPath();g.moveTo(48,45);g.lineTo(46,53);g.lineTo(50,53);g.stroke();
    g.fillStyle='#c8404a';g.beginPath();g.ellipse(48,58,5,2.2,0,0,TAU);g.fill();
    // Hemd
    g.fillStyle=mkLin(g,0,64,0,92,[[0,'#d8c088'],[1,'#8a6a38']]);g.beginPath();g.moveTo(16,92);g.quadraticCurveTo(22,70,40,66);g.lineTo(56,66);g.quadraticCurveTo(74,70,80,92);g.closePath();g.fill();
    g.fillStyle='#ffd8b8';mkPoly(g,[[42,66],[54,66],[48,76]],'#e8b090');g.strokeStyle=mkGold(g,0,96);g.lineWidth=3;g.strokeRect(6,6,84,84);},
  MASKE(g){// goldene Pharaonen-Maske mit blauen Streifen
    const nem=[[26,14],[70,14],[80,30],[88,88],[62,76],[34,76],[8,88],[16,30]];g.save();mkPoly(g,nem);g.clip();
    for(let y=4;y<96;y+=8){g.fillStyle=mkGold(g,y,y+5);g.fillRect(0,y,96,5);g.fillStyle='#1a3aa8';g.fillRect(0,y+5,96,3);}g.restore();mkPoly(g,nem,null,'#3a2400',2);
    g.fillStyle=mkLin(g,0,20,0,74,[[0,'#ffe890'],[.5,'#e8b028'],[1,'#8a5a08']]);g.beginPath();g.moveTo(30,24);g.quadraticCurveTo(48,16,66,24);g.lineTo(64,56);g.quadraticCurveTo(48,76,32,56);g.closePath();g.fill();
    [[40,40],[56,40]].forEach(([x,y],i)=>{g.fillStyle='#fff';g.beginPath();g.ellipse(x,y,5.5,2.8,0,0,TAU);g.fill();g.fillStyle='#1a1a3a';g.beginPath();g.arc(x,y,2.2,0,TAU);g.fill();
      g.strokeStyle='#0a0a2a';g.lineWidth=2;g.beginPath();g.moveTo(x-7,y);g.quadraticCurveTo(x,y-5,x+7,y);g.lineTo(x+(i?11:-11),y+1);g.stroke();});
    g.strokeStyle='#8a5000';g.lineWidth=1.4;g.beginPath();g.moveTo(48,42);g.lineTo(46,52);g.lineTo(50,52);g.stroke();g.fillStyle='#a8401a';mkEll(g,48,59,5,2,'#a8401a');
    g.fillStyle=mkGold(g,64,84);g.fillRect(44,64,8,18);g.fillStyle='#1a3aa8';g.fillRect(44,68,8,2);g.fillRect(44,74,8,2);
    mkEll(g,48,18,4,6,mkGold(g,12,24));g.fillStyle='#1a3aa8';g.fillRect(47,14,2,8);},
  GREIF(g){// Falken-Statue (Horus): rot-gold auf Sockel
    g.fillStyle=mkGold(g,78,92);g.fillRect(24,80,48,10);g.fillStyle='#5a3a08';g.fillRect(24,80,48,2);
    g.fillStyle=mkLin(g,0,20,0,80,[[0,'#e8402a'],[1,'#7a1008']]);g.beginPath();g.moveTo(42,80);g.quadraticCurveTo(30,58,38,40);g.quadraticCurveTo(44,26,56,28);g.quadraticCurveTo(62,40,58,56);g.quadraticCurveTo(56,70,62,80);g.closePath();g.fill();
    // Flügel gold gestreift
    g.save();g.beginPath();g.moveTo(40,44);g.quadraticCurveTo(22,56,30,78);g.lineTo(44,76);g.quadraticCurveTo(40,58,48,46);g.closePath();g.clip();for(let y=40;y<80;y+=5){g.fillStyle=mkGold(g,y,y+3);g.fillRect(20,y,40,3);g.fillStyle='#1a3aa8';g.fillRect(20,y+3,40,2);}g.restore();
    // Kopf
    g.fillStyle=mkLin(g,0,10,0,36,[[0,'#ffd040'],[1,'#a06a00']]);g.beginPath();g.ellipse(56,24,9,10,0,0,TAU);g.fill();mkPoly(g,[[63,22],[72,26],[63,28]],'#3a2400');
    g.fillStyle='#000';g.beginPath();g.arc(58,22,1.8,0,TAU);g.fill();g.strokeStyle='#1a1a3a';g.lineWidth=1.5;g.beginPath();g.moveTo(54,24);g.lineTo(52,32);g.stroke();
    // Krone (Sonnenscheibe)
    mkEll(g,54,10,6,6,mkRad(g,52,8,1,7,[[0,'#ffe0a0'],[1,'#e02a10']]));},
  SKARAB(g){// blauer Skarabäus im Goldoval
    g.fillStyle='#0a0604';g.beginPath();g.ellipse(48,48,34,42,0,0,TAU);g.fill();g.strokeStyle=mkGold(g,4,92);g.lineWidth=6;g.stroke();
    g.fillStyle=mkRad(g,48,48,4,40,[[0,'#3a3020'],[1,'#120a04']]);g.beginPath();g.ellipse(48,48,29,37,0,0,TAU);g.fill();
    g.fillStyle=mkLin(g,0,30,0,80,[[0,'#6ad8ff'],[.5,'#1a7ae0'],[1,'#0a2a8a']]);g.beginPath();g.ellipse(48,56,17,22,0,0,TAU);g.fill();
    g.strokeStyle='#06104a';g.lineWidth=1.5;g.beginPath();g.moveTo(48,36);g.lineTo(48,78);g.stroke();
    mkEll(g,48,32,11,7,mkLin(g,0,24,0,40,[[0,'#4ac0ff'],[1,'#0a3a9a']]));mkEll(g,48,22,8,5,'#0a2a6a');
    g.strokeStyle='#0a1a4a';g.lineWidth=2;[[-1],[1]].forEach(([s])=>{for(let k=0;k<3;k++){g.beginPath();g.moveTo(48+s*15,44+k*12);g.lineTo(48+s*26,40+k*14);g.stroke();}});
    g.fillStyle='rgba(255,255,255,.55)';g.fillRect(40,46,3,14);mkEll(g,48,16,5,4,mkGold(g,12,20));}
};
const SYM_SETS={tizona:TZ_SYM,zent:ZT_SYM,doppel:DB_SYM};

/* ---------------- Hintergründe (Bildschirm 320x240, gecacht) ---------------- */
const MK_BG={
  tizona:()=>mkCanvas('bg_tizona',320,240,g=>{// Nachthimmel mit Mond und Wolken
    g.fillStyle=mkLin(g,0,0,0,240,[[0,'#0a1a3a'],[.6,'#1a3a6a'],[1,'#0a1430']]);g.fillRect(0,0,320,240);
    g.fillStyle=mkRad(g,70,70,4,46,[[0,'rgba(240,248,255,.95)'],[.55,'rgba(200,220,240,.75)'],[1,'rgba(160,190,230,0)']]);g.beginPath();g.arc(70,70,46,0,TAU);g.fill();
    mkNoise(g,40,40,60,60,60,['rgba(140,160,190,.35)'],4);
    let s=11;const r=()=>{s=(s*16807)%2147483647;return s/2147483647;};
    for(let i=0;i<60;i++){g.fillStyle='rgba(255,255,255,'+(.3+r()*.6).toFixed(2)+')';g.fillRect(r()*320,r()*120,1,1);}
    for(let i=0;i<14;i++){const x=r()*340-10,y=60+r()*170,w=60+r()*120;g.fillStyle='rgba('+(150+r()*60|0)+','+(170+r()*50|0)+',210,'+(.08+r()*.12).toFixed(2)+')';g.beginPath();g.ellipse(x,y,w,8+r()*14,0,0,TAU);g.fill();}}),
  zent:()=>mkCanvas('bg_zent',320,240,g=>{// Gewitterhimmel (dunkel-türkis) hinter dem Tempel
    g.fillStyle=mkLin(g,0,0,0,240,[[0,'#0a2a2e'],[.5,'#1a4a50'],[1,'#0a1a20']]);g.fillRect(0,0,320,240);
    let s=21;const r=()=>{s=(s*16807)%2147483647;return s/2147483647;};
    for(let i=0;i<26;i++){const x=r()*340-10,y=r()*240,w=40+r()*90;g.fillStyle='rgba('+(150+r()*60|0)+',210,220,'+(.05+r()*.1).toFixed(2)+')';g.beginPath();g.ellipse(x,y,w,10+r()*16,0,0,TAU);g.fill();}
    g.strokeStyle='rgba(200,240,255,.55)';g.lineWidth=1;g.beginPath();let x=250,y=0;g.moveTo(x,y);for(let k=0;k<8;k++){x+=(r()-.5)*18;y+=6;g.lineTo(x,y);}g.stroke();
    g.fillStyle=mkLin(g,0,182,0,240,[[0,'#c8ccd4'],[1,'#7a808a']]);g.fillRect(0,182,320,58);g.fillStyle='rgba(60,64,72,.5)';[188,206,224].forEach(y=>g.fillRect(0,y,320,1));}),
  doppel:()=>mkCanvas('bg_doppel',320,240,g=>{// Grabkammer: dunkelbraun mit goldenem Glanz und Hieroglyphen
    g.fillStyle=mkLin(g,0,0,0,240,[[0,'#3a2208'],[.5,'#1a0e04'],[1,'#2a1606']]);g.fillRect(0,0,320,240);
    g.fillStyle=mkRad(g,160,120,10,200,[[0,'rgba(255,190,80,.18)'],[1,'rgba(0,0,0,0)']]);g.fillRect(0,0,320,240);
    g.strokeStyle='rgba(200,150,60,.18)';g.lineWidth=1;let s=5;const r=()=>{s=(s*16807)%2147483647;return s/2147483647;};
    for(let col=0;col<16;col++)for(let y=4;y<236;y+=14){const x=4+col*20;g.beginPath();const k=r()*4|0;
      if(k===0){g.arc(x+5,y+4,3,0,TAU);}else if(k===1){g.moveTo(x,y+9);g.quadraticCurveTo(x+5,y,x+10,y+9);}else if(k===2){g.moveTo(x+5,y);g.lineTo(x+5,y+10);g.moveTo(x+1,y+4);g.lineTo(x+9,y+4);}else{g.rect(x+1,y+1,8,8);}g.stroke();}}),
  pharao:()=>mkCanvas('bg_pharao',320,240,g=>{// rot-pinker Tempel mit Hieroglyphen, Säulen und Fackeln
    g.fillStyle=mkLin(g,0,0,0,240,[[0,'#c03aa0'],[.35,'#e0306a'],[.7,'#b01010'],[1,'#5a0404']]);g.fillRect(0,0,320,240);
    g.strokeStyle='rgba(80,10,40,.22)';g.lineWidth=1;let s=8;const r=()=>{s=(s*16807)%2147483647;return s/2147483647;};
    for(let col=0;col<15;col++)for(let y=6;y<236;y+=14){const x=26+col*18;const k=r()*4|0;g.beginPath();
      if(k===0){g.arc(x+4,y+4,3,0,TAU);}else if(k===1){g.moveTo(x,y+9);g.quadraticCurveTo(x+4,y,x+8,y+9);}else if(k===2){g.moveTo(x+4,y);g.lineTo(x+4,y+10);g.moveTo(x,y+4);g.lineTo(x+8,y+4);}else{g.rect(x,y+1,8,8);}g.stroke();}
    [[0,22],[298,22]].forEach(([x,w])=>{g.fillStyle=mkLin(g,x,0,x+w,0,[[0,'#5a3a10'],[.5,'#c8a050'],[1,'#5a3a10']]);g.fillRect(x,0,w,240);
      g.fillStyle='rgba(60,30,0,.35)';for(let y=8;y<240;y+=12)g.fillRect(x+4,y,w-8,2);});}),
};

// Zentaurus: weißer Marmor mit feinen Rissen als Walzen-Hintergrund
function ztMarble(){return mkCanvas('zt_marble',64,192,g=>{g.fillStyle=mkLin(g,0,0,64,0,[[0,'#c8ccd4'],[.15,'#f4f4f6'],[.85,'#f4f4f6'],[1,'#c8ccd4']]);g.fillRect(0,0,64,192);
  mkNoise(g,0,0,64,192,500,['rgba(120,124,134,.18)','rgba(255,255,255,.6)'],13);let s=17;const r=()=>{s=(s*16807)%2147483647;return s/2147483647;};
  g.strokeStyle='rgba(110,116,128,.35)';g.lineWidth=.8;for(let k=0;k<10;k++){let x=r()*64,y=r()*192;g.beginPath();g.moveTo(x,y);for(let j=0;j<6;j++){x+=(r()-.5)*14;y+=r()*14;g.lineTo(x,y);}g.stroke();}});}
// Zentaurus: Superspin-Feld (rot mit Strahlen) und Tempelsäulen mit LINIEN 20
function ztRed(){return mkCanvas('zt_red',96,96,g=>{g.fillStyle='#c01010';g.fillRect(0,0,96,96);g.fillStyle='#ff4a3a';
  for(let i=0;i<24;i++){const a=i/24*TAU;g.beginPath();g.moveTo(48,48);g.lineTo(48+Math.cos(a)*70,48+Math.sin(a)*70);g.lineTo(48+Math.cos(a+.08)*70,48+Math.sin(a+.08)*70);g.fill();}
  g.fillStyle=mkRad(g,48,48,10,48,[[0,'rgba(255,255,255,.7)'],[1,'rgba(255,255,255,0)']]);g.fillRect(0,0,96,96);});}
function ztColumn(){return mkCanvas('zt_col',20,160,g=>{g.fillStyle=mkLin(g,0,0,20,0,[[0,'#8a909a'],[.4,'#f0f2f6'],[1,'#7a808a']]);g.fillRect(0,0,20,160);
  g.fillStyle='rgba(80,86,96,.35)';[4,9,14].forEach(x=>g.fillRect(x,8,1,144));g.fillStyle='#e8ecf0';g.fillRect(0,0,20,6);g.fillRect(0,154,20,6);
  g.fillStyle='#0a3a3a';g.fillRect(4,12,12,136);g.font='bold 9px '+MK_BLOCK;g.textAlign='center';g.textBaseline='middle';g.fillStyle='#5af0e0';
  'LINIEN'.split('').forEach((c,i)=>g.fillText(c,10,20+i*10));g.font='bold 10px '+MK_BLOCK;g.fillText('20',10,82);'LINIEN'.split('').forEach((c,i)=>g.fillText(c,10,96+i*10));});}
