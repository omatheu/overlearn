import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const concepts = await prisma.concept.findMany({
      include: {
        studyGoal: true,
        resources: true,
        tasks: {
          include: {
            task: true
          }
        },
        flashcards: true,
        _count: {
          select: {
            tasks: true,
            flashcards: true,
            resources: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(concepts);
  } catch (error) {
    console.error('Erro ao buscar concepts:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, category, studyGoalId } = body;

    // Validação
    if (!name) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se já existe
    const existing = await prisma.concept.findUnique({
      where: { name }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Já existe um conceito com este nome' },
        { status: 409 }
      );
    }

    const concept = await prisma.concept.create({
      data: {
        name,
        description: description || null,
        category: category || null,
        studyGoalId: studyGoalId || null
      },
      include: {
        studyGoal: true,
        _count: {
          select: {
            tasks: true,
            flashcards: true,
            resources: true
          }
        }
      }
    });

    return NextResponse.json(concept, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar conceito:', error);
    return NextResponse.json(
      { error: 'Erro ao criar conceito' },
      { status: 500 }
    );
  }
}
