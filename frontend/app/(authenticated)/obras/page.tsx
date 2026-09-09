import { Metadata } from 'next';
import { KanbanBoard } from '@/components/obras/KanbanBoard';

export const metadata: Metadata = {
  title: 'Obras - NorthWay Solar Engine',
};

export default function ObrasPage() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--line)' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>Gestão de Obras</h1>
        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>Acompanhe a evolução das instalações e homologações.</p>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <KanbanBoard />
      </div>
    </div>
  );
}
