import { PageLayout, PageHeader } from '@/components/layout/page-layout';
import { ChevronLeft, Brain } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

export default function FlashcardsReviewPage() {
  return (
    <PageLayout maxWidth="2xl">
      <PageHeader
        title="Revisar flashcards"
        description="Revise seus flashcards para fortalecer a memória"
        action={
          <Link href="/flashcards">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
          </Link>
        }
      />

      <EmptyState
        icon={Brain}
        title="Sistema de revisão em desenvolvimento"
        description="Em breve você poderá revisar seus flashcards com o algoritmo de repetição espaçada."
      />
    </PageLayout>
  );
}
