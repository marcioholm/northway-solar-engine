// Gera HTML + PDF + PNGs de conferência para cada modelo.
// Uso: node build.js [classico|moderno|minimalista ...]
const fs = require('fs');
const path = require('path');
const QR = require('qrcode');
const { chromium } = require('playwright');
const data = require(process.env.DATA || './exemplo');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'out');
fs.mkdirSync(OUT, { recursive: true });

function fontFaces(fonts) {
  return fonts
    .flatMap(([family, pkg, weights, italics = []]) => {
      const f = (w, st) => {
        const file = path.join(ROOT, 'node_modules/@fontsource', pkg, 'files', `${pkg}-latin-${w}-${st}.woff2`);
        if (!fs.existsSync(file)) return '';
        const b64 = fs.readFileSync(file).toString('base64');
        return `@font-face{font-family:'${family}';font-style:${st};font-weight:${w};font-display:block;src:url(data:font/woff2;base64,${b64}) format('woff2')}`;
      };
      return [...weights.map((w) => f(w, 'normal')), ...italics.map((w) => f(w, 'italic'))];
    })
    .join('\n');
}

async function main() {
  const names = ['moderno'];
  const t = require('./qr-target').qrTarget(data);
  const qr = t ? { img: await QR.toDataURL(t.url, { margin: 0, width: 400, errorCorrectionLevel: 'M', color: { dark: '#111111', light: '#ffffff' } }), label: t.label, url: t.url } : null;
  if (t) console.log('QR ->', t.url);
  const browser = await chromium.launch();
  for (const name of names) {
    const tpl = require(`./${name}`);
    const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Proposta ${name}</title>
<style>@page{size:A4;margin:0}${fontFaces(tpl.fonts)}${tpl.css(data.settings)}</style></head><body>${tpl.pages(data, qr)}</body></html>`;
    const htmlPath = path.join(ROOT, `${name}.html`);
    fs.writeFileSync(htmlPath, html);
    const page = await browser.newPage();
    await page.goto('file://' + htmlPath, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({ path: path.join(OUT, `proposta-${name}.pdf`), format: 'A4', printBackground: true, preferCSSPageSize: true });
    await page.close();
    console.log('ok', name);
  }
  await browser.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
