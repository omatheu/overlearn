// src/app/api/overview/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

type Period = 'yesterday' | 'week' | 'month';

function getDateRange(period: Period) {
  const now = new Date();
  const startDate = new Date();
  const endDate = new Date();

  switch (period) {
    case 'yesterday':
      startDate.setDate(now.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(now.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'week':
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'month':
      startDate.setDate(now.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
  }

  return { startDate, endDate };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = (searchParams.get('period') as Period) || 'yesterday';

    const { startDate, endDate } = getDateRange(period);

    // Buscar tasks completadas no período
    const completedTasks = await prisma.task.count({
      where: {
        status: 'done',
        updatedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Buscar sessões de estudo no período
    const studySessions = await prisma.studySession.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        duration: true,
        type: true,
      },
    });

    // Calcular tempo total de foco (em minutos)
    const totalFocusTime = studySessions.reduce((total, session) => {
      return total + session.duration;
    }, 0);

    // Contar número de sessões
    const sessionCount = studySessions.length;

    // Contar sessões por tipo
    const pomodoroSessions = studySessions.filter(s => s.type === 'pomodoro').length;
    const studySessionsCount = studySessions.filter(s => s.type === 'study').length;
    const reviewSessions = studySessions.filter(s => s.type === 'review').length;

    return NextResponse.json({
      period,
      completedTasks,
      totalFocusTime,
      sessionCount,
      breakdown: {
        pomodoro: pomodoroSessions,
        study: studySessionsCount,
        review: reviewSessions,
      },
    });
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
