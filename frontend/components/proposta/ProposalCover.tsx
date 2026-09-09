'use client';
import { ProposalData, generateTexts } from '../../lib/proposal-types';
import { SectionWrapper } from './SectionWrapper';

export function ProposalCover({ data }: { data: ProposalData }) {
  const t = generateTexts(data);
  const companyLogo = data.company?.logoUrl;
  return (
    <SectionWrapper level="hero" background="var(--surface)" className="proposal-cover">
      <div style={{ textAlign: 'center', padding: '40px 0', position: 'relative' }}>
        <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
          {companyLogo ? (
            <img src={companyLogo} alt="" style={{ height: 32, objectFit: 'contain' }} />
          ) : (
            <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--green)' }}>SolarOS</span>
          )}
          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>
            {data.createdAt ? new Date(data.createdAt).toLocaleDateString('pt-BR') : ''}
          </span>
        </div>
        
        <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 24 }}>Plano Solar Personalizado</div>
        <h1 style={{ fontSize: 'clamp(36px, 5vw + 12px, 64px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 24px', color: 'var(--text)' }}>
          {data.clientName || 'Cliente'}
        </h1>
        
        {t.tagline && <div style={{ width: 60, height: 3, background: 'var(--green)', borderRadius: 2, margin: '0 auto 24px' }} />}
        {t.tagline && <p style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text)', lineHeight: 1.5, margin: '0 0 12px' }}>{t.tagline}</p>}
        
        {(data.clientCity || data.clientState || data.consultantName) && (
          <p style={{ fontSize: '16px', fontWeight: 400, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            {[data.clientCity, data.clientState].filter(Boolean).join(', ')}{data.consultantName ? ` — ${data.consultantName}` : ''}
          </p>
        )}

        <div style={{ marginTop: 64, display: 'flex', justifyContent: 'center', gap: 24, fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, flexWrap: 'wrap' }}>
          <span>Engenharia & Tecnologia</span>
          <span>•</span>
          <span>Inteligência Financeira</span>
          <span>•</span>
          <span>Eficiência Energética</span>
        </div>
      </div>
    </SectionWrapper>
  );
}
