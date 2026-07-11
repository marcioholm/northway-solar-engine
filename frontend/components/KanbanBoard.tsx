'use client';

import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

interface Lead {
  id: string;
  name: string;
  clientType?: string;
  city?: string;
  state?: string;
  consumptionKwh?: number;
  systemPowerKwp?: number;
  value?: number;
  profit?: number;
  margin?: number;
  stage: string;
}

interface StageConfig {
  key: string;
  label: string;
}

interface KanbanBoardProps {
  stages: StageConfig[];
  leads: Lead[];
  onStageChange?: (leadId: string, stage: string) => void;
  renderCard?: (lead: Lead) => ReactNode;
  renderMore?: (stage: StageConfig, remaining: number) => ReactNode;
}

const CLIENT_TYPE_LABELS: Record<string, string> = {
  residential: 'Residencial', commercial: 'Comercial',
  industrial: 'Industrial', rural: 'Rural',
};

function LeadCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'white',
        borderRadius: 'var(--radius-sm)',
        padding: '14px 16px',
        border: '1px solid var(--line)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        boxShadow: 'var(--shadow-sm)',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.borderColor = '#c8d0c4'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--line)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <strong style={{ fontSize: '13px', fontWeight: 700, flex: 1 }}>{lead.name}</strong>
        <span style={{
          fontSize: '10px', fontWeight: 700, color: '#59625d',
          background: '#f0f5eb', padding: '1px 6px', borderRadius: '4px',
          fontStyle: 'italic',
        }}>
          {lead.name.split(' ').pop()?.substring(0, 2).toUpperCase() || 'NA'}
        </span>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
        {CLIENT_TYPE_LABELS[lead.clientType || ''] || 'Residencial'} • {lead.city || 'N/D'}
      </p>
      <div style={{ display: 'flex', gap: '12px', marginTop: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        {lead.consumptionKwh && (
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            R$ {Number(lead.consumptionKwh).toLocaleString('pt-BR')}/mês
          </span>
        )}
        {lead.systemPowerKwp && (
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {lead.systemPowerKwp} kWp
          </span>
        )}
        {lead.profit !== undefined && (
          <span style={{
            fontSize: '10px', fontWeight: 700,
            padding: '2px 8px', borderRadius: '6px',
            background: lead.profit > 0 ? '#f0fdf4' : '#fef2f2',
            color: lead.profit > 0 ? '#15803d' : '#dc2626',
          }}>
            {lead.profit > 0 ? 'Lucro R$' : 'Prejuízo R$'} {Math.abs(lead.profit).toLocaleString('pt-BR')}
          </span>
        )}
        {lead.margin !== undefined && (
          <span style={{
            fontSize: '10px', fontWeight: 700,
            padding: '2px 8px', borderRadius: '6px',
            background: lead.margin > 20 ? '#f0fdf4' : lead.margin > 10 ? '#fefce8' : '#fef2f2',
            color: lead.margin > 20 ? '#15803d' : lead.margin > 10 ? '#a16207' : '#dc2626',
          }}>
            Margem {lead.margin}%
          </span>
        )}
      </div>
    </div>
  );
}

export default function KanbanBoard({ stages, leads, renderCard, renderMore, onStageChange }: KanbanBoardProps) {
  const router = useRouter();

  return (
    <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', minHeight: '60vh' }}>
      {stages.map(stage => {
        const stageLeads = leads.filter(l => l.stage === stage.key);
        const displayLeads = stageLeads.slice(0, 2);
        const remaining = stageLeads.length - displayLeads.length;

        return (
          <div key={stage.key} style={{
            flexShrink: 0,
            width: '280px',
            background: 'rgba(255,255,255,0.85)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--line)',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 18px',
              borderBottom: '1px solid var(--line)',
            }}>
              <div style={{
                width: '10px', height: '10px',
                borderRadius: '50%',
                background: stage.key === 'closed_won' ? '#15803d'
                  : stage.key === 'closed_lost' ? '#9ca3af'
                  : stage.key === 'negotiation' ? '#d97706'
                  : stage.key === 'proposal_sent' ? '#ec4899'
                  : stage.key === 'sized' ? '#a855f7'
                  : stage.key === 'qualified' ? '#6366f1'
                  : stage.key === 'contacted' ? '#3b82f6'
                  : '#0ea5e9',
              }} />
              <h3 style={{ fontSize: '13px', fontWeight: 700, flex: 1 }}>{stage.label}</h3>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                {stageLeads.length} leads
              </span>
            </div>
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '65vh' }}>
              {displayLeads.map(lead => (
                renderCard ? renderCard(lead) : (
                  <LeadCard key={lead.id} lead={lead} onClick={() => router.push(`/crm/leads/${lead.id}`)} />
                )
              ))}
              {remaining > 0 && (renderMore ? renderMore(stage, remaining) : (
                <button
                  onClick={() => router.push(`/crm/leads?stage=${stage.key}`)}
                  style={{
                    background: 'none',
                    border: '1px dashed var(--line)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f5f7f3'; e.currentTarget.style.color = 'var(--text)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  + {remaining} {remaining === 1 ? 'lead' : 'leads'}
                </button>
              ))}
              {stageLeads.length === 0 && (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                  Nenhum lead
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
