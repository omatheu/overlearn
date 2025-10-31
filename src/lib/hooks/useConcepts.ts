import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Concept {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  studyGoalId: string | null;
  createdAt: string;
  updatedAt: string;
  studyGoal?: {
    id: string;
    title: string;
    status: string;
  } | null;
  resources?: Array<{
    id: string;
    url: string;
    title: string | null;
    type: string;
    isRead: boolean;
  }>;
  tasks?: Array<{
    task: {
      id: string;
      title: string;
      status: string;
      priority: string;
      sessions?: Array<{
        duration: number;
      }>;
    };
  }>;
  flashcards?: Array<{
    id: string;
    question: string;
  }>;
  _count?: {
    tasks: number;
    flashcards: number;
    resources: number;
  };
  totalStudyTime?: number;
}

export function useConcepts() {
  return useQuery({
    queryKey: ['concepts'],
    queryFn: async (): Promise<Concept[]> => {
      const res = await fetch('/api/concepts');
      if (!res.ok) throw new Error('Failed to fetch concepts');
      return res.json();
    }
  });
}

export function useConcept(id: string) {
  return useQuery({
    queryKey: ['concept', id],
    queryFn: async (): Promise<Concept> => {
      const res = await fetch(`/api/concepts/${id}`);
      if (!res.ok) throw new Error('Failed to fetch concept');
      return res.json();
    },
    enabled: !!id
  });
}

export function useCreateConcept() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      category?: string;
      studyGoalId?: string;
    }): Promise<Concept> => {
      const res = await fetch('/api/concepts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create concept');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['concepts'] });
    }
  });
}

export function useUpdateConcept() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      description?: string;
      category?: string;
      studyGoalId?: string;
    }): Promise<Concept> => {
      const res = await fetch(`/api/concepts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update concept');
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['concepts'] });
      queryClient.invalidateQueries({ queryKey: ['concept', data.id] });
    }
  });
}

export function useDeleteConcept() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<{ message: string; id: string; hadRelations: boolean }> => {
      const res = await fetch(`/api/concepts/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete concept');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['concepts'] });
    }
  });
}
