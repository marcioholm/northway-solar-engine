// Destino do QR code da capa, escolhido pela empresa em Configurações.
// settings.qr = { enabled, type, value, message, label }
//   type: 'proposal'   -> link público desta proposta (cliente vê online e aceita)
//         'consultant' -> WhatsApp do consultor responsável pela proposta
//         'whatsapp'   -> WhatsApp fixo da empresa (value = número)
//         'site' | 'instagram' | 'custom' (value = URL / @perfil)

export const DEFAULT_LABEL: Record<string, string> = {
  proposal: 'Veja esta proposta online',
  consultant: 'Fale com seu consultor',
  whatsapp: 'Fale conosco no WhatsApp',
  site: 'Conheça nosso site',
  instagram: 'Siga a gente no Instagram',
  custom: 'Saiba mais',
};

export const digits = (s: any) => String(s || '').replace(/\D/g, '');
export const brPhone = (s: any) => {
  const d = digits(s);
  return d.length === 10 || d.length === 11 ? '55' + d : d;
};

/** Só https e domínios válidos: bloqueia javascript:, data:, http: etc. */
export function safeUrl(u: string): string | null {
  try {
    const url = new URL(/^https?:\/\//i.test(u) ? u : 'https://' + u);
    if (url.protocol !== 'https:' || !url.hostname.includes('.')) return null;
    return url.toString().slice(0, 300);
  } catch {
    return null;
  }
}

export function wa(number: any, message?: string): string | null {
  const n = brPhone(number);
  if (n.length < 12 || n.length > 13) return null;
  return `https://wa.me/${n}${
    message ? `?text=${encodeURIComponent(message.slice(0, 200))}` : ''
  }`;
}

/**
 * Destino FINAL (usado pelo backend no redirecionamento rastreado).
 * Retorna a URL validada ou null.
 */
export function resolveDestination(
  d: {
    publicToken?: string;
    client?: { name: string };
    consultant?: { name?: string; phone?: string };
    companyWhatsapp?: string;
    settings?: { contact?: { whatsapp?: string; phone?: string } };
  },
  q: {
    type: 'proposal' | 'consultant' | 'whatsapp' | 'site' | 'instagram' | 'custom';
    value?: string;
    message?: string;
  },
  publicPageBase = process.env.FRONTEND_URL
    ? `${process.env.FRONTEND_URL.replace(/\/?$/, '')}/proposta/`
    : 'https://northway-solar-engine.vercel.app/proposta/',
): string | null {
  if (!q || !q.type) return null;
  const clientName = d.client?.name || '';
  const msg = q.message ? q.message.replace('{cliente}', clientName) : undefined;

  switch (q.type) {
    case 'proposal':
      return d.publicToken
        ? `${publicPageBase.replace(/\/?$/, '/')}${encodeURIComponent(d.publicToken)}?src=qr`
        : null;
    case 'consultant': {
      // Usa telefone do consultor quando houver; se não houver, usa o WhatsApp da empresa
      const phone =
        d.consultant?.phone ||
        d.companyWhatsapp ||
        d.settings?.contact?.whatsapp ||
        d.settings?.contact?.phone;
      return wa(phone, msg);
    }
    case 'whatsapp':
      return wa(q.value, msg);
    case 'instagram': {
      const h = String(q.value || '')
        .replace(/^@/, '')
        .replace(/[^\w.]/g, '');
      return h ? `https://instagram.com/${h}` : null;
    }
    case 'site':
    case 'custom':
      return safeUrl(q.value || '');
    default:
      return null;
  }
}

/**
 * O QR SEMPRE aponta para o link rastreado da proposta (GET /q/:token na API).
 * A API registra o evento 'qr_scan' e redireciona para o destino configurado.
 * Retorna { url, destination, label } ou null (QR não aparece).
 */
export function qrTarget(
  d: {
    publicToken?: string;
    client?: { name: string };
    consultant?: { name?: string; phone?: string };
    settings?: { qr?: any; contact?: any };
    companyWhatsapp?: string;
  },
  {
    trackBase = process.env.API_PUBLIC_URL
      ? `${process.env.API_PUBLIC_URL.replace(/\/?$/, '')}/q/`
      : 'https://northway-solar-engine-api-ten.vercel.app/q/',
    publicPageBase = process.env.FRONTEND_URL
      ? `${process.env.FRONTEND_URL.replace(/\/?$/, '')}/proposta/`
      : 'https://northway-solar-engine.vercel.app/proposta/',
  } = {},
): { url: string; destination: string; label: string } | null {
  const q = d.settings?.qr;
  if (!q || q.enabled === false || !d.publicToken) return null;
  const destination = resolveDestination(d, q, publicPageBase);
  if (!destination) return null;
  const rawBase = trackBase.endsWith('/') ? trackBase : trackBase + '/';
  return {
    url: rawBase + encodeURIComponent(d.publicToken),
    destination,
    label: (q.label || DEFAULT_LABEL[q.type] || '').slice(0, 40),
  };
}

