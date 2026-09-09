'use client';
import { ProposalData } from '../../lib/proposal-types';
import { SectionWrapper } from './SectionWrapper';

export function Investment({ data }: { data: ProposalData }) {
  if (data.finalPrice == null) return null;

  const lucroYears = data.paybackYears ? (25 - data.paybackYears).toFixed(1) : null;

  return (
    <SectionWrapper level="hero" background="var(--surface)" className="print-break-before">
      <div id="investment-section" style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(24px, 2.5vw + 14px, 42px)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 8px', color: 'var(--text)' }}>
          Investimento
        </h2>
        <p style={{ fontSize: 'clamp(13px, 1.2vw + 8px, 16px)', color: 'var(--text-secondary)', marginBottom: 40 }}>
          Transforme despesa em patrimônio
        </p>

        <div className="print-invert" style={{ background: 'linear-gradient(135deg, var(--green), var(--green-dark))', borderRadius: 'var(--radius-xl)', padding: '48px 32px', boxShadow: 'var(--shadow-glow)', marginBottom: 24 }}>
          <div style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.8, color: '#fff', marginBottom: 8 }}>
            Valor Total
          </div>
          
          <div className="print-keep-green" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 4, color: '#fff' }}>
            <span style={{ fontSize: '24px', fontWeight: 600, marginTop: 8 }}>R$</span>
            <span style={{ fontSize: 'clamp(36px, 4vw + 20px, 56px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>
              {data.finalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 }).split(',')[0]}
            </span>
            <span style={{ fontSize: 'clamp(18px, 2vw + 10px, 32px)', fontWeight: 700, opacity: 0.7, marginTop: 8 }}>
              ,{data.finalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 }).split(',')[1]}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '24px', border: '2px solid var(--green)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--green)', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '4px 8px', borderRadius: 'var(--radius-full)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Melhor valor
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>À vista</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
              R$ {((data.finalPrice) * 0.95).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--green-dark)', fontWeight: 600 }}>-5% de desconto via Pix</div>
          </div>
          
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Parcelado</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
              12x R$ {(data.finalPrice / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>sem juros no cartão</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 16, background: 'var(--surface-muted)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: 24 }}>
          {data.yearlySavings != null && (
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Economia/ano</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)' }}>R$ {data.yearlySavings.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</div>
            </div>
          )}
          {data.roi != null && (
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>ROI</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)' }}>{data.roi}%</div>
            </div>
          )}
          {data.paybackYears != null && (
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Payback</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)' }}>{data.paybackYears.toFixed(1)} anos</div>
            </div>
          )}
        </div>

        {data.paybackYears && (
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            "Seu sistema se paga em {data.paybackYears.toFixed(1)} anos. Nos {lucroYears} anos seguintes, é lucro."
          </p>
        )}
      </div>
    </SectionWrapper>
  );
}
