import { cn } from '../../lib/cn';

interface FlexProps {
  children?: React.ReactNode;
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
  wrap?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  flex?: number | string;
}

const alignMap: Record<string, string> = {
  start: 'items-start', center: 'items-center', end: 'items-end', stretch: 'items-stretch',
};

const justifyMap: Record<string, string> = {
  start: 'justify-start', center: 'justify-center', end: 'justify-end',
  between: 'justify-between', around: 'justify-around', evenly: 'justify-evenly',
};

export function Flex({ children, direction, align, justify, gap, wrap, className, style, onClick, flex }: FlexProps) {
  return (
    <div
      className={cn(
        'flex',
        direction === 'column' && 'flex-col',
        align && alignMap[align],
        justify && justifyMap[justify],
        gap && `s-${gap}`,
        wrap && 'flex-wrap',
        className,
      )}
      style={{ ...style, flex }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
