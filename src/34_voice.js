/* =========================================================
   VOICE-CHAT (nur GitHub-Version mit Raum-Code)
   Sprache läuft direkt zwischen den Geräten (WebRTC). Verbindungsaufbau über den Raum-Server.
   Knopf oben: AUS -> AN -> STUMM -> AUS
   ========================================================= */
const VC={state:0,stream:null,pcs:new Map(),audioEl:new Map()}; // state 0 aus, 1 an, 2 stumm
const ICE=[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']},{urls:'stun:stun.cloudflare.com:3478'},
  {urls:['turn:openrelay.metered.ca:80','turn:openrelay.metered.ca:443','turn:openrelay.metered.ca:443?transport=tcp'],username:'openrelayproject',credential:'openrelayproject'}];
function vcLabel(){const b=$('#micBtn');if(!b)return;let ph=false;try{ph=!PC;}catch(e){} // PC gibt es erst später im Skript
  b.textContent=(ph?['Mikrofon','Mikro an','Stumm']:['MIC','MIC AN','STUMM'])[VC.state];b.classList.toggle('on',VC.state===1);b.classList.toggle('mute',VC.state===2);}
async function vcToggle(){
  if(!STANDALONE||!NET.ok){toast('Voice-Chat geht nur, wenn ihr über MULTI im selben Raum seid.');return;}
  if(VC.state===0){
    try{VC.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false});}
    catch(e){toast('Mikrofon nicht erlaubt. Im Browser die Mikrofon-Freigabe für die Seite erlauben.');return;}
    VC.state=1;toast('Mikro an. Die anderen hören dich.');
  } else if(VC.state===1){VC.state=2;VC.stream.getAudioTracks().forEach(t=>t.enabled=false);toast('Stumm. Du hörst die anderen noch.');}
  else{vcStop();toast('Voice-Chat aus.');}
  if(VC.state===1&&VC.stream)VC.stream.getAudioTracks().forEach(t=>t.enabled=true);
  MP.me.vc=VC.state;MP.dirty=true;MP.lastSent=0;vcLabel();
}
function vcStop(){
  VC.pcs.forEach((x,id)=>vcClose(id));
  if(VC.stream)VC.stream.getTracks().forEach(t=>t.stop());VC.stream=null;VC.state=0;MP.me.vc=0;MP.dirty=true;vcLabel();
}
function vcClose(id){const x=VC.pcs.get(id);if(x){try{x.pc.close();}catch(e){}VC.pcs.delete(id);}const a=VC.audioEl.get(id);if(a){a.srcObject=null;a.remove();VC.audioEl.delete(id);}}
function vcSend(to,msg){if(!NET.cli||!NET.ok)return;try{NET.cli.publish('sinanskeller/'+NET.code+'/sig/'+to,JSON.stringify(Object.assign({from:NET.myId},msg)));}catch(e){}}
function vcMakePC(id){
  const pc=new RTCPeerConnection({iceServers:ICE});
  const x={pc,pending:[]};VC.pcs.set(id,x);
  if(VC.stream)VC.stream.getTracks().forEach(t=>pc.addTrack(t,VC.stream));
  pc.onicecandidate=e=>{if(e.candidate)vcSend(id,{t:'ice',c:e.candidate});};
  pc.ontrack=e=>{let a=VC.audioEl.get(id);if(!a){a=document.createElement('audio');a.autoplay=true;a.setAttribute('playsinline','');document.body.appendChild(a);VC.audioEl.set(id,a);}
    a.srcObject=e.streams[0];const p=a.play();if(p&&p.catch)p.catch(()=>toast('Tippe einmal auf den Bildschirm, um die anderen zu hören.'));};
  pc.onconnectionstatechange=()=>{if(pc.connectionState==='failed'){vcClose(id);}};
  return x;
}
async function vcCall(id){
  const x=vcMakePC(id);
  try{const off=await x.pc.createOffer({offerToReceiveAudio:true});await x.pc.setLocalDescription(off);vcSend(id,{t:'offer',sdp:x.pc.localDescription});}catch(e){vcClose(id);}
}
async function vcSignal(d){
  if(!d||typeof d!=='object'||typeof d.from!=='string'||VC.state===0)return;
  const id=d.from;
  try{
    if(d.t==='offer'&&d.sdp){vcClose(id);const x=vcMakePC(id);await x.pc.setRemoteDescription(d.sdp);
      for(const c of x.pending)await x.pc.addIceCandidate(c);x.pending=[];
      const ans=await x.pc.createAnswer();await x.pc.setLocalDescription(ans);vcSend(id,{t:'answer',sdp:x.pc.localDescription});}
    else if(d.t==='answer'&&d.sdp){const x=VC.pcs.get(id);if(x){await x.pc.setRemoteDescription(d.sdp);for(const c of x.pending)await x.pc.addIceCandidate(c);x.pending=[];}}
    else if(d.t==='ice'&&d.c){const x=VC.pcs.get(id);if(x){if(x.pc.remoteDescription)await x.pc.addIceCandidate(d.c);else x.pending.push(d.c);}}
  }catch(e){}
}
// Verbindungen zu allen im Raum mit eingeschaltetem Voice-Chat herstellen / beenden
let vcT=0;
function vcStep(dt){
  vcT-=dt;if(vcT>0)return;vcT=1;
  if(VC.state===0)return;
  if(!NET.ok){vcStop();return;}
  const want=new Set();
  for(const id in NET.states){const pr=NET.states[id];if(pr&&(pr.vc===1||pr.vc===2))want.add(id);}
  VC.pcs.forEach((x,id)=>{if(!want.has(id))vcClose(id);});
  want.forEach(id=>{if(!VC.pcs.has(id)&&NET.myId<id)vcCall(id);}); // die kleinere ID ruft an
}
if(STANDALONE){
  $('#micBtn').hidden=false;$('#micBtn').addEventListener('click',()=>{SFX.click();vcToggle();});vcLabel();
  document.addEventListener('pointerdown',()=>{VC.audioEl.forEach(a=>{if(a.paused)a.play().catch(()=>{});});},{passive:true});
}
