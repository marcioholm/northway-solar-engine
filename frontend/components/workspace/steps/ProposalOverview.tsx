'use client';

import { useEffect, useState } from 'react';
import { DocumentTextIcon, EyeIcon, ArrowDownTrayIcon, ShareIcon, ChartBarIcon, ClockIcon, PencilSquareIcon, DocumentDuplicateIcon, ScaleIcon } from '@heroicons/react/24/outline';
import { formatBRL } from '../../../lib/format';
import { api } from '../../../lib/api';

export function ProposalOverview({ project, onUpdate, onStepChange }: { project: any; onUpdate: (p: any) => void; onStepChange?: (step: string) => void }) {
  const proposals = project.proposals || [];
  const latestProposal = proposals[proposals.length - 1];
  
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

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
  
  const handleEditLatest = () => {
    if (onStepChange) onStepChange('pricing');
  };

  const handleClone = async (p: any) => {
    if (!confirm('Deseja carregar os valores desta proposta para edição? Isso vai sobrescrever o rascunho atual.')) return;
    try {
      const updated = {
        sizingPowerKwp: p.systemPowerKwp,
        sizingModuleQty: p.moduleQty,
        pricingEquipmentCost: p.costModules,
        pricingLaborCost: p.costLabor,
        pricingTravelCost: p.costTravel,
        pricingMarginPct: p.marginPct,
        pricingFinalPrice: p.finalPrice,
      };
      await api.patch(`/solar-project/${project.id}`, updated);
      onUpdate({ ...project, ...updated });
      if (onStepChange) onStepChange('pricing');
    } catch (err) {
      alert('Erro ao clonar proposta.');
    }
  };
  
  const toggleCompare = (id: string) => {
    setSelectedForCompare(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 2) {
        alert('Selecione no máximo 2 propostas para comparar lado a lado.');
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleCompare = () => {
    if (selectedForCompare.length !== 2) {
      alert('Selecione exatamente 2 propostas para comparar.');
      return;
    }
    const p1 = proposals.find((p: any) => p.id === selectedForCompare[0]);
    const p2 = proposals.find((p: any) => p.id === selectedForCompare[1]);
    if (p1?.publicToken && p2?.publicToken) {
      window.open(`/proposta/compare?token1=${p1.publicToken}&token2=${p2.publicToken}`, '_blank');
    } else {
      alert('Uma das propostas selecionadas não possui link público válido.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {proposals.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
          <button 
            onClick={handleCompare}
            disabled={selectedForCompare.length < 2}
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', 
              borderRadius: 'var(--radius-md)', border: 'none', 
              background: selectedForCompare.length === 2 ? 'var(--green)' : 'var(--surface-hover)', 
              color: selectedForCompare.length === 2 ? '#fff' : 'var(--text-muted)', 
              fontSize: 13, fontWeight: 600, cursor: selectedForCompare.length === 2 ? 'pointer' : 'not-allowed'
            }}
          >
            <ScaleIcon style={{ width: 16, height: 16 }} />
            Gerar Link Comparativo
          </button>
        </div>
      )}
      
      {proposals.length > 0 ? (
        <>
          <div style={{ padding: 20, background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 20, left: -12 }}>
              <input 
                type="checkbox" 
                checked={selectedForCompare.includes(latestProposal.id)}
                onChange={() => toggleCompare(latestProposal.id)}
                style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--green)' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingLeft: 12 }}>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Última Proposta</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>Versão atual · {latestProposal.stage || 'proposal_sent'}</p>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <IconButton onClick={handleEditLatest} icon={<PencilSquareIcon style={{ width: 14, height: 14 }} />} label="Ajustar Valores" />
                <IconButton onClick={handleView} icon={<EyeIcon style={{ width: 14, height: 14 }} />} label="Visualizar" />
                <IconButton onClick={handlePdf} icon={<ArrowDownTrayIcon style={{ width: 14, height: 14 }} />} label="PDF" />
                <IconButton onClick={handleShare} icon={<ShareIcon style={{ width: 14, height: 14 }} />} label="Compartilhar" />
              </div>
            </div>
            <div style={{ paddingLeft: 12 }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                {formatBRL(Number(latestProposal.finalPrice))}
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                <span>{latestProposal.systemPowerKwp?.toFixed(2)} kWp</span>
                <span>{latestProposal.moduleQty} módulos</span>
                {latestProposal.paybackYears && <span>{latestProposal.paybackYears} anos payback</span>}
              </div>
              <AnalyticsPanel proposalId={latestProposal.id} />
            </div>
          </div>

          {proposals.slice(0, -1).reverse().map((p: any, idx: number) => (
            <div key={p.id} style={{ padding: '12px 16px', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', left: -12 }}>
                <input 
                  type="checkbox" 
                  checked={selectedForCompare.includes(p.id)}
                  onChange={() => toggleCompare(p.id)}
                  style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--green)' }}
                />
              </div>
              <div style={{ paddingLeft: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block' }}>V{proposals.length - 1 - idx} • {new Date(p.createdAt).toLocaleDateString()}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{formatBRL(Number(p.finalPrice))}</span>
              </div>
              <div>
                <IconButton onClick={() => handleClone(p)} icon={<DocumentDuplicateIcon style={{ width: 14, height: 14 }} />} label="Clonar" />
              </div>
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

function AnalyticsPanel({ proposalId }: { proposalId: string }) {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/proposals/${proposalId}/events`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(data => setEvents(data || []))
    .catch(() => {});
  }, [proposalId]);

  if (!events.length) return null;

  const opens = events.filter(e => e.eventType === 'OPEN').length;
  const pricingViews = events.filter(e => e.eventType === 'VIEW_PRICING');
  
  // Sort events by date descending to find the last open
  const sortedEvents = [...events].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const lastOpen = sortedEvents.find(e => e.eventType === 'OPEN');
  
  const lastOpenDate = lastOpen ? new Date(lastOpen.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';
  const totalPricingTime = pricingViews.reduce((acc, curr) => acc + (curr.durationSeconds || 0), 0);

  return (
    <div style={{ marginTop: 16, padding: 12, background: 'rgba(5, 150, 105, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(5, 150, 105, 0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: 'var(--green)', fontWeight: 600, fontSize: 12 }}>
        <ChartBarIcon style={{ width: 14, height: 14 }} />
        Rastreamento de Visualização (Beta)
      </div>
      <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <EyeIcon style={{ width: 12, height: 12 }} /> Aberto {opens}x
        </div>
        {lastOpenDate && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <ClockIcon style={{ width: 12, height: 12 }} /> Último: {lastOpenDate}
          </div>
        )}
        {totalPricingTime > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <ClockIcon style={{ width: 12, height: 12 }} /> Tempo no Preço: {totalPricingTime}s
          </div>
        )}
      </div>
    </div>
  );
}
