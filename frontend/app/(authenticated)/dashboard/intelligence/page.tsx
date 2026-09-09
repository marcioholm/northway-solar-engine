import { Metadata } from 'next';
import { IntelligenceView } from '@/components/intelligence/IntelligenceView';

export const metadata: Metadata = {
  title: 'Inteligência - NorthWay Solar Engine',
};

export default function IntelligencePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--line)' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>Inteligência e Analytics</h1>
        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>Dashboards e projeções do pipeline de vendas.</p>
      </div>
      <div style={{ flex: 1, padding: '32px' }}>
        <IntelligenceView />
      </div>
    </div>
  );
}
