'use client';

import { ShoppingCartIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { StepCard, MetricBadge } from './_shared';
import { formatBRL } from '../../../lib/format';

export function QuotesOverview({ project }: { project: any; onUpdate: (p: any) => void }) {
  const quotes = project.quotes || [];
  const selected = quotes.find((q: any) => q.selected);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <MetricBadge value={String(quotes.length)} label="Cotações" />
        <MetricBadge value={selected ? 'Sim' : 'Não'} label="Selecionada" />
        <MetricBadge value={selected && selected.totalAmount ? formatBRL(Number(selected.totalAmount)) : '—'} label="Valor" />
      </div>

      {quotes.length === 0 ? (
        <div style={{ padding: '32px 24px', textAlign: 'center', background: 'var(--ws-surface-raised)', borderRadius: 'var(--ws-radius-lg)', border: '1px dashed var(--ws-border)' }}>
          <ShoppingCartIcon style={{ width: 32, height: 32, color: 'var(--ws-text-muted)', opacity: 0.3, margin: '0 auto 12px' }} />
          <p style={{ margin: 0, fontSize: 14, color: 'var(--ws-text-secondary)' }}>Nenhuma cotação cadastrada</p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--ws-text-muted)' }}>Adicione cotações de fornecedores para comparar preços.</p>
        </div>
      ) : (
        quotes.map((q: any) => (
          <StepCard
            key={q.id}
            icon={<DocumentTextIcon style={{ width: 16, height: 16 }} />}
            title={q.supplierName || 'Fornecedor'}
            right={q.selected ? <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: 'var(--ws-green-bg)', color: 'var(--ws-green)' }}>Selecionada</span> : undefined}
          >
            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--ws-text)', fontVariantNumeric: 'tabular-nums' }}>
                {formatBRL(Number(q.totalAmount))}
              </span>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--ws-text-muted)' }}>
                {q.items?.length > 0 && <span>{q.items.length} itens</span>}
                {q.validUntil && <span>Val: {q.validUntil}</span>}
              </div>
            </div>
          </StepCard>
        ))
      )}
    </div>
  );
}
