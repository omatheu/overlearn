import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FlashcardGenerationRequest, 
  GeneratedFlashcard
} from '@/lib/ai/types';

interface GenerateFlashcardsResponse {
  flashcards: GeneratedFlashcard[];
  metadata: {
    processingTime: number;
    model: string;
    tokensUsed: number;
    cost: number;
    timestamp: string;
  };
}

export function useGenerateFlashcards() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: FlashcardGenerationRequest): Promise<GenerateFlashcardsResponse> => {
      const response = await fetch('/api/ai/flashcards/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao gerar flashcards');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
      queryClient.invalidateQueries({ queryKey: ['overview'] });
    },
  });
}

export function useEstimateFlashcardCost() {
  return useMutation({
    mutationFn: async (params: {
      topic: string;
      difficulty: 'beginner' | 'intermediate' | 'advanced';
      count: number;
    }): Promise<{ estimatedCost: number; currency: string; model: string }> => {
      const searchParams = new URLSearchParams({
        topic: params.topic,
        difficulty: params.difficulty,
        count: params.count.toString(),
      });

      const response = await fetch(`/api/ai/flashcards/generate?${searchParams}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao estimar custo');
      }

      return response.json();
    },
  });
}
