// src/app/overview/page.tsx
"use client";

import { useOverview } from "@/lib/hooks/useOverview";
import { PageLayout, PageHeader } from "@/components/layout/page-layout";
import { Section } from "@/components/layout/page-layout";
import { Grid } from "@/components/layout/grid";
import { StatCard } from "@/components/overview/stat-card";
import { TodayTasks } from "@/components/overview/today-tasks";
import { PendingFlashcards } from "@/components/overview/pending-flashcards";
import {
  CheckSquare,
  Clock,
  Brain,
  Target,
  RefreshCw,
  ListTodo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default function OverviewPage() {
  const { todayTasks, stats, flashcards, isLoading, refetchAll } =
    useOverview();

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader
          title={`${getGreeting()}! 👋`}
          description="Carregando seu overview..."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </PageLayout>
    );
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  return (
    <PageLayout>
      <PageHeader
        title={`${getGreeting()}! 👋`}
        description="Aqui está um resumo do seu progresso e atividades pendentes"
        action={
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/tasks">
                <ListTodo className="h-4 w-4" />
                Ver Tarefas
              </Link>
            </Button>
            <Button variant="outline" onClick={() => refetchAll()}>
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
          </div>
        }
      />

      {/* Estatísticas de ontem */}
      <Section
        title="Resumo de ontem"
        description="Seu desempenho no dia anterior"
      >
        <Grid cols={{ default: 1, md: 3 }}>
          <StatCard
            title="Tarefas completadas"
            value={stats.data?.completedTasks ?? 0}
            subtitle="Ótimo trabalho!"
            icon={CheckSquare}
          />
          <StatCard
            title="Tempo de foco"
            value={stats.data ? formatTime(stats.data.totalFocusTime) : "0min"}
            subtitle={`${stats.data?.sessionCount ?? 0} sessões`}
            icon={Clock}
          />
          <StatCard
            title="Sessões de estudo"
            value={stats.data?.breakdown.study ?? 0}
            subtitle={`${stats.data?.breakdown.pomodoro ?? 0} pomodoros`}
            icon={Target}
          />
        </Grid>
      </Section>

      {/* Grid de 2 colunas para tasks e flashcards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tarefas de hoje */}
        <Section
          title="Tarefas de hoje"
          description={`${todayTasks.data.length} tarefa${todayTasks.data.length !== 1 ? "s" : ""} agendada${todayTasks.data.length !== 1 ? "s" : ""}`}
        >
          <TodayTasks tasks={todayTasks.data} />
        </Section>

        {/* Flashcards pendentes */}
        <Section
          title="Flashcards para revisar"
          description={`${flashcards.data.length} card${flashcards.data.length !== 1 ? "s" : ""} pendente${flashcards.data.length !== 1 ? "s" : ""}`}
        >
          <PendingFlashcards flashcards={flashcards.data} />
        </Section>
      </div>

      {/* Dica do dia */}
      <div className="mt-8 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg p-6 border border-primary-200 dark:border-primary-800">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-primary-100 dark:bg-primary-900/40 p-3">
            <Brain className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="font-semibold text-primary-900 dark:text-primary-100 mb-1">
              💡 Dica do dia
            </h3>
            <p className="text-sm text-primary-800 dark:text-primary-200">
              Use a técnica Pomodoro para manter o foco: 25 minutos de trabalho
              concentrado seguidos de 5 minutos de pausa. Isso ajuda a manter a
              produtividade sem sobrecarregar o cérebro!
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
