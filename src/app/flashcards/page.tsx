import { PageLayout, PageHeader, PageContent } from "@/components/layout";
import { EmptyState } from "@/components/ui/empty-state";
import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function FlashcardsPage() {
  return (
    <PageLayout maxWidth="xl">
      <PageHeader
        title="Flashcards"
        description="Revise e memorize conceitos com repetição espaçada"
        action={
          <Link href="/flashcards/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Flashcard
            </Button>
          </Link>
        }
      />

      <PageContent>
        <EmptyState
          icon={BookOpen}
          title="Nenhum Flashcard Criado"
          description="Comece criando flashcards para revisar conceitos importantes"
        >
          <Link href="/flashcards/new">
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Flashcard
            </Button>
          </Link>
        </EmptyState>
      </PageContent>
    </PageLayout>
  );
}
