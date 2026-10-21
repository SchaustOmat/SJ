/* =========================================================
   VOICE-CHAT (nur GitHub-Version mit Raum-Code)
   Sprache läuft direkt zwischen den Geräten (WebRTC). Verbindungsaufbau über den Raum-Server.
   Knopf oben: AUS -> AN -> STUMM -> AUS
   ========================================================= */
const VC={state:0,stream:null,raw:null,ac:null,rnn:false,pcs:new Map(),audioEl:new Map()}; // state 0 aus, 1 an, 2 stumm; raw = Mikro direkt, stream = entrauscht
// Rauschunterdrückung wie Discord/Krisp (2026-10-21): RNNoise (neuronales Netz, Xiph) als WebAssembly in einem Audio-Worklet,
// 12 KB Glue + 112 KB WASM vom CDN (jsDelivr, @jitsi/rnnoise-wasm 0.2.1, BSD). Mikro -> Worklet (480er Frames bei 48 kHz) -> neuer Stream -> WebRTC.
// Klappt das Laden nicht (kein Netz, alter Browser), bleibt die Browser-eigene Unterdrückung an und es geht wie bisher.
const VC_RNN_BASE='https://cdn.jsdelivr.net/npm/@jitsi/rnnoise-wasm@0.2.1/dist/',VC_RNN_NAME='sj-rnnoise';
const VC_WORKLET=`
class SJRnn extends AudioWorkletProcessor{
  constructor(o){super();this.rnn=null;this.ctx=0;this.ptr=0;this.inb=new Float32Array(480*8);this.inN=0;this.outb=new Float32Array(480*8);this.outN=0;this.vad=0;
    const w=o&&o.processorOptions&&o.processorOptions.wasm;
    try{createRNNWasmModule({wasmBinary:w}).then(m=>{this.ptr=m._malloc(480*4);this.ctx=m._rnnoise_create(0);this.rnn=m;this.port.postMessage('ready');}).catch(e=>{this.port.postMessage('fail');});}catch(e){this.port.postMessage('fail');}
    this.frames=0;this.port.onmessage=e=>{if(e.data==='stat')this.port.postMessage({vad:this.vad,frames:this.frames});};}
  process(inputs,outputs){const i=inputs[0]&&inputs[0][0],o=outputs[0]&&outputs[0][0];if(!o||!i)return true;
    if(!this.rnn){o.set(i.subarray(0,o.length));return true;}
    if(this.inN+i.length>this.inb.length){this.inN=0;this.outN=0;}
    this.inb.set(i,this.inN);this.inN+=i.length;
    const m=this.rnn,H=m.HEAPF32,p=this.ptr>>2;let k=0;
    while(this.inN-k>=480){for(let j=0;j<480;j++)H[p+j]=this.inb[k+j]*32768;this.vad=m._rnnoise_process_frame(this.ctx,this.ptr,this.ptr);this.frames++;
      if(this.outN+480<=this.outb.length){for(let j=0;j<480;j++)this.outb[this.outN+j]=H[p+j]/32768;this.outN+=480;}k+=480;}
    if(k){this.inb.copyWithin(0,k,this.inN);this.inN-=k;}
    if(this.outN>=o.length){o.set(this.outb.subarray(0,o.length));this.outb.copyWithin(0,o.length,this.outN);this.outN-=o.length;}
    return true;}
}
registerProcessor('${VC_RNN_NAME}',SJRnn);`;
let vcRnnP=null;
function vcRnnLoad(){ // einmal laden: Glue-Skript + WASM holen, Worklet-Code als Blob-URL bauen
  if(!vcRnnP)vcRnnP=(async()=>{const [js,wasm]=await Promise.all([fetch(VC_RNN_BASE+'rnnoise.js').then(r=>{if(!r.ok)throw 0;return r.text();}),fetch(VC_RNN_BASE+'rnnoise.wasm').then(r=>{if(!r.ok)throw 0;return r.arrayBuffer();})]);
    const code=js.replace(/export\s+default\s+createRNNWasmModule\s*;?/,'')+'\n'+VC_WORKLET;
    return {url:URL.createObjectURL(new Blob([code],{type:'text/javascript'})),wasm};})().catch(e=>{vcRnnP=null;throw e;});
  return vcRnnP;
}
async function vcRnnNode(ac){ // Worklet-Knoten in einem AudioContext anlegen (wartet, bis das Netz im Worklet bereit ist)
  const r=await vcRnnLoad();await ac.audioWorklet.addModule(r.url);
  const node=new AudioWorkletNode(ac,VC_RNN_NAME,{numberOfInputs:1,numberOfOutputs:1,outputChannelCount:[1],processorOptions:{wasm:r.wasm}});
  await new Promise((res,rej)=>{const t=setTimeout(()=>rej(new Error('rnnoise timeout')),8000);node.port.onmessage=e=>{clearTimeout(t);if(e.data==='ready')res();else rej(new Error('rnnoise fail'));};});
  return node;
}
async function vcDenoise(raw){ // Mikro-Stream durch RNNoise schicken; Ergebnis: neuer Stream (mono)
  let ac;try{ac=new (window.AudioContext||window.webkitAudioContext)({sampleRate:48000});}catch(e){ac=new (window.AudioContext||window.webkitAudioContext)();}
  try{const node=await vcRnnNode(ac);const src=ac.createMediaStreamSource(raw),dst=ac.createMediaStreamDestination();src.connect(node);node.connect(dst);
    if(ac.state!=='running')await ac.resume();return {ac,stream:dst.stream};}
  catch(e){try{ac.close();}catch(_){}throw e;}
}
const ICE=[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']},{urls:'stun:stun.cloudflare.com:3478'},
  {urls:['turn:openrelay.metered.ca:80','turn:openrelay.metered.ca:443','turn:openrelay.metered.ca:443?transport=tcp'],username:'openrelayproject',credential:'openrelayproject'}];
function vcLabel(){const b=$('#micBtn');if(!b)return;let ph=false;try{ph=!PC;}catch(e){} // PC gibt es erst später im Skript
  b.textContent=(ph?['Mikrofon','Mikro an','Stumm']:['MIC','MIC AN','STUMM'])[VC.state];b.classList.toggle('on',VC.state===1);b.classList.toggle('mute',VC.state===2);}
async function vcToggle(){
  if(!STANDALONE||!NET.ok){toast('Voice-Chat geht nur, wenn ihr über MULTI im selben Raum seid.');return;}
  if(VC.state===0){
    try{VC.raw=await navigator.mediaDevices.getUserMedia({audio:VC_MIC,video:false});}
    catch(e){toast('Mikrofon nicht erlaubt. Im Browser die Mikrofon-Freigabe für die Seite erlauben.');return;}
    VC.stream=VC.raw;VC.rnn=false;
    if(!(localStorage.getItem('nk_rnn')==='0')){try{const d=await vcDenoise(VC.raw);if(VC.raw){VC.ac=d.ac;VC.stream=d.stream;VC.rnn=true;
        try{VC.raw.getAudioTracks()[0].applyConstraints({noiseSuppression:false});}catch(_){} // die Browser-Unterdrückung aus, sonst doppelt
      }else{try{d.ac.close();}catch(_){}}}catch(e){}}
    if(!VC.raw)return; // inzwischen wieder aus
    VC.state=1;toast(VC.rnn?'Mikro an, Rauschunterdrückung aktiv. Die anderen hören dich.':'Mikro an. Die anderen hören dich.');
  } else if(VC.state===1){VC.state=2;VC.stream.getAudioTracks().forEach(t=>t.enabled=false);if(VC.raw)VC.raw.getAudioTracks().forEach(t=>t.enabled=false);toast('Stumm. Du hörst die anderen noch.');}
  else{vcStop();toast('Voice-Chat aus.');}
  if(VC.state===1&&VC.stream){VC.stream.getAudioTracks().forEach(t=>t.enabled=true);if(VC.raw)VC.raw.getAudioTracks().forEach(t=>t.enabled=true);}
  MP.me.vc=VC.state;MP.dirty=true;MP.lastSent=0;vcLabel();
}
function vcStop(){
  VC.pcs.forEach((x,id)=>vcClose(id));
  if(VC.stream)VC.stream.getTracks().forEach(t=>t.stop());if(VC.raw)VC.raw.getTracks().forEach(t=>t.stop());if(VC.ac){try{VC.ac.close();}catch(e){}}
  VC.stream=null;VC.raw=null;VC.ac=null;VC.rnn=false;VC.state=0;MP.me.vc=0;MP.dirty=true;vcLabel();
}
function vcClose(id){const x=VC.pcs.get(id);if(x){try{x.pc.close();}catch(e){}VC.pcs.delete(id);}const a=VC.audioEl.get(id);if(a){a.srcObject=null;a.remove();VC.audioEl.delete(id);}}
// Klang wie Discord (2026-10-21): Mikro mono 48 kHz mit Echo-, Rausch- und Pegel-Automatik (voiceIsolation, wo der Browser es kann),
// Opus mit 96 kbit/s statt der ~32 kbit/s Browser-Vorgabe, Fehlerkorrektur im Datenstrom (FEC), kein Abschalten in Sprechpausen (DTX).
const VC_MIC={echoCancellation:true,noiseSuppression:true,autoGainControl:true,voiceIsolation:true,channelCount:1,sampleRate:48000,sampleSize:16};
const VC_BPS=96000,VC_FMTP='maxaveragebitrate='+VC_BPS+';maxplaybackrate=48000;stereo=0;sprop-stereo=0;useinbandfec=1;usedtx=0;cbr=0';
function vcSdp(sdp){ // Opus-Zeile im SDP ergänzen (gilt für beide Richtungen: eigene Beschreibung und die der Gegenseite)
  if(typeof sdp!=='string')return sdp;const lines=sdp.split(/\r?\n/);const rm=lines.find(l=>/^a=rtpmap:\d+ opus\/48000/i.test(l));if(!rm)return sdp;
  const pt=rm.slice(9).split(' ')[0],fi=lines.findIndex(l=>l.startsWith('a=fmtp:'+pt+' '));
  const kv={};if(fi>=0)lines[fi].slice(8+pt.length).split(';').forEach(x=>{const i=x.indexOf('=');if(i>0)kv[x.slice(0,i).trim()]=x.slice(i+1).trim();});
  VC_FMTP.split(';').forEach(x=>{const [k,v]=x.split('=');kv[k]=v;});
  const line='a=fmtp:'+pt+' '+Object.keys(kv).map(k=>k+'='+kv[k]).join(';');
  if(fi>=0)lines[fi]=line;else lines.splice(lines.indexOf(rm)+1,0,line);
  return lines.join('\r\n');
}
function vcDesc(d){return d&&d.sdp?{type:d.type,sdp:vcSdp(d.sdp)}:d;}
function vcTune(pc){ // Sender: Bitrate und Priorität setzen (nicht jeder Browser kann alles, darum alles abgesichert)
  try{pc.getSenders().forEach(s=>{if(!s.track||s.track.kind!=='audio')return;try{const p=s.getParameters();if(!p.encodings||!p.encodings.length)return;
    p.encodings[0].maxBitrate=VC_BPS;p.encodings[0].priority='high';p.encodings[0].networkPriority='high';const r=s.setParameters(p);if(r&&r.catch)r.catch(()=>{});}catch(e){}});}catch(e){}
}
function vcSend(to,msg){if(!NET.cli||!NET.ok)return;try{NET.cli.publish('sinanskeller/'+NET.code+'/sig/'+to,JSON.stringify(Object.assign({from:NET.myId},msg)));}catch(e){}}
function vcMakePC(id){
  const pc=new RTCPeerConnection({iceServers:ICE});
  const x={pc,pending:[]};VC.pcs.set(id,x);
  if(VC.stream)VC.stream.getTracks().forEach(t=>pc.addTrack(t,VC.stream));
  pc.onicecandidate=e=>{if(e.candidate)vcSend(id,{t:'ice',c:e.candidate});};
  pc.ontrack=e=>{let a=VC.audioEl.get(id);if(!a){a=document.createElement('audio');a.autoplay=true;a.volume=1;a.setAttribute('playsinline','');document.body.appendChild(a);VC.audioEl.set(id,a);}
    a.srcObject=e.streams[0];const p=a.play();if(p&&p.catch)p.catch(()=>toast('Tippe einmal auf den Bildschirm, um die anderen zu hören.'));};
  pc.onconnectionstatechange=()=>{if(pc.connectionState==='failed'){vcClose(id);}};
  return x;
}
async function vcCall(id){
  const x=vcMakePC(id);
  try{const off=await x.pc.createOffer({offerToReceiveAudio:true});await x.pc.setLocalDescription(vcDesc(off));vcTune(x.pc);vcSend(id,{t:'offer',sdp:x.pc.localDescription});}catch(e){vcClose(id);}
}
async function vcSignal(d){
  if(!d||typeof d!=='object'||typeof d.from!=='string'||VC.state===0)return;
  const id=d.from;
  try{
    if(d.t==='offer'&&d.sdp){vcClose(id);const x=vcMakePC(id);await x.pc.setRemoteDescription(vcDesc(d.sdp));
      for(const c of x.pending)await x.pc.addIceCandidate(c);x.pending=[];
      const ans=await x.pc.createAnswer();await x.pc.setLocalDescription(vcDesc(ans));vcTune(x.pc);vcSend(id,{t:'answer',sdp:x.pc.localDescription});}
    else if(d.t==='answer'&&d.sdp){const x=VC.pcs.get(id);if(x){await x.pc.setRemoteDescription(vcDesc(d.sdp));vcTune(x.pc);for(const c of x.pending)await x.pc.addIceCandidate(c);x.pending=[];}}
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
