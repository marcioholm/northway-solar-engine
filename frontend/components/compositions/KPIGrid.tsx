import { cn } from '../../lib/cn';

interface KPIGridProps {
  children: React.ReactNode;
  minWidth?: string;
  className?: string;
}

export function KPIGrid({ children, minWidth = '200px', className }: KPIGridProps) {
  return (
    <div
      className={cn('grid gap-4', className)}
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}, 1fr))`,
      }}
    >
      {children}
    </div>
  );
}
