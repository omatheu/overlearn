// src/app/api/overview/today/route.ts
import { NextResponse } from 'next/server';
import { startOfDay, endOfDay } from 'date-fns';
import { prisma } from '@/lib/db/prisma';
import { TASK_INCLUDES } from '@/lib/prisma-queries';

type TaskConcept = {
  concept: {
    name: string;
  };
};

type TaskWithRelations = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  scheduledDate: Date | null;
  estimatedTime: number | null;
  studyGoal: { title: string } | null;
  concepts: TaskConcept[];
};

type FormattedTask = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  scheduledDate: Date | null;
  estimatedTime: number | null;
  studyGoal: string | undefined;
  concepts: string[];
};

export async function GET() {
  try {
    const now = new Date();
    const dayStart = startOfDay(now);
    const dayEnd = endOfDay(now);

    // Buscar tasks agendadas para hoje
    const todayTasks = await prisma.task.findMany({
      where: {
        scheduledDate: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      include: {
        studyGoal: {
          select: {
            title: true,
          },
        },
        ...TASK_INCLUDES.withConcepts,
      },
      orderBy: [
        { priority: 'desc' },
        { scheduledDate: 'asc' },
      ],
    });

    // Formatar resposta
    const formattedTasks: FormattedTask[] = todayTasks.map((task: TaskWithRelations) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      scheduledDate: task.scheduledDate,
      estimatedTime: task.estimatedTime,
      studyGoal: task.studyGoal?.title,
      concepts: task.concepts.map((tc: TaskConcept) => tc.concept.name),
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
