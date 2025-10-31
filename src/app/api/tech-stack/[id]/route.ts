import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// PUT - Atualizar tecnologia
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { technology, category, proficiencyLevel } = body;

    const updatedTech = await prisma.techStack.update({
      where: { id },
      data: {
        technology,
        category,
        proficiencyLevel
      }
    });

    return NextResponse.json(updatedTech);
  } catch (error) {
    console.error('Erro ao atualizar tecnologia:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar tecnologia' },
      { status: 500 }
    );
  }
}

// DELETE - Remover tecnologia
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.techStack.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Tecnologia removida com sucesso',
      id
    });
  } catch (error) {
    console.error('Erro ao remover tecnologia:', error);
    return NextResponse.json(
      { error: 'Erro ao remover tecnologia' },
      { status: 500 }
    );
  }
}
