import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  source: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: string | null;
  createdAt: string;
  updatedAt: string;
  taskId: string | null;
  conceptId: string | null;
  task?: {
    id: string;
    title: string;
    concepts: Array<{
      concept: {
        id: string;
        name: string;
      };
    }>;
  };
  concept?: {
    id: string;
    name: string;
  };
  reviews?: Array<{
    id: string;
    quality: number;
    timeSpent: number | null;
    createdAt: string;
  }>;
}

export interface ReviewResult {
  flashcard: Flashcard;
  nextReview: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
}

export function useFlashcards(filter?: 'due' | 'all', taskId?: string, conceptId?: string) {
  return useQuery({
    queryKey: ['flashcards', filter, taskId, conceptId],
    queryFn: async (): Promise<Flashcard[]> => {
      const params = new URLSearchParams();
      if (filter) params.append('filter', filter);
      if (taskId) params.append('taskId', taskId);
      if (conceptId) params.append('conceptId', conceptId);
      
      const res = await fetch(`/api/flashcards?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch flashcards');
      return res.json();
    }
  });
}

export function useFlashcard(id: string) {
  return useQuery({
    queryKey: ['flashcard', id],
    queryFn: async (): Promise<Flashcard> => {
      const res = await fetch(`/api/flashcards/${id}`);
      if (!res.ok) throw new Error('Failed to fetch flashcard');
      return res.json();
    },
    enabled: !!id
  });
}

export function useCreateFlashcard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      question: string;
      answer: string;
      taskId?: string;
      conceptId?: string;
      source?: string;
    }): Promise<Flashcard> => {
      const res = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) throw new Error('Failed to create flashcard');
      return res.json();
    },
    onSuccess: () => {
      // Invalidar todas as queries de flashcards
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
      queryClient.invalidateQueries({ queryKey: ['overview'] });
    }
  });
}

export function useUpdateFlashcard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string;
      question?: string;
      answer?: string;
      taskId?: string;
      conceptId?: string;
      source?: string;
    }): Promise<Flashcard> => {
      const res = await fetch(`/api/flashcards/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) throw new Error('Failed to update flashcard');
      return res.json();
    },
    onSuccess: (data) => {
      // Invalidar queries específicas
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
      queryClient.invalidateQueries({ queryKey: ['flashcard', data.id] });
      queryClient.invalidateQueries({ queryKey: ['overview'] });
    }
  });
}

export function useDeleteFlashcard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<{ message: string; id: string }> => {
      const res = await fetch(`/api/flashcards/${id}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) throw new Error('Failed to delete flashcard');
      return res.json();
    },
    onSuccess: (data) => {
      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
      queryClient.invalidateQueries({ queryKey: ['flashcard', data.id] });
      queryClient.invalidateQueries({ queryKey: ['overview'] });
    }
  });
}

export function useReviewFlashcard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, quality, timeSpent }: {
      id: string;
      quality: number;
      timeSpent?: number;
    }): Promise<ReviewResult> => {
      const res = await fetch(`/api/flashcards/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quality, timeSpent })
      });
      
      if (!res.ok) throw new Error('Failed to review flashcard');
      return res.json();
    },
    onSuccess: (data) => {
      // Invalidar queries para atualizar dados
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
      queryClient.invalidateQueries({ queryKey: ['flashcard', data.flashcard.id] });
      queryClient.invalidateQueries({ queryKey: ['overview'] });
    }
  });
}

// Hook específico para revisão de flashcards
export function useFlashcardReview() {
  const { data: flashcards, isLoading, error } = useFlashcards('due');
  const reviewMutation = useReviewFlashcard();
  
  return {
    flashcards: flashcards || [],
    isLoading,
    error,
    review: reviewMutation.mutateAsync,
    isReviewing: reviewMutation.isPending,
    reviewError: reviewMutation.error
  };
}
