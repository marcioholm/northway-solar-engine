import { cn } from '../../lib/cn';

type CardVariant = 'default' | 'interactive' | 'highlight' | 'glass';

interface CardProps {
  children?: React.ReactNode;
  variant?: CardVariant;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const paddingMap: Record<string, string> = {
  sm: 'p-4', md: 'p-6', lg: 'p-8', none: '',
};

export function Card({ children, variant = 'default', padding = 'md', className, style, onClick }: CardProps) {
  const baseStyle: React.CSSProperties = {
    background: variant === 'glass' ? 'rgba(255,255,255,0.85)' : 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)',
    backdropFilter: variant === 'glass' ? 'blur(12px)' : undefined,
    ...(variant === 'highlight' && {
      boxShadow: 'var(--shadow-glow)',
      borderColor: 'var(--green)',
    }),
    ...(!onClick && { boxShadow: 'var(--shadow-md)' }),
  };

  return (
    <div
      className={cn('transition-all duration-150', paddingMap[padding], onClick && 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5', className)}
      style={{ ...baseStyle, ...style }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick(); } : undefined}
    >
      {children}
    </div>
  );
}
