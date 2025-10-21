import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

/**
 * Algoritmo SM-2 (SuperMemo 2) para repetição espaçada
 * Implementação baseada na especificação do SISTEMA_FLASHCARDS.md
 */
function calculateNextReview(quality: number, currentData: {
  easeFactor?: number;
  interval?: number;
  repetitions?: number;
}) {
  const { easeFactor = 2.5, interval = 1, repetitions = 0 } = currentData;
  
  // Calcular novo ease factor
  let newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  
  // Limitar ease factor mínimo
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }
  
  let newInterval: number;
  let newRepetitions: number;
  
  // Se qualidade < 3, resetar (errou)
  if (quality < 3) {
    newInterval = 1;
    newRepetitions = 0;
  } else {
    // Acertou - calcular novo intervalo
    if (repetitions === 0) {
      // Primeira repetição: 1 dia
      newInterval = 1;
    } else if (repetitions === 1) {
      // Segunda repetição: 6 dias
      newInterval = 6;
    } else {
      // Próximas: multiplicar pelo ease factor
      newInterval = Math.round(interval * newEaseFactor);
    }
    newRepetitions = repetitions + 1;
  }
  
  // Calcular próxima data de revisão
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);
  
  return {
    easeFactor: newEaseFactor,
    interval: newInterval,
    repetitions: newRepetitions,
    nextReview
  };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { quality, timeSpent } = await request.json();
    
    // Validar qualidade (0-5)
    if (quality < 0 || quality > 5) {
      return NextResponse.json(
        { error: 'Qualidade deve estar entre 0 e 5' },
        { status: 400 }
      );
    }
    
    // Buscar flashcard atual
    const { id } = await params;
    const flashcard = await prisma.flashcard.findUnique({
      where: { id },
      include: {
        task: true,
        concept: true
      }
    });
    
    if (!flashcard) {
      return NextResponse.json(
        { error: 'Flashcard não encontrado' },
        { status: 404 }
      );
    }
    
    // Calcular novos valores usando SM-2
    const newData = calculateNextReview(quality, flashcard);
    
    // Atualizar flashcard e criar registro de review em uma transação
    const [updatedFlashcard] = await prisma.$transaction([
      prisma.flashcard.update({
        where: { id },
        data: {
          easeFactor: newData.easeFactor,
          interval: newData.interval,
          repetitions: newData.repetitions,
          nextReview: newData.nextReview,
          updatedAt: new Date()
        },
        include: {
          task: {
            include: {
              concepts: {
                include: {
                  concept: true
                }
              }
            }
          },
          concept: true
        }
      }),
      prisma.flashcardReview.create({
        data: {
          flashcardId: id,
          quality,
          timeSpent: timeSpent || null
        }
      })
    ]);
    
    return NextResponse.json({
      flashcard: updatedFlashcard,
      nextReview: newData.nextReview,
      interval: newData.interval,
      easeFactor: newData.easeFactor,
      repetitions: newData.repetitions
    });
  } catch (error) {
    console.error('Erro ao processar review:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
