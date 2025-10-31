import { notFound } from 'next/navigation';
import prisma from '@/lib/db/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TaskStatusBadge } from '@/components/tasks/task-status-badge';
import { DeleteButton } from '@/components/tasks/delete-button';
import { GenerateFlashcardsDialog } from '@/components/flashcards/generate-flashcards-dialog';
import { ChevronLeft, Pencil, Clock, Calendar, Tag } from 'lucide-react';
import Link from 'next/link';
import { deleteTaskAction } from '@/app/tasks/actions';
import { PageLayout, PageContent, Section } from '@/components/layout';
import { Stack } from '@/components/layout';
import { PriorityBadge } from '@/components/ui/priority-badge';

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
    (acc: number, session: { duration: number }) => acc + session.duration,
    0
  );

  return (
    <PageLayout maxWidth="lg">
      {/* Header */}
      <div className="mb-6">
        <Stack direction="horizontal" spacing={4} justify="between" align="center">
          <Link href="/tasks">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar para Tasks
            </Button>
          </Link>

          <Stack direction="horizontal" spacing={2}>
            <GenerateFlashcardsDialog
              taskId={task.id}
              defaultTopic={task.title}
            />

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
          </Stack>
        </Stack>
      </div>

      <PageContent>
        {/* Main Card */}
        <Section>
          <Card>
            <CardHeader>
              <div className="space-y-4">
                <CardTitle className="text-2xl">{task.title}</CardTitle>
                <Stack direction="horizontal" spacing={2}>
                  <TaskStatusBadge status={task.status as 'todo' | 'doing' | 'done' | 'blocked'} />
                  <PriorityBadge priority={task.priority as 'low' | 'medium' | 'high' | 'urgent'} />
                </Stack>
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
                    {task.concepts.map((tc: { concept: { id: string; name: string } }) => (
                      <Badge key={tc.concept.id} variant="outline">
                        {tc.concept.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </Section>

        {/* Study Sessions */}
        {task.sessions.length > 0 && (
          <Section title="Sessões de Estudo">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Tempo Total Estudado</div>
                  <div className="text-3xl font-bold">
                    {Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}min
                  </div>
                </div>

                <Stack direction="vertical" spacing={2}>
                  {task.sessions.map((session: { id: string; type: string; duration: number; createdAt: Date }) => (
                    <div
                      key={session.id}
                      className="flex justify-between items-center p-3 rounded-lg border hover:bg-accent/50 transition-colors"
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
                </Stack>
              </CardContent>
            </Card>
          </Section>
        )}
      </PageContent>
    </PageLayout>
  );
}
