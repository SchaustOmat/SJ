/* ===== TEXAS HOLD'EM CORE (pure logic) ===== */
var PokerCore=(function(){
  var P13=[1,13,169,2197,28561,371293];
  function eval5(c){
    var r=[c[0]%13,c[1]%13,c[2]%13,c[3]%13,c[4]%13].sort(function(a,b){return b-a;});
    var s0=(c[0]/13|0),flush=true;for(var i=1;i<5;i++)if((c[i]/13|0)!==s0){flush=false;break;}
    var cnt=new Array(13).fill(0);for(i=0;i<5;i++)cnt[r[i]]++;
    var groups=[];for(var v=12;v>=0;v--)if(cnt[v])groups.push([cnt[v],v]);
    groups.sort(function(a,b){return b[0]-a[0]||b[1]-a[1];});
    var sh=-1;if(groups.length===5){if(r[0]-r[4]===4)sh=r[0];else if(r[0]===12&&r[1]===3)sh=3;}
    var cat,k;
    if(sh>=0&&flush){cat=8;k=[sh];}
    else if(groups[0][0]===4){cat=7;k=[groups[0][1],groups[1][1]];}
    else if(groups[0][0]===3&&groups[1][0]===2){cat=6;k=[groups[0][1],groups[1][1]];}
    else if(flush){cat=5;k=r;}
    else if(sh>=0){cat=4;k=[sh];}
    else if(groups[0][0]===3){cat=3;k=groups.map(function(g){return g[1];});}
    else if(groups[0][0]===2&&groups[1][0]===2){cat=2;k=groups.map(function(g){return g[1];});}
    else if(groups[0][0]===2){cat=1;k=groups.map(function(g){return g[1];});}
    else{cat=0;k=r;}
    var sc=cat;for(i=0;i<5;i++)sc=sc*13+(k[i]||0);return sc;
  }
  var COMBOS=[];(function(){for(var a=0;a<7;a++)for(var b=a+1;b<7;b++){var o=[];for(var i=0;i<7;i++)if(i!==a&&i!==b)o.push(i);COMBOS.push(o);}})();
  function evalBest(cards){
    if(cards.length===5)return eval5(cards);
    var best=-1,n=cards.length;
    if(n===6){for(var x=0;x<6;x++){var h=[];for(var i=0;i<6;i++)if(i!==x)h.push(cards[i]);var v=eval5(h);if(v>best)best=v;}return best;}
    for(var j=0;j<21;j++){var cb=COMBOS[j];var s=eval5([cards[cb[0]],cards[cb[1]],cards[cb[2]],cards[cb[3]],cards[cb[4]]]);if(s>best)best=s;}
    return best;
  }
  function cat(score){return Math.floor(score/371293);}
  var NAMES=['HÖCHSTE KARTE','EIN PAAR','ZWEI PAARE','DRILLING','STRASSE','FLUSH','FULL HOUSE','VIERLING','STRAIGHT FLUSH'];
  function handName(score){var c=cat(score);if(c===8&&Math.floor(score/28561)%13===12)return 'ROYAL FLUSH';return NAMES[c];}
  function equity(hole,board,nOpp,iters){
    var used={};hole.concat(board).forEach(function(c){used[c]=1;});
    var rest=[];for(var c=0;c<52;c++)if(!used[c])rest.push(c);
    var win=0;
    for(var it=0;it<iters;it++){
      // partial shuffle
      var need=nOpp*2+(5-board.length);
      for(var i=0;i<need;i++){var j=i+Math.floor(Math.random()*(rest.length-i));var t=rest[i];rest[i]=rest[j];rest[j]=t;}
      var b=board.slice(),p=0;for(i=0;i<5-board.length;i++)b.push(rest[p++]);
      var mine=evalBest(hole.concat(b)),best=0,ties=0,lost=false;
      for(var o=0;o<nOpp;o++){var os=evalBest([rest[p++],rest[p++]].concat(b));if(os>mine){lost=true;break;}if(os===mine)ties++;}
      if(!lost)win+=1/(1+ties);
    }
    return win/iters;
  }
  function pots(seats){
    var rem=seats.map(function(s){return s.total;}),out=[];
    while(true){
      var live=[];for(var i=0;i<seats.length;i++)if(rem[i]>0)live.push(i);
      if(!live.length)break;
      var m=Infinity;live.forEach(function(i){if(rem[i]<m)m=rem[i];});
      var amt=0,el=[];live.forEach(function(i){amt+=m;rem[i]-=m;if(!seats[i].folded)el.push(i);});
      if(!el.length){if(out.length)out[out.length-1].amount+=amt;else out.push({amount:amt,elig:[]});continue;}
      var last=out[out.length-1];
      if(last&&last.elig.join()===el.join())last.amount+=amt;else out.push({amount:amt,elig:el});
    }
    return out;
  }
  return {eval5:eval5,evalBest:evalBest,cat:cat,handName:handName,equity:equity,pots:pots};
})();
if(typeof module!=='undefined')module.exports=PokerCore;
