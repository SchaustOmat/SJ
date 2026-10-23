/* =========================================================
   BEGRÜSSUNGS-SONG BEIM BETRETEN (Nutzer-Wunsch 2026-10-23, Tonspur aus seinem Video: assets/sfx/join.mp3, ~20 s)
   Spielt für den Spieler selbst beim Start („HEREINSPAZIERT“) und beim Beitreten eines Raums,
   und für alle im Raum, sobald jemand Neues auftaucht (jeder Client spielt ihn lokal, wenn ein neuer Mitspieler erscheint).
   Läuft er gerade (mehrere kommen gleichzeitig), wird nicht neu gestartet. Ton-Schalter aus = stumm (laufender Song stoppt).
   Er startet automatisch beim Reinkommen (enterGame). Blockt der Browser das ohne Berührung (NotAllowedError: Chrome bis zur ersten
   Interaktion mit der Seite, iPhone-Safari immer), merkt sich JOIN.pending das und der erste Tipp/Klick holt ihn nach (audioOnce in 90_main).
   ========================================================= */
const JOIN={el:null,src:'assets/sfx/join.mp3',last:0,pending:false};
function joinEl(){if(JOIN.el)return JOIN.el;const a=document.createElement('audio');a.src=(window.NK_ASSET_BASE||'')+JOIN.src;a.preload='auto';a.volume=.55;a.setAttribute('playsinline','');JOIN.el=a;return a;}
function joinSound(){
  if(typeof muted!=='undefined'&&muted)return;const a=joinEl(),t=Date.now()/1000;
  if(!a.paused&&!a.ended&&t-JOIN.last<19)return; // läuft gerade: nicht neu starten
  JOIN.last=t;JOIN.pending=false;try{a.currentTime=0;}catch(e){}const p=a.play();if(p&&p.then)p.then(()=>{JOIN.pending=false;},()=>{JOIN.pending=true;JOIN.last=0;}); // geblockt: beim ersten Tipp nachholen
}
function joinStop(){if(JOIN.el&&!JOIN.el.paused)JOIN.el.pause();}
// Knopf SONG (Kopfzeile / ≡-Menü): von vorn abspielen, auch wenn er gerade läuft
function joinReplay(){if(typeof muted!=='undefined'&&muted){toast('Ton ist aus (♪ oben).');return;}if(JOIN.el)JOIN.el.pause();JOIN.last=0;joinSound();}
{const b=document.getElementById('songBtn');if(b)b.addEventListener('click',()=>{SFX.click();joinReplay();});}
joinEl(); // schon beim Laden vorladen, damit er beim Start sofort da ist
