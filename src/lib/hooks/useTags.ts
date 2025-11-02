import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Tag {
  id: string;
  name: string;
  color: string | null;
  createdAt: string;
}

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async (): Promise<Tag[]> => {
      const res = await fetch('/api/tags');
      if (!res.ok) throw new Error('Failed to fetch tags');
      return res.json();
    }
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      color?: string;
    }): Promise<Tag> => {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create tag');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    }
  });
}
