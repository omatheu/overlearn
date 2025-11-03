import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';
import { addDays } from 'date-fns';
import {
  SM2_DEFAULT_EASE_FACTOR,
  SM2_FIRST_INTERVAL,
  SM2_QUALITY,
  calculateEaseFactor,
  calculateInterval,
  isValidQuality,
} from '@/lib/constants/sm2';
import { FLASHCARD_INCLUDES } from '@/lib/prisma-queries';

/**
 * Algoritmo SM-2 (SuperMemo 2) para repetição espaçada
 * Implementação baseada na especificação do SISTEMA_FLASHCARDS.md
 */
function calculateNextReview(quality: number, currentData: {
  easeFactor?: number;
  interval?: number;
  repetitions?: number;
}) {
  const {
    easeFactor = SM2_DEFAULT_EASE_FACTOR,
    interval = SM2_FIRST_INTERVAL,
    repetitions = 0
  } = currentData;

  // Validate quality score
  if (!isValidQuality(quality)) {
    throw new Error(`Invalid quality score: ${quality}. Must be between 0-5.`);
  }

  // Calculate new ease factor using helper
  const newEaseFactor = calculateEaseFactor(easeFactor, quality);

  // Calculate new interval using helper
  const newInterval = calculateInterval(interval, repetitions, newEaseFactor, quality);

  // Update repetitions count
  const newRepetitions = quality < SM2_QUALITY.CORRECT_DIFFICULT ? 0 : repetitions + 1;

  // Calculate next review date
  const nextReview = addDays(new Date(), newInterval);

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
      include: FLASHCARD_INCLUDES.basic,
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
        include: FLASHCARD_INCLUDES.full,
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
