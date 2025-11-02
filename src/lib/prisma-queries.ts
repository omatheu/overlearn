/**
 * Reusable Prisma Query Patterns
 *
 * Centralized include/select patterns to maintain consistency
 * and reduce code duplication across API routes.
 */

import { Prisma } from '@prisma/client';
import { QUERY_LIMITS } from './constants/app';

/**
 * Task query includes
 */
export const TASK_INCLUDES = {
  /** Basic task with concepts */
  withConcepts: {
    concepts: {
      include: {
        concept: true,
      },
    },
  } satisfies Prisma.TaskInclude,

  /** Task with concepts and sessions */
  withConceptsAndSessions: {
    concepts: {
      include: {
        concept: true,
      },
    },
    sessions: {
      orderBy: {
        createdAt: 'desc' as const,
      },
    },
  } satisfies Prisma.TaskInclude,

  /** Full task details */
  full: {
    concepts: {
      include: {
        concept: {
          include: {
            studyGoal: true,
          },
        },
      },
    },
    sessions: {
      orderBy: {
        createdAt: 'desc' as const,
      },
    },
    flashcards: {
      select: {
        id: true,
        question: true,
        nextReview: true,
      },
    },
    notes: {
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc' as const,
      },
    },
  } satisfies Prisma.TaskInclude,
} as const;

/**
 * Flashcard query includes
 */
export const FLASHCARD_INCLUDES = {
  /** Basic flashcard with task and concept */
  basic: {
    task: {
      select: {
        id: true,
        title: true,
        status: true,
      },
    },
    concept: {
      select: {
        id: true,
        name: true,
        category: true,
      },
    },
  } satisfies Prisma.FlashcardInclude,

  /** Flashcard with recent reviews */
  withReviews: {
    task: {
      select: {
        id: true,
        title: true,
        status: true,
      },
    },
    concept: {
      select: {
        id: true,
        name: true,
        category: true,
      },
    },
    reviews: {
      orderBy: {
        createdAt: 'desc' as const,
      },
      take: QUERY_LIMITS.MAX_RECENT_REVIEWS,
    },
  } satisfies Prisma.FlashcardInclude,

  /** Full flashcard with all relations */
  full: {
    task: {
      include: {
        concepts: {
          include: {
            concept: true,
          },
        },
      },
    },
    concept: true,
    reviews: {
      orderBy: {
        createdAt: 'desc' as const,
      },
      take: QUERY_LIMITS.MAX_RECENT_REVIEWS,
    },
  } satisfies Prisma.FlashcardInclude,
} as const;

/**
 * Concept query includes
 */
export const CONCEPT_INCLUDES = {
  /** Basic concept with study goal */
  basic: {
    studyGoal: {
      select: {
        id: true,
        title: true,
        status: true,
      },
    },
    _count: {
      select: {
        tasks: true,
        flashcards: true,
        resources: true,
      },
    },
  } satisfies Prisma.ConceptInclude,

  /** Concept with resources and counts */
  withResources: {
    studyGoal: true,
    resources: {
      orderBy: {
        createdAt: 'desc' as const,
      },
    },
    _count: {
      select: {
        tasks: true,
        flashcards: true,
        resources: true,
      },
    },
  } satisfies Prisma.ConceptInclude,

  /** Full concept details with all relations */
  full: {
    studyGoal: true,
    resources: {
      orderBy: {
        createdAt: 'desc' as const,
      },
    },
    tasks: {
      include: {
        task: {
          include: {
            sessions: true,
          },
        },
      },
      orderBy: {
        task: {
          createdAt: 'desc' as const,
        },
      },
    },
    flashcards: {
      orderBy: {
        createdAt: 'desc' as const,
      },
    },
    _count: {
      select: {
        tasks: true,
        flashcards: true,
        resources: true,
      },
    },
  } satisfies Prisma.ConceptInclude,
} as const;

/**
 * Note query includes
 */
export const NOTE_INCLUDES = {
  /** Basic note with tags and task */
  basic: {
    tags: {
      include: {
        tag: true,
      },
    },
    task: {
      select: {
        id: true,
        title: true,
      },
    },
  } satisfies Prisma.NoteInclude,

  /** Full note details */
  full: {
    tags: {
      include: {
        tag: true,
      },
    },
    task: {
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
      },
    },
  } satisfies Prisma.NoteInclude,
} as const;

/**
 * StudyGoal query includes
 */
export const STUDY_GOAL_INCLUDES = {
  /** Basic study goal with concepts */
  basic: {
    concepts: {
      select: {
        id: true,
        name: true,
      },
    },
    _count: {
      select: {
        concepts: true,
      },
    },
  } satisfies Prisma.StudyGoalInclude,

  /** Full study goal details */
  full: {
    concepts: {
      include: {
        tasks: {
          include: {
            task: {
              include: {
                sessions: true,
              },
            },
          },
        },
        flashcards: true,
        _count: {
          select: {
            tasks: true,
            flashcards: true,
            resources: true,
          },
        },
      },
    },
    _count: {
      select: {
        concepts: true,
      },
    },
  } satisfies Prisma.StudyGoalInclude,
} as const;

/**
 * StudySession query includes
 */
export const SESSION_INCLUDES = {
  /** Basic session with task */
  basic: {
    task: {
      select: {
        id: true,
        title: true,
      },
    },
  } satisfies Prisma.StudySessionInclude,

  /** Full session details */
  full: {
    task: {
      include: {
        concepts: {
          include: {
            concept: true,
          },
        },
      },
    },
  } satisfies Prisma.StudySessionInclude,
} as const;

/**
 * Common order by patterns
 */
export const ORDER_BY = {
  createdDesc: { createdAt: 'desc' as const },
  createdAsc: { createdAt: 'asc' as const },
  updatedDesc: { updatedAt: 'desc' as const },
  updatedAsc: { updatedAt: 'asc' as const },
  nameAsc: { name: 'asc' as const },
  titleAsc: { title: 'asc' as const },
} as const;
