import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const goals = await prisma.studyGoal.findMany({
      include: {
        userProfile: true,
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            completedAt: true
          }
        },
        concepts: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            tasks: true,
            concepts: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calcular progresso para cada meta
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const goalsWithProgress = goals.map((goal: any) => {
      const totalTasks = goal.tasks.length;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const completedTasks = goal.tasks.filter((t: any) => t.status === 'done').length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        ...goal,
        progress,
        totalTasks,
        completedTasks
      };
    });

    return NextResponse.json(goalsWithProgress);
  } catch (error) {
    console.error('Erro ao buscar metas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar metas' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, targetDate, status } = body;

    // Validação
    if (!title) {
      return NextResponse.json(
        { error: 'Título é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar o perfil do usuário
    const profile = await prisma.userProfile.findFirst();

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil de usuário não encontrado' },
        { status: 404 }
      );
    }

    const goal = await prisma.studyGoal.create({
      data: {
        title,
        description: description || null,
        targetDate: targetDate ? new Date(targetDate) : null,
        status: status || 'active',
        userProfileId: profile.id
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

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar meta:', error);
    return NextResponse.json(
      { error: 'Erro ao criar meta' },
      { status: 500 }
    );
  }
}
