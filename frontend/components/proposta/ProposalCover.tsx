'use client';
import { ProposalData, generateTexts } from '../../lib/proposal-types';

export function ProposalCover({ data }: { data: ProposalData }) {
  const t = generateTexts(data);
  return (
    <section className="proposal-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '48px 24px', position: 'relative', background: 'linear-gradient(180deg, var(--green) 0%, #5a8f20 100%)', color: '#fff' }}>
      <div style={{ position: 'absolute', top: 32, left: 32, fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.6 }}>SolarOS</div>
      <div style={{ position: 'absolute', top: 32, right: 32, fontSize: '13px', fontWeight: 500, opacity: 0.5 }}>{data.createdAt ? new Date(data.createdAt).toLocaleDateString('pt-BR') : ''}</div>
      <div style={{ maxWidth: 680 }}>
        <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.5, marginBottom: 24 }}>Plano Solar Personalizado</div>
        <h1 style={{ fontSize: 'clamp(42px, 7vw, 80px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, margin: '0 0 16px' }}>{data.clientName || 'Cliente'}</h1>
        {t.tagline && <div style={{ width: 60, height: 3, background: 'rgba(255,255,255,0.3)', borderRadius: 2, margin: '24px auto' }} />}
        {t.tagline && <p style={{ fontSize: '14px', fontWeight: 500, opacity: 0.6, lineHeight: 1.5, margin: '0 0 8px' }}>{t.tagline}</p>}
        {(data.clientCity || data.clientState || data.consultantName) && (
          <p style={{ fontSize: '16px', fontWeight: 400, opacity: 0.75, lineHeight: 1.5, margin: 0 }}>
            {[data.clientCity, data.clientState].filter(Boolean).join(', ')}{data.consultantName ? ` — ${data.consultantName}` : ''}
          </p>
        )}
      </div>
      <div style={{ position: 'absolute', bottom: 40, display: 'flex', gap: 32, fontSize: '12px', opacity: 0.4, fontWeight: 500 }}>
        <span>Engenharia & Tecnologia</span>
        <span>•</span>
        <span>Inteligência Financeira</span>
        <span>•</span>
        <span>Eficiência Energética</span>
      </div>
    </section>
  );
}
