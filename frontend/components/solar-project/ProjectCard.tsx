'use client';

import { useRouter } from 'next/navigation';
import { Card } from '../ui/Card';
import { Text } from '../primitives/Text';
import { Flex } from '../primitives/Flex';
import { Chip } from '../ui/Chip';
import { formatBRL } from '../../lib/format';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Rascunho',
  client: 'Cliente',
  site: 'Local',
  consumption: 'Consumo',
  sizing: 'Dimensionamento',
  quotes: 'Cotações',
  pricing: 'Precificação',
  payment: 'Pagamento',
  review: 'Revisão',
  proposal: 'Proposta',
  closed_won: 'Ganho',
  closed_lost: 'Perdido',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'var(--text-muted)',
  closed_won: 'var(--green)',
  closed_lost: 'var(--danger)',
  proposal: 'var(--blue)',
};

interface ProjectCardProps {
  project: {
    id: string;
    clientName?: string;
    clientCity?: string;
    clientUtility?: string;
    sizingPowerKwp?: number;
    sizingModuleQty?: number;
    pricingFinalPrice?: number;
    status: string;
    consultantName?: string;
    createdAt: string;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  const statusColor = STATUS_COLORS[project.status] || 'var(--text-secondary)';

  return (
    <Card variant="interactive" padding="md" onClick={() => router.push(`/workspace/${project.id}`)}>
      <Flex direction="column" gap={3}>
        <Flex justify="between" align="center">
          <Text variant="body-bold" style={{ fontSize: '16px' }}>
            {project.clientName || 'Projeto sem nome'}
          </Text>
          <Chip variant="default" style={{ background: `${statusColor}15`, color: statusColor, borderColor: statusColor }}>
            {STATUS_LABELS[project.status] || project.status}
          </Chip>
        </Flex>

        {project.clientCity && (
          <Text variant="body" color="secondary">
            {project.clientCity}{project.clientUtility ? ` · ${project.clientUtility}` : ''}
          </Text>
        )}

        <Flex justify="between" align="center" style={{ marginTop: '8px' }}>
          <Flex gap={4}>
            {project.sizingPowerKwp && (
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>POTÊNCIA</div>
                <div style={{ fontSize: '15px', fontWeight: 700 }}>{project.sizingPowerKwp.toFixed(2)} kWp</div>
              </div>
            )}
            {project.sizingModuleQty && (
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>MÓDULOS</div>
                <div style={{ fontSize: '15px', fontWeight: 700 }}>{project.sizingModuleQty}</div>
              </div>
            )}
            {project.pricingFinalPrice && (
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>VALOR</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--green-dark)' }}>
                  {formatBRL(Number(project.pricingFinalPrice))}
                </div>
              </div>
            )}
          </Flex>
        </Flex>

        {project.consultantName && (
          <Text variant="body" color="secondary" style={{ fontSize: '11px' }}>
            Consultor: {project.consultantName}
          </Text>
        )}
      </Flex>
    </Card>
  );
}
