/* =========================================================
   VOLLBILD-AUTOMAT + GROSSE TISCH-KNÖPFE
   ========================================================= */
const SV={el:$('#slotView'),main:$('#svMain'),top:$('#svTop'),btn:{},m:null,last:{}};
SV.mctx=SV.main.getContext('2d');SV.tctx=SV.top.getContext('2d');SV.mctx.imageSmoothingEnabled=false;SV.tctx.imageSmoothingEnabled=false;
SVKEYS.forEach(k=>{const b=$('#sv-'+k);SV.btn[k]=b;
  b.addEventListener('pointerdown',e=>{e.preventDefault();if(SV.m)pressButton(SV.m,k);b.classList.add('down');setTimeout(()=>b.classList.remove('down'),120);});});
$('#svStand').addEventListener('click',()=>{SFX.click();leaveFocus();});
function svOpen(m){SV.m=m;SV.el.hidden=false;SV.last={};svLayout();svButtons(m);m.dirty=true;m.topDirty=true;$('#hudTop').hidden=true;}
function svClose(){SV.m=null;SV.el.hidden=true;if(started)$('#hudTop').hidden=false;}
function svLayout(){if(SV.el.hidden)return;const W=LW(),H=LH();SV.el.classList.toggle('land',W>H);}
function svButtons(m){
  if(m!==SV.m||!m.btnModel)return;
  SVKEYS.forEach(k=>{const b=SV.btn[k],d=m.btnModel[k];if(!d)return;
    if(b.textContent!==d.label)b.textContent=d.label;
    b.className='svb c-'+d.color+(d.lit?' lit':'')+(d.blink?' blink':'')+(k==='START'?' big':'');
    b.disabled=false;b.setAttribute('aria-disabled',String(!d.lit));});
}
function svDraw(m){
  if(m!==SV.m)return;
  const cr=fmt(chips-(m.fly?m.fly.pending:0)),bt=m.fs?('FREISPIEL '+Math.min(m.fs.n+(m.state==='spin'?1:0),m.fs.total)+'/'+m.fs.total):(fmt(totalBet(m))+'  ('+m.lines+'×'+betLine(m)+')'),wn=fmt(m.disp);
  if(SV.last.cr!==cr){$('#svCredit').textContent=cr;SV.last.cr=cr;}
  if(SV.last.bt!==bt){$('#svBet').textContent=bt;SV.last.bt=bt;}
  if(SV.last.wn!==wn){$('#svWin').textContent=wn;SV.last.wn=wn;$('#svWinBox').classList.toggle('on',m.disp>0);}
  if(SV.last.msg!==m.msg){$('#svMsg').textContent=m.msg||'';SV.last.msg=m.msg;}
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
function barsFor(type){if(PK.console)PK.console.visible=type!=='poker';if(HL.cg)HL.cg.visible=type!=='hilo';$('#pkBar').hidden=type!=='poker';$('#hlBar').hidden=type!=='hilo';$('#mtBar').hidden=type!=='mtable';if(type==='mtable')mtBarSync();if(type==='poker')pkBarSync();if(type==='hilo')hlBarSync();}
