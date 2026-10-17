// Rechnet die Auszahlungsquote der Automaten nach: node tools/slot_sim.js <spiel> [anzahl]
const E=require('../src/00_slotengine.js');
function rng(seed){let s=seed;return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return ((s>>>0)/4294967296);};}
function sim(id,counts,fsCounts,N,seed,scale){
  const G=E.setup(id,counts,seed||101,fsCounts,scale);const r=rng(12345);const lines=G.lineOpts[G.lineOpts.length-1],bet=lines;
  let ret=0,base=0,fsRet=0,trig=0,hits=0;const cand=G.syms.filter(s=>s!==G.wild);
  for(let i=0;i<N;i++){
    const ev=E.evaluate(G,E.grid(G,E.randStops(G,r)),lines,1,null,false);ret+=ev.total;base+=ev.total;if(ev.total>0)hits++;
    if(ev.trigger){trig++;let left=G.free.count;const sp=G.free.expanding===undefined&&G.id==='book'?cand[Math.floor(r()*cand.length)]:(G.free.expanding?cand[Math.floor(r()*cand.length)]:null);
      while(left>0){left--;const e2=E.evaluate(G,E.grid(G,E.randStops(G,r,true),true),lines,1,sp,true);ret+=e2.total;fsRet+=e2.total;if(e2.trigger)left+=G.free.count;}}
  }
  return {rtp:+(ret/(N*bet)).toFixed(4),base:+(base/(N*bet)).toFixed(4),fs:+(fsRet/(N*bet)).toFixed(4),fsEvery:trig?Math.round(N/trig):0,hitEvery:+(N/hits).toFixed(2)};
}
module.exports={sim};
