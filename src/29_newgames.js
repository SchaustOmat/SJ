/* =========================================================
   ZENTAURUS · TIZONA · DOPPEL BUCH – Symbole (48er Raster) und Namen
   ========================================================= */
Object.assign(SYMNAME,{'9':'NEUN',ZENT:'ZENTAUR',OLYMP:'OLYMP',HARFE:'HARFE',VASE:'VASE',FUELL:'FÜLLHORN',MUENZE:'MÜNZE',
  SCHWERT:'SCHWERT',SCHILD:'SCHILD',RITTER:'RITTER',ROSS:'SCHLACHTROSS',BURG:'BURG',TRUHE:'TRUHE',HANDS:'HANDSCHUH',GREIF:'GREIFVOGEL',FORSCH:'FORSCHERIN'});
function nsGold(g,y0,y1){const gr=g.createLinearGradient(0,y0,0,y1);gr.addColorStop(0,'#fff6c0');gr.addColorStop(.5,'#e8b020');gr.addColorStop(1,'#7a4a00');return gr;}
Object.assign(EXTRA_SYM,{
  '9'(g){px(g,26);g.textAlign='center';g.textBaseline='middle';const gr=g.createLinearGradient(0,8,0,40);gr.addColorStop(0,'#c8a0ff');gr.addColorStop(1,'#4a1a9a');
    g.lineWidth=6;g.strokeStyle='#120a04';g.strokeText('9',25,27);g.lineWidth=2;g.strokeStyle=nsGold(g,8,40);g.strokeText('9',24,26);g.fillStyle=gr;g.fillText('9',24,26);},
  // --- Zentaurus
  ZENT(g){g.fillStyle='#7a4a20';g.fillRect(14,28,22,10);[[15,36],[20,36],[29,36],[34,36]].forEach(([x,y])=>g.fillRect(x,y,3,10));
    g.fillStyle='#e8b88a';g.fillRect(28,12,8,18);g.beginPath();g.arc(32,9,5,0,TAU);g.fill();g.fillStyle='#3a2010';g.fillRect(27,3,10,4);
    g.strokeStyle='#c88a10';g.lineWidth=2;g.beginPath();g.arc(20,18,9,-1.2,1.2);g.stroke();g.beginPath();g.moveTo(22,10);g.lineTo(22,26);g.stroke();
    g.fillStyle='#5a3010';g.beginPath();g.moveTo(14,30);g.quadraticCurveTo(6,32,8,42);g.lineTo(12,34);g.fill();jokerBanner(g);},
  OLYMP(g){const sk=g.createLinearGradient(0,0,0,48);sk.addColorStop(0,'#6ab0ff');sk.addColorStop(1,'#d0e8ff');g.fillStyle=sk;g.fillRect(2,2,44,44);
    g.fillStyle='#7a8a9a';g.beginPath();g.moveTo(2,46);g.lineTo(18,14);g.lineTo(26,24);g.lineTo(32,10);g.lineTo(46,46);g.closePath();g.fill();
    g.fillStyle='#fff';g.beginPath();g.moveTo(14,22);g.lineTo(18,14);g.lineTo(22,20);g.closePath();g.fill();g.beginPath();g.moveTo(29,16);g.lineTo(32,10);g.lineTo(36,18);g.closePath();g.fill();
    g.fillStyle=nsGold(g,4,14);g.fillRect(26,6,12,3);for(let i=0;i<3;i++)g.fillRect(27+i*4,9,2,5);g.strokeStyle='#c88a10';g.lineWidth=2;g.strokeRect(2,2,44,44);},
  HARFE(g){g.strokeStyle=nsGold(g,4,44);g.lineWidth=4;g.beginPath();g.moveTo(12,44);g.lineTo(12,6);g.quadraticCurveTo(30,4,38,18);g.quadraticCurveTo(30,30,36,44);g.closePath();g.stroke();
    g.strokeStyle='#fff6d0';g.lineWidth=1;for(let i=0;i<6;i++){const x=16+i*3.6;g.beginPath();g.moveTo(x,8+i*1.6);g.lineTo(x,42);g.stroke();}},
  VASE(g){const gr=g.createLinearGradient(8,0,40,0);gr.addColorStop(0,'#6a2a08');gr.addColorStop(.5,'#e07a30');gr.addColorStop(1,'#6a2a08');g.fillStyle=gr;
    g.beginPath();g.moveTo(18,4);g.lineTo(30,4);g.lineTo(28,12);g.quadraticCurveTo(42,20,34,40);g.lineTo(30,44);g.lineTo(18,44);g.lineTo(14,40);g.quadraticCurveTo(6,20,20,12);g.closePath();g.fill();
    g.fillStyle='#1a0a00';g.fillRect(12,24,24,6);g.fillStyle='#e07a30';for(let i=0;i<4;i++)g.fillRect(14+i*6,25,3,4);g.strokeStyle='#2a1000';g.lineWidth=1.5;g.stroke();},
  FUELL(g){g.fillStyle=nsGold(g,10,44);g.beginPath();g.moveTo(6,40);g.quadraticCurveTo(8,14,30,10);g.lineTo(34,22);g.quadraticCurveTo(18,26,14,44);g.closePath();g.fill();
    [['#e01020',34,12,6],['#3adf5a',40,20,5],['#ffb020',28,6,5],['#8a3ad6',42,10,4]].forEach(([c,x,y,r])=>{g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();});},
  MUENZE(g){const gr=g.createRadialGradient(18,16,2,24,24,21);gr.addColorStop(0,'#fff6c0');gr.addColorStop(.6,'#e8b020');gr.addColorStop(1,'#7a4a00');g.fillStyle=gr;
    g.beginPath();g.arc(24,24,20,0,TAU);g.fill();g.strokeStyle='#5a3000';g.lineWidth=2;g.stroke();g.strokeStyle='rgba(255,240,190,.8)';g.lineWidth=1.5;g.beginPath();g.arc(24,24,15,0,TAU);g.stroke();
    g.fillStyle='#7a4a00';g.beginPath();g.ellipse(24,24,6,9,0,0,TAU);g.fill();g.fillStyle='#ffe080';g.beginPath();g.ellipse(23,23,5,8,0,0,TAU);g.fill();},
  // --- Tizona
  SCHWERT(g){g.save();g.translate(24,24);g.rotate(-.6);const bl=g.createLinearGradient(-3,0,3,0);bl.addColorStop(0,'#8a94a8');bl.addColorStop(.5,'#ffffff');bl.addColorStop(1,'#6a7488');
    g.fillStyle=bl;g.beginPath();g.moveTo(-3,-6);g.lineTo(0,-22);g.lineTo(3,-6);g.lineTo(3,12);g.lineTo(-3,12);g.closePath();g.fill();
    g.fillStyle=nsGold(g,10,16);g.fillRect(-11,10,22,4);g.fillStyle='#5a2a10';g.fillRect(-2,14,4,8);g.fillStyle=nsGold(g,20,26);g.beginPath();g.arc(0,23,3,0,TAU);g.fill();g.restore();jokerBanner(g);},
  SCHILD(g){const gr=g.createLinearGradient(0,4,0,44);gr.addColorStop(0,'#d02020');gr.addColorStop(1,'#6a0808');g.fillStyle=gr;
    g.beginPath();g.moveTo(8,6);g.lineTo(40,6);g.lineTo(40,24);g.quadraticCurveTo(40,38,24,45);g.quadraticCurveTo(8,38,8,24);g.closePath();g.fill();g.strokeStyle=nsGold(g,4,44);g.lineWidth=3;g.stroke();
    g.fillStyle=nsGold(g,10,36);g.fillRect(22,10,4,28);g.fillRect(12,18,24,4);},
  RITTER(g){g.fillStyle='#8a94a8';g.beginPath();g.arc(24,20,14,Math.PI,0);g.fill();g.fillRect(10,20,28,16);g.fillStyle='#2a2a34';g.fillRect(14,22,20,3);g.fillRect(22,22,4,12);
    g.fillStyle='#e01010';g.beginPath();g.moveTo(24,6);g.quadraticCurveTo(36,0,40,10);g.quadraticCurveTo(32,6,24,10);g.fill();g.fillStyle='#4a2a6a';g.fillRect(8,36,32,10);g.fillStyle=nsGold(g,36,46);g.fillRect(8,36,32,2);},
  ROSS(g){g.fillStyle='#3a2a20';g.beginPath();g.moveTo(14,44);g.lineTo(18,24);g.quadraticCurveTo(14,10,26,6);g.quadraticCurveTo(40,8,42,20);g.lineTo(36,22);g.lineTo(32,18);g.quadraticCurveTo(30,30,32,44);g.closePath();g.fill();
    g.fillStyle='#1a1010';g.beginPath();g.moveTo(22,8);g.quadraticCurveTo(14,14,16,26);g.lineTo(20,16);g.fill();g.fillStyle='#fff';g.fillRect(33,12,2,2);g.fillStyle='#c01818';g.fillRect(24,28,8,4);},
  BURG(g){g.fillStyle='#8a7a68';g.fillRect(8,18,32,26);[[6,10],[18,14],[30,10]].forEach(([x,y])=>{g.fillRect(x,y,12,34);for(let i=0;i<3;i++)g.fillRect(x+i*4,y-4,2,4);});
    g.fillStyle='#2a1a10';g.beginPath();g.arc(24,44,6,Math.PI,0);g.fill();g.fillStyle='#1a1018';g.fillRect(10,18,3,5);g.fillRect(34,18,3,5);g.fillStyle='#e01010';g.fillRect(24,2,1,10);g.fillRect(25,2,6,4);},
  TRUHE(g){g.fillStyle='#6a3a10';g.fillRect(6,20,36,24);g.fillStyle='#8a4a18';g.beginPath();g.moveTo(6,22);g.quadraticCurveTo(24,4,42,22);g.closePath();g.fill();
    g.fillStyle=nsGold(g,14,44);g.fillRect(6,24,36,3);g.fillRect(14,8,3,36);g.fillRect(31,8,3,36);g.fillRect(21,26,6,8);g.fillStyle='#1a0a00';g.fillRect(23,29,2,3);},
  HANDS(g){const gr=g.createLinearGradient(0,6,0,44);gr.addColorStop(0,'#e8eef8');gr.addColorStop(1,'#5a6478');g.fillStyle=gr;
    g.fillRect(14,26,20,18);[[12,8],[18,4],[24,4],[30,8]].forEach(([x,y])=>g.fillRect(x,y,5,24));g.fillRect(34,22,8,10);g.strokeStyle='#2a2a34';g.lineWidth=1;for(let y=10;y<40;y+=6){g.beginPath();g.moveTo(12,y);g.lineTo(36,y);g.stroke();}},
  // --- Doppel Buch
  GREIF(g){g.fillStyle=nsGold(g,4,44);g.beginPath();g.moveTo(24,6);g.quadraticCurveTo(34,8,32,18);g.lineTo(38,20);g.lineTo(32,22);g.quadraticCurveTo(34,34,28,40);g.lineTo(20,40);g.quadraticCurveTo(14,30,18,18);g.quadraticCurveTo(16,8,24,6);g.fill();
    g.fillStyle='#1a3aa8';g.fillRect(14,40,20,6);g.fillStyle='#1a1010';g.fillRect(26,12,2,2);
    g.fillStyle='#c88a10';g.beginPath();g.moveTo(18,20);g.quadraticCurveTo(4,24,8,36);g.lineTo(16,30);g.fill();},
  FORSCH(g){g.fillStyle='#8a5a20';g.beginPath();g.ellipse(24,12,16,4,0,0,TAU);g.fill();g.fillRect(16,4,16,8);g.fillStyle='#5a3a10';g.fillRect(16,9,16,2);
    g.fillStyle='#e8b98f';g.beginPath();g.ellipse(24,22,8,9,0,0,TAU);g.fill();g.fillStyle='#6a3a10';g.beginPath();g.moveTo(16,18);g.quadraticCurveTo(8,30,12,40);g.lineTo(18,26);g.fill();
    g.fillStyle='#1a1010';g.fillRect(20,21,2,2);g.fillRect(26,21,2,2);g.fillStyle='#b05030';g.fillRect(22,27,4,1.5);g.fillStyle='#c8a868';g.fillRect(12,32,24,14);g.fillStyle='#8a6a38';g.fillRect(22,32,4,14);}
});
// Zeichen-Helfer für mehrere Sondersymbole (Doppel Buch)
const fsSpecials=m=>m.fs&&m.fs.special?(Array.isArray(m.fs.special)?m.fs.special:[m.fs.special]):[];
