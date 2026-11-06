// Pré-calcula bbox e ponto de rótulo (dentro do estado) para cada UF.
const fs=require('fs'),path=require('path');const {chromium}=require('playwright');const map=require('@svg-maps/brazil');const B=map.default||map;
(async()=>{const br=await chromium.launch();const p=await br.newPage();
await p.setContent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${B.viewBox}">${B.locations.map(l=>`<path id="${l.id}" d="${l.path}"/>`).join('')}</svg>`);
const meta=await p.evaluate(()=>{const s=document.querySelector('svg');const pt=s.createSVGPoint();const out={};
for(const e of document.querySelectorAll('path')){const b=e.getBBox();const step=Math.max(b.width,b.height)/60;const ins=[];
 for(let x=b.x;x<=b.x+b.width;x+=step)for(let y=b.y;y<=b.y+b.height;y+=step){pt.x=x;pt.y=y;if(e.isPointInFill(pt))ins.push([x,y])}
 // ponto mais distante da borda (aprox.): maximiza a menor distância até pontos fora
 let best=null,bd=-1;const outs=[];for(let x=b.x-step;x<=b.x+b.width+step;x+=step)for(let y=b.y-step;y<=b.y+b.height+step;y+=step){pt.x=x;pt.y=y;if(!e.isPointInFill(pt))outs.push([x,y])}
 for(const q of ins){let m=1e9;for(const o of outs){const d=(q[0]-o[0])**2+(q[1]-o[1])**2;if(d<m)m=d}if(m>bd){bd=m;best=q}}
 out[e.id]={bbox:[+b.x.toFixed(2),+b.y.toFixed(2),+b.width.toFixed(2),+b.height.toFixed(2)],label:best.map(v=>+v.toFixed(2))}}
return out});
const states=B.locations.map(l=>({uf:l.id.toUpperCase(),name:l.name,path:l.path,...meta[l.id]}));
const proj=JSON.parse(fs.readFileSync(path.join(__dirname,'projection.json')));
fs.writeFileSync(path.join(__dirname,'brazil-states.json'),JSON.stringify({source:'@svg-maps/brazil 2.0.0 (CC BY 4.0, Victor Cazanave)',viewBox:B.viewBox,projection:proj,states}));
console.log('ok',states.length,fs.statSync(path.join(__dirname,'brazil-states.json')).size,'bytes');await br.close()})();
