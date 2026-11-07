const { chromium } = require('playwright'); const fs = require('fs'); const http = require('http'); const path = require('path');
const srv = http.createServer((q, r) => { const f = path.join(__dirname, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, b) => { if (e) { r.statusCode = 404; return r.end(); } r.setHeader('Content-Type', f.endsWith('.js') ? 'text/javascript' : 'text/html'); r.end(b); }); }).listen(8765);
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage(); p.on('console', (m) => console.log('console:', m.text())); p.on('pageerror', (e) => console.log('err:', e.message));
  await p.goto('http://localhost:8765/scene.html'); await p.waitForFunction('window.__done===true', { timeout: 60000 });
  const d = await p.evaluate(() => window.__png); fs.writeFileSync('kit-3d.png', Buffer.from(d.split(',')[1], 'base64'));
  await b.close(); srv.close(); console.log('ok');
})();
