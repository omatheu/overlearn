// src/app/api/overview/today/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

type TaskWithRelations = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  scheduledDate: Date | null;
  estimatedTime: number | null;
  studyGoal: { title: string } | null;
  concepts: Array<{ concept: { name: string } }>;
};

export async function GET() {
  try {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // Buscar tasks agendadas para hoje
    const todayTasks = await prisma.task.findMany({
      where: {
        scheduledDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        studyGoal: {
          select: {
            title: true,
          },
        },
        concepts: {
          include: {
            concept: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { scheduledDate: 'asc' },
      ],
    });

    // Formatar resposta
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedTasks = todayTasks.map((task: any) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      scheduledDate: task.scheduledDate,
      estimatedTime: task.estimatedTime,
      studyGoal: task.studyGoal?.title,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      concepts: task.concepts.map((tc: any) => tc.concept.name),
    }));

    return NextResponse.json(formattedTasks);
  } catch (error) {
    console.error('Error fetching today tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch today tasks' },
      { status: 500 }
    );
  }
}
