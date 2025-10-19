import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const concepts = await prisma.concept.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(concepts);
  } catch (error) {
    console.error('Erro ao buscar concepts:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
