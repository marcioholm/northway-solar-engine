// Destino do QR code da capa, escolhido pela empresa em Configurações.
// settings.qr = { enabled, type, value, message, label }
//   type: 'proposal'   -> link público desta proposta (cliente vê online e aceita)
//         'consultant' -> WhatsApp do consultor responsável pela proposta
//         'whatsapp'   -> WhatsApp fixo da empresa (value = número)
//         'site' | 'instagram' | 'custom' (value = URL / @perfil)
const DEFAULT_LABEL = {
  proposal: 'Veja esta proposta online', // vira "Veja e aceite" quando o aceite online existir
  consultant: 'Fale com seu consultor',
  whatsapp: 'Fale conosco no WhatsApp',
  site: 'Conheça nosso site',
  instagram: 'Siga a gente no Instagram',
  custom: 'Saiba mais',
};

const digits = (s) => String(s || '').replace(/\D/g, '');
const brPhone = (s) => { const d = digits(s); return d.length === 10 || d.length === 11 ? '55' + d : d; };

/** Só https e domínios válidos: bloqueia javascript:, data:, http: etc. */
function safeUrl(u) {
  try {
    const url = new URL(/^https?:\/\//i.test(u) ? u : 'https://' + u);
    if (url.protocol !== 'https:' || !url.hostname.includes('.')) return null;
    return url.toString().slice(0, 300);
  } catch { return null; }
}

function wa(number, message) {
  const n = brPhone(number);
  if (n.length < 12 || n.length > 13) return null;
  return `https://wa.me/${n}${message ? `?text=${encodeURIComponent(message.slice(0, 200))}` : ''}`;
}

/**
 * Destino FINAL (usado só pelo backend no redirecionamento rastreado).
 * Retorna a URL validada ou null.
 */
function resolveDestination(d, q, publicPageBase) {
  switch (q.type) {
    case 'proposal': return d.publicToken ? `${publicPageBase}${encodeURIComponent(d.publicToken)}?src=qr` : null;
    case 'consultant': return wa(d.consultant && d.consultant.phone, q.message && q.message.replace('{cliente}', d.client.name));
    case 'whatsapp': return wa(q.value, q.message && q.message.replace('{cliente}', d.client.name));
    case 'instagram': { const h = String(q.value || '').replace(/^@/, '').replace(/[^\w.]/g, ''); return h ? `https://instagram.com/${h}` : null; }
    case 'site': case 'custom': return safeUrl(q.value || '');
    default: return null;
  }
}

/**
 * O QR SEMPRE aponta para o link rastreado da proposta (GET /q/:token na API).
 * A API registra o evento 'qr_scan' e redireciona para o destino configurado.
 * Retorna { url, destination, label } ou null (QR não aparece).
 */
function qrTarget(d, { trackBase = 'https://northway-solar-engine-api-ten.vercel.app/q/', publicPageBase = 'https://northway-solar-engine.vercel.app/proposta/' } = {}) {
  const q = d.settings.qr;
  if (!q || q.enabled === false || !d.publicToken) return null;
  const destination = resolveDestination(d, q, publicPageBase);
  if (!destination) return null;
  return { url: trackBase + encodeURIComponent(d.publicToken), destination, label: (q.label || DEFAULT_LABEL[q.type] || '').slice(0, 40) };
}

module.exports = { qrTarget, resolveDestination, safeUrl, DEFAULT_LABEL };
