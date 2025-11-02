import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Note {
  id: string;
  title: string | null;
  content: string;
  taskId: string | null;
  userProfileId: string;
  createdAt: string;
  updatedAt: string;
  tags: Array<{
    id: string;
    tag: {
      id: string;
      name: string;
      color: string | null;
    };
  }>;
  task?: {
    id: string;
    title: string;
  };
}

export function useNotes() {
  return useQuery({
    queryKey: ['notes'],
    queryFn: async (): Promise<Note[]> => {
      const res = await fetch('/api/notes');
      if (!res.ok) throw new Error('Failed to fetch notes');
      return res.json();
    }
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title?: string;
      content: string;
      taskId?: string;
      tagIds?: string[];
    }): Promise<Note> => {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create note');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    }
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      title?: string;
      content: string;
      taskId?: string;
      tagIds?: string[];
    }): Promise<Note> => {
      const { id, ...updateData } = data;
      const res = await fetch(`/api/notes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update note');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    }
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete note');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    }
  });
}
