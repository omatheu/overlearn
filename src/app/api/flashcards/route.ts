import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter');
    const taskId = searchParams.get('taskId');
    const conceptId = searchParams.get('conceptId');
    
    const now = new Date();
    
    let where: Record<string, unknown> = {};
    
    // Filtro: apenas flashcards vencidos (due)
    if (filter === 'due') {
      where = {
        OR: [
          { nextReview: null },
          { nextReview: { lte: now } }
        ]
      };
    }
    
    // Filtro: por task específica
    if (taskId) {
      where.taskId = taskId;
    }
    
    // Filtro: por conceito específico
    if (conceptId) {
      where.conceptId = conceptId;
    }
    
    const flashcards = await prisma.flashcard.findMany({
      where,
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
        concept: true,
        reviews: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 5 // Últimas 5 revisões
        }
      },
      orderBy: {
        nextReview: 'asc'
      }
    });
    
    return NextResponse.json(flashcards);
  } catch (error) {
    console.error('Erro ao buscar flashcards:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question, answer, taskId, conceptId, source = 'manual' } = body;
    
    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Pergunta e resposta são obrigatórias' },
        { status: 400 }
      );
    }
    
    // Se não tem taskId nem conceptId, precisa de pelo menos um
    if (!taskId && !conceptId) {
      return NextResponse.json(
        { error: 'Flashcard deve estar vinculado a uma task ou conceito' },
        { status: 400 }
      );
    }
    
    const flashcard = await prisma.flashcard.create({
      data: {
        question,
        answer,
        taskId: taskId || null,
        conceptId: conceptId || null,
        source,
        nextReview: new Date() // Primeira revisão pode ser imediatamente
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
    });
    
    return NextResponse.json(flashcard);
  } catch (error) {
    console.error('Erro ao criar flashcard:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}