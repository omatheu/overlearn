import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(tags);
  } catch (error) {
    console.error('Erro ao buscar tags:', error);
    return NextResponse.json({ error: 'Erro ao buscar tags' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, color } = body;

    const existing = await prisma.tag.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json({ error: 'Tag já existe' }, { status: 409 });
    }

    const tag = await prisma.tag.create({
      data: { name, color: color || null }
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar tag:', error);
    return NextResponse.json({ error: 'Erro ao criar tag' }, { status: 500 });
  }
}
