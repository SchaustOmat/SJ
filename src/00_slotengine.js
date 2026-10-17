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
    book:{id:'book',title:'GRABKAMMER',sub:'DAS BUCH DER TOTEN',lines:LINES10,lineOpts:[1,3,5,7,9,10],betOpts:[1,2,3,5,10,20,50],
      wild:'BUCH',scatter:'BUCH',low:['10','J','Q','K','A'],
      pay:{'10':[0,0,0,5,25,100],'J':[0,0,0,5,25,100],'Q':[0,0,0,5,25,100],'K':[0,0,0,5,40,150],'A':[0,0,0,5,40,150],
           'ANKH':[0,0,5,30,100,750],'SKARAB':[0,0,5,30,100,750],'PYRAMIDE':[0,0,5,40,400,2000],'MASKE':[0,0,10,100,1000,5000]},
      scatterPay:[0,0,0,2,20,200],free:{count:10,trigger:3,expanding:true},
      counts:null},
    fruit:{id:'fruit',title:'GLUTOFEN',sub:'HEISSE FRÜCHTE',lines:LINES10.slice(0,5),lineOpts:[5],betOpts:[1,2,4,10,20,50,100],
      wild:null,scatter:'STERN',
      pay:{'KIRSCHE':[0,0,5,20,50,200],'ZITRONE':[0,0,0,20,50,200],'ORANGE':[0,0,0,20,50,200],'PFLAUME':[0,0,0,20,50,200],
           'TRAUBE':[0,0,0,50,125,500],'MELONE':[0,0,0,50,125,500],'SIEBEN':[0,0,0,100,1000,5000]},
      scatterPay:[0,0,0,2,10,50],free:null,counts:null}
  };
  function setup(id,counts,seed){var G=GAMES[id];SCAT_TMP=G.scatter;G.counts=counts;G.strips=buildStrips(counts,seed);G.syms=Object.keys(counts[0]);return G;}
  function grid(G,stops){var g=[[],[],[]];for(var c=0;c<5;c++){var s=G.strips[c],L=s.length;for(var r=0;r<3;r++)g[r][c]=s[(stops[c]+r-1+L)%L];}return g;}
  function evaluate(G,g,lines,betLine,special){
    var res={wins:[],scatter:null,expand:null,total:0,trigger:false};
    for(var li=0;li<lines;li++){var path=G.lines[li],base=null,i;
      for(i=0;i<5;i++){var s=g[path[i]][i];if(s!==G.wild){base=s;break;}}
      if(!base||base===G.scatter)continue;
      var n=0;for(i=0;i<5;i++){var t=g[path[i]][i];if(t===base||t===G.wild)n++;else break;}
      var p=(G.pay[base]||[])[n]||0;
      if(p){var cells=[];for(i=0;i<n;i++)cells.push([path[i],i]);res.wins.push({line:li,sym:base,count:n,amount:p*betLine,cells:cells});res.total+=p*betLine;}
    }
    var sc=[];for(var c=0;c<5;c++)for(var r=0;r<3;r++)if(g[r][c]===G.scatter)sc.push([r,c]);
    var sp=G.scatterPay[Math.min(5,sc.length)]||0;
    if(sp){res.scatter={count:sc.length,amount:sp*betLine*lines,cells:sc};res.total+=sp*betLine*lines;}
    if(G.free&&sc.length>=G.free.trigger)res.trigger=true;
    if(special){var reels=[];for(c=0;c<5;c++){for(r=0;r<3;r++)if(g[r][c]===special){reels.push(c);break;}}
      var ep=(G.pay[special]||[])[reels.length]||0;
      if(ep){res.expand={sym:special,reels:reels,amount:ep*betLine*lines};res.total+=ep*betLine*lines;}}
    return res;
  }
  function randStops(G,rnd){return G.strips.map(function(s){return Math.floor(rnd()*s.length);});}
  return {GAMES:GAMES,setup:setup,grid:grid,evaluate:evaluate,randStops:randStops};
})();
if(typeof module!=='undefined')module.exports=SlotEngine;
