import { notFound } from 'next/navigation';
import prisma from '@/lib/db/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TaskStatusBadge } from '@/components/tasks/task-status-badge';
import { DeleteButton } from '@/components/tasks/delete-button';
import { ChevronLeft, Pencil, Clock, Calendar, Tag } from 'lucide-react';
import Link from 'next/link';
import { deleteTaskAction } from '@/app/tasks/actions';

async function getTask(id: string) {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      concepts: {
        include: {
          concept: true
        }
      },
      sessions: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      }
    }
  });

  return task;
}

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

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task = await getTask(id);

  if (!task) {
    notFound();
  }

  const totalStudyTime = task.sessions.reduce(
    (acc, session) => acc + session.duration,
    0
  );

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/tasks">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para Tasks
          </Button>
        </Link>

        <div className="flex gap-2">
          <Link href={`/tasks/${task.id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>

          <form action={deleteTaskAction}>
            <input type="hidden" name="id" value={task.id} />
            <DeleteButton />
          </form>
        </div>
      </div>

      {/* Main Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-3">{task.title}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <TaskStatusBadge status={task.status as 'todo' | 'doing' | 'done' | 'blocked'} />
                <Badge variant={priorityColors[task.priority as keyof typeof priorityColors]}>
                  {priorityLabels[task.priority as keyof typeof priorityLabels]}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Description */}
          {task.description && (
            <div>
              <h3 className="font-semibold mb-2">Descrição</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-muted-foreground">Criada em</div>
                <div className="font-semibold">
                  {new Date(task.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>

            {task.completedAt && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-muted-foreground">Concluída em</div>
                  <div className="font-semibold">
                    {new Date(task.completedAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Concepts */}
          {task.concepts.length > 0 && (
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">Conceitos Relacionados</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {task.concepts.map((tc) => (
                  <Badge key={tc.concept.id} variant="outline">
                    {tc.concept.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Study Sessions */}
      {task.sessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sessões de Estudo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Tempo Total Estudado</div>
              <div className="text-2xl font-bold">
                {Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}min
              </div>
            </div>

            <div className="space-y-2">
              {task.sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex justify-between items-center p-3 rounded-lg border"
                >
                  <div>
                    <div className="font-medium">
                      {new Date(session.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(session.createdAt).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {session.duration} min
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
