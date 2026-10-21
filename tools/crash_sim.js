// Quote von Crash prüfen: node tools/crash_sim.js [runden]
// Crash-Punkt wie im Spiel (27_crash.js): 3 % sofort ×1,00, sonst floor(100·0,97/(1−u))/100, max ×1000.
const N=+process.argv[2]||2000000,EDGE=.97;
function crPoint(){const u=Math.random();if(u<1-EDGE)return 1;return Math.min(1000,Math.max(1,Math.floor(100*EDGE/(1-u))/100));}
const targets=[1.1,1.2,1.5,2,3,5,10,20,50,100];
const bet=200;const pay={},cnt={};targets.forEach(t=>{pay[t]=0;cnt[t]=0;});
let ge2=0,inst=0;
for(let i=0;i<N;i++){const c=crPoint();if(c>=2)ge2++;if(c===1)inst++;
  for(const t of targets){if(c>=t){pay[t]+=Math.floor(bet*t/10)*10;cnt[t]++;}}}
console.log('Runden',N,'| sofort ×1,00:',(inst/N*100).toFixed(2)+'%','| Crash ≥ ×2:',(ge2/N*100).toFixed(1)+'%');
for(const t of targets)console.log('Auto ×'+t.toFixed(2).padStart(6),'  Quote',(pay[t]/(bet*N)*100).toFixed(2)+'%','  Treffer',(cnt[t]/N*100).toFixed(2)+'%');
