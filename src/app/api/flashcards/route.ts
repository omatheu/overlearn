// src/app/api/flashcards/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter');

    let whereClause = {};

    // Filtrar flashcards vencidos (nextReview <= agora)
    if (filter === 'due') {
      whereClause = {
        nextReview: {
          lte: new Date(),
        },
      };
    }

    const flashcards = await prisma.flashcard.findMany({
      where: whereClause,
      include: {
        task: {
          select: {
            title: true,
          },
        },
        concept: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        nextReview: 'asc',
      },
    });

    // Formatar resposta
    const formattedFlashcards = flashcards.map(card => ({
      id: card.id,
      question: card.question,
      answer: card.answer,
      nextReview: card.nextReview,
      easeFactor: card.easeFactor,
      interval: card.interval,
      repetitions: card.repetitions,
      task: card.task?.title,
      concept: card.concept?.name,
      isDue: card.nextReview ? card.nextReview <= new Date() : false,
    }));

    return NextResponse.json(formattedFlashcards);
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flashcards' },
      { status: 500 }
    );
  }
}
