'use client';
import { useState, useEffect } from 'react';
import { ProposalData } from '../../lib/proposal-types';

export function StickyPriceBanner({ data }: { data: ProposalData }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const investmentSection = document.getElementById('investment-section');
    if (!investmentSection) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(investmentSection);
    return () => observer.disconnect();
  }, []);

  if (!data.finalPrice || !visible) return null;

  return (
    <div
      className="no-print"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--surface)',
        borderTop: '1px solid var(--surface-muted)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 1000,
        backdropFilter: 'blur(12px)',
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s ease',
      }}
    >
      <div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
          Investimento total
        </div>
        <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>
          R$ {data.finalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
      </div>
      <a
        href="#investment-section"
        style={{
          background: 'var(--green)',
          color: '#fff',
          padding: '10px 20px',
          borderRadius: 'var(--radius-lg)',
          fontSize: '13px',
          fontWeight: 700,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        Ver condições ↓
      </a>
    </div>
  );
}
