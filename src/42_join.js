/* =========================================================
   BEGRÜSSUNGS-SONG BEIM BETRETEN (Nutzer-Wunsch 2026-10-23, Tonspur aus seinem Video: assets/sfx/join.mp3, ~20 s)
   Spielt für den Spieler selbst beim Start („HEREINSPAZIERT“) und beim Beitreten eines Raums,
   und für alle im Raum, sobald jemand Neues auftaucht (jeder Client spielt ihn lokal, wenn ein neuer Mitspieler erscheint).
   Läuft er gerade (mehrere kommen gleichzeitig), wird nicht neu gestartet. Ton-Schalter aus = stumm (laufender Song stoppt).
   iOS braucht den ersten play() in einer Tipp-Geste: darum wird er im Klick auf HEREINSPAZIERT bzw. beim Passwort-OK direkt aufgerufen.
   ========================================================= */
const JOIN={el:null,src:'assets/sfx/join.mp3',last:0};
function joinEl(){if(JOIN.el)return JOIN.el;const a=document.createElement('audio');a.src=(window.NK_ASSET_BASE||'')+JOIN.src;a.preload='auto';a.volume=.55;a.setAttribute('playsinline','');JOIN.el=a;return a;}
function joinSound(){
  if(typeof muted!=='undefined'&&muted)return;const a=joinEl(),t=Date.now()/1000;
  if(!a.paused&&!a.ended&&t-JOIN.last<19)return; // läuft gerade: nicht neu starten
  JOIN.last=t;try{a.currentTime=0;}catch(e){}const p=a.play();if(p&&p.catch)p.catch(()=>{});
}
function joinStop(){if(JOIN.el&&!JOIN.el.paused)JOIN.el.pause();}
joinEl(); // schon beim Laden vorladen, damit er beim Start sofort da ist
