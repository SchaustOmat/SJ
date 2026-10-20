/* =========================================================
   FREUNDE: Freundescode = deine Kontonummer (steht auch am Geldautomaten).
   - Freund hinzufügen: Code eintippen -> Anfrage. Der andere nimmt an -> ihr seid Freunde.
   - Liste zeigt, wer online ist und in welchem Raum. BEITRETEN = direkt in seinen Raum.
   - EINLADEN: öffnet (falls nötig) einen Raum und schickt dem Freund eine Einladung mit Beitreten-Knopf.
   Läuft über dieselben öffentlichen MQTT-Server wie der Multiplayer (gleichzeitig auf zwei Servern, damit man sich sicher findet).
   Themen: sinanskeller/u/<id> (Status, gemerkt), /fq/<an>/<von> (Anfrage/Antwort, gemerkt), /fi/<an> (Einladung).
   ========================================================= */
const FR={clis:[],ok:false,list:[],st:{},req:{},inv:null,lastKey:'',lastPub:0,started:false};
const frId=k=>String(k||'').replace(/\D/g,'').slice(0,8);
const frFmt=id=>id.slice(0,4)+' '+id.slice(4);
function frLoad(){try{const l=JSON.parse(localStorage.getItem('nk_friends')||'[]');FR.list=Array.isArray(l)?l.filter(f=>f&&/^\d{8}$/.test(f.id)).slice(0,60).map(f=>({id:f.id,n:cleanText(f.n,14)||'GAST',p:!!f.p})):[];}catch(e){FR.list=[];}}
function frSave(){try{localStorage.setItem('nk_friends',JSON.stringify(FR.list));}catch(e){}}
function frMe(){return frId(BANK.konto);}
function frFind(id){return FR.list.find(f=>f.id===id);}
function frPub(topic,obj,retain){const s=obj===null?'':JSON.stringify(obj);FR.clis.forEach(c=>{if(c.ok)try{c.cli.publish(topic,s,{qos:0,retain:!!retain});}catch(e){}});}
function frSub(topic){FR.clis.forEach(c=>{if(c.ok)try{c.cli.subscribe(topic,{qos:0});}catch(e){}});}
function frStatus(){return {n:MP.name||'GAST',r:NET.ok?NET.code:'',b:NET.ok?NET.bi%BROKERS.length:-1,f:floorIdx,t:Date.now(),on:1};}
const frB=v=>Number.isInteger(+v)&&+v>=0&&+v<BROKERS.length?+v:undefined;
function frStart(){
  if(FR.started||!STANDALONE||typeof mqtt==='undefined')return;FR.started=true;frLoad();
  const me=frMe();
  BROKERS.slice(0,2).forEach(url=>{
    const C={cli:null,ok:false};FR.clis.push(C);let cli;
    try{cli=mqtt.connect(url,{clientId:'skf_'+me+'_'+Math.random().toString(36).slice(2,6),clean:true,connectTimeout:8000,reconnectPeriod:5000,keepalive:30,
      will:{topic:'sinanskeller/u/'+me,payload:JSON.stringify({n:MP.name||'GAST',on:0,t:Date.now()}),qos:0,retain:true}});}catch(e){return;}
    C.cli=cli;
    cli.on('connect',()=>{C.ok=true;FR.ok=true;
      cli.subscribe('sinanskeller/fq/'+me+'/+',{qos:0});cli.subscribe('sinanskeller/fi/'+me,{qos:0});
      FR.list.forEach(f=>cli.subscribe('sinanskeller/u/'+f.id,{qos:0}));
      FR.lastKey='';frTick();frRender();});
    cli.on('close',()=>{C.ok=false;FR.ok=FR.clis.some(x=>x.ok);});
    cli.on('error',()=>{});
    cli.on('message',(topic,buf)=>frMsg(topic,buf.toString()));
  });
  setInterval(frTick,2000);
  addEventListener('pagehide',()=>{frPub('sinanskeller/u/'+frMe(),{n:MP.name||'GAST',on:0,t:Date.now()},true);});
}
// eigenen Status senden, wenn sich etwas ändert (Raum, Name, Etage) und sonst alle 30 s
function frTick(){if(!FR.ok)return;const s=frStatus(),k=s.n+'|'+s.r+'|'+s.b+'|'+s.f,t=Date.now();
  if(k!==FR.lastKey||t-FR.lastPub>30000){FR.lastKey=k;FR.lastPub=t;frPub('sinanskeller/u/'+frMe(),s,true);}
  if(FR.inv&&t-FR.inv.t>90000){FR.inv=null;frInvShow();}
  if(openId==='pFriends')frRender();frBadge();}
function frMsg(topic,txt){
  const p=topic.split('/'),me=frMe();let d=null;if(txt){try{d=JSON.parse(txt);}catch(e){return;}if(!d||typeof d!=='object')return;}
  if(p[1]==='u'&&/^\d{8}$/.test(p[2]||'')){const f=frFind(p[2]);if(!f)return;
    if(!d){delete FR.st[p[2]];}else{const prev=FR.st[p[2]],cur={n:cleanText(d.n,14)||f.n,r:/^\d{4}$/.test(d.r||'')?d.r:'',b:frB(d.b),f:+d.f===1?1:0,t:Math.min(+d.t||0,Date.now()),on:d.on?1:0};
      if(cur.t&&(!prev||cur.t>=prev.t)){const was=frOnline(prev);FR.st[p[2]]=cur;if(cur.n&&cur.n!=='GAST'&&cur.n!==f.n){f.n=cur.n;frSave();}
        if(!was&&frOnline(cur)&&started)toast(f.n+' ist jetzt online'+(cur.r?' · Raum '+cur.r:'')+'.');}}
    frRender();return;}
  if(p[1]==='fq'&&p[2]===me&&/^\d{8}$/.test(p[3]||'')){const from=p[3];
    if(!d){delete FR.req[from];frRender();frBadge();return;}
    const n=cleanText(d.n,14)||'GAST',f=frFind(from);
    if(d.ok){if(f){f.p=false;f.n=n;frSave();toast(n+' hat deine Freundschaft angenommen.');SFX.chip();}frPub(topic,null,true);frSub('sinanskeller/u/'+from);}
    else if(d.no){if(f&&f.p){FR.list=FR.list.filter(x=>x.id!==from);frSave();toast(n+' hat abgelehnt.');}frPub(topic,null,true);}
    else if(f&&!f.p){frPub('sinanskeller/fq/'+from+'/'+me,{n:MP.name||'GAST',ok:1,t:Date.now()},true);frPub(topic,null,true);} // schon Freunde: gleich bestätigen
    else{FR.req[from]={n,t:Math.min(+d.t||Date.now(),Date.now())};if(started){toast(n+' möchte dein Freund sein. Unter FREUNDE annehmen.');SFX.chip();}}
    frRender();frBadge();return;}
  if(p[1]==='fi'&&p[2]===me&&d){const from=frId(d.from),c=String(d.c||'');if(!/^\d{8}$/.test(from)||!/^\d{4}$/.test(c)||!frFind(from))return;
    FR.inv={from,n:cleanText(d.n,14)||frFind(from).n,c,b:frB(d.b),t:Date.now()};SFX.fsIntro&&SFX.chip();frInvShow();frBadge();}
}
function frOnline(s){return !!(s&&s.on&&Date.now()-s.t<95000);}
function frAdd(code){const id=frId(code),me=frMe();
  if(!/^\d{8}$/.test(id)){frMsgOut('Der Code hat 8 Ziffern (z. B. 1234 5678).');return;}
  if(id===me){frMsgOut('Das ist dein eigener Code.');return;}
  if(frFind(id)){frMsgOut('Ist schon in deiner Liste.');return;}
  if(FR.req[id]){frAccept(id);return;}
  FR.list.push({id,n:'CODE '+frFmt(id),p:true});frSave();frSub('sinanskeller/u/'+id);
  frPub('sinanskeller/fq/'+id+'/'+me,{n:MP.name||'GAST',t:Date.now()},true);frMsgOut('Anfrage an '+frFmt(id)+' geschickt. Sobald er annimmt, seid ihr Freunde.');SFX.chip();frRender();}
function frAccept(id){const r=FR.req[id];if(!r)return;delete FR.req[id];const me=frMe();
  if(!frFind(id))FR.list.push({id,n:r.n,p:false});else frFind(id).p=false;frSave();frSub('sinanskeller/u/'+id);
  frPub('sinanskeller/fq/'+me+'/'+id,null,true);frPub('sinanskeller/fq/'+id+'/'+me,{n:MP.name||'GAST',ok:1,t:Date.now()},true);
  toast(r.n+' ist jetzt dein Freund.');SFX.chip();frRender();frBadge();}
function frDecline(id){delete FR.req[id];const me=frMe();frPub('sinanskeller/fq/'+me+'/'+id,null,true);frPub('sinanskeller/fq/'+id+'/'+me,{n:MP.name||'GAST',no:1,t:Date.now()},true);frRender();frBadge();}
function frRemove(id){FR.list=FR.list.filter(f=>f.id!==id);delete FR.st[id];frSave();FR.clis.forEach(c=>{if(c.ok)try{c.cli.unsubscribe('sinanskeller/u/'+id);}catch(e){}});frRender();}
// Freund in seinen Raum folgen
function frJoin(id){const s=FR.st[id];if(!frOnline(s)||!s.r){toast('Dein Freund ist gerade in keinem Raum.');return;}
  if(NET.ok&&NET.code===s.r){toast('Ihr seid schon im selben Raum.');return;}
  closePanel();toast('Du gehst zu '+(frFind(id)||{}).n+' in Raum '+s.r+'…');netStart(false,s.r,s.b);}
// Freund einladen: eigenen Raum öffnen (falls nötig), dann Einladung schicken
function frInvite(id){const f=frFind(id);if(!f)return;const send=()=>{frPub('sinanskeller/fi/'+id,{from:frMe(),n:MP.name||'GAST',c:NET.code,b:NET.bi%BROKERS.length,t:Date.now()},false);toast('Einladung an '+f.n+' geschickt (Raum '+NET.code+').');SFX.chip();};
  if(NET.ok){send();return;}
  netStart(true,String(1000+(Math.random()*9000|0)));toast('Raum wird geöffnet…');let n=0;const iv=setInterval(()=>{n++;if(NET.ok){clearInterval(iv);send();frRender();}else if(n>30){clearInterval(iv);toast('Raum konnte nicht geöffnet werden.');}},500);}
// Einladung oben einblenden
function frInvShow(){let el=$('#frInv');if(!el){el=document.createElement('div');el.id='frInv';($('#app')||document.body).appendChild(el);}
  const I=FR.inv;if(!I){el.hidden=true;return;}el.hidden=false;el.innerHTML='';
  const t=document.createElement('span');t.textContent=I.n+' lädt dich ein · Raum '+I.c;
  const go=document.createElement('button');go.className='btn gold';go.textContent='BEITRETEN';go.addEventListener('click',()=>{SFX.click();const c=I.c,b=I.b;FR.inv=null;frInvShow();frBadge();if(openId)closePanel();netStart(false,c,b);});
  const no=document.createElement('button');no.className='btn';no.textContent='✕';no.addEventListener('click',()=>{SFX.click();FR.inv=null;frInvShow();frBadge();});
  el.append(t,go,no);}
function frBadge(){const b=$('#friendBtn');if(!b)return;const n=Object.keys(FR.req).length+(FR.inv?1:0);b.classList.toggle('on',n>0);b.dataset.n=n||'';}
function frMsgOut(t){const e=$('#frMsg');if(e)e.textContent=t;}
function frAgo(t){const s=(Date.now()-t)/1000;return s<120?'gerade eben':s<3600?'vor '+Math.round(s/60)+' Min.':s<86400?'vor '+Math.round(s/3600)+' Std.':'vor '+Math.round(s/86400)+' Tagen';}
function frRender(){if(openId!=='pFriends')return;
  $('#frCode').textContent=BANK.konto;$('#frConn').textContent=FR.ok?'':'Verbinde…';
  // Anfragen
  const rq=$('#frReqs');rq.innerHTML='';const ids=Object.keys(FR.req);rq.hidden=!ids.length;$('#frReqLbl').hidden=!ids.length;
  ids.forEach(id=>{const r=FR.req[id],row=document.createElement('div');row.className='fr-row';const a=document.createElement('span');a.textContent=r.n+' · '+frFmt(id);
    const y=document.createElement('button');y.className='btn gold';y.textContent='ANNEHMEN';y.addEventListener('click',()=>{SFX.click();frAccept(id);});
    const n=document.createElement('button');n.className='btn';n.textContent='✕';n.addEventListener('click',()=>{SFX.click();frDecline(id);});row.append(a,y,n);rq.appendChild(row);});
  // Freunde (online zuerst)
  const el=$('#frList');el.innerHTML='';
  const L=FR.list.slice().sort((a,b)=>(frOnline(FR.st[b.id])-frOnline(FR.st[a.id]))||a.n.localeCompare(b.n));
  if(!L.length){el.innerHTML='<p class="mps" style="color:var(--dim)">Noch keine Freunde. Gib unten den Code eines Kollegen ein oder lass ihn deinen eintippen.</p>';}
  L.forEach(f=>{const s=FR.st[f.id],on=frOnline(s),row=document.createElement('div');row.className='fr-row'+(on?' on':'');
    const a=document.createElement('span');const dot=document.createElement('i');dot.className='fr-dot';a.appendChild(dot);
    const nm=document.createElement('b');nm.textContent=f.n;a.appendChild(nm);const sm=document.createElement('small');
    sm.textContent=f.p?'wartet auf Bestätigung':on?(s.r?'online · Raum '+s.r+(NET.ok&&NET.code===s.r?' (bei dir)':''):'online · allein'):(s&&s.t?'offline · '+frAgo(s.t):'offline');a.appendChild(sm);row.appendChild(a);
    if(on&&s.r&&!(NET.ok&&NET.code===s.r)){const j=document.createElement('button');j.className='btn gold';j.textContent='BEITRETEN';j.addEventListener('click',()=>{SFX.click();frJoin(f.id);});row.appendChild(j);}
    if(on&&!f.p&&!(NET.ok&&s.r===NET.code)){const v=document.createElement('button');v.className='btn';v.textContent='EINLADEN';v.addEventListener('click',()=>{SFX.click();frInvite(f.id);});row.appendChild(v);}
    const x=document.createElement('button');x.className='btn fr-x';x.textContent='✕';x.title='Entfernen';x.addEventListener('click',()=>{SFX.click();if(x.dataset.sure){frRemove(f.id);}else{x.dataset.sure=1;x.textContent='SICHER?';setTimeout(()=>{x.dataset.sure='';x.textContent='✕';},2500);}});row.appendChild(x);
    el.appendChild(row);});
  // Leute im selben Raum, die noch keine Freunde sind
  const rm=$('#frRoom');rm.innerHTML='';const others=[];MP.avatars.forEach(a=>{const id=frId(a.kn);if(/^\d{8}$/.test(id)&&id!==frMe()&&!frFind(id))others.push({id,n:a.name||'GAST'});});
  $('#frRoomLbl').hidden=!others.length;others.forEach(o=>{const row=document.createElement('div');row.className='fr-row';const a=document.createElement('span');a.textContent=o.n;
    const b=document.createElement('button');b.className='btn gold';b.textContent='+ FREUND';b.addEventListener('click',()=>{SFX.click();frAdd(o.id);});row.append(a,b);rm.appendChild(row);});
}
if(STANDALONE){
  $('#friendBtn').hidden=false;
  $('#friendBtn').addEventListener('click',()=>{SFX.click();frStart();openPanel('pFriends');frMsgOut('');frRender();});
  $('#frAddBtn').addEventListener('click',()=>{SFX.click();frAdd($('#frAddIn').value);$('#frAddIn').value='';});
  $('#frAddIn').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'){frAdd($('#frAddIn').value);$('#frAddIn').value='';}});
  $('#frCopy').addEventListener('click',()=>{SFX.click();const t=BANK.konto;(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>toast('Code kopiert: '+t)).catch(()=>toast('Dein Code: '+t));});
}
