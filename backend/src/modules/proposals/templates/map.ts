// "Onde atuamos" — mapa desenhado pelo sistema a partir dos estados e cidades
// marcados em Configurações. Base: @svg-maps/brazil (CC BY 4.0, Victor Cazanave);
// coordenadas das cidades: kelvins/municipios-brasileiros (MIT).
import { BRAZIL_STATES_GEO } from '../../geo/data/brazil-states.data';
import { esc } from './shared';

const GEO = BRAZIL_STATES_GEO;
const P = GEO.projection;
const BY_UF: Record<string, any> = Object.fromEntries(
  GEO.states.map((s) => [s.uf, s]),
);
const merc = (lat: number) =>
  Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const project = (lat: number, lon: number) => [
  P.a * lon + P.b,
  P.c * merc(lat) + P.d,
];

function unionBox(ufs: string[], pad: number) {
  let x0 = Infinity,
    y0 = Infinity,
    x1 = -Infinity,
    y1 = -Infinity;
  ufs.forEach((uf) => {
    const s = BY_UF[uf];
    if (!s) return;
    const [x, y, w, h] = s.bbox;
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x + w);
    y1 = Math.max(y1, y + h);
  });
  if (!isFinite(x0)) return [0, 0, 613, 639];
  const p = Math.max(x1 - x0, y1 - y0) * pad;
  return [x0 - p, y0 - p, x1 - x0 + 2 * p, y1 - y0 + 2 * p];
}

export interface MapSvgOptions {
  states: string[];
  cities?: Array<{ name: string; uf: string; lat: number; lon: number }>;
  color: string;
  accent: string;
  numbered?: boolean;
  labels?: boolean;
}

/**
 * mode: 'brasil' (país inteiro, estados em destaque) | 'zoom' (recorte nos estados)
 */
export function mapSvg(
  mode: 'brasil' | 'zoom',
  {
    states,
    cities = [],
    color,
    accent,
    numbered = false,
    labels = true,
  }: MapSvgOptions,
): string {
  const sel = new Set(states);
  const vb =
    mode === 'zoom'
      ? unionBox(states, 0.08)
      : GEO.viewBox.split(' ').map(Number);
  const k = vb[2] / 613; // escala relativa para traço e pontos
  const paths = GEO.states
    .map((s) => {
      const on = sel.has(s.uf);
      return `<path d="${s.path}" style="fill:${on ? color : '#e2e6e4'}" stroke="#fff" stroke-width="${(on ? 1.4 : 1) * k}" stroke-linejoin="round"/>`;
    })
    .join('');
  const ufLabels = labels
    ? states
        .map((uf) => {
          const s = BY_UF[uf];
          if (!s) return '';
          const [x, y] = s.label;
          return `<text x="${x}" y="${y}" font-size="${(mode === 'zoom' ? 28 : 17) * k}" font-weight="700" fill="#fff" fill-opacity=".9" text-anchor="middle" dominant-baseline="central" font-family="Barlow Condensed,sans-serif">${uf}</text>`;
        })
        .join('')
    : '';
  const r = (mode === 'zoom' ? 10 : 5.5) * k;
  // afasta marcadores numerados que se sobrepõem (cidades vizinhas)
  const pos = cities.map((c) => project(c.lat, c.lon));
  if (numbered) {
    const min = r * 3.3;
    for (let it = 0; it < 40; it++) {
      for (let i = 0; i < pos.length; i++)
        for (let j = i + 1; j < pos.length; j++) {
          const dx = pos[j][0] - pos[i][0],
            dy = pos[j][1] - pos[i][1],
            dist = Math.hypot(dx, dy) || 0.01;
          if (dist < min) {
            const m = (min - dist) / 2,
              ux = dx / dist,
              uy = dy / dist;
            pos[i][0] -= ux * m;
            pos[i][1] -= uy * m;
            pos[j][0] += ux * m;
            pos[j][1] += uy * m;
          }
        }
    }
  }
  const dots = cities
    .map((c, i) => {
      const [x, y] = pos[i];
      return numbered
        ? `<circle cx="${x}" cy="${y}" r="${r * 1.55}" style="fill:${accent}" stroke="#fff" stroke-width="${1.2 * k}"/><text x="${x}" y="${y + 0.4 * k}" font-size="${r * 1.7}" font-weight="700" text-anchor="middle" dominant-baseline="central" style="fill:var(--on-pri,#111)" font-family="Barlow Condensed,sans-serif">${i + 1}</text>`
        : `<circle cx="${x}" cy="${y}" r="${r}" style="fill:${accent}" stroke="#111" stroke-opacity=".55" stroke-width="${0.9 * k}"/>`;
    })
    .join('');
  return `<svg viewBox="${vb.join(' ')}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">${paths}${ufLabels}${dots}</svg>`;
}

/** Silhueta de um único estado com as cidades dele. */
export function stateTile(
  uf: string,
  cities: Array<{ uf: string; lat: number; lon: number }>,
  color: string,
  accent: string,
): string {
  const s = BY_UF[uf];
  if (!s) return '';
  const [x, y, w, h] = s.bbox;
  const p = Math.max(w, h) * 0.06;
  const k = Math.max(w, h) / 120;
  const dots = cities
    .filter((c) => c.uf === uf)
    .map((c) => {
      const [cx, cy] = project(c.lat, c.lon);
      return `<circle cx="${cx}" cy="${cy}" r="${3.4 * k}" style="fill:${accent}" stroke="#111" stroke-opacity=".55" stroke-width="${0.8 * k}"/>`;
    })
    .join('');
  return `<svg viewBox="${x - p} ${y - p} ${w + 2 * p} ${h + 2 * p}" style="width:100%;height:100%;display:block"><path d="${s.path}" style="fill:${color}"/>${dots}</svg>`;
}

export const stateName = (uf: string): string => BY_UF[uf]?.name || uf;

/** Figura pronta para qualquer modelo: 'brasil' | 'zoom' | 'estados' (grade de silhuetas). */
export function areaFigure(
  area: { style?: 'brasil' | 'zoom' | 'estados'; states: string[]; cities?: any[] },
  color: string,
  accent: string,
  opts: { numbered?: boolean } = {},
): string {
  if (!area || !area.states || !area.states.length) return '';
  const style = area.style || (area.states.length <= 4 ? 'zoom' : 'brasil');
  if (style === 'estados') {
    const n = area.states.length,
      cols = n <= 2 ? n : 2;
    return `<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:3mm;width:100%;height:100%">${area.states
      .map(
        (uf) =>
          `<div style="display:flex;flex-direction:column;min-height:0"><div style="flex:1;min-height:0">${stateTile(uf, area.cities || [], color, accent)}</div><div style="font-size:6.6pt;font-weight:700;text-align:center;margin-top:.8mm;color:${color}">${esc(stateName(uf))}</div></div>`,
      )
      .join('')}</div>`;
  }
  return mapSvg(style, {
    states: area.states,
    cities: area.cities || [],
    color,
    accent,
    numbered: !!opts.numbered && style === 'zoom',
  });
}

/** Lista de cidades agrupada por estado (numerada quando o mapa usa pins numerados). */
export function cityGroups(area: { states?: string[]; cities?: any[] }) {
  if (!area || !area.states) return [];
  return area.states.map((uf) => ({
    uf,
    name: stateName(uf),
    cities: (area.cities || []).filter((c) => c.uf === uf),
  }));
}
