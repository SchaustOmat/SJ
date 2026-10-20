/* =========================================================
   MULTIPLAYER (room presence: Position, Stockwerk, Chat, Gewinne)
   ========================================================= */
const MP={room:null,avatars:new Map(),me:{},dirty:true,lastSent:0,name:'',seenSay:{},seenWin:{},online:0};
try{MP.name=(localStorage.getItem('nk_name')||'').slice(0,14);}catch(e){}
const AV_COLS=[0xff2e88,0x29f0ff,0xffcf3a,0x6dff8a,0xb07aff,0xff8a1a];
function nameColor(n){let h=0;for(const ch of n)h=(h*31+ch.charCodeAt(0))>>>0;return AV_COLS[h%AV_COLS.length];}
const avG=new THREE.Group();
function cleanText(t,max){let o="";for(const ch of String(t||"")){const c=ch.codePointAt(0);if(c<32||(c>=127&&c<160)||(c>=0x200b&&c<=0x200f)||(c>=0x2028&&c<=0x202e)||(c>=0x2060&&c<=0x206f)||c===0xfeff)continue;o+=ch;}return o.slice(0,max);}
async function mpInit(){
  scene.add(avG);
  if(window.NK_STANDALONE||!window.claude||typeof window.claude.use!=='function'){mpTag();return;}
  let room=null;try{room=await window.claude.use('room');}catch(e){room=null;}
  if(!room){mpTag();return;}
  MP.room=room;$('#chatBtn').hidden=false;
  room.onPeers(ch=>mpSync(ch.peers),()=>{MP.room=null;mpClear();mpTag();});
  room.onConnection(()=>mpTag());
  MP.dirty=true;
}
function mpClear(){MP.avatars.forEach(a=>{releaseMirror(a);avG.remove(a.m.g);if(a.n.bubbleEl)a.n.bubbleEl.remove();});MP.avatars.clear();}
function mpTag(){const t=$('#onlineTag');const n=MP.online;t.hidden=!MP.started;
  if(!MP.room){t.textContent=window.NK_STANDALONE?'MULTI: TIPPEN':'MULTI: AUS';t.classList.remove('live');return;}
  if(window.NK_STANDALONE&&NET.code){t.textContent='RAUM '+NET.code+' · '+(n+1)+' SPIELER';t.classList.toggle('live',n>0);return;}
  const c=MP.room.connected&&MP.room.connected();t.textContent=!c?'MULTI: VERBINDET…':n>0?(n+1)+' ONLINE':'MULTI: ALLEIN';t.classList.toggle('live',n>0);}
// Ein Mitspieler hat zwei Modelle (stehend und sitzend) in einer gemeinsamen Gruppe
function makeAvatar(name,color){
  const g=new THREE.Group();avG.add(g);
  const fake={group:g,cols:[],hits:[],acts:[],npcs:[]};
  const st=npc(fake,{x:0,z:0,noTag:true,noCol:true,anim:'idle',color,hair:0x111111,lines:[]});
  const si=npc(fake,{x:0,z:0,sit:true,noTag:true,noCol:true,anim:'cards',color,hair:0x111111,lines:[]});si.root.visible=false;
  const lab=spriteLabel(192,52,.26);lab.position.set(0,2.15,0);g.add(lab);
  const ring=new THREE.Mesh(new THREE.RingGeometry(.3,.38,10),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.03;g.add(ring);
  return {g,st,si,lab,ring,labelName:''};
}
function avPose(a,sitting){const m=a.m;m.st.root.visible=!sitting;m.si.root.visible=sitting;m.lab.position.y=sitting?1.9:2.15;m.ring.visible=!sitting;
  const want=sitting?m.si:m.st;if(a.n!==want){if(a.n&&a.n.bubbleEl){want.bubbleEl=a.n.bubbleEl;want.bubbleUntil=a.n.bubbleUntil;a.n.bubbleEl=null;}a.n=want;}}
function drawAvLabel(n,name,color,ch,vc){const key=name+'|'+ch+'|'+vc;if(n.labelName===key)return;n.labelName=key;const t=n.lab.userData.tex,c=t.userData.ctx;c.clearRect(0,0,192,52);
  c.fillStyle='rgba(10,6,16,.88)';c.fillRect(0,0,192,52);c.fillStyle='#'+color.toString(16).padStart(6,'0');c.fillRect(0,48,192,4);
  c.textAlign='center';c.textBaseline='middle';px(c,11);c.fillStyle='#f4f0e8';c.fillText((vc===1?'♪ ':'')+name,96,14);
  px(c,11);c.fillStyle='#ffcf3a';c.fillText(ch>=0?fmt(ch)+' ◆':'',96,35);t.needsUpdate=true;}
function mpSync(peers){
  MP.peersAll=peers;const mine=peers.find(p=>p.isMe&&p.sameTab!==false);if(mine)MP.myPeer=mine.peer;
  const seen=new Set();let others=0;
  peers.forEach(p=>{
    if(p.isMe||p.kind!=='viewer')return;
    const pr=p.presence||{};if(typeof pr.x!=='number')return;
    others++;seen.add(p.peer);
    let a=MP.avatars.get(p.peer);
    const name=cleanText(pr.n,14)||'GAST';const color=AV_COLS.includes(pr.c)?pr.c:AV_COLS[0];
    if(!a){const m=makeAvatar(name,color);a={m,n:m.st,tx:pr.x,tz:pr.z,ty:pr.y||0,f:pr.f|0,act:'walk',color};m.g.position.set(pr.x,0,pr.z);MP.avatars.set(p.peer,a);MP.seenSay[p.peer]=pr.st||null;MP.seenWin[p.peer]=pr.wt||null;
      if(MP.started)toast(name+' ist jetzt in der Spielbank.');}
    drawAvLabel(a.m,name,color,typeof pr.k==='number'?Math.max(0,Math.round(pr.k)):-1,pr.vc===1?1:0);a.name=name;
    a.tx=clamp(+pr.x||0,-12,12);a.tz=clamp(+pr.z||0,-14.5,12);a.ty=+pr.y||0;a.f=pr.f===1?1:0;a.act=typeof pr.a==='string'?pr.a:'walk';
    a.rs=Number.isFinite(+pr.rs)?+pr.rs:-1;a.rl=Array.isArray(pr.rl)?pr.rl.map(Number).filter(Number.isFinite).slice(0,40):[];if(pr.rd&&typeof radioRemote==='function')radioRemote(pr.rd);mpApplyActivity(a,pr);bankPeer(a,pr);
    a.ms=Number.isInteger(pr.ms)&&pr.ms>=0&&pr.ms<6?pr.ms:-1;a.mt=typeof pr.mt==='string'&&TABLES[pr.mt]?pr.mt:'';
    const sitting=a.act==='slot'||a.act==='poker'||a.act==='hilo'||a.act==='mtable';avPose(a,sitting);
    a.n.anim=a.act==='slot'?'slot':sitting?'cards':'idle';
    if(pr.st&&pr.st!==MP.seenSay[p.peer]){MP.seenSay[p.peer]=pr.st;const txt=cleanText(pr.s,80);
      if(txt){say(a.n,txt,5);if(a.f!==floorIdx)toast(name+' ('+(a.f?'2. Stock':'EG')+'): '+txt);SFX.click();}}
    if(pr.wt&&pr.wt!==MP.seenWin[p.peer]){MP.seenWin[p.peer]=pr.wt;const w=cleanText(pr.w,60);if(w){toast(name+' '+w);SFX.chip();}}
  });
  MP.avatars.forEach((a,k)=>{if(!seen.has(k)){releaseMirror(a);delete MP.seenSay[k];delete MP.seenWin[k];avG.remove(a.m.g);if(a.n.bubbleEl)a.n.bubbleEl.remove();MP.avatars.delete(k);toast((a.name||'Jemand')+' hat die Spielbank verlassen.');}});
  MP.online=others;mpTag();
}
function mpLocalState(){
  let x=P.x,z=P.z,y=P.yaw+Math.PI,a='walk',ms=-1,mt='';
  if(focus){
    if(focus.type==='slot'){const p=focus.m.group.localToWorld(new THREE.Vector3(0,0,1.0));x=p.x;z=p.z;y=focus.m.group.rotation.y+Math.PI;a='slot';}
    else if(focus.type==='poker'){x=PK.cx;z=PK.cz+2.75;y=Math.PI;a='poker';}
    else if(focus.type==='hilo'){x=HL.cx;z=HL.cz+1.35;y=Math.PI;a='hilo';}
    else if(focus.type==='mtable'){const T=focus.m,si=mtMySeat(T);mt=T.id;if(si>=0){const p=mtSeatPos(T,si,T.R);x=p.x;z=p.z;y=Math.atan2(T.cx-p.x,T.cz-p.z);a='mtable';ms=si;}else{const p=mtSeatPos(T,0,T.R+.9);x=p.x;z=p.z;y=Math.PI;a='mwatch';}}
  } else if(openId==='pRoulette')a='roulette';
  else if(EL.phase==='moving')a='elev';
  return {n:MP.name||'GAST',c:nameColor(MP.name||'GAST'),k:chips+(PK.sitting?PK.human.stack:0)+(MT.deducted&&mtMySeat()>=0?TABLES[MT.table].view.seats[mtMySeat()].st:0),ms,mt,rs:RESV?allMachines().indexOf(RESV):-1,rl:[...RESVS].map(m=>allMachines().indexOf(m)),gx:mpActivity(),f:floorIdx,x:Math.round(x*100)/100,z:Math.round(z*100)/100,y:Math.round(y*100)/100,a};
}
const EXTRA_SEATS={poker:[[-1.3,-1.95],[1.3,-1.95],[-1.95,-.05],[1.95,-.05]],hilo:[[-1.55,.1],[1.55,.1],[-1.3,-.65],[1.3,-.65]]};
function seatAvatars(){
  ['poker','hilo'].forEach(tp=>{
    const T=tp==='poker'?PK:HL;const list=[];MP.avatars.forEach((a,k)=>{if(a.act===tp&&a.f===1)list.push([k,a]);});
    list.sort((x,y)=>x[0]<y[0]?-1:1);
    const meThere=focus&&focus.type===tp;let ei=0;
    list.forEach(([k,a],i)=>{
      let p;if(!meThere&&i===0)p=null;else p=EXTRA_SEATS[tp][Math.min(ei++,3)];
      if(p){a.tx=T.cx+p[0];a.tz=T.cz+p[1];a.ty=Math.atan2(-p[0],-p[1]);}
    });
  });
  MP.avatars.forEach(a=>{const T=TABLES[a.mt];if(a.act==='mtable'&&T&&a.ms>=0&&a.f===T.floor){const p=mtSeatPos(T,a.ms,T.R);a.tx=p.x;a.tz=p.z;a.ty=Math.atan2(T.cx-p.x,T.cz-p.z);}});
}
function mpStep(dt){
  seatAvatars();mtStep();stepMirrors(dt);updWatchCard(dt);if(STANDALONE)vcStep(dt);
  if(MP.room&&MP.started){
    const s=mpLocalState();const m=MP.me;
    const ch=s.f!==m.f||s.a!==m.a||s.n!==m.n||s.k!==m.k||s.ms!==m.ms||s.mt!==m.mt||s.rs!==m.rs||JSON.stringify(s.gx)!==JSON.stringify(m.gx)||Math.abs(s.x-(m.x||0))>.02||Math.abs(s.z-(m.z||0))>.02||Math.abs(s.y-(m.y||0))>.03;
    if((ch||MP.dirty)&&now-MP.lastSent>.1){Object.assign(m,s);MP.lastSent=now;MP.dirty=false;
      MP.room.presence(Object.assign({},m)).catch(()=>{});}
  }
  MP.avatars.forEach(a=>{
    const r=a.m.g;r.visible=a.f===floorIdx;
    const dx=a.tx-r.position.x,dz=a.tz-r.position.z,d=Math.hypot(dx,dz);
    if(d>4)r.position.set(a.tx,0,a.tz);else{r.position.x+=dx*Math.min(1,dt*9);r.position.z+=dz*Math.min(1,dt*9);}
    r.rotation.y=angLerp(r.rotation.y,a.ty,dt*10);
    if(a.act==='walk'||a.act==='mwatch')a.n.anim=d>.05?'walk':'idle';
    a.n.root.position.y=0;animNPC(a.n,dt);
  });
}
function mpVisibleAvatars(){const out=[];MP.avatars.forEach(a=>{if(a.f===floorIdx)out.push(a.n);});return out;}
function mpSay(text){
  text=cleanText(text,80).trim();if(!text)return;
  if(!MP.room){toast('Multiplayer ist hier nicht verbunden.');return;}
  MP.me.s=text;MP.me.st=Date.now();MP.dirty=true;MP.lastSent=0;toast('Du: '+text);
}
function mpWin(text){if(!MP.room)return;MP.me.w=cleanText(text,60);MP.me.wt=Date.now();MP.dirty=true;}

/* ---------- Standalone: Raum hosten / beitreten (MQTT über WebSocket) ---------- */
const STANDALONE=!!window.NK_STANDALONE;
const BROKERS=['wss://broker.hivemq.com:8884/mqtt','wss://broker.emqx.io:8084/mqtt','wss://test.mosquitto.org:8081/mqtt'];
const NET={cli:null,code:'',myId:'',states:{},seen:{},mine:{},timer:null,ok:false,bi:0,tries:0};
function netStatus(t){const e=$('#mpStatus');if(e)e.textContent=t;mpTag();}
function netRoomObj(){return {presence(p){NET.mine=Object.assign({},p);return Promise.resolve();},connected(){return NET.ok;}};}
function netLeave(silent){
  if(typeof VC!=='undefined'&&VC.state)vcStop();
  if(NET.timer){clearInterval(NET.timer);NET.timer=null;}
  if(NET.cli){try{if(NET.ok){NET.cli.publish('sinanskeller/'+NET.code+'/'+NET.myId,JSON.stringify({bye:1}));if(!Object.keys(NET.states).length)NET.cli.publish('sinanskeller/lobby/'+NET.code,'',{qos:0,retain:true});}NET.cli.end(true);}catch(e){}NET.cli=null;}
  NET.lobbyT=0;
  NET.states={};NET.seen={};NET.ok=false;NET.code='';MP.room=null;MP.online=0;mpClear();$('#chatBtn').hidden=true;
  if(!silent)netStatus('Nicht verbunden.');else mpTag();
}
function netValid(s){return s&&typeof s==='object'&&!Array.isArray(s)&&JSON.stringify(s).length<4500;}
function netPeers(){const out=[{peer:NET.myId,isMe:true,kind:'viewer',guest:false,presence:NET.mine}];
  for(const id in NET.states)out.push({peer:id,isMe:false,kind:'viewer',guest:false,presence:NET.states[id]});return out;}
function netTick(){
  if(!NET.ok||!NET.cli)return;
  // Raum in der Raumliste anzeigen (alle 15 s, retained)
  const tl=Date.now();if(tl-(NET.lobbyT||0)>15000){NET.lobbyT=tl;const names=[MP.name||'GAST'];for(const id in NET.states)names.push(cleanText(NET.states[id].n,14)||'GAST');
    try{NET.cli.publish('sinanskeller/lobby/'+NET.code,JSON.stringify({c:NET.code,h:names[0],p:names.slice(0,6),t:tl,b:NET.bi%BROKERS.length}),{qos:0,retain:true});}catch(e){}}
  const js=JSON.stringify({s:NET.mine}),tn=Date.now();
  if(js!==NET.lastJs||tn-(NET.lastPub||0)>2000){NET.lastJs=js;NET.lastPub=tn;try{NET.cli.publish('sinanskeller/'+NET.code+'/'+NET.myId,js,{qos:0});}catch(e){}}
  const t=Date.now();let ch=false;for(const id in NET.seen)if(t-NET.seen[id]>7000){delete NET.seen[id];delete NET.states[id];ch=true;}
  mpSync(netPeers());
}
// bi = Server, auf dem der Raum liegt (von Freund/Einladung/Raumliste bekannt) – sonst der Reihe nach probieren
function netStart(asHost,code,bi){
  if(typeof mqtt==='undefined'){netStatus('Verbindungs-Bibliothek nicht geladen. Internet prüfen und Seite neu laden.');return;}
  if(typeof cardsOutAll==='function'&&RESVS.size)cardsOutAll(); // beim Beitreten/Hosten alle Automatenkarten ziehen
  netLeave(true);NET.code=code;NET.myId='p'+Math.random().toString(36).slice(2,10);NET.tries=0;NET.bi=Number.isInteger(bi)&&bi>=0&&bi<BROKERS.length?bi:0;
  netConnect(asHost);
}
function netConnect(asHost){
  const url=BROKERS[NET.bi%BROKERS.length];
  netStatus((asHost?'Raum '+NET.code+' wird geöffnet':'Verbinde mit Raum '+NET.code)+'… ('+(NET.bi%BROKERS.length+1)+')');
  let cli;
  try{cli=mqtt.connect(url,{clientId:'sk_'+NET.myId,clean:true,connectTimeout:6000,reconnectPeriod:3000,keepalive:30,
    will:{topic:'sinanskeller/'+NET.code+'/'+NET.myId,payload:JSON.stringify({bye:1}),qos:0,retain:false}});}catch(e){netNext(asHost);return;}
  NET.cli=cli;
  const failT=setTimeout(()=>{if(!NET.ok&&NET.cli===cli){try{cli.end(true);}catch(e){}netNext(asHost);}},8000);
  cli.on('connect',()=>{
    clearTimeout(failT);
    cli.subscribe('sinanskeller/'+NET.code+'/sig/'+NET.myId,{qos:0});
    cli.subscribe('sinanskeller/'+NET.code+'/+',{qos:0},err=>{
      if(err){netStatus('Fehler beim Beitreten. Nochmal versuchen.');return;}
      const first=!NET.ok;NET.ok=true;MP.room=netRoomObj();MP.dirty=true;$('#chatBtn').hidden=false;
      if(!NET.timer)NET.timer=setInterval(netTick,150);
      netStatus((asHost?'Raum '+NET.code+' ist offen. Sag deinem Kollegen den Code.':'Im Raum '+NET.code+'. Warte auf die anderen…'));
      if(first)toast('Raum '+NET.code+' verbunden.');
    });
  });
  cli.on('message',(topic,buf)=>{
    const parts=topic.split('/');
    if(parts[2]==='sig'){if(parts[3]===NET.myId){try{vcSignal(JSON.parse(buf.toString()));}catch(e){}}return;}
    const id=parts[2];if(!id||id===NET.myId)return;
    let d;try{d=JSON.parse(buf.toString());}catch(e){return;}
    if(d&&d.bye){delete NET.states[id];delete NET.seen[id];mpSync(netPeers());return;}
    if(d&&netValid(d.s)){const isNew=!NET.states[id];NET.states[id]=d.s;NET.seen[id]=Date.now();if(isNew){mpSync(netPeers());netStatus('Raum '+NET.code+': '+(Object.keys(NET.states).length+1)+' Spieler.');}}
  });
  cli.on('offline',()=>{if(NET.cli===cli&&NET.ok)netStatus('Verbindung weg, versuche erneut…');});
  cli.on('error',()=>{});
}
/* ---------- Raumliste: offene Räume anzeigen, antippen = beitreten ---------- */
const LOBBY={cli:null,rooms:{},bi:0,timer:null};
function lobbyRender(){
  const el=$('#mpRooms');if(!el)return;const t=Date.now();
  const list=Object.values(LOBBY.rooms).filter(r=>t-r.t<75000&&r.c!==NET.code).sort((a,b)=>b.t-a.t);
  if(!list.length){el.innerHTML='<p class="mps" style="color:var(--dim)">'+(LOBBY.cli&&LOBBY.ok?'Gerade kein offener Raum. Hoste einen, dann sehen ihn die anderen hier.':'Suche Räume…')+'</p>';return;}
  el.innerHTML='';list.forEach(r=>{const b=document.createElement('button');b.className='btn mproom';
    const a=document.createElement('span');a.textContent=r.h+' · RAUM '+r.c;const sm=document.createElement('small');sm.textContent=r.p.length+' SPIELER · REIN';
    b.append(a,sm);b.addEventListener('click',()=>{SFX.click();lobbyClose();$('#mpCode').value=r.c;netStart(false,r.c,r.b);});el.appendChild(b);});
}
function lobbyOpen(){
  if(!STANDALONE||typeof mqtt==='undefined')return;lobbyClose();LOBBY.rooms={};LOBBY.ok=false;lobbyRender();
  const url=BROKERS[LOBBY.bi%BROKERS.length];let cli;
  try{cli=mqtt.connect(url,{clientId:'skl_'+Math.random().toString(36).slice(2,10),clean:true,connectTimeout:6000,reconnectPeriod:0,keepalive:30});}catch(e){return;}
  LOBBY.cli=cli;const fail=setTimeout(()=>{if(LOBBY.cli===cli&&!LOBBY.ok){try{cli.end(true);}catch(e){}LOBBY.cli=null;LOBBY.bi++;if(LOBBY.bi<BROKERS.length*2&&openId==='pMulti')lobbyOpen();}},7000);
  cli.on('connect',()=>{clearTimeout(fail);LOBBY.ok=true;cli.subscribe('sinanskeller/lobby/+',{qos:0});lobbyRender();});
  cli.on('message',(topic,buf)=>{const code=topic.split('/')[2];if(!/^\d{4}$/.test(code||''))return;
    const txt=buf.toString();if(!txt){delete LOBBY.rooms[code];lobbyRender();return;}
    try{const d=JSON.parse(txt);if(!d||typeof d.t!=='number')return;LOBBY.rooms[code]={c:code,h:cleanText(d.h,14)||'GAST',p:Array.isArray(d.p)?d.p.slice(0,6):[],t:Math.min(d.t,Date.now()),b:LOBBY.bi%BROKERS.length};lobbyRender();}catch(e){}});
  cli.on('error',()=>{});
  LOBBY.timer=setInterval(lobbyRender,5000);
}
function lobbyClose(){if(LOBBY.timer){clearInterval(LOBBY.timer);LOBBY.timer=null;}if(LOBBY.cli){try{LOBBY.cli.end(true);}catch(e){}LOBBY.cli=null;}LOBBY.ok=false;}
function netNext(asHost){NET.tries++;NET.bi++;if(NET.tries>=BROKERS.length){netLeave(true);netStatus('Kein Server erreichbar. Internet prüfen und nochmal versuchen.');return;}netConnect(asHost);}
if(STANDALONE){
  $('#mpHost').addEventListener('click',()=>{SFX.click();const c=($('#mpCode').value||'').replace(/\D/g,'').slice(0,4);netStart(true,c.length===4?c:String(1000+(Math.random()*9000|0)));});
  $('#mpJoin').addEventListener('click',()=>{SFX.click();const c=($('#mpCode').value||'').replace(/\D/g,'').slice(0,4);if(c.length!==4){netStatus('Bitte den 4-stelligen Code eingeben.');return;}netStart(false,c);});
  $('#mpCode').addEventListener('keydown',e=>e.stopPropagation());
  $('#mpLeave').addEventListener('click',()=>{SFX.click();netLeave();});
  addEventListener('pagehide',()=>{if(NET.ok)netLeave(true);});
}

/* ---------- Auto-Update (nur gehostete Version) ---------- */
if(STANDALONE&&window.NK_VERSION){
  let upd=false;
  const check=()=>{
    if(upd)return;
    fetch('version.txt?t='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.text():'').then(v=>{
      v=(v||'').trim();if(!v||v===window.NK_VERSION||!/^\d+$/.test(v)||+v<+window.NK_VERSION)return;
      upd=true;
      const go=()=>{if(NET.ok)netLeave(true);location.replace(location.pathname+'?v='+v);};
      const idle=()=>!focus&&!openId&&!(typeof R!=='undefined'&&R.spinning);
      if(!started||idle()){toast('Neue Version wird geladen…');setTimeout(go,1200);}
      else{toast('Neue Version da. Sie lädt, sobald du aufstehst.');const iv=setInterval(()=>{if(idle()){clearInterval(iv);toast('Neue Version wird geladen…');setTimeout(go,1200);}},1000);}
    }).catch(()=>{});
  };
  setTimeout(check,3000);setInterval(check,45000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)check();});
}
