'use client';

import { DocumentTextIcon, EyeIcon, ArrowDownTrayIcon, ShareIcon } from '@heroicons/react/24/outline';
import { formatBRL } from '../../../lib/format';

export function ProposalOverview({ project }: { project: any; onUpdate: (p: any) => void }) {
  const proposals = project.proposals || [];
  const latestProposal = proposals[proposals.length - 1];

  const handleView = () => {
    if (!latestProposal) return;
    if (latestProposal.publicToken) {
      window.open(`${process.env.NEXT_PUBLIC_API_URL}/proposals/public/${latestProposal.publicToken}?format=html`, '_blank');
    } else {
      alert('Proposta ainda não possui link público.');
    }
  };

  const handlePdf = async () => {
    if (!latestProposal) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/proposals/${latestProposal.id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Erro ao gerar PDF');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      alert('Não foi possível gerar o PDF da proposta.');
    }
  };

  const handleShare = () => {
    if (!latestProposal) return;
    if (latestProposal.publicToken) {
      const link = `${process.env.NEXT_PUBLIC_API_URL}/proposals/public/${latestProposal.publicToken}/pdf`;
      navigator.clipboard.writeText(link);
      alert('Link direto do PDF copiado com sucesso!');
    } else {
      alert('Proposta não possui token público para compartilhamento.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {proposals.length > 0 ? (
        <>
          <div style={{ padding: 20, background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Última Proposta</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>Versão atual · {latestProposal.stage || 'proposal_sent'}</p>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <IconButton onClick={handleView} icon={<EyeIcon style={{ width: 14, height: 14 }} />} label="Visualizar" />
                <IconButton onClick={handlePdf} icon={<ArrowDownTrayIcon style={{ width: 14, height: 14 }} />} label="PDF" />
                <IconButton onClick={handleShare} icon={<ShareIcon style={{ width: 14, height: 14 }} />} label="Compartilhar" />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
              {formatBRL(Number(latestProposal.finalPrice))}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
              <span>{latestProposal.systemPowerKwp?.toFixed(2)} kWp</span>
              <span>{latestProposal.moduleQty} módulos</span>
              {latestProposal.paybackYears && <span>{latestProposal.paybackYears} anos payback</span>}
            </div>
          </div>

          {proposals.slice(0, -1).reverse().map((p: any) => (
            <div key={p.id} style={{ padding: '12px 16px', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Versão anterior</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{formatBRL(Number(p.finalPrice))}</span>
            </div>
          ))}
        </>
      ) : (
        <div style={{ padding: '48px 24px', textAlign: 'center', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
          <DocumentTextIcon style={{ width: 40, height: 40, color: 'var(--text-muted)', opacity: 0.25, margin: '0 auto 16px' }} />
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>Nenhuma proposta gerada</p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>Complete as etapas anteriores e gere a primeira proposta.</p>
        </div>
      )}
    </div>
  );
}

function IconButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.borderColor = 'var(--text-muted)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      {icon}
      {label}
    </button>
  );
}
