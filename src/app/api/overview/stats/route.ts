// src/app/api/overview/stats/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { cacheLife, cacheTag } from 'next/cache';
import { prisma } from '@/lib/db/prisma';

type Period = 'yesterday' | 'week' | 'month';

type StudySession = {
  duration: number;
  type: string;
};

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

async function getStats(period: Period) {
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
  const totalFocusTime = studySessions.reduce((total: number, session: StudySession) => {
    return total + session.duration;
  }, 0);

  // Contar número de sessões
  const sessionCount = studySessions.length;

  // Contar sessões por tipo
  const pomodoroSessions = studySessions.filter((s: StudySession) => s.type === 'pomodoro').length;
  const studySessionsCount = studySessions.filter((s: StudySession) => s.type === 'study').length;
  const reviewSessions = studySessions.filter((s: StudySession) => s.type === 'review').length;

  return {
    period,
    completedTasks,
    totalFocusTime,
    sessionCount,
    breakdown: {
      pomodoro: pomodoroSessions,
      study: studySessionsCount,
      review: reviewSessions,
    },
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const periodParam = searchParams.get('period');
    const period = (periodParam as Period | null) ?? 'yesterday';

    const stats = await getStats(period);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
