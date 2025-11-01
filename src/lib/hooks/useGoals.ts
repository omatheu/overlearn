import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface StudyGoal {
  id: string;
  title: string;
  description: string | null;
  targetDate: string | null;
  status: string;
  userProfileId: string;
  createdAt: string;
  updatedAt: string;
  tasks?: Array<{
    id: string;
    title: string;
    status: string;
    completedAt: string | null;
    sessions?: Array<{
      duration: number;
    }>;
  }>;
  concepts?: Array<{
    id: string;
    name: string;
  }>;
  _count?: {
    tasks: number;
    concepts: number;
  };
  progress?: number;
  totalTasks?: number;
  completedTasks?: number;
  totalStudyTime?: number;
}

export function useGoals() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: async (): Promise<StudyGoal[]> => {
      const res = await fetch('/api/goals');
      if (!res.ok) throw new Error('Failed to fetch goals');
      return res.json();
    }
  });
}

export function useGoal(id: string) {
  return useQuery({
    queryKey: ['goal', id],
    queryFn: async (): Promise<StudyGoal> => {
      const res = await fetch(`/api/goals/${id}`);
      if (!res.ok) throw new Error('Failed to fetch goal');
      return res.json();
    },
    enabled: !!id
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      targetDate?: string;
      status?: string;
    }): Promise<StudyGoal> => {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create goal');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    }
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      title?: string;
      description?: string;
      targetDate?: string;
      status?: string;
    }): Promise<StudyGoal> => {
      const res = await fetch(`/api/goals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update goal');
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goal', data.id] });
    }
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<{ message: string; id: string; hadRelations: boolean }> => {
      const res = await fetch(`/api/goals/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete goal');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    }
  });
}
