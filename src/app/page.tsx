import Image from "next/image";
import { DailyOverview } from "./overview/daily-overview";
import { PendingFlashcards } from "./overview/pending-tasks";
import { QuickActions } from "./overview/quick-actions";
import { RecentTasks } from "./overview/recent-tasks";
import { PageLayout, PageContent, Section } from "@/components/layout";
import { Grid } from "@/components/layout";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <Image
            src="/overlearn.png"
            alt="OverLearn Logo"
            className="h-8 w-8"
            width={32}
            height={32}
          />
          <h1 className="text-2xl font-bold tracking-tight">OverLearn</h1>
        </div>
      </header>

      {/* Main Content */}
      <PageLayout maxWidth="2xl" padding={true}>
        <PageContent>
          {/* Overview Proativo */}
          <Section>
            <DailyOverview />
          </Section>

          {/* Quick Actions */}
          <Section>
            <QuickActions />
          </Section>

          {/* Grid de Conteúdo */}
          <Grid cols={{ default: 1, lg: 2 }} gap={6}>
            <RecentTasks />
            <PendingFlashcards />
          </Grid>
        </PageContent>
      </PageLayout>
    </div>
  );
}
