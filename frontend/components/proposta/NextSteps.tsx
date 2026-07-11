'use client';
import { useState } from 'react';
import { ProposalData, generateTexts } from '../../lib/proposal-types';

export function NextSteps({ data }: { data: ProposalData }) {
  const t = generateTexts(data);
  const [signed, setSigned] = useState(false);

  return (
    <section className="proposal-page" style={{ padding: '80px 24px', background: 'var(--surface)', textAlign: 'center' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 8 }}>Próximos Passos</div>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 8px', color: 'var(--text)' }}>Como Prosseguir</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40, textAlign: 'left', maxWidth: 400, margin: '32px auto 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 'var(--radius-lg)', background: signed ? 'var(--green-bg)' : 'var(--bg)', border: `1px solid ${signed ? 'var(--green-light)' : 'var(--border)'}` }}>
            <span style={{ fontSize: 18, color: signed ? 'var(--green)' : 'var(--text-muted)' }}>{signed ? '✓' : '○'}</span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: signed ? 'var(--green-dark)' : 'var(--text)' }}>Assinar proposta digital</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 'var(--radius-lg)', background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>○</span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>Agendar vistoria técnica</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 'var(--radius-lg)', background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>○</span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>Aprovar projeto executivo</span>
          </div>
        </div>
        <button onClick={() => setSigned(true)} style={{ background: 'linear-gradient(135deg, var(--green), var(--green-dark))', border: 'none', color: '#fff', padding: '18px 48px', borderRadius: 'var(--radius-lg)', fontSize: '15px', fontWeight: 700, cursor: 'pointer', boxShadow: 'var(--shadow-glow)', transition: 'transform 0.15s', marginBottom: 32 }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')} onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
          {signed ? '✓ Assinado' : 'Assinar Proposta'}
        </button>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 24 }}>
          {data.consultantName && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Consultor</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{data.consultantName}</div>
            </div>
          )}
          {data.consultantPhone && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>WhatsApp</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--green)' }}>{data.consultantPhone}</div>
            </div>
          )}
        </div>
        {t.heroText && <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>{t.finalMessage}</p>}
      </div>
    </section>
  );
}
