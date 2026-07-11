'use client';

import { cn } from '../../lib/cn';
import { useTheme } from '../../hooks/useTheme';

interface NavbarProps {
  className?: string;
  onSearch?: (query: string) => void;
}

export function Navbar({ className, onSearch }: NavbarProps) {
  const { theme, toggle } = useTheme();

  return (
    <header
      className={cn('flex items-center justify-between', className)}
      style={{
        padding: '12px 8px',
        gap: '16px',
      }}
    >
      {/* Search */}
      <label
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          flex: 1, maxWidth: '400px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '50px',
          padding: '8px 16px',
          fontSize: '13px',
          color: 'var(--text-muted)',
          transition: 'border-color 0.15s',
        }}
      >
        <span style={{ opacity: 0.4, fontSize: '15px' }}>⌕</span>
        <input
          placeholder="Buscar leads, clientes, propostas..."
          onChange={e => onSearch?.(e.target.value)}
          style={{
            border: 'none', outline: 'none', flex: 1, minWidth: '120px',
            fontSize: '13px', background: 'transparent', color: 'var(--text)',
          }}
        />
        <kbd
          style={{
            fontSize: '10px', padding: '2px 6px',
            background: 'var(--surface-hover)', borderRadius: '4px',
            fontFamily: 'inherit', fontWeight: 600,
            color: 'var(--text-muted)',
          }}
        >
          ⌘K
        </kbd>
      </label>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Theme toggle */}
        <button
          onClick={toggle}
          aria-label={theme === 'light' ? 'Modo escuro' : 'Modo claro'}
          style={{
            width: '38px', height: '38px',
            borderRadius: '50%',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'grid', placeItems: 'center',
            transition: 'all 0.12s',
            color: 'var(--text)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; }}
        >
          {theme === 'light' ? '☽' : '☀'}
        </button>

        {/* Notifications */}
        <button
          aria-label="Notificações"
          style={{
            width: '38px', height: '38px',
            borderRadius: '50%',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'grid', placeItems: 'center',
            position: 'relative',
            transition: 'all 0.12s',
            color: 'var(--text)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; }}
        >
          ♢
          <span
            style={{
              position: 'absolute', top: '4px', right: '4px',
              width: '16px', height: '16px',
              background: 'var(--green-dark)', color: '#fff',
              borderRadius: '50%', fontSize: '9px', fontWeight: 700,
              display: 'grid', placeItems: 'center',
            }}
          >
            3
          </span>
        </button>

        {/* Company Switcher */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '5px 12px 5px 5px',
            background: 'var(--green-light)',
            borderRadius: '50px',
            border: '1px solid #d4edb8',
            cursor: 'pointer',
          }}
        >
          <span style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'var(--green-gradient)',
            display: 'grid', placeItems: 'center',
            color: '#fff', fontSize: '14px', fontWeight: 700,
          }}>
            LZ
          </span>
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text)' }}>LZ7 Energia Solar</div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Unidade principal</div>
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>⌄</span>
        </div>
      </div>
    </header>
  );
}
