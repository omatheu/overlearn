// Tipos básicos do domínio de IA
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type AIModel = 'flash' | 'pro';
export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type FlashcardSource = 'manual' | 'ai_generated';
export type ConceptCategory = 'technical' | 'theoretical' | 'practical' | 'general';

// Tipos para configuração de IA
export interface AIConfig {
  model: AIModel;
  maxTokens: number;
  temperature: number;
  timeout: number;
}

// Tipos para contexto do usuário
export interface UserContext {
  userId: string;
  learningLevel: Difficulty;
  preferredLanguage: 'pt' | 'en';
  studyPreferences: {
    includeExamples: boolean;
    focusOnPractical: boolean;
    preferShortAnswers: boolean;
  };
}
