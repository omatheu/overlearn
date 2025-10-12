import { TaskCalendar } from "@/components/calendar/task-calendar";
import { DailySchedule } from "@/components/calendar/daily-schedule";
import { PageLayout, PageHeader, PageContent } from "@/components/layout/page-layout";

export default function CalendarPage() {
  return (
    <PageLayout maxWidth="2xl">
      <PageHeader
        title="Calendário"
        description="Visualize e gerencie suas tasks agendadas"
      />

      <PageContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TaskCalendar />
          </div>
          <div>
            <DailySchedule />
          </div>
        </div>
      </PageContent>
    </PageLayout>
  );
}
