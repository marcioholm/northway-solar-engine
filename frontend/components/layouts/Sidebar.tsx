'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '../../lib/cn';
import { useSidebar } from '../../hooks/useSidebar';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: '⌂', href: '/crm' },
  { label: 'CRM', icon: '◎', href: '/crm/leads' },
  { label: 'Propostas', icon: '▤', href: '/proposals' },
  { label: 'Dimensio.', icon: '☀', href: '/dashboard' },
  { label: 'Catálogo', icon: '▣', href: '/catalog' },
  { label: 'Obras', icon: '◫', href: '/obras' },
  { label: 'Equipes', icon: '♙', href: '/equipes' },
  { label: 'Frota', icon: '◈', href: '/frota' },
  { label: 'Financeiro', icon: '◉', href: '/financeiro' },
  { label: 'Inteligência', icon: '⌁', href: '/inteligencia' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed, toggle } = useSidebar();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href === '/crm') return pathname === '/crm';
    return pathname.startsWith(href);
  };

  const w = collapsed ? 64 : 240;

  return (
    <aside
      className="flex flex-col fixed inset-y-0 left-0 z-30"
      style={{
        width: w,
        background: 'var(--surface)',
        borderRight: '1px solid var(--line)',
        transition: 'width 0.2s ease',
        overflow: 'hidden',
      }}
    >
      {/* Brand */}
      <div style={{ padding: collapsed ? '16px 0' : '20px 20px 16px', textAlign: collapsed ? 'center' : undefined }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          justifyContent: collapsed ? 'center' : undefined,
        }}>
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
          {!collapsed && (
            <div style={{ opacity: 1, transition: 'opacity 0.15s' }}>
              <div style={{ fontWeight: 800, fontSize: '18px', lineHeight: 1.1, fontFamily: 'var(--font-body)', color: 'var(--text)' }}>
                SolarOS
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500, marginTop: '1px' }}>
                Gestão inteligente
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav style={{
        flex: 1, padding: '4px 8px', overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: '1px',
      }}>
        {NAV_ITEMS.map(item => {
          const active = isActive(item.href);
          return (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className="nav-item"
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: collapsed ? '10px 0' : '10px 14px',
                borderRadius: 'var(--radius-lg)',
                border: 'none', outline: 'none',
                background: active ? 'var(--green-light)' : 'transparent',
                color: active ? 'var(--green-dark)' : 'var(--text-secondary)',
                fontWeight: active ? 700 : 500,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
                width: '100%',
                justifyContent: collapsed ? 'center' : undefined,
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--surface-hover)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              title={collapsed ? item.label : undefined}
            >
              <span style={{ fontSize: '17px', width: '22px', textAlign: 'center', opacity: 0.65, flexShrink: 0 }}>
                {item.icon}
              </span>
              {!collapsed && <span style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: collapsed ? '8px 0' : '12px 14px', borderTop: '1px solid var(--line)' }}>
        {/* Collapse toggle */}
        <button
          onClick={toggle}
          aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : undefined,
            gap: '10px', width: '100%',
            padding: collapsed ? '10px 0' : '10px 14px',
            borderRadius: 'var(--radius-lg)', border: 'none',
            background: 'transparent', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500,
            transition: 'background 0.12s',
            marginBottom: '8px',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <span style={{ fontSize: '16px', flexShrink: 0, transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            ◀
          </span>
          {!collapsed && <span>Recolher</span>}
        </button>

        {!collapsed && (
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
        )}
      </div>
    </aside>
  );
}
