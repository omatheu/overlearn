import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const note = await prisma.note.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true
          }
        },
        task: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    if (!note) {
      return NextResponse.json({ error: 'Nota não encontrada' }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error('Erro ao buscar nota:', error);
    return NextResponse.json({ error: 'Erro ao buscar nota' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { title, content, taskId, tagIds } = body;

    // First, delete existing tag associations
    await prisma.noteTag.deleteMany({
      where: { noteId: id }
    });

    // Update the note with new data and tag associations
    const note = await prisma.note.update({
      where: { id },
      data: {
        title,
        content,
        taskId: taskId || null,
        tags: tagIds && tagIds.length > 0 ? {
          create: tagIds.map((tagId: string) => ({
            tag: { connect: { id: tagId } }
          }))
        } : undefined
      },
      include: {
        tags: { include: { tag: true } },
        task: { select: { id: true, title: true } }
      }
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error('Erro ao atualizar nota:', error);
    return NextResponse.json({ error: 'Erro ao atualizar nota' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.note.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar nota:', error);
    return NextResponse.json({ error: 'Erro ao deletar nota' }, { status: 500 });
  }
}
