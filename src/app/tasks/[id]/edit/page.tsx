import { notFound } from 'next/navigation';
import prisma from '@/lib/db/prisma';
import { TaskForm } from '@/components/tasks/task-form';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageLayout, PageHeader } from '@/components/layout/page-layout';

async function getTask(id: string) {
  const task = await prisma.task.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      concepts: {
        include: {
          concept: true
        }
      }
    }
  });

  return task;
}

async function getConcepts() {
  return await prisma.concept.findMany({
    orderBy: {
      name: 'asc'
    }
  });
}

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [task, concepts] = await Promise.all([
    getTask(id),
    getConcepts()
  ]);

  if (!task) {
    notFound();
  }

  return (
    <PageLayout maxWidth="2xl">
      <PageHeader
        title="Editar tarefa"
        description="Atualize as informações da tarefa"
        action={
          <Link href={`/tasks/${task.id}`}>
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
          </Link>
        }
      />

      <TaskForm
        task={task as {
          id: string;
          title: string;
          description: string | null;
          status: 'todo' | 'doing' | 'done' | 'blocked';
          priority: 'low' | 'medium' | 'high' | 'urgent';
          concepts: { concept: { id: string; name: string } }[];
        }}
        concepts={concepts}
      />
    </PageLayout>
  );
}
