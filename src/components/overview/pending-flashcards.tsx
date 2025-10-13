// src/components/overview/pending-flashcards.tsx
'use client';

import Link from 'next/link';
import { Brain, ArrowRight, Clock } from 'lucide-react';
import { PendingFlashcard } from '@/lib/hooks/useOverview';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PendingFlashcardsProps {
  flashcards: PendingFlashcard[];
}

export function PendingFlashcards({ flashcards }: PendingFlashcardsProps) {
  if (flashcards.length === 0) {
    return (
      <EmptyState
        icon={Brain}
        title="Nenhum flashcard pendente"
        description="Você está em dia com suas revisões! 🎉"
      >
        <Link
          href="/flashcards"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          Ver todos os flashcards
          <ArrowRight className="h-4 w-4" />
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-3">
      {flashcards.slice(0, 5).map((card) => (
        <div
          key={card.id}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-2">
                {card.question}
              </p>
              <div className="flex items-center gap-3 text-xs">
                {card.concept && (
                  <span className="px-2 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-md">
                    {card.concept}
                  </span>
                )}
                {card.nextReview && (
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(card.nextReview), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                )}
                <span className="text-gray-500 dark:text-gray-400">
                  {card.repetitions}x revisado
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {flashcards.length > 5 && (
        <Link
          href="/flashcards"
          className="block text-center py-3 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
        >
          Ver mais {flashcards.length - 5} flashcards →
        </Link>
      )}
    </div>
  );
}
