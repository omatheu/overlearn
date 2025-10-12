"use client";

import { useState, useEffect, useCallback } from "react";

export interface CalendarTask {
  id: string;
  title: string;
  description: string | null;
  scheduledDate: Date | null;
  estimatedTime: number | null;
  type: string;
  status: string;
  priority: string;
}

export function useTaskCalendar() {
  const [tasks, setTasks] = useState<CalendarTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/tasks/calendar");
      if (!response.ok) {
        throw new Error("Erro ao buscar tasks do calendário");
      }

      const data = await response.json();
      setTasks(
        data.map((task: CalendarTask) => ({
          ...task,
          scheduledDate: task.scheduledDate ? new Date(task.scheduledDate) : null,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTaskSchedule = useCallback(
    async (taskId: string, scheduledDate: Date | null, estimatedTime: number | null) => {
      try {
        const response = await fetch(`/api/tasks/${taskId}/schedule`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scheduledDate, estimatedTime }),
        });

        if (!response.ok) {
          throw new Error("Erro ao atualizar agendamento");
        }

        await fetchTasks();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        throw err;
      }
    },
    [fetchTasks]
  );

  const getTasksForDate = useCallback(
    (date: Date) => {
      return tasks.filter((task) => {
        if (!task.scheduledDate) return false;

        const taskDate = new Date(task.scheduledDate);
        return (
          taskDate.getFullYear() === date.getFullYear() &&
          taskDate.getMonth() === date.getMonth() &&
          taskDate.getDate() === date.getDate()
        );
      });
    },
    [tasks]
  );

  const getTasksForMonth = useCallback(
    (year: number, month: number) => {
      return tasks.filter((task) => {
        if (!task.scheduledDate) return false;

        const taskDate = new Date(task.scheduledDate);
        return taskDate.getFullYear() === year && taskDate.getMonth() === month;
      });
    },
    [tasks]
  );

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    updateTaskSchedule,
    getTasksForDate,
    getTasksForMonth,
  };
}
