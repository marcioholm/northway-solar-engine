import Sidebar from './Sidebar';

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main
        style={{
          marginLeft: 'var(--sidebar)',
          flex: 1,
          padding: '24px 32px 40px',
          maxWidth: '1800px',
        }}
      >
        {children}
      </main>
    </div>
  );
}
