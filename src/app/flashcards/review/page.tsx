'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Trophy } from 'lucide-react';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  task?: {
    id: string;
    title: string;
    concepts: Array<{
      concept: {
        id: string;
        name: string;
      };
    }>;
  };
  concept?: {
    id: string;
    name: string;
  };
}

export default function FlashcardReviewPage() {
  const router = useRouter();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);

  // Carregar flashcards
  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const response = await fetch('/api/flashcards?filter=due');
        if (!response.ok) throw new Error('Failed to fetch flashcards');
        const data = await response.json();
        setFlashcards(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlashcards();
  }, []);

  if (isLoading) {
    return (
      <div className="container max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Carregando flashcards...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-red-500">Erro ao carregar flashcards: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="container max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Trophy className="h-16 w-16 text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-2">Tudo revisado! 🎉</h2>
            <p className="text-muted-foreground mb-6 text-center">
              Não há flashcards para revisar agora.
            </p>
            <div className="flex gap-3">
              <Button onClick={() => router.push('/flashcards')}>
                Ver Todos os Flashcards
              </Button>
              <Button variant="outline" onClick={() => router.push('/overview')}>
                Voltar ao Overview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const current = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  const handleQuality = async (quality: number) => {
    setIsReviewing(true);
    try {
      const response = await fetch(`/api/flashcards/${current.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quality, timeSpent: 30 })
      });
      
      if (!response.ok) throw new Error('Failed to review flashcard');
      
      // Próximo card ou finalizar
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(i => i + 1);
        setShowAnswer(false);
      } else {
        // Finalizou todos!
        router.push('/overview');
      }
    } catch (error) {
      console.error('Erro ao revisar:', error);
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Revisão de Flashcards</h1>
        <Badge variant="secondary">
          {currentIndex + 1} / {flashcards.length}
        </Badge>
      </div>
      
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progresso</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      {/* Flashcard */}
      <Card className="min-h-[400px] border-2">
        <CardHeader>
          <CardTitle className="text-center text-sm text-muted-foreground">
            {showAnswer ? '💡 Resposta' : '❓ Pergunta'}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center px-12 pb-12">
          {/* Texto do card */}
          <div className="text-center text-2xl font-medium mb-12 max-w-2xl leading-relaxed">
            {showAnswer ? current.answer : current.question}
          </div>
          
          {/* Botões de ação */}
          {!showAnswer ? (
            <Button
              size="lg"
              onClick={() => setShowAnswer(true)}
              className="gap-2 px-8"
            >
              Mostrar Resposta
              <RotateCcw className="h-4 w-4" />
            </Button>
          ) : (
            <div className="w-full space-y-4">
              <p className="text-sm text-center text-muted-foreground mb-6">
                Como foi sua resposta?
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleQuality(1)}
                  disabled={isReviewing}
                  className="h-auto py-4 flex-col gap-2 hover:border-red-500"
                >
                  <span className="text-2xl">😰</span>
                  <span className="text-sm font-medium">Não lembrei</span>
                  <span className="text-xs text-muted-foreground">Reiniciar</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleQuality(3)}
                  disabled={isReviewing}
                  className="h-auto py-4 flex-col gap-2 hover:border-orange-500"
                >
                  <span className="text-2xl">🤔</span>
                  <span className="text-sm font-medium">Difícil</span>
                  <span className="text-xs text-muted-foreground">1 dia</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleQuality(4)}
                  disabled={isReviewing}
                  className="h-auto py-4 flex-col gap-2 hover:border-blue-500"
                >
                  <span className="text-2xl">😊</span>
                  <span className="text-sm font-medium">Bom</span>
                  <span className="text-xs text-muted-foreground">6 dias</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleQuality(5)}
                  disabled={isReviewing}
                  className="h-auto py-4 flex-col gap-2 hover:border-green-500"
                >
                  <span className="text-2xl">🎯</span>
                  <span className="text-sm font-medium">Fácil</span>
                  <span className="text-xs text-muted-foreground">Mais tempo</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Info do flashcard */}
      {current.task && (
        <Card className="border-dashed">
          <CardContent className="p-4 text-sm">
            <div className="flex flex-col gap-2">
              <div>
                <span className="text-muted-foreground">Relacionado à: </span>
                <span className="font-medium">{current.task.title}</span>
              </div>
              {current.task.concepts && current.task.concepts.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Conceitos: </span>
                  <span className="font-medium">
                    {current.task.concepts.map((c: { concept: { name: string } }) => c.concept.name).join(', ')}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}