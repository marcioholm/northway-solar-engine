import { cn } from '../../lib/cn';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ icon = '◎', title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center text-center', className)}
      style={{ padding: '48px 24px', gap: '12px' }}
    >
      <span style={{
        fontSize: '40px', opacity: 0.2, display: 'block',
        lineHeight: 1,
      }}>
        {icon}
      </span>
      <h3 style={{
        fontSize: '16px', fontWeight: 700, color: 'var(--text)',
        margin: 0,
      }}>
        {title}
      </h3>
      {description && (
        <p style={{
          fontSize: '13px', color: 'var(--text-secondary)',
          margin: 0, maxWidth: '280px',
        }}>
          {description}
        </p>
      )}
      {action && (
        <Button variant="primary" size="sm" onClick={action.onClick} style={{ marginTop: '8px' }}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
