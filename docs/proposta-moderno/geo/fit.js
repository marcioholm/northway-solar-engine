// Calibra lat/lon -> coordenadas do SVG @svg-maps/brazil usando as capitais
// (ponto precisa cair dentro do próprio estado). Gera geo/brazil-states.json.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const map = require('@svg-maps/brazil');
const B = map.default || map;

const UF = { 11: 'ro', 12: 'ac', 13: 'am', 14: 'rr', 15: 'pa', 16: 'ap', 17: 'to', 21: 'ma', 22: 'pi', 23: 'ce', 24: 'rn', 25: 'pb', 26: 'pe', 27: 'al', 28: 'se', 29: 'ba', 31: 'mg', 32: 'es', 33: 'rj', 35: 'sp', 41: 'pr', 42: 'sc', 43: 'rs', 50: 'ms', 51: 'mt', 52: 'go', 53: 'df' };
const csv = fs.readFileSync(path.join(__dirname, 'municipios.csv'), 'utf8').trim().split('\n').slice(1).map((l) => l.split(','));
const caps = csv.filter((r) => r[4] === '1').map((r) => ({ name: r[1], lat: +r[2], lon: +r[3], uf: UF[r[5]] }));
const merc = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));

(async () => {
  const br = await chromium.launch();
  const p = await br.newPage();
  await p.setContent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${B.viewBox}">${B.locations.map((l) => `<path id="${l.id}" d="${l.path}"/>`).join('')}</svg>`);
  const bboxes = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll('path')].map((e) => { const b = e.getBBox(); return [e.id, [b.x, b.y, b.width, b.height]]; })));
  // centro de massa aproximado do estado ~ centro do bbox; ajusta x=a*lon+b, y=c*f(lat)+d por mínimos quadrados nas capitais usando o bbox como ponto aproximado e depois refina por busca
  function lsq(xs, ys) { const n = xs.length, mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n; let sxy = 0, sxx = 0; xs.forEach((x, i) => { sxy += (x - mx) * (ys[i] - my); sxx += (x - mx) ** 2; }); const a = sxy / sxx; return [a, my - a * mx]; }
  const est = fs.readFileSync(path.join(__dirname, 'estados.csv'), 'utf8').replace(/^﻿/, '').trim().split('\n').slice(1).map((l) => l.split(','));
  const cent = est.map((r) => ({ uf: r[1].toLowerCase(), lat: +r[3], lon: +r[4] }));
  const results = {};
  for (const mode of ['linear', 'mercator']) {
    const f = mode === 'linear' ? (x) => x : merc;
    const [a, b] = lsq(cent.map((c) => c.lon), cent.map((c) => bboxes[c.uf][0] + bboxes[c.uf][2] / 2));
    const [c, d] = lsq(cent.map((c) => f(c.lat)), cent.map((c) => bboxes[c.uf][1] + bboxes[c.uf][3] / 2));
    const pts = caps.map((k) => ({ ...k, x: a * k.lon + b, y: c * f(k.lat) + d }));
    const inside = await p.evaluate((pts) => pts.map((q) => { const e = document.getElementById(q.uf); const pt = e.ownerSVGElement.createSVGPoint(); pt.x = q.x; pt.y = q.y; return e.isPointInFill(pt); }), pts);
    results[mode] = { a, b, c, d, hits: inside.filter(Boolean).length, miss: pts.filter((q, i) => !inside[i]).map((q) => q.name + '/' + q.uf) };
  }
  console.log(JSON.stringify(results, null, 1));
  fs.writeFileSync(path.join(__dirname, 'bboxes.json'), JSON.stringify(bboxes));
  await br.close();
})();
