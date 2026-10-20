// V1: Leiste voll (Stufe 5) zählt mit Höchstwert im Cashpot; trifft das Symbol die volle Leiste -> Höchstwert direkt, Leiste auf 0.
// Sonne hebt alle; Teufel alles auf 0; alle drei voll -> 500x + alles auf 0. Nehmen: Cashpot (alle Leisten) auszahlen, alle auf 0.
const W=JSON.parse(process.argv[2]);const N=+process.argv[3]||1e6;
const SPL={KLEE:[1,2,3,5,10],PFEN:[3,6,10,20,50],KAEF:[10,25,50,100,350]},JP=500,K=['KLEE','PFEN','KAEF'];
const syms=Object.keys(W),tot=syms.reduce((a,s)=>a+W[s],0),cum=[];let c=0;for(const s of syms){c+=W[s];cum.push(c);}
const draw=()=>{const r=Math.random()*tot;for(let i=0;i<cum.length;i++)if(r<cum[i])return syms[i];};
const pot=lv=>K.reduce((a,k)=>a+(lv[k]>0?SPL[k][lv[k]-1]:0),0);
const out=[];
for(const T of [0.0001,5,10,20,50,100,1e9]){let lv={KLEE:0,PFEN:0,KAEF:0},bet=0,win=0,jp=0,full=0,dir=0;
  for(let n=0;n<N;n++){bet++;const s=draw();
    const up=k=>{if(lv[k]>=5){win+=SPL[k][4];dir++;lv[k]=0;return;}lv[k]++;if(lv[k]===5)full++;};
    if(s==='KOEN')K.forEach(up);else if(s==='TEUF')lv={KLEE:0,PFEN:0,KAEF:0};else if(SPL[s])up(s);
    if(K.every(k=>lv[k]>=5)){win+=JP;jp++;lv={KLEE:0,PFEN:0,KAEF:0};}
    const p=pot(lv);if(p>=T){win+=p;lv={KLEE:0,PFEN:0,KAEF:0};}}
  out.push((T>1e8?'nie':T<1?'sofort':T+'x')+' '+(win/bet*100).toFixed(1)+'%');}
console.log(JSON.stringify(W),'|',out.join(' | '));
