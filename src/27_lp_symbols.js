/* =========================================================
   LUCKY-PHARAOH-SYMBOLE (nach dem Video, 96x96 gezeichnet)
   Gelten nur am Pharao-Automaten: Buchstaben in schmaler Serifenschrift
   mit Goldrand, Edelsteine, Pharao mit WILD, Sandstein mit Hieroglyphen.
   ========================================================= */
const LP_SERIF='"Times New Roman",Georgia,"Noto Serif","DejaVu Serif",serif';
function lpGold(g,y0,y1){const gr=g.createLinearGradient(0,y0,0,y1);gr.addColorStop(0,'#fff6c0');gr.addColorStop(.35,'#f0c040');gr.addColorStop(.7,'#b07810');gr.addColorStop(1,'#6a4000');return gr;}
function lpPoly(g,pts,fill,stroke,lw){g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();if(fill){g.fillStyle=fill;g.fill();}if(stroke){g.strokeStyle=stroke;g.lineWidth=lw||1;g.stroke();}}
function lpSpark(g,x,y,r){g.save();g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();g.fillStyle='#fff';lpPoly(g,[[x,y-r*1.6],[x+r*.18,y],[x,y+r*1.6],[x-r*.18,y]]);g.fill();lpPoly(g,[[x-r*1.6,y],[x,y-r*.18],[x+r*1.6,y],[x,y+r*.18]]);g.fill();g.restore();}
// Buchstaben: hoch, schmal, glänzend, dicker Goldrand
function lpLetter(g,t,c0,c1,c2){
  g.save();g.translate(48,0);g.scale(t==='10'?.62:.78,1);
  g.font='bold '+(t==='10'?76:86)+'px '+LP_SERIF;g.textAlign='center';g.textBaseline='alphabetic';const y=82;
  g.lineJoin='round';g.lineWidth=13;g.strokeStyle='rgba(30,14,0,.85)';g.strokeText(t,2,y+2);
  g.lineWidth=7;g.strokeStyle=lpGold(g,12,84);g.strokeText(t,0,y);
  const fg=g.createLinearGradient(0,14,0,84);fg.addColorStop(0,c0);fg.addColorStop(.22,c1);fg.addColorStop(.6,c1);fg.addColorStop(1,c2);g.fillStyle=fg;g.fillText(t,0,y);
  // Glanzkante oben links
  g.globalCompositeOperation='source-atop';const hl=g.createLinearGradient(-30,10,20,60);hl.addColorStop(0,'rgba(255,255,255,.55)');hl.addColorStop(.45,'rgba(255,255,255,0)');g.fillStyle=hl;g.fillRect(-60,0,120,96);
  g.restore();
}
// rotes Feld mit Goldrahmen und Ornamentband (Brillant, Pharao)
function lpRedTile(g){
  const bg=g.createRadialGradient(48,44,6,48,48,62);bg.addColorStop(0,'#e02020');bg.addColorStop(.6,'#a00808');bg.addColorStop(1,'#4a0000');g.fillStyle=bg;g.fillRect(3,3,90,90);
  g.strokeStyle=lpGold(g,0,96);g.lineWidth=4;g.strokeRect(4,4,88,88);g.strokeStyle='rgba(60,20,0,.8)';g.lineWidth=1;g.strokeRect(7,7,82,82);
  g.fillStyle=lpGold(g,82,92);g.fillRect(6,81,84,9);g.fillStyle='#5a2a00';for(let x=9;x<88;x+=6){g.fillRect(x,83,2,5);g.fillRect(x+3,85,2,1);}
}
const LP_SYM={
  '10':g=>lpLetter(g,'10','#ffb8f0','#d020b0','#5a0868'),
  'J':g=>lpLetter(g,'J','#a8d0ff','#1a50e0','#06107a'),
  'Q':g=>lpLetter(g,'Q','#d0ffb0','#2ac81a','#0a5a08'),
  'K':g=>lpLetter(g,'K','#ffb0a0','#e01a10','#6a0000'),
  'A':g=>lpLetter(g,'A','#fff8c0','#ffc820','#a05a00'),
  BRILLANT(g){
    lpRedTile(g);
    // Krone + Unterteil
    const L=14,R=82,Gy=38,top=20,tip=[48,80];
    lpPoly(g,[[L,Gy],[28,top],[68,top],[R,Gy],tip],'#dceeff');
    const crown=[[L,Gy],[28,top],[38,Gy],[48,top],[58,Gy],[68,top],[R,Gy]];
    const cc=['#ffffff','#a8c8f0','#f0f8ff','#7aa0d8','#ffffff','#b8d4f4'];
    for(let i=0;i<crown.length-1;i++){const a=crown[i],b=crown[i+1];lpPoly(g,[a,b,i%2?[b[0],Gy]:[a[0],Gy]],cc[i]);}
    lpPoly(g,[[28,top],[68,top],[58,Gy-6],[38,Gy-6]],'rgba(255,255,255,.75)');
    const girdle=[L,26,38,48,58,70,R],pc=['#c8e0ff','#6a90d0','#ffffff','#9ab8e8','#e8f4ff','#5a80c0'];
    for(let i=0;i<girdle.length-1;i++)lpPoly(g,[[girdle[i],Gy],[girdle[i+1],Gy],tip],pc[i]);
    g.strokeStyle='rgba(60,90,140,.7)';g.lineWidth=1;lpPoly(g,[[L,Gy],[28,top],[68,top],[R,Gy],tip],null,'#3a5a8a',1.5);
    g.beginPath();g.moveTo(L,Gy);g.lineTo(R,Gy);girdle.forEach(x=>{g.moveTo(x,Gy);g.lineTo(tip[0],tip[1]);});
    for(let i=0;i<crown.length-1;i++){g.moveTo(crown[i][0],crown[i][1]);g.lineTo(crown[i+1][0],crown[i+1][1]);}g.stroke();
    lpSpark(g,66,24,7);lpSpark(g,30,44,4);
  },
  RUBIN(g){
    g.fillStyle='#3a0008';g.fillRect(4,4,88,88);g.strokeStyle='#40c8d0';g.lineWidth=2;g.strokeRect(6,6,84,84);
    g.fillStyle=lpGold(g,0,96);[[6,6],[84,6],[6,84],[84,84]].forEach(([x,y])=>g.fillRect(x,y,6,6));
    const o=[[12,14],[84,10],[86,84],[10,82]],t=[[34,30],[66,28],[68,64],[32,66]];
    const fc=['#ff7a98','#e0103a','#a00020','#ff3a60'];
    for(let i=0;i<4;i++){const j=(i+1)%4;lpPoly(g,[o[i],o[j],t[j],t[i]],fc[i]);}
    const tb=g.createLinearGradient(32,28,68,66);tb.addColorStop(0,'#ff4a70');tb.addColorStop(1,'#b00828');lpPoly(g,t,tb);
    lpPoly(g,[t[0],t[1],[50,46]],'rgba(255,200,220,.35)');lpPoly(g,[t[2],t[3],[50,46]],'rgba(80,0,20,.35)');
    g.strokeStyle='rgba(255,180,200,.6)';g.lineWidth=1;for(let i=0;i<4;i++){g.beginPath();g.moveTo(o[i][0],o[i][1]);g.lineTo(t[i][0],t[i][1]);g.stroke();}
    lpPoly(g,o,null,'#5a0010',1.5);lpSpark(g,30,22,6);lpSpark(g,72,40,5);lpSpark(g,56,72,4);
  },
  SMARAGD(g){
    const o=[[8,48],[28,16],[68,16],[88,48],[68,80],[28,80]],t=[[26,48],[38,30],[58,30],[70,48],[58,66],[38,66]];
    const fc=['#b8ff80','#7af040','#3ab818','#1a7a0a','#2a9a10','#5ad828'];
    lpPoly(g,o,'#2a9a10');for(let i=0;i<6;i++){const j=(i+1)%6;lpPoly(g,[o[i],o[j],t[j],t[i]],fc[i]);}
    const tb=g.createRadialGradient(44,42,2,48,48,26);tb.addColorStop(0,'#9aff5a');tb.addColorStop(1,'#1a9a0a');lpPoly(g,t,tb);
    g.strokeStyle='rgba(220,255,180,.8)';g.lineWidth=1.5;g.beginPath();g.arc(48,48,11,0,TAU);g.stroke();g.strokeStyle='rgba(10,60,0,.6)';g.beginPath();g.arc(48,48,13,0,TAU);g.stroke();
    g.strokeStyle='rgba(230,255,200,.7)';g.lineWidth=1;for(let i=0;i<6;i++){g.beginPath();g.moveTo(o[i][0],o[i][1]);g.lineTo(t[i][0],t[i][1]);g.stroke();}
    lpPoly(g,o,null,'#e8ffb0',2);lpSpark(g,34,22,5);
  },
  SAPHIR(g){
    const top=[60,6],r=[86,40],b=[36,90],l=[10,56],c=[48,48];
    const ti=[56,22],ri=[72,42],bi=[40,74],li=[24,54];
    const fc=['#a8d8ff','#3a7aff','#0a2a9a','#1a4ad8'];const o=[top,r,b,l],t=[ti,ri,bi,li];
    lpPoly(g,o,'#1a4ad8');for(let i=0;i<4;i++){const j=(i+1)%4;lpPoly(g,[o[i],o[j],t[j],t[i]],fc[i]);}
    const tb=g.createLinearGradient(24,22,72,74);tb.addColorStop(0,'#6ab0ff');tb.addColorStop(1,'#0a2a9a');lpPoly(g,t,tb);
    g.strokeStyle='rgba(200,230,255,.6)';g.lineWidth=1;g.beginPath();g.moveTo(ti[0],ti[1]);g.lineTo(bi[0],bi[1]);g.moveTo(li[0],li[1]);g.lineTo(ri[0],ri[1]);
    for(let i=0;i<4;i++){g.moveTo(o[i][0],o[i][1]);g.lineTo(t[i][0],t[i][1]);}g.stroke();
    lpPoly(g,o,null,'#06104a',2);lpSpark(g,58,16,6);lpSpark(g,32,58,3);
  },
  PHARAO(g){
    lpRedTile(g);
    g.save();g.beginPath();g.rect(7,7,82,74);g.clip();
    // Kopftuch (Nemes) blau-gold gestreift
    const nem=[[30,12],[66,12],[74,26],[84,82],[60,70],[36,70],[12,82],[22,26]];
    g.save();lpPoly(g,nem);g.clip();for(let y=8;y<86;y+=7){g.fillStyle='#ffcc30';g.fillRect(0,y,96,4);g.fillStyle='#1a40d8';g.fillRect(0,y+4,96,3);}
    g.fillStyle='rgba(0,0,40,.25)';g.fillRect(0,60,96,30);g.restore();lpPoly(g,nem,null,'#5a3a00',1.5);
    // Gesicht
    const fg=g.createLinearGradient(0,22,0,66);fg.addColorStop(0,'#ffe070');fg.addColorStop(1,'#c88010');g.fillStyle=fg;
    g.beginPath();g.moveTo(32,26);g.quadraticCurveTo(48,18,64,26);g.lineTo(62,52);g.quadraticCurveTo(48,70,34,52);g.closePath();g.fill();
    g.fillStyle='#ffcc30';g.fillRect(30,22,36,6);g.fillStyle='#1a40d8';g.fillRect(30,25,36,2);
    // Augen mit Kajal
    [[40,39],[56,39]].forEach(([x,y],i)=>{g.fillStyle='#fff';g.beginPath();g.ellipse(x,y,5,2.6,0,0,TAU);g.fill();g.fillStyle='#1a3aa8';g.beginPath();g.arc(x,y,2,0,TAU);g.fill();
      g.strokeStyle='#120800';g.lineWidth=1.6;g.beginPath();g.moveTo(x-6,y);g.quadraticCurveTo(x,y-5,x+6,y);g.lineTo(x+(i?9:-9)+ (i?0:0),y+1);g.stroke();
      g.beginPath();g.moveTo(x-6,y-6);g.quadraticCurveTo(x,y-9,x+6,y-6);g.stroke();});
    g.strokeStyle='#8a5000';g.lineWidth=1.4;g.beginPath();g.moveTo(48,40);g.lineTo(46,49);g.lineTo(50,49);g.stroke();
    g.fillStyle='#b01818';g.beginPath();g.ellipse(48,55,5,2,0,0,TAU);g.fill();
    // Kobra auf der Stirn
    g.fillStyle='#ffcc30';g.beginPath();g.ellipse(48,16,4,6,0,0,TAU);g.fill();g.fillStyle='#1a40d8';g.fillRect(47,12,2,8);
    // Bart und Kragen
    g.fillStyle='#ffcc30';g.fillRect(44,62,8,12);g.fillStyle='#1a40d8';g.fillRect(44,65,8,2);g.fillRect(44,70,8,2);
    ['#1a40d8','#ffcc30','#c01818','#ffcc30'].forEach((c,i)=>{g.strokeStyle=c;g.lineWidth=3;g.beginPath();g.arc(48,60,24+i*3,.25*Math.PI,.75*Math.PI);g.stroke();});
    g.restore();
    // WILD
    g.font='italic bold 25px '+LP_SERIF;g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';
    g.lineWidth=6;g.strokeStyle='#2a0800';g.strokeText('WILD',48,82);g.lineWidth=3;g.strokeStyle=lpGold(g,72,92);g.strokeText('WILD',48,82);
    const wg=g.createLinearGradient(0,72,0,92);wg.addColorStop(0,'#ff6a5a');wg.addColorStop(1,'#a00010');g.fillStyle=wg;g.fillText('WILD',48,82);
  }
};
// Sandstein mit Hieroglyphen als Walzen-Hintergrund
let lpSandC=null;
function lpSand(){
  if(lpSandC)return lpSandC;const c=document.createElement('canvas');c.width=64;c.height=192;const g=c.getContext('2d');
  let s=7;const r=()=>{s=(s*16807)%2147483647;return s/2147483647;};
  const bg=g.createLinearGradient(0,0,64,0);bg.addColorStop(0,'#9a7a50');bg.addColorStop(.5,'#c8a878');bg.addColorStop(1,'#9a7a50');g.fillStyle=bg;g.fillRect(0,0,64,192);
  for(let i=0;i<500;i++){g.fillStyle='rgba('+(r()<.5?'60,40,20':'230,210,170')+','+(.08+r()*.12).toFixed(2)+')';g.fillRect(r()*64|0,r()*192|0,1+(r()*2|0),1);}
  g.strokeStyle='rgba(70,45,20,.35)';g.fillStyle='rgba(70,45,20,.35)';g.lineWidth=1;
  for(let col=0;col<3;col++)for(let y=6;y<190;y+=13){const x=6+col*20,k=r()*6|0;g.beginPath();
    if(k===0){g.arc(x+4,y+3,3,0,TAU);g.moveTo(x+4,y+6);g.lineTo(x+4,y+11);g.moveTo(x+1,y+8);g.lineTo(x+7,y+8);}
    else if(k===1){g.moveTo(x,y+8);g.quadraticCurveTo(x+4,y,x+8,y+8);}
    else if(k===2){g.rect(x+1,y+2,6,6);}
    else if(k===3){g.moveTo(x,y+4);g.lineTo(x+8,y+4);g.moveTo(x,y+8);g.lineTo(x+8,y+8);}
    else if(k===4){g.moveTo(x+1,y+9);g.lineTo(x+4,y+1);g.lineTo(x+7,y+9);}
    else{g.ellipse(x+4,y+5,4,2,0,0,TAU);}g.stroke();}
  g.strokeStyle='rgba(40,25,10,.5)';g.beginPath();g.moveTo(.5,0);g.lineTo(.5,192);g.moveTo(63.5,0);g.lineTo(63.5,192);g.stroke();
  return lpSandC=c;
}
