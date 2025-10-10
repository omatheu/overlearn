import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/db/prisma';
import { TaskCard } from '@/components/tasks/task-card';
import { TaskFilters } from '@/components/tasks/task-filters';

type SearchParams = {
  search?: string;
  status?: string;
  priority?: string;
  sort?: string;
};

async function getTasks(params: SearchParams) {
  const profile = await prisma.userProfile.findFirst();

  if (!profile) return [];

  // Build where clause
  const where: {
    userProfileId: string;
    OR?: Array<{ title?: { contains: string; mode: string }; description?: { contains: string; mode: string } }>;
    status?: string;
    priority?: string;
  } = {
    userProfileId: profile.id,
  };

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } }
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

      return tasks.sort((a, b) => {
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
  searchParams: SearchParams;
}) {
  const tasks = await getTasks(searchParams);

  return (
    <div className="container max-w-6xl py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tasks</h1>
          <p className="text-muted-foreground">
            Gerencie suas tarefas e acompanhe o progresso
          </p>
        </div>
        <Link href="/tasks/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Task
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <TaskFilters />
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Nenhuma task encontrada</h3>
          <p className="text-muted-foreground mb-4">
            {searchParams.search || searchParams.status || searchParams.priority
              ? 'Tente ajustar os filtros de busca'
              : 'Comece criando sua primeira task'}
          </p>
          {!searchParams.search && !searchParams.status && !searchParams.priority && (
            <Link href="/tasks/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Task
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
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
        </div>
      )}

      {/* Stats */}
      {tasks.length > 0 && (
        <div className="mt-8 pt-6 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">
                {tasks.filter((t) => t.status === 'todo').length}
              </div>
              <div className="text-sm text-muted-foreground">A Fazer</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {tasks.filter((t) => t.status === 'doing').length}
              </div>
              <div className="text-sm text-muted-foreground">Em Progresso</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {tasks.filter((t) => t.status === 'done').length}
              </div>
              <div className="text-sm text-muted-foreground">Concluídas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {tasks.filter((t) => t.status === 'blocked').length}
              </div>
              <div className="text-sm text-muted-foreground">Bloqueadas</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
