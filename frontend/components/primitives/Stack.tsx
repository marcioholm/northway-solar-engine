import { cn } from '../../lib/cn';

interface StackProps {
  children?: React.ReactNode;
  gap?: 1 | 2 | 3 | 4 | 5 | 6 | 8;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function Stack({ children, gap = 4, className, style, onClick }: StackProps) {
  return (
    <div
      className={cn('flex flex-col', `s-${gap}`, className)}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
