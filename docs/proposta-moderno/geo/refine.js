const fs=require('fs'),path=require('path');const {chromium}=require('playwright');const map=require('@svg-maps/brazil');const B=map.default||map;
const UF={11:'ro',12:'ac',13:'am',14:'rr',15:'pa',16:'ap',17:'to',21:'ma',22:'pi',23:'ce',24:'rn',25:'pb',26:'pe',27:'al',28:'se',29:'ba',31:'mg',32:'es',33:'rj',35:'sp',41:'pr',42:'sc',43:'rs',50:'ms',51:'mt',52:'go',53:'df'};
const rows=fs.readFileSync(path.join(__dirname,'municipios.csv'),'utf8').trim().split('\n').slice(1).map(l=>l.split(',')).map(r=>({lat:+r[2],lon:+r[3],uf:UF[r[5]],cap:r[4]==='1',name:r[1]}));
(async()=>{const br=await chromium.launch();const p=await br.newPage();
await p.setContent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${B.viewBox}">${B.locations.map(l=>`<path id="${l.id}" d="${l.path}"/>`).join('')}</svg>`);
await p.evaluate(rows=>{window.R=rows;window.M=l=>Math.log(Math.tan(Math.PI/4+l*Math.PI/360));window.score=(a,b,c,d)=>{const s=document.querySelector('svg');const pt=s.createSVGPoint();let h=0;const els={};for(const q of R){const e=els[q.uf]||(els[q.uf]=document.getElementById(q.uf));pt.x=a*q.lon+b;pt.y=c*M(q.lat)+d;if(e.isPointInFill(pt))h++}return h}},rows);
let P=[15.5374,1149.69,-893.52,82.70];let best=await p.evaluate(P=>score(...P),P);console.log('start',best,rows.length);
let steps=[0.2,3,10,3];
for(let it=0;it<6;it++){for(let k=0;k<4;k++){for(const sg of [1,-1]){let moved=true;while(moved){moved=false;const Q=P.slice();Q[k]+=sg*steps[k];const s=await p.evaluate(Q=>score(...Q),Q);if(s>best){best=s;P=Q;moved=true}}}}steps=steps.map(x=>x/2.5)}
console.log('best',best,'/',rows.length,P);
const caps=rows.filter(r=>r.cap);const miss=await p.evaluate(([P,caps])=>{const s=document.querySelector('svg');const pt=s.createSVGPoint();return caps.filter(q=>{pt.x=P[0]*q.lon+P[1];pt.y=P[2]*M(q.lat)+P[3];return !document.getElementById(q.uf).isPointInFill(pt)}).map(q=>q.name)},[P,caps]);console.log('capitals miss',miss);
fs.writeFileSync(path.join(__dirname,'projection.json'),JSON.stringify({a:P[0],b:P[1],c:P[2],d:P[3],formula:'x=a*lon+b; y=c*ln(tan(pi/4+lat*pi/360))+d'}));await br.close()})();
