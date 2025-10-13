// src/components/overview/today-tasks.tsx
'use client';

import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';
import { TodayTask } from '@/lib/hooks/useOverview';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';

interface TodayTasksProps {
  tasks: TodayTask[];
}

export function TodayTasks({ tasks }: TodayTasksProps) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="Nenhuma tarefa agendada"
        description="Você não tem tarefas agendadas para hoje. Aproveite para planejar!"
      >
        <Link
          href="/calendar"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          Ver calendário
          <ArrowRight className="h-4 w-4" />
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <Link
          key={task.id}
          href={`/tasks/${task.id}`}
          className="block bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                  {task.title}
                </h3>
                <StatusBadge status={task.status as 'todo' | 'doing' | 'done' | 'blocked'} showIcon={false} />
              </div>
              {task.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                  {task.description}
                </p>
              )}
              <div className="flex items-center gap-3 text-xs">
                <PriorityBadge
                  priority={task.priority as 'urgent' | 'high' | 'medium' | 'low'}
                  showIcon={true}
                />
                {task.estimatedTime && (
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {task.estimatedTime}min
                  </span>
                )}
                {task.studyGoal && (
                  <span className="text-gray-500 dark:text-gray-400">
                    {task.studyGoal}
                  </span>
                )}
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
          </div>
        </Link>
      ))}
    </div>
  );
}
