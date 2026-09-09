'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Flex } from '@/components/primitives/Flex';
import { Text } from '@/components/primitives/Text';

export function TeamsView() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await api.get<any[]>('/teams');
      setTeams(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Carregando equipes...</div>;
  if (!teams) return <div>Erro ao carregar dados.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Calendário Simplificado (Gantt-like) */}
      <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--line)' }}>
        <Text variant="body-bold">Cronograma Semanal</Text>
        
        <div style={{ marginTop: '24px', overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)' }}>
                <th style={{ width: '150px', textAlign: 'left', padding: '12px' }}>Equipe</th>
                <th style={{ textAlign: 'center', padding: '12px', color: 'var(--text-secondary)' }}>Seg</th>
                <th style={{ textAlign: 'center', padding: '12px', color: 'var(--text-secondary)' }}>Ter</th>
                <th style={{ textAlign: 'center', padding: '12px', color: 'var(--text-secondary)' }}>Qua</th>
                <th style={{ textAlign: 'center', padding: '12px', color: 'var(--text-secondary)' }}>Qui</th>
                <th style={{ textAlign: 'center', padding: '12px', color: 'var(--text-secondary)' }}>Sex</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '16px 12px' }}>
                    <Text variant="body-bold">{team.name}</Text>
                    <Text variant="sm" style={{ color: 'var(--text-secondary)' }}>{team.members?.length || 0} membros</Text>
                  </td>
                  <td colSpan={5} style={{ padding: '16px 12px' }}>
                    {team.projects?.length > 0 ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {team.projects.map((p: any) => (
                          <div key={p.id} style={{ 
                            flex: 1, 
                            background: `${team.color}22`, 
                            borderLeft: `4px solid ${team.color}`,
                            padding: '8px 12px',
                            borderRadius: '4px'
                          }}>
                            <Text variant="body-bold" style={{ display: 'block', color: team.color }}>{p.client_name}</Text>
                            <Text variant="sm" style={{ color: 'var(--text-secondary)' }}>{p.system_power_kwp} kWp - {p.status}</Text>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: '8px', background: 'var(--surface-muted)', borderRadius: '4px', textAlign: 'center' }}>
                        <Text variant="sm" style={{ color: 'var(--text-secondary)' }}>Livre</Text>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
