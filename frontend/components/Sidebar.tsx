'use client';

import { usePathname, useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: '⌂', href: '/crm' },
  { label: 'CRM', icon: '◎', href: '/crm/leads' },
  { label: 'Propostas', icon: '▤', href: '/proposals' },
  { label: 'Dimensionamento', icon: '☀', href: '/dashboard' },
  { label: 'Obras', icon: '◫', href: '#' },
  { label: 'Equipes', icon: '♙', href: '#' },
  { label: 'Frota', icon: '◈', href: '#' },
  { label: 'Estoque', icon: '▣', href: '/inventory' },
  { label: 'Financeiro', icon: '◉', href: '#' },
  { label: 'Inteligência', icon: '⌁', href: '#' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href === '#') return false;
    if (href === '/crm') return pathname === '/crm';
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-[var(--sidebar)] flex flex-col bg-white/92 border-r border-[var(--line)] z-20">
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 pb-5 pt-6">
        <div className="w-9 h-9 rounded-full grid place-items-center bg-[var(--green-light)] text-[var(--green-dark)] text-2xl font-bold">
          ☀
        </div>
        <div>
          <div className="font-extrabold text-lg font-[Manrope] leading-none" style={{ color: 'var(--text)' }}>SolarOS</div>
          <div className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Gestão inteligente</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 px-3 py-2 overflow-y-auto">
        {NAV_ITEMS.map(item => (
            <button
                key={item.label}
                onClick={() => item.href !== '#' && router.push(item.href)}
                className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: '14px',
                  border: 'none',
                  outline: 'none',
                  background: isActive(item.href)
                    ? 'linear-gradient(135deg, #e8f8c9, #cef47f)'
                    : 'transparent',
                  color: isActive(item.href) ? '#2f5c15' : '#59625d',
                  fontWeight: isActive(item.href) ? 700 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  if (!isActive(item.href)) {
                    e.currentTarget.style.background = '#f0f5eb';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive(item.href)) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
            <span style={{ fontSize: '18px', width: '24px', textAlign: 'center', opacity: 0.7 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto flex flex-col gap-2 px-3 pb-4 pt-4 border-t border-[var(--line)]">
        <button
          onClick={() => router.push('/settings')}
          className="nav-item"
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            padding: '10px 14px',
            borderRadius: '14px',
            border: 'none',
            background: 'transparent',
            color: '#59625d',
            fontWeight: 500,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: '18px', opacity: 0.7 }}>⚙</span>
          Configurações
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px',
            background: '#f5f7f3',
            border: '1px solid var(--line)',
            borderRadius: '16px',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              background: 'linear-gradient(135deg, #8fd63a, #6db522)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '14px',
              flexShrink: 0,
            }}
          >
            MH
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '13px' }}>Marcio Holm</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>Administrador</div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '16px',
              color: '#6d746f',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '8px',
            }}
            title="Sair"
          >
            ⏻
          </button>
        </div>
      </div>
    </aside>
  );
}
