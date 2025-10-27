// src/components/overview/daily-overview.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, BookOpen, Play, Plus, Target, Brain } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/db/prisma';

type TaskWithConcepts = {
  id: string;
  title: string;
  priority: string;
  concepts: Array<{ concept: { name: string } }>;
};

type FlashcardWithRelations = {
  id: string;
  question: string;
  task: { title: string } | null;
  concept: { name: string } | null;
};

async function getDailyContext() {
  // Buscar dados do usuário
  const profile = await prisma.userProfile.findFirst();
  
  if (!profile) return null;

  // Tasks pendentes
  const pendingTasks = await prisma.task.findMany({
    where: {
      userProfileId: profile.id,
      status: { in: ['todo', 'doing'] }
    },
    include: {
      concepts: {
        include: { concept: true }
      }
    },
    take: 5,
    orderBy: { createdAt: 'desc' }
  });

  // Flashcards pendentes (próximos a revisar)
  const pendingFlashcards = await prisma.flashcard.findMany({
    where: {
      OR: [
        { nextReview: null },
        { nextReview: { lte: new Date() } }
      ]
    },
    include: {
      task: true,
      concept: true
    },
    orderBy: {
      nextReview: 'asc'
    },
    take: 5
  });

  const totalPendingFlashcards = await prisma.flashcard.count({
    where: {
      OR: [
        { nextReview: null },
        { nextReview: { lte: new Date() } }
      ]
    }
  });

  // Estatísticas de flashcards
  const totalFlashcards = await prisma.flashcard.count();
  const wellKnownFlashcards = await prisma.flashcard.count({
    where: {
      easeFactor: { gte: 2.5 },
      repetitions: { gte: 3 }
    }
  });

  // Tempo de estudo ontem
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  
  const yesterdayEnd = new Date(yesterday);
  yesterdayEnd.setHours(23, 59, 59, 999);

  const studySessions = await prisma.studySession.aggregate({
    where: {
      userProfileId: profile.id,
      createdAt: {
        gte: yesterday,
        lte: yesterdayEnd
      },
      type: 'study'
    },
    _sum: {
      duration: true
    }
  });

  return {
    profile,
    pendingTasks,
    pendingFlashcards,
    totalPendingFlashcards,
    totalFlashcards,
    wellKnownFlashcards,
    studyTimeYesterday: studySessions._sum.duration || 0
  };
}

export async function DailyOverview() {
  const context = await getDailyContext();

  if (!context) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bem-vindo!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Configure seu perfil para começar
          </p>
        </CardContent>
      </Card>
    );
  }

  const { 
    pendingTasks, 
    pendingFlashcards, 
    totalPendingFlashcards,
    totalFlashcards,
    wellKnownFlashcards,
    studyTimeYesterday 
  } = context;

  return (
    <div className="space-y-6">
      {/* Overview Principal */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <CardTitle>Overview do Dia</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mensagem motivacional */}
          <div className="prose dark:prose-invert">
            <p className="text-lg">
              Bom dia! 👋 Você tem <strong>{pendingTasks.length} tarefas</strong> pendentes
              e <strong>{totalPendingFlashcards} flashcards</strong> para revisar.
            </p>
            {studyTimeYesterday > 0 && (
              <p className="text-sm text-muted-foreground">
                Ontem você estudou por {studyTimeYesterday} minutos. Continue assim! 🚀
              </p>
            )}
          </div>

          {/* Próximas tarefas */}
          {pendingTasks.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Prioridades de Hoje:</h3>
              <div className="space-y-2">
                {pendingTasks.slice(0, 3).map((task: TaskWithConcepts) => (
                  <div key={task.id} className="flex items-center gap-2 text-sm">
                    <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'}>
                      {task.priority}
                    </Badge>
                    <span className="flex-1">{task.title}</span>
                    {task.concepts.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {task.concepts[0].concept.name}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seção de Flashcards */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              <CardTitle>Flashcards</CardTitle>
            </div>
            <div className="flex gap-2">
              {totalPendingFlashcards > 0 && (
                <Button asChild size="sm">
                  <Link href="/flashcards/review">
                    <Play className="h-4 w-4 mr-2" />
                    Revisar Agora
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" size="sm">
                <Link href="/flashcards/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Estatísticas */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalFlashcards}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{totalPendingFlashcards}</div>
              <div className="text-sm text-muted-foreground">Pendentes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{wellKnownFlashcards}</div>
              <div className="text-sm text-muted-foreground">Dominados</div>
            </div>
          </div>

          {/* Próximos flashcards para revisar */}
          {pendingFlashcards.length > 0 ? (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Target className="h-4 w-4" />
                Próximos para revisar:
              </h3>
              <div className="space-y-2">
                {pendingFlashcards.slice(0, 3).map((flashcard: FlashcardWithRelations) => (
                  <div key={flashcard.id} className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded">
                    <Brain className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 font-medium">{flashcard.question}</span>
                    <Badge variant="outline" className="text-xs">
                      {flashcard.task?.title || flashcard.concept?.name || 'Geral'}
                    </Badge>
                  </div>
                ))}
                {pendingFlashcards.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{pendingFlashcards.length - 3} mais flashcards pendentes
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Brain className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Nenhum flashcard pendente! 🎉
              </p>
              <p className="text-xs text-muted-foreground">
                Continue criando novos flashcards para acelerar seu aprendizado
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}