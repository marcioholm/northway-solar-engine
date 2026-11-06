'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '../../../components/compositions/PageHeader';
import { KPIGrid } from '../../../components/compositions/KPIGrid';
import { MetricCard } from '../../../components/compositions/MetricCard';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Button } from '../../../components/ui/Button';
import { api } from '../../../lib/api';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<{ leads: number; projects: number; proposals: number } | null>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);

        const [leadsRes, projectsRes, proposalsRes] = await Promise.all([
          api.get<any>('/leads').catch(() => null),
          api.get<any>('/solar-project').catch(() => null),
          api.get<any>('/proposals').catch(() => null),
        ]);

        if (!active) return;

        const leadsCount = Array.isArray(leadsRes)
          ? leadsRes.length
          : typeof leadsRes?.total === 'number'
          ? leadsRes.total
          : 0;

        const projectsCount = typeof projectsRes?.total === 'number'
          ? projectsRes.total
          : Array.isArray(projectsRes?.data)
          ? projectsRes.data.length
          : Array.isArray(projectsRes)
          ? projectsRes.length
          : 0;

        const proposalsCount = typeof proposalsRes?.total === 'number'
          ? proposalsRes.total
          : Array.isArray(proposalsRes?.data)
          ? proposalsRes.data.length
          : Array.isArray(proposalsRes)
          ? proposalsRes.length
          : 0;

        setCounts({
          leads: leadsCount,
          projects: projectsCount,
          proposals: proposalsCount,
        });
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const hasData = counts !== null && (counts.leads > 0 || counts.projects > 0 || counts.proposals > 0);

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
      ) : !hasData ? (
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
        <KPIGrid minWidth="280px">
          <MetricCard
            label="LEADS CADASTRADOS"
            value={String(counts.leads)}
            icon="👥"
          />
          <MetricCard
            label="PROJETOS SOLARES"
            value={String(counts.projects)}
            icon="⚡"
          />
          <MetricCard
            label="PROPOSTAS COMERCIAIS"
            value={String(counts.proposals)}
            icon="📄"
          />
        </KPIGrid>
      )}
    </div>
  );
}
