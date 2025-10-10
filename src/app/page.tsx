// src/app/page.tsx
import { DailyOverview } from "./overview/daily-overview";
import { PendingFlashcards } from "./overview/pending-tasks";
import { QuickActions } from "./overview/quick-actions";
import { RecentTasks } from "./overview/recent-tasks";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">DevFlow</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Overview Proativo */}
          <DailyOverview />
          
          {/* Quick Actions */}
          <QuickActions />
          
          {/* Grid de Conteúdo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RecentTasks />
            <PendingFlashcards />
          </div>
        </div>
      </main>
    </div>
  );
}