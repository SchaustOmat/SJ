/* =========================================================
   CRASH  (Multiplikator-Kurve, Terminal im EG an der Ostwand)
   Einsatz setzen, die Kurve steigt (×1,00 → ×2 → ×10 …) und kann jederzeit crashen.
   AUSZAHLEN vor dem Crash = Einsatz × aktueller Wert, sonst ist der Einsatz weg.
   Auto-Auszahlung bei einem festen Wert (×1,20 … ×100). Quote 97 % (3 % Hausvorteil):
   P(Crash ≥ x) = 0,97 / x, d. h. ~3 % der Runden crashen sofort bei ×1,00.
   Im Raum (MULTI) läuft EINE gemeinsame Runde für alle am Terminal: der Spieler mit der kleinsten
   Peer-ID am Terminal ist Gastgeber (würfelt den Crash-Punkt, gibt den Takt vor), alle anderen
   folgen seiner Uhr. Jeder sieht, wer mitsetzt und wer wo ausgestiegen ist. Über die Präsenz:
     ca = 1 am Terminal   cb = {r:Runde,b:Einsatz,c:Ausstieg×}   ct = Rundenzustand (nur Gastgeber)
   Allein (ohne Raum) startet die Runde sofort mit START.
   ========================================================= */
const CR={F:null,group:null,cx:0,cz:0,rot:0,state:'bet',si:3,ai:0,pend:0,t:0,m:1,C:0,hist:[],win:0,winM:0,msg:'',tex:null,ctex:null,scr:null,cg:null,
  r:1,host:'',my:{r:0,b:0,c:0},queued:0,players:[],bt:Infinity,betLen:8,dirty:true,drawT:0,shake:0,tick:0,last:{},ctKey:''};
const CR_G=.15;                        // Wachstum: m = e^(G·t) → ×2 nach 4,6 s, ×10 nach 15,4 s, ×100 nach 30,7 s
const CR_AUTO=[0,1.2,1.5,2,3,5,10,20,50,100];
const CR_SCR_Y=1.55,CR_SCR_Z=.09,CR_EDGE=.97,CR_BET=8,CR_AFTER=3;
function crStake(){return HL.stakes[CR.si];}
function crAuto(){return CR_AUTO[CR.ai];}
function crPoint(){const u=Math.random();if(u<1-CR_EDGE)return 1;return Math.min(1000,Math.max(1,Math.floor(100*CR_EDGE/(1-u))/100));}
function crM(t){return Math.exp(CR_G*t);}
function crFmtX(m){return '×'+(Math.floor(m*100)/100).toFixed(2).replace('.',',');}
function crRoom(){return !!MP.room&&!!MP.myPeer;}
function crIsHost(){return !crRoom()||CR.host===MP.myPeer;}
function crAtTerminal(){return !!focus&&focus.type==='crash';}
function crPayout(bet,m){return Math.max(0,Math.floor(bet*(Math.floor(m*100)/100)/10)*10);}
function buildCrash(F,x,z,rot){
  CR.F=F;CR.cx=x;CR.cz=z;CR.rot=rot;const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;F.group.add(g);CR.group=g;
  const dark=lam({color:0x0c0a12}),gold=bas({color:0xd6a02a});
  box(.9,1.0,.5,dark,0,.5,0,g);box(.96,.03,.56,gold,0,1.0,0,g);                 // Sockel mit Goldkante
  box(.9,1.1,.3,dark,0,1.58,-.08,g);box(.94,.05,.34,gold,0,2.14,-.08,g);        // Aufbau mit Bildschirm, Goldleiste oben
  box(.74,.92,.012,lam({color:0x000000}),0,CR_SCR_Y,.072,g);                     // Rahmen
  CR.tex=canvasTex(384,480,null,0,0,true);CR.scr=mesh(new THREE.PlaneGeometry(.64,.8),bas({map:CR.tex}),0,CR_SCR_Y,CR_SCR_Z,g);
  const lt=labelTex(192,36,c=>{c.fillStyle='#07040c';c.fillRect(0,0,192,36);px(c,14);c.textAlign='center';c.textBaseline='middle';c.fillStyle='#ff5ab0';c.fillText('C R A S H',96,19);});
  mesh(new THREE.PlaneGeometry(.56,.105),bas({map:lt}),0,2.055,.0725,g);
  // kleine Konsole vorn: Einsatz, Auto und letzte Runden (beim Spielen übernimmt die Knopfleiste unten)
  const cg=new THREE.Group();cg.position.set(0,1.02,.36);cg.rotation.x=.5;g.add(cg);CR.cg=cg;
  box(.8,.04,.26,lam({color:0x120c18}),0,0,0,cg);box(.82,.02,.02,bas({color:0xff5ab0}),0,.025,.13,cg);
  CR.ctex=canvasTex(256,64,null);const d=mesh(new THREE.PlaneGeometry(.7,.175),bas({map:CR.ctex}),0,.022,-.01,cg);d.rotation.x=-Math.PI/2;
  const sx=Math.sin(rot),sz=Math.cos(rot);
  tagAct(F,g,{type:'crash',label:'CRASH',sub:'Multiplikator-Kurve · gemeinsam im Raum',pos:new THREE.Vector3(x+sx*.8,1,z+sz*.8),reach:2.2});
  col(F,x,z,1.0,1.0);
  pointLight(F,0xff5ab0,x+sx*1.3,3,z+sz*1.3,1.1,7);
  crUpdate();
}
function crUpdate(){CR.dirty=true;if(typeof crBarSync==='function')crBarSync();
  const c=CR.ctex.userData.ctx;c.fillStyle='#07040c';c.fillRect(0,0,256,64);c.strokeStyle='#3a2c52';c.strokeRect(.5,.5,255,63);
  px(c,8);c.textBaseline='middle';c.textAlign='left';c.fillStyle='#9b8fb3';c.fillText('EINSATZ',8,14);c.fillStyle='#ffcf3a';c.fillText(fmt(crStake()),70,14);
  c.textAlign='right';c.fillStyle='#9b8fb3';c.fillText('AUTO',200,14);c.fillStyle='#ff5ab0';c.fillText(crAuto()?crFmtX(crAuto()):'AUS',248,14);
  c.textAlign='center';px(c,8);c.fillStyle='#f4f0e8';c.fillText(CR.hist.length?'LETZTE: '+CR.hist.slice(-5).map(crFmtX).join('  '):'EINSATZ, DANN START',128,42);
  CR.ctex.needsUpdate=true;}
function crSetMy(o){CR.my=o;if(MP.room){MP.me.cb=Object.assign({},o);MP.dirty=true;MP.lastSent=0;}}
function crEnter(){CR.msg='';if(MP.room){MP.me.ca=1;MP.dirty=true;MP.lastSent=0;}crUpdate();}
function crPress(key){
  const s=CR.state;SFX.btn();
  const canSet=s==='bet'||(crRoom()&&CR.pend<=0&&!CR.queued);
  if(key==='MINUS'&&canSet&&CR.si>0){CR.si--;crUpdate();}
  else if(key==='PLUS'&&canSet&&CR.si<HL.stakes.length-1){CR.si++;crUpdate();}
  else if(key==='AUTOM'&&canSet&&CR.ai>0){CR.ai--;crUpdate();}
  else if(key==='AUTOP'&&canSet&&CR.ai<CR_AUTO.length-1){CR.ai++;crUpdate();}
  else if(key==='START')crStartPress();
  else if(key==='NEHMEN'&&s==='run'&&CR.pend>0&&!CR.my.c)crCash(CR.m);
}
function crKey(){if(CR.state==='run'&&CR.pend>0&&!CR.my.c)crPress('NEHMEN');else crPress('START');}
// START: allein = Runde startet sofort; im Raum = Einsatz für die laufende Wettphase, sonst für die nächste Runde vormerken
function crStartPress(){
  const st=crStake();
  if(CR.pend>0||CR.queued>0){toast(CR.queued?'Dein Einsatz ist für die nächste Runde vorgemerkt.':'Du bist schon dabei.');return;}
  if(chips<st){toast('Nicht genug Geld.');return;}
  if(!crRoom()){
    if(CR.state!=='bet')return;
    setChips(chips-st);CR.pend=st;store('nk_crpend',st);crSetMy({r:CR.r,b:st,c:0});CR.C=crPoint();CR.bt=.9;CR.win=0;CR.winM=0;CR.msg='';SFX.click();crUpdate();return;
  }
  setChips(chips-st);store('nk_crpend',st);SFX.click();
  if(CR.state==='bet'){CR.pend=st;crSetMy({r:CR.r,b:st,c:0});CR.msg='';}
  else{CR.queued=st;CR.msg='EINSATZ FÜR DIE NÄCHSTE RUNDE VORGEMERKT';}
  crUpdate();
}
function crLaunch(){CR.state='run';CR.t=0;CR.m=1;CR.win=0;CR.winM=0;CR.tick=0;CR.msg='';if(crAtTerminal())SFX.whoosh();crUpdate();}
function crNewRound(r){ // neue Runde: vorgemerkter Einsatz kommt rein
  CR.r=r;CR.state='bet';CR.t=0;CR.m=1;CR.C=0;CR.win=0;CR.winM=0;CR.shake=0;CR.bt=crRoom()?CR.betLen:Infinity;
  if(CR.queued>0){CR.pend=CR.queued;CR.queued=0;crSetMy({r,b:CR.pend,c:0});CR.msg='';}
  else if(CR.pend>0){crSetMy({r,b:CR.pend,c:0});} // offener Einsatz (z. B. nach Gastgeberwechsel) zählt für die neue Runde
  else if(CR.my.r!==r&&MP.room&&MP.me.cb){MP.me.cb=null;MP.dirty=true;}
  crUpdate();
}
function crCash(m){
  if(CR.state!=='run'||CR.pend<=0||CR.my.c)return;
  const md=Math.floor(m*100)/100,bet=CR.pend,win=crPayout(bet,md);
  CR.pend=0;store('nk_crpend',null);CR.win=win;CR.winM=md;crSetMy({r:CR.my.r,b:bet,c:md});
  setChips(chips+win,true);SFX.chip();SFX.win();hsReport('CRASH',win,bet);
  CR.msg='AUSGEZAHLT BEI '+crFmtX(md)+' = '+fmt(win);
  const cx=LW()/2,cy=LH()*.42;
  if(md>=8){UFX.banner(md>=30?'WAHNSINN!':'STARK!',win,md>=30?2:1,crFmtX(md));SFX.tierUp(md>=30?3:1);if(win>=5000)mpWin('holt '+fmt(win)+' bei Crash raus ('+crFmtX(md)+')!');}
  else{UFX.flash(.3,'160,255,170');UFX.burst(cx,cy,26,{cols:['#a8ffb0','#ffd23a','#fff'],spd:300});UFX.float(cx,cy,'+'+fmt(win),'#3adf5a');}
  UFX.flyChips(cx,LH()*.5,win);crUpdate();
}
function crCrashNow(){
  if(CR.state==='crash')return;
  CR.state='crash';CR.shake=1;CR.bt=CR_AFTER;CR.m=CR.C;
  if(crIsHost()){CR.hist.push(CR.C);if(CR.hist.length>12)CR.hist.shift();}
  const lost=CR.pend;const here=crAtTerminal();
  if(CR.my.c>0&&CR.my.c>CR.C&&CR.my.r===CR.r){ // zu spät gedrückt (Verzögerung): der Gastgeber hatte schon gecrasht
    const back=crPayout(CR.my.b,CR.my.c);setChips(chips-back);CR.win=0;CR.winM=0;crSetMy({r:CR.my.r,b:CR.my.b,c:0});CR.msg='ZU SPÄT · CRASH WAR SCHON BEI '+crFmtX(CR.C);if(here){SFX.lose();UFX.flash(.5,'255,30,30');}}
  else if(lost>0){CR.pend=0;store('nk_crpend',null);CR.msg='CRASH BEI '+crFmtX(CR.C)+' · '+fmt(lost)+' WEG';if(here){SFX.boom();SFX.lose();UFX.flash(.5,'255,30,30');UFX.shake(.5);}}
  else{if(here)SFX.boom();if(CR.win>0)CR.msg='CRASH BEI '+crFmtX(CR.C)+' · DU HATTEST '+crFmtX(CR.winM);else if(!CR.msg)CR.msg='CRASH BEI '+crFmtX(CR.C);}
  crUpdate();
}
function crPlayers(){ // wer ist in dieser Runde dabei (Name, Einsatz, Ausstieg)
  const list=[];
  if(crRoom()&&typeof mtEachPeer==='function'){mtEachPeer((p,pr)=>{const cb=pr&&pr.cb;if(cb&&cb.r===CR.r&&+cb.b>0)list.push({id:p,n:cleanText(pr.n,12)||'GAST',b:Math.round(+cb.b),c:Math.max(0,+cb.c||0),me:p===MP.myPeer});});
    list.sort((a,b)=>a.me?-1:b.me?1:a.id<b.id?-1:1);}
  else if(CR.my.r===CR.r&&CR.my.b>0)list.push({id:'me',n:MP.name||'DU',b:CR.my.b,c:CR.my.c,me:true});
  return list.slice(0,8);
}
function crHostPick(){let best='';if(typeof mtEachPeer==='function')mtEachPeer((p,pr)=>{if(pr&&pr.ca===1&&(!best||p<best))best=p;});return best;}
function crStep(dt){
  if(CR.shake>0)CR.shake=Math.max(0,CR.shake-dt*2.5);
  const room=crRoom();
  if(room&&crAtTerminal()&&MP.me.ca!==1){MP.me.ca=1;MP.dirty=true;}
  // Gastgeber bestimmen (Raum) – wechselt er mitten im Lauf, zahlt jeder seinen Einsatz zum aktuellen Wert aus
  const host=room?crHostPick():'';
  if(host!==CR.host){if(CR.state==='run'&&CR.pend>0)crCash(CR.m);CR.host=host;CR.ctKey='';
    if(room&&host===MP.myPeer)crNewRound(CR.r+1);else if(!room||!host){CR.state='bet';CR.bt=Infinity;CR.t=0;CR.m=1;crUpdate();}}
  if(!room||host===MP.myPeer)crHostStep(dt);else if(host)crClientStep(dt);
  // eigener Einsatz: Auto-Auszahlung
  if(CR.state==='run'&&CR.pend>0&&!CR.my.c){const a=crAuto();if(a&&CR.m>=a&&(!crIsHost()||a<=CR.C))crCash(a);}
  if(CR.state==='run'){CR.tick-=dt;if(CR.tick<=0){CR.tick=.22;if(crAtTerminal()&&CR.pend>0)SFX.riseTick(Math.min(1,Math.log(CR.m)/Math.log(12)));}}
  const near=crAtTerminal()?0:Math.hypot(CR.cx-P.x,CR.cz-P.z);
  const live=CR.state==='run'||CR.state==='crash'||(CR.state==='bet'&&CR.bt<Infinity);
  CR.drawT-=dt;if((CR.dirty||live)&&CR.drawT<=0){CR.drawT=near<7?0:.5;crDraw();CR.dirty=false;}
  if(crAtTerminal()&&live&&typeof crBarSync==='function')crBarSync();
}
function crHostStep(dt){
  if(CR.state==='bet'){if(CR.bt<Infinity){CR.bt-=dt;if(CR.bt<=0){if(!CR.C)CR.C=crPoint();crLaunch();}}}
  else if(CR.state==='run'){CR.t+=dt;const m=crM(CR.t);if(m>=CR.C){CR.m=CR.C;crCrashNow();}else CR.m=m;}
  else if(CR.state==='crash'){CR.bt-=dt;if(CR.bt<=0)crNewRound(CR.r+1);}
  if(crRoom()){const ct={r:CR.r,st:CR.state,t:Math.round(CR.t*10)/10,bt:Math.max(0,Math.ceil(CR.bt)),h:CR.hist.slice(-8)};if(CR.state==='crash')ct.C=CR.C;
    const k=JSON.stringify(ct);if(k!==CR.ctKey){CR.ctKey=k;MP.me.ct=ct;MP.dirty=true;}}
}
function crClientStep(dt){
  const pr=typeof mtPeerPresence==='function'?mtPeerPresence(CR.host):null,ct=pr&&pr.ct;if(!ct||typeof ct.r!=='number')return;
  if(ct.r!==CR.r){if(CR.state==='run'&&CR.pend>0)crCash(CR.m);crNewRound(ct.r);}
  if(Array.isArray(ct.h))CR.hist=ct.h.map(Number).filter(x=>x>=1).slice(-12);
  if(ct.st==='run'&&CR.state!=='run'){if(CR.state==='bet'){CR.t=+ct.t||0;crLaunch();CR.t=+ct.t||0;CR.m=crM(CR.t);}}
  else if(ct.st==='crash'&&CR.state!=='crash'){CR.C=Math.max(1,+ct.C||CR.m);crCrashNow();}
  else if(ct.st==='bet'&&CR.state!=='bet'){CR.state='bet';CR.t=0;CR.m=1;crUpdate();}
  if(CR.state==='run'){CR.t+=dt;const ht=+ct.t||0;const d=ht-CR.t;if(Math.abs(d)>.35)CR.t=ht;else CR.t+=d*Math.min(1,dt*3);CR.m=crM(CR.t);}
  if(CR.state==='bet'||CR.state==='crash')CR.bt=+ct.bt||0;
}
// ---- Bildschirm ----
function crDraw(){
  const g=CR.tex.userData.ctx,W=384,H=480,s=CR.state,room=crRoom(),players=crPlayers();CR.players=players;
  g.save();if(CR.shake>0){g.translate((Math.random()-.5)*8*CR.shake,(Math.random()-.5)*8*CR.shake);}
  g.fillStyle='#07040c';g.fillRect(-10,-10,W+20,H+20);
  g.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<40;i++){const x=(i*73+((CR.t*20*(i%3+1))|0))%W,y=(i*131)%H;g.fillRect(x,y,i%4?1:2,i%4?1:2);}
  const hist=CR.hist.slice(-8);g.textBaseline='middle';g.textAlign='center';
  hist.forEach((v,i)=>{const x=10+i*47,col=v>=10?'#ffcf3a':v>=2?'#3adf5a':'#ff3a5a';g.fillStyle='rgba(255,255,255,.06)';g.fillRect(x,10,44,22);g.fillStyle=col;px(g,8);g.fillText(crFmtX(v),x+22,21);});
  const L=34,R=W-12,T=52,B=H-96;
  const t=CR.t,m=CR.m,xmax=Math.max(6,t*1.08),ymax=Math.max(2,m*1.15);
  const X=tt=>L+tt/xmax*(R-L),Y=mm=>B-(mm-1)/(ymax-1)*(B-T);
  g.strokeStyle='#1e1430';g.lineWidth=1;
  const ystep=ymax<=3?.5:ymax<=6?1:ymax<=15?2:ymax<=40?5:ymax<=120?20:100;
  for(let v=1;v<=ymax;v+=ystep){const y=Y(v);g.beginPath();g.moveTo(L,y);g.lineTo(R,y);g.stroke();g.fillStyle='#5a4a70';px(g,6);g.textAlign='right';g.fillText('×'+(Number.isInteger(v)?v:v.toFixed(1)),L-3,y);}
  const xstep=xmax<=8?1:xmax<=20?5:10;
  for(let v=0;v<=xmax;v+=xstep){const x=X(v);g.beginPath();g.moveTo(x,T);g.lineTo(x,B);g.stroke();g.fillStyle='#5a4a70';px(g,6);g.textAlign='center';g.fillText(v+'s',x,B+8);}
  g.strokeStyle='#3a2c52';g.beginPath();g.moveTo(L,T);g.lineTo(L,B);g.lineTo(R,B);g.stroke();
  const showCurve=s==='run'||s==='crash'||(s==='bet'&&CR.t>0);
  if(showCurve){
    const crashed=s!=='run';const N=70;
    g.beginPath();for(let i=0;i<=N;i++){const tt=t*i/N;const y=Y(Math.min(crM(tt),ymax));if(i===0)g.moveTo(X(tt),y);else g.lineTo(X(tt),y);}
    const lx=X(t),ly=Y(Math.min(m,ymax));g.lineTo(lx,B);g.lineTo(L,B);g.closePath();
    const gr=g.createLinearGradient(0,T,0,B);gr.addColorStop(0,crashed?'rgba(255,58,90,.35)':'rgba(255,207,58,.35)');gr.addColorStop(1,'rgba(255,207,58,0)');g.fillStyle=gr;g.fill();
    g.beginPath();for(let i=0;i<=N;i++){const tt=t*i/N;const y=Y(Math.min(crM(tt),ymax));if(i===0)g.moveTo(X(tt),y);else g.lineTo(X(tt),y);}
    g.strokeStyle=crashed?'#ff3a5a':'#ffcf3a';g.lineWidth=3;g.lineJoin='round';g.stroke();g.lineWidth=1;
    if(!crashed){g.fillStyle='#fff';g.beginPath();g.arc(lx,ly,5,0,Math.PI*2);g.fill();g.fillStyle='rgba(255,207,58,.35)';g.beginPath();g.arc(lx,ly,11+Math.sin(CR.t*12)*2,0,Math.PI*2);g.fill();}
    // Ausstiegs-Marken: wer ist wo raus
    const marks=players.filter(p=>p.c>0);let lastY=-99;
    marks.sort((a,b)=>a.c-b.c).forEach(p=>{const cy=Y(Math.min(p.c,ymax)),ct=Math.log(p.c)/CR_G,cx=X(Math.min(ct,t));
      g.strokeStyle=p.me?'rgba(58,223,90,.7)':'rgba(41,240,255,.45)';g.setLineDash([3,4]);g.beginPath();g.moveTo(L,cy);g.lineTo(cx,cy);g.stroke();g.setLineDash([]);
      g.fillStyle=p.me?'#3adf5a':'#29f0ff';g.beginPath();g.arc(cx,cy,5,0,Math.PI*2);g.fill();
      px(g,7);g.textAlign=cx>W*.6?'right':'left';const ty=Math.abs(cy-lastY)<11?cy+11:cy-9;lastY=ty;g.fillText((p.me?'DU ':p.n+' ')+crFmtX(p.c),cx+(cx>W*.6?-8:8),ty);});
    if(crAuto()&&!crashed&&CR.pend>0&&!CR.my.c){const ay=Y(Math.min(crAuto(),ymax));if(ay>T){g.strokeStyle='rgba(255,90,176,.6)';g.setLineDash([3,5]);g.beginPath();g.moveTo(L,ay);g.lineTo(R,ay);g.stroke();g.setLineDash([]);g.fillStyle='#ff5ab0';px(g,6);g.textAlign='right';g.fillText('AUTO '+crFmtX(crAuto()),R-2,ay-7);}}
  }
  // Mitspieler-Liste (oben links im Diagramm): Name · Einsatz · Status
  if(players.length){px(g,7);g.textAlign='left';g.textBaseline='middle';const lx=R-156; // rechts oben, damit der AUFSTEHEN-Knopf am Handy nichts verdeckt
    players.forEach((p,i)=>{const y=T+10+i*13;g.fillStyle='rgba(7,4,12,.7)';g.fillRect(lx,y-6,152,12);
      g.fillStyle=p.me?'#3adf5a':'#f4f0e8';g.fillText((p.me?'DU':p.n).slice(0,10),lx+4,y);g.fillStyle='#ffcf3a';g.fillText(fmt(p.b),lx+66,y);
      const st=p.c>0?crFmtX(p.c)+' ✓':s==='crash'?'CRASH':'DABEI';g.fillStyle=p.c>0?'#3adf5a':s==='crash'?'#ff3a5a':'#9b8fb3';g.fillText(st,lx+114,y);});}
  // großer Multiplikator / Status
  g.textAlign='center';
  if(s==='bet'&&room){g.fillStyle='#f4f0e8';px(g,15);g.fillText('NÄCHSTE RUNDE IN '+Math.max(0,Math.ceil(CR.bt))+' s',W/2,H*.4);px(g,8);g.fillStyle='#9b8fb3';g.fillText(CR.pend>0?'DU BIST DABEI MIT '+fmt(CR.pend):'START = MITSETZEN',W/2,H*.4+26);}
  else if(s==='bet'&&CR.bt<Infinity){g.fillStyle='#f4f0e8';px(g,22);g.fillText('START …',W/2,H*.42);}
  else if(s==='crash'){g.fillStyle='#ff3a5a';px(g,34);g.fillText('CRASH',W/2,H*.36);px(g,30);g.fillText(crFmtX(CR.C),W/2,H*.48);}
  else if(s==='run'){const done=CR.my.c>0&&CR.my.r===CR.r;g.fillStyle=done?'#3adf5a':m>=10?'#ffcf3a':'#f4f0e8';px(g,40);g.fillText(crFmtX(m),W/2,H*.4);
    if(CR.pend>0&&!done){g.fillStyle='#ffcf3a';px(g,11);g.fillText(fmt(crPayout(CR.pend,m)),W/2,H*.4+36);}}
  else{g.fillStyle='#f4f0e8';px(g,15);g.fillText(CR.hist.length?'BEREIT':'CRASH',W/2,H*.38);px(g,8);g.fillStyle='#9b8fb3';g.fillText('EINSATZ SETZEN, START DRÜCKEN,',W/2,H*.38+30);g.fillText('VOR DEM CRASH AUSZAHLEN',W/2,H*.38+44);}
  // untere Zeile
  g.fillStyle='#120c18';g.fillRect(0,H-70,W,70);g.fillStyle='#3a2c52';g.fillRect(0,H-70,W,1);
  px(g,8);g.textAlign='left';g.fillStyle='#9b8fb3';g.fillText('EINSATZ',12,H-52);g.fillStyle='#ffcf3a';g.fillText(fmt(CR.pend>0?CR.pend:CR.queued>0?CR.queued:crStake()),80,H-52);
  g.textAlign='right';g.fillStyle='#9b8fb3';g.fillText('AUTO',W-80,H-52);g.fillStyle='#ff5ab0';g.fillText(crAuto()?crFmtX(crAuto()):'AUS',W-12,H-52);
  px(g,8);g.textAlign='center';g.fillStyle=s==='crash'&&!CR.win?'#ff3a5a':CR.win>0?'#3adf5a':'#f4f0e8';
  const msg=CR.msg||(s==='run'&&CR.pend>0?'AUSZAHLEN, BEVOR ES CRASHT!':room&&s==='bet'?'JEDE RUNDE ZÄHLT FÜR ALLE IM RAUM':'QUOTE 97 % · CRASH ≥ ×2 IN 48 % DER RUNDEN');
  g.fillText(msg,W/2,H-24);
  g.restore();CR.tex.needsUpdate=true;
}
// ---- Knopfleiste unten (wie bei Höher/Tiefer) ----
const CRB={btn:{}};
['MINUS','PLUS','AUTOM','AUTOP','START','NEHMEN'].forEach(k=>{const b=$('#cr-'+k);if(!b)return;CRB.btn[k]=b;
  b.addEventListener('pointerdown',e=>{e.preventDefault();crPress(k);b.classList.add('down');setTimeout(()=>b.classList.remove('down'),120);});});
function crBarSync(){
  const s=CR.state,room=crRoom(),free=CR.pend<=0&&!CR.queued,canSet=s==='bet'||(room&&free);
  const canStart=free&&chips>=crStake()&&(room?true:s==='bet');
  const lit={MINUS:canSet&&CR.si>0,PLUS:canSet&&CR.si<HL.stakes.length-1,AUTOM:canSet&&CR.ai>0,AUTOP:canSet&&CR.ai<CR_AUTO.length-1,START:canStart,NEHMEN:s==='run'&&CR.pend>0&&!CR.my.c};
  for(const k in CRB.btn)CRB.btn[k].classList.toggle('lit',!!lit[k]);
  const sb=CRB.btn.START;if(sb){const l=room&&s!=='bet'?'NÄCHSTE RUNDE':room?'MITSETZEN':'START';if(sb.textContent!==l)sb.textContent=l;}
  const nb=CRB.btn.NEHMEN;if(nb){const l=s==='run'&&CR.pend>0?'AUSZAHLEN '+fmt(crPayout(CR.pend,CR.m)):'AUSZAHLEN';if(nb.textContent!==l)nb.textContent=l;}
  const info=s==='bet'&&room?'RUNDE '+CR.r+' · START IN '+Math.max(0,Math.ceil(CR.bt))+' s · EINSATZ '+fmt(CR.pend>0?CR.pend:crStake()):
    s==='bet'?'EINSATZ '+fmt(crStake())+' · AUTO '+(crAuto()?crFmtX(crAuto()):'AUS'):
    s==='run'?(CR.pend>0?'IM SPIEL '+fmt(CR.pend):'RUNDE LÄUFT')+' · '+crFmtX(CR.m):'RUNDE '+CR.r+' · CRASH BEI '+crFmtX(CR.C);
  const msg=CR.msg||(s==='bet'?(room?'MITSETZEN, BEVOR DIE RUNDE STARTET':'EINSATZ UND AUTO WÄHLEN, DANN START'):s==='run'&&CR.pend>0?'AUSZAHLEN, BEVOR ES CRASHT':'');
  if(CR.last.info!==info){$('#crInfo').textContent=info;CR.last.info=info;}
  if(CR.last.msg!==msg){$('#crMsg').textContent=msg;CR.last.msg=msg;}
  // Mitspieler-Zeile
  const pl=CR.players||[];const html=pl.map(p=>'<span class="crp'+(p.me?' me':'')+(p.c>0?' out':s==='crash'?' lost':'')+'">'+esc((p.me?'DU':p.n))+' <b>'+fmt(p.b)+'</b> '+(p.c>0?crFmtX(p.c):s==='crash'?'✗':'…')+'</span>').join('');
  const el=$('#crList');if(el&&CR.last.html!==html){el.innerHTML=html;el.hidden=!html;CR.last.html=html;}
}
function crLeave(){ // Aufstehen: laufende Runde wird zum aktuellen Wert ausgezahlt, offener/vorgemerkter Einsatz kommt zurück
  if(CR.state==='run'&&CR.pend>0&&!CR.my.c)crCash(CR.m);
  else if(CR.pend>0){setChips(chips+CR.pend);CR.pend=0;store('nk_crpend',null);if(MP.room&&MP.me.cb){MP.me.cb=null;}CR.my={r:0,b:0,c:0};}
  if(CR.queued>0){setChips(chips+CR.queued);CR.queued=0;store('nk_crpend',null);}
  if(MP.room){MP.me.ca=0;MP.dirty=true;MP.lastSent=0;}
  if(!crRoom()){CR.state='bet';CR.bt=Infinity;}
  crUpdate();
}
try{const cp=+localStorage.getItem('nk_crpend');if(cp>0){chips+=cp;localStorage.removeItem('nk_crpend');localStorage.setItem('nk_chips',String(chips));}}catch(e){}
