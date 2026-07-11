'use client';
import { useState } from 'react';
import { ProposalData, DEFAULT_FAQ } from '../../lib/proposal-types';

export function FAQ({ data }: { data: ProposalData }) {
  const faqs = data.faq.length > 0 ? data.faq : DEFAULT_FAQ[data.profile];
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="proposal-page" style={{ padding: '80px 24px', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 32px', color: 'var(--text)', textAlign: 'center' }}>Perguntas Frequentes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', fontSize: '14px', fontWeight: 600, color: 'var(--text)', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                {faq.question}
                <span style={{ fontSize: 12, color: 'var(--text-muted)', transition: 'transform 0.2s', transform: open === i ? 'rotate(180deg)' : 'none' }}>▾</span>
              </button>
              {open === i && (
                <div style={{ padding: '0 20px 16px', fontSize: '13px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
