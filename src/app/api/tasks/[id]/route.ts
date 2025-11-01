import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/tasks/[id] - Buscar task por ID
export async function GET(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        concepts: {
          include: {
            concept: true
          }
        },
        flashcards: true,
        studyGoal: true
      }
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Erro ao buscar task:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[id] - Atualizar task
export async function PUT(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validações básicas
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

    // Verificar se a task existe
    const existingTask = await prisma.task.findUnique({
      where: { id }
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task não encontrada' },
        { status: 404 }
      );
    }

    // Preparar dados para atualização
    const updateData: {
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
      type?: string;
      dueDate?: Date | null;
      scheduledDate?: Date | null;
      estimatedTime?: number | null;
      completedAt?: Date | null;
      studyGoalId?: string | null;
    } = {};

    if (body.title) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status) {
      updateData.status = body.status;
      // Se mudou para "done", marcar data de conclusão
      if (body.status === 'done' && existingTask.status !== 'done') {
        updateData.completedAt = new Date();
      }
      // Se mudou de "done" para outro status, limpar data de conclusão
      if (body.status !== 'done' && existingTask.status === 'done') {
        updateData.completedAt = null;
      }
    }
    if (body.priority) updateData.priority = body.priority;
    if (body.type) updateData.type = body.type;
    if (body.dueDate !== undefined) {
      updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    }
    if (body.scheduledDate !== undefined) {
      updateData.scheduledDate = body.scheduledDate ? new Date(body.scheduledDate) : null;
    }
    if (body.estimatedTime !== undefined) updateData.estimatedTime = body.estimatedTime;
    if (body.studyGoalId !== undefined) updateData.studyGoalId = body.studyGoalId;

    // Atualizar task
    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        concepts: {
          include: {
            concept: true
          }
        },
        flashcards: true,
        studyGoal: true
      }
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Erro ao atualizar task:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Deletar task
export async function DELETE(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    // Verificar se a task existe
    const existingTask = await prisma.task.findUnique({
      where: { id }
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task não encontrada' },
        { status: 404 }
      );
    }

    // Deletar task (relacionamentos em cascade serão deletados automaticamente)
    await prisma.task.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Task deletada com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao deletar task:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PATCH /api/tasks/[id] - Atualização parcial (alias para PUT)
export async function PATCH(
  request: Request,
  { params }: RouteParams
) {
  return PUT(request, { params });
}
