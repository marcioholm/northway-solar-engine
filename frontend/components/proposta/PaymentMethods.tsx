'use client';
import { ProposalData } from '../../lib/proposal-types';

export function PaymentMethods({ data }: { data: ProposalData }) {
  const { pix, creditCard, financing, consortium } = data.paymentMethods;
  const methods = [
    {
      title: 'PIX',
      subtitle: 'À vista com desconto',
      value: `R$ ${pix.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      badge: `${pix.discountPercent}% OFF`,
      badgeColor: 'var(--green)',
      features: ['Pagamento único', 'Desconto máximo', 'Liberação imediata', 'Sem burocracia'],
    },
    {
      title: 'Cartão de Crédito',
      subtitle: 'Parcelamento sem juros',
      value: `${creditCard.installments}x de R$ ${creditCard.monthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      badge: 'Sem juros',
      badgeColor: 'var(--info)',
      features: [`Até ${creditCard.installments} parcelas`, 'Sem entrada', 'Aprovação rápida', `Total: R$ ${creditCard.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
    },
    {
      title: 'Financiamento',
      subtitle: 'Crédito bancário',
      value: `${financing.maxInstallments}x de R$ ${financing.monthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      badge: 'Entrada R$ 0',
      badgeColor: 'var(--warning)',
      features: [`Até ${financing.maxInstallments} meses`, 'Sem entrada', 'Taxa competitiva', 'Aprovação facilitada'],
    },
    {
      title: 'Consórcio',
      subtitle: 'Sem juros, com taxa de adm',
      value: `${consortium.estimatedMonths}x de R$ ${consortium.monthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      badge: 'Sem juros',
      badgeColor: 'var(--green)',
      features: [`Contemplação em ~${consortium.estimatedMonths} meses`, 'Sem entrada', 'Pode usar lance', 'Crédito para obra'],
    },
  ];
  return (
    <section className="proposal-page" style={{ padding: '80px 24px', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 8 }}>Capítulo 08</div>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 40px', color: 'var(--text)' }}>Formas de Pagamento</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {methods.map(m => (
            <div key={m.title} style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', padding: '24px', transition: 'box-shadow 0.2s, transform 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>{m.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: 2 }}>{m.subtitle}</div>
                </div>
                <span style={{ padding: '4px 8px', borderRadius: 'var(--radius-full)', background: m.badgeColor, color: '#fff', fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap' }}>{m.badge}</span>
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 16 }}>{m.value}</div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                {m.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', color: 'var(--text-secondary)', marginBottom: 4 }}>
                    <span style={{ color: 'var(--green)', fontSize: '10px' }}>●</span> {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
