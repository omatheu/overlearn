import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    const sessions = await prisma.studySession.findMany({
      where: taskId ? { taskId } : undefined,
      include: {
        task: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Erro ao buscar sessões:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar sessões' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, duration, taskId, notes, focusScore } = body;

    // Validação
    if (!type || !duration) {
      return NextResponse.json(
        { error: 'Tipo e duração são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar perfil
    const profile = await prisma.userProfile.findFirst();
    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }

    const session = await prisma.studySession.create({
      data: {
        type,
        duration: parseInt(duration),
        taskId: taskId || null,
        notes: notes || null,
        focusScore: focusScore ? parseInt(focusScore) : null,
        userProfileId: profile.id
      },
      include: {
        task: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar sessão:', error);
    return NextResponse.json(
      { error: 'Erro ao criar sessão' },
      { status: 500 }
    );
  }
}
