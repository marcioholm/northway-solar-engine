import { cn } from '../../lib/cn';

interface GridProps {
  children?: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 1 | 2 | 3 | 4 | 5 | 6 | 8;
  className?: string;
  style?: React.CSSProperties;
}

export function Grid({ children, cols, gap, className, style }: GridProps) {
  return (
    <div
      className={cn(
        'grid',
        cols && `grid-cols-${cols}`,
        gap && `s-${gap}`,
        className,
      )}
      style={{
        ...style,
        gridTemplateColumns: cols ? undefined : style?.gridTemplateColumns,
      }}
    >
      {children}
    </div>
  );
}
