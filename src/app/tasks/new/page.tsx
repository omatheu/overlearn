import { TaskForm } from '@/components/tasks/task-form';
import prisma from '@/lib/db/prisma';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageLayout, PageHeader } from '@/components/layout/page-layout';

async function getConcepts() {
  return await prisma.concept.findMany({
    orderBy: {
      name: 'asc'
    }
  });
}

export default async function NewTaskPage() {
  const concepts = await getConcepts();

  return (
    <PageLayout maxWidth="2xl">
      <PageHeader
        title="Nova tarefa"
        description="Crie uma nova tarefa para gerenciar seu trabalho e estudo"
        action={
          <Link href="/tasks">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
          </Link>
        }
      />

      <TaskForm concepts={concepts} />
    </PageLayout>
  );
}
