'use client';

interface Seller {
  userId: string;
  initials: string;
  name: string;
  won: number;
  total: number;
  value: number;
}

interface SellerRankingProps {
  sellers: Seller[];
}

export default function SellerRanking({ sellers }: SellerRankingProps) {
  if (!sellers || sellers.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {sellers.map((seller, i) => (
        <div key={seller.userId} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 14px',
          background: i === 0 ? '#f2f9e8' : 'transparent',
          borderRadius: 'var(--radius-sm)',
          transition: 'background 0.15s',
        }}>
          <span style={{
            width: '24px',
            fontWeight: 900,
            fontSize: '14px',
            color: i < 3 ? ['#8fd63a', '#6db522', '#fbbf24'][i] : 'var(--text-muted)',
          }}>
            {i + 1}
          </span>
          <div style={{
            width: '34px', height: '34px',
            borderRadius: '50%',
            display: 'grid', placeItems: 'center',
            background: i === 0 ? 'var(--green-gradient)' : '#f0f5eb',
            color: i === 0 ? '#fff' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '12px',
            flexShrink: 0,
          }}>
            {seller.initials || seller.userId.substring(0, 2).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '13px' }}>{seller.name || seller.userId}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
              {seller.won} vendas / {seller.total} leads
            </div>
          </div>
          <div style={{ fontWeight: 800, fontSize: '14px', whiteSpace: 'nowrap', color: 'var(--text)' }}>
            R$ {seller.value.toLocaleString('pt-BR')}
          </div>
        </div>
      ))}
    </div>
  );
}
