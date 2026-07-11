'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/compositions/PageHeader';
import { DataGrid } from '../../../components/compositions/DataGrid';
import { Button } from '../../../components/ui/Button';
import { Text } from '../../../components/primitives/Text';
import { Stack } from '../../../components/primitives/Stack';
import { formatCurrency } from '../../../lib/format';

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/proposals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setProposals(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProposals(); }, []);

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
      width: '120px',
      align: 'right' as const,
      render: (p: any) => (
        <Button variant="ghost" size="sm" onClick={() => handleDownload(p.id)}>
          Baixar PDF
        </Button>
      ),
    },
  ];

  return (
    <div style={{ width: '100%' }}>
      <Stack gap={6}>
        <PageHeader title="Histórico de Propostas" subtitle="Visualize e baixe propostas enviadas aos clientes." />
        <DataGrid
          columns={columns}
          data={proposals}
          keyExtractor={p => p.id}
          loading={loading}
          emptyMessage="Nenhuma proposta encontrada."
        />
      </Stack>
    </div>
  );
}
