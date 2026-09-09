'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Flex } from '@/components/primitives/Flex';
import { Text } from '@/components/primitives/Text';

export function ProjectView({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'resumo' | 'checklist' | 'documentos' | 'timeline' | 'financeiro'>('resumo');

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const data = await api.get(`/projects/${projectId}`);
      setProject(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Carregando detalhes...</div>;
  if (!project) return <div style={{ padding: 24 }}>Obra não encontrada.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* HEADER */}
      <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--line)', background: 'var(--surface)' }}>
        <Flex justify="between" align="center">
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>{project.client_name}</h1>
            <Text variant="body" style={{ color: 'var(--text-secondary)' }}>
              {project.city} - {project.system_power_kwp} kWp
            </Text>
          </div>
          <div style={{ padding: '8px 16px', background: 'var(--surface-muted)', borderRadius: '8px' }}>
            Status Atual: <strong>{project.status}</strong>
          </div>
        </Flex>

        {/* TABS */}
        <Flex gap={6} style={{ marginTop: '24px' }}>
          {[
            { id: 'resumo', label: 'Resumo' },
            { id: 'checklist', label: 'Checklist' },
            { id: 'documentos', label: 'Documentos' },
            { id: 'timeline', label: 'Timeline' },
            { id: 'financeiro', label: 'Financeiro' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                background: 'none',
                border: 'none',
                padding: '0 0 12px 0',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === tab.id ? 600 : 400,
                color: activeTab === tab.id ? 'var(--text)' : 'var(--text-secondary)',
                borderBottom: activeTab === tab.id ? '2px solid var(--green)' : '2px solid transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </Flex>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px', background: 'var(--surface-muted)' }}>
        {activeTab === 'resumo' && (
          <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '12px' }}>
              <Text variant="body-bold">Dados do Cliente</Text>
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Text>Nome: {project.client_name}</Text>
                <Text>Telefone: {project.client_phone}</Text>
                <Text>Email: {project.client_email}</Text>
                <Text>Cidade: {project.city}</Text>
              </div>
            </div>
            <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '12px' }}>
              <Text variant="body-bold">Sistema Solar</Text>
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Text>Potência: {project.system_power_kwp} kWp</Text>
                <Text>Módulos: {project.module_qty}x</Text>
                <Text>Equipe: {project.team?.name || 'Não definida'}</Text>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'checklist' && (
          <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '12px' }}>
            <Text variant="body-bold">Itens do Estágio Atual</Text>
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {project.checklists?.filter((c: any) => c.stage === project.status).map((item: any) => (
                <Flex key={item.id} gap={3} align="center">
                  <input type="checkbox" checked={item.completed} readOnly style={{ width: 18, height: 18 }} />
                  <Text style={{ textDecoration: item.completed ? 'line-through' : 'none' }}>{item.item_label}</Text>
                </Flex>
              ))}
              {(!project.checklists || project.checklists.filter((c: any) => c.stage === project.status).length === 0) && (
                <Text style={{ color: 'var(--text-secondary)' }}>Nenhum checklist configurado para este estágio.</Text>
              )}
            </div>
          </div>
        )}

        {activeTab === 'documentos' && (
          <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '12px' }}>
            <Text variant="body-bold">Documentos da Obra</Text>
            <Text style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Em breve: Upload de arquivos (ART, notas fiscais, fotos).</Text>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '12px' }}>
            <Text variant="body-bold">Histórico (Timeline)</Text>
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {project.logs?.map((log: any) => (
                <div key={log.id} style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: 2, background: 'var(--line)' }} />
                  <div>
                    <Text variant="body-bold">Status alterado: {log.to_status}</Text>
                    <Text variant="sm" style={{ color: 'var(--text-secondary)' }}>{new Date(log.changed_at).toLocaleString('pt-BR')}</Text>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'financeiro' && (
          <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '12px' }}>
            <Text variant="body-bold">Resumo Financeiro da Obra</Text>
            <div style={{ display: 'flex', gap: '32px', marginTop: '16px' }}>
              <div>
                <Text variant="sm" style={{ color: 'var(--text-secondary)' }}>Receita (Venda)</Text>
                <Text variant="h2">R$ {Number(project.sale_price || 0).toLocaleString('pt-BR')}</Text>
              </div>
              <div>
                <Text variant="sm" style={{ color: 'var(--text-secondary)' }}>Custos (Real)</Text>
                <Text variant="h2">R$ {Number(project.total_cost || 0).toLocaleString('pt-BR')}</Text>
              </div>
              <div>
                <Text variant="sm" style={{ color: 'var(--text-secondary)' }}>Margem Atual</Text>
                <Text variant="h2" style={{ color: project.margin_percent < 20 ? 'var(--red)' : 'var(--green)' }}>
                  {Number(project.margin_percent || 0).toFixed(1)}%
                </Text>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
