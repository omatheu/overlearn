import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

// GET /api/tasks - Listar todas as tasks
export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        concepts: {
          include: {
            concept: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Erro ao buscar tasks:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Criar nova task
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validações
    if (!body.title || body.title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Título é obrigatório' },
        { status: 400 }
      );
    }

    if (body.status && !['todo', 'doing', 'done', 'blocked'].includes(body.status)) {
      return NextResponse.json(
        { error: 'Status inválido' },
        { status: 400 }
      );
    }

    if (body.priority && !['low', 'medium', 'high', 'urgent'].includes(body.priority)) {
      return NextResponse.json(
        { error: 'Prioridade inválida' },
        { status: 400 }
      );
    }

    if (body.type && !['work', 'study', 'personal'].includes(body.type)) {
      return NextResponse.json(
        { error: 'Tipo inválido' },
        { status: 400 }
      );
    }

    // Buscar userProfile (assumindo single-user por enquanto)
    const userProfile = await prisma.userProfile.findFirst();

    if (!userProfile) {
      return NextResponse.json(
        { error: 'Perfil de usuário não encontrado' },
        { status: 404 }
      );
    }

    // Preparar dados para criação
    const taskData: {
      title: string;
      description?: string;
      status?: string;
      priority?: string;
      type?: string;
      dueDate?: Date;
      scheduledDate?: Date;
      estimatedTime?: number;
      userProfileId: string;
      studyGoalId?: string;
    } = {
      title: body.title.trim(),
      userProfileId: userProfile.id,
    };

    if (body.description) taskData.description = body.description;
    if (body.status) taskData.status = body.status;
    if (body.priority) taskData.priority = body.priority;
    if (body.type) taskData.type = body.type;
    if (body.dueDate) taskData.dueDate = new Date(body.dueDate);
    if (body.scheduledDate) taskData.scheduledDate = new Date(body.scheduledDate);
    if (body.estimatedTime) taskData.estimatedTime = body.estimatedTime;
    if (body.studyGoalId) taskData.studyGoalId = body.studyGoalId;

    // Criar task
    const task = await prisma.task.create({
      data: taskData,
      include: {
        concepts: {
          include: {
            concept: true
          }
        },
        studyGoal: true
      }
    });

    // Se há conceptIds, criar as relações
    if (body.conceptIds && Array.isArray(body.conceptIds)) {
      await Promise.all(
        body.conceptIds.map((conceptId: string) =>
          prisma.taskConcept.create({
            data: {
              taskId: task.id,
              conceptId,
              relevance: body.relevance || 'medium'
            }
          })
        )
      );

      // Buscar task atualizada com concepts
      const updatedTask = await prisma.task.findUnique({
        where: { id: task.id },
        include: {
          concepts: {
            include: {
              concept: true
            }
          },
          studyGoal: true
        }
      });

      return NextResponse.json(updatedTask, { status: 201 });
    }

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar task:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
