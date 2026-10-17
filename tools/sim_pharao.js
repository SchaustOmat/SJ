const S=require('../src/00_slotengine.js');
const K=['10','J','Q','K','A','SMARAGD','SAPHIR','RUBIN','BRILLANT','PHARAO'];
const R_=a=>{const o={};K.forEach((s,i)=>o[s]=a[i]);return o;};
const rows=JSON.parse(process.argv[2]);const scale=+process.argv[3]||1;
const G=S.setup('pharao',rows.map(R_),401,null,scale);
let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
let N=+process.argv[4]||2e6,tot=0,hits=0,p4=0,big=0;
for(let i=0;i<N;i++){const st=S.randStops(G,rnd);const g=S.grid(G,st);S.mystery(G,g,rnd);const e=S.evaluate(G,g,10,1);tot+=e.total;if(e.total>0)hits++;if(e.total>=40)p4++;if(e.total>=500)big++;}
console.log('RTP',(tot/N/10*100).toFixed(2),'hit 1/'+(N/hits).toFixed(2),'power 1/'+(N/p4).toFixed(1),'big500x? 1/'+(N/big|0));
