import { cn } from '../../lib/cn';

type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'new' | 'premium';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  style?: React.CSSProperties;
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  success: { background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' },
  danger:  { background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' },
  warning: { background: '#FFFBEB', color: '#A16207', border: '1px solid #FDE68A' },
  info:    { background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' },
  new:     { background: 'var(--green-light)', color: 'var(--green-dark)', border: '1px solid #C8E6A0' },
  premium: { background: '#F3E8FF', color: '#7C3AED', border: '1px solid #D8B4FE' },
};

export function Badge({ children, variant = 'new', className, style }: BadgeProps) {
  return (
    <span
      className={cn(className)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 10px',
        borderRadius: 'var(--radius-full)',
        fontSize: '11px',
        fontWeight: 700,
        whiteSpace: 'nowrap',
        ...variantStyles[variant],
        ...style,
      }}
    >
      {children}
    </span>
  );
}
