import { Metadata } from 'next';
import { ProjectView } from '@/components/obras/ProjectView';

export const metadata: Metadata = {
  title: 'Detalhes da Obra - NorthWay Solar Engine',
};

export default function ProjectPage({ params }: { params: { id: string } }) {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ProjectView projectId={params.id} />
    </div>
  );
}
