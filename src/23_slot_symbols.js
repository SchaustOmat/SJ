/* =========================================================
   SYMBOLE DER NEUEN FREISPIEL-AUTOMATEN (48x48, gezeichnet)
   ========================================================= */
function radialFill(g,x,y,r,c0,c1){const gr=g.createRadialGradient(x-r*.35,y-r*.35,r*.1,x,y,r);gr.addColorStop(0,c0);gr.addColorStop(1,c1);return gr;}
function linFill(g,y0,y1,c0,c1){const gr=g.createLinearGradient(0,y0,0,y1);gr.addColorStop(0,c0);gr.addColorStop(1,c1);return gr;}
function poly(g,pts){g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();}
function jokerBanner(g){g.fillStyle='#120a04';g.fillRect(4,38,40,9);g.fillStyle=linFill(g,38,47,'#fff2a0','#e8a010');g.fillRect(5,39,38,7);
  px(g,6);g.textAlign='center';g.textBaseline='middle';g.fillStyle='#3a1000';g.fillText('JOKER',24,43);}
const EXTRA_SYM={
  // --- Wikingergold
  HELM(g){g.fillStyle=linFill(g,6,30,'#f4f0e8','#c8b890');poly(g,[[6,20],[1,4],[4,3],[12,16]]);g.fill();poly(g,[[42,20],[47,4],[44,3],[36,16]]);g.fill();
    g.fillStyle=radialFill(g,24,24,16,'#e8eef8','#5a6478');g.beginPath();g.arc(24,26,15,Math.PI,0);g.fill();g.fillRect(9,25,30,6);
    g.fillStyle='#d8a020';g.fillRect(9,25,30,3);g.fillRect(22,11,4,20);g.fillStyle='#1a1a22';g.fillRect(14,31,7,4);g.fillRect(27,31,7,4);jokerBanner(g);},
  RUNE(g){g.fillStyle=radialFill(g,24,24,22,'#8a92a0','#2a3040');g.beginPath();g.moveTo(10,44);g.quadraticCurveTo(6,8,24,4);g.quadraticCurveTo(42,8,38,44);g.closePath();g.fill();
    g.shadowColor='#4af0ff';g.shadowBlur=6;g.strokeStyle='#7affff';g.lineWidth=3;g.beginPath();g.moveTo(24,10);g.lineTo(24,40);g.moveTo(24,16);g.lineTo(34,24);g.moveTo(24,24);g.lineTo(14,32);g.stroke();g.shadowBlur=0;},
  AXT(g){g.strokeStyle='#6a3a10';g.lineWidth=5;g.beginPath();g.moveTo(10,44);g.lineTo(34,8);g.stroke();
    g.fillStyle=linFill(g,4,30,'#f4f8ff','#6a7488');g.beginPath();g.moveTo(28,8);g.quadraticCurveTo(46,6,44,28);g.lineTo(34,20);g.lineTo(30,14);g.closePath();g.fill();
    g.strokeStyle='#2a2a34';g.lineWidth=1;g.stroke();},
  SCHILD(g){g.fillStyle='#4a2a10';g.beginPath();g.arc(24,24,21,0,TAU);g.fill();
    for(let i=0;i<8;i++){g.fillStyle=i%2?'#c82a2a':'#e8dcb0';g.beginPath();g.moveTo(24,24);g.arc(24,24,18,i*Math.PI/4,(i+1)*Math.PI/4);g.closePath();g.fill();}
    g.fillStyle=radialFill(g,24,24,7,'#fff2a0','#8a6a10');g.beginPath();g.arc(24,24,6,0,TAU);g.fill();},
  DRACHE(g){g.fillStyle=linFill(g,6,30,'#ffffff','#c8c8d0');g.fillRect(14,6,20,22);g.fillStyle='#c82a2a';for(let x=14;x<34;x+=8)g.fillRect(x,6,4,22);
    g.strokeStyle='#4a2a10';g.lineWidth=2;g.beginPath();g.moveTo(24,4);g.lineTo(24,32);g.stroke();
    g.fillStyle=linFill(g,30,42,'#a06a30','#4a2a10');g.beginPath();g.moveTo(2,30);g.quadraticCurveTo(24,46,46,30);g.lineTo(40,30);g.lineTo(8,30);g.closePath();g.fill();
    g.fillStyle='#3a8a3a';g.beginPath();g.moveTo(40,31);g.quadraticCurveTo(48,20,42,14);g.quadraticCurveTo(38,20,44,22);g.fill();g.fillStyle='#ffd23a';g.fillRect(42,16,2,2);},
  // --- Diamantmine
  DIAMANT(g){g.fillStyle=linFill(g,6,40,'#bff8ff','#1a7ab0');poly(g,[[24,40],[4,16],[12,6],[36,6],[44,16]]);g.fill();
    g.fillStyle='rgba(255,255,255,.55)';poly(g,[[12,6],[18,16],[24,6]]);g.fill();poly(g,[[4,16],[44,16],[24,40]]);g.fillStyle='rgba(0,60,120,.25)';g.fill();
    g.strokeStyle='#e8ffff';g.lineWidth=1;g.beginPath();g.moveTo(4,16);g.lineTo(44,16);g.moveTo(18,16);g.lineTo(24,6);g.lineTo(30,16);g.moveTo(18,16);g.lineTo(24,40);g.lineTo(30,16);g.stroke();jokerBanner(g);},
  LORE(g){g.fillStyle=radialFill(g,24,18,12,'#fff2a0','#c08a10');for(let i=0;i<6;i++){g.beginPath();g.arc(12+i*5,16+(i%2)*3,6,0,TAU);g.fill();}
    g.fillStyle=linFill(g,18,38,'#8a8a96','#3a3a44');poly(g,[[4,18],[44,18],[40,36],[8,36]]);g.fill();g.strokeStyle='#1a1a22';g.lineWidth=2;g.stroke();
    g.fillStyle='#1a1a22';g.beginPath();g.arc(14,40,5,0,TAU);g.arc(34,40,5,0,TAU);g.fill();g.fillStyle='#8a8a96';g.beginPath();g.arc(14,40,2,0,TAU);g.arc(34,40,2,0,TAU);g.fill();},
  HACKE(g){g.strokeStyle='#8a5a20';g.lineWidth=5;g.beginPath();g.moveTo(12,44);g.lineTo(30,10);g.stroke();
    g.strokeStyle=linFill(g,4,20,'#e8eef8','#5a6478');g.lineWidth=6;g.lineCap='round';g.beginPath();g.moveTo(6,14);g.quadraticCurveTo(28,0,44,16);g.stroke();g.lineCap='butt';},
  LATERNE(g){const gl=g.createRadialGradient(24,26,2,24,26,22);gl.addColorStop(0,'rgba(255,220,100,.9)');gl.addColorStop(1,'rgba(255,140,0,0)');g.fillStyle=gl;g.fillRect(0,0,48,48);
    g.fillStyle='#2a2a30';g.fillRect(16,10,16,4);g.fillRect(14,40,20,4);g.strokeStyle='#2a2a30';g.lineWidth=2;g.beginPath();g.arc(24,8,6,Math.PI,0);g.stroke();
    g.fillStyle=linFill(g,14,40,'#fff8c0','#ffb020');g.fillRect(17,14,14,26);g.strokeStyle='#2a2a30';g.strokeRect(17,14,14,26);g.beginPath();g.moveTo(24,14);g.lineTo(24,40);g.stroke();},
  NUGGET(g){g.fillStyle=radialFill(g,24,26,20,'#fff6b0','#a06a00');g.beginPath();g.moveTo(8,30);g.quadraticCurveTo(6,14,20,12);g.quadraticCurveTo(30,4,38,14);g.quadraticCurveTo(46,24,38,36);g.quadraticCurveTo(24,44,12,38);g.closePath();g.fill();
    g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.ellipse(18,18,4,2,-.5,0,TAU);g.fill();g.fillStyle='rgba(120,70,0,.4)';g.beginPath();g.arc(30,28,3,0,TAU);g.arc(20,32,2,0,TAU);g.fill();},
  // --- Delfinriff
  DELFIN(g){g.fillStyle=linFill(g,6,40,'#8ad8ff','#1a5a9a');g.beginPath();g.moveTo(4,30);g.quadraticCurveTo(14,4,40,10);g.quadraticCurveTo(46,12,44,16);g.quadraticCurveTo(38,14,34,18);
    g.quadraticCurveTo(30,30,40,38);g.lineTo(32,40);g.quadraticCurveTo(22,32,16,34);g.quadraticCurveTo(8,36,4,30);g.fill();
    g.fillStyle='#1a5a9a';poly(g,[[22,12],[26,4],[30,12]]);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(36,14,1.6,0,TAU);g.fill();jokerBanner(g);},
  MUSCHEL(g){g.fillStyle=radialFill(g,24,28,20,'#ffd8f0','#c84a8a');g.beginPath();g.moveTo(24,42);g.lineTo(6,22);g.quadraticCurveTo(24,0,42,22);g.closePath();g.fill();
    g.strokeStyle='rgba(120,20,70,.6)';g.lineWidth=1.5;for(let i=-3;i<=3;i++){g.beginPath();g.moveTo(24,42);g.lineTo(24+i*6,10+Math.abs(i)*3);g.stroke();}
    g.fillStyle=radialFill(g,24,30,5,'#ffffff','#c8c8d8');g.beginPath();g.arc(24,32,4.5,0,TAU);g.fill();},
  FISCH(g){g.fillStyle=linFill(g,10,38,'#ffd060','#ff6a00');g.beginPath();g.ellipse(22,24,16,11,0,0,TAU);g.fill();poly(g,[[36,24],[46,14],[46,34]]);g.fill();
    g.fillStyle='#fff';g.beginPath();g.arc(13,21,3,0,TAU);g.fill();g.fillStyle='#000';g.beginPath();g.arc(13,21,1.5,0,TAU);g.fill();
    g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=2;g.beginPath();g.moveTo(20,14);g.lineTo(20,34);g.moveTo(27,15);g.lineTo(27,33);g.stroke();},
  SEESTERN(g){g.fillStyle=radialFill(g,24,24,20,'#ffb070','#d8400a');g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?8:21;g.lineTo(24+Math.cos(a)*r,25+Math.sin(a)*r);}g.closePath();g.fill();
    g.fillStyle='rgba(255,240,200,.85)';for(let i=0;i<5;i++){const a=-Math.PI/2+i*TAU/5;g.beginPath();g.arc(24+Math.cos(a)*11,25+Math.sin(a)*11,1.6,0,TAU);g.fill();}},
  PERLE(g){g.fillStyle=radialFill(g,24,28,20,'#3a2a5a','#0a0a1a');g.beginPath();g.ellipse(24,32,20,10,0,0,TAU);g.fill();
    g.fillStyle=radialFill(g,24,24,13,'#ffffff','#b8b0d0');g.beginPath();g.arc(24,24,12,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.arc(19,19,3,0,TAU);g.fill();},
  // --- Tempelfeuer
  FEUER(g){const f=(c0,c1,s)=>{g.fillStyle=linFill(g,4,40,c0,c1);g.beginPath();g.moveTo(24,40);g.quadraticCurveTo(24-16*s,30,24-6*s,16);g.quadraticCurveTo(24-4*s,24,24,4);g.quadraticCurveTo(24+8*s,18,24+14*s,14);g.quadraticCurveTo(24+18*s,30,24,40);g.fill();};
    f('#ff3a10','#a00a00',1);f('#ffb020','#ff4a10',.65);f('#fff6c0','#ffd040',.35);jokerBanner(g);},
  TEMPEL(g){g.fillStyle='#ffcf3a';g.beginPath();g.arc(24,8,6,0,TAU);g.fill();
    const st=[[4,36,40],[8,29,32],[12,22,24],[16,15,16]];st.forEach(([x,y,w])=>{g.fillStyle=linFill(g,y,y+7,'#9aa080','#4a5040');g.fillRect(x,y,w,7);g.strokeStyle='#2a2a1a';g.strokeRect(x+.5,y+.5,w-1,6);});
    g.fillStyle='#2a1a0a';g.fillRect(21,17,6,5);g.fillStyle='#ffd23a';g.fillRect(22,36,4,7);g.fillStyle='#3a3a2a';g.fillRect(4,43,40,2);},
  KELCH(g){g.fillStyle=linFill(g,6,44,'#fff6b0','#a06a00');g.beginPath();g.moveTo(10,8);g.lineTo(38,8);g.quadraticCurveTo(38,26,26,28);g.lineTo(26,36);g.lineTo(34,42);g.lineTo(14,42);g.lineTo(22,36);g.lineTo(22,28);g.quadraticCurveTo(10,26,10,8);g.fill();
    g.fillStyle='#c81a3a';g.beginPath();g.arc(24,16,3,0,TAU);g.fill();g.fillStyle='#1a8ac8';g.beginPath();g.arc(16,13,2,0,TAU);g.arc(32,13,2,0,TAU);g.fill();},
  SCHLANGE(g){g.strokeStyle='#1a4a10';g.lineWidth=9;g.lineCap='round';g.beginPath();g.moveTo(10,42);g.bezierCurveTo(44,40,4,24,24,18);g.bezierCurveTo(36,14,34,8,28,6);g.stroke();
    g.strokeStyle='#5ac83a';g.lineWidth=6;g.stroke();g.lineCap='butt';g.fillStyle='#ffd23a';g.fillRect(27,6,2,2);g.strokeStyle='#c81a1a';g.lineWidth=1.5;g.beginPath();g.moveTo(26,4);g.lineTo(22,1);g.stroke();},
  STATUE(g){g.fillStyle=linFill(g,4,44,'#a8b098','#4a5240');g.fillRect(8,6,32,36);g.fillStyle='#3a4232';g.fillRect(8,6,32,6);
    g.fillStyle='#1a1a12';g.fillRect(13,18,8,4);g.fillRect(27,18,8,4);g.fillRect(21,24,6,6);g.fillRect(15,33,18,4);g.fillStyle='#4af0ff';g.fillRect(15,19,3,2);g.fillRect(29,19,3,2);
    g.fillStyle='#d8a020';g.fillRect(4,12,4,14);g.fillRect(40,12,4,14);}
};
Object.assign(SYMNAME,{HELM:'HELM',RUNE:'RUNE',AXT:'AXT',SCHILD:'SCHILD',DRACHE:'DRACHENBOOT',DIAMANT:'DIAMANT',LORE:'LORE',HACKE:'SPITZHACKE',LATERNE:'LATERNE',NUGGET:'GOLDNUGGET',
  DELFIN:'DELFIN',MUSCHEL:'MUSCHEL',FISCH:'FISCH',SEESTERN:'SEESTERN',PERLE:'PERLE',FEUER:'FEUER',TEMPEL:'TEMPEL',KELCH:'KELCH',SCHLANGE:'SCHLANGE',STATUE:'STATUE'});
// --- Pharao Wild
function gemShine(g,pts){g.fillStyle='rgba(255,255,255,.55)';poly(g,pts);g.fill();}
Object.assign(EXTRA_SYM,{
  PHARAO(g){ // goldener Pharaokopf mit rot-goldenem Kopftuch, Band "WILD"
    const st=['#c81a1a','#ffd23a'];
    g.fillStyle='#3a0a00';poly(g,[[24,2],[44,14],[46,40],[2,40],[4,14]]);g.fill();
    for(let i=0;i<8;i++){g.fillStyle=st[i%2];const y=6+i*4.2;poly(g,[[24-6-i*2.4,y],[24+6+i*2.4,y],[24+8+i*2.4,y+2.6],[24-8-i*2.4,y+2.6]]);g.fill();}
    g.fillStyle=linFill(g,10,36,'#ffe8a0','#c88a10');g.beginPath();g.ellipse(24,22,9,12,0,0,TAU);g.fill();
    g.fillStyle='#120a04';g.fillRect(17,19,6,2);g.fillRect(26,19,6,2);g.fillStyle='#fff';g.fillRect(19,19,2,2);g.fillRect(28,19,2,2);
    g.fillStyle='#8a3a10';g.fillRect(21,29,6,2);
    g.fillStyle='#2a6ad6';g.fillRect(21,33,6,6);g.fillStyle='#ffd23a';g.fillRect(21,35,6,1);
    g.fillStyle='#3adf5a';g.beginPath();g.arc(24,7,2.5,0,TAU);g.fill();
    g.fillStyle='#120a04';g.fillRect(4,39,40,9);g.fillStyle=linFill(g,39,48,'#ff6a6a','#a00010');g.fillRect(5,40,38,7);
    px(g,6);g.textAlign='center';g.textBaseline='middle';g.fillStyle='#fff8c0';g.fillText('WILD',24,44);},
  BRILLANT(g){g.fillStyle=linFill(g,4,44,'#ffffff','#9ab0c8');poly(g,[[24,44],[3,16],[12,5],[36,5],[45,16]]);g.fill();
    gemShine(g,[[12,5],[18,16],[24,5]]);g.fillStyle='rgba(60,80,120,.25)';poly(g,[[3,16],[45,16],[24,44]]);g.fill();
    g.strokeStyle='#5a6a88';g.lineWidth=1;g.beginPath();g.moveTo(3,16);g.lineTo(45,16);g.moveTo(18,16);g.lineTo(24,5);g.lineTo(30,16);g.moveTo(18,16);g.lineTo(24,44);g.lineTo(30,16);g.stroke();
    g.fillStyle='#fff';g.fillRect(36,8,2,6);g.fillRect(34,10,6,2);},
  RUBIN(g){g.fillStyle=radialFill(g,24,24,20,'#ff8a9a','#7a0010');poly(g,[[16,4],[32,4],[44,16],[44,32],[32,44],[16,44],[4,32],[4,16]]);g.fill();
    g.fillStyle=radialFill(g,24,24,10,'#ffb0c0','#c0102a');poly(g,[[19,13],[29,13],[35,19],[35,29],[29,35],[19,35],[13,29],[13,19]]);g.fill();
    gemShine(g,[[16,4],[32,4],[29,13],[19,13]]);g.strokeStyle='#4a0008';g.lineWidth=1.5;poly(g,[[16,4],[32,4],[44,16],[44,32],[32,44],[16,44],[4,32],[4,16]]);g.stroke();},
  SAPHIR(g){g.fillStyle=radialFill(g,24,24,20,'#9ac8ff','#081a6a');g.beginPath();g.ellipse(24,25,16,20,0,0,TAU);g.fill();
    g.fillStyle=radialFill(g,24,24,10,'#c0e0ff','#1a4ac0');g.beginPath();g.ellipse(24,25,8,11,0,0,TAU);g.fill();
    g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.ellipse(18,14,5,3,-.6,0,TAU);g.fill();g.strokeStyle='#040a3a';g.lineWidth=1.5;g.beginPath();g.ellipse(24,25,16,20,0,0,TAU);g.stroke();},
  SMARAGD(g){g.fillStyle=linFill(g,6,42,'#9affb0','#0a5a1a');poly(g,[[12,6],[36,6],[42,12],[42,36],[36,42],[12,42],[6,36],[6,12]]);g.fill();
    g.fillStyle=linFill(g,14,34,'#c0ffd0','#1a9a3a');g.fillRect(14,14,20,20);gemShine(g,[[12,6],[36,6],[34,14],[14,14]]);
    g.strokeStyle='#043a0a';g.lineWidth=1.5;poly(g,[[12,6],[36,6],[42,12],[42,36],[36,42],[12,42],[6,36],[6,12]]);g.stroke();g.strokeRect(14,14,20,20);}
});
Object.assign(SYMNAME,{PHARAO:'PHARAO',BRILLANT:'BRILLANT',RUBIN:'RUBIN',SAPHIR:'SAPHIR',SMARAGD:'SMARAGD'});
