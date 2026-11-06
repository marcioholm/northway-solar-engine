'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '../../../components/compositions/PageHeader';
import { KPIGrid } from '../../../components/compositions/KPIGrid';
import { MetricCard } from '../../../components/compositions/MetricCard';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Button } from '../../../components/ui/Button';
import { api } from '../../../lib/api';

interface MetricState {
  value: number | null;
  error: boolean;
}

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<MetricState>({ value: null, error: false });
  const [projects, setProjects] = useState<MetricState>({ value: null, error: false });
  const [proposals, setProposals] = useState<MetricState>({ value: null, error: false });

  const loadData = useCallback(async () => {
    setLoading(true);

    const [leadsRes, projectsRes, proposalsRes] = await Promise.allSettled([
      api.get<any>('/leads'),
      api.get<any>('/solar-project'),
      api.get<any>('/proposals'),
    ]);

    // Leads
    if (leadsRes.status === 'fulfilled') {
      const data = leadsRes.value;
      const count = Array.isArray(data)
        ? data.length
        : typeof data?.total === 'number'
        ? data.total
        : 0;
      setLeads({ value: count, error: false });
    } else {
      setLeads({ value: null, error: true });
    }

    // Projects
    if (projectsRes.status === 'fulfilled') {
      const data = projectsRes.value;
      const count = typeof data?.total === 'number'
        ? data.total
        : Array.isArray(data?.data)
        ? data.data.length
        : Array.isArray(data)
        ? data.length
        : 0;
      setProjects({ value: count, error: false });
    } else {
      setProjects({ value: null, error: true });
    }

    // Proposals
    if (proposalsRes.status === 'fulfilled') {
      const data = proposalsRes.value;
      const count = typeof data?.total === 'number'
        ? data.total
        : Array.isArray(data?.data)
        ? data.data.length
        : Array.isArray(data)
        ? data.length
        : 0;
      setProposals({ value: count, error: false });
    } else {
      setProposals({ value: null, error: true });
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const hasAnyError = leads.error || projects.error || proposals.error;
  const allFailed = leads.error && projects.error && proposals.error;
  const hasData = (leads.value ?? 0) > 0 || (projects.value ?? 0) > 0 || (proposals.value ?? 0) > 0;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral e métricas operacionais."
        actions={
          <>
            <Button variant="secondary" onClick={() => router.push('/crm/leads/new')}>
              Novo Lead
            </Button>
            <Button variant="primary" onClick={() => router.push('/solar-project/new')}>
              Novo Projeto
            </Button>
          </>
        }
      />

      {loading ? (
        <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Carregando indicadores...
        </div>
      ) : allFailed ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '48px 24px',
            gap: '12px',
            background: 'var(--surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          <span style={{ fontSize: '36px', color: '#ef4444', lineHeight: 1 }}>⚠</span>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            Falha ao carregar indicadores
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, maxWidth: '320px' }}>
            Não foi possível carregar as métricas operacionais. Verifique sua conexão e tente novamente.
          </p>
          <Button variant="primary" size="sm" onClick={() => loadData()} style={{ marginTop: '8px' }}>
            Tentar novamente
          </Button>
        </div>
      ) : !hasAnyError && !hasData ? (
        <EmptyState
          icon="◎"
          title="Nenhum dado encontrado"
          description="Você ainda não possui leads, projetos ou propostas cadastrados."
          action={{
            label: 'Novo Lead',
            onClick: () => router.push('/crm/leads/new'),
          }}
        />
      ) : (
        <>
          {hasAnyError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                marginBottom: '20px',
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                fontSize: '14px',
              }}
            >
              <span>Houve falha ao carregar uma ou mais métricas do painel.</span>
              <Button variant="secondary" size="sm" onClick={() => loadData()}>
                Tentar novamente
              </Button>
            </div>
          )}

          <KPIGrid minWidth="280px">
            <MetricCard
              label="LEADS CADASTRADOS"
              value={leads.error ? '—' : String(leads.value ?? 0)}
              icon="👥"
            >
              {leads.error && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#dc2626' }}>Falha ao carregar</span>
                  <button
                    onClick={() => loadData()}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-primary, #10b981)',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600,
                      textDecoration: 'underline',
                      padding: 0,
                    }}
                  >
                    Tentar novamente
                  </button>
                </div>
              )}
            </MetricCard>

            <MetricCard
              label="PROJETOS SOLARES"
              value={projects.error ? '—' : String(projects.value ?? 0)}
              icon="⚡"
            >
              {projects.error && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#dc2626' }}>Falha ao carregar</span>
                  <button
                    onClick={() => loadData()}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-primary, #10b981)',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600,
                      textDecoration: 'underline',
                      padding: 0,
                    }}
                  >
                    Tentar novamente
                  </button>
                </div>
              )}
            </MetricCard>

            <MetricCard
              label="PROPOSTAS COMERCIAIS"
              value={proposals.error ? '—' : String(proposals.value ?? 0)}
              icon="📄"
            >
              {proposals.error && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#dc2626' }}>Falha ao carregar</span>
                  <button
                    onClick={() => loadData()}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-primary, #10b981)',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600,
                      textDecoration: 'underline',
                      padding: 0,
                    }}
                  >
                    Tentar novamente
                  </button>
                </div>
              )}
            </MetricCard>
          </KPIGrid>
        </>
      )}
    </div>
  );
}
