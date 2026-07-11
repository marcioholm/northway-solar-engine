import { cn } from '../../lib/cn';

type ChipVariant = 'default' | 'margin' | 'profit' | 'status' | 'client' | 'origin';

interface ChipProps {
  children?: React.ReactNode;
  variant?: ChipVariant;
  dot?: string;
  className?: string;
  style?: React.CSSProperties;
}

const variantStyles: Record<ChipVariant, React.CSSProperties> = {
  default: { background: '#EEF2ED', color: '#58605A' },
  margin:  { background: '#F0FDF4', color: '#15803D' },
  profit:  { background: '#FEFCE8', color: '#A16207' },
  status:  { background: '#EFF6FF', color: '#2563EB' },
  client:  { background: '#F5F3FF', color: '#7C3AED' },
  origin:  { background: '#F2F9E8', color: '#4F8618' },
};

export function Chip({ children, variant = 'default', dot, className, style }: ChipProps) {
  return (
    <span
      className={cn(className)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: 'var(--radius-full)',
        fontSize: '12px',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        ...variantStyles[variant],
        ...style,
      }}
    >
      {dot && (
        <span style={{
          width: '7px', height: '7px', borderRadius: '50%',
          background: dot, flexShrink: 0,
        }} />
      )}
      {children}
    </span>
  );
}
