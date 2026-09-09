'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Flex } from '@/components/ui/Flex';
import { Text } from '@/components/ui/Text';

export function FinanceView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/finance/dashboard');
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Carregando dashboard financeiro...</div>;
  if (!data) return <div>Erro ao carregar dados.</div>;

  return (
    <div style={{ display: 'grid', gap: '32px', gridTemplateColumns: '1fr 1fr' }}>
      
      {/* Cards */}
      <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--line)' }}>
          <Text variant="caption" style={{ color: 'var(--text-secondary)' }}>Faturado</Text>
          <Text variant="title">R$ {(data.faturado || 0).toLocaleString('pt-BR')}</Text>
        </div>
        <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--line)' }}>
          <Text variant="caption" style={{ color: 'var(--text-secondary)' }}>Recebido</Text>
          <Text variant="title">R$ {(data.recebido || 0).toLocaleString('pt-BR')}</Text>
        </div>
        <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--line)' }}>
          <Text variant="caption" style={{ color: 'var(--text-secondary)' }}>A Receber</Text>
          <Text variant="title">R$ {(data.aReceber || 0).toLocaleString('pt-BR')}</Text>
        </div>
        <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--line)' }}>
          <Text variant="caption" style={{ color: 'var(--text-secondary)' }}>Margem Média</Text>
          <Text variant="title">{(data.margemMedia || 0).toFixed(1)}%</Text>
        </div>
      </div>

      {/* Próximos Vencimentos */}
      <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--line)' }}>
        <Text variant="body-bold">Próximos Vencimentos</Text>
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {data.vencimentos?.map((v: any, i: number) => (
            <Flex key={i} justify="between" align="center" style={{ paddingBottom: '12px', borderBottom: '1px solid var(--line)' }}>
              <div>
                <Text variant="body-bold">R$ {(v.valor).toLocaleString('pt-BR')}</Text>
                <Text variant="caption" style={{ color: 'var(--text-secondary)' }}>{v.cliente}</Text>
              </div>
              <div style={{ padding: '4px 8px', background: `var(--${v.color})`, color: 'var(--text)', borderRadius: '4px', fontSize: '12px' }}>
                {v.status}
              </div>
            </Flex>
          ))}
          {!data.vencimentos?.length && <Text style={{ color: 'var(--text-secondary)' }}>Nenhum vencimento próximo.</Text>}
        </div>
      </div>

      {/* Margem por Obra */}
      <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--line)' }}>
        <Text variant="body-bold">Margem por Obra (Últimas 10)</Text>
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {data.margens?.map((m: any, i: number) => (
            <div key={i}>
              <Flex justify="between" style={{ marginBottom: '8px' }}>
                <Text variant="caption">{m.cliente} ({m.kwp} kWp)</Text>
                <Text variant="caption-bold">{m.margem ? m.margem.toFixed(1) : 0}%</Text>
              </Flex>
              <div style={{ height: '8px', background: 'var(--surface-muted)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(m.margem || 0, 100)}%`, background: m.margem < 20 ? 'var(--red)' : 'var(--green)' }} />
              </div>
            </div>
          ))}
          {!data.margens?.length && <Text style={{ color: 'var(--text-secondary)' }}>Nenhuma obra encontrada.</Text>}
        </div>
      </div>

    </div>
  );
}
