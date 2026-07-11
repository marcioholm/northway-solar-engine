'use client';

import { useEffect, useRef } from 'react';
import { cn } from '../../lib/cn';

type ModalSize = 'sm' | 'md' | 'lg' | 'full' | 'drawer';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  size?: ModalSize;
  className?: string;
}

const sizeStyles: Record<ModalSize, React.CSSProperties> = {
  sm: { maxWidth: '400px', width: '90%' },
  md: { maxWidth: '560px', width: '90%' },
  lg: { maxWidth: '720px', width: '90%' },
  full: { width: '100%', height: '100%', borderRadius: 0 },
  drawer: { maxWidth: '480px', width: '90%', height: '100%', borderRadius: 0, position: 'fixed' as const, right: 0, top: 0 },
};

export function Modal({ open, onClose, title, children, size = 'md', className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: size === 'drawer' ? 'stretch' : 'center',
        justifyContent: size === 'drawer' ? 'flex-end' : 'center',
        padding: size === 'drawer' ? 0 : '16px',
        animation: 'fadeIn 0.15s ease',
      }}
    >
      <div
        className={cn(className)}
        style={{
          background: 'var(--surface)',
          borderRadius: size === 'drawer' || size === 'full' ? 0 : 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.2s ease',
          ...sizeStyles[size],
        }}
      >
        {title && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 24px', borderBottom: '1px solid var(--border)',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text)' }}>{title}</h2>
            <button
              onClick={onClose}
              aria-label="Fechar"
              style={{
                width: '32px', height: '32px',
                display: 'grid', placeItems: 'center',
                border: 'none', borderRadius: 'var(--radius-sm)',
                background: 'transparent', cursor: 'pointer',
                color: 'var(--text-secondary)', fontSize: '18px',
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              ✕
            </button>
          </div>
        )}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
