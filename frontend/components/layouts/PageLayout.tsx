'use client';

import { SidebarProvider, useSidebar } from '../../hooks/useSidebar';
import Sidebar from './Sidebar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function LayoutInner({ children }: { children: React.ReactNode }) {
  const { sidebarWidth } = useSidebar();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setMounted(true);
    }
  }, [router]);

  if (!mounted) {
    return null; // Don't render the layout until auth is verified
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main
        style={{
          marginLeft: sidebarWidth,
          flex: 1,
          padding: '24px 32px 40px',
          background: 'var(--bg)',
          transition: 'margin-left 0.2s ease',
        }}
      >
        {children}
      </main>
    </div>
  );
}

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <LayoutInner>{children}</LayoutInner>
    </SidebarProvider>
  );
}
