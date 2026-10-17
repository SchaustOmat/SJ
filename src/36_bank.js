/* =========================================================
   KELLERBANK: Geldautomat im EG und im 2. Stock
   - Portemonnaie antippen -> öffnet sich -> Karte antippen -> Karte geht in den Automaten -> Konto
   - Einzahlen (Chips -> Konto), Abheben (Konto -> Chips), Senden an Mitspieler im selben Raum
   - Überweisungen laufen über die Presence: Sender zeigt {tx}, Empfänger bucht einmal gut und bestätigt mit {ack}
   ========================================================= */
var BANK=(function(){
  const rd=(k,d)=>{try{const v=localStorage.getItem(k);return v===null?d:JSON.parse(v);}catch(e){return d;}};
  let konto=rd('nk_konto',null);
  if(typeof konto!=='string'||!/^\d{4} \d{4}$/.test(konto)){konto=String(1000+(Math.random()*9000|0))+' '+String(Math.random()*1e4|0).padStart(4,'0');try{localStorage.setItem('nk_konto',JSON.stringify(konto));}catch(e){}}
  const bal=+rd('nk_bank',0);
  return {konto,bal:isFinite(bal)&&bal>0?Math.round(bal):0,hist:rd('nk_bankhist',[]),pend:rd('nk_bankpend',[]),done:rd('nk_bankdone',[]),ack:[]};
})();
if(!Array.isArray(BANK.hist))BANK.hist=[];if(!Array.isArray(BANK.pend))BANK.pend=[];if(!Array.isArray(BANK.done))BANK.done=[];
function bankSave(){
  store('nk_bank',BANK.bal);
  try{localStorage.setItem('nk_bankhist',JSON.stringify(BANK.hist.slice(0,20)));localStorage.setItem('nk_bankpend',JSON.stringify(BANK.pend));localStorage.setItem('nk_bankdone',JSON.stringify(BANK.done.slice(-60)));}catch(e){}
  bankPresence();saveChanged();
}
function bankLog(d,a){BANK.hist.unshift({t:Date.now(),d:cleanText(d,30),a:Math.round(a)});if(BANK.hist.length>20)BANK.hist.length=20;}
function bankPendSum(){return BANK.pend.reduce((s,p)=>s+p.a,0);}
function bankPresence(){
  if(typeof MP==='undefined')return;
  MP.me.kn=BANK.konto;MP.me.tx=BANK.pend.slice(0,5).map(p=>({i:p.i,to:p.to,a:p.a}));MP.me.ack=BANK.ack.slice(-12);MP.dirty=true;
}
// pro Mitspieler aus der Presence: Überweisungen an mich gutschreiben, Bestätigungen für meine Überweisungen lesen
function bankPeer(a,pr){
  a.kn=typeof pr.kn==='string'&&/^\d{4} \d{4}$/.test(pr.kn)?pr.kn:'';
  let ch=false;
  if(Array.isArray(pr.tx))pr.tx.slice(0,5).forEach(t=>{
    if(!t||typeof t.i!=='string'||t.i.length>24||t.to!==BANK.konto)return;
    const amt=Math.round(+t.a);if(!(amt>0&&amt<=1e9))return;
    if(!BANK.done.includes(t.i)){BANK.done.push(t.i);BANK.bal+=amt;bankLog('VON '+(a.name||'GAST'),amt);ch=true;
      toast(a.name+' hat dir '+fmt(amt)+' aufs Konto geschickt!');SFX.big();if(ATM.open)atmRender();}
    if(!BANK.ack.includes(t.i)){BANK.ack.push(t.i);if(BANK.ack.length>12)BANK.ack.shift();ch=true;}
  });
  if(Array.isArray(pr.ack)&&a.kn){const acks=pr.ack.filter(x=>typeof x==='string');
    for(let i=BANK.pend.length-1;i>=0;i--){const p=BANK.pend[i];if(p.to===a.kn&&acks.includes(p.i)){BANK.pend.splice(i,1);bankLog('AN '+p.n+' ✓',-p.a);toast(fmt(p.a)+' bei '+p.n+' angekommen.');ch=true;if(ATM.open)atmRender();}}}
  if(ch)bankSave();
}
addEventListener('storage',e=>{if(e.key==='nk_bank'&&e.newValue!==null){const v=+e.newValue;if(isFinite(v)&&v>=0){BANK.bal=Math.round(v);if(ATM.open)atmRender();}}});

/* ---------- 3D-Automat ---------- */
function drawAtmScreen(tex,busy){
  const c=tex.userData.ctx;const gr=c.createLinearGradient(0,0,0,96);gr.addColorStop(0,'#0a2a5a');gr.addColorStop(1,'#020a1a');c.fillStyle=gr;c.fillRect(0,0,128,96);
  c.textAlign='center';c.textBaseline='middle';px(c,10);c.fillStyle='#29f0ff';c.fillText('KELLER',64,24);c.fillStyle='#ffcf3a';c.fillText('BANK',64,40);
  px(c,6);c.fillStyle=busy?'#ff5ab0':'#f4f0e8';c.fillText(busy?'IN BENUTZUNG':'KARTE EINFÜHREN',64,68);
  c.fillStyle='#3adf5a';c.fillRect(44,80,40,3);tex.needsUpdate=true;
}
const ATMS=[];
function buildATM(F,x,z,rotY){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rotY;F.group.add(g);
  const body=lam({map:T.metal,color:0x5a6070}),dark=lam({color:0x0c0c12}),blue=bas({color:0x1a5adf}),steel=lam({map:T.metal,color:0xb8bcc8});
  box(.8,1.95,.55,body,0,.975,0,g);
  box(.84,.08,.6,steel,0,1.99,0,g);
  const sign=labelTex(128,24,(c,w,h)=>{c.fillStyle='#0a1a3a';c.fillRect(0,0,w,h);px(c,9);c.textAlign='center';c.textBaseline='middle';c.fillStyle='#29f0ff';c.fillText('GELDAUTOMAT',w/2,h/2+1);});
  mesh(new THREE.PlaneGeometry(.74,.14),bas({map:sign}),0,1.86,.281,g);
  box(.66,.5,.06,dark,0,1.42,.27,g);
  const scr=labelTex(128,96,null);drawAtmScreen(scr,false);
  const sm=mesh(new THREE.PlaneGeometry(.56,.42),bas({map:scr}),0,1.42,.305,g);sm.rotation.x=-.08;
  // Kartenschlitz mit grünem Licht
  box(.22,.05,.05,dark,.2,1.1,.3,g);box(.16,.012,.02,bas({color:0x3adf5a}),.2,1.1,.33,g);
  // Ablage + Tastenfeld
  const shelf=box(.7,.04,.22,steel,0,1.0,.36,g);shelf.rotation.x=.25;
  for(let r=0;r<4;r++)for(let k=0;k<3;k++){const b=box(.05,.02,.04,r===3&&k===2?bas({color:0x3adf5a}):r===3&&k===0?bas({color:0xff3a3a}):lam({color:0xd0d0d8}),-.17+k*.07,1.03-r*.012,.3+r*.045,g);b.rotation.x=.25;}
  box(.3,.05,.05,dark,0,.75,.3,g); // Geldausgabe
  box(.82,.03,.57,blue,0,.4,0,g);
  const fx=Math.sin(rotY),fz=Math.cos(rotY);
  const act={type:'atm',label:'GELDAUTOMAT',sub:'Konto: einzahlen, abheben, senden',pos:new THREE.Vector3(x+fx*.75,1.2,z+fz*.75),reach:2};
  g.traverse(o=>{if(o.isMesh){o.userData.act=act;F.hits.push(o);}});F.acts.push(act);
  const ax=Math.abs(fx)>.5;col(F,x,z,ax?.6:.85,ax?.85:.6);
  ATMS.push({scr,busy:false});
}

/* ---------- Bildschirm: Portemonnaie, Karte, Konto ---------- */
const ATM={open:false,step:'wallet',amt:'',mode:'',to:null,msg:''};
const atmEl=id=>document.getElementById(id);
function atmOpen(){
  ATM.step='wallet';ATM.amt='';ATM.mode='';ATM.to=null;ATM.msg='';ATM.open=true;
  ATMS.forEach(a=>drawAtmScreen(a.scr,true));
  openPanel('pAtm');atmRender();
}
function atmClosed(){if(!ATM.open)return;ATM.open=false;ATMS.forEach(a=>drawAtmScreen(a.scr,false));}
function atmSay(t,cls){ATM.msg=t;ATM.msgCls=cls||'';}
function cardHtml(){
  return '<div class="bcard" id="atmCard"><div class="bc-bank">KELLERBANK</div><div class="bc-chip"></div><div class="bc-num">'+esc(BANK.konto.replace(' ','  '))+'</div>'+
    '<div class="bc-name">'+esc((MP.name||'GAST').toUpperCase())+'</div><div class="bc-logo"><i></i><i></i></div></div>';
}
function atmRender(){
  const scr=atmEl('atmScr'),stage=atmEl('atmStage');if(!scr||!stage)return;
  const s=ATM.step;
  if(s==='wallet'||s==='open'||s==='insert'){
    scr.innerHTML='<div class="as-logo">KELLER<b>BANK</b></div><div class="as-mid blink">'+(s==='insert'?'KARTE WIRD EINGEZOGEN…':'BITTE KARTE EINFÜHREN')+'</div>';
    if(!stage.querySelector('.wallet'))stage.innerHTML='<div class="wallet" id="atmWallet"><div class="w-back"></div>'+cardHtml()+'<div class="w-flap"><span>◆</span></div></div><p class="atm-hint" id="atmHint"></p>';
    const w=atmEl('atmWallet');w.classList.toggle('open',s!=='wallet');
    atmEl('atmHint').textContent=s==='wallet'?'Portemonnaie antippen':s==='open'?'Karte antippen':'';
    return;
  }
  stage.innerHTML='';
  if(s==='load'){scr.innerHTML='<div class="as-logo">KELLER<b>BANK</b></div><div class="as-mid">KARTE WIRD GELESEN</div><div class="as-bar"><i></i></div>';return;}
  const head='<div class="as-top"><span>KELLER<b>BANK</b></span><span>KTO '+esc(BANK.konto)+'</span></div>';
  const msg=ATM.msg?'<div class="as-msg '+(ATM.msgCls||'')+'">'+esc(ATM.msg)+'</div>':'';
  if(s==='menu'){
    const pend=BANK.pend.length?'<div class="as-pend">'+BANK.pend.map((p,i)=>'<div>UNTERWEGS AN '+esc(p.n)+': <b>'+fmt(p.a)+'</b> <button class="as-link" data-undo="'+i+'">ZURÜCKHOLEN</button></div>').join('')+'</div>':'';
    scr.innerHTML=head+'<div class="as-row"><span>INHABER</span><b>'+esc((MP.name||'GAST').toUpperCase())+'</b></div>'+
      '<div class="as-row big"><span>KONTOSTAND</span><b>'+fmt(BANK.bal)+'</b></div>'+
      '<div class="as-row"><span>BARGELD (CHIPS)</span><b>'+fmt(chips)+'</b></div>'+pend+msg+
      '<div class="as-grid"><button class="as-btn" data-go="dep">EINZAHLEN</button><button class="as-btn" data-go="wd">ABHEBEN</button>'+
      '<button class="as-btn" data-go="send">SENDEN</button><button class="as-btn" data-go="hist">KONTOAUSZUG</button></div>';
    return;
  }
  if(s==='hist'){
    const rows=BANK.hist.slice(0,10).map(h=>{const d=new Date(h.t);return '<div class="as-h"><span>'+String(d.getDate()).padStart(2,'0')+'.'+String(d.getMonth()+1).padStart(2,'0')+' '+esc(h.d)+'</span><b class="'+(h.a<0?'neg':'pos')+'">'+(h.a>0?'+':'')+fmt(h.a)+'</b></div>';}).join('')||'<div class="as-mid">NOCH KEINE BUCHUNGEN</div>';
    scr.innerHTML=head+'<div class="as-title">KONTOAUSZUG</div>'+rows+'<div class="as-grid one"><button class="as-btn" data-go="menu">ZURÜCK</button></div>';return;
  }
  if(s==='send'){
    const list=[];MP.avatars.forEach(a=>{if(a.kn)list.push(a);});
    scr.innerHTML=head+'<div class="as-title">AN WEN SENDEN?</div>'+
      (list.length?list.map((a,i)=>'<button class="as-btn wide" data-to="'+i+'">'+esc(a.name)+' <small>KTO '+esc(a.kn)+'</small></button>').join(''):
        '<div class="as-mid">KEIN MITSPIELER ONLINE.<br>'+(MP.room?'WARTE BIS JEMAND IM RAUM IST.':'ERST OBEN ÜBER MULTI IN EINEN RAUM.')+'</div>')+
      '<div class="as-grid one"><button class="as-btn" data-go="menu">ZURÜCK</button></div>';
    ATM.list=list;return;
  }
  // Betrag eingeben: dep / wd / sendAmt
  const t={dep:'EINZAHLEN · CHIPS → KONTO',wd:'ABHEBEN · KONTO → CHIPS',sendAmt:'SENDEN AN '+(ATM.to?ATM.to.name:'')}[s];
  const max=s==='dep'?chips:BANK.bal;
  scr.innerHTML=head+'<div class="as-title">'+esc(t)+'</div><div class="as-row"><span>VERFÜGBAR</span><b>'+fmt(max)+'</b></div>'+
    '<div class="as-amt">'+(ATM.amt?fmt(+ATM.amt):'0')+'</div>'+msg+
    '<div class="as-quick"><button class="as-btn" data-add="1000">+1.000</button><button class="as-btn" data-add="10000">+10.000</button><button class="as-btn" data-add="100000">+100.000</button><button class="as-btn" data-all="1">ALLES</button></div>'+
    '<div class="as-keys">'+['1','2','3','4','5','6','7','8','9','C','0','000'].map(k=>'<button class="as-key'+(k==='C'?' red':'')+'" data-k="'+k+'">'+k+'</button>').join('')+'</div>'+
    '<div class="as-grid"><button class="as-btn" data-go="menu">ABBRUCH</button><button class="as-btn ok" data-ok="1">BESTÄTIGEN</button></div>';
}
function atmBook(){
  const a=Math.floor(+ATM.amt||0),s=ATM.step;
  if(!(a>0)){atmSay('BITTE BETRAG EINGEBEN','err');atmRender();return;}
  if(s==='dep'){if(a>chips){atmSay('SO VIEL BARGELD HAST DU NICHT','err');atmRender();return;}
    setChips(chips-a,true);BANK.bal+=a;bankLog('EINZAHLUNG',a);SFX.chip();atmSay('EINGEZAHLT: '+fmt(a),'ok');}
  else if(s==='wd'){if(a>BANK.bal){atmSay('KONTO NICHT GEDECKT','err');atmRender();return;}
    BANK.bal-=a;setChips(chips+a,true);bankLog('AUSZAHLUNG',-a);SFX.chip();atmSay('AUSGEZAHLT: '+fmt(a)+' · CHIPS ENTNEHMEN','ok');}
  else if(s==='sendAmt'){const to=ATM.to;if(!to||!to.kn){ATM.step='send';atmRender();return;}
    if(a>BANK.bal){atmSay('KONTO NICHT GEDECKT','err');atmRender();return;}
    BANK.bal-=a;BANK.pend.push({i:Date.now().toString(36)+Math.random().toString(36).slice(2,7),to:to.kn,n:cleanText(to.name,14),a,t:Date.now()});
    SFX.big();atmSay(fmt(a)+' AN '+to.name+' GESENDET · WARTE AUF BESTÄTIGUNG','ok');mpWin('schickt '+to.name+' '+fmt(a)+' Chips.');}
  bankSave();ATM.amt='';ATM.step='menu';atmRender();
}
document.addEventListener('click',e=>{
  if(!ATM.open)return;const t=e.target.closest('#pAtm [data-go],#pAtm [data-k],#pAtm [data-add],#pAtm [data-all],#pAtm [data-ok],#pAtm [data-to],#pAtm [data-undo],#atmWallet');if(!t)return;
  if(t.id==='atmWallet'){
    if(ATM.step==='wallet'){ATM.step='open';SFX.click();atmRender();}
    else if(ATM.step==='open'&&e.target.closest('#atmCard')){ATM.step='insert';SFX.card();atmRender();const c=atmEl('atmCard');c.classList.add('in');
      setTimeout(()=>{if(!ATM.open)return;SFX.clunk();ATM.step='load';atmRender();setTimeout(()=>{if(!ATM.open)return;SFX.ding();ATM.step='menu';atmSay('');atmRender();},1300);},850);}
    return;
  }
  SFX.tick();
  if(t.dataset.go){ATM.step=t.dataset.go;ATM.amt='';atmSay('');}
  else if(t.dataset.k){const k=t.dataset.k;if(k==='C')ATM.amt='';else if((ATM.amt+k).length<=10)ATM.amt=String(+(ATM.amt+k)||'');atmSay('');}
  else if(t.dataset.add){ATM.amt=String(Math.min(1e10,(+ATM.amt||0)+ +t.dataset.add));atmSay('');}
  else if(t.dataset.all){ATM.amt=String(ATM.step==='dep'?chips:BANK.bal);atmSay('');}
  else if(t.dataset.to){const a=ATM.list&&ATM.list[+t.dataset.to];if(a){ATM.to={name:a.name,kn:a.kn};ATM.step='sendAmt';ATM.amt='';atmSay('');}}
  else if(t.dataset.undo){const p=BANK.pend[+t.dataset.undo];if(p){BANK.pend.splice(+t.dataset.undo,1);BANK.bal+=p.a;bankSave();atmSay(fmt(p.a)+' ZURÜCKGEHOLT','ok');}}
  else if(t.dataset.ok){atmBook();return;}
  atmRender();
});
bankPresence();
