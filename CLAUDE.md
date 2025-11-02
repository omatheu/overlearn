# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**OverLearn** is a productivity and learning management application for developers. It combines task management, study goal tracking, flashcard-based spaced repetition, and AI-powered learning assistance. The application is designed to help developers balance work tasks with continuous learning and professional development.

## Tech Stack

- **Framework**: Next.js 15.5.4 with App Router and Turbopack
- **Language**: TypeScript (strict mode)
- **Database**: SQLite with Prisma ORM
- **State Management**: Jotai (atomic state management)
- **UI Components**: Radix UI primitives with Tailwind CSS v4
- **AI Integration**: Google Generative AI (Gemini models: flash and pro)
- **Forms**: React Hook Form with Zod validation

## Common Commands  

```bash
# Development
npm run dev              # Start dev server with Turbopack

# Build & Deploy
npm run build            # Production build with Turbopack
npm start                # Start production server

# Linting
npm run lint             # Run ESLint

# Database
npx prisma migrate dev   # Create and apply migrations
npx prisma db push       # Push schema changes without migrations
npx prisma studio        # Open Prisma Studio GUI
npx prisma db seed       # Seed database with test data
npx prisma generate      # Regenerate Prisma Client
```

## Architecture

### Database Schema (Prisma)

The application uses a comprehensive relational data model centered around:

1. **UserProfile**: Core user entity with professional information, tech stack, work preferences (Pomodoro settings)
2. **TechStack**: Technologies the user knows/is learning with proficiency levels
3. **StudyGoal**: Learning objectives with target dates
4. **Concept**: Knowledge units that can be linked to study goals
5. **Task**: Work or study tasks with status tracking, priority, and due dates
6. **Flashcard**: Spaced repetition cards using SM-2 algorithm (easeFactor, interval, repetitions, nextReview)
7. **StudySession**: Time tracking for work/study/review sessions with focus scores
8. **Note**: Free-form notes with tagging system
9. **Resource**: Learning resources (videos, articles, docs) linked to concepts

Key relationships:
- Tasks can be linked to StudyGoals and Concepts (many-to-many via TaskConcept)
- Flashcards can be linked to Tasks and Concepts
- Resources belong to Concepts
- Notes can have multiple Tags (many-to-many via NoteTag)

### State Management (Jotai)

Global atoms are defined in [`src/lib/atoms/index.ts`](src/lib/atoms/index.ts):
- UI state: `sidebarOpenAtom`, `darkModeAtom` (persisted to localStorage)
- User data: `userProfileAtom`
- Selections: `selectedTaskAtom`, `selectedFlashcardAtom`
- Timer: `timerActiveAtom`, `timerSecondsAtom`, `timerTypeAtom`

### AI Integration

Two Gemini models are configured in [`src/lib/ai/gemini.ts`](src/lib/ai/gemini.ts):
- `flashModel`: Gemini 1.5 Flash (faster, for quick tasks)
- `proModel`: Gemini 1.5 Pro (more capable, for complex tasks)

Requires `GEMINI_API_KEY` environment variable.

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/                # API routes (currently empty)
│   ├── flashcards/         # Flashcard review interface
│   ├── overview/           # Dashboard/overview page
│   ├── profile/            # User profile management
│   ├── tasks/              # Task management interface
│   └── layout.tsx          # Root layout with Jotai Provider
├── components/             # React components organized by feature
│   ├── flashcards/
│   ├── overview/
│   ├── productivity/       # Pomodoro timer, etc.
│   ├── profile/
│   ├── tasks/
│   └── ui/                 # Shared UI components (Radix + Tailwind)
├── lib/
│   ├── ai/                 # Gemini AI client configuration
│   ├── atoms/              # Jotai state atoms
│   ├── db/                 # Prisma client singleton
│   ├── hooks/              # Custom React hooks
│   └── utils/              # Utility functions
└── types/                  # TypeScript type definitions
```

### Database Client

Prisma client is initialized as a singleton in [`src/lib/db/prisma.ts`](src/lib/db/prisma.ts) to prevent multiple instances in development (hot reload).

## Path Aliases

Use `@/*` for imports from the `src/` directory:
```typescript
import { prisma } from '@/lib/db/prisma';
import { flashModel } from '@/lib/ai/gemini';
```

## Development Workflow

### Parallel Development with Git Worktrees

When developing new features while keeping a stable version running, use **git worktrees** instead of Docker or cloning the repository. This approach is lightweight and allows running multiple branches simultaneously on different ports.

**Setup:**
```bash
# Create a worktree for stable version (e.g., main branch)
git worktree add ../overlearn-stable main

# Install dependencies in the worktree (only needed once)
cd ../overlearn-stable
cp ../overlearn/.env .
npm install

# Run stable version on a different port
npm run dev -- --port 3001
```

**Workflow:**
- `overlearn/` → Active development branch (default port 3000)
- `overlearn-stable/` → Stable version for daily use (port 3001)

**Worktree Management:**
```bash
git worktree list              # List all worktrees
git worktree remove <path>     # Remove a worktree
git worktree prune             # Clean up stale worktree data
```

**Benefits:**
- Lightweight (shares .git directory, ~50MB vs ~500MB for full clone)
- Run multiple branches simultaneously on different ports
- No Docker overhead or complex setup
- Easy switching between stable and development versions

**Database Isolation (optional):**
If the feature branch modifies the database schema, use separate SQLite databases:
```bash
# In feature branch worktree
# Edit .env to point to a different database file
DATABASE_URL="file:./dev-feature.db"
npx prisma migrate dev
```

## Development Notes

- The database seed file ([`prisma/seed.ts`](prisma/seed.ts)) creates a complete test dataset including user profile, tech stack, study goals, tasks, flashcards, and study sessions
- SQLite database is stored at `prisma/dev.db`
- Environment variables are in `.env` (not committed to git)
- Portuguese is used in some user-facing strings and database seed data
- The application uses Server Components by default (Next.js 15 App Router)



# Roles for development:
    1. No artifacts.

    2. Less code is better than more code.

    3. No fallback mechanisms — they hide real failures.

    4. Rewrite existing components over adding new ones.

    5. Flag obsolete files to keep the codebase lightweight.

    6. Avoid race conditions at all costs.

    7. Always output the full component unless told otherwise.

    8. Never say “X remains unchanged” — always show the code.

    9. Be explicit on where snippets go (e.g., below “abc”, above “xyz”).

    10. If only one function changes, just show that one.

    11. Take your time to ultrathink when on extended thinking mode — thinking is cheaper than fixing bugs.
