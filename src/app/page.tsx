import { DailyOverview } from "./overview/daily-overview";
import { PendingFlashcards } from "./overview/pending-tasks";
import { QuickActions } from "./overview/quick-actions";
import { RecentTasks } from "./overview/recent-tasks";
import { PageLayout, PageContent, Section } from "@/components/layout";
import { Grid } from "@/components/layout";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
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
