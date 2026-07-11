import { cn } from '../../lib/cn';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
}

export function Skeleton({ width = '100%', height = '16px', borderRadius = 'var(--radius-sm)', className }: SkeletonProps) {
  return (
    <div
      className={cn(className)}
      style={{
        width, height, borderRadius,
        background: 'linear-gradient(90deg, var(--surface-hover) 25%, var(--border) 50%, var(--surface-hover) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
      }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      <Skeleton width="60%" height="14px" />
      <Skeleton width="40%" height="28px" />
      <Skeleton width="80%" height="12px" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: '16px', padding: '12px 0' }}>
          <Skeleton width="20%" height="16px" />
          <Skeleton width="30%" height="16px" />
          <Skeleton width="15%" height="16px" />
          <Skeleton width="15%" height="16px" />
          <Skeleton width="20%" height="16px" />
        </div>
      ))}
    </div>
  );
}
