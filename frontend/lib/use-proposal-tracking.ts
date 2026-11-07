const track = (publicToken: string, eventType: string, data?: Record<string, any>) => {
  const api = process.env.NEXT_PUBLIC_API_URL;
  if (!api) return;
  fetch(`${api}/proposals/public/${publicToken}/tracking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventType, ...data }),
    keepalive: true,
  }).catch(() => {});
};

export function useProposalTracking(publicToken: string | undefined) {
  const startTime = Date.now();

  const trackView = () => {
    if (!publicToken) return;
    const isQr =
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('src') === 'qr';
    track(
      publicToken,
      'view',
      isQr ? { metadata: { source: 'qr' } } : undefined,
    );
  };

  const trackDuration = () => {
    if (!publicToken) return;
    const duration = Math.round((Date.now() - startTime) / 1000);
    if (duration < 5) return;
    track(publicToken, 'view', { metadata: { durationSeconds: duration } });
  };

  const trackSection = (section: string, duration?: number) => {
    if (!publicToken) return;
    track(publicToken, 'section_view', { section, duration });
  };

  const trackDownload = () => {
    if (!publicToken) return;
    track(publicToken, 'download');
  };

  const trackWhatsApp = () => {
    if (!publicToken) return;
    track(publicToken, 'whatsapp_click');
  };

  const trackAccept = () => {
    // Aceite de proposta é fluxo específico com assinatura/confirmação,
    // não um simples evento de analytics na rota pública de tracking.
  };

  const trackChangeRequest = (message?: string) => {
    if (!publicToken) return;
    track(publicToken, 'change_request', { metadata: { message } });
  };

  return {
    trackView,
    trackDuration,
    trackSection,
    trackDownload,
    trackWhatsApp,
    trackAccept,
    trackChangeRequest,
  };
}
