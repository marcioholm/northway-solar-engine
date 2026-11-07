// Modelo MODERNO — editorial/técnico: capa fotográfica, seções numeradas,
// comparativo de kits lado a lado.
import * as QR from 'qrcode';
import { EMBEDDED_FONTS_CSS } from './fonts';
import { esc, money, num, lines, recommendedOf, onColor, icon } from './shared';
import { mapSvg, stateTile, stateName } from './map';
import { qrTarget } from './qr-target';

export interface CommercialTemplateData {
  code?: string;
  publicToken?: string;
  createdAt?: string;
  expirationDate?: string;
  clientName?: string;
  clientCity?: string;
  clientState?: string;
  client?: { name: string; city: string; state: string };
  consultantName?: string;
  consultantPhone?: string;
  consultant?: { name: string; phone?: string };
  consumptionKwh?: number;
  averageBill?: number;
  systemPowerKwp?: number;
  moduleQty?: number;
  generationMonthlyKwh?: number;
  finalPrice?: number;
  paybackYears?: number;
  annualSavings?: number;
  equipment?: any[];
  options?: any[];
  footnote?: string;
  company: {
    name: string;
    logoUrl?: string;
  };
  settings: any;
  payment?: {
    cashDiscount?: number;
    cashPrice?: number;
    cardTax?: number;
    cardInstallments?: number;
    cardInstallment?: number;
    cardTotalPrice?: number;
    financeTax?: number;
    financeInstallments?: number;
    financeInstallment?: number;
    financeTotalPrice?: number;
  };
  qr?: {
    img: string;
    label: string;
    url?: string;
  } | null;
}

export const getCss = (s: any) => {
  const principal = s.primaryColor || '#1F2937';
  const destaque = s.secondaryColor || '#F59E0B';

  return `
:root{--sec:${principal};--on-sec:${onColor(principal)};--pri:${destaque};--on-pri:${onColor(destaque)};--ink:#151a18;--mut:#5d6662;--line:#dfe3e1;--soft:#f2f4f3}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Barlow',sans-serif;color:var(--ink);font-size:9pt;line-height:1.4}
.page{width:210mm;height:297mm;position:relative;overflow:hidden;background:#fff;page-break-after:always}
.cd{font-family:'Barlow Condensed',sans-serif}
.hdr{position:absolute;left:14mm;right:14mm;top:9mm;display:flex;justify-content:space-between;align-items:center;font-size:7.4pt;color:var(--mut);padding-bottom:2.6mm;border-bottom:.3mm solid var(--line)}
.hdr img{height:7mm}
.ftr{position:absolute;left:14mm;right:14mm;bottom:8mm;display:flex;justify-content:space-between;font-size:7pt;color:var(--mut);border-top:.3mm solid var(--line);padding-top:2.4mm}
.ftr b{color:var(--ink);font-weight:600}
.body{position:absolute;left:14mm;right:14mm;top:24mm}
.kick{font-family:'Barlow Condensed';font-weight:600;font-size:9pt;letter-spacing:2.4px;text-transform:uppercase;color:var(--mut);display:flex;align-items:center;gap:2.4mm}
.kick:before{content:'';width:7mm;height:1.4mm;background:var(--pri)}
.h1{font-family:'Barlow Condensed';font-weight:800;font-size:40pt;line-height:.95;text-transform:uppercase;color:var(--sec);margin:1.6mm 0 5mm}
.h3{font-family:'Barlow Condensed';font-weight:700;font-size:12pt;text-transform:uppercase;letter-spacing:.6px;color:var(--sec);margin-bottom:2.4mm}
.lab{font-size:6.8pt;letter-spacing:1.4px;text-transform:uppercase;color:var(--mut);font-weight:600}
/* capa */
.cv-img{position:absolute;left:0;top:0;width:210mm;height:178mm;object-fit:cover}
.cv-logo{position:absolute;left:14mm;top:0;background:#fff;padding:7mm 7mm 6mm;border-radius:0 0 2mm 2mm}
.cv-logo img{height:20mm;display:block}
.cv-name{display:block;font-family:'Barlow Condensed';font-weight:800;font-size:20pt;color:var(--sec);text-transform:uppercase;max-width:90mm;line-height:1}
.cv-noimg{background:var(--sec);background-image:repeating-linear-gradient(135deg,rgba(255,255,255,.05) 0 1mm,transparent 1mm 9mm)}
.cv-dark{position:absolute;left:0;top:178mm;width:210mm;height:119mm;background:var(--sec);color:var(--on-sec);padding:12mm 14mm 0}
.cv-acc{position:absolute;left:14mm;top:-2mm;width:46mm;height:4mm;background:var(--pri)}
.cv-t{font-family:'Barlow Condensed';font-weight:800;font-size:52pt;line-height:.9;text-transform:uppercase}
.cv-s{font-family:'Barlow Condensed';font-weight:500;font-size:16pt;color:var(--pri);margin-top:2mm;letter-spacing:.6px;text-transform:uppercase}
.cv-grid{display:grid;grid-template-columns:repeat(4,1fr);row-gap:5mm;column-gap:5mm;margin-top:10mm}
.cv-grid .lab{color:rgba(255,255,255,.62)}
.cv-grid .v{font-size:11.5pt;font-weight:600;margin-top:.8mm;line-height:1.2}
.cv-bot{position:absolute;left:14mm;right:14mm;bottom:9mm;display:flex;justify-content:space-between;align-items:flex-end;font-size:7.6pt;color:rgba(255,255,255,.75)}
.cv-bot img{width:21mm;height:21mm;border:1.6mm solid #fff;border-radius:1mm}
.qrb{display:flex;align-items:flex-end;gap:3mm}.qrb span{max-width:30mm;text-align:right;font-family:'Barlow Condensed';font-weight:600;font-size:10pt;line-height:1.1;color:var(--on-sec);text-transform:uppercase;letter-spacing:.4px}
/* quem somos */
.lead{font-size:12.4pt;line-height:1.42;color:var(--ink);font-weight:500}
.map{display:flex;gap:4mm;align-items:flex-start}
.map img{width:42mm;height:52mm;object-fit:contain;mix-blend-mode:multiply}
.cities{white-space:nowrap;font-size:7.6pt;line-height:1.7;margin-top:2mm}
.cities i{display:inline-block;width:2.2mm;height:2.2mm;border-radius:50%;margin-right:1.6mm}
.stat-band{margin:7mm -14mm 0;background:var(--sec);color:var(--on-sec);display:grid;grid-template-columns:repeat(4,1fr);padding:7mm 14mm}
.stat-band>div{padding-right:3mm}.stat-band>div+div{border-left:.3mm solid rgba(255,255,255,.22);padding-left:4mm}
.stat-band .v{font-family:'Barlow Condensed';font-weight:700;font-size:21pt;line-height:1;color:var(--pri);white-space:nowrap}
.stat-band .l{font-size:8pt;margin-top:1.4mm;color:rgba(255,255,255,.85)}
.hls{display:grid;grid-template-columns:1fr 1fr;column-gap:8mm;row-gap:5mm;margin-top:7mm}
.hls>div{border-top:.6mm solid var(--sec);padding-top:2.6mm;display:flex;gap:3mm}
.hls .ic{color:var(--sec);flex:none}
.hls b{display:block;font-family:'Barlow Condensed';font-weight:700;font-size:11pt;text-transform:uppercase;letter-spacing:.4px;color:var(--sec)}
.hls p{font-size:8.2pt;color:var(--mut);margin-top:.6mm;line-height:1.35}
.logos{display:grid;align-items:center;justify-items:center}
.logos img{max-width:100%;object-fit:contain}
.area-br{display:flex;gap:4mm;align-items:flex-start}.area-br .mb{width:58mm;height:60mm;flex:none}
.leg-g{font-size:7.8pt;line-height:1.45}.leg-g div{margin-bottom:2mm}.leg-g b{display:block;font-family:'Barlow Condensed';font-weight:700;font-size:10pt;color:var(--sec)}
.area-zoom{display:grid;grid-template-columns:1.25fr 1fr;gap:8mm;margin-top:6mm;align-items:start}.area-zoom .mz{height:70mm}
.leg-n{columns:2;column-gap:5mm;font-size:8pt;line-height:1.6}.leg-n .grp{break-inside:avoid;margin-bottom:2.6mm}
.leg-n b{display:block;font-family:'Barlow Condensed';font-weight:700;font-size:10pt;color:var(--sec);text-transform:uppercase;letter-spacing:.4px}
.num{display:inline-flex;align-items:center;justify-content:center;width:4mm;height:4mm;border-radius:50%;background:var(--pri);color:var(--on-pri);font-family:'Barlow Condensed';font-weight:700;font-size:7pt;margin-right:1.6mm;vertical-align:.2mm}
.tiles{display:grid;gap:6mm;margin-top:1mm}.tiles .shape{height:30mm;margin-bottom:2mm}.tiles b{font-family:'Barlow Condensed';font-weight:700;font-size:11pt;color:var(--sec);text-transform:uppercase}
.tiles p{font-size:7.6pt;color:var(--mut);line-height:1.4;margin-top:.6mm}
/* projeto */
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:3mm}
.kpi{background:var(--soft);border-radius:1.4mm;padding:4mm}
.kpi .v{font-family:'Barlow Condensed';font-weight:700;font-size:23pt;line-height:1;color:var(--sec);margin-top:1.6mm}
.kpi .v small{font-size:10pt;font-weight:600;margin-left:1mm;color:var(--mut)}
.kpi.acc{background:var(--sec)}.kpi.acc .lab{color:rgba(255,255,255,.7)}.kpi.acc .v{color:var(--pri)}.kpi.acc .v small{color:rgba(255,255,255,.75)}
.two{display:grid;grid-template-columns:1.1fr 1fr;gap:8mm;margin-top:7mm}
table.spec{width:100%;border-collapse:collapse;font-size:9pt}
table.spec td{padding:2.2mm 0;border-bottom:.3mm solid var(--line);vertical-align:top}
table.spec td:first-child{color:var(--mut);width:24mm}
table.spec td:last-child{font-weight:600}
.inc{margin-top:4mm;display:grid;grid-template-columns:1fr 1fr;gap:1.6mm 4mm;font-size:8.4pt}
.inc div{display:flex;gap:1.6mm;align-items:flex-start}.inc svg{flex:none;margin-top:.3mm}
.bars{display:flex;gap:6mm;align-items:flex-end;height:46mm;border-bottom:.3mm solid var(--ink);padding:0 4mm}
.bars .b{flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;height:100%}
.bars .b .col{width:100%;border-radius:1mm 1mm 0 0}
.bars .b .n{font-family:'Barlow Condensed';font-weight:700;font-size:13pt;margin-bottom:1.2mm}
.bars-l{display:flex;gap:6mm;padding:0 4mm;margin-top:1.6mm}.bars-l div{flex:1;text-align:center;font-size:7.6pt;color:var(--mut)}
.econ{display:grid;grid-template-columns:1fr 1fr;gap:3mm;margin-top:5mm}
.econ>div{border:.3mm solid var(--line);border-radius:1.4mm;padding:3mm}
.econ .v{font-family:'Barlow Condensed';font-weight:700;font-size:17pt;margin-top:1mm}
.note{font-size:6.8pt;color:var(--mut);line-height:1.35}
/* investimento */
.cmp{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm;margin-top:2mm}
.cmp.single{grid-template-columns:1fr;width:66.7%;max-width:125mm;margin:4mm auto 0}
.opt{border:.3mm solid var(--line);border-radius:2mm;overflow:hidden;display:flex;flex-direction:column}
.opt.rec{border:.6mm solid var(--sec);box-shadow:0 0 0 .1mm var(--sec)}
.opt .top{padding:4mm 4mm 3.4mm;background:var(--soft)}
.opt.rec .top{background:var(--sec);color:var(--on-sec)}
.opt .tag{font-family:'Barlow Condensed';font-weight:700;font-size:8pt;letter-spacing:1.4px;text-transform:uppercase;color:var(--mut);height:4mm}
.opt.rec .tag{color:var(--pri)}
.opt .nm{font-family:'Barlow Condensed';font-weight:800;font-size:24pt;line-height:1;text-transform:uppercase}
.opt .kw{font-size:9pt;font-weight:600;color:var(--mut)}.opt.rec .kw{color:rgba(255,255,255,.8)}
.opt img,.opt .kitart{width:100%;height:30mm;object-fit:contain;margin:3mm 0 0;display:block}
.opt .rows{padding:1mm 4mm}
.opt .row{display:flex;justify-content:space-between;gap:2mm;font-size:8.2pt;padding:1.6mm 0;border-bottom:.3mm solid var(--line)}
.opt .row span:first-child{color:var(--mut)}.opt .row span:last-child{font-weight:600;text-align:right}
.opt .price{margin:3mm 4mm 0;padding:3mm;border-radius:1.4mm;background:var(--soft)}
.opt.rec .price{background:var(--pri);color:var(--on-pri)}
.opt .price .v{font-family:'Barlow Condensed';font-weight:800;font-size:22pt;line-height:1.05;white-space:nowrap}
.opt .price small{font-size:7.4pt;font-weight:600}
.opt .pay{padding:2.4mm 4mm 4mm;font-size:8pt}
.opt .pay .g{font-size:6.6pt;letter-spacing:1.2px;text-transform:uppercase;color:var(--mut);font-weight:600;margin-top:2.2mm}
.opt .pay .r{display:flex;justify-content:space-between;white-space:nowrap;margin-top:.6mm}
.opt .pay .r b{font-weight:600}
/* condições */
.cond{columns:2;column-gap:9mm}
.cond section{break-inside:avoid;margin-bottom:5mm}
.cond ul{list-style:none;font-size:8.2pt;line-height:1.42}
.cond li{position:relative;padding-left:3.4mm;margin-bottom:1mm}
.cond li:before{content:'';position:absolute;left:0;top:1.9mm;width:1.5mm;height:.5mm;background:var(--sec)}
.acc{border:.6mm solid var(--sec);border-radius:2mm;padding:6mm;margin-top:2mm}
.acc .choice{display:flex;gap:6mm;margin:4mm 0 2mm}
.acc .choice div{flex:1;border:.3mm solid var(--line);border-radius:1.4mm;padding:3mm;display:flex;align-items:center;gap:2.4mm;font-family:'Barlow Condensed';font-weight:700;font-size:12pt;text-transform:uppercase}
.box{width:4.4mm;height:4.4mm;border:.45mm solid var(--sec);border-radius:.8mm;flex:none}
.sig{display:flex;gap:10mm;margin-top:15mm}
.sig div{flex:1;border-top:.35mm solid var(--ink);padding-top:1.6mm;font-size:8pt}
.sig b{display:block;font-weight:600;font-size:9pt}
`;
};

const total = 5;
function hdr(d: any) {
  return `<div class="hdr">${
    d.company?.logoUrl
      ? `<img src="${d.company.logoUrl}">`
      : `<b>${esc(d.company?.name || '')}</b>`
  }<span>Proposta ${esc(d.code || '')} · ${esc(d.client?.name || '')}</span></div>`;
}

function ftr(d: any, n: number, total = 5) {
  const c = d.settings?.contact || {};
  const contacts = [esc(c.phone), esc(c.website), esc(c.instagram)]
    .filter(Boolean)
    .join(' · ');
  return `<div class="ftr"><span><b>${esc(d.company?.name || '')}</b>${
    contacts ? ' · ' + contacts : ''
  }</span><span>${String(n).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span></div>`;
}

const head = (n: number, t: string) =>
  `<div class="kick">${String(n).padStart(2, '0')} · ${esc(t)}</div><div class="h1">${esc(t)}</div>`;

/** Ilustração padrão do kit (painel + inversor), usada quando a empresa não envia imagem própria. */
export function kitArt(): string {
  let cells = '';
  for (let c = 0; c < 6; c++)
    for (let r = 0; r < 10; r++)
      cells += `<rect x="${93 + c * 15.3}" y="${12 + r * 9.6}" width="14.3" height="8.6" rx=".6" fill="#1d2a3f"/>`;
  return `<svg class="kitart" viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
  <rect x="98" y="4" width="98" height="104" rx="2" fill="#dfe3e8"/>
  <rect x="89" y="8" width="98" height="104" rx="2" fill="#aab3bd"/><rect x="91" y="10" width="94" height="100" rx="1.5" fill="#2c3b54"/>${cells}
  <line x1="91" y1="60" x2="185" y2="60" stroke="#aab3bd" stroke-width="1.2"/>
  <rect x="14" y="44" width="58" height="66" rx="6" fill="#f3f5f7" stroke="#c9cfd6" stroke-width="1.2"/>
  <rect x="26" y="60" width="34" height="12" rx="3" fill="#1d2a3f"/><circle cx="53" cy="66" r="2.2" style="fill:var(--pri)"/>
  <rect x="14" y="92" width="58" height="5" style="fill:var(--sec)"/>
  <rect x="28" y="110" width="5" height="7" fill="#3b4250"/><rect x="40" y="110" width="5" height="7" fill="#3b4250"/><rect x="52" y="110" width="5" height="7" fill="#3b4250"/>
</svg>`;
}

function cover(d: any, qr: any) {
  const s = d.settings || {},
    c = s.contact || {};
  const cell = (l: string, v: string) =>
    `<div><div class="lab">${l}</div><div class="v">${v}</div></div>`;

  const coverFocus = s.coverFocus || 'center';
  const coverImgHtml = s.coverImageUrl
    ? `<img class="cv-img" src="${s.coverImageUrl}" style="object-position:${coverFocus};">`
    : `<div class="cv-img cv-noimg"></div>`;

  const maxPower = d.options?.length
    ? Math.max(...d.options.map((o: any) => o.systemPowerKwp || 0))
    : d.systemPowerKwp || 0;

  const kitDesc =
    d.options?.length && d.options.length > 1
      ? `${d.options.length} kits · até ${num(maxPower, 2)} kWp`
      : `${num(maxPower, 2)} kWp`;

  const clientCityState =
    d.client?.city && d.client?.state
      ? `${esc(d.client.city)}/${esc(d.client.state)}`
      : esc(d.client?.city || d.client?.state || '—');

  return `<section class="page">
  ${coverImgHtml}
  <div class="cv-logo">${
    d.company?.logoUrl
      ? `<img src="${d.company.logoUrl}">`
      : `<span class="cv-name">${esc(d.company?.name || '')}</span>`
  }</div>
  <div class="cv-dark"><div class="cv-acc"></div>
    <div class="cv-t">Proposta<br>comercial</div><div class="cv-s">Sistema de energia solar fotovoltaica</div>
    <div class="cv-grid">
      ${cell('Cliente', esc(d.client?.name || '—'))}${cell('Cidade', clientCityState)}
      ${cell('Consumo médio', d.consumptionKwh ? `${num(d.consumptionKwh)} kWh/mês` : '—')}${cell(d.options?.length > 1 ? 'Opções' : 'Potência', kitDesc)}
      ${cell('Consultor', esc(d.consultant?.name || '—'))}${cell('Emissão', esc(d.createdAt || '—'))}
      ${cell('Válida até', esc(d.expirationDate || '—'))}${cell('Código', esc(d.code || '—'))}
    </div>
    <div class="cv-bot"><span>${esc(c.address || '')}${
      c.address ? '<br>' : ''
    }${[esc(c.phone), esc(c.website)].filter(Boolean).join(' · ')}</span>${
      qr
        ? `<div class="qrb"><span>${esc(qr.label || '')}</span><img src="${qr.img}"></div>`
        : ''
    }</div>
  </div></section>`;
}

function areaBlock(d: any) {
  const s = d.settings || {},
    a = s.serviceArea;
  const lead = s.aboutText ? `<p class="lead">${esc(s.aboutText)}</p>` : '';
  if (!a || !a.states || !a.states.length) return lead;

  const col = 'var(--sec)',
    acc = 'var(--pri)';
  const byUf = a.states.map((uf: string) => ({
    uf,
    list: (a.cities || []).filter((c: any) => c.uf === uf),
  }));

  if (a.style === 'zoom') {
    let n = 0;
    const leg = byUf
      .map(
        (g: any) =>
          `<div class="grp"><b>${esc(stateName(g.uf))}</b>${g.list
            .map((c: any) => `<div><span class="num">${++n}</span>${esc(c.name)}</div>`)
            .join('')}</div>`,
      )
      .join('');
    return `${lead}<div class="area-zoom"><div class="mz">${mapSvg('zoom', {
      states: a.states,
      cities: a.cities,
      color: col,
      accent: acc,
      numbered: true,
    })}</div>
      <div><div class="h3">Onde atuamos</div><div class="leg-n">${leg}</div></div></div>`;
  }
  if (a.style === 'estados') {
    return `${lead}<div class="h3" style="margin-top:7mm">Onde atuamos</div><div class="tiles" style="grid-template-columns:repeat(${Math.min(
      a.states.length,
      4,
    )},1fr)">${byUf
      .map(
        (g: any) =>
          `<div><div class="shape">${stateTile(
            g.uf,
            a.cities || [],
            col,
            acc,
          )}</div><b>${esc(stateName(g.uf))}</b><p>${
            g.list.map((c: any) => esc(c.name)).join(' · ') || '&nbsp;'
          }</p></div>`,
      )
      .join('')}</div>`;
  }
  return `<div style="display:grid;grid-template-columns:1.05fr 1fr;gap:7mm">${lead}
    <div><div class="h3">Onde atuamos</div><div class="area-br"><div class="mb">${mapSvg(
      'brasil',
      {
        states: a.states,
        cities: a.cities,
        color: col,
        accent: acc,
      },
    )}</div>
    <div class="leg-g">${byUf
      .map(
        (g: any) =>
          `<div><b>${g.uf}</b>${g.list
            .map((c: any) => esc(c.name))
            .join('<br>')}</div>`,
      )
      .join('')}</div></div></div></div>`;
}

function about(d: any, n = 2, total = 5, step = 1) {
  const s = d.settings || {};
  const sec = s.sectionsEnabled || s.sections_enabled || {};
  return `<section class="page">${hdr(d)}<div class="body">
  ${head(step, 'Quem somos')}
  ${areaBlock(d)}
  ${
    (s.stats || []).length
      ? `<div class="stat-band" style="grid-template-columns:repeat(${Math.min(
          s.stats.length,
          4,
        )},1fr)">${(s.stats || [])
          .slice(0, 4)
          .map(
            (x: any) =>
              `<div><div class="v">${esc(x.value)}</div><div class="l">${esc(
                x.label,
              )}</div></div>`,
          )
          .join('')}</div>`
      : ''
  }
  ${
    (s.highlights || []).length
      ? `<div class="hls">${(s.highlights || [])
          .slice(0, 4)
          .map(
            (h: any) =>
              `<div><span class="ic">${icon(
                h.icon,
                26,
                'currentColor',
                1.6,
              )}</span><div><b>${esc(h.title)}</b><p>${esc(
                h.text,
              )}</p></div></div>`,
          )
          .join('')}</div>`
      : ''
  }
  ${
    sec.partners !== false && (s.partnerLogos || []).length
      ? `<div class="h3" style="margin-top:8mm">Parceiros e clientes</div>
  <div class="logos" style="grid-template-columns:repeat(5,1fr);row-gap:4mm;column-gap:6mm;margin-top:3mm">${(
    s.partnerLogos || []
  )
    .map((u: string) => `<img src="${u}" style="height:9.5mm">`)
    .join('')}</div>`
      : ''
  }
  </div>${ftr(d, n, total)}</section>`;
}

function project(d: any, n = 3, total = 5, step = 2) {
  const s = d.settings || {},
    r = recommendedOf(d);
  const sec = s.sectionsEnabled || s.sections_enabled || {};
  const consumptionKwh = Number(d.consumptionKwh || 0);
  const generationMonthlyKwh = Number(r.generationMonthlyKwh || 0);
  const max = Math.max(consumptionKwh, generationMonthlyKwh, 1) * 1.08;
  const h = (v: number) => `${(v / max) * 40}mm`;

  const moduleText = r.moduleQty && r.module ? `${r.moduleQty} × ${esc(r.module)}` : esc(r.module || '—');
  const hasGeneration = generationMonthlyKwh > 0;
  const hasConsumption = consumptionKwh > 0;

  return `<section class="page">${hdr(d)}<div class="body">
  ${head(step, 'Seu projeto')}
  <div class="kpis">
    <div class="kpi"><div class="lab">Consumo médio</div><div class="v">${
      hasConsumption ? `${num(consumptionKwh)}<small>kWh/mês</small>` : '—'
    }</div></div>
    <div class="kpi"><div class="lab">Potência</div><div class="v">${num(
      r.systemPowerKwp || d.systemPowerKwp,
      2,
    )}<small>kWp</small></div></div>
    <div class="kpi"><div class="lab">Geração estimada*</div><div class="v">${
      hasGeneration ? `${num(generationMonthlyKwh)}<small>kWh/mês</small>` : '—'
    }</div></div>
    <div class="kpi acc"><div class="lab">Cobertura do consumo*</div><div class="v">${
      hasGeneration && hasConsumption
        ? `${num(r.coverage ? r.coverage * 100 : (generationMonthlyKwh / consumptionKwh) * 100)}<small>%</small>`
        : '—'
    }</div></div>
  </div>
  <div class="two">
    <div><div class="h3">${
      d.options?.length > 1 ? `Kit recomendado · ${esc(r.name)}` : 'Equipamentos do sistema'
    }</div>
      <table class="spec">
        <tr><td>Módulos</td><td>${moduleText}</td></tr>
        <tr><td>Inversor</td><td>${esc(r.inverter || '—')}</td></tr>
        ${r.structure ? `<tr><td>Estrutura</td><td>${esc(r.structure)}</td></tr>` : ''}
        <tr><td>Potência</td><td>${num(r.systemPowerKwp || d.systemPowerKwp, 2)} kWp</td></tr>
      </table>
      ${
        (s.includedItems || []).length
          ? `<div class="h3" style="margin-top:6mm">Incluso no projeto</div>
      <div class="inc">${(s.includedItems || [])
        .map(
          (i: string) =>
            `<div>${icon('check', 13, 'var(--sec)', 2.4)}<span>${esc(
              i,
            )}</span></div>`,
        )
        .join('')}</div>`
          : ''
      }
    </div>
    ${
      hasGeneration
        ? `<div><div class="h3">Consumo × geração</div>
      <div class="bars"><div class="b"><div class="n">${hasConsumption ? num(consumptionKwh) : '—'}</div><div class="col" style="height:${h(
            consumptionKwh,
          )};background:#cfd6d3"></div></div>
        <div class="b"><div class="n">${num(generationMonthlyKwh)}</div><div class="col" style="height:${h(
            generationMonthlyKwh,
          )};background:var(--sec)"></div></div></div>
      <div class="bars-l"><div>Consumo médio (kWh/mês)</div><div>Geração estimada* (kWh/mês)</div></div>
      ${
        d.averageBill
          ? `<div class="econ"><div><div class="lab">Fatura média hoje</div><div class="v">${money(
              d.averageBill,
              0,
            )}</div></div><div style="border-color:var(--sec)"><div class="lab">Economia estimada*</div><div class="v" style="color:var(--sec)">${money(
              r.monthlySavings || d.annualSavings ? (d.annualSavings / 12) : 0,
              0,
            )}<span style="font-size:9pt;font-weight:600">/mês</span></div></div></div>
      ${
        r.paybackYears || d.paybackYears
          ? `<div class="note" style="margin-top:2mm">Retorno estimado do investimento: ~${num(
              r.paybackYears || d.paybackYears,
              1,
            )} anos*</div>`
          : ''
      }`
          : ''
      }
    </div>`
        : d.averageBill
        ? `<div>
      <div class="econ" style="margin-top:0"><div><div class="lab">Fatura média hoje</div><div class="v">${money(
        d.averageBill,
        0,
      )}</div></div><div style="border-color:var(--sec)"><div class="lab">Economia estimada*</div><div class="v" style="color:var(--sec)">${money(
        r.monthlySavings || d.annualSavings ? (d.annualSavings / 12) : 0,
        0,
      )}<span style="font-size:9pt;font-weight:600">/mês</span></div></div></div>
      ${
        r.paybackYears || d.paybackYears
          ? `<div class="note" style="margin-top:2mm">Retorno estimado do investimento: ~${num(
              r.paybackYears || d.paybackYears,
              1,
            )} anos*</div>`
          : ''
      }
    </div>`
        : `<div></div>`
    }
  </div>
  ${
    sec.partners !== false && (s.brandLogos || []).length
      ? `<div class="h3" style="margin-top:9mm">Marcas que trabalhamos</div>
  <div class="logos" style="grid-template-columns:repeat(5,1fr);row-gap:4mm;column-gap:6mm;margin-top:3mm">${(
    s.brandLogos || []
  )
    .map((u: string) => `<img src="${u}" style="height:7.5mm">`)
    .join('')}</div>`
      : ''
  }
  <p class="note" style="margin-top:7mm">* Estimativas. Geração conforme dimensionamento; economia considera 90% da fatura média atual, sem reajuste tarifário, degradação, custo de disponibilidade ou Fio B.</p>
  </div>${ftr(d, n, total)}</section>`;
}

function invest(d: any, n = 4, total = 5, step = 3) {
  const s = d.settings || {};
  const isSingle = !d.options || d.options.length <= 1;

  return `<section class="page">${hdr(d)}<div class="body">
  ${head(step, 'Investimento')}
  <div class="cmp${isSingle ? ' single' : ''}">${(d.options || [])
    .map((o: any) => {
      const p = o.payment || {};
      const isRec = !isSingle && Boolean(o.recommended);
      const hasCash = p.cashPrice != null && p.cashPrice > 0;
      const hasCard = p.cardInstallments && p.cardInstallment;
      const hasFinance = p.financeOptions && p.financeOptions.length > 0;
      const hasOwn = p.ownPlan && p.ownPlan.n;

      return `<div class="opt${isRec ? ' rec' : ''}">
      <div class="top"><div class="tag">${isRec ? 'Recomendado' : ''}</div><div class="nm">${esc(
        o.name || 'Sistema Completo',
      )}</div><div class="kw">${num(o.systemPowerKwp, 2)} kWp${
        o.moduleQty ? ` · ${o.moduleQty} módulos` : ''
      }</div></div>
      ${o.scenarioText ? `<div style="padding:1mm 4mm 0 4mm;font-size:7.2pt;font-weight:600;color:var(--sec);line-height:1.2">${esc(o.scenarioText)}</div>` : ''}
      <div style="padding:0 4mm">${
        o.imageUrl || s.kitImageUrl
          ? `<img src="${o.imageUrl || s.kitImageUrl}">`
          : kitArt()
      }</div>
      <div class="rows">
        ${o.inverter ? `<div class="row"><span>Inversor</span><span>${esc(o.inverter)}</span></div>` : ''}
        ${o.generationMonthlyKwh ? `<div class="row"><span>Geração est.*</span><span>${num(o.generationMonthlyKwh)} kWh/mês</span></div>` : ''}
        ${o.coverage ? `<div class="row"><span>Cobertura*</span><span>${num(o.coverage * 100)}%</span></div>` : ''}
        ${o.monthlySavings ? `<div class="row"><span>Economia est.*</span><span>${money(o.monthlySavings, 0)}/mês</span></div>` : ''}
        ${o.paybackYears ? `<div class="row" style="border:0"><span>Retorno est.*</span><span>~${num(o.paybackYears, 1)} anos</span></div>` : ''}
      </div>
      <div class="price">${
        hasCash && p.cashDiscountPct
          ? `<small>À vista · ${num(p.cashDiscountPct)}% off</small>`
          : '<small>À vista</small>'
      }<div class="v">${money(
        hasCash ? p.cashPrice : o.finalPrice,
      )}</div><small>Valor total ${money(o.finalPrice)}</small></div>
      ${
        hasCard || hasFinance || hasOwn
          ? `<div class="pay">
        ${
          hasCard
            ? `<div class="g">Cartão de crédito</div><div class="r"><span>${p.cardInstallments}x</span><b>${money(
                p.cardInstallment,
              )}</b></div>`
            : ''
        }
        ${
          hasFinance
            ? `<div class="g">Financiamento</div>${p.financeOptions
                .map(
                  (f: any) =>
                    `<div class="r"><span>${f.n}x</span><b>${money(
                      f.installment,
                    )}</b></div>`,
                )
                .join('')}`
            : ''
        }
        ${
          hasOwn
            ? `<div class="g">Parcelamento próprio</div><div class="r"><span>${p.ownPlan.downPct}% entrada</span><b>${money(
                p.ownPlan.downValue,
              )}</b></div><div class="r"><span>${p.ownPlan.n} boletos</span><b>${money(
                p.ownPlan.installment,
              )}</b></div>`
            : ''
        }
      </div>`
          : ''
      }</div>`;
    })
    .join('')}</div>
  <p class="note" style="margin-top:5mm">* Estimativas, mesmas premissas da página anterior. Parcelas de cartão e financiamento já incluem o acréscimo total e estão sujeitas à aprovação de crédito.${
    d.footnote ? `<br>${esc(d.footnote)}` : ''
  }</p>
  </div>${ftr(d, n, total)}</section>`;
}

function terms(d: any, n = 5, total = 5, step = 4) {
  const s = d.settings || {};
  const L = (t: string) =>
    `<ul>${lines(t)
      .map((l) => `<li>${esc(l)}</li>`)
      .join('')}</ul>`;

  const hasWarranties = Boolean(s.warrantiesText);
  const hasServices = Boolean(s.servicesText);
  const hasExclusions = Boolean(s.exclusionsText);
  const hasNotes = Boolean(s.notesText);

  return `<section class="page">${hdr(d)}<div class="body">
  ${head(step, 'Condições')}
  <div class="cond">
    ${hasWarranties ? `<section><div class="h3">Garantias e prazos</div>${L(s.warrantiesText)}</section>` : ''}
    ${hasServices ? `<section><div class="h3">Serviços inclusos</div>${L(s.servicesText)}</section>` : ''}
    ${hasExclusions ? `<section><div class="h3">Não faz parte desta proposta</div>${L(s.exclusionsText)}</section>` : ''}
    ${hasNotes ? `<section><div class="h3">Observações importantes</div><ul><li>${esc(s.notesText)}</li></ul></section>` : ''}
  </div>
  <div class="acc"><div class="h3" style="margin:0">Aceite da proposta</div>
    <p style="font-size:8.6pt">${esc(
      s.acceptanceText ||
        'Declaro concordar com os valores e condições apresentadas.',
    )} Proposta válida até <b>${esc(d.expirationDate || '—')}</b>.</p>
    <div class="choice">${(d.options || [])
      .map(
        (o: any) =>
          `<div><span class="box"></span>${esc(
            o.name,
          )}<span style="font-family:Barlow;font-weight:500;font-size:8pt;text-transform:none;color:var(--mut);margin-left:auto">${num(
            o.systemPowerKwp,
            2,
          )} kWp</span></div>`,
      )
      .join('')}</div>
    <div class="sig"><div><b>${esc(
      d.client?.name || 'Cliente',
    )}</b>Cliente</div><div><b>${esc(
    d.consultant?.name || 'Consultor',
  )}</b>Consultor</div><div><b>____ / ____ / ______</b>Data do fechamento</div></div>
  </div>
  </div>${ftr(d, n, total)}</section>`;
}

export function buildPagesHtml(d: any, qr: any) {
  const s = d.settings || {};
  const sec = s.sectionsEnabled || s.sections_enabled || {};

  const pages: ((pageNum: number, totalPages: number, stepNum: number) => string)[] = [];

  // Capa
  if (sec.cover !== false) {
    pages.push((n, total, step) => cover(d, qr));
  }

  // Quem somos (about)
  const hasAboutData =
    Boolean(s.aboutText) ||
    Boolean(s.aboutImageUrl) ||
    (s.stats && s.stats.length > 0) ||
    (s.serviceArea?.ufs && s.serviceArea.ufs.length > 0) ||
    (s.serviceArea?.states && s.serviceArea.states.length > 0) ||
    (s.partnerLogos && s.partnerLogos.length > 0) ||
    (s.highlights && s.highlights.length > 0) ||
    Boolean(s.servicesText);

  if (sec.about !== false && hasAboutData) {
    pages.push((n, total, step) => about(d, n, total, step));
  }

  // Seu projeto (system + kit)
  if (sec.system !== false || sec.kit !== false) {
    pages.push((n, total, step) => project(d, n, total, step));
  }

  // Investimento (investment)
  if (sec.investment !== false) {
    pages.push((n, total, step) => invest(d, n, total, step));
  }

  // Condições e Aceite (terms / acceptance)
  if (sec.terms !== false || sec.acceptance !== false) {
    pages.push((n, total, step) => terms(d, n, total, step));
  }

  const totalPages = pages.length;
  let currentStep = 1;
  return pages
    .map((fn, idx) => {
      const pageNum = idx + 1;
      const isCover = idx === 0 && sec.cover !== false;
      const stepNum = isCover ? 0 : currentStep++;
      return fn(pageNum, totalPages, stepNum);
    })
    .join('');
}

export function normalizeProposalData(data: CommercialTemplateData): any {
  const d: any = { ...data };

  // Normalizar client
  if (!d.client) {
    d.client = {
      name: d.clientName || 'Cliente',
      city: d.clientCity || '',
      state: d.clientState || '',
    };
  }

  // Normalizar consultant
  if (!d.consultant) {
    d.consultant = {
      name: d.consultantName || '—',
      phone: d.consultantPhone || '',
    };
  }

  // Normalizar options se ausente (construir 1 opção a partir dos dados do projeto / proposta)
  if (!d.options || !d.options.length) {
    const finalPrice = Number(d.finalPrice || 0);
    const paybackYears = Number(d.paybackYears || 0);
    const consumptionKwh = Number(d.consumptionKwh || 0);
    const generationMonthlyKwh = Number(d.generationMonthlyKwh || 0);
    const coverage =
      consumptionKwh > 0 && generationMonthlyKwh > 0
        ? Math.min(generationMonthlyKwh / consumptionKwh, 1)
        : 0;
    const monthlySavings = d.averageBill
      ? d.averageBill * 0.9 * coverage
      : d.annualSavings
      ? d.annualSavings / 12
      : 0;

    let moduleName = 'Módulos Fotovoltaicos';
    let inverterName = 'Inversor Solar';
    if (d.equipment?.length) {
      const mod = d.equipment.find((e: any) => e.type === 'module');
      const inv = d.equipment.find((e: any) => e.type === 'inverter');
      if (mod) {
        moduleName = `${mod.brand || ''} ${mod.model || ''} ${mod.power || ''}`.trim();
      }
      if (inv) {
        inverterName = `${inv.brand || ''} ${inv.model || ''} ${inv.power || ''}`.trim();
      }
    }

    const payment = d.payment || {};
    const financeOptions: any[] = [];
    if (payment.financeInstallments && payment.financeInstallment) {
      financeOptions.push({
        n: payment.financeInstallments,
        installment: payment.financeInstallment,
      });
    }

    d.options = [
      {
        name: 'Sistema Proposto',
        recommended: false, // 1 opção: não exibe o selo "Recomendado"
        systemPowerKwp: Number(d.systemPowerKwp || 0),
        moduleQty: Number(d.moduleQty || 0),
        module: moduleName,
        inverter: inverterName,
        structure: undefined,
        generationMonthlyKwh,
        finalPrice,
        coverage,
        monthlySavings,
        paybackYears,
        payment: {
          cashPrice: payment.cashPrice,
          cashDiscountPct: payment.cashDiscount,
          cardInstallments: payment.cardInstallments,
          cardInstallment: payment.cardInstallment,
          financeOptions,
        },
      },
    ];
  }

  return d;
}

/**
 * Função principal do template comercial (Modelo Moderno).
 * Gera o documento HTML A4 completo com fontes Barlow embutidas e estilização via variáveis CSS.
 */
export async function commercialTemplate(
  rawData: CommercialTemplateData,
): Promise<string> {
  const d = normalizeProposalData(rawData);

  let qr = rawData.qr;
  if (qr === undefined && d.settings?.qr?.enabled !== false && d.publicToken) {
    const target = qrTarget(d);
    if (target) {
      try {
        const qrDataUrl = await QR.toDataURL(target.url, {
          margin: 0,
          width: 400,
          errorCorrectionLevel: 'M',
          color: { dark: '#111111', light: '#ffffff' },
        });
        qr = { img: qrDataUrl, label: target.label, url: target.url };
      } catch {
        qr = null;
      }
    } else {
      qr = null;
    }
  }

  const cssStr = getCss(d.settings || {});
  const pagesHtml = buildPagesHtml(d, qr);

  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Proposta Comercial</title>
<style>@page{size:A4;margin:0}${EMBEDDED_FONTS_CSS}${cssStr}</style></head><body>${pagesHtml}</body></html>`;
}
