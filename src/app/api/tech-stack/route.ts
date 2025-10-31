import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET - Listar todas as tecnologias do usuário
export async function GET() {
  try {
    const profile = await prisma.userProfile.findFirst();

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }

    const techStack = await prisma.techStack.findMany({
      where: { userProfileId: profile.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(techStack);
  } catch (error) {
    console.error('Erro ao buscar tech stack:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar tech stack' },
      { status: 500 }
    );
  }
}

// POST - Adicionar nova tecnologia
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { technology, category, proficiencyLevel } = body;

    // Validações
    if (!technology || !category || !proficiencyLevel) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: technology, category, proficiencyLevel' },
        { status: 400 }
      );
    }

    const profile = await prisma.userProfile.findFirst();

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se já existe
    const existing = await prisma.techStack.findUnique({
      where: {
        userProfileId_technology: {
          userProfileId: profile.id,
          technology: technology
        }
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Tecnologia já existe no seu stack' },
        { status: 409 }
      );
    }

    const newTech = await prisma.techStack.create({
      data: {
        technology,
        category,
        proficiencyLevel,
        userProfileId: profile.id
      }
    });

    return NextResponse.json(newTech, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar tecnologia:', error);
    return NextResponse.json(
      { error: 'Erro ao criar tecnologia' },
      { status: 500 }
    );
  }
}
