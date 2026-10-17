/* =========================================================
   RADIO: YouTube-Link rein, Play/Pause, leiser/lauter.
   Im Multiplayer-Raum für alle gleich: gleicher Song, gleiche Stelle,
   gleiche Lautstärke, gleicher Play/Pause-Zustand (neueste Änderung gewinnt).
   ========================================================= */
const RADIO={st:null,player:null,ready:false,loading:false,applied:'',want:null};
// st = {v:Video-ID, t0:Startzeit (ms, wenn es läuft), p:Position in s (wenn pausiert) oder -1, vol:0..100, ts:Änderungszeit, by:Name}
function ytId(u){u=String(u||'').trim();let m=u.match(/(?:youtu\.be\/|v=|shorts\/|embed\/|live\/)([A-Za-z0-9_-]{11})/);if(m)return m[1];if(/^[A-Za-z0-9_-]{11}$/.test(u))return u;return '';}
function radioLoadApi(){
  if(RADIO.ready||RADIO.loading)return;RADIO.loading=true;
  window.onYouTubeIframeAPIReady=()=>{
    RADIO.player=new YT.Player('ytBox',{width:'200',height:'113',playerVars:{playsinline:1,controls:0,disablekb:1,modestbranding:1,rel:0},
      events:{onReady:()=>{RADIO.ready=true;radioApply(true);},onStateChange:e=>{radioUi();if(e.data===0&&RADIO.st&&RADIO.st.p<0){/* Ende: von vorn */radioSet({t0:Date.now(),p:-1});}}}});};
  const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';s.onerror=()=>{RADIO.loading=false;toast('YouTube konnte nicht laden.');};document.head.appendChild(s);
}
function radioPos(st){return st.p>=0?st.p:Math.max(0,(Date.now()-st.t0)/1000);}
// gemeinsamen Zustand auf den eigenen Player anwenden
function radioApply(force){
  const st=RADIO.st,P=RADIO.player;radioUi();if(!st||!RADIO.ready||!P)return;
  const key=st.v+'|'+st.ts;if(!force&&key===RADIO.applied){return;}RADIO.applied=key;
  try{
    const cur=P.getVideoData&&P.getVideoData().video_id;
    if(cur!==st.v){if(st.p>=0)P.cueVideoById(st.v,st.p);else P.loadVideoById(st.v,radioPos(st));}
    else{const d=Math.abs(P.getCurrentTime()-radioPos(st));if(d>2.5)P.seekTo(radioPos(st),true);
      if(st.p>=0)P.pauseVideo();else P.playVideo();}
    P.setVolume(clamp(st.vol,0,100));if(st.vol<=0)P.mute();else P.unMute();
  }catch(e){}
}
function radioSet(ch){
  const base=RADIO.st||{v:'',t0:Date.now(),p:0,vol:60};
  RADIO.st=Object.assign({},base,ch,{ts:Date.now(),by:MP.name||'GAST'});
  if(typeof MP!=='undefined'){MP.me.rd=RADIO.st;MP.dirty=true;}
  radioLoadApi();radioApply(true);
}
// von Mitspielern: neueste Änderung übernehmen
function radioRemote(rd){
  if(!rd||typeof rd!=='object')return;const v=ytId(rd.v),ts=+rd.ts;if(!v||!Number.isFinite(ts))return;
  if(RADIO.st&&RADIO.st.ts>=ts)return;
  RADIO.st={v,t0:+rd.t0||Date.now(),p:Number.isFinite(+rd.p)?+rd.p:-1,vol:clamp(+rd.vol||0,0,100),ts,by:cleanText(rd.by,14)};
  MP.me.rd=RADIO.st;radioLoadApi();radioApply(false);
  if(RADIO.st.p<0&&!RADIO.ready)toast(RADIO.st.by+' spielt Radio. Tippe auf RADIO zum Mithören.');
}
function radioUi(){
  const st=RADIO.st,b=$('#radioBtn');if(b)b.classList.toggle('on',!!(st&&st.v&&st.p<0));
  const el=$('#rdNow');if(!el)return;
  let title='';try{title=RADIO.player&&RADIO.player.getVideoData?RADIO.player.getVideoData().title||'':'';}catch(e){}
  el.textContent=st&&st.v?(st.p<0?'▶ ':'❚❚ ')+(title||st.v)+(st.by?' · von '+st.by:''):'Noch nichts. Link einfügen und abspielen.';
  $('#rdVol').textContent=(st?st.vol:60)+' %';$('#rdPlay').textContent=st&&st.p<0?'PAUSE':'PLAY';
}
$('#radioBtn').addEventListener('click',()=>{SFX.click();radioLoadApi();openPanel('pRadio');radioUi();if(RADIO.st)radioApply(true);});
$('#rdGo').addEventListener('click',()=>{const v=ytId($('#rdUrl').value);if(!v){toast('Das ist kein YouTube-Link.');return;}SFX.click();radioSet({v,t0:Date.now(),p:-1});$('#rdUrl').value='';});
$('#rdUrl').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')$('#rdGo').click();});
$('#rdPlay').addEventListener('click',()=>{const st=RADIO.st;if(!st||!st.v){toast('Erst einen Link einfügen.');return;}SFX.click();
  if(st.p<0)radioSet({p:radioPos(st)});else radioSet({t0:Date.now()-st.p*1000,p:-1});});
$('#rdDown').addEventListener('click',()=>{SFX.click();radioSet({vol:Math.max(0,(RADIO.st?RADIO.st.vol:60)-10)});});
$('#rdUp').addEventListener('click',()=>{SFX.click();radioSet({vol:Math.min(100,(RADIO.st?RADIO.st.vol:60)+10)});});
setInterval(()=>{if(RADIO.st&&RADIO.ready&&RADIO.st.p<0){try{const d=Math.abs(RADIO.player.getCurrentTime()-radioPos(RADIO.st));if(d>4)RADIO.player.seekTo(radioPos(RADIO.st),true);}catch(e){}}radioUi();},3000);
