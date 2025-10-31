import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface StudySession {
  id: string;
  type: string;
  duration: number;
  notes: string | null;
  focusScore: number | null;
  taskId: string | null;
  userProfileId: string;
  createdAt: string;
  task?: {
    id: string;
    title: string;
  };
}

export function useSessions(taskId?: string) {
  return useQuery({
    queryKey: ['sessions', taskId],
    queryFn: async (): Promise<StudySession[]> => {
      const url = taskId ? `/api/sessions?taskId=${taskId}` : '/api/sessions';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch sessions');
      return res.json();
    }
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      type: string;
      duration: number;
      taskId?: string;
      notes?: string;
      focusScore?: number;
    }): Promise<StudySession> => {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create session');
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      if (data.taskId) {
        queryClient.invalidateQueries({ queryKey: ['sessions', data.taskId] });
      }
      queryClient.invalidateQueries({ queryKey: ['overview'] });
    }
  });
}
