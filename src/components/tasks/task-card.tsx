'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TaskStatusBadge } from './task-status-badge';
import { MoreVertical, Pencil, Trash2, Play } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toggleTaskStatus, deleteTask } from '@/app/tasks/actions';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { GenerateFlashcardsButton } from './generate-flashcards-button';

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'doing' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  concepts: {
    concept: {
      id: string;
      name: string;
    };
  }[];
};

const priorityColors = {
  low: 'secondary',
  medium: 'default',
  high: 'destructive',
  urgent: 'destructive'
} as const;

const priorityLabels = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente'
};

export function TaskCard({ task }: { task: Task }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggleStatus = () => {
    startTransition(async () => {
      await toggleTaskStatus(task.id);
    });
  };

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja deletar esta task?')) {
      startTransition(async () => {
        const result = await deleteTask(task.id);
        if (result.success) {
          router.refresh();
        }
      });
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Quick Status Toggle */}
          <button
            onClick={handleToggleStatus}
            disabled={isPending}
            className="mt-1 hover:scale-110 transition-transform"
            aria-label="Toggle status"
          >
            {task.status === 'done' ? (
              <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                <div className="h-2 w-2 bg-white rounded-full" />
              </div>
            ) : (
              <div className="h-5 w-5 rounded-full border-2 border-gray-300 hover:border-blue-500" />
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <Link href={`/tasks/${task.id}`} className="group">
              <h3 className="font-semibold mb-1 group-hover:text-blue-600 transition-colors">
                {task.title}
              </h3>
            </Link>

            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap gap-2 items-center">
              <TaskStatusBadge status={task.status} />

              <Badge variant={priorityColors[task.priority]}>
                {priorityLabels[task.priority]}
              </Badge>

              {task.concepts.map((tc) => (
                <Badge key={tc.concept.id} variant="outline" className="text-xs">
                  {tc.concept.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/tasks/${task.id}`} className="cursor-pointer">
                  <Play className="h-4 w-4 mr-2" />
                  Ver Detalhes
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/tasks/${task.id}/edit`} className="cursor-pointer">
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="px-2 py-1">
                <GenerateFlashcardsButton task={task} />
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isPending}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Deletar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
