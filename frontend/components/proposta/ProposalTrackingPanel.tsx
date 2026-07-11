'use client';

import { useState, useEffect } from 'react';
import { Flex } from '../primitives/Flex';
import { Text } from '../primitives/Text';
import { Card } from '../ui/Card';
import { Stack } from '../primitives/Stack';
import { formatDate } from '../../lib/format';

interface TrackingStats {
  proposalId: string;
  firstView: string | null;
  lastView: string | null;
  totalViews: number;
  totalDurationSeconds: number;
  averageDurationSeconds: number;
  downloads: number;
  whatsappClicks: number;
  accepts: number;
  changeRequests: number;
  sections: Array<{ name: string; views: number; totalDurationSeconds: number }>;
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card padding="sm">
      <Text variant="body" color="secondary" style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 2 }}>{label}</Text>
      <Text variant="body-bold" style={{ fontSize: '20px' }}>{value}</Text>
    </Card>
  );
}

export function ProposalTrackingPanel({ proposalId }: { proposalId: string }) {
  const [stats, setStats] = useState<TrackingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const api = process.env.NEXT_PUBLIC_API_URL;
    if (!api || !token) return;

    fetch(`${api}/proposals/${proposalId}/tracking`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [proposalId]);

  if (loading) {
    return <Text variant="body" color="secondary">Carregando rastreamento...</Text>;
  }

  if (!stats) {
    return <Text variant="body" color="secondary">Nenhum dado de rastreamento disponível.</Text>;
  }

  const fmtTime = (s: number) => {
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec}s`;
  };

  return (
    <Stack gap={4}>
      <Text variant="h3">Rastreamento</Text>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        <StatCard label="Visualizações" value={stats.totalViews} />
        <StatCard label="Downloads" value={stats.downloads} />
        <StatCard label="WhatsApp" value={stats.whatsappClicks} />
        <StatCard label="Aceites" value={stats.accepts} />
        <StatCard label="Alterações" value={stats.changeRequests} />
        <StatCard label="Tempo Total" value={fmtTime(stats.totalDurationSeconds)} />
        <StatCard label="Tempo Médio" value={fmtTime(stats.averageDurationSeconds)} />
        <StatCard label="Primeira Visita" value={stats.firstView ? formatDate(stats.firstView, 'short') : '—'} />
      </div>

      {stats.sections.length > 0 && (
        <div>
          <Text variant="body-bold" style={{ marginTop: 16, marginBottom: 8 }}>Seções</Text>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {stats.sections.map(s => (
              <Card key={s.name} padding="sm">
                <Text variant="body" color="secondary" style={{ fontSize: '11px', fontWeight: 600 }}>{s.name}</Text>
                <Text variant="body-bold" style={{ fontSize: '16px' }}>{s.views} visitas · {fmtTime(s.totalDurationSeconds)}</Text>
              </Card>
            ))}
          </div>
        </div>
      )}
    </Stack>
  );
}
