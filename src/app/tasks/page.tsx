import { Button } from '@/components/ui/button';
import { Plus, ListTodo } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/db/prisma';
import { TaskCard } from '@/components/tasks/task-card';
import { TaskFilters } from '@/components/tasks/task-filters';
import { PageLayout, PageHeader, PageContent, Section } from '@/components/layout';
import { Grid, Stack } from '@/components/layout';
import { EmptyState } from '@/components/ui/empty-state';
import { Card } from '@/components/ui/card';

type SearchParams = {
  search?: string;
  status?: string;
  priority?: string;
  sort?: string;
};

type TaskWithConcepts = {
  id: string;
  priority: string;
  [key: string]: unknown;
};

async function getTasks(params: SearchParams) {
  const profile = await prisma.userProfile.findFirst();

  if (!profile) return [];

  // Build where clause
  const where: {
    userProfileId: string;
    OR?: Array<{ title?: { contains: string }; description?: { contains: string } }>;
    status?: string;
    priority?: string;
  } = {
    userProfileId: profile.id,
  };

  if (params.search) {
    where.OR = [
      { title: { contains: params.search } },
      { description: { contains: params.search } }
    ];
  }

  if (params.status && params.status !== 'all') {
    where.status = params.status;
  }

  if (params.priority && params.priority !== 'all') {
    where.priority = params.priority;
  }

  // Build orderBy
  let orderBy: { createdAt?: 'desc' | 'asc'; title?: 'desc' | 'asc' } = { createdAt: 'desc' };

  if (params.sort) {
    const [field, order] = params.sort.split('-');

    if (field === 'priority') {
      // Custom priority order
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const tasks = await prisma.task.findMany({
        where,
        include: {
          concepts: {
            include: {
              concept: true
            }
          }
        }
      });

      return tasks.sort((a: TaskWithConcepts, b: TaskWithConcepts) => {
        const orderA = priorityOrder[a.priority as keyof typeof priorityOrder];
        const orderB = priorityOrder[b.priority as keyof typeof priorityOrder];
        return order === 'asc' ? orderA - orderB : orderB - orderA;
      });
    } else {
      orderBy = { [field]: order };
    }
  }

  return await prisma.task.findMany({
    where,
    include: {
      concepts: {
        include: {
          concept: true
        }
      }
    },
    orderBy
  });
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const tasks = await getTasks(params);

  const hasFilters = params.search || params.status || params.priority;

  return (
    <PageLayout maxWidth="xl">
      <PageHeader
        title="Tasks"
        description="Gerencie suas tarefas e acompanhe o progresso"
        action={
          <Link href="/tasks/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Task
            </Button>
          </Link>
        }
      />

      <PageContent>
        {/* Filters */}
        <Section>
          <TaskFilters />
        </Section>

        {/* Task List */}
        <Section>
          {tasks.length === 0 ? (
            <EmptyState
              icon={ListTodo}
              title={hasFilters ? "Nenhuma task encontrada" : "Nenhuma task criada"}
              description={
                hasFilters
                  ? "Tente ajustar os filtros de busca"
                  : "Comece criando sua primeira task e organize seu trabalho"
              }
            >
              {!hasFilters && (
                <Link href="/tasks/new">
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Task
                  </Button>
                </Link>
              )}
            </EmptyState>
          ) : (
            <Stack direction="vertical" spacing={3}>
              {tasks.map((task: TaskWithConcepts) => (
                <TaskCard
                  key={task.id}
                  task={task as {
                    id: string;
                    title: string;
                    description: string | null;
                    status: 'todo' | 'doing' | 'done' | 'blocked';
                    priority: 'low' | 'medium' | 'high' | 'urgent';
                    createdAt: Date;
                    concepts: { concept: { id: string; name: string } }[];
                  }}
                />
              ))}
            </Stack>
          )}
        </Section>

        {/* Stats */}
        {tasks.length > 0 && (
          <Section title="Estatísticas">
            <Grid cols={{ default: 2, md: 4 }} gap={4}>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-foreground mb-1">
                  {tasks.filter((t) => t.status === 'todo').length}
                </div>
                <div className="text-sm text-muted-foreground">A Fazer</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {tasks.filter((t) => t.status === 'doing').length}
                </div>
                <div className="text-sm text-muted-foreground">Em Progresso</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {tasks.filter((t) => t.status === 'done').length}
                </div>
                <div className="text-sm text-muted-foreground">Concluídas</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-red-600 mb-1">
                  {tasks.filter((t) => t.status === 'blocked').length}
                </div>
                <div className="text-sm text-muted-foreground">Bloqueadas</div>
              </Card>
            </Grid>
          </Section>
        )}
      </PageContent>
    </PageLayout>
  );
}
