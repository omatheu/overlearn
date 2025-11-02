/**
 * Application-wide constants
 *
 * Centralized location for magic numbers and configuration values
 * used throughout the application.
 */

/**
 * Pomodoro Timer Settings
 */
export const POMODORO = {
  /** Default work session duration in minutes */
  WORK_DURATION: 25,
  /** Default short break duration in minutes */
  SHORT_BREAK: 5,
  /** Default long break duration in minutes */
  LONG_BREAK: 15,
  /** Number of work sessions before long break */
  SESSIONS_BEFORE_LONG_BREAK: 4,
} as const;

/**
 * Pagination Settings
 */
export const PAGINATION = {
  /** Default page size for list views */
  DEFAULT_PAGE_SIZE: 50,
  /** Maximum allowed page size */
  MAX_PAGE_SIZE: 100,
  /** Page sizes available in dropdowns */
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const;

/**
 * Query Limits
 */
export const QUERY_LIMITS = {
  /** Maximum number of recent reviews to fetch per flashcard */
  MAX_RECENT_REVIEWS: 5,
  /** Maximum number of tags to show before "show more" */
  MAX_VISIBLE_TAGS: 3,
  /** Maximum number of recent notes to show in widget */
  MAX_RECENT_NOTES: 5,
  /** Maximum number of upcoming tasks to show in overview */
  MAX_UPCOMING_TASKS: 10,
} as const;

/**
 * Form Validation Limits
 */
export const VALIDATION = {
  /** Maximum length for task title */
  MAX_TASK_TITLE_LENGTH: 200,
  /** Maximum length for flashcard question */
  MAX_FLASHCARD_QUESTION_LENGTH: 500,
  /** Maximum length for flashcard answer */
  MAX_FLASHCARD_ANSWER_LENGTH: 1000,
  /** Maximum length for note content */
  MAX_NOTE_CONTENT_LENGTH: 10000,
  /** Maximum length for concept name */
  MAX_CONCEPT_NAME_LENGTH: 100,
  /** Maximum length for concept description */
  MAX_CONCEPT_DESCRIPTION_LENGTH: 500,
  /** Maximum length for tag name */
  MAX_TAG_NAME_LENGTH: 50,
} as const;

/**
 * Focus Score Range
 */
export const FOCUS_SCORE = {
  /** Minimum focus score */
  MIN: 1,
  /** Maximum focus score */
  MAX: 10,
  /** Default focus score */
  DEFAULT: 7,
} as const;

/**
 * Task Priority Levels
 */
export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

/**
 * Task Status Values
 */
export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
  CANCELLED: 'cancelled',
} as const;

/**
 * Study Session Types
 */
export const SESSION_TYPE = {
  STUDY: 'study',
  WORK: 'work',
  REVIEW: 'review',
  BREAK: 'break',
} as const;

/**
 * Resource Types
 */
export const RESOURCE_TYPE = {
  VIDEO: 'video',
  ARTICLE: 'article',
  DOCUMENTATION: 'documentation',
  TUTORIAL: 'tutorial',
  BOOK: 'book',
  OTHER: 'other',
} as const;

/**
 * Date Format Patterns
 */
export const DATE_FORMAT = {
  /** Display format for dates */
  DISPLAY: 'MMM d, yyyy',
  /** Display format for dates with time */
  DISPLAY_WITH_TIME: 'MMM d, yyyy HH:mm',
  /** ISO format for API */
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
} as const;

/**
 * API Error Messages
 */
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Acesso não autorizado',
  NOT_FOUND: 'Recurso não encontrado',
  VALIDATION_ERROR: 'Erro de validação',
  INTERNAL_ERROR: 'Erro interno do servidor',
  INVALID_DATE: 'Data inválida',
  DUPLICATE: 'Registro duplicado',
} as const;

/**
 * AI Generation Settings
 */
export const AI = {
  /** Minimum number of concepts to generate */
  MIN_CONCEPTS: 2,
  /** Maximum number of concepts to generate */
  MAX_CONCEPTS: 5,
  /** Default number of concepts to generate */
  DEFAULT_CONCEPTS: 3,
} as const;
