'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MetricCard from '../../../components/MetricCard';
import GoalRing from '../../../components/GoalRing';
import ActivityTimeline from '../../../components/ActivityTimeline';
import SourceChart from '../../../components/SourceChart';
import ConversionFunnel from '../../../components/ConversionFunnel';
import MonthlyChart from '../../../components/MonthlyChart';
import SellerRanking from '../../../components/SellerRanking';
import InsightCard from '../../../components/InsightCard';

export default function CrmDashboard() {
  const [data, setData] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const api = process.env.NEXT_PUBLIC_API_URL;

    Promise.all([
      fetch(`${api}/crm-dashboard`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${api}/crm-dashboard/sources`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([dash, src]) => {
      setData(dash);
      setSources(src);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
        Carregando...
      </div>
    );
  }
  if (!data) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Topbar */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '24px',
        marginBottom: '4px',
      }}>
        <div>
          <p style={{
            fontSize: '11px', fontWeight: 700, color: 'var(--green-dark)',
            textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 4px',
          }}>
            Visão geral
          </p>
          <h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0 }}>Bom dia! 👋</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '4px 0 0' }}>
            Aqui está o resumo das suas vendas e operações de hoje.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'white',
            border: '1px solid var(--line)',
            borderRadius: '50px',
            padding: '8px 16px',
            fontSize: '13px',
            color: 'var(--text-muted)',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <span style={{ opacity: 0.5 }}>⌕</span>
            <input
              placeholder="Buscar leads, clientes, propostas..."
              style={{ border: 'none', outline: 'none', flex: 1, minWidth: '200px', fontSize: '13px' }}
            />
            <kbd style={{
              fontSize: '10px', padding: '2px 6px',
              background: '#f0f5eb', borderRadius: '4px',
              fontFamily: 'inherit', fontWeight: 600,
            }}>
              ⌘ K
            </kbd>
          </label>
          <button style={{
            width: '40px', height: '40px',
            borderRadius: '50%',
            border: '1px solid var(--line)',
            background: 'white',
            fontSize: '18px',
            cursor: 'pointer',
            position: 'relative',
            display: 'grid', placeItems: 'center',
          }}>
            ♢
            <span style={{
              position: 'absolute', top: '6px', right: '6px',
              width: '16px', height: '16px',
              background: 'var(--green-dark)', color: '#fff',
              borderRadius: '50%', fontSize: '9px', fontWeight: 700,
              display: 'grid', placeItems: 'center',
            }}>3</span>
          </button>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '6px 14px 6px 6px',
            background: '#f2f9e8',
            borderRadius: '50px',
            border: '1px solid #d4edb8',
            cursor: 'pointer',
          }}>
            <span style={{ fontSize: '20px' }}>☀</span>
            <div>
              <strong style={{ fontSize: '13px', display: 'block', lineHeight: 1.2 }}>LZ7 Energia Solar</strong>
              <small style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Unidade principal</small>
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>⌄</span>
          </div>
        </div>
      </header>

      {/* Hero Panel */}
      <section style={{
        background: 'white',
        borderRadius: 'var(--radius)',
        padding: '28px 32px',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--line)',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '24px',
        }}>
          <div>
            <span style={{
              fontSize: '11px', fontWeight: 700, color: 'var(--green-dark)',
              textTransform: 'uppercase', letterSpacing: '0.15em',
            }}>
              Resumo do dia
            </span>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '4px 0 0' }}>8 de julho de 2026</h2>
          </div>
          <button style={{
            padding: '8px 18px',
            borderRadius: '50px',
            border: '1px solid var(--line)',
            background: 'white',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
          }}>
            Personalizar ☷
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '16px',
        }}>
          <MetricCard label="Novos leads" value="24" icon="◎" trend={{ value: '18%', direction: 'up', label: 'vs. ontem' }} />
          <MetricCard label="Propostas enviadas" value="12" icon="▤" trend={{ value: '8%', direction: 'up', label: 'vs. ontem' }} />
          <MetricCard label="Vendas fechadas" value="5" icon="★" trend={{ value: '25%', direction: 'up', label: 'vs. ontem' }} />
          <MetricCard label="Faturamento previsto" value="R$ 128.450" icon="$" trend={{ value: '32%', direction: 'up', label: 'vs. ontem' }} />
          <GoalRing
            percentage={68}
            current="R$ 128.450"
            total="R$ 190.000"
            label="Meta do mês"
            daysLeft="24 dias restantes"
          />
        </div>
      </section>

      {/* Dashboard Grid: Pipeline + Right Column */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        gap: '20px',
      }}>
        {/* Pipeline */}
        <section style={{
          background: 'white',
          borderRadius: 'var(--radius)',
          padding: '24px',
          border: '1px solid var(--line)',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '20px',
          }}>
            <div>
              <span style={{
                fontSize: '11px', fontWeight: 700, color: 'var(--green-dark)',
                textTransform: 'uppercase', letterSpacing: '0.15em',
              }}>
                Pipeline de vendas
              </span>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '4px 0 0' }}>
                Oportunidades em andamento <small style={{ fontWeight: 500, color: 'var(--text-muted)' }}>9 etapas</small>
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{
                display: 'flex',
                background: '#f0f5eb',
                borderRadius: '10px',
                padding: '2px',
              }}>
                <button style={{
                  padding: '6px 14px', borderRadius: '8px', border: 'none',
                  background: 'white', fontWeight: 700, fontSize: '12px',
                  cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
                }}>Kanban</button>
                <button style={{
                  padding: '6px 14px', borderRadius: '8px', border: 'none',
                  background: 'transparent', fontWeight: 600, fontSize: '12px',
                  cursor: 'pointer', color: 'var(--text-muted)',
                }}>Lista</button>
              </div>
              <button style={{
                padding: '8px 20px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: 'var(--green-gradient)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
              }}>
                + Novo lead
              </button>
            </div>
          </div>

          <div style={{
            display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '8px',
          }}>
            {[
              { label: 'Novo lead', count: 32, color: '#0ea5e9' },
              { label: 'Contato', count: 18, color: '#3b82f6' },
              { label: 'Qualificação', count: 14, color: '#6366f1' },
              { label: 'Dimensionamento', count: 9, color: '#a855f7' },
              { label: 'Proposta enviada', count: 7, color: '#ec4899' },
            ].map(col => (
              <div key={col.label} style={{
                flexShrink: 0,
                width: '220px',
                background: 'white',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--line)',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '12px 16px', borderBottom: '1px solid var(--line)',
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: col.color }} />
                  <span style={{ fontSize: '12px', fontWeight: 700 }}>{col.label}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>{col.count}</span>
                </div>
                <div style={{ padding: '10px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Preview rápido — <a href="/crm/leads" style={{ color: 'var(--green-dark)', fontWeight: 600 }}>ver Kanban completo</a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right Column */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Activities */}
          <div style={{
            background: 'white', borderRadius: 'var(--radius)',
            padding: '20px 22px', border: '1px solid var(--line)',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '16px',
            }}>
              <div>
                <span style={{
                  fontSize: '10px', fontWeight: 700, color: 'var(--green-dark)',
                  textTransform: 'uppercase', letterSpacing: '0.15em',
                }}>
                  Atividades de hoje
                </span>
                <h3 style={{ fontSize: '14px', fontWeight: 800, margin: '2px 0 0' }}>Próximos compromissos</h3>
              </div>
              <button style={{
                background: 'none', border: 'none', fontWeight: 600,
                fontSize: '12px', cursor: 'pointer', color: 'var(--green-dark)',
              }}>
                Ver tudo
              </button>
            </div>
            <ActivityTimeline
              title=""
              activities={[
                { time: '09:00', icon: '☎', title: 'Ligação com João Silva', subtitle: 'Novo lead', color: '#0ea5e9' },
                { time: '10:30', icon: '●', title: 'Visita técnica', subtitle: 'Lucas Martins', color: '#6366f1' },
                { time: '14:00', icon: '▤', title: 'Proposta enviada', subtitle: 'Ricardo Souza', color: '#ec4899' },
                { time: '16:00', icon: '◉', title: 'Reunião online', subtitle: 'Carla Mendes', color: '#d97706' },
              ]}
            />
          </div>

          {/* Sources */}
          <div style={{
            background: 'white', borderRadius: 'var(--radius)',
            padding: '20px 22px', border: '1px solid var(--line)',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '12px',
            }}>
              <div>
                <span style={{
                  fontSize: '10px', fontWeight: 700, color: 'var(--green-dark)',
                  textTransform: 'uppercase', letterSpacing: '0.15em',
                }}>
                  Leads por origem
                </span>
                <h3 style={{ fontSize: '14px', fontWeight: 800, margin: '2px 0 0' }}>Aquisição no mês</h3>
              </div>
              <select style={{
                border: '1px solid var(--line)', borderRadius: '8px',
                padding: '4px 8px', fontSize: '12px', background: 'white',
              }}>
                <option>Este mês</option>
              </select>
            </div>
            <SourceChart
              total={sources.reduce((s: number, x: any) => s + x.count, 0) || 120}
              sources={sources.map((s: any) => ({
                ...s,
                percentage: s.percentage || Math.round((s.count / (sources.reduce((acc: number, x: any) => acc + x.count, 0) || 1)) * 100),
                color: s.color || '',
              }))}
            />
          </div>
        </aside>
      </div>

      {/* Insights Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
      }}>
        {/* Funnel */}
        <div style={{
          background: 'white', borderRadius: 'var(--radius)',
          padding: '20px 22px', border: '1px solid var(--line)',
          gridColumn: 'span 1',
        }}>
          <span style={{
            fontSize: '10px', fontWeight: 700, color: 'var(--green-dark)',
            textTransform: 'uppercase', letterSpacing: '0.15em',
          }}>
            Funil de conversão
          </span>
          <h3 style={{ fontSize: '14px', fontWeight: 800, margin: '4px 0 12px' }}>Eficiência comercial</h3>
          <ConversionFunnel
            stages={[
              { label: 'Leads', count: 120, percentage: 100 },
              { label: 'Propostas', count: 45, percentage: 68 },
              { label: 'Negociações', count: 18, percentage: 49 },
              { label: 'Fechados', count: 10, percentage: 32 },
            ]}
          />
        </div>

        {/* Monthly Evolution */}
        <div style={{
          background: 'white', borderRadius: 'var(--radius)',
          padding: '20px 22px', border: '1px solid var(--line)',
          gridColumn: 'span 1',
        }}>
          <span style={{
            fontSize: '10px', fontWeight: 700, color: 'var(--green-dark)',
            textTransform: 'uppercase', letterSpacing: '0.15em',
          }}>
            Propostas x vendas
          </span>
          <h3 style={{ fontSize: '14px', fontWeight: 800, margin: '4px 0 12px' }}>Evolução mensal</h3>
          <MonthlyChart proposals={[22, 28, 24, 32, 30, 38, 35, 42, 40, 48, 45, 52]} sales={[8, 10, 9, 14, 12, 16, 14, 18, 17, 22, 20, 25]} />
        </div>

        {/* Average Ticket */}
        <div style={{
          background: 'white', borderRadius: 'var(--radius)',
          padding: '20px 22px', border: '1px solid var(--line)',
        }}>
          <span style={{
            fontSize: '10px', fontWeight: 700, color: 'var(--green-dark)',
            textTransform: 'uppercase', letterSpacing: '0.15em',
          }}>
            Ticket médio
          </span>
          <h3 style={{ fontSize: '14px', fontWeight: 800, margin: '4px 0 12px' }}>Valor por venda</h3>
          <div style={{ fontSize: '32px', fontWeight: 900, lineHeight: 1 }}>R$ 28.450</div>
          <p style={{
            fontSize: '12px', fontWeight: 600, color: '#15803d',
            margin: '8px 0 0', display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            ↑ 12% <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>vs. mês passado</span>
          </p>
          <div style={{
            marginTop: '12px',
            height: '40px',
            background: 'linear-gradient(90deg, #f0f5eb, #d4edb8, #8fd63a)',
            borderRadius: '8px',
            opacity: 0.6,
          }} />
        </div>

        {/* Seller Ranking */}
        <div style={{
          background: 'white', borderRadius: 'var(--radius)',
          padding: '20px 22px', border: '1px solid var(--line)',
        }}>
          <span style={{
            fontSize: '10px', fontWeight: 700, color: 'var(--green-dark)',
            textTransform: 'uppercase', letterSpacing: '0.15em',
          }}>
            Ranking de vendedores
          </span>
          <h3 style={{ fontSize: '14px', fontWeight: 800, margin: '4px 0 12px' }}>Desempenho no mês</h3>
          <SellerRanking
            sellers={data.topSellers?.map((s: any, i: number) => ({
              ...s,
              name: s.userId,
              initials: s.userId?.substring(0, 2).toUpperCase() || 'NA',
              value: Number(s.won || 0) * 2850,
            })) || [
              { userId: 'AR', initials: 'AR', name: 'Ana Rodrigues', won: 24, total: 32, value: 68450 },
              { userId: 'LS', initials: 'LS', name: 'Lucas Silva', won: 18, total: 25, value: 52300 },
              { userId: 'JB', initials: 'JB', name: 'João Barbosa', won: 15, total: 22, value: 41800 },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
