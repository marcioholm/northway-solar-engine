'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
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

  const fetchProjects = async () => {
    try {
      const data = await api.get<SolarProjectSummary[]>(`/solar-project${search ? `?q=${encodeURIComponent(search)}` : ''}`);
      setProjects(data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, [search]);

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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {projects.map(p => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </Stack>
    </div>
  );
}
