# Repository Guidelines

## Project Structure & Module Organization
- `src/app` provides App Router routes and layouts.
- `src/components` stores shared Tailwind + Radix UI.
- `src/services` holds domain logic; tests sit in `src/services/calendar/__tests__/CalendarService.test.ts`.
- `src/lib`, `src/types`, and `src/styles` keep utilities, types, and design tokens.
- `prisma/schema.prisma` defines the SQLite models; migrations and seeds live in `prisma/migrations` and `prisma/seed.ts`. `public/` serves assets and `docs/` hosts contributor notes.

## Build, Test, and Development Commands
- `npm run dev`: Turbopack dev server on `localhost:3000`.
- `npm run build`: production bundle used for deployment checks.
- `npm run start`: serve the build locally.
- `npm run lint`: Next core-web-vitals ESLint; append `-- --fix` for safe autofixes.
- `npm test` / `npm run test:watch`: run Jest suites; use `npm run test:calendar` for focused checks.
- `npm run test:coverage`: emit coverage reports and keep touched modules level or higher.
- After schema edits run `npx prisma migrate dev` or `npx prisma db push`, then `npx prisma db seed`.

## Coding Style & Naming Conventions
- TypeScript is strict; prefer the `@/` alias for imports from `src`.
- Components use PascalCase, hooks camelCase with `use`, and route files stay kebab-case.
- Indent with two spaces and break long JSX props when it clarifies intent.
- Order Tailwind utilities layout → spacing → color; push conditional logic into helpers in `src/lib`.
- Lint before review to keep diffs clean.

## Testing Guidelines
- Jest plus Testing Library mirror implementation folders with `__tests__`.
- Cover success and failure paths; mock external APIs with local helpers.
- Name files `<Unit>.test.ts` and describe behaviors clearly (e.g., `"schedules calendar events"`).
- Run coverage before PRs and scrutinize snapshot updates.

## Commit & Pull Request Guidelines
- Use the prefixes from history (`feat:`, `fix:`, `chore:`); keep commits focused and explain intent when needed.
- Husky runs lint pre-commit and tests pre-push—verify both locally.
- PRs need a summary, linked issue or task, and UI screenshots or GIFs when visuals change.
- Highlight schema or migration changes and remind reviewers about `npx prisma db seed`.

## Environment & Configuration
- The SQLite dev database lives at `prisma/dev.db`; do not commit alternate database files.
- Store secrets in `.env.local` and keep `.env*` files and tokens out of source control.
