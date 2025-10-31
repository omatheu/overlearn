import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET - Buscar perfil do usuário
export async function GET() {
  try {
    // Por enquanto, busca o primeiro perfil (single-user app)
    let profile = await prisma.userProfile.findFirst({
      include: {
        techStack: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    // Se não existir, criar um perfil padrão
    if (!profile) {
      profile = await prisma.userProfile.create({
        data: {
          name: 'Usuário',
          workHoursStart: '09:00',
          workHoursEnd: '18:00',
          pomodoroMinutes: 25,
          breakMinutes: 5,
        },
        include: {
          techStack: true
        }
      });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar perfil' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar perfil do usuário
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      yearsOfExperience,
      currentRole,
      professionalGoal,
      workHoursStart,
      workHoursEnd,
      pomodoroMinutes,
      breakMinutes,
    } = body;

    // Buscar o primeiro perfil
    const existingProfile = await prisma.userProfile.findFirst();

    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar perfil
    const updatedProfile = await prisma.userProfile.update({
      where: { id: existingProfile.id },
      data: {
        name,
        email,
        yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
        currentRole,
        professionalGoal,
        workHoursStart,
        workHoursEnd,
        pomodoroMinutes: pomodoroMinutes ? parseInt(pomodoroMinutes) : 25,
        breakMinutes: breakMinutes ? parseInt(breakMinutes) : 5,
      },
      include: {
        techStack: true
      }
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar perfil' },
      { status: 500 }
    );
  }
}
