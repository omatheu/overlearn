import { TaskForm } from '@/components/tasks/task-form';
import prisma from '@/lib/db/prisma';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
    <div className="container max-w-3xl py-8">
      <div className="mb-6">
        <Link href="/tasks">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para Tasks
          </Button>
        </Link>
      </div>

      <TaskForm concepts={concepts} />
    </div>
  );
}
