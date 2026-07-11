import { cn } from '../../lib/cn';

type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'body-bold' | 'sm' | 'xs' | 'xxs' | 'mono-hero' | 'mono-lg' | 'mono';

type TextColor = 'primary' | 'secondary' | 'muted' | 'accent' | 'danger' | 'success' | 'warning' | 'white';

interface TextProps {
  variant?: TextVariant;
  color?: TextColor;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label' | 'strong';
  onClick?: () => void;
  htmlFor?: string;
}

const variantMap: Record<TextVariant, string> = {
  'h1': 't-h1',
  'h2': 't-h2',
  'h3': 't-h3',
  'h4': 't-h4',
  'body': 't-body',
  'body-bold': 't-body-bold',
  'sm': 't-sm',
  'xs': 't-xs',
  'xxs': 't-xxs',
  'mono-hero': 't-h1 font-mono',
  'mono-lg': 't-h2 font-mono',
  'mono': 't-body font-mono',
};

const colorMap: Record<TextColor, string> = {
  primary: '', /* default */
  secondary: '',
  muted: '',
  accent: '',
  danger: '',
  success: '',
  warning: '',
  white: '',
};

const colorStyle: Record<TextColor, string> = {
  primary: 'var(--text)',
  secondary: 'var(--text-secondary)',
  muted: 'var(--text-muted)',
  accent: 'var(--green)',
  danger: 'var(--danger)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  white: '#fff',
};

export function Text({ variant = 'body', color, children, className, style, as, onClick, htmlFor }: TextProps) {
  const Tag = as || (variant === 'h1' ? 'h1' : variant === 'h2' ? 'h2' : variant === 'h3' ? 'h3' : variant === 'h4' ? 'h4' : 'p');

  return (
    <Tag
      className={cn(variantMap[variant], className)}
      style={{
        ...style,
        color: color ? colorStyle[color] : undefined,
        margin: 0,
      }}
      onClick={onClick}
      htmlFor={htmlFor}
    >
      {children}
    </Tag>
  );
}
