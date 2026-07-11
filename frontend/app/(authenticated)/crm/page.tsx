'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MetricCard } from '../../../components/compositions/MetricCard';
import { KPIGrid } from '../../../components/compositions/KPIGrid';
import { PipelineColumn } from '../../../components/compositions/PipelineColumn';
import { Timeline } from '../../../components/compositions/Timeline';
import { DonutChart } from '../../../components/charts/DonutChart';
import { FunnelChart } from '../../../components/charts/FunnelChart';
import { LineChart } from '../../../components/charts/LineChart';
import { Text } from '../../../components/primitives/Text';
import { Flex } from '../../../components/primitives/Flex';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import GoalRing from '../../../components/GoalRing';
import SellerRanking from '../../../components/SellerRanking';

export default function CrmDashboard() {
  const [data, setData] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const api = process.env.NEXT_PUBLIC_API_URL;

    Promise.all([
      fetch(`${api}/crm-dashboard`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${api}/crm-dashboard/sources`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([dash, src]) => {
      setData(dash);
      setSources(src);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
        Carregando...
      </div>
    );
  }
  if (!data) return null;

  const totalSources = sources.reduce((s: number, x: any) => s + x.count, 0) || 120;

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* Hero: KPIs + Goal */}
      <Card padding="lg" style={{ marginBottom: '24px' }}>
        <Flex align="center" justify="between" style={{ marginBottom: '20px' }}>
          <div>
            <Text variant="xxs" color="accent">Visão geral</Text>
            <Text variant="h2" style={{ marginTop: '2px' }}>Bom dia! 👋</Text>
            <Text variant="body" color="secondary" style={{ marginTop: '2px' }}>
              Aqui está o resumo das suas vendas e operações de hoje.
            </Text>
          </div>
          <Button variant="secondary" size="sm">Personalizar ☷</Button>
        </Flex>
        <KPIGrid minWidth="180px">
          <MetricCard label="Novos leads" value="24" icon="◎" trend={{ value: '18%', direction: 'up', label: 'vs. ontem' }} />
          <MetricCard label="Propostas enviadas" value="12" icon="▤" trend={{ value: '8%', direction: 'up', label: 'vs. ontem' }} />
          <MetricCard label="Vendas fechadas" value="5" icon="★" trend={{ value: '25%', direction: 'up', label: 'vs. ontem' }} />
          <MetricCard label="Faturamento previsto" value="R$ 128.450" icon="$" trend={{ value: '32%', direction: 'up', label: 'vs. ontem' }} />
          <GoalRing percentage={68} current="R$ 128.450" total="R$ 190.000" label="Meta do mês" daysLeft="24 dias restantes" />
        </KPIGrid>
      </Card>

      {/* Pipeline + Right Column */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', marginBottom: '24px' }}>
        {/* Pipeline Card */}
        <Card padding="md" style={{ boxShadow: 'var(--shadow-md)' }}>
          <Flex align="center" justify="between" style={{ marginBottom: '16px' }}>
            <div>
              <Text variant="xxs" color="accent">Pipeline de vendas</Text>
              <Text variant="h3" style={{ marginTop: '2px' }}>
                Oportunidades em andamento{' '}
                <Text variant="xs" color="muted" as="span">9 etapas</Text>
              </Text>
            </div>
            <Flex gap={2} align="center">
              <div style={{ display: 'flex', background: 'var(--surface-muted)', borderRadius: 'var(--radius-md)', padding: '2px' }}>
                <Button variant="secondary" size="sm" style={{ background: 'white', boxShadow: 'var(--shadow-sm)' }}>Kanban</Button>
                <Button variant="ghost" size="sm">Lista</Button>
              </div>
              <Button variant="primary" size="sm" icon={<span>+</span>}>Novo lead</Button>
            </Flex>
          </Flex>

          <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '8px' }}>
            <PipelineColumn label="Novo lead" count={32} pipelineValue="R$ 89K" color="#0ea5e9">
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
                Preview rápido —{' '}
                <a href="/crm/leads" style={{ color: 'var(--green-dark)', fontWeight: 600 }}>ver Kanban completo</a>
              </div>
            </PipelineColumn>
            <PipelineColumn label="Contato" count={18} pipelineValue="R$ 54K" color="#3b82f6" empty />
            <PipelineColumn label="Qualificação" count={14} pipelineValue="R$ 41K" color="#6366f1" empty />
            <PipelineColumn label="Dimensionamento" count={9} pipelineValue="R$ 38K" color="#a855f7" empty />
            <PipelineColumn label="Proposta enviada" count={7} pipelineValue="R$ 32K" color="#ec4899" empty />
          </div>
        </Card>

        {/* Right Column */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Card padding="sm">
            <Flex align="center" justify="between" style={{ marginBottom: '14px' }}>
              <div>
                <Text variant="xxs" color="accent">Atividades de hoje</Text>
                <Text variant="h4" style={{ marginTop: '2px' }}>Próximos compromissos</Text>
              </div>
              <Button variant="ghost" size="sm">Ver tudo</Button>
            </Flex>
            <Timeline
              events={[
                { time: '09:00', icon: '☎', title: 'Ligação com João Silva', subtitle: 'Novo lead', color: '#0ea5e9' },
                { time: '10:30', icon: '●', title: 'Visita técnica', subtitle: 'Lucas Martins', color: '#6366f1' },
                { time: '14:00', icon: '▤', title: 'Proposta enviada', subtitle: 'Ricardo Souza', color: '#ec4899' },
                { time: '16:00', icon: '◉', title: 'Reunião online', subtitle: 'Carla Mendes', color: '#d97706' },
              ]}
            />
          </Card>

          <Card padding="sm">
            <Flex align="center" justify="between" style={{ marginBottom: '10px' }}>
              <div>
                <Text variant="xxs" color="accent">Leads por origem</Text>
                <Text variant="h4" style={{ marginTop: '2px' }}>Aquisição no mês</Text>
              </div>
              <select style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '4px 8px', fontSize: '12px', background: 'var(--surface)', color: 'var(--text)' }}>
                <option>Este mês</option>
              </select>
            </Flex>
            <DonutChart
              total={totalSources}
              centerLabel="Leads"
              segments={sources.length > 0 ? sources.map((s: any) => ({
                label: s.source,
                value: s.count,
                percentage: s.percentage || Math.round((s.count / totalSources) * 100),
                color: s.color || '',
              })) : []}
            />
          </Card>
        </aside>
      </div>

      {/* Insights Grid — auto-fill responsivo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        <Card padding="sm">
          <Text variant="xxs" color="accent">Funil de conversão</Text>
          <Text variant="h4" style={{ margin: '4px 0 12px' }}>Eficiência comercial</Text>
          <FunnelChart stages={[
            { label: 'Leads', count: 120 }, { label: 'Propostas', count: 45 },
            { label: 'Negociações', count: 18 }, { label: 'Fechados', count: 10 },
          ]} />
        </Card>

        <Card padding="sm">
          <Text variant="xxs" color="accent">Propostas x vendas</Text>
          <Text variant="h4" style={{ margin: '4px 0 12px' }}>Evolução mensal</Text>
          <LineChart series={[
            { label: 'Propostas', data: [22, 28, 24, 32, 30, 38, 35, 42, 40, 48, 45, 52], color: '#8fd63a' },
            { label: 'Vendas', data: [8, 10, 9, 14, 12, 16, 14, 18, 17, 22, 20, 25], color: '#6db522', dashed: true },
          ]} />
        </Card>

        <Card padding="sm">
          <Text variant="xxs" color="accent">Ticket médio</Text>
          <Text variant="h4" style={{ margin: '4px 0 12px' }}>Valor por venda</Text>
          <Text variant="h1" style={{ fontSize: '32px' }}>R$ 28.450</Text>
          <Flex gap={1} align="center" style={{ marginTop: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#15803d' }}>↑ 12%</span>
            <Text variant="xs" color="muted">vs. mês passado</Text>
          </Flex>
          <div style={{ marginTop: '12px', height: '40px', background: 'linear-gradient(90deg, var(--green-light), var(--green), var(--green-dark))', borderRadius: 'var(--radius-md)', opacity: 0.5 }} />
        </Card>

        <Card padding="sm">
          <Text variant="xxs" color="accent">Ranking de vendedores</Text>
          <Text variant="h4" style={{ margin: '4px 0 12px' }}>Desempenho no mês</Text>
          <SellerRanking
            sellers={data.topSellers?.map((s: any) => ({
              ...s, name: s.userId,
              initials: s.userId?.substring(0, 2).toUpperCase() || 'NA',
              value: Number(s.won || 0) * 2850,
            })) || [
              { userId: 'AR', initials: 'AR', name: 'Ana Rodrigues', won: 24, total: 32, value: 68450 },
              { userId: 'LS', initials: 'LS', name: 'Lucas Silva', won: 18, total: 25, value: 52300 },
              { userId: 'JB', initials: 'JB', name: 'João Barbosa', won: 15, total: 22, value: 41800 },
            ]}
          />
        </Card>
      </div>
    </div>
  );
}
