import { Metadata } from 'next';
import { TeamsView } from '@/components/teams/TeamsView';

export const metadata: Metadata = {
  title: 'Equipes - NorthWay Solar Engine',
};

export default function TeamsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--line)' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>Gestão de Equipes</h1>
        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>Alocação e calendário de instalação das obras.</p>
      </div>
      <div style={{ flex: 1, padding: '32px' }}>
        <TeamsView />
      </div>
    </div>
  );
}
