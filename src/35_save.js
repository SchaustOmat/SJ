/* =========================================================
   SPIELSTAND: Chips gehen nicht verloren
   - Mehrere Tabs/Fenster: alle zeigen denselben Stand (der zuletzt geänderte gilt)
   - Browser wird gebeten, den Speicher dauerhaft zu behalten
   - Claude-Version: zusätzlich Sicherung im Konto (falls der Speicher der App geleert wird)
   ========================================================= */
function totalWealth(){
  let t=chips;
  if(typeof PK!=='undefined'&&PK.sitting)t+=PK.human.stack;
  if(typeof MT!=='undefined'&&MT.deducted&&mtMySeat()>=0)t+=TABLES[MT.table].view.seats[mtMySeat()].st;
  if(typeof HL!=='undefined'&&HL.pending>0)t+=HL.pending;
  if(typeof focus!=='undefined'&&focus&&focus.type==='slot'&&focus.m.win>0)t+=focus.m.win;
  return Math.max(0,Math.round(t));
}
let saveT=null,cloudDoc=null;
function saveChanged(){
  try{localStorage.setItem('nk_t',String(Date.now()));}catch(e){}
  if(!cloudDoc)return;clearTimeout(saveT);
  saveT=setTimeout(()=>{cloudDoc.set({chips:totalWealth(),t:Date.now()}).catch(()=>{});},1500);
}
// anderer Tab hat Chips geändert
addEventListener('storage',e=>{
  if(e.key!=='nk_chips'||e.newValue===null)return;const v=+e.newValue;
  if(!isFinite(v)||v===chips)return;chips=Math.max(0,Math.round(v));$('#chips').textContent=fmt(chips);
});
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist().catch(()=>{});}catch(e){}
async function cloudSaveInit(){
  if(window.NK_STANDALONE||!window.claude||typeof window.claude.use!=='function')return;
  let db=null,user=null;try{db=await window.claude.use('db');user=await window.claude.use('user');}catch(e){return;}
  if(!db||!user)return;
  let uid=null;try{uid=await user.id();}catch(e){}if(!uid)return;
  const doc=db.doc('data/users/'+uid+'/save');
  try{
    const snap=await doc.get();let localT=0;try{localT=+(localStorage.getItem('nk_t')||0);}catch(e){}
    if(snap.exists){const d=snap.data()||{};const v=+d.chips,t=+d.t||0;
      if(isFinite(v)&&v>=0&&t>localT&&!focus){setChips(v);toast('Spielstand geladen: '+fmt(v)+' Chips');}}
  }catch(e){}
  cloudDoc=doc;saveChanged();
}
