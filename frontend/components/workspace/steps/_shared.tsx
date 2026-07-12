'use client';

export function StepCard({ icon, title, children, right }: { icon: React.ReactNode; title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--ws-surface-raised)', borderRadius: 'var(--ws-radius-lg)', border: '1px solid var(--ws-border)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '14px 16px', borderBottom: '1px solid var(--ws-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--ws-accent)', display: 'flex' }}>{icon}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ws-text)' }}>{title}</span>
        </div>
        {right}
      </div>
      <div style={{ padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null || value === '') return null;
  return (
    <div>
      <span style={{ display: 'block', fontSize: 10, fontWeight: 600, color: 'var(--ws-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ws-text)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );
}

export function MetricBadge({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '8px 12px', background: 'rgba(245, 158, 11, 0.06)', borderRadius: 8, border: '1px solid rgba(245, 158, 11, 0.1)' }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ws-text)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--ws-text-muted)', fontWeight: 600, marginTop: 2 }}>{label}</div>
    </div>
  );
}
