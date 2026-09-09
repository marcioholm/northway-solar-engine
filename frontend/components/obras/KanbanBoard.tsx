'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Flex } from '@/components/ui/Flex';
import { Text } from '@/components/ui/Text';

type Project = {
  id: string;
  client_name: string;
  system_power_kwp: number;
  status: string;
  team?: { name: string; color: string };
  updated_at: string;
};

const STAGES = [
  { id: 'waiting_material', label: 'Aguardando Material' },
  { id: 'material_received', label: 'Material Recebido' },
  { id: 'technical_visit', label: 'Visita Técnica' },
  { id: 'installing', label: 'Em Instalação' },
  { id: 'installation_done', label: 'Instalação Concluída' },
  { id: 'awaiting_inspection', label: 'Aguard. Vistoria' },
  { id: 'inspected', label: 'Vistoriado' },
  { id: 'homologated', label: 'Homologado' },
  { id: 'commissioned', label: 'Comissionado' },
];

export function KanbanBoard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await api.get<Project[]>('/projects');
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    const projectId = e.dataTransfer.getData('projectId');
    if (!projectId) return;

    // Optimistic update
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p))
    );

    try {
      await api.patch(`/projects/${projectId}/status`, { status: newStatus });
    } catch (err) {
      console.error(err);
      // Revert on error
      fetchProjects();
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Carregando obras...</div>;

  return (
    <div
      style={{
        display: 'flex',
        gap: '16px',
        padding: '24px 32px',
        overflowX: 'auto',
        height: '100%',
        background: 'var(--surface-muted)',
      }}
    >
      {STAGES.map((stage) => {
        const stageProjects = projects.filter((p) => p.status === stage.id);

        return (
          <div
            key={stage.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, stage.id)}
            style={{
              minWidth: '280px',
              maxWidth: '280px',
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--line)',
            }}
          >
            <div style={{ padding: '16px', borderBottom: '1px solid var(--line)' }}>
              <Text variant="body-bold">
                {stage.label} ({stageProjects.length})
              </Text>
            </div>
            <div
              style={{
                padding: '12px',
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {stageProjects.map((project) => (
                <div
                  key={project.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('projectId', project.id);
                  }}
                  style={{
                    padding: '16px',
                    background: 'var(--surface)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'grab',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <Text variant="body-bold" style={{ display: 'block', marginBottom: 4 }}>
                    {project.client_name}
                  </Text>
                  <Flex justify="between">
                    <Text variant="caption" style={{ color: 'var(--text-secondary)' }}>
                      {project.system_power_kwp ? `${project.system_power_kwp} kWp` : '-- kWp'}
                    </Text>
                    {project.team && (
                      <span
                        style={{
                          fontSize: '11px',
                          background: project.team.color + '22',
                          color: project.team.color,
                          padding: '2px 6px',
                          borderRadius: '12px',
                        }}
                      >
                        {project.team.name}
                      </span>
                    )}
                  </Flex>
                  <div style={{ marginTop: 12, height: 4, background: 'var(--line)', borderRadius: 2 }}>
                    <div style={{ width: '40%', height: '100%', background: 'var(--green)', borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
