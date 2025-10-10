import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';

type TaskStatus = 'todo' | 'doing' | 'done' | 'blocked';

const statusConfig = {
  todo: {
    label: 'A Fazer',
    variant: 'secondary' as const,
    icon: Circle,
    className: 'text-gray-500'
  },
  doing: {
    label: 'Fazendo',
    variant: 'default' as const,
    icon: Clock,
    className: 'text-blue-500'
  },
  done: {
    label: 'Concluído',
    variant: 'default' as const,
    icon: CheckCircle2,
    className: 'text-green-500 bg-green-50 dark:bg-green-950'
  },
  blocked: {
    label: 'Bloqueado',
    variant: 'destructive' as const,
    icon: AlertCircle,
    className: 'text-red-500'
  }
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}
