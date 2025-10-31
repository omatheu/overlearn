import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const conceptId = searchParams.get('conceptId');

    const resources = await prisma.resource.findMany({
      where: conceptId ? { conceptId } : undefined,
      include: {
        concept: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(resources);
  } catch (error) {
    console.error('Erro ao buscar recursos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar recursos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, title, type, conceptId } = body;

    // Validação
    if (!url || !type || !conceptId) {
      return NextResponse.json(
        { error: 'URL, tipo e conceito são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o conceito existe
    const concept = await prisma.concept.findUnique({
      where: { id: conceptId }
    });

    if (!concept) {
      return NextResponse.json(
        { error: 'Conceito não encontrado' },
        { status: 404 }
      );
    }

    // Verificar duplicata
    const existing = await prisma.resource.findUnique({
      where: {
        conceptId_url: {
          conceptId,
          url
        }
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Este recurso já foi adicionado a este conceito' },
        { status: 409 }
      );
    }

    const resource = await prisma.resource.create({
      data: {
        url,
        title: title || null,
        type,
        conceptId
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

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar recurso:', error);
    return NextResponse.json(
      { error: 'Erro ao criar recurso' },
      { status: 500 }
    );
  }
}
