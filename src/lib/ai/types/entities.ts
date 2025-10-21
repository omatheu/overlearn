import { Difficulty, FlashcardSource, ConceptCategory } from './domain';

// Entidades principais geradas pela IA
export interface GeneratedFlashcard {
  question: string;
  answer: string;
  difficulty: Difficulty;
  tags: string[];
  explanation?: string;
  estimatedTime: number; // segundos para responder
  source: FlashcardSource;
  category: ConceptCategory;
  relatedConcepts: string[];
}

export interface ConceptExplanation {
  summary: string;
  detailedExplanation: string;
  examples: string[];
  relatedConcepts: string[];
  practicalApplications: string[];
  commonMistakes: string[];
  difficulty: Difficulty;
  category: ConceptCategory;
}

export interface ProgressAnalysis {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  nextTopics: string[];
  estimatedTimeToMaster: number; // minutos
  confidenceScore: number; // 0-100
}

export interface StudyPlan {
  topics: StudyTopic[];
  estimatedDuration: number; // dias
  difficultyProgression: Difficulty[];
  milestones: Milestone[];
}

export interface StudyTopic {
  name: string;
  description: string;
  difficulty: Difficulty;
  estimatedTime: number; // minutos
  prerequisites: string[];
  resources: string[];
}

export interface Milestone {
  name: string;
  description: string;
  targetDate: Date;
  criteria: string[];
  isCompleted: boolean;
}
