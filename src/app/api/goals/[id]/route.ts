import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const goal = await prisma.studyGoal.findUnique({
      where: { id },
      include: {
        userProfile: true,
        tasks: {
          include: {
            concepts: {
              include: {
                concept: true
              }
            },
            sessions: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        concepts: {
          include: {
            resources: true,
            flashcards: true,
            tasks: {
              include: {
                task: true
              }
            }
          }
        },
        _count: {
          select: {
            tasks: true,
            concepts: true
          }
        }
      }
    });

    if (!goal) {
      return NextResponse.json(
        { error: 'Meta não encontrada' },
        { status: 404 }
      );
    }

    // Calcular estatísticas
    const totalTasks = goal.tasks.length;
    const completedTasks = goal.tasks.filter((t) => t.status === 'done').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calcular tempo total de estudo
    const totalStudyTime = goal.tasks.reduce((acc, task) => {
      const taskTime = task.sessions.reduce((sum, session) => sum + session.duration, 0);
      return acc + taskTime;
    }, 0);

    return NextResponse.json({
      ...goal,
      progress,
      totalTasks,
      completedTasks,
      totalStudyTime
    });
  } catch (error) {
    console.error('Erro ao buscar meta:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar meta' },
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
    const { title, description, targetDate, status } = body;

    // Verificar se existe
    const existing = await prisma.studyGoal.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Meta não encontrada' },
        { status: 404 }
      );
    }

    const goal = await prisma.studyGoal.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        description: description !== undefined ? description : existing.description,
        targetDate: targetDate !== undefined ? (targetDate ? new Date(targetDate) : null) : existing.targetDate,
        status: status !== undefined ? status : existing.status
      },
      include: {
        _count: {
          select: {
            tasks: true,
            concepts: true
          }
        }
      }
    });

    return NextResponse.json(goal);
  } catch (error) {
    console.error('Erro ao atualizar meta:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar meta' },
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
    const goal = await prisma.studyGoal.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            tasks: true,
            concepts: true
          }
        }
      }
    });

    if (!goal) {
      return NextResponse.json(
        { error: 'Meta não encontrada' },
        { status: 404 }
      );
    }

    await prisma.studyGoal.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Meta removida com sucesso',
      id,
      hadRelations: goal._count.tasks > 0 || goal._count.concepts > 0
    });
  } catch (error) {
    console.error('Erro ao remover meta:', error);
    return NextResponse.json(
      { error: 'Erro ao remover meta' },
      { status: 500 }
    );
  }
}
