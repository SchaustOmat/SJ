/* =========================================================
   VOLLBILD-AUTOMAT + GROSSE TISCH-KNÖPFE
   ========================================================= */
const SV={el:$('#slotView'),main:$('#svMain'),top:$('#svTop'),btn:{},m:null,last:{}};
SV.mctx=SV.main.getContext('2d');SV.tctx=SV.top.getContext('2d');SV.mctx.imageSmoothingEnabled=false;SV.tctx.imageSmoothingEnabled=false;
SVKEYS.forEach(k=>{const b=$('#sv-'+k);SV.btn[k]=b;
  b.addEventListener('pointerdown',e=>{e.preventDefault();if(SV.m)pressButton(SV.m,k);b.classList.add('down');setTimeout(()=>b.classList.remove('down'),120);});});
$('#svStand').addEventListener('click',()=>{SFX.click();leaveFocus();});
$('#svCard').addEventListener('click',()=>{const m=SV.m;if(!m)return;if(isMine(m))cardOut(m);else if(m.cashOn)svGate(m,true);});
// Beim Hinsetzen: Portemonnaie raus, Karte antippen -> Karte fährt rein -> ENTSPERRT
function svGateOn(m){const el=$('#svGate');return !!el&&!el.hidden&&SV.m===m;}
function svGate(m,feed){
  const el=$('#svGate');if(!el)return;if(!m||(slotLive(m)&&!feed)){el.hidden=true;return;}
  el.hidden=false;el.className='gwrap';el.dataset.st='enter';
  el.innerHTML='<div class="gate-slot"><i></i></div><div class="gate-box"><div class="gate-t">'+(feed?'SCHEIN REIN':'KARTE ODER SCHEIN')+'</div>'+walletHtml('gWallet')+'<div class="gate-bills" id="gBills"></div><p class="gate-h" id="gHint">Portemonnaie antippen</p>'+(feed?'<button type="button" class="gate-x" id="gDone">FERTIG</button>':'')+'</div>';
  requestAnimationFrame(()=>requestAnimationFrame(()=>{if(el.dataset.st==='enter')el.dataset.st='';}));
  const w=el.querySelector('#gWallet'),hint=el.querySelector('#gHint'),bl=el.querySelector('#gBills');
  const slotXY=()=>{let tx=innerWidth/2,ty=innerHeight*.12;try{const v=m.cardSlot.getWorldPosition(new THREE.Vector3()).project(camera);tx=(v.x*.5+.5)*innerWidth;ty=(-v.y*.5+.5)*innerHeight;}catch(_){}return [tx,ty];};
  const fillBills=()=>{if(typeof walletGateHtml==='function')bl.innerHTML=walletGateHtml();};fillBills();
  const done=el.querySelector('#gDone');if(done)done.addEventListener('click',e=>{e.stopPropagation();SFX.click();el.hidden=true;el.className='';});
  bl.addEventListener('click',e=>{e.stopPropagation();const b=e.target.closest('[data-v]');if(!b||el.dataset.st!=='open'||b.dataset.fly)return;const v=+b.dataset.v;
    if(!(v>0)||chips<v){toast('So viel Bargeld hast du nicht.');fillBills();return;}
    const [tx,ty]=slotXY(),r=b.getBoundingClientRect();b.dataset.fly='1';
    const f=b.cloneNode(true);f.className='gb-fly';f.style.left=r.left+'px';f.style.top=r.top+'px';f.style.width=r.width+'px';f.style.height=r.height+'px';document.body.appendChild(f);
    const sl=el.querySelector('.gate-slot');if(sl){sl.style.left=tx+'px';sl.style.top=ty+'px';}
    requestAnimationFrame(()=>{f.style.transform='translate('+(tx-r.left-r.width/2)+'px,'+(ty-r.top-r.height/2)+'px) scale(.35,.2)';f.style.opacity='.2';});
    SFX.card();delete b.dataset.fly;
    setTimeout(()=>{f.remove();if(SV.m!==m)return;if(typeof slotFeed==='function'&&slotFeed(m,v)){noise(.1,.12,1400);fillBills();
      if(!feed&&el.dataset.st==='open'){el.className='ok';el.dataset.st='';el.innerHTML='';unlockShow(m);setTimeout(()=>{if(SV.m===m)el.classList.add('out');},250);setTimeout(()=>{if(SV.m===m){el.hidden=true;el.className='';}},600);}}},520);});
  w.addEventListener('click',e=>{e.stopPropagation();
    if(el.dataset.st===''){el.dataset.st='open';SFX.click();noise(.12,.08,900);hint.textContent=feed?'Schein antippen':'Karte oder Schein antippen';return;}
    if(el.dataset.st==='open'&&e.target.closest('.gw-card')){
      // Ziel: der Kartenschlitz am Automaten (auf den Bildschirm projiziert)
      const card=w.querySelector('.gw-card'),cr=card.getBoundingClientRect();const [tx,ty]=slotXY();
      card.style.setProperty('--fx',(tx-(cr.left+cr.width/2))+'px');card.style.setProperty('--fy',(ty-(cr.top+cr.height/2))+'px');
      const sl=el.querySelector('.gate-slot');if(sl){sl.style.left=tx+'px';sl.style.top=ty+'px';}
      el.dataset.st='ins';SFX.card();hint.textContent='';
      setTimeout(()=>{if(SV.m!==m)return;el.classList.add('slot');SFX.click();},700);
      setTimeout(()=>{if(SV.m!==m)return;cardIn(m,true);noise(.12,.15,1800);el.className='ok';el.dataset.st='';el.innerHTML='';unlockShow(m);svCardSync();
        setTimeout(()=>{if(SV.m===m)el.classList.add('out');},250);setTimeout(()=>{if(SV.m===m){el.hidden=true;el.className='';}},600);},950);}});
}
function svOpen(m){SV.m=m;SV.el.hidden=false;SV.last={};svLayout();svButtons(m);svGate(m);m.dirty=true;m.topDirty=true;$('#hudTop').hidden=true;}
function svClose(){SV.m=null;SV.el.hidden=true;if(started)$('#hudTop').hidden=false;}
function svLayout(){if(SV.el.hidden)return;const W=LW(),H=LH();SV.el.classList.toggle('land',W>H);}
$('#mkLevel').addEventListener('pointerdown',e=>{e.preventDefault();if(SV.m)pressButton(SV.m,'EINSATZ');});
function svButtons(m){
  if(m!==SV.m||!m.btnModel)return;
  SVKEYS.forEach(k=>{const b=SV.btn[k],d=m.btnModel[k];if(!d)return;
    if(b.dataset.l!==d.label){b.dataset.l=d.label;
      // Merkur-Beschriftung wie am Gerät
      const MK={LEITER:{'RISIKO LEITER':'<small>Risiko 1:1</small><b>Leiter</b><small>Level</small>'},KARTE:{'RISIKO KARTE':'<small>Risiko 1:1</small><b>Karte</b><small>max.Level</small>'},
        AUTO:{'AUTO':'Starten','STOP':'Stop'},START:{'START':'Start','STOP':'Stopp','NEHMEN':'Nehmen','FREISPIEL':'Frei-<br>spiel'}};
      const h=MK[k]&&MK[k][d.label];if(h)b.innerHTML=h;else b.textContent=d.label;
      const kk=document.createElement('span');kk.className='key';kk.textContent=SVHOT[k]||'';b.appendChild(kk);}
    b.className='svb c-'+d.color+(d.lit?' lit':'')+(d.blink?' blink':'')+(k==='START'?' big':'');
    b.disabled=false;b.setAttribute('aria-disabled',String(!d.lit));});
}
function svDraw(m){
  if(m!==SV.m)return;
  const cr=slotLive(m)?fmt(slotBal(m)-(m.fly?m.fly.pending:0)):'KARTE STECKEN',bt=m.fs?('FREISPIEL '+Math.min(m.fs.n+(m.state==='spin'?1:0),m.fs.total)+'/'+m.fs.total):(fmt(totalBet(m))+'  ('+m.lines+'×'+betLine(m)+')'),wn=fmt(m.disp);
  if(SV.last.cr!==cr){$('#svCredit').textContent=cr;SV.last.cr=cr;}
  if(SV.last.bt!==bt){$('#svBet').textContent=bt;SV.last.bt=bt;}
  if(SV.last.wn!==wn){$('#svWin').textContent=wn;SV.last.wn=wn;$('#svWinBox').classList.toggle('on',m.disp>0);}
  if(SV.last.msg!==m.msg){$('#svMsg').textContent=m.msg||'';SV.last.msg=m.msg;}
  // ERFOLG und LEVEL wie am Merkur-Gerät (Euro groß, Cent klein)
  const eu=v=>{v=Math.max(0,Math.round(v));return (Math.floor(v/100))+'<small>'+String(v%100).padStart(2,'0')+'</small>';};
  const ef=eu(m.disp),lv=eu(totalBet(m));
  if(SV.last.ef!==ef){$('#mkErfolg b').innerHTML=ef;SV.last.ef=ef;}
  if(SV.last.lv!==lv){$('#mkLevel b').innerHTML=lv;SV.last.lv=lv;}
}

/* ---- Poker ---- */
const PKB={el:$('#pkBar'),btn:{}};
['FOLD','CALL','MINUS','RAISE','PLUS','ALLIN'].forEach(k=>{const b=$('#pk-'+k);PKB.btn[k]=b;
  b.addEventListener('pointerdown',e=>{e.preventDefault();pressPBtn(k);b.classList.add('down');setTimeout(()=>b.classList.remove('down'),120);});});
function pkBarSync(){
  if(!PK.btns.FOLD)return;
  for(const k in PKB.btn){const s=PK.btns[k],b=PKB.btn[k];if(!s)continue;if(b.textContent!==s.label)b.textContent=s.label;b.classList.toggle('lit',!!s.lit);}
  const h=PK.human,toCall=Math.max(0,PK.curBet-h.bet);
  $('#pkInfo').textContent='STACK '+fmt(h.stack)+' · POT '+fmt(potTotal())+(humanTurn()&&toCall>0?' · ZAHLEN '+fmt(toCall):'');
  $('#pkMsg').textContent=humanTurn()?'DU BIST DRAN':(PK.info||PK.msg||'');
  $('#pkMsg').classList.toggle('go',humanTurn());
  const live=PK.stage!=='off'&&!h.out&&h.hole.length===2;
  let html='';
  if(live){
    html+='<div class="pcg"><span class="pcl">TISCH</span><div class="pcs">';
    for(let i=0;i<5;i++)html+=PK.board[i]!==undefined?cardHTML(PK.board[i]):'<span class="pc empty"></span>';
    html+='</div></div><div class="pcg me'+(h.folded?' fold':'')+'"><span class="pcl">DU</span><div class="pcs">'+cardHTML(h.hole[0])+cardHTML(h.hole[1])+'</div></div>';
  }
  if(PK.stage==='show'){
    html+='<div class="pshow">'+PK.seats.filter(x=>!x.human&&!x.folded&&x.hole.length===2).map(x=>'<span class="psn">'+x.name+'</span>'+cardHTML(x.hole[0],1)+cardHTML(x.hole[1],1)).join('')+'</div>';
  }
  const el=$('#pkCards');if(el.innerHTML!==html)el.innerHTML=html;el.hidden=!html;
}
function cardHTML(c,sm){const r=c%13,s=(c/13)|0,red=s===1||s===2;return '<span class="pc'+(red?' red':'')+(sm?' sm':'')+'">'+RANKN[r]+'<b>'+SUITS[s]+'</b></span>';}
/* ---- Höher/Tiefer ---- */
const HLB={btn:{}};
['MINUS','PLUS','GEBEN','NEHMEN','WEITER'].forEach(k=>{const b=$('#hl-'+k);HLB.btn[k]=b;
  b.addEventListener('pointerdown',e=>{e.preventDefault();hlPress(k);b.classList.add('down');setTimeout(()=>b.classList.remove('down'),120);});});
[0,1,2,3].forEach(i=>{const b=$('#hlc-'+i);b.addEventListener('pointerdown',e=>{e.preventDefault();hlPick(i);});});
function hlBarSync(){
  if(!HL.btns.GEBEN)return;
  for(const k in HLB.btn){const s=HL.btns[k],b=HLB.btn[k];if(b.textContent!==s.label)b.textContent=s.label;b.classList.toggle('lit',!!s.lit);}
  const pick=HL.state==='pick';$('#hlCards').hidden=!pick;$('#hlRow').hidden=pick;
  $('#hlInfo').textContent=HL.state==='bet'?'EINSATZ '+fmt(hlStake()):'IM SPIEL '+fmt(HL.pending)+(HL.state==='decide'?' → WEITER: '+fmt(HL.pending*2):'');
  $('#hlMsg').textContent=HL.msg||(HL.state==='bet'?'EINSATZ WÄHLEN, DANN GEBEN':'');
  let html='';
  if(HL.open!==null&&HL.state!=='bet'&&HL.state!=='deal'){
    html='<div class="pcg"><span class="pcl">BANK</span><div class="pcs">'+cardHTML(HL.open)+'</div></div>';
    if(HL.pick>=0&&HL.state!=='pick')html+='<div class="pcg me"><span class="pcl">DEINE</span><div class="pcs">'+cardHTML(HL.hidden[HL.pick])+'</div></div>';
  }
  const el=$('#hlView');if(el.innerHTML!==html)el.innerHTML=html;el.hidden=!html;
}
function barsFor(type){if(PK.console)PK.console.visible=type!=='poker';if(HL.cg)HL.cg.visible=type!=='hilo';if(CR.cg)CR.cg.visible=type!=='crash';$('#pkBar').hidden=type!=='poker';$('#hlBar').hidden=type!=='hilo';$('#mtBar').hidden=type!=='mtable';$('#crBar').hidden=type!=='crash';if(type==='crash')crBarSync();if(type==='mtable')mtBarSync();if(type==='poker')pkBarSync();if(type==='hilo')hlBarSync();}
