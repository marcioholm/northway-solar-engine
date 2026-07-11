'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '../../lib/cn';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: '⌂', href: '/crm' },
  { label: 'CRM', icon: '◎', href: '/crm/leads' },
  { label: 'Propostas', icon: '▤', href: '/proposals' },
  { label: 'Dimensio.', icon: '☀', href: '/dashboard' },
  { label: 'Estoque', icon: '▣', href: '/inventory' },
  { label: 'Obras', icon: '◫', href: '/obras' },
  { label: 'Equipes', icon: '♙', href: '/equipes' },
  { label: 'Frota', icon: '◈', href: '/frota' },
  { label: 'Financeiro', icon: '◉', href: '/financeiro' },
  { label: 'Inteligência', icon: '⌁', href: '/inteligencia' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href === '/crm') return pathname === '/crm';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className="flex flex-col fixed inset-y-0 left-0 z-30"
      style={{
        width: 'var(--sidebar)',
        background: 'var(--surface)',
        borderRight: '1px solid var(--line)',
      }}
    >
      {/* Brand */}
      <div style={{ padding: '20px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
              background: 'var(--green-gradient)',
              display: 'grid', placeItems: 'center',
              color: '#fff', fontSize: '20px', fontWeight: 800,
              flexShrink: 0,
            }}
          >
            ☀
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '18px', lineHeight: 1.1, fontFamily: 'var(--font-body)', color: 'var(--text)' }}>
              SolarOS
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500, marginTop: '1px' }}>
              Gestão inteligente
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '4px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1px' }}>
        {NAV_ITEMS.map(item => {
          const active = isActive(item.href);
          return (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className="nav-item"
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 14px', borderRadius: 'var(--radius-lg)',
                border: 'none', outline: 'none',
                background: active ? 'var(--green-light)' : 'transparent',
                color: active ? 'var(--green-dark)' : 'var(--text-secondary)',
                fontWeight: active ? 700 : 500,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
                width: '100%',
              }}
              onMouseEnter={e => {
                if (!active) e.currentTarget.style.background = 'var(--surface-hover)';
              }}
              onMouseLeave={e => {
                if (!active) e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: '17px', width: '22px', textAlign: 'center', opacity: 0.65 }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid var(--line)' }}>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px', borderRadius: 'var(--radius-lg)',
            background: 'var(--surface-hover)',
          }}
        >
          <div
            style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'var(--green-gradient)',
              display: 'grid', placeItems: 'center',
              color: '#fff', fontWeight: 800, fontSize: '13px',
              flexShrink: 0,
            }}
          >
            MH
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text)' }}>Marcio Holm</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Administrador</div>
          </div>
          <button
            onClick={handleLogout}
            aria-label="Sair"
            style={{
              width: '32px', height: '32px', display: 'grid', placeItems: 'center',
              border: 'none', borderRadius: 'var(--radius-sm)',
              background: 'transparent', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: '16px',
              transition: 'background 0.12s',
              flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            ⏻
          </button>
        </div>
      </div>
    </aside>
  );
}
