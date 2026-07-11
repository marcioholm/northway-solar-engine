'use client';

import { cn } from '../../lib/cn';

type TabsVariant = 'underline' | 'pill';

interface Tab {
  key: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
  variant?: TabsVariant;
  className?: string;
}

export function Tabs({ tabs, activeKey, onChange, variant = 'underline', className }: TabsProps) {
  return (
    <div
      className={cn('flex', variant === 'underline' ? 'border-b' : 'gap-1 p-1 bg-surface-muted rounded-xl', className)}
      style={{
        borderColor: variant === 'underline' ? 'var(--border)' : undefined,
        background: variant === 'pill' ? 'var(--surface-muted)' : undefined,
      }}
      role="tablist"
    >
      {tabs.map(tab => {
        const isActive = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={cn(
              'text-sm font-medium transition-all duration-150 whitespace-nowrap',
              variant === 'underline' ? 'px-5 py-3 border-b-2 -mb-px' : 'px-4 py-2 rounded-lg',
            )}
            style={{
              color: isActive
                ? 'var(--green-dark)'
                : 'var(--text-secondary-v2)',
              fontWeight: isActive ? 700 : 500,
              borderColor: variant === 'underline' && isActive ? 'var(--green)' : 'transparent',
              background: variant === 'pill' && isActive ? 'white' : 'transparent',
              boxShadow: variant === 'pill' && isActive ? 'var(--shadow-sm)' : 'none',
            }}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span style={{
                marginLeft: '6px',
                padding: '1px 6px',
                borderRadius: 'var(--radius-full)',
                background: isActive ? 'var(--green-light)' : 'var(--surface-muted)',
                fontSize: '11px',
                fontWeight: 700,
                color: isActive ? 'var(--green-dark)' : 'var(--text-secondary)',
              }}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
