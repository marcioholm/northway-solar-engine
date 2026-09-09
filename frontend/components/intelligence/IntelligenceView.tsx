'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Flex } from '@/components/primitives/Flex';
import { Text } from '@/components/primitives/Text';

export function IntelligenceView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/intelligence/dashboard');
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Carregando painéis de inteligência...</div>;
  if (!data) return <div>Erro ao carregar dados.</div>;

  return (
    <div style={{ display: 'grid', gap: '32px', gridTemplateColumns: '1fr 1fr' }}>
      
      {/* VIEW 1: Funil */}
      <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--line)' }}>
        <Text variant="body-bold">Funil de Conversão</Text>
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {data.funnel?.map((stage: any, i: number) => {
            const max = Math.max(...data.funnel.map((s: any) => s.count));
            const pct = max > 0 ? (stage.count / max) * 100 : 0;
            return (
              <div key={i}>
                <Flex justify="between" style={{ marginBottom: '8px' }}>
                  <Text variant="sm">{stage.name}</Text>
                  <Text variant="body-bold">{stage.count}</Text>
                </Flex>
                <div style={{ height: '8px', background: 'var(--surface-muted)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'var(--green)' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* VIEW 5: Forecast */}
      <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--line)' }}>
        <Text variant="body-bold">Previsão de Receita (Forecast)</Text>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '24px' }}>
          <div style={{ padding: '16px', background: 'var(--surface-muted)', borderRadius: '8px', textAlign: 'center' }}>
            <Text variant="sm" style={{ color: 'var(--text-secondary)' }}>Próximos 30 dias</Text>
            <Text variant="h2" style={{ marginTop: '8px' }}>R$ {(data.forecast?.next30 || 0).toLocaleString('pt-BR')}</Text>
          </div>
          <div style={{ padding: '16px', background: 'var(--surface-muted)', borderRadius: '8px', textAlign: 'center' }}>
            <Text variant="sm" style={{ color: 'var(--text-secondary)' }}>Próximos 60 dias</Text>
            <Text variant="h2" style={{ marginTop: '8px' }}>R$ {(data.forecast?.next60 || 0).toLocaleString('pt-BR')}</Text>
          </div>
          <div style={{ padding: '16px', background: 'var(--surface-muted)', borderRadius: '8px', textAlign: 'center' }}>
            <Text variant="sm" style={{ color: 'var(--text-secondary)' }}>Próximos 90 dias</Text>
            <Text variant="h2" style={{ marginTop: '8px' }}>R$ {(data.forecast?.next90 || 0).toLocaleString('pt-BR')}</Text>
          </div>
        </div>
      </div>

      {/* VIEW 2: ROI */}
      <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--line)', gridColumn: '1 / -1' }}>
        <Text variant="body-bold">ROI por Campanha</Text>
        <table style={{ width: '100%', marginTop: '24px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)', textAlign: 'left' }}>
              <th style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Campanha</th>
              <th style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Leads</th>
              <th style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Propostas</th>
              <th style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Vendas</th>
              <th style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Receita</th>
              <th style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>CPA</th>
            </tr>
          </thead>
          <tbody>
            {data.roi?.map((r: any, i: number) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--line)' }}>
                <td style={{ padding: '12px 8px' }}>{r.campaign}</td>
                <td style={{ padding: '12px 8px' }}>{r.leads}</td>
                <td style={{ padding: '12px 8px' }}>{r.proposals}</td>
                <td style={{ padding: '12px 8px' }}>{r.sales}</td>
                <td style={{ padding: '12px 8px' }}>R$ {Number(r.revenue).toLocaleString('pt-BR')}</td>
                <td style={{ padding: '12px 8px' }}>R$ {r.cpa}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
