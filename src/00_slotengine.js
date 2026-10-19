/* ===== SLOT ENGINE (shared by game + simulation) ===== */
var SlotEngine=(function(){
  function seededShuffle(arr,seed){var s=seed|0||1;function r(){s=(s*16807)%2147483647;return (s-1)/2147483646;}
    for(var i=arr.length-1;i>0;i--){var j=Math.floor(r()*(i+1));var t=arr[i];arr[i]=arr[j];arr[j]=t;}
    return arr;}
  function buildStrips(counts,seed){
    return counts.map(function(c,ri){var a=[];Object.keys(c).forEach(function(k){for(var i=0;i<c[k];i++)a.push(k);});
      seededShuffle(a,seed+ri*7919);
      // avoid two scatters within 3 positions (one scatter max per visible window)
      for(var pass=0;pass<50;pass++){var moved=false;for(var i=0;i<a.length;i++){if(a[i]!==SCAT_TMP)continue;for(var d=1;d<=2;d++){var j=(i+d)%a.length;if(a[j]===SCAT_TMP){var k=(j+5)%a.length;var t=a[j];a[j]=a[k];a[k]=t;moved=true;}}}if(!moved)break;}
      return a;});
  }
  var SCAT_TMP=null;
  var LINES10=[[1,1,1,1,1],[0,0,0,0,0],[2,2,2,2,2],[0,1,2,1,0],[2,1,0,1,2],[1,2,2,2,1],[1,0,0,0,1],[2,2,1,0,0],[0,0,1,2,2],[2,1,1,1,0]];
  // Gewinnlinien wie beim echten Lucky Pharaoh Wild (6-10 anders als bei den anderen Spielen)
  var LINES_LP=LINES10.slice(0,5).concat([[1,0,1,0,1],[1,2,2,2,1],[0,0,1,2,2],[2,2,1,0,0],[0,1,1,1,0]]);
  var LINES20=LINES10.concat([[1,2,1,0,1],[1,0,1,2,1],[0,1,1,1,0],[2,1,1,1,2],[0,1,0,1,0],[2,1,2,1,2],[1,1,0,1,1],[1,1,2,1,1],[0,0,2,0,0],[2,2,0,2,2]]);
  var GAMES={
    book:{id:'book',title:'GRABKAMMER',sub:'DAS BUCH DER TOTEN',lines:LINES10,lineOpts:[10],betOpts:[1,2,4,6,8,10,20,40,60,80,100,200],
      wild:'BUCH',scatter:'BUCH',low:['10','J','Q','K','A'],
      pay:{'10':[0,0,0,5,25,100],'J':[0,0,0,5,25,100],'Q':[0,0,0,5,25,100],'K':[0,0,0,5,40,150],'A':[0,0,0,5,40,150],'ANKH':[0,0,5,30,100,800],'SKARAB':[0,0,5,30,100,800],'PYRAMIDE':[0,0,5,40,400,2000],'MASKE':[0,0,10,100,1000,5000]},
      scatterPay:[0,0,0,2,20,200],free:{count:10,trigger:3,expanding:true},
      counts:null},
    fruit:{id:'fruit',title:'GLUTOFEN',sub:'HEISSE FRÜCHTE',lines:LINES10.slice(0,5),lineOpts:[5],betOpts:[2,4,8,12,16,20,40,80,120,160,200,400],
      wild:null,scatter:'STERN',
      pay:{'KIRSCHE':[0,0,5,20,50,200],'ZITRONE':[0,0,0,20,50,200],'ORANGE':[0,0,0,20,50,200],'PFLAUME':[0,0,0,20,50,200],'TRAUBE':[0,0,0,50,120,500],'MELONE':[0,0,0,50,120,500],'SIEBEN':[0,0,0,100,1000,5000]},
      scatterPay:[0,0,0,2,10,50],free:null,counts:null},
    // Freispiele: Gewinne x3
    viking:{id:'viking',title:'WIKINGERGOLD',sub:'DER SCHATZ IM NORDEN',lines:LINES10,lineOpts:[10],betOpts:[1,2,4,6,8,10,20,40,60,80,100,200],
      wild:'HELM',scatter:'RUNE',
      pay:{'10':[0,0,0,6,30,120],'J':[0,0,0,6,30,120],'Q':[0,0,0,6,30,150],'K':[0,0,0,15,40,150],'A':[0,0,0,15,40,150],'AXT':[0,0,0,30,120,400],'SCHILD':[0,0,0,30,150,600],'DRACHE':[0,0,6,60,300,1500],'HELM':[0,0,15,150,750,3000]},
      scatterPay:[0,0,0,3,15,100],free:{count:12,trigger:3,mult:3,desc:['12 FREISPIELE','ALLE GEWINNE ×3']},counts:null},
    // Freispiele: Walzen voller Joker
    mine:{id:'mine',title:'DIAMANTMINE',sub:'GRABEN BIS ZUM GLÜCK',lines:LINES10,lineOpts:[10],betOpts:[1,2,4,6,8,10,20,40,60,80,100,200],
      wild:'DIAMANT',scatter:'LORE',
      pay:{'10':[0,0,0,8,30,120],'J':[0,0,0,8,30,120],'Q':[0,0,0,8,40,150],'K':[0,0,0,15,50,200],'A':[0,0,0,15,50,200],'LATERNE':[0,0,0,30,120,500],'HACKE':[0,0,0,40,150,600],'NUGGET':[0,0,8,60,300,1500],'DIAMANT':[0,0,15,150,750,4000]},
      scatterPay:[0,0,0,0,10,100],free:{count:10,trigger:3,mult:1,fsWild:true,desc:['10 FREISPIELE','MIT EXTRA-JOKERN']},counts:null},
    // Joker verdoppelt jeden Gewinn, Freispiele x3
    reef:{id:'reef',title:'DELFINRIFF',sub:'PERLEN DER TIEFE',lines:LINES10,lineOpts:[10],betOpts:[1,2,4,6,8,10,20,40,60,80,100,200],
      wild:'DELFIN',scatter:'MUSCHEL',wildDouble:true,
      pay:{'10':[0,0,0,4,15,60],'J':[0,0,0,4,15,60],'Q':[0,0,0,4,20,80],'K':[0,0,0,8,25,100],'A':[0,0,0,8,25,100],'FISCH':[0,0,0,15,60,200],'SEESTERN':[0,0,0,20,80,300],'PERLE':[0,0,4,30,150,800],'DELFIN':[0,0,8,120,600,3000]},
      scatterPay:[0,0,0,2,10,100],free:{count:15,trigger:3,mult:3,desc:['15 FREISPIELE ×3','JOKER = DOPPELT']},counts:null},
    // Freispiele: Joker breiten sich über die ganze Walze aus
    temple:{id:'temple',title:'TEMPELFEUER',sub:'DIE FLAMME DER GÖTTER',lines:LINES10,lineOpts:[10],betOpts:[1,2,4,6,8,10,20,40,60,80,100,200],
      wild:'FEUER',scatter:'TEMPEL',
      pay:{'10':[0,0,0,6,30,120],'J':[0,0,0,6,30,120],'Q':[0,0,0,6,30,150],'K':[0,0,0,15,40,150],'A':[0,0,0,15,40,150],'KELCH':[0,0,0,30,120,400],'SCHLANGE':[0,0,0,30,150,600],'STATUE':[0,0,6,60,300,1500],'FEUER':[0,0,15,150,750,3000]},
      scatterPay:[0,0,0,2,10,100],free:{count:10,trigger:3,mult:1,wildExpand:true,desc:['10 FREISPIELE','JOKER FÜLLT WALZE']},counts:null},
    // Gewinne in beide Richtungen + 3 in der Mitte, Pharao ersetzt alles, POWER SPINS ab 4-fachem Einsatz
    pharao:{id:'pharao',title:'PHARAO WILD',sub:'DIE SCHATZKAMMER',lines:LINES_LP,lineOpts:[10],betOpts:[1,2,4,6,8,10,20,40,60,80,100,200],
      wild:'PHARAO',scatter:null,bothWays:true,power:true,top:'BRILLANT',wildStack:[1,1,3,1,1],
      // Zufallssymbole: manchmal werden Felder verdeckt und öffnen alle dasselbe zufällige Symbol
      mystery:{chance:1/62,shape:[.3,.25,.25],w:{'10':7,'J':7,'Q':7,'K':5,'A':5,'SMARAGD':2,'SAPHIR':2,'RUBIN':.4,'BRILLANT':.3,'PHARAO':.3}},
      // Gewinnplan wie der echte Merkur-Spielplan bei 0,20 € (Diamant 2/10/100 €, Rubin 1,40/4/8 €, Saphir/Smaragd 1/2/6 €, A/K 0,40/1/4 €, Q/J/10 0,20/0,60/2 €), pro Linie bei 1 Cent je Linie
      pay:{'10':[0,0,0,10,30,100],'J':[0,0,0,10,30,100],'Q':[0,0,0,10,30,100],'K':[0,0,0,20,50,200],'A':[0,0,0,20,50,200],
           'SMARAGD':[0,0,0,50,100,300],'SAPHIR':[0,0,0,50,100,300],'RUBIN':[0,0,0,70,200,400],'BRILLANT':[0,0,0,100,500,5000]},
      scatterPay:[0,0,0,0,0,0],free:null,counts:null},
    // Zentaurus Power Spins: 20 Linien, Zentaur = Wild und verdoppelt je Zentaur auf der Linie, 3 Münzen = 10 Freispiele mit Superspin, Power Spins
    // Echter Merkur-Gewinnplan bei 0,10 € und 20 Linien (Linieneinsatz 0,5 Cent: lineDiv 2, Gewinne hier pro 0,5-Cent-Einheit in halben Cent)
    zent:{id:'zent',title:'ZENTAURUS',sub:'SUPERSPIN',lines:LINES20,lineOpts:[20],lineDiv:2,betOpts:[1,2,4,6,8,10,20,40,60,80,100],
      wild:'ZENT',scatter:'MUENZE',wildMult:true,top:'OLYMP',
      pay:{'9':[0,0,0,20,40,80],'10':[0,0,0,20,40,80],'J':[0,0,0,20,80,160],'Q':[0,0,0,20,80,160],'K':[0,0,0,40,120,320],'A':[0,0,0,40,120,320],
           'FUELL':[0,0,0,80,160,480],'VASE':[0,0,0,160,320,640],'HARFE':[0,0,160,320,640,1600],'OLYMP':[0,0,400,800,1200,4000],'ZENT':[0,0,0,0,0,100000]},
      scatterPay:[0,0,0,0,0,0],free:{count:10,trigger:3,superspin:true,desc:['10 FREISPIELE','MIT SUPERSPIN']},counts:null},
    // Tizona: 10 Linien, Schwert = wanderndes Wild (zieht jede Runde eine Walze nach links), 3/4/5 Schilde = 10/15/20 Freispiele, dort wächst das Schwert
    tizona:{id:'tizona',title:'TIZONA',sub:'DAS SCHWERT DES CID',lines:LINES10,lineOpts:[10],betOpts:[1,2,4,6,8,10,20,40,60,80,100,200],
      wild:'SCHWERT',scatter:'SCHILD',walkWild:true,top:'RITTER',
      pay:{'10':[0,0,0,5,25,100],'J':[0,0,0,5,25,100],'Q':[0,0,0,5,25,100],'K':[0,0,0,10,40,150],'A':[0,0,0,10,40,150],
           'TRUHE':[0,0,0,20,75,500],'HANDS':[0,0,0,20,75,500],'BURG':[0,0,10,50,500,1000],'ROSS':[0,0,10,50,500,1000],'RITTER':[0,0,10,100,1000,3000]},
      scatterPay:[0,0,0,0,0,0],free:{count:10,byCount:[0,0,0,10,15,20],trigger:3,shields:true,desc:['10-20 FREISPIELE','4 SCHILDE = GRÖSSERES SCHWERT']},counts:null},
    // Doppel Buch: 5 Linien, Buch = Wild + Scatter; Einzelbuch 10 Freispiele mit 1 Sondersymbol, Doppelbuch (doppelter Einsatz) 15 Freispiele mit 2 Sondersymbolen
    doppel:{id:'doppel',title:'DOPPEL BUCH',sub:'EINZEL ODER DOPPEL',lines:LINES10.slice(0,5),lineOpts:[5],betOpts:[2,4,8,12,16,20,40,80,120,160,200,400],
      wild:'BUCH',scatter:'BUCH',doppel:true,
      // Echter Merkur-Spielplan bei 0,10 € und 5 Linien (2 Cent je Linie), hier pro Cent Linieneinsatz; Forscherin 5× = 10 Action Games -> hier 100 €
      pay:{'10':[0,0,0,5,25,100],'J':[0,0,0,5,25,100],'Q':[0,0,0,5,25,100],'K':[0,0,0,5,40,150],'A':[0,0,0,5,40,150],
           'SKARAB':[0,0,5,30,100,750],'GREIF':[0,0,5,30,100,750],'MASKE':[0,0,5,50,500,2000],'FORSCH':[0,0,10,100,1000,5000]},
      scatterPay:[0,0,0,2,20,200],free:{count:10,trigger:3,expanding:true,desc:['10 ODER 15 FREISPIELE','1 ODER 2 SONDERSYMBOLE']},counts:null},
    // Alles Spitze: eine Walze, drei Gewinnleitern (Logik in 28_spitze.js)
    spitze:{id:'spitze',title:'ALLES SPITZE',sub:'DREI LEITERN · EIN KÖNIG',special:'spitze',lines:[[1,1,1,1,1]],lineOpts:[1],betOpts:[5,10,20,40,60,80,100,200,500],
      wild:null,scatter:null,pay:{},scatterPay:[0,0,0,0,0,0],free:null,counts:null}
  };
  function setup(id,counts,seed,fsCounts,payScale){var G=GAMES[id];
    if(payScale&&!G.scaled){G.scaled=1;Object.keys(G.pay).forEach(function(k){G.pay[k]=G.pay[k].map(function(v){return Math.round(v*payScale);});});}SCAT_TMP=G.scatter;G.counts=counts;G.strips=buildStrips(counts,seed);G.syms=Object.keys(counts[0]);
    if(G.wildStack){G.strips.forEach(function(st,ri){var ws=Array.isArray(G.wildStack)?G.wildStack[ri]:G.wildStack,idx=[];st.forEach(function(s,i){if(s===G.wild)idx.push(i);});idx.forEach(function(i){for(var k=1;k<ws;k++)st[(i+k)%st.length]=G.wild;});});}
    G.fsStrips=fsCounts?buildStrips(fsCounts,seed+999):null;return G;}
  function stripsOf(G,fs){return fs&&G.fsStrips?G.fsStrips:G.strips;}
  function grid(G,stops,fs){var g=[[],[],[]],S=stripsOf(G,fs);for(var c=0;c<5;c++){var s=S[c],L=s.length;for(var r=0;r<3;r++)g[r][c]=s[(stops[c]+r-1+L)%L];}return g;}
  function evaluate(G,g,lines,betLine,special,fs){
    var res={wins:[],scatter:null,expand:null,total:0,trigger:false,wildReels:null};
    var F=G.free||{},mult=fs&&F.mult?F.mult:1;
    if(fs&&F.wildExpand){var wr=[];for(var c0=0;c0<5;c0++){if(g[0][c0]===G.wild||g[1][c0]===G.wild||g[2][c0]===G.wild)wr.push(c0);}
      if(wr.length){g=[g[0].slice(),g[1].slice(),g[2].slice()];wr.forEach(function(c){g[0][c]=g[1][c]=g[2][c]=G.wild;});res.wildReels=wr;}}
    function run(path,cols){var base=null,i,wn=0;
      for(i=0;i<cols.length;i++){var s=g[path[cols[i]]][cols[i]];if(s!==G.wild){base=s;break;}wn++;}
      if(!base&&G.top)base=G.top;
      var n=0,p=0;
      if(base&&base!==G.scatter){for(i=0;i<cols.length;i++){var t=g[path[cols[i]]][cols[i]];if(t===base||t===G.wild)n++;else break;}p=(G.pay[base]||[])[n]||0;}
      var wp=G.wild&&G.wild!==G.scatter?(G.pay[G.wild]||[])[wn]||0:0;
      if(wp>p){base=G.wild;n=wn;p=wp;}
      var cells=[];for(i=0;i<n;i++)cells.push([path[cols[i]],cols[i]]);
      return {base:base,n:n,p:p,cells:cells};}
    function add(li,r,path){if(!r.p)return;var dbl=1,i;
      if(G.wildDouble&&r.base!==G.wild){for(i=0;i<r.cells.length;i++)if(g[r.cells[i][0]][r.cells[i][1]]===G.wild){dbl=2;break;}}
      if(G.wildMult&&r.base!==G.wild){for(i=0;i<r.cells.length;i++)if(g[r.cells[i][0]][r.cells[i][1]]===G.wild)dbl*=2;}
      var amt=Math.round(r.p*betLine*dbl*mult);res.wins.push({line:li,sym:r.base,count:r.n,amount:amt,cells:r.cells});res.total+=amt;}
    for(var li=0;li<lines;li++){var path=G.lines[li];
      var L=run(path,[0,1,2,3,4]);add(li,L,path);
      if(G.bothWays){var Rr=L.n<5?run(path,[4,3,2,1,0]):{n:0,p:0};add(li,Rr,path);
        if(L.n<4&&Rr.n<4){var M=run(path,[1,2,3]);if(M.n===3)add(li,M,path);}}
    }
    var sc=[];for(var c=0;c<5;c++)for(var r=0;r<3;r++)if(g[r][c]===G.scatter)sc.push([r,c]);
    var sp=G.scatterPay[Math.min(5,sc.length)]||0;
    if(sp){res.scatter={count:sc.length,amount:sp*betLine*lines*mult,cells:sc};res.total+=sp*betLine*lines*mult;}
    if(G.free&&sc.length>=G.free.trigger)res.trigger=true;
    if(special){var sl=Array.isArray(special)?special:[special],list=[];
      sl.forEach(function(sym){var reels=[];for(var c2=0;c2<5;c2++){for(var r2=0;r2<3;r2++)if(g[r2][c2]===sym){reels.push(c2);break;}}
        var ep=(G.pay[sym]||[])[reels.length]||0;if(ep){list.push({sym:sym,reels:reels,amount:Math.round(ep*betLine*lines)});res.total+=Math.round(ep*betLine*lines);}});
      if(list.length){res.expand=list[0];res.expand.list=list;res.expand.amount=list.reduce(function(a,e){return a+e.amount;},0);}}
    return res;
  }
  // Zufallssymbole: verdeckte Felder irgendwo auf dem Raster (Walze, Reihe, Linie quer/schräg oder verstreut),
  // die alle dasselbe Symbol aufdecken. Ändert das Raster direkt, gibt {cells:[[r,c]...],sym} oder null zurück.
  function mystery(G,g,rnd,fs){var M=G.mystery;if(!M||fs||rnd()>=M.chance)return null;
    var cells=[],i,r=rnd(),pick;
    if(r<M.shape[0]){var c=Math.floor(rnd()*5);for(i=0;i<3;i++)cells.push([i,c]);}
    else if(r<M.shape[0]+M.shape[1]){var row=Math.floor(rnd()*3),n=3+Math.floor(rnd()*3),c0=Math.floor(rnd()*(6-n));for(i=0;i<n;i++)cells.push([row,c0+i]);}
    else if(r<M.shape[0]+M.shape[1]+M.shape[2]){var L=G.lines[Math.floor(rnd()*G.lines.length)],n2=3+Math.floor(rnd()*3),s0=Math.floor(rnd()*(6-n2));for(i=0;i<n2;i++)cells.push([L[s0+i],s0+i]);}
    else{var n3=3+Math.floor(rnd()*4),all=[];for(i=0;i<15;i++)all.push(i);for(i=14;i>0;i--){var j=Math.floor(rnd()*(i+1)),t=all[i];all[i]=all[j];all[j]=t;}
      for(i=0;i<n3;i++)cells.push([all[i]/5|0,all[i]%5]);}
    // Symbol nach Gewicht ziehen, aber nur aus denen, die mit den verdeckten Feldern einen Gewinn ergeben (verdeckt = immer Gewinn)
    var key,ok={},tot=0,g0=[g[0].slice(),g[1].slice(),g[2].slice()];
    for(key in M.w){var gt=[g0[0].slice(),g0[1].slice(),g0[2].slice()];cells.forEach(function(q){gt[q[0]][q[1]]=key;});if(evaluate(G,gt,G.lines.length,1).total>0){ok[key]=M.w[key];tot+=M.w[key];}}
    if(!tot){ok={};ok[G.wild]=1;tot=1;var gw=[g0[0].slice(),g0[1].slice(),g0[2].slice()];cells.forEach(function(q){gw[q[0]][q[1]]=G.wild;});if(!(evaluate(G,gw,G.lines.length,1).total>0))return null;}
    var x=rnd()*tot,sym=null;for(key in ok){x-=ok[key];if(x<0){sym=key;break;}}if(!sym)sym=Object.keys(ok)[0];
    cells.forEach(function(q){g[q[0]][q[1]]=sym;});return {cells:cells,sym:sym};}
  // Tizona: wandernde Schwerter. ww = [{c,r,h}] aus der letzten Runde; sie ziehen eine Walze nach links,
  // neue Schwerter kommen dazu. h = Höhe (1-3, in Freispielen durch Schilde). Rückgabe: neue Liste, Raster wird überschrieben.
  function walk(G,g,ww,h){var out=[],i,c,r;
    (ww||[]).forEach(function(w){if(w.c-1>=0)out.push({c:w.c-1,r:w.r,h:Math.max(w.h,h||1)});});
    for(c=0;c<5;c++)for(r=0;r<3;r++)if(g[r][c]===G.wild&&!out.some(function(w){return w.c===c;}))out.push({c:c,r:r,h:h||1,fresh:true});
    out.forEach(function(w){var hh=Math.min(3,w.h),r0=Math.max(0,Math.min(3-hh,w.r-(hh>1?1:0)));for(i=0;i<hh;i++)g[r0+i][w.c]=G.wild;});
    return out;}
  // Tizona: Schild-Stufe in den Freispielen (je 4 Schilde eine Stufe: 1 Feld, 2 Felder, ganze Walze, goldene Schwerter über die ganze Walze)
  function tizLevel(sh){return Math.min(3,Math.floor((sh||0)/4));}
  function tizHeight(sh){return [1,2,3,3][tizLevel(sh)];}
  // Gratis-Spin, solange nach dem Weiterwandern noch ein Schwert auf den Walzen steht
  function wwPending(ww){return !!(ww&&ww.some(function(w){return w.c>=1;}));}
  function tizEval(G,g,lines,betLine,sh,fs){return evaluate(G,g,lines,betLine,null,fs);}
  // Zentaurus Superspin: Gewinnpositionen bleiben, der Rest wird neu ausgespielt, solange der Gewinn steigt
  function superspin(G,g,lines,betLine,rnd,fs){var S=stripsOf(G,fs),ev=evaluate(G,g,lines,betLine,null,fs),best=ev.total,steps=0,gg=g;
    if(best<=0)return {grid:g,total:0,steps:0,ev:ev};
    for(var n=0;n<12;n++){var held={};ev.wins.forEach(function(w){w.cells.forEach(function(q){held[q[0]+','+q[1]]=1;});});
      var ng=[gg[0].slice(),gg[1].slice(),gg[2].slice()];
      for(var c=0;c<5;c++)for(var r=0;r<3;r++)if(!held[r+','+c]){var st=S[c];ng[r][c]=st[Math.floor(rnd()*st.length)];}
      var e2=evaluate(G,ng,lines,betLine,null,fs);steps++;if(e2.total>best){best=e2.total;gg=ng;ev=e2;}else break;}
    return {grid:gg,total:best,steps:steps,ev:ev};}
  function randStops(G,rnd,fs){return stripsOf(G,fs).map(function(s){return Math.floor(rnd()*s.length);});}
  return {GAMES:GAMES,setup:setup,grid:grid,evaluate:evaluate,randStops:randStops,stripsOf:stripsOf,mystery:mystery,walk:walk,superspin:superspin,tizLevel:tizLevel,tizHeight:tizHeight,wwPending:wwPending,tizEval:tizEval};
})();
if(typeof module!=='undefined')module.exports=SlotEngine;
