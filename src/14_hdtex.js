/* =========================================================
   HD-OBERFLÄCHEN: Teppich, Seidentapete mit Holzvertäfelung, Kassettendecke, Marmor, Holz, Metall.
   Weich und hoch aufgelöst gezeichnet (statt Pixel-Texturen), mit Mipmaps und schrägem Filter,
   damit Böden und Wände auch in der Ferne ruhig und edel aussehen.
   ========================================================= */
function hdTex(w,h,draw,rx,ry){
  const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');if(draw)draw(g,w,h);
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx||1,ry||rx||1);
  t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;
  t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());t.userData={canvas:c,ctx:g};return t;
}
// eigener, fester Zufall je Textur (gleiches Bild bei jedem Laden)
function hdRnd(s){let x=s>>>0||1;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};}
// feines Korn (Stoff/Holz/Stein): jedes Pixel minimal heller/dunkler
function hdGrain(g,w,h,amt,s){const r=hdRnd(s||7),d=g.getImageData(0,0,w,h),p=d.data;
  for(let i=0;i<p.length;i+=4){const n=(r()-.5)*amt;p[i]+=n;p[i+1]+=n;p[i+2]+=n;}g.putImageData(d,0,0);}
// Linie, die über die Kachelränder weiterläuft (nahtlos)
function hdWrap(w,h,fn){for(const ox of [-w,0,w])for(const oy of [-h,0,h]){fn(ox,oy);}}
function hdHex(c,a){const n=parseInt(c.slice(1),16);return 'rgba('+(n>>16)+','+((n>>8)&255)+','+(n&255)+','+a+')';}

// Spielbank-Teppich: tiefe Grundfarbe, goldenes Doppel-Rautengitter, Rosetten an den Kreuzungen
function hdCarpet(base,gold,accent){return (g,w,h)=>{
  const bg=g.createLinearGradient(0,0,w,h);bg.addColorStop(0,base);bg.addColorStop(.5,shade(base,6));bg.addColorStop(1,base);g.fillStyle=bg;g.fillRect(0,0,w,h);
  // dunklere Rauten-Innenflächen für Tiefe
  g.fillStyle='rgba(0,0,0,.16)';[[w/4,h/4],[w*3/4,h/4],[w/4,h*3/4],[w*3/4,h*3/4]].forEach(([x,y])=>{g.beginPath();g.moveTo(x,y-h/4+16);g.lineTo(x+w/4-16,y);g.lineTo(x,y+h/4-16);g.lineTo(x-w/4+16,y);g.closePath();g.fill();});
  g.lineCap='round';
  const lat=(lw,col)=>{g.strokeStyle=col;g.lineWidth=lw;hdWrap(w,h,(ox,oy)=>{g.beginPath();
    g.moveTo(ox,oy+h/2);g.lineTo(ox+w/2,oy);g.lineTo(ox+w,oy+h/2);g.lineTo(ox+w/2,oy+h);g.closePath();g.stroke();});};
  lat(15,'rgba(0,0,0,.25)');lat(9,gold);lat(3,shade(base,-20));lat(1.4,hdHex(accent,.6));
  const rosette=(x,y,R,c1,c2)=>hdWrap(w,h,(ox,oy)=>{g.save();g.translate(x+ox,y+oy);
    for(let i=0;i<8;i++){g.rotate(Math.PI/4);g.fillStyle=i%2?c1:c2;g.beginPath();g.ellipse(0,-R*.55,R*.2,R*.5,0,0,TAU);g.fill();}
    g.fillStyle=base;g.beginPath();g.arc(0,0,R*.28,0,TAU);g.fill();g.fillStyle=c2;g.beginPath();g.arc(0,0,R*.16,0,TAU);g.fill();g.restore();});
  rosette(0,0,46,gold,accent);rosette(w/2,h/2,46,gold,accent);rosette(w/2,0,30,accent,gold);rosette(0,h/2,30,accent,gold);
  // kleine Sterne in den Rautenmitten
  [[w/4,h/4],[w*3/4,h/4],[w/4,h*3/4],[w*3/4,h*3/4]].forEach(([x,y])=>{g.fillStyle=hdHex(gold,.75);for(let i=0;i<4;i++){const a=i*Math.PI/2;g.beginPath();g.arc(x+Math.cos(a)*16,y+Math.sin(a)*16,4.5,0,TAU);g.fill();}
    g.fillStyle=hdHex(accent,.8);g.beginPath();g.arc(x,y,6,0,TAU);g.fill();});
  hdGrain(g,w,h,16,11);};}

// Wand (Kachel 2 m breit × 4 m hoch): unten Holzvertäfelung mit Feldern, Goldleiste, oben Seide mit Damastmuster, Deckenfries
function hdWall(silk,wood){return (g,w,h)=>{
  const px=h/4,yRail=h-px*1.05,yBase=h-px*.14,yCrown=px*.22; // px = Pixel pro Meter
  // Seide
  const sg=g.createLinearGradient(0,0,0,yRail);sg.addColorStop(0,shade(silk,-14));sg.addColorStop(.5,silk);sg.addColorStop(1,shade(silk,-8));g.fillStyle=sg;g.fillRect(0,0,w,yRail);
  // feine Seidenstreifen
  for(let x=0;x<w;x+=6){g.fillStyle=x%12?'rgba(255,255,255,.025)':'rgba(0,0,0,.035)';g.fillRect(x,0,3,yRail);}
  // Damast: Medaillons in versetzten Reihen
  const dam=(cx,cy,s)=>{g.save();g.translate(cx,cy);g.scale(s,s);
    g.fillStyle='rgba(255,214,130,.13)';g.strokeStyle='rgba(255,214,130,.22)';g.lineWidth=2.2;
    g.beginPath();g.moveTo(0,-62);g.bezierCurveTo(30,-50,40,-18,26,6);g.bezierCurveTo(44,18,40,48,0,64);g.bezierCurveTo(-40,48,-44,18,-26,6);g.bezierCurveTo(-40,-18,-30,-50,0,-62);g.closePath();g.fill();g.stroke();
    g.fillStyle='rgba(0,0,0,.12)';g.beginPath();g.moveTo(0,-34);g.bezierCurveTo(14,-20,16,0,0,16);g.bezierCurveTo(-16,0,-14,-20,0,-34);g.fill();
    g.fillStyle='rgba(255,214,130,.2)';g.beginPath();g.arc(0,30,7,0,TAU);g.fill();
    [-1,1].forEach(d=>{g.beginPath();g.moveTo(d*8,40);g.quadraticCurveTo(d*34,44,d*30,20);g.stroke();});g.restore();};
  const cw=w/2,rh=170;for(let r=0,y=yCrown+110;y<yRail-60;r++,y+=rh)for(let c=-1;c<=2;c++)dam(c*cw+(r%2?cw/2:0)+cw/4,y,1);
  // Deckenfries oben
  const cg=g.createLinearGradient(0,0,0,yCrown);cg.addColorStop(0,shade(wood,-18));cg.addColorStop(1,shade(wood,10));g.fillStyle=cg;g.fillRect(0,0,w,yCrown);
  g.fillStyle='#d6a02a';g.fillRect(0,yCrown-6,w,6);g.fillStyle='rgba(255,240,170,.8)';g.fillRect(0,yCrown-6,w,1.5);g.fillStyle='rgba(0,0,0,.4)';g.fillRect(0,yCrown,w,4);
  // Holzvertäfelung
  const r=hdRnd(23);g.fillStyle=wood;g.fillRect(0,yRail,w,h-yRail);
  for(let i=0;i<220;i++){const y=yRail+r()*(h-yRail);g.strokeStyle=r()<.5?'rgba(0,0,0,'+(.05+r()*.08)+')':'rgba(255,200,140,'+(.03+r()*.05)+')';g.lineWidth=.6+r()*1.8;
    g.beginPath();g.moveTo(0,y);for(let x=0;x<=w;x+=32)g.lineTo(x,y+Math.sin(x*.02+i)*2.5);g.stroke();}
  // Felder mit Fase
  const pw=w/2;for(let k=0;k<2;k++){const x0=k*pw+22,y0=yRail+34,x1=k*pw+pw-22,y1=yBase-26;
    const fg=g.createLinearGradient(0,y0,0,y1);fg.addColorStop(0,'rgba(0,0,0,.18)');fg.addColorStop(1,'rgba(0,0,0,.05)');g.fillStyle=fg;g.fillRect(x0,y0,x1-x0,y1-y0);
    g.lineWidth=4;g.strokeStyle='rgba(0,0,0,.45)';g.beginPath();g.moveTo(x0,y1);g.lineTo(x0,y0);g.lineTo(x1,y0);g.stroke();
    g.strokeStyle='rgba(255,215,160,.22)';g.beginPath();g.moveTo(x1,y0);g.lineTo(x1,y1);g.lineTo(x0,y1);g.stroke();
    g.lineWidth=1.5;g.strokeStyle='rgba(214,160,42,.55)';g.strokeRect(x0+10,y0+10,x1-x0-20,y1-y0-20);}
  // Goldene Brüstungsleiste
  const rg=g.createLinearGradient(0,yRail-8,0,yRail+14);rg.addColorStop(0,'#fff0a8');rg.addColorStop(.35,'#e0aa30');rg.addColorStop(.7,'#9a6a10');rg.addColorStop(1,'#3a2404');
  g.fillStyle=rg;g.fillRect(0,yRail-8,w,22);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(0,yRail+14,w,5);
  // Sockelleiste
  g.fillStyle=shade(wood,-26);g.fillRect(0,yBase,w,h-yBase);g.fillStyle='#c8962a';g.fillRect(0,yBase,w,4);
  hdGrain(g,w,h,10,29);};}

// Kassettendecke: Holzbalken, vertiefte Felder mit warmem Schimmer, Goldrahmen und Rosette
function hdCeil(g,w,h){
  g.fillStyle='#24140a';g.fillRect(0,0,w,h);
  const r=hdRnd(41);for(let i=0;i<90;i++){const y=r()*h;g.strokeStyle='rgba(0,0,0,'+(.05+r()*.08)+')';g.lineWidth=1+r()*2;g.beginPath();g.moveTo(0,y);g.lineTo(w,y+(r()-.5)*6);g.stroke();}
  const b=34,rg=g.createRadialGradient(w/2,h/2,10,w/2,h/2,w*.5);rg.addColorStop(0,'#5a3418');rg.addColorStop(1,'#2a160a');g.fillStyle=rg;g.fillRect(b,b,w-2*b,h-2*b);
  g.lineWidth=6;g.strokeStyle='rgba(0,0,0,.55)';g.strokeRect(b+3,b+3,w-2*b-6,h-2*b-6);
  g.lineWidth=4;g.strokeStyle='#c8962a';g.strokeRect(b+12,b+12,w-2*b-24,h-2*b-24);g.lineWidth=1.2;g.strokeStyle='rgba(255,236,170,.75)';g.strokeRect(b+11,b+11,w-2*b-22,h-2*b-22);
  g.save();g.translate(w/2,h/2);for(let i=0;i<12;i++){g.rotate(TAU/12);g.fillStyle=i%2?'#e0b040':'#9a6a18';g.beginPath();g.ellipse(0,-15,4.5,12,0,0,TAU);g.fill();}
  g.fillStyle='#fff0b0';g.beginPath();g.arc(0,0,6,0,TAU);g.fill();g.restore();
  hdGrain(g,w,h,8,43);}

// Marmor: weiche Wolken und feine, verzweigte Adern (nahtlos um die Säule)
function hdMarble(base,vein){return (g,w,h)=>{
  g.fillStyle=base;g.fillRect(0,0,w,h);const r=hdRnd(base.length*977+vein.charCodeAt(1));
  for(let i=0;i<26;i++){const x=r()*w,y=r()*h,R=30+r()*90,dark=r()<.5;hdWrap(w,h,(ox,oy)=>{const rg=g.createRadialGradient(x+ox,y+oy,0,x+ox,y+oy,R);
    rg.addColorStop(0,dark?'rgba(0,0,0,.07)':'rgba(255,255,255,.08)');rg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=rg;g.fillRect(x+ox-R,y+oy-R,R*2,R*2);});}
  const veinPath=(x,y,len,wd,a)=>{const pts=[[x,y]];let ang=Math.PI/2+(r()-.5)*.8;for(let i=0;i<len;i++){ang+=(r()-.5)*.5;x+=Math.cos(ang)*6;y+=Math.sin(ang)*6;pts.push([x,y]);}
    hdWrap(w,h,(ox,oy)=>{g.beginPath();pts.forEach(([px,py],i)=>i?g.lineTo(px+ox,py+oy):g.moveTo(px+ox,py+oy));g.strokeStyle=hdHex(vein,a);g.lineWidth=wd;g.stroke();});return pts;};
  g.lineCap='round';g.lineJoin='round';
  for(let k=0;k<4;k++){const pts=veinPath(r()*w,r()*h*.2,Math.floor(h/5),2.2,.55);
    for(let j=0;j<3;j++){const p=pts[Math.floor(r()*pts.length)];veinPath(p[0],p[1],20+Math.floor(r()*30),1,.35);}}
  hdGrain(g,w,h,6,53);};}

// Holz: warme Maserung mit Jahresringen
function hdWood(g,w,h){g.fillStyle='#4a2814';g.fillRect(0,0,w,h);const r=hdRnd(61);
  for(let i=0;i<140;i++){const y=r()*h;g.strokeStyle=r()<.6?'rgba(0,0,0,'+(.06+r()*.12)+')':'rgba(255,190,120,'+(.04+r()*.06)+')';g.lineWidth=.8+r()*2.4;
    g.beginPath();g.moveTo(0,y);for(let x=0;x<=w;x+=16)g.lineTo(x,y+Math.sin(x*.025+i*.7)*3);g.stroke();}
  hdGrain(g,w,h,10,67);}
// gebürstetes Metall
function hdMetal(g,w,h){g.fillStyle='#6a6e7c';g.fillRect(0,0,w,h);const r=hdRnd(71);
  for(let i=0;i<260;i++){const y=r()*h;g.fillStyle=r()<.5?'rgba(255,255,255,'+(.03+r()*.06)+')':'rgba(0,0,0,'+(.03+r()*.07)+')';g.fillRect(0,y,w,.6+r()*1.4);}
  const sg=g.createLinearGradient(0,0,0,h);sg.addColorStop(0,'rgba(255,255,255,.08)');sg.addColorStop(.5,'rgba(0,0,0,0)');sg.addColorStop(1,'rgba(0,0,0,.08)');g.fillStyle=sg;g.fillRect(0,0,w,h);
  hdGrain(g,w,h,6,73);}
// Pixel-Zeichnung vergrößert und weich gefiltert (für alte kleine Texturen wie Filz und Gemälde)
function upTex(w,h,draw,k,rx,ry){return hdTex(w*k,h*k,(g)=>{g.scale(k,k);draw(g,w,h);},rx,ry);}
