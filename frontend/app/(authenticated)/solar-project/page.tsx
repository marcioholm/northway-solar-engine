'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon } from '@heroicons/react/24/outline';
import { PageHeader } from '../../../components/compositions/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Flex } from '../../../components/primitives/Flex';
import { Stack } from '../../../components/primitives/Stack';
import { Text } from '../../../components/primitives/Text';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ProjectCard } from '../../../components/solar-project/ProjectCard';
import { api } from '../../../lib/api';

interface SolarProjectSummary {
  id: string;
  clientName: string;
  clientCity: string;
  clientUtility: string;
  sizingPowerKwp: number;
  sizingModuleQty: number;
  pricingFinalPrice: number;
  status: string;
  consultantName: string;
  createdAt: string;
}

export default function SolarProjectListPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<SolarProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 50;

  const fetchProjects = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      params.set('page', String(page));
      params.set('limit', String(limit));
      const res = await api.get<any>(`/solar-project?${params}`);
      setProjects(Array.isArray(res) ? res : res.data);
      if (!Array.isArray(res)) setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setPage(1); }, [search]);
  useEffect(() => { fetchProjects(); }, [search, page]);

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      <Stack gap={6}>
        <PageHeader
          title="Projetos"
          subtitle="Gerencie todos os projetos solares da empresa."
          actions={
            <Button
              variant="primary"
              size="md"
              icon={<PlusIcon className="w-5 h-5" />}
              onClick={() => router.push('/solar-project/new')}
            >
              Novo Projeto
            </Button>
          }
        />

        <Flex gap={3} align="center">
          <div style={{ flex: 1, maxWidth: '400px' }}>
            <Input
              placeholder="Buscar por cliente..."
              value={search}
              onChange={setSearch}
            />
          </div>
        </Flex>

        {loading ? (
          <Text variant="body" color="secondary">Carregando...</Text>
        ) : projects.length === 0 ? (
          <EmptyState
            icon="◈"
            title="Nenhum projeto encontrado"
            description={search ? 'Tente alterar a busca.' : 'Crie seu primeiro projeto solar.'}
            action={!search ? { label: 'Novo Projeto', onClick: () => router.push('/solar-project/new') } : undefined}
          />
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {projects.map(p => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
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
          </>
        )}
      </Stack>
    </div>
  );
}
