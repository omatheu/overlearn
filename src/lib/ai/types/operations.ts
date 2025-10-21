import { Difficulty, AIModel } from './domain';
import { GeneratedFlashcard, ConceptExplanation, ProgressAnalysis, StudyPlan } from './entities';

// Operações de entrada para geração de flashcards
export interface FlashcardGenerationRequest {
  taskId?: string;
  conceptId?: string;
  topic: string;
  difficulty: Difficulty;
  count: number;
  userContext?: string;
  preferences?: {
    includeExamples: boolean;
    focusOnPractical: boolean;
    preferShortAnswers: boolean;
  };
}

// Operações de entrada para explicação de conceitos
export interface ConceptExplanationRequest {
  concept: string;
  level: Difficulty;
  userContext?: string;
  includeExamples?: boolean;
  includePracticalApplications?: boolean;
}

// Operações de entrada para análise de progresso
export interface ProgressAnalysisRequest {
  userId: string;
  timeRange: string; // 'week', 'month', 'quarter'
  includeRecommendations?: boolean;
}

// Operações de entrada para geração de plano de estudo
export interface StudyPlanRequest {
  topics: string[];
  currentLevel: Difficulty;
  targetLevel: Difficulty;
  availableTime: number; // minutos por dia
  deadline?: Date;
}

// Resultado padrão para todas as operações de IA
export interface AIOperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata: {
    processingTime: number;
    model: AIModel;
    tokensUsed: number;
    cost: number;
    timestamp: Date;
  };
}

// Resultado específico para geração de flashcards
export type FlashcardGenerationResult = AIOperationResult<GeneratedFlashcard[]>;

// Resultado específico para explicação de conceitos
export type ConceptExplanationResult = AIOperationResult<ConceptExplanation>;

// Resultado específico para análise de progresso
export type ProgressAnalysisResult = AIOperationResult<ProgressAnalysis>;

// Resultado específico para plano de estudo
export type StudyPlanResult = AIOperationResult<StudyPlan>;
