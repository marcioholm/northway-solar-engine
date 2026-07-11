const track = (proposalId: string, eventType: string, data?: Record<string, any>) => {
  const api = process.env.NEXT_PUBLIC_API_URL;
  if (!api) return;
  fetch(`${api}/proposals/${proposalId}/tracking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventType, ...data }),
    keepalive: true,
  }).catch(() => {});
};

export function useProposalTracking(proposalId: string | undefined) {
  const startTime = Date.now();

  const trackView = () => {
    if (!proposalId) return;
    track(proposalId, 'view');
  };

  const trackDuration = () => {
    if (!proposalId) return;
    const duration = Math.round((Date.now() - startTime) / 1000);
    if (duration < 5) return;
    track(proposalId, 'view', { metadata: { durationSeconds: duration } });
  };

  const trackSection = (section: string, duration?: number) => {
    if (!proposalId) return;
    track(proposalId, 'section_view', { section, duration });
  };

  const trackDownload = () => {
    if (!proposalId) return;
    track(proposalId, 'download');
  };

  const trackWhatsApp = () => {
    if (!proposalId) return;
    track(proposalId, 'whatsapp_click');
  };

  const trackAccept = () => {
    if (!proposalId) return;
    track(proposalId, 'accept');
  };

  const trackChangeRequest = (message?: string) => {
    if (!proposalId) return;
    track(proposalId, 'change_request', { metadata: { message } });
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
