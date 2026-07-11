'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon } from '@heroicons/react/24/outline';
import { PageHeader } from '../../../../components/compositions/PageHeader';
import { PipelineColumn } from '../../../../components/compositions/PipelineColumn';
import { DataGrid } from '../../../../components/compositions/DataGrid';
import { Button } from '../../../../components/ui/Button';
import { Chip } from '../../../../components/ui/Chip';
import { Text } from '../../../../components/primitives/Text';
import { Flex } from '../../../../components/primitives/Flex';

const STAGES = [
  { key: 'new', label: 'Novo Lead', color: '#0ea5e9' },
  { key: 'contacted', label: 'Contato', color: '#3b82f6' },
  { key: 'qualified', label: 'Qualificação', color: '#6366f1' },
  { key: 'bill_received', label: 'Conta Recebida', color: '#8b5cf6' },
  { key: 'sized', label: 'Dimensionamento', color: '#a855f7' },
  { key: 'proposal_sent', label: 'Proposta Enviada', color: '#ec4899' },
  { key: 'negotiation', label: 'Negociação', color: '#f59e0b' },
  { key: 'closed_won', label: 'Fechado', color: '#22c55e' },
  { key: 'closed_lost', label: 'Perdido', color: '#9ca3af' },
];

const STAGE_LABELS: Record<string, string> = {
  new: 'Novo Lead', contacted: 'Contato', qualified: 'Qualificação',
  bill_received: 'Conta Recebida', sized: 'Dimensionamento',
  proposal_sent: 'Proposta Enviada', negotiation: 'Negociação',
  closed_won: 'Fechado', closed_lost: 'Perdido',
};

const CLIENT_TYPE_LABELS: Record<string, string> = {
  residential: 'Residencial', commercial: 'Comercial',
  industrial: 'Industrial', rural: 'Rural',
};

const stageColor = (key: string) => STAGES.find(s => s.key === key)?.color || '#9ca3af';

export default function LeadsKanban() {
  const router = useRouter();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');

  const fetchLeads = async () => {
    const token = localStorage.getItem('token');
    const api = process.env.NEXT_PUBLIC_API_URL;
    try {
      const res = await fetch(`${api}/leads`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setLeads(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLeads(); }, []);

  const handleStageChange = async (leadId: string, stage: string) => {
    const token = localStorage.getItem('token');
    const api = process.env.NEXT_PUBLIC_API_URL;
    await fetch(`${api}/leads/${leadId}/stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ stage }),
    });
    fetchLeads();
  };

  if (loading) {
    return <div style={{ padding: '32px', color: 'var(--text-secondary)' }}>Carregando...</div>;
  }

  const listColumns = [
    { key: 'name' as const, label: 'Nome', render: (lead: any) => <span style={{ fontWeight: 600 }}>{lead.name}</span> },
    { key: 'email' as const, label: 'Contato' },
    {
      key: 'stage' as const, label: 'Etapa',
      render: (lead: any) => (
        <Chip variant="status" dot={stageColor(lead.stage)}>
          {STAGE_LABELS[lead.stage] || lead.stage}
        </Chip>
      ),
    },
    {
      key: 'value' as const, label: 'Valor',
      render: (lead: any) => lead.value
        ? <span style={{ fontWeight: 600 }}>R$ {Number(lead.value).toLocaleString('pt-BR')}</span>
        : <span style={{ color: 'var(--text-muted)' }}>—</span>,
    },
    {
      key: 'clientType' as const, label: 'Tipo',
      render: (lead: any) => CLIENT_TYPE_LABELS[lead.clientType] || lead.clientType || '—',
    },
    {
      key: 'createdAt' as const, label: 'Data',
      render: (lead: any) => new Date(lead.createdAt).toLocaleDateString('pt-BR'),
    },
  ];

  return (
    <div style={{ width: '100%' }}>
      <PageHeader
        title="Leads"
        subtitle="Gerencie seu pipeline comercial"
        actions={
          <Flex gap={3} align="center">
            <div style={{ display: 'flex', background: 'var(--surface-muted)', borderRadius: 'var(--radius-md)', padding: '2px' }}>
              <button onClick={() => setView('kanban')} style={{
                padding: '6px 14px', borderRadius: 'var(--radius-sm)', border: 'none',
                background: view === 'kanban' ? 'white' : 'transparent',
                fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                color: view === 'kanban' ? 'var(--text)' : 'var(--text-muted)',
                boxShadow: view === 'kanban' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.12s',
              }}>
                Kanban
              </button>
              <button onClick={() => setView('list')} style={{
                padding: '6px 14px', borderRadius: 'var(--radius-sm)', border: 'none',
                background: view === 'list' ? 'white' : 'transparent',
                fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                color: view === 'list' ? 'var(--text)' : 'var(--text-muted)',
                boxShadow: view === 'list' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.12s',
              }}>
                Lista
              </button>
            </div>
            <Button variant="primary" size="sm" icon={<PlusIcon className="w-4 h-4" />} onClick={() => router.push('/crm/leads/new')}>
              Novo Lead
            </Button>
          </Flex>
        }
      />

      {view === 'kanban' ? (
        <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '8px', minHeight: '65vh' }}>
          {STAGES.map(stage => {
            const stageLeads = leads.filter(l => l.stage === stage.key);
            return (
              <PipelineColumn
                key={stage.key}
                label={stage.label}
                count={stageLeads.length}
                color={stage.color}
                empty={stageLeads.length === 0}
              >
                {stageLeads.map(lead => (
                  <div
                    key={lead.id}
                    onClick={() => router.push(`/crm/leads/${lead.id}`)}
                    style={{
                      background: 'var(--surface)',
                      borderRadius: 'var(--radius-lg)', padding: '14px 16px',
                      border: '1px solid var(--border)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: 'var(--shadow-xs)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-xs)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    <Text variant="body-bold" style={{ fontSize: '13px', marginBottom: '4px' }}>{lead.name}</Text>
                    <Text variant="sm" color="secondary">{lead.city} - {lead.state}</Text>
                    <Flex gap={2} wrap style={{ marginTop: '8px' }}>
                      <Chip variant="client">
                        {CLIENT_TYPE_LABELS[lead.clientType] || lead.clientType || 'Residencial'}
                      </Chip>
                      {lead.value && (
                        <Chip variant="margin">
                          R$ {Number(lead.value).toLocaleString('pt-BR')}
                        </Chip>
                      )}
                    </Flex>
                  </div>
                ))}
              </PipelineColumn>
            );
          })}
        </div>
      ) : (
        <DataGrid
          columns={listColumns}
          data={leads}
          keyExtractor={lead => lead.id}
          emptyMessage="Nenhum lead encontrado."
          onRowClick={lead => router.push(`/crm/leads/${lead.id}`)}
        />
      )}
    </div>
  );
}
