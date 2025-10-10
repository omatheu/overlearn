// src/components/overview/daily-overview.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import prisma from '@/lib/db/prisma';

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
  const pendingFlashcards = await prisma.flashcard.count({
    where: {
      OR: [
        { nextReview: null },
        { nextReview: { lte: new Date() } }
      ]
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

  const { pendingTasks, pendingFlashcards, studyTimeYesterday } = context;

  return (
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
            e <strong>{pendingFlashcards} flashcards</strong> para revisar.
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
              {pendingTasks.slice(0, 3).map(task => (
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
  );
}