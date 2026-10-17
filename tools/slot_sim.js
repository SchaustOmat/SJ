const E=require('../src/00_slotengine.js');
function rng(seed){let s=seed;return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return ((s>>>0)/4294967296);};}
function simBook(counts,N){
  const G=E.setup('book',counts,101);const r=rng(12345);const lines=10,bl=1,bet=10;
  let ret=0,base=0,fsRet=0,trig=0,hits=0,maxW=0;const keys=G.syms.filter(s=>s!=='BUCH');
  for(let i=0;i<N;i++){
    const g=E.grid(G,E.randStops(G,r));const ev=E.evaluate(G,g,lines,bl,null);
    ret+=ev.total;base+=ev.total;if(ev.total>0)hits++;let w=ev.total;
    if(ev.trigger){trig++;let left=10;const sp=keys[Math.floor(r()*keys.length)];
      while(left>0){left--;const g2=E.grid(G,E.randStops(G,r));const e2=E.evaluate(G,g2,lines,bl,sp);ret+=e2.total;fsRet+=e2.total;w+=e2.total;if(e2.trigger)left+=10;}}
    if(w>maxW)maxW=w;
  }
  return {rtp:ret/(N*bet),base:base/(N*bet),fs:fsRet/(N*bet),trig:N/trig,hit:N/hits,maxW:maxW/bet,len:G.strips.map(s=>s.length)};
}
function simFruit(counts,N){
  const G=E.setup('fruit',counts,202);const r=rng(999);const lines=5,bl=1,bet=5;let ret=0,hits=0,maxW=0;
  for(let i=0;i<N;i++){const g=E.grid(G,E.randStops(G,r));const ev=E.evaluate(G,g,lines,bl,null);ret+=ev.total;if(ev.total>0)hits++;if(ev.total>maxW)maxW=ev.total;}
  return {rtp:ret/(N*bet),hit:N/hits,maxW:maxW/bet,len:G.strips.map(s=>s.length)};
}
module.exports={simBook,simFruit};
if(require.main===module){
  const arg=JSON.parse(process.argv[2]);const N=+process.argv[3]||2e6;
  console.log(JSON.stringify(arg.game==='book'?simBook(arg.counts,N):simFruit(arg.counts,N)));
}
