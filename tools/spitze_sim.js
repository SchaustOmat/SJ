// Alles Spitze Simulation: node spitze_sim.js '{"LEER":180,"KLEE":95,"PFEN":38,"KAEF":10,"KOEN":4,"TEUF":50}' fullPays N
const W=JSON.parse(process.argv[2]);const fullPays=process.argv[3]!=='0';const N=+process.argv[4]||3e6;
const SPL={KLEE:[1,2,3,5,10],PFEN:[3,6,10,20,50],KAEF:[10,25,50,100,350]},JP=500,K=['KLEE','PFEN','KAEF'];
const syms=Object.keys(W),tot=syms.reduce((a,s)=>a+W[s],0),cum=[];let c=0;for(const s of syms){c+=W[s];cum.push(c);}
const draw=()=>{const r=Math.random()*tot;for(let i=0;i<cum.length;i++)if(r<cum[i])return syms[i];};
const pot=lv=>K.reduce((a,k)=>a+(lv[k]>0&&lv[k]<5?SPL[k][lv[k]-1]:0),0);
for(const T of [0.0001,2,5,10,20,50,1e9]){let lv={KLEE:0,PFEN:0,KAEF:0},bet=0,win=0,jp=0;
  for(let n=0;n<N;n++){bet++;const s=draw();
    const up=k=>{if(lv[k]>=5){if(fullPays)win+=SPL[k][4];return;}lv[k]++;if(lv[k]===5)win+=SPL[k][4];};
    if(s==='KOEN')K.forEach(up);else if(s==='TEUF')lv={KLEE:0,PFEN:0,KAEF:0};else if(SPL[s])up(s);
    if(K.every(k=>lv[k]>=5)){win+=JP;jp++;lv={KLEE:0,PFEN:0,KAEF:0};}
    const p=pot(lv);if(p>=T){win+=p;K.forEach(k=>{if(lv[k]<5)lv[k]=0;});}}
  console.log('nehmen ab',T>1e8?'nie':T<1?'sofort':T+'x','RTP',(win/bet*100).toFixed(2)+'%','JP 1:'+(jp?Math.round(N/jp):'-'));}
