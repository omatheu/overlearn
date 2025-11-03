// src/components/overview/pending-flashcards.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Brain, Zap } from 'lucide-react';
import prisma from '@/lib/db/prisma';
import Link from 'next/link';
import { connection } from 'next/server';

async function getFlashcardStats() {
  await connection(); // Opt out of static generation
  const now = new Date();

  // Flashcards pendentes (nunca revisados ou que estão prontos para revisar)
  const pending = await prisma.flashcard.count({
    where: {
      OR: [
        { nextReview: null },
        { nextReview: { lte: now } }
      ]
    }
  });

  // Total de flashcards
  const total = await prisma.flashcard.count();

  // Flashcards revisados hoje
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const reviewedToday = await prisma.flashcardReview.count({
    where: {
      createdAt: { gte: today }
    }
  });

  return {
    pending,
    total,
    reviewedToday
  };
}

export async function PendingFlashcards() {
  const stats = await getFlashcardStats();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Flashcards</CardTitle>
        <Link href="/flashcards" className="text-sm text-blue-600 hover:underline">
          Ver todos
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.pending}
            </div>
            <div className="text-xs text-muted-foreground">Pendentes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.reviewedToday}
            </div>
            <div className="text-xs text-muted-foreground">Hoje</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.total}
            </div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>

        {/* Call to Action */}
        {stats.pending > 0 ? (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Brain className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-semibold text-sm">
                  Você tem {stats.pending} flashcards para revisar!
                </p>
                <p className="text-xs text-muted-foreground">
                  A revisão espaçada ajuda a fixar o conhecimento
                </p>
              </div>
            </div>
            <Link href="/flashcards/review">
              <Button className="w-full" size="sm">
                <Zap className="h-4 w-4 mr-2" />
                Começar Revisão
              </Button>
            </Link>
          </div>
        ) : (
          <div className="text-center py-6">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhum flashcard pendente! 🎉
            </p>
            <Link href="/flashcards/new">
              <Button variant="outline" size="sm" className="mt-3">
                Criar Novo Flashcard
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}