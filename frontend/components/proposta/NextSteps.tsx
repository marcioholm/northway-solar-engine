'use client';
import { useState } from 'react';
import { ProposalData, generateTexts } from '../../lib/proposal-types';

export function NextSteps({ data }: { data: ProposalData }) {
  const t = generateTexts(data);
  const [signed, setSigned] = useState(false);
  const steps = [
    { label: 'Assinar proposta digital', done: signed },
    { label: 'Agendar vistoria técnica', done: false },
    { label: 'Enviar documentos', done: false },
    { label: 'Aprovar projeto', done: false },
  ];
  return (
    <section className="proposal-page" style={{ padding: '80px 24px', background: 'var(--surface)', textAlign: 'center' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 8 }}>Último Capítulo</div>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 40px', color: 'var(--text)' }}>Próximos Passos</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40, textAlign: 'left', maxWidth: 400, margin: '0 auto 40px' }}>
          {steps.map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 'var(--radius-lg)', background: s.done ? 'var(--green-bg)' : 'var(--bg)', border: `1px solid ${s.done ? 'var(--green-light)' : 'var(--border)'}`, opacity: s.done ? 0.7 : 1 }}>
              <span style={{ fontSize: 18, color: s.done ? 'var(--green)' : 'var(--text-muted)' }}>{s.done ? '✓' : '○'}</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: s.done ? 'var(--green-dark)' : 'var(--text)' }}>{s.label}</span>
            </div>
          ))}
        </div>
        <button onClick={() => setSigned(true)} style={{ background: 'linear-gradient(135deg, var(--green), var(--green-dark))', border: 'none', color: '#fff', padding: '18px 48px', borderRadius: 'var(--radius-lg)', fontSize: '15px', fontWeight: 700, cursor: 'pointer', boxShadow: 'var(--shadow-glow)', transition: 'transform 0.15s', marginBottom: 32 }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')} onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
          {signed ? '✓ Proposta Assinada' : 'Assinar Proposta'}
        </button>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Consultor</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{data.consultantName}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>WhatsApp</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--green)' }}>{data.consultantPhone}</div>
          </div>
        </div>
        <div style={{ width: 120, height: 120, background: 'var(--surface-muted)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.4 }}>QR Code<br/>WhatsApp</span>
        </div>
        <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>{t.finalMessage}</p>
      </div>
    </section>
  );
}
