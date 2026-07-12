'use client';

import { DocumentTextIcon, EyeIcon, ArrowDownTrayIcon, ShareIcon } from '@heroicons/react/24/outline';
import { formatBRL } from '../../../lib/format';

export function ProposalOverview({ project }: { project: any; onUpdate: (p: any) => void }) {
  const proposals = project.proposals || [];
  const latestProposal = proposals[proposals.length - 1];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {proposals.length > 0 ? (
        <>
          <div style={{ padding: 20, background: 'var(--ws-surface-raised)', borderRadius: 'var(--ws-radius-lg)', border: '1px solid var(--ws-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--ws-text)' }}>Última Proposta</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--ws-text-muted)' }}>Versão atual · {latestProposal.stage || 'proposal_sent'}</p>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <IconButton icon={<EyeIcon style={{ width: 14, height: 14 }} />} label="Visualizar" />
                <IconButton icon={<ArrowDownTrayIcon style={{ width: 14, height: 14 }} />} label="PDF" />
                <IconButton icon={<ShareIcon style={{ width: 14, height: 14 }} />} label="Compartilhar" />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--ws-text)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
              {formatBRL(Number(latestProposal.finalPrice))}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 12, color: 'var(--ws-text-muted)' }}>
              <span>{latestProposal.systemPowerKwp?.toFixed(2)} kWp</span>
              <span>{latestProposal.moduleQty} módulos</span>
              {latestProposal.paybackYears && <span>{latestProposal.paybackYears} anos payback</span>}
            </div>
          </div>

          {proposals.slice(0, -1).reverse().map((p: any) => (
            <div key={p.id} style={{ padding: '12px 16px', background: 'var(--ws-surface-raised)', borderRadius: 10, border: '1px solid var(--ws-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--ws-text-secondary)' }}>Versão anterior</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ws-text)', fontVariantNumeric: 'tabular-nums' }}>{formatBRL(Number(p.finalPrice))}</span>
            </div>
          ))}
        </>
      ) : (
        <div style={{ padding: '48px 24px', textAlign: 'center', background: 'var(--ws-surface-raised)', borderRadius: 'var(--ws-radius-lg)', border: '1px dashed var(--ws-border)' }}>
          <DocumentTextIcon style={{ width: 40, height: 40, color: 'var(--ws-text-muted)', opacity: 0.25, margin: '0 auto 16px' }} />
          <p style={{ margin: 0, fontSize: 14, color: 'var(--ws-text-secondary)' }}>Nenhuma proposta gerada</p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--ws-text-muted)' }}>Complete as etapas anteriores e gere a primeira proposta.</p>
        </div>
      )}
    </div>
  );
}

function IconButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--ws-border)', background: 'transparent', color: 'var(--ws-text-secondary)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
      {icon}
      {label}
    </button>
  );
}
