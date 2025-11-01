import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const concept = await prisma.concept.findUnique({
      where: { id },
      include: {
        studyGoal: true,
        resources: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        tasks: {
          include: {
            task: {
              include: {
                sessions: true
              }
            }
          },
          orderBy: {
            task: {
              createdAt: 'desc'
            }
          }
        },
        flashcards: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            tasks: true,
            flashcards: true,
            resources: true
          }
        }
      }
    });

    if (!concept) {
      return NextResponse.json(
        { error: 'Conceito não encontrado' },
        { status: 404 }
      );
    }

    // Calcular tempo total de estudo
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalStudyTime = concept.tasks.reduce((acc: number, tc: any) => {
      const taskTime = tc.task.sessions.reduce(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (sum: number, session: any) => sum + session.duration,
        0
      );
      return acc + taskTime;
    }, 0);

    return NextResponse.json({
      ...concept,
      totalStudyTime
    });
  } catch (error) {
    console.error('Erro ao buscar conceito:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar conceito' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { name, description, category, studyGoalId } = body;

    // Verificar se existe
    const existing = await prisma.concept.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Conceito não encontrado' },
        { status: 404 }
      );
    }

    // Se mudar o nome, verificar duplicata
    if (name && name !== existing.name) {
      const duplicate = await prisma.concept.findUnique({
        where: { name }
      });

      if (duplicate) {
        return NextResponse.json(
          { error: 'Já existe um conceito com este nome' },
          { status: 409 }
        );
      }
    }

    const concept = await prisma.concept.update({
      where: { id },
      data: {
        name: name || existing.name,
        description: description !== undefined ? description : existing.description,
        category: category !== undefined ? category : existing.category,
        studyGoalId: studyGoalId !== undefined ? studyGoalId : existing.studyGoalId
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

    return NextResponse.json(concept);
  } catch (error) {
    console.error('Erro ao atualizar conceito:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar conceito' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Verificar se existe
    const concept = await prisma.concept.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            tasks: true,
            flashcards: true,
            resources: true
          }
        }
      }
    });

    if (!concept) {
      return NextResponse.json(
        { error: 'Conceito não encontrado' },
        { status: 404 }
      );
    }

    // Avisar se houver relacionamentos (mas permitir delete devido ao onDelete: Cascade/SetNull)
    const hasRelations =
      concept._count.tasks > 0 ||
      concept._count.flashcards > 0 ||
      concept._count.resources > 0;

    await prisma.concept.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Conceito removido com sucesso',
      id,
      hadRelations: hasRelations
    });
  } catch (error) {
    console.error('Erro ao remover conceito:', error);
    return NextResponse.json(
      { error: 'Erro ao remover conceito' },
      { status: 500 }
    );
  }
}
