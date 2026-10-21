/* =========================================================
   HIGHSCORE-TAFEL (EG, Nordwand): elektrische Anzeigetafel wie am Flughafen.
   Zeigt die höchsten gebuchten Gewinne der Woche: Spieler, Spiel, Zeit, Betrag (Top 6 auf der Tafel, Top 10 im Panel),
   dazu Laufschrift mit Vorwoche und Rekord. Die Woche beginnt montags neu (Kalenderwoche).
   Geteilt über die Freunde-Server (retained MQTT): sinanskeller/hs/<KW-Schlüssel> und sinanskeller/hs/all.
   Jeder Spieler mischt die Liste, die er kennt, mit der vom Server (Vereinigung nach Eintrags-ID, Top 10) – so landen alle beim selben Stand.
   Lokal in nk_hs gespeichert, läuft also auch ohne Verbindung.
   ========================================================= */
const HS={cur:{k:'',l:[]},prev:{k:'',l:[]},all:[],board:null,disp:[],target:[],flip:[],pub:{},pubT:null,tick:0,lastDraw:0,lastMin:-1,sfxT:0,active:false,tickTxt:'',tickW:0,dirtyStatic:true,ready:false};
const HS_N=10,HS_ROWS=6,HS_MIN=50; // ab 0,50 € zählt ein Gewinn
// Tests: window.NK_HS_LOCAL = nichts senden/empfangen; window.NK_HS_TOPIC = eigenes Testthema statt der echten Tafel
const HS_TOPIC=(typeof window!=='undefined'&&window.NK_HS_TOPIC)||'sinanskeller/hs/';const hsLocal=()=>!!(typeof window!=='undefined'&&window.NK_HS_LOCAL);
const HS_DAYS=['SO','MO','DI','MI','DO','FR','SA'];
function hsWeekKey(d){const x=new Date(d);x.setHours(0,0,0,0);x.setDate(x.getDate()+3-((x.getDay()+6)%7));const w1=new Date(x.getFullYear(),0,4);
  return x.getFullYear()+'-W'+String(1+Math.round(((x-w1)/86400000-3+((w1.getDay()+6)%7))/7)).padStart(2,'0');}
const hsKw=k=>k?'KW '+String(+k.slice(-2)):'';
function hsPad(n){return String(n).padStart(2,'0');}
function hsWhen(t,full){const d=new Date(t);return full?hsPad(d.getDate())+'.'+hsPad(d.getMonth()+1)+'.'+String(d.getFullYear()).slice(2):HS_DAYS[d.getDay()]+' '+hsPad(d.getHours())+':'+hsPad(d.getMinutes());}
function hsMe(){const k=String((typeof BANK!=='undefined'&&BANK.konto)||'').replace(/\D/g,'').slice(0,8);return /^\d{8}$/.test(k)?k:'';}
function hsName(){const n=cleanText((typeof MP!=='undefined'&&MP.name)||'',14).trim().toUpperCase();if(n&&n!=='GAST')return n;const k=hsMe();return 'GAST'+(k?' '+k.slice(4):'');}
// Einträge prüfen (auch die vom Server), kaputte oder doppelte raus
function hsClean(list){const out=[],seen={},tn=Date.now()+120000;
  (Array.isArray(list)?list:[]).slice(0,40).forEach(e=>{if(!e||typeof e!=='object')return;const i=String(e.i||'');if(!/^[a-z0-9]{6,16}$/.test(i)||seen[i])return;
    const a=Math.round(+e.a),t=+e.t;if(!(a>0&&a<=1e9)||!(t>0&&t<tn))return;seen[i]=1;
    out.push({i,k:/^\d{8}$/.test(String(e.k||''))?String(e.k):'',n:cleanText(e.n,14).toUpperCase()||'GAST',g:cleanText(e.g,18).toUpperCase()||'?',a,b:Math.max(0,Math.round(+e.b)||0),t});});
  return out;}
const hsSort=(x,y)=>y.a-x.a||x.t-y.t;
// Vereinigung zweier Listen -> Top N. Meldet, ob sich dst geändert hat und ob dst etwas hatte, das src fehlte
function hsMerge(dst,src){const by={};dst.forEach(e=>by[e.i]=e);const srcIds={};src.forEach(e=>{srcIds[e.i]=1;if(!by[e.i])by[e.i]=e;});
  const list=Object.values(by).sort(hsSort).slice(0,HS_N),extra=list.some(e=>!srcIds[e.i]);
  const changed=list.length!==dst.length||list.some((e,i)=>e.i!==dst[i].i);return {list,changed,extra};}
function hsLoad(){try{const d=JSON.parse(localStorage.getItem('nk_hs')||'null');if(d&&typeof d==='object'){
    if(d.cur&&typeof d.cur.k==='string')HS.cur={k:d.cur.k,l:hsClean(d.cur.l).sort(hsSort).slice(0,HS_N)};
    if(d.prev&&typeof d.prev.k==='string')HS.prev={k:d.prev.k,l:hsClean(d.prev.l).sort(hsSort).slice(0,HS_N)};
    HS.all=hsClean(d.all).sort(hsSort).slice(0,HS_N);}}catch(e){}
  hsRoll();HS.ready=true;}
function hsSave(){try{localStorage.setItem('nk_hs',JSON.stringify({cur:HS.cur,prev:HS.prev,all:HS.all}));}catch(e){}HS.dirtyStatic=true;}
// Wochenwechsel: aktuelle Woche wird Vorwoche
function hsRoll(){const k=hsWeekKey(Date.now());if(HS.cur.k===k)return;
  if(HS.cur.k&&HS.cur.l.length&&HS.cur.k>HS.prev.k)HS.prev=HS.cur;HS.cur={k,l:[]};hsSave();}
// Gewinn melden (Cent). Wird von Automaten, Roulette, Höher/Tiefer, Poker und Spielertisch gerufen.
function hsReport(game,amount,bet){amount=Math.round(+amount||0);if(!(amount>=HS_MIN)||!HS.ready)return;hsRoll();
  const e={i:Math.random().toString(36).slice(2,10),k:hsMe(),n:hsName(),g:cleanText(game,18).toUpperCase()||'?',a:amount,b:Math.max(0,Math.round(+bet||0)),t:Date.now()};
  const r1=hsMerge(HS.cur.l,[e]);if(r1.changed){HS.cur.l=r1.list;hsQueue(HS.cur.k);}
  const r2=hsMerge(HS.all,[e]);if(r2.changed){HS.all=r2.list;hsQueue('all');}
  if(r1.changed||r2.changed){hsSave();if(r1.changed&&r1.list[0]===e&&typeof toast==='function'&&started)toast('Neuer Wochen-Highscore: '+fmt(amount)+' an '+e.g+'!');}
  if(openId==='pHigh')hsRender();}
// ---- Server: senden (gebündelt, leicht zufällig verzögert) und empfangen ----
function hsQueue(key){HS.pub[key]=1;if(HS.pubT)return;HS.pubT=setTimeout(()=>{HS.pubT=null;hsFlush();},1500+Math.random()*1500);}
function hsFlush(){if(hsLocal()||typeof FR==='undefined'||!FR.ok)return;for(const key in HS.pub){delete HS.pub[key];
  const l=key==='all'?HS.all:key===HS.cur.k?HS.cur.l:key===HS.prev.k?HS.prev.l:null;if(!l||!l.length)continue;
  frPub(HS_TOPIC+key,{w:key,l:l.slice(0,HS_N),t:Date.now()},true);}}
function hsConnected(){clearTimeout(HS.conT);HS.conT=setTimeout(()=>{if(HS.cur.l.length)HS.pub[HS.cur.k]=1;if(HS.all.length)HS.pub.all=1;hsFlush();},4000);}
function hsMsg(key,d){if(!HS.ready||hsLocal())return;key=String(key||'');if(!/^(\d{4}-W\d{2}|all)$/.test(key))return;
  const src=d&&Array.isArray(d.l)?hsClean(d.l):[];if(!src.length)return;hsRoll();
  let r;
  if(key==='all'){r=hsMerge(HS.all,src);HS.all=r.list;}
  else if(key===HS.cur.k){r=hsMerge(HS.cur.l,src);HS.cur.l=r.list;}
  else if(key===HS.prev.k){r=hsMerge(HS.prev.l,src);HS.prev.l=r.list;}
  else if(key>HS.cur.k){if(HS.cur.l.length)HS.prev=HS.cur;HS.cur={k:key,l:src.sort(hsSort).slice(0,HS_N)};r={changed:true,extra:false};} // andere Uhr ist schon in der neuen Woche
  else if(key>HS.prev.k){HS.prev={k:key,l:src.sort(hsSort).slice(0,HS_N)};r={changed:true,extra:false};}
  else{if(typeof FR!=='undefined'&&FR.ok)frPub(HS_TOPIC+key,null,true);return;} // uralte Woche: vom Server räumen
  if(r.changed){hsSave();if(openId==='pHigh')hsRender();}
  if(r.extra)hsQueue(key); // wir wissen mehr als der Server -> nachreichen
}
function hsParseEuro(s){const m=/([\d.]+),(\d{2})/.exec(String(s||''));return m?(+m[1].replace(/\./g,''))*100+(+m[2]):0;}

/* ---------- 3D-Tafel ---------- */
const HSW=1024,HSH=448;
function buildHighBoard(F){
  const g=new THREE.Group();g.position.set(1.2,2.55,-11.9);F.group.add(g);
  const dark=new THREE.MeshPhongMaterial({color:0x17171c,shininess:50,specular:0x3a3a44}),gold=lam({color:0xd6a02a,emissive:0x3a2400}),glow=bas({color:0xffc870});
  box(4.64,2.02,.12,dark,0,0,-.04,g);
  box(4.7,.05,.16,gold,0,1.02,-.02,g);box(4.7,.05,.16,gold,0,-1.02,-.02,g);box(.05,2.06,.16,gold,-2.34,0,-.02,g);box(.05,2.06,.16,gold,2.34,0,-.02,g);
  box(4.3,.03,.08,glow,0,1.09,.03,g); // Lichtleiste oben
  const c=document.createElement('canvas');c.width=HSW;c.height=HSH;const ctx=c.getContext('2d');
  const tex=new THREE.CanvasTexture(c);tex.minFilter=THREE.LinearMipmapLinearFilter;tex.magFilter=THREE.LinearFilter;tex.generateMipmaps=true;tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  mesh(new THREE.PlaneGeometry(4.4,4.4*HSH/HSW),bas({map:tex}),0,0,.025,g);
  const sc=document.createElement('canvas');sc.width=HSW;sc.height=HSH;
  const led=document.createElement('canvas');led.width=led.height=3;const lc=led.getContext('2d');lc.fillStyle='rgba(0,0,0,.62)';lc.fillRect(2,0,1,3);lc.fillRect(0,2,3,1);
  HS.board={g,tex,ctx,sc,sctx:sc.getContext('2d'),pat:ctx.createPattern(led,'repeat'),x:1.2,z:-11.9};
  const act={type:'board',label:'HIGHSCORE-TAFEL',sub:'Gewinne der Woche ansehen',pos:new THREE.Vector3(1.2,1.4,-11.2),reach:3.4};tagAct(F,g,act);
  pointLight(F,0xffb040,1.2,2.4,-10.6,.6,5);
  HS.dirtyStatic=true;
}
function hsRowStrings(e,i){if(!e)return [String(i+1),'','','',''];return [String(i+1),e.n,e.g,hsWhen(e.t),fmt(e.a)];}
function hsFit(c,t,x,y,w,align){const mw=c.measureText(t).width;c.textAlign=align;if(mw<=w){c.fillText(t,x,y);return;}c.save();c.translate(x,y);c.scale(w/mw,1);c.fillText(t,0,0);c.restore();}
const HS_ALPHA='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',HS_DIG='0123456789';
// Buchstaben klappern wie bei einer Fallblattanzeige: erst Zufall, dann von links nach rechts das Ziel
function hsShown(target,col,t0){if(t0===undefined)return target;let out='';const alpha=col===4?HS_DIG:HS_ALPHA;
  for(let i=0;i<target.length;i++){const ch=target[i],settle=t0+.1+col*.07+i*.03;if(now<settle&&/[A-Z0-9ÄÖÜ]/i.test(ch))out+=alpha[Math.floor(Math.random()*alpha.length)];else out+=ch;}return out;}
function hsFlipDone(i){const t0=HS.flip[i];if(t0===undefined)return true;const len=Math.max(...HS.target[i].map(s=>s.length));return now>t0+.1+4*.07+len*.03+.05;}
function hsDrawStatic(){
  const B=HS.board,c=B.sctx,AMB='#ffb300',DIM='#9a7418';
  c.setTransform(1,0,0,1,0,0);c.fillStyle='#06050a';c.fillRect(0,0,HSW,HSH);
  const vg=c.createRadialGradient(HSW/2,HSH*.4,60,HSW/2,HSH*.4,HSW*.7);vg.addColorStop(0,'rgba(60,40,10,.35)');vg.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=vg;c.fillRect(0,0,HSW,HSH);
  c.textBaseline='middle';
  c.font='700 40px '+SCR_FONT;c.fillStyle='#f4efe4';c.textAlign='left';c.shadowColor='rgba(255,230,160,.5)';c.shadowBlur=10;c.fillText('GEWINNE DER WOCHE',28,34);c.shadowBlur=0;
  c.fillStyle=AMB;c.textAlign='center';c.fillText(hsKw(HS.cur.k),600,34);
  c.fillStyle='rgba(255,179,0,.35)';c.fillRect(20,62,984,2);c.fillRect(20,98,984,1);
  c.font='700 22px '+SCR_FONT;c.fillStyle=DIM;c.textAlign='right';c.fillText('#',60,82);c.textAlign='left';c.fillText('SPIELER',84,82);c.fillText('SPIEL',430,82);c.fillText('ZEIT',724,82);c.textAlign='right';c.fillText('GEWINN',998,82);
  // Zeilen (Top 6), mit Klapp-Animation bei Änderung
  for(let i=0;i<HS_ROWS;i++){const e=HS.cur.l[i],tg=hsRowStrings(e,i),key=tg.join('|');
    if(!HS.target[i]||HS.target[i].join('|')!==key){HS.target[i]=tg;if(HS.disp[i]!==undefined)HS.flip[i]=now;HS.disp[i]=key;}
    const t0=HS.flip[i],y=104+i*48+24,top=i===0&&e;
    if(i%2){c.fillStyle='rgba(255,179,0,.045)';c.fillRect(20,y-24,984,48);}
    c.font='700 34px '+SCR_FONT;
    if(!e){c.fillStyle='rgba(154,116,24,.45)';c.textAlign='right';c.fillText(tg[0]+'.',60,y);c.textAlign='left';c.fillText('· · ·',84,y);continue;}
    c.fillStyle=top?'#ffe27a':AMB;if(top){c.shadowColor='rgba(255,210,80,.55)';c.shadowBlur=8;}
    c.textAlign='right';c.fillText(hsShown(tg[0],0,t0)+'.',60,y);
    hsFit(c,hsShown(tg[1],1,t0),84,y,330,'left');hsFit(c,hsShown(tg[2],2,t0),430,y,280,'left');
    c.fillStyle=top?'#ffe27a':'#e0a428';hsFit(c,hsShown(tg[3],3,t0),724,y,150,'left');
    c.fillStyle=top?'#fff0b0':'#ffc93a';c.font='800 36px '+SCR_FONT;hsFit(c,hsShown(tg[4],4,t0),998,y,200,'right');c.shadowBlur=0;}
  c.fillStyle='rgba(255,179,0,.35)';c.fillRect(20,393,984,1);
  // Laufschrift-Text
  const best=HS.prev.l[0],rec=HS.all[0],parts=[];
  if(best)parts.push('LETZTE WOCHE ('+hsKw(HS.prev.k)+'): '+best.n+' · '+best.g+' · '+fmt(best.a));
  if(rec)parts.push('REKORD: '+rec.n+' · '+rec.g+' · '+fmt(rec.a)+' ('+hsWhen(rec.t,true)+')');
  parts.push(HS.cur.l.length?HS.cur.l.length+' GEWINNE DIESE WOCHE AUF DER TAFEL':'NOCH KEIN GEWINN DIESE WOCHE – DER ERSTE GEHÖRT DIR');
  parts.push('WILLKOMMEN IN DER SJ SPIELBANK · VIEL GLÜCK');
  const txt=parts.join('     ◆     ')+'     ◆     ';c.font='700 30px '+SCR_FONT;HS.tickTxt=txt;HS.tickW=Math.ceil(c.measureText(txt).width);
  HS.dirtyStatic=!HS.flip.every((t,i)=>hsFlipDone(i));
}
function hsDraw(){
  const B=HS.board;if(!B)return;if(HS.dirtyStatic)hsDrawStatic();
  const c=B.ctx;c.setTransform(1,0,0,1,0,0);c.drawImage(B.sc,0,0);
  // Uhr (Doppelpunkt blinkt)
  const d=new Date();c.font='700 40px '+SCR_FONT;c.textBaseline='middle';c.textAlign='right';c.fillStyle='#ffb300';c.fillText(hsPad(d.getHours())+(d.getSeconds()%2?':':' ')+hsPad(d.getMinutes()),996,34);
  // Laufschrift
  c.fillStyle='#0b0910';c.fillRect(0,396,HSW,HSH-396);c.font='700 30px '+SCR_FONT;c.fillStyle='#ffb300';c.textAlign='left';
  const span=HS.tickW||HSW,x=HSW-((HS.tick*90)%(span+HSW));c.fillText(HS.tickTxt,x,422);if(x+span<HSW)c.fillText(HS.tickTxt,x+span,422);
  // LED-Raster und Glasglanz
  c.fillStyle=B.pat;c.fillRect(0,0,HSW,HSH);const gl=c.createLinearGradient(0,0,HSW,HSH);gl.addColorStop(0,'rgba(255,255,255,.05)');gl.addColorStop(.5,'rgba(255,255,255,0)');gl.addColorStop(1,'rgba(255,255,255,.03)');c.fillStyle=gl;c.fillRect(0,0,HSW,HSH);
  B.tex.needsUpdate=true;HS.lastDraw=now;HS.lastMin=d.getMinutes();
}
function hsStep(dt){
  if(!HS.ready)hsLoad();const B=HS.board;if(!B)return;
  if((HS.rollT=(HS.rollT||0)+dt)>30){HS.rollT=0;hsRoll();}
  const onEG=typeof floorIdx!=='undefined'&&floorIdx===0,dist=onEG?Math.hypot(P.x-B.x,P.z-B.z):99;
  HS.active=onEG&&dist<22&&started&&!openId;
  const flipping=HS.flip.some((t,i)=>t!==undefined&&!hsFlipDone(i));
  if(flipping){HS.dirtyStatic=true;if(dist<9&&now-HS.sfxT>.045){HS.sfxT=now;if(typeof noise==='function')noise(.014,.04,2400+Math.random()*900);}}
  if(HS.active)HS.tick+=dt;
  const due=flipping?now-HS.lastDraw>1/20:HS.active?now-HS.lastDraw>1/12:(HS.dirtyStatic||new Date().getMinutes()!==HS.lastMin);
  if(due)hsDraw();
}
/* ---------- Panel ---------- */
function hsRender(){
  const mk=(el,list,full)=>{el.innerHTML='';if(!list.length){el.innerHTML='<p class="mps" style="color:var(--dim)">Noch nichts eingetragen.</p>';return;}
    list.forEach((e,i)=>{const row=document.createElement('div');row.className='hs-row'+(i===0?' top':'');
      const r=document.createElement('span');r.className='hs-r';r.textContent=(i+1)+'.';const n=document.createElement('b');n.textContent=e.n;
      const g=document.createElement('span');g.className='hs-g';g.textContent=e.g+' · '+hsWhen(e.t,full)+(e.b?' · Einsatz '+fmt(e.b):'');const a=document.createElement('span');a.className='hs-a';a.textContent=fmt(e.a);
      row.append(r,n,a,g);el.appendChild(row);});};
  hsRoll();$('#hsWeekLbl').textContent='DIESE WOCHE · '+hsKw(HS.cur.k);mk($('#hsWeek'),HS.cur.l,false);
  $('#hsPrevLbl').textContent='LETZTE WOCHE'+(HS.prev.k?' · '+hsKw(HS.prev.k):'');mk($('#hsPrev'),HS.prev.l,false);mk($('#hsAll'),HS.all,true);
}
