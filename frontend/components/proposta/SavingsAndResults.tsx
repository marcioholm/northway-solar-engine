'use client';
import { ProposalData, hasSavingsData } from '../../lib/proposal-types';
import { formatBRL } from '../../lib/format';
import { SectionWrapper } from './SectionWrapper';

export function SavingsAndResults({ data }: { data: ProposalData }) {
  if (!hasSavingsData(data)) return null;

  const currentBill = data.monthlyBill || 0;
  const savings = data.monthlySavings || 0;
  const newBill = Math.max(0, currentBill - savings);

  const bars = Array.from({ length: 25 }, (_, i) => i + 1);
  const payback = data.paybackYears || 5;

  return (
    <SectionWrapper level="content" background="var(--surface)">
      <h2 style={{ fontSize: 'clamp(24px, 2.5vw + 14px, 42px)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 32px', color: 'var(--text)', textAlign: 'center' }}>
        Sua Economia com Solar
      </h2>

      {/* Hoje vs Com Solar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 40, alignItems: 'center' }}>
        <div style={{ background: '#fef2f2', borderRadius: 'var(--radius-xl)', padding: '32px', border: '1px solid #fecaca', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Hoje</div>
          <div style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 900, letterSpacing: '-0.02em', color: '#991b1b' }}>{formatBRL(currentBill)}</div>
          <div style={{ fontSize: '13px', color: '#7f1d1d', marginTop: 4 }}>conta de luz/mês</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', opacity: 0.5, fontSize: '24px' }}>→</div>

        <div style={{ background: 'var(--green-bg)', borderRadius: 'var(--radius-xl)', padding: '32px', border: '1px solid var(--green-light)', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--green-dark)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Com Solar</div>
          <div style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--green-dark)' }}>{formatBRL(newBill)}</div>
          <div style={{ fontSize: '13px', color: '#166534', marginTop: 4 }}>taxa mínima/mês</div>
        </div>
      </div>

      {/* Grid de métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 48, textAlign: 'center' }}>
        {data.yearlySavings != null && (
          <div style={{ background: 'var(--surface-muted)', borderRadius: 'var(--radius-lg)', padding: '24px 16px' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>{formatBRL(data.yearlySavings).split(',')[0]}</div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 6 }}>Economia/ano</div>
          </div>
        )}
        {data.savings25Years != null && (
          <div style={{ background: 'var(--surface-muted)', borderRadius: 'var(--radius-lg)', padding: '24px 16px' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>{formatBRL(data.savings25Years).split(',')[0]}</div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 6 }}>Em 25 anos</div>
          </div>
        )}
        {data.paybackYears != null && (
          <div style={{ background: 'var(--surface-muted)', borderRadius: 'var(--radius-lg)', padding: '24px 16px' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>{data.paybackYears.toFixed(1)} anos</div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 6 }}>Payback</div>
          </div>
        )}
      </div>

      {/* Gráfico SVG de Payback */}
      <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', position: 'relative' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16, textAlign: 'center' }}>Projeção de Retorno (25 anos)</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', height: 120, gap: 4 }}>
          {bars.map(year => {
            const isPayback = year > Math.floor(payback);
            const height = Math.min(100, 20 + (year * 3));
            return (
              <div key={year} style={{ flex: 1, height: `${height}%`, background: isPayback ? 'var(--green)' : 'var(--green-light)', borderRadius: '2px 2px 0 0', position: 'relative' }}>
                {Math.floor(payback) === year && (
                  <div style={{ position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)', borderLeft: '2px dashed var(--text-muted)', height: 150, zIndex: 1 }} />
                )}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: 8 }}>
          <span>Ano 1</span>
          <span>Ano 25</span>
        </div>
      </div>
    </SectionWrapper>
  );
}
