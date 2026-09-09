'use client';
import { ProposalData, generateTexts } from '../../lib/proposal-types';
import { formatBRL } from '../../lib/format';
import { SectionWrapper } from './SectionWrapper';

export function CurrentReality({ data }: { data: ProposalData }) {
  const t = generateTexts(data);
  const hasData = data.monthlyBill != null || data.consumption != null || data.utility;
  if (!hasData) return null;

  return (
    <SectionWrapper level="support" background="var(--bg)">
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(24px, 2.5vw + 14px, 42px)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 32px', color: 'var(--text)' }}>
          Diagnóstico Energético
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`, gap: 16, marginBottom: 32 }}>
          {data.monthlyBill != null && (
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Conta de Luz</div>
              <div style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>{formatBRL(data.monthlyBill)}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: 4 }}>média mensal</div>
            </div>
          )}
          {data.consumption != null && (
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Consumo</div>
              <div style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>{data.consumption} kWh</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: 4 }}>médio mensal</div>
            </div>
          )}
          {data.utility && (
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Concessionária</div>
              <div style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>{data.utility}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: 4 }}>distribuidora</div>
            </div>
          )}
        </div>
        
        {t.heroText && <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--text-secondary)', marginTop: 24 }}>{t.heroText}</p>}
      </div>
    </SectionWrapper>
  );
}
