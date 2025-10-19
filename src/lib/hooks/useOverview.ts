// src/lib/hooks/useOverview.ts
'use client';

import { useQuery } from '@tanstack/react-query';

export interface TodayTask {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  scheduledDate: string | null;
  estimatedTime: number | null;
  studyGoal?: string;
  concepts: string[];
}

export interface PendingFlashcard {
  id: string;
  question: string;
  answer: string;
  nextReview: string | null;
  easeFactor: number;
  interval: number;
  repetitions: number;
  task?: string;
  concept?: string;
  isDue: boolean;
}

export interface OverviewStats {
  period: 'yesterday' | 'week' | 'month';
  completedTasks: number;
  totalFocusTime: number;
  sessionCount: number;
  breakdown: {
    pomodoro: number;
    study: number;
    review: number;
  };
}

// Fetch de tarefas de hoje
async function fetchTodayTasks(): Promise<TodayTask[]> {
  const response = await fetch('/api/overview/today');
  if (!response.ok) {
    throw new Error('Failed to fetch today tasks');
  }
  return response.json();
}

// Fetch de estatísticas
async function fetchStats(period: 'yesterday' | 'week' | 'month' = 'yesterday'): Promise<OverviewStats> {
  const response = await fetch(`/api/overview/stats?period=${period}`);
  if (!response.ok) {
    throw new Error('Failed to fetch stats');
  }
  return response.json();
}

// Fetch de flashcards pendentes
async function fetchPendingFlashcards(): Promise<PendingFlashcard[]> {
  const response = await fetch('/api/flashcards?filter=due');
  if (!response.ok) {
    throw new Error('Failed to fetch pending flashcards');
  }
  const data = (await response.json()) as unknown as Array<{
    id: string;
    question: string;
    answer: string;
    nextReview: string | null;
    easeFactor: number;
    interval: number;
    repetitions: number;
    task?: { title: string } | null;
    concept?: { name: string } | null;
  }>;

  const now = new Date();

  return data.map((f) => ({
    id: f.id,
    question: f.question,
    answer: f.answer,
    nextReview: f.nextReview,
    easeFactor: f.easeFactor,
    interval: f.interval,
    repetitions: f.repetitions,
    task: f.task?.title,
    concept: f.concept?.name,
    isDue: !f.nextReview || new Date(f.nextReview) <= now,
  }));
}

export function useOverview() {
  // Query para tarefas de hoje
  const todayTasksQuery = useQuery({
    queryKey: ['overview', 'today'],
    queryFn: fetchTodayTasks,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Query para estatísticas de ontem
  const statsQuery = useQuery({
    queryKey: ['overview', 'stats', 'yesterday'],
    queryFn: () => fetchStats('yesterday'),
    staleTime: 1000 * 60 * 10, // 10 minutos
  });

  // Query para flashcards pendentes
  const flashcardsQuery = useQuery({
    queryKey: ['overview', 'flashcards', 'due'],
    queryFn: fetchPendingFlashcards,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  return {
    todayTasks: {
      data: todayTasksQuery.data ?? [],
      isLoading: todayTasksQuery.isLoading,
      error: todayTasksQuery.error,
      refetch: todayTasksQuery.refetch,
    },
    stats: {
      data: statsQuery.data,
      isLoading: statsQuery.isLoading,
      error: statsQuery.error,
      refetch: statsQuery.refetch,
    },
    flashcards: {
      data: flashcardsQuery.data ?? [],
      isLoading: flashcardsQuery.isLoading,
      error: flashcardsQuery.error,
      refetch: flashcardsQuery.refetch,
    },
    isLoading: todayTasksQuery.isLoading || statsQuery.isLoading || flashcardsQuery.isLoading,
    refetchAll: () => {
      todayTasksQuery.refetch();
      statsQuery.refetch();
      flashcardsQuery.refetch();
    },
  };
}
