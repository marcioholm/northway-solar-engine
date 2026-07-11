import { cn } from '../../lib/cn';
import { Text } from '../primitives/Text';
import { Flex } from '../primitives/Flex';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  beforeTitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, beforeTitle, actions, className }: PageHeaderProps) {
  return (
    <Flex align="start" justify="between" gap={4} className={cn('mb-8', className)}>
      <Flex gap={3} align="center">
        {beforeTitle}
        <div>
          <Text variant="h1" style={{ fontSize: '30px' }}>{title}</Text>
          {subtitle && (
            <Text variant="body" color="secondary" style={{ marginTop: '4px' }}>{subtitle}</Text>
          )}
        </div>
      </Flex>
      {actions && (
        <Flex gap={3} align="center" className="flex-shrink-0">
          {actions}
        </Flex>
      )}
    </Flex>
  );
}
