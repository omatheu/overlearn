import { PageLayout, PageHeader } from '@/components/layout/page-layout';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NewFlashcardPage() {
  return (
    <PageLayout maxWidth="2xl">
      <PageHeader
        title="Novo flashcard"
        description="Crie um novo flashcard para memorização"
        action={
          <Link href="/flashcards">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
          </Link>
        }
      />

      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400 text-center">
          Funcionalidade em desenvolvimento...
        </p>
      </div>
    </PageLayout>
  );
}
