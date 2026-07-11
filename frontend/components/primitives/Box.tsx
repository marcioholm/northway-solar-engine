import { cn } from '../../lib/cn';

type BoxElement = 'div' | 'section' | 'article' | 'header' | 'footer' | 'aside' | 'main' | 'span' | 'label';

interface BoxProps {
  as?: BoxElement;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Box({ as: Tag = 'div', children, className, onClick, style }: BoxProps) {
  return (
    <Tag className={cn(className)} onClick={onClick} style={style}>
      {children}
    </Tag>
  );
}
