// Doppel Buch: Quote für Einzelbuch und Doppelbuch nachrechnen.
//   node tools/doppel_sim.js '<counts-json 5x10>' [runden] [fsCounts-json]
// Regeln (Nutzer 2026-10-21, nach dem echten Gerät): Einzelbuch zahlt den Spielplan doppelt (2 Forscherinnen bei 0,10 € = 0,20 €,
// 5 Forscherinnen = 100 €), Doppelbuch kostet den doppelten Einsatz und zahlt im Grundspiel die Hälfte davon, in den Freispielen voll
// (15 Freispiele, 2 Sondersymbole). Im Code: payLine = betLine × (Doppelbuch im Grundspiel ? 1 : 2).
const E=require('../src/00_slotengine.js');
const DK=['10','J','Q','K','A','SKARAB','GREIF','MASKE','FORSCH','BUCH'];
const R_=a=>{const o={};DK.forEach((s,i)=>o[s]=a[i]);return o;};
const DEF=[[4,2,6,4,2,1,1,4,3,1],[4,6,6,7,5,2,1,3,6,1],[7,6,6,6,5,4,1,2,3,2],[9,6,8,4,4,2,4,2,3,1],[6,7,7,6,5,2,2,2,1,1]];
const rows=process.argv[2]&&process.argv[2]!=='-'?JSON.parse(process.argv[2]):DEF,N=+process.argv[3]||1e6;
const fsRows=process.argv[4]?JSON.parse(process.argv[4]):null;
const STK=process.argv[5]?+process.argv[5]:null;if(STK!==null)E.GAMES.doppel.stack=STK; // Test: Stapelhöhe im Grundspiel
const G=E.setup('doppel',rows.map(R_),706,fsRows?fsRows.map(R_):null);
function rng(seed){let s=seed;return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return ((s>>>0)/4294967296);};}
function sim(dbl){
  const r=rng(dbl?777:12345),lines=5,bet=lines*(dbl?2:1),fB=dbl?1:2,fF=2,FC=dbl?15:10;
  const cand=G.syms.filter(s=>s!==G.wild&&s!==G.scatter);
  let ret=0,base=0,fsRet=0,trig=0,hits=0,fsSpins=0;
  for(let i=0;i<N;i++){
    const ev=E.evaluate(G,E.grid(G,E.randStops(G,r)),lines,fB,null,false);ret+=ev.total;base+=ev.total;if(ev.total>0)hits++;
    if(ev.trigger){trig++;let left=FC;let sp=cand[Math.floor(r()*cand.length)];if(dbl){let b;do{b=cand[Math.floor(r()*cand.length)];}while(b===sp);sp=[sp,b];}
      while(left>0&&fsSpins<N*40){left--;fsSpins++;const e2=E.evaluate(G,E.grid(G,E.randStops(G,r,true),true),lines,fF,sp,true);ret+=e2.total;fsRet+=e2.total;if(e2.trigger)left+=FC;}}
  }
  return {modus:dbl?'DOPPELBUCH':'EINZELBUCH',rtp:(ret/(N*bet)*100).toFixed(2)+'%',grund:(base/(N*bet)*100).toFixed(2)+'%',freispiele:(fsRet/(N*bet)*100).toFixed(2)+'%',fsAlle:trig?Math.round(N/trig):0,trefferAlle:(N/hits).toFixed(2),fsSpinsProTrigger:trig?(fsSpins/trig).toFixed(1):0};
}
console.log(sim(false));console.log(sim(true));
