import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Resource {
  id: string;
  url: string;
  title: string | null;
  type: string;
  isRead: boolean;
  conceptId: string;
  createdAt: string;
  updatedAt: string;
  concept?: {
    id: string;
    name: string;
  };
}

export function useResources(conceptId?: string) {
  return useQuery({
    queryKey: ['resources', conceptId],
    queryFn: async (): Promise<Resource[]> => {
      const url = conceptId ? `/api/resources?conceptId=${conceptId}` : '/api/resources';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch resources');
      return res.json();
    }
  });
}

export function useAddResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      url: string;
      title?: string;
      type: string;
      conceptId: string;
    }): Promise<Resource> => {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add resource');
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['resources', data.conceptId] });
      queryClient.invalidateQueries({ queryKey: ['concept', data.conceptId] });
    }
  });
}

export function useUpdateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      title?: string;
      isRead?: boolean;
    }): Promise<Resource> => {
      const res = await fetch(`/api/resources/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error('Failed to update resource');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['resources', data.conceptId] });
      queryClient.invalidateQueries({ queryKey: ['concept', data.conceptId] });
    }
  });
}

export function useDeleteResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<{ message: string; id: string }> => {
      const res = await fetch(`/api/resources/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete resource');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['concepts'] });
    }
  });
}
