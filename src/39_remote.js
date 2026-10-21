/* =========================================================
   TASTENLEISTE AM HANDY: eigene Automaten (Karte steckt) in Reichweite (bis 3, nächster oben) bekommen unten rechts
   eine kleine Leiste START · AUTO · LEITER · KARTE – so lassen sich mehrere Automaten im Stehen bedienen.
   Am PC gibt es die Leiste nicht: dort klickt man die Tasten direkt am Pult an.
   ========================================================= */
const RM={el:null,rows:new Map()};
const RM_KEYS=['START','AUTO','LEITER','KARTE'];
function rmHide(){if(RM.el&&!RM.el.hidden)RM.el.hidden=true;}
function rmUpdate(){
  const el=RM.el||(RM.el=$('#rmBar'));if(!el)return;
  if(PC||!started||locked||focus||!F){rmHide();return;}
  const list=[...RESVS].filter(m=>m.F===F&&m.act).map(m=>({m,d:Math.hypot(m.act.pos.x-P.x,m.act.pos.z-P.z)})).filter(o=>o.d<3.4).sort((a,b)=>a.d-b.d).slice(0,3);
  if(!list.length){rmHide();return;}
  el.hidden=false;
  const keep=new Set(list.map(o=>o.m));
  RM.rows.forEach((row,m)=>{if(!keep.has(m)){row.remove();RM.rows.delete(m);}});
  list.forEach((o,i)=>{let row=RM.rows.get(o.m);
    if(!row){row=document.createElement('div');row.className='rm-row';const n=document.createElement('span');n.className='rm-n';row.appendChild(n);
      RM_KEYS.forEach(k=>{const b=document.createElement('button');b.type='button';b.dataset.k=k;
        b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();pressButton(o.m,k);b.classList.add('down');setTimeout(()=>b.classList.remove('down'),120);});
        row.appendChild(b);});
      RM.rows.set(o.m,row);}
    if(el.children[i]!==row)el.insertBefore(row,el.children[i]||null);
    const bm=o.m.btnModel||btnModel(o.m),txt=o.m.G.title+(o.m.disp>0?' · '+fmt(o.m.disp):'');
    if(row.firstChild.textContent!==txt)row.firstChild.textContent=txt;
    row.querySelectorAll('button').forEach(b=>{const d=bm[b.dataset.k];if(!d)return;const lab=d.label.replace('RISIKO ','');if(b.textContent!==lab)b.textContent=lab;
      const [bg,fg]=BTNCOL[d.color]||BTNCOL.white,on=d.lit&&(!d.blink||Math.floor(now*3)%2===0);
      b.style.background=on?bg:'#2a2630';b.style.color=on?fg:'#8a8090';b.style.opacity=d.lit?1:.6;});});
}
