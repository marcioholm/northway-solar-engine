import Sidebar from '../../components/Sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="app-shell" style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main style={{
                marginLeft: 'var(--sidebar)',
                flex: 1,
                padding: '28px 32px 40px',
                maxWidth: '1800px',
            }}>
                {children}
            </main>
        </div>
    );
}
