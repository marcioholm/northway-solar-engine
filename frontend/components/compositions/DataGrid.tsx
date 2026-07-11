'use client';

import { useState } from 'react';
import { cn } from '../../lib/cn';
import { TableSkeleton } from '../ui/Skeleton';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  hideOnMobile?: boolean;
}

interface DataGridProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  mobileCard?: (item: T) => React.ReactNode;
  className?: string;
}

export function DataGrid<T>({
  columns, data, keyExtractor, loading, emptyMessage,
  onRowClick, mobileCard, className,
}: DataGridProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedData = [...data].sort((a: any, b: any) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  if (loading) {
    return (
      <div className={cn(className)} style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)', overflow: 'hidden',
        boxShadow: 'var(--shadow-md)', padding: '20px 24px',
      }}>
        <TableSkeleton rows={5} />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn(className)} style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)', overflow: 'hidden',
        boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
          {emptyMessage || 'Nenhum registro encontrado.'}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(className)} style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)', overflow: 'hidden',
      boxShadow: 'var(--shadow-md)',
    }}>
      {/* Desktop table */}
      <div className="hidden md:block" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAF7' }}>
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  style={{
                    padding: '14px 20px',
                    textAlign: col.align || 'left',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--text-secondary-v2)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    cursor: col.sortable ? 'pointer' : undefined,
                    whiteSpace: 'nowrap',
                    width: col.width,
                    userSelect: 'none',
                  }}
                >
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    <span style={{ marginLeft: '4px', fontSize: '10px' }}>
                      {sortDir === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map(item => (
              <tr
                key={keyExtractor(item)}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                style={{
                  borderTop: '1px solid #EDF0EB',
                  transition: 'background 0.12s',
                  cursor: onRowClick ? 'pointer' : undefined,
                }}
                className="hover:bg-[#F8FAF7]"
              >
                {columns.map(col => (
                  <td
                    key={col.key}
                    style={{
                      padding: '14px 20px',
                      fontSize: '14px',
                      color: 'var(--text)',
                      textAlign: col.align || 'left',
                      whiteSpace: 'nowrap',
                    }}
                    className={col.hideOnMobile ? 'hidden md:table-cell' : ''}
                  >
                    {col.render ? col.render(item) : (item as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden" style={{ padding: '12px' }}>
        {sortedData.map(item => (
          <div
            key={keyExtractor(item)}
            onClick={onRowClick ? () => onRowClick(item) : undefined}
            style={{
              background: 'var(--surface)',
              border: '1px solid #EDF0EB',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '12px',
              cursor: onRowClick ? 'pointer' : undefined,
            }}
          >
            {mobileCard ? (
              mobileCard(item)
            ) : (
              columns.filter(c => !c.hideOnMobile).map(col => (
                <div key={col.key} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px 0',
                  gap: '8px',
                }}>
                  <span style={{
                    width: '90px', flexShrink: 0,
                    fontSize: '11px', fontWeight: 700,
                    color: 'var(--text-secondary-v2)',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    {col.label}
                  </span>
                  <span style={{ fontSize: '14px', color: 'var(--text)' }}>
                    {col.render ? col.render(item) : (item as any)[col.key]}
                  </span>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
