import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const notes = await prisma.note.findMany({
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
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(notes);
  } catch (error) {
    console.error('Erro ao buscar notas:', error);
    return NextResponse.json({ error: 'Erro ao buscar notas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, taskId, tagIds } = body;
    
    const profile = await prisma.userProfile.findFirst();
    if (!profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    const note = await prisma.note.create({
      data: {
        title,
        content,
        taskId: taskId || null,
        userProfileId: profile.id,
        tags: tagIds ? {
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

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar nota:', error);
    return NextResponse.json({ error: 'Erro ao criar nota' }, { status: 500 });
  }
}
