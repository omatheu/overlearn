import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

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
