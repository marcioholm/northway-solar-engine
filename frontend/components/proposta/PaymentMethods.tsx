'use client';
import { ProposalData } from '../../lib/proposal-types';
import { formatBRL } from '../../lib/format';

export function PaymentMethods({ data }: { data: ProposalData }) {
  const pm = data.paymentMethods;
  if (!pm) return null;

  const methods: { title: string; subtitle: string; value: string; badge?: string; badgeColor?: string }[] = [];

  if (pm.pix?.total != null) {
    methods.push({
      title: 'PIX',
      subtitle: pm.pix.discountPercent ? `À vista com ${pm.pix.discountPercent}% de desconto` : 'À vista',
      value: formatBRL(pm.pix.total),
      badge: pm.pix.discountPercent ? `${pm.pix.discountPercent}% OFF` : undefined,
      badgeColor: 'var(--green)',
    });
  }

  if (pm.creditCard?.installments && pm.creditCard?.monthly) {
    methods.push({
      title: 'Cartão de Crédito',
      subtitle: 'Parcelamento',
      value: `${pm.creditCard.installments}x de ${formatBRL(pm.creditCard.monthly)}`,
      badge: pm.creditCard.installments <= 12 ? 'Sem juros' : undefined,
      badgeColor: 'var(--info)',
    });
  }

  if (pm.financing?.maxInstallments && pm.financing?.monthly) {
    methods.push({
      title: 'Financiamento',
      subtitle: pm.financing.entry != null && pm.financing.entry === 0 ? 'Sem entrada' : 'Crédito bancário',
      value: `${pm.financing.maxInstallments}x de ${formatBRL(pm.financing.monthly)}`,
      badge: 'Financiamento',
      badgeColor: 'var(--warning)',
    });
  }

  if (pm.consortium?.estimatedMonths && pm.consortium?.monthly) {
    methods.push({
      title: 'Consórcio',
      subtitle: 'Sem juros',
      value: `${pm.consortium.estimatedMonths}x de ${formatBRL(pm.consortium.monthly)}`,
      badge: 'Consórcio',
      badgeColor: 'var(--green)',
    });
  }

  if (methods.length === 0) return null;

  return (
    <section className="proposal-page" style={{ padding: '80px 24px', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 8 }}>Capítulo 08</div>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 40px', color: 'var(--text)' }}>Formas de Pagamento</h2>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${methods.length === 1 ? '320' : '220'}px, 1fr))`, gap: 16 }}>
          {methods.map(m => (
            <div key={m.title} style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>{m.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: 2 }}>{m.subtitle}</div>
                </div>
                {m.badge && <span style={{ padding: '4px 8px', borderRadius: 'var(--radius-full)', background: m.badgeColor, color: '#fff', fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap' }}>{m.badge}</span>}
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
