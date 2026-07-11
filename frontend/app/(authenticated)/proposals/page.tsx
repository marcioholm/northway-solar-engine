'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '../../../components/compositions/PageHeader';
import { DataGrid } from '../../../components/compositions/DataGrid';
import { Button } from '../../../components/ui/Button';
import { Text } from '../../../components/primitives/Text';
import { Stack } from '../../../components/primitives/Stack';
import { Flex } from '../../../components/primitives/Flex';
import { Card } from '../../../components/ui/Card';
import { formatBRL, formatPercent, formatCurrency } from '../../../lib/format';
import { ProposalTrackingPanel } from '../../../components/proposta/ProposalTrackingPanel';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function ProposalsPage() {
  const router = useRouter();
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/proposals?page=${page}&limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setProposals(Array.isArray(json) ? json : json.data);
        if (!Array.isArray(json)) setTotalPages(json.totalPages || 1);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProposals(); }, [page]);

  const handleDownload = (id: string) => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL}/proposals/${id}/pdf`, '_blank');
  };

  const columns = [
    {
      key: 'clientName' as const,
      label: 'Cliente',
      render: (p: any) => <span style={{ fontWeight: 600 }}>{p.clientName}</span>,
      sortable: true,
    },
    { key: 'clientCity' as const, label: 'Cidade', sortable: true },
    {
      key: 'systemPowerKwp' as const,
      label: 'Tamanho',
      render: (p: any) => `${Number(p.systemPowerKwp).toFixed(2)} kWp`,
    },
    {
      key: 'finalPrice' as const,
      label: 'Preço Final',
      render: (p: any) => formatCurrency(Number(p.finalPrice)),
      sortable: true,
    },
    {
      key: 'paybackYears' as const,
      label: 'Payback',
      render: (p: any) => `${Number(p.paybackYears).toFixed(1)} anos`,
    },
    {
      key: 'actions' as const,
      label: 'Ações',
      width: '280px',
      align: 'right' as const,
      render: (p: any) => (
        <Flex gap={1} justify="end">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/proposta/${p.id}`)}>
            Visualizar
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDownload(p.id)}>
            PDF
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setTrackingId(p.id)}>
            Tracking
          </Button>
        </Flex>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      <Stack gap={6}>
        <PageHeader title="Histórico de Propostas" subtitle="Visualize e baixe propostas enviadas aos clientes." />
        <DataGrid
          columns={columns}
          data={proposals}
          keyExtractor={p => p.id}
          loading={loading}
          emptyMessage="Nenhuma proposta encontrada."
        />
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '16px 0' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '13px', fontWeight: 600, cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.4 : 1, fontFamily: 'inherit' }}
            >
              Anterior
            </button>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{page} de {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '13px', fontWeight: 600, cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.4 : 1, fontFamily: 'inherit' }}
            >
              Próximo
            </button>
          </div>
        )}
      </Stack>

      {/* Tracking modal */}
      {trackingId && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.4)', padding: '24px',
        }}>
          <Card padding="lg" style={{ width: '90%', maxWidth: '720px', maxHeight: '90vh', overflow: 'auto', position: 'relative' }}>
            <button onClick={() => setTrackingId(null)} style={{
              position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-secondary)', padding: 4,
            }}>
              <XMarkIcon className="w-5 h-5" />
            </button>
            <ProposalTrackingPanel proposalId={trackingId} />
          </Card>
        </div>
      )}
    </div>
  );
}
