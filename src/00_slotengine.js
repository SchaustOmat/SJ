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
  var GAMES={
    book:{id:'book',title:'GRABKAMMER',sub:'DAS BUCH DER TOTEN',lines:LINES10,lineOpts:[1,3,5,7,9,10],betOpts:[1,2,3,5,10,20,50,100,200,500,1000],
      wild:'BUCH',scatter:'BUCH',low:['10','J','Q','K','A'],
      pay:{'10':[0,0,0,5,25,100],'J':[0,0,0,5,25,100],'Q':[0,0,0,5,25,100],'K':[0,0,0,5,40,150],'A':[0,0,0,5,40,150],
           'ANKH':[0,0,5,30,100,750],'SKARAB':[0,0,5,30,100,750],'PYRAMIDE':[0,0,5,40,400,2000],'MASKE':[0,0,10,100,1000,5000]},
      scatterPay:[0,0,0,2,20,200],free:{count:10,trigger:3,expanding:true},
      counts:null},
    fruit:{id:'fruit',title:'GLUTOFEN',sub:'HEISSE FRÜCHTE',lines:LINES10.slice(0,5),lineOpts:[5],betOpts:[1,2,4,10,20,50,100,200,500,1000,2000],
      wild:null,scatter:'STERN',
      pay:{'KIRSCHE':[0,0,5,20,50,200],'ZITRONE':[0,0,0,20,50,200],'ORANGE':[0,0,0,20,50,200],'PFLAUME':[0,0,0,20,50,200],
           'TRAUBE':[0,0,0,50,125,500],'MELONE':[0,0,0,50,125,500],'SIEBEN':[0,0,0,100,1000,5000]},
      scatterPay:[0,0,0,2,10,50],free:null,counts:null},
    // Freispiele: Gewinne x3
    viking:{id:'viking',title:'WIKINGERGOLD',sub:'DER SCHATZ IM NORDEN',lines:LINES10,lineOpts:[5,10],betOpts:[1,2,3,5,10,20,50,100,200,500,1000],
      wild:'HELM',scatter:'RUNE',
      pay:{'10':[0,0,0,5,20,80],'J':[0,0,0,5,20,80],'Q':[0,0,0,5,25,100],'K':[0,0,0,10,30,120],'A':[0,0,0,10,30,120],
           'AXT':[0,0,0,20,80,300],'SCHILD':[0,0,0,25,100,400],'DRACHE':[0,0,5,40,200,1000],'HELM':[0,0,10,100,500,2500]},
      scatterPay:[0,0,0,3,15,100],free:{count:12,trigger:3,mult:3,desc:['12 FREISPIELE','ALLE GEWINNE ×3']},counts:null},
    // Freispiele: Walzen voller Joker
    mine:{id:'mine',title:'DIAMANTMINE',sub:'GRABEN BIS ZUM GLÜCK',lines:LINES10,lineOpts:[5,10],betOpts:[1,2,3,5,10,20,50,100,200,500,1000],
      wild:'DIAMANT',scatter:'LORE',
      pay:{'10':[0,0,0,5,20,80],'J':[0,0,0,5,20,80],'Q':[0,0,0,5,25,100],'K':[0,0,0,10,30,120],'A':[0,0,0,10,30,120],
           'LATERNE':[0,0,0,20,80,300],'HACKE':[0,0,0,25,100,400],'NUGGET':[0,0,5,40,200,1000],'DIAMANT':[0,0,10,100,500,2500]},
      scatterPay:[0,0,0,2,10,100],free:{count:10,trigger:3,mult:1,fsWild:true,desc:['10 FREISPIELE','MIT EXTRA-JOKERN']},counts:null},
    // Joker verdoppelt jeden Gewinn, Freispiele x3
    reef:{id:'reef',title:'DELFINRIFF',sub:'PERLEN DER TIEFE',lines:LINES10,lineOpts:[5,10],betOpts:[1,2,3,5,10,20,50,100,200,500,1000],
      wild:'DELFIN',scatter:'MUSCHEL',wildDouble:true,
      pay:{'10':[0,0,0,5,20,80],'J':[0,0,0,5,20,80],'Q':[0,0,0,5,25,100],'K':[0,0,0,10,30,120],'A':[0,0,0,10,30,120],
           'FISCH':[0,0,0,20,75,250],'SEESTERN':[0,0,0,25,100,400],'PERLE':[0,0,5,40,200,1000],'DELFIN':[0,0,10,150,750,4000]},
      scatterPay:[0,0,0,2,10,100],free:{count:15,trigger:3,mult:3,desc:['15 FREISPIELE ×3','JOKER = DOPPELT']},counts:null},
    // Freispiele: Joker breiten sich über die ganze Walze aus
    temple:{id:'temple',title:'TEMPELFEUER',sub:'DIE FLAMME DER GÖTTER',lines:LINES10,lineOpts:[5,10],betOpts:[1,2,3,5,10,20,50,100,200,500,1000],
      wild:'FEUER',scatter:'TEMPEL',
      pay:{'10':[0,0,0,5,20,80],'J':[0,0,0,5,20,80],'Q':[0,0,0,5,25,100],'K':[0,0,0,10,30,120],'A':[0,0,0,10,30,120],
           'KELCH':[0,0,0,20,80,300],'SCHLANGE':[0,0,0,25,100,400],'STATUE':[0,0,5,40,200,1000],'FEUER':[0,0,10,100,500,2500]},
      scatterPay:[0,0,0,2,10,100],free:{count:10,trigger:3,mult:1,wildExpand:true,desc:['10 FREISPIELE','JOKER FÜLLT WALZE']},counts:null}
  };
  function setup(id,counts,seed,fsCounts,payScale){var G=GAMES[id];
    if(payScale&&!G.scaled){G.scaled=1;Object.keys(G.pay).forEach(function(k){G.pay[k]=G.pay[k].map(function(v){return Math.round(v*payScale);});});}SCAT_TMP=G.scatter;G.counts=counts;G.strips=buildStrips(counts,seed);G.syms=Object.keys(counts[0]);
    G.fsStrips=fsCounts?buildStrips(fsCounts,seed+999):null;return G;}
  function stripsOf(G,fs){return fs&&G.fsStrips?G.fsStrips:G.strips;}
  function grid(G,stops,fs){var g=[[],[],[]],S=stripsOf(G,fs);for(var c=0;c<5;c++){var s=S[c],L=s.length;for(var r=0;r<3;r++)g[r][c]=s[(stops[c]+r-1+L)%L];}return g;}
  function evaluate(G,g,lines,betLine,special,fs){
    var res={wins:[],scatter:null,expand:null,total:0,trigger:false,wildReels:null};
    var F=G.free||{},mult=fs&&F.mult?F.mult:1;
    if(fs&&F.wildExpand){var wr=[];for(var c0=0;c0<5;c0++){if(g[0][c0]===G.wild||g[1][c0]===G.wild||g[2][c0]===G.wild)wr.push(c0);}
      if(wr.length){g=[g[0].slice(),g[1].slice(),g[2].slice()];wr.forEach(function(c){g[0][c]=g[1][c]=g[2][c]=G.wild;});res.wildReels=wr;}}
    for(var li=0;li<lines;li++){var path=G.lines[li],base=null,i;
      var wn=0;for(i=0;i<5;i++){var s=g[path[i]][i];if(s!==G.wild){base=s;break;}wn++;}
      var n=0,p=0;
      if(base&&base!==G.scatter){for(i=0;i<5;i++){var t=g[path[i]][i];if(t===base||t===G.wild)n++;else break;}p=(G.pay[base]||[])[n]||0;}
      var wp=G.wild&&G.wild!==G.scatter?(G.pay[G.wild]||[])[wn]||0:0;
      if(wp>p){base=G.wild;n=wn;p=wp;}
      if(!p)continue;
      var dbl=1;
      if(p&&G.wildDouble&&base!==G.wild){for(i=0;i<n;i++)if(g[path[i]][i]===G.wild){dbl=2;break;}}
      if(p){var cells=[];for(i=0;i<n;i++)cells.push([path[i],i]);var amt=p*betLine*dbl*mult;res.wins.push({line:li,sym:base,count:n,amount:amt,cells:cells});res.total+=amt;}
    }
    var sc=[];for(var c=0;c<5;c++)for(var r=0;r<3;r++)if(g[r][c]===G.scatter)sc.push([r,c]);
    var sp=G.scatterPay[Math.min(5,sc.length)]||0;
    if(sp){res.scatter={count:sc.length,amount:sp*betLine*lines*mult,cells:sc};res.total+=sp*betLine*lines*mult;}
    if(G.free&&sc.length>=G.free.trigger)res.trigger=true;
    if(special){var reels=[];for(c=0;c<5;c++){for(r=0;r<3;r++)if(g[r][c]===special){reels.push(c);break;}}
      var ep=(G.pay[special]||[])[reels.length]||0;
      if(ep){res.expand={sym:special,reels:reels,amount:ep*betLine*lines};res.total+=ep*betLine*lines;}}
    return res;
  }
  function randStops(G,rnd,fs){return stripsOf(G,fs).map(function(s){return Math.floor(rnd()*s.length);});}
  return {GAMES:GAMES,setup:setup,grid:grid,evaluate:evaluate,randStops:randStops,stripsOf:stripsOf};
})();
if(typeof module!=='undefined')module.exports=SlotEngine;
