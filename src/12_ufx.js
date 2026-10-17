/* =========================================================
   BILDSCHIRM-EFFEKTE über allem (Roulette, Poker, Höher/Tiefer):
   Funken, Münzregen, Blitz, Gewinn-Banner, Herzschlag-Spannung
   ========================================================= */
const UFX=(function(){
  const cv=document.createElement('canvas');cv.id='fxCv';
  let g=null,parts=[],flash=0,fcol='255,255,255',ban=null,floats=[],tenseOn=false,tense=0,run=false,last=0,hb=0;
  const GOLD=['#fff','#ffd23a','#ff9a20','#fff4a0'];
  function mount(){if(g)return;$('#app').appendChild(cv);g=cv.getContext('2d');}
  function size(){const w=LW(),h=LH();if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;}}
  function kick(){mount();if(!run){run=true;last=performance.now();requestAnimationFrame(loop);}}
  function busy(){return parts.length||flash>0||ban||floats.length||tenseOn||tense>0;}
  function loop(t){const dt=Math.min(.05,Math.max(0,(t-last)/1000));last=t;size();step(dt);draw();
    if(busy())requestAnimationFrame(loop);else{run=false;g.clearRect(0,0,cv.width,cv.height);}}
  function elXY(el){if(!el)return [LW()/2,LH()/2];const r=el.getBoundingClientRect();return toLocal(r.left+r.width/2,r.top+r.height/2);}
  function burst(x,y,n,o){o=o||{};kick();
    for(let i=0;i<n&&parts.length<400;i++){const a=Math.random()*TAU,sp=(o.spd||260)*(.35+Math.random()*.9);
      parts.push({x:x+(Math.random()-.5)*(o.w||0),y:y+(Math.random()-.5)*(o.h||0),vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-(o.up===undefined?120:o.up),g:o.g===undefined?620:o.g,
        life:0,max:(o.life||1)*(.6+Math.random()*.7),col:(o.cols||GOLD)[Math.random()*(o.cols||GOLD).length|0],sz:o.sz||5,coin:!!o.coin,ph:Math.random()*TAU});}}
  function coins(n){kick();const w=LW();for(let i=0;i<n;i++)parts.push({x:Math.random()*w,y:-20-Math.random()*LH()*.6,vx:(Math.random()-.5)*60,vy:120+Math.random()*200,g:380,life:0,max:3.2,col:'#ffd23a',sz:10+Math.random()*6,coin:true,ph:Math.random()*TAU});}
  function doFlash(a,col){kick();flash=Math.max(flash,a);fcol=col||'255,255,255';}
  function shake(a){if(typeof camShake!=='undefined')camShake=Math.max(camShake,a);
    const p=document.querySelector('.panel:not([hidden])');if(p){p.classList.remove('shk');void p.offsetWidth;p.classList.add('shk');}}
  function float(x,y,text,col){kick();floats.push({x,y,text,col:col||'#ffd23a',t:0});}
  // Gewinn-Banner: tier 0 = gut, 1 = groß, 2 = riesig
  function banner(title,amount,tier,sub){kick();ban={title,amount,tier:tier||0,sub:sub||'',t:0,dur:2.6+(tier||0)*.9,tick:0};
    if(tier>=1){SFX.boom();SFX.tierUp(Math.min(3,tier));shake(.5+tier*.2);coins(40+tier*40);}
    doFlash(.5+.2*(tier||0),'255,230,140');burst(LW()/2,LH()*.42,40+tier*30,{coin:true,sz:9,spd:420,up:260,life:1.6});}
  const srcs={};
  function tension(src,on){srcs[src]=!!on;const any=Object.keys(srcs).some(k=>srcs[k]);if(any===tenseOn)return;tenseOn=any;if(any){kick();hb=0;}}
  function step(dt){
    for(const p of parts){p.life+=dt;p.vx*=1-dt*1.1;p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;}
    parts=parts.filter(p=>p.life<p.max&&p.y<LH()+30);
    if(flash>0)flash=Math.max(0,flash-dt*2.4);
    floats.forEach(f=>f.t+=dt);floats=floats.filter(f=>f.t<1.4);
    tense=tenseOn?Math.min(1,tense+dt*2):Math.max(0,tense-dt*1.5);
    if(tenseOn){hb-=dt;if(hb<=0){hb=.82;SFX.heart();}}
    if(ban){ban.t+=dt;const k=Math.min(1,ban.t/1.3);if(k<1){ban.tick+=dt;if(ban.tick>.06){ban.tick=0;SFX.riseTick(k);}}if(ban.t>=ban.dur)ban=null;}
  }
  function drawBan(w,h){
    const B=ban,a=B.t<.18?B.t/.18:B.t>B.dur-.45?Math.max(0,(B.dur-B.t)/.45):1;
    g.save();g.globalAlpha=a;g.fillStyle='rgba(0,0,0,'+(.35+B.tier*.15)+')';g.fillRect(0,0,w,h);
    const cx=w/2,cy=h*.4,R=Math.hypot(w,h);
    if(B.tier>=1){g.save();g.translate(cx,cy);g.rotate(performance.now()/1000*.5);
      for(let i=0;i<20;i++){g.rotate(TAU/20);g.fillStyle=i%2?'rgba(255,200,40,.18)':'rgba(255,80,20,.1)';g.beginPath();g.moveTo(0,0);g.lineTo(-R*.09,-R);g.lineTo(R*.09,-R);g.closePath();g.fill();}g.restore();}
    const pop=Math.max(0,1-B.t/.3),sc=(1+pop*.35)*(1+Math.sin(B.t*7)*.03);
    const sz=Math.max(14,Math.min(54,Math.floor(w*.84/(B.title.length*1.3))));
    g.save();g.translate(cx,cy);g.rotate(Math.sin(B.t*3.2)*.035);g.scale(sc,sc);g.textAlign='center';g.textBaseline='middle';px(g,sz);
    g.lineWidth=Math.max(5,sz*.32);g.lineJoin='round';g.strokeStyle='#1a0400';g.strokeText(B.title,0,sz*.12);g.strokeText(B.title,0,0);
    const C=B.tier>=2?['#e0ffff','#2ae0ff','#00406a']:B.tier>=1?['#ffe0ff','#ff4ad0','#6a0060']:['#fff8c0','#ffc020','#a04a00'];
    const tg=g.createLinearGradient(0,-sz/2,0,sz/2);tg.addColorStop(0,C[0]);tg.addColorStop(.55,C[1]);tg.addColorStop(1,C[2]);g.fillStyle=tg;g.fillText(B.title,0,0);g.restore();
    if(B.amount>0){const k=Math.min(1,B.t/1.3),v=Math.floor(B.amount*(1-Math.pow(1-k,2.2))),txt='+'+fmt(k>=1?B.amount:v);
      const tz=Math.max(12,Math.min(38,Math.floor(w*.7/(txt.length*1.05))));px(g,tz);g.textAlign='center';g.textBaseline='middle';
      g.lineWidth=Math.max(4,tz*.3);g.strokeStyle='#000';g.strokeText(txt,cx,cy+sz*.9+tz*.5);g.fillStyle=k>=1&&Math.floor(B.t*4)%2?'#fff':'#ffd23a';g.fillText(txt,cx,cy+sz*.9+tz*.5);
      if(B.sub){const sz2=Math.max(10,Math.min(18,Math.floor(w*.84/(B.sub.length*1.05))));px(g,sz2);g.lineWidth=4;g.strokeText(B.sub,cx,cy+sz*.9+tz*1.5+sz2);g.fillStyle='#f4f0e8';g.fillText(B.sub,cx,cy+sz*.9+tz*1.5+sz2);}}
    g.restore();
  }
  function draw(){
    const w=cv.width,h=cv.height;g.clearRect(0,0,w,h);
    if(tense>0){const pl=Math.max(0,Math.sin((.82-hb)/.82*Math.PI*2))*.5+.5,rg=g.createRadialGradient(w/2,h/2,Math.min(w,h)*.3,w/2,h/2,Math.max(w,h)*.75);
      rg.addColorStop(0,'rgba(120,0,0,0)');rg.addColorStop(1,'rgba(160,0,10,'+(tense*(.35+pl*.25)).toFixed(3)+')');g.fillStyle=rg;g.fillRect(0,0,w,h);}
    if(ban)drawBan(w,h);
    for(const p of parts){const a=1-p.life/p.max;
      if(p.coin){const cw=Math.max(.15,Math.abs(Math.cos(p.ph+p.life*10)))*p.sz;g.globalAlpha=Math.min(1,a*2);
        g.fillStyle='#7a4a00';g.fillRect(p.x-cw/2-1,p.y-p.sz/2-1,cw+2,p.sz+2);g.fillStyle='#ffd23a';g.fillRect(p.x-cw/2,p.y-p.sz/2,cw,p.sz);
        g.fillStyle='#fff6c0';g.fillRect(p.x-cw/2,p.y-p.sz/2,Math.max(1,cw/3),Math.max(1,p.sz/3));}
      else{g.globalCompositeOperation='lighter';g.globalAlpha=a;g.fillStyle=p.col;const z=p.sz*(.5+a*.7);g.fillRect(p.x-z/2,p.y-z/2,z,z);g.globalCompositeOperation='source-over';}}
    g.globalAlpha=1;
    for(const f of floats){const a=f.t<1?1:1-(f.t-1)/.4,y=f.y-f.t*70,sz=Math.round(18*(1+Math.max(0,.25-f.t)*2));px(g,sz);g.textAlign='center';g.textBaseline='middle';
      g.globalAlpha=Math.max(0,a);g.lineWidth=5;g.strokeStyle='#000';g.strokeText(f.text,f.x,y);g.fillStyle=f.col;g.fillText(f.text,f.x,y);}
    g.globalAlpha=1;
    if(flash>0){g.fillStyle='rgba('+fcol+','+(flash*.45).toFixed(3)+')';g.fillRect(0,0,w,h);}
  }
  return {burst,coins,flash:doFlash,shake,float,banner,tension,elXY};
})();
