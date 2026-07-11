'use client';

import { cn } from '../../lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'var(--green)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 8px 18px rgba(143, 214, 58, 0.22)',
  },
  secondary: {
    background: 'var(--surface)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
  },
  outline: {
    background: 'transparent',
    color: 'var(--green)',
    border: '1px solid var(--green)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: 'none',
  },
  danger: {
    background: 'var(--danger)',
    color: '#fff',
    border: 'none',
  },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: '6px 12px', fontSize: '12px', borderRadius: 'var(--radius-md)' },
  md: { padding: '10px 18px', fontSize: '14px', borderRadius: 'var(--radius-lg)' },
  lg: { padding: '14px 24px', fontSize: '15px', borderRadius: 'var(--radius-lg)' },
};

export function Button({
  children, variant = 'primary', size = 'md', disabled, loading,
  onClick, type = 'button', className, style, ariaLabel, icon, fullWidth,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-busy={loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-bold transition-all duration-150',
        'hover:brightness-95 active:scale-[0.98]',
        fullWidth && 'w-full',
        className,
      )}
      style={{
        ...variantStyles[variant],
        ...sizeStyles[size],
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        ...style,
      }}
      onMouseEnter={e => { if (!isDisabled && variant === 'primary') e.currentTarget.style.background = 'var(--green-dark)'; }}
      onMouseLeave={e => { if (!isDisabled && variant === 'primary') e.currentTarget.style.background = 'var(--green)'; }}
      onClick={onClick}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : icon}
      {children}
    </button>
  );
}
