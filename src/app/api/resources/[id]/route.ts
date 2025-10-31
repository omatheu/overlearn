import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { title, isRead } = body;

    const resource = await prisma.resource.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        isRead: isRead !== undefined ? isRead : undefined
      },
      include: {
        concept: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json(resource);
  } catch (error) {
    console.error('Erro ao atualizar recurso:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar recurso' },
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

    await prisma.resource.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Recurso removido com sucesso',
      id
    });
  } catch (error) {
    console.error('Erro ao remover recurso:', error);
    return NextResponse.json(
      { error: 'Erro ao remover recurso' },
      { status: 500 }
    );
  }
}
