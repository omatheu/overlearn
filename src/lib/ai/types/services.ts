import { 
  FlashcardGenerationRequest, 
  FlashcardGenerationResult,
  ConceptExplanationRequest,
  ConceptExplanationResult,
  ProgressAnalysisRequest,
  ProgressAnalysisResult,
  StudyPlanRequest,
  StudyPlanResult
} from './operations';

// Interface principal para geração de flashcards
export interface IFlashcardGenerator {
  generateFlashcards(request: FlashcardGenerationRequest): Promise<FlashcardGenerationResult>;
  validateRequest(request: FlashcardGenerationRequest): boolean;
  estimateCost(request: FlashcardGenerationRequest): number;
}

// Interface para explicação de conceitos
export interface IConceptExplainer {
  explainConcept(request: ConceptExplanationRequest): Promise<ConceptExplanationResult>;
  getRelatedConcepts(concept: string): Promise<string[]>;
  validateConcept(concept: string): boolean;
}

// Interface para análise de progresso
export interface IProgressAnalyzer {
  analyzeProgress(request: ProgressAnalysisRequest): Promise<ProgressAnalysisResult>;
  generateRecommendations(userId: string): Promise<string[]>;
  calculateConfidenceScore(userId: string, topic: string): Promise<number>;
}

// Interface para geração de planos de estudo
export interface IStudyPlanGenerator {
  generateStudyPlan(request: StudyPlanRequest): Promise<StudyPlanResult>;
  adjustPlan(planId: string, feedback: string): Promise<StudyPlanResult>;
  validatePlan(plan: unknown): boolean;
}

// Interface principal do serviço de IA
export interface IAIService {
  flashcardGenerator: IFlashcardGenerator;
  conceptExplainer: IConceptExplainer;
  progressAnalyzer: IProgressAnalyzer;
  studyPlanGenerator: IStudyPlanGenerator;
  
  // Métodos utilitários
  isAvailable(): Promise<boolean>;
  getUsageStats(): Promise<{
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    lastRequest: Date;
  }>;
}
