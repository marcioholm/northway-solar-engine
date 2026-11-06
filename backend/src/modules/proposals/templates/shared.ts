// Utilitários comuns aos modelos de proposta comercial em TypeScript
export const esc = (s: any): string =>
  s == null
    ? ''
    : String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

export const money = (v: any, dec = 2): string =>
  v == null || isNaN(v)
    ? ''
    : 'R$ ' +
      Number(v).toLocaleString('pt-BR', {
        minimumFractionDigits: dec,
        maximumFractionDigits: dec,
      });

export const num = (v: any, dec = 0): string =>
  v == null || isNaN(v)
    ? ''
    : Number(v).toLocaleString('pt-BR', {
        minimumFractionDigits: dec,
        maximumFractionDigits: dec,
      });

export const lines = (t: any): string[] =>
  t ? String(t).split('\n').map((l) => l.trim()).filter(Boolean) : [];

export const recommendedOf = (d: any) =>
  (d.options || []).find((o: any) => o.recommended) || (d.options || [])[0] || {};

/** Cor de texto legível sobre um fundo (YIQ). */
export function onColor(hex: string): string {
  if (!hex) return '#fff';
  const h = hex.replace('#', '');
  const clean = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(clean.slice(0, 2), 16) || 0;
  const g = parseInt(clean.slice(2, 4), 16) || 0;
  const b = parseInt(clean.slice(4, 6), 16) || 0;
  return (r * 299 + g * 587 + b * 114) / 1000 >= 150 ? '#111' : '#fff';
}

/** Ícones de linha próprios (sem biblioteca externa, sem emoji). */
export const ICONS: Record<string, string> = {
  team: '<circle cx="12" cy="7" r="3"/><circle cx="5" cy="10" r="2.2"/><circle cx="19" cy="10" r="2.2"/><path d="M6.5 20v-2a5.5 5.5 0 0 1 11 0v2"/><path d="M1.5 19v-1a3.5 3.5 0 0 1 4-3.4"/><path d="M22.5 19v-1a3.5 3.5 0 0 0-4-3.4"/>',
  support: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="2.5" y="13" width="4" height="6" rx="1.2"/><rect x="17.5" y="13" width="4" height="6" rx="1.2"/><path d="M19.5 19c0 1.7-2 2.5-5 2.5"/>',
  gauge: '<path d="M3.5 17a8.5 8.5 0 1 1 17 0"/><path d="M12 17l4-5"/><circle cx="12" cy="17" r="1.3"/><path d="M6 13l1 .6M12 8.5V10M18 13l-1 .6"/>',
  helmet: '<path d="M3 17h18"/><path d="M5 17v-3a7 7 0 0 1 14 0v3"/><path d="M10 7.3V11M14 7.3V11"/><path d="M4 17v1.5a1.5 1.5 0 0 0 1.5 1.5h13a1.5 1.5 0 0 0 1.5-1.5V17"/>',
  check: '<path d="M4 12.5l5 5L20 6.5"/>',
};

export const icon = (
  name: string,
  size = 24,
  stroke = 'currentColor',
  sw = 1.7,
): string =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`;

