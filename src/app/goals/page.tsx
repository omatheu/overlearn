"use client";

import { useState } from "react";
import { PageLayout, PageHeader, PageContent } from "@/components/layout";
import { GoalCard } from "@/components/goals/goal-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { useGoals } from "@/lib/hooks/useGoals";
import { Plus, Loader2, Target } from "lucide-react";
import Link from "next/link";

export default function GoalsPage() {
  const { data: goals, isLoading, error } = useGoals();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredGoals = goals?.filter((goal) => {
    if (statusFilter === "all") return true;
    return goal.status === statusFilter;
  });

  if (isLoading) {
    return (
      <PageLayout maxWidth="xl">
        <PageHeader title="Metas de Estudo" description="Gerencie suas metas de aprendizado" />
        <PageContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </PageContent>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout maxWidth="xl">
        <PageHeader title="Metas de Estudo" description="Gerencie suas metas de aprendizado" />
        <PageContent>
          <div className="text-center py-12">
            <p className="text-destructive">Erro ao carregar metas</p>
          </div>
        </PageContent>
      </PageLayout>
    );
  }

  return (
    <PageLayout maxWidth="xl">
      <PageHeader
        title="Metas de Estudo"
        description="Gerencie suas metas de aprendizado"
        action={
          <Link href="/goals/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Meta
            </Button>
          </Link>
        }
      />

      <PageContent>
        <div className="mb-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="active">Ativas</SelectItem>
              <SelectItem value="completed">Concluídas</SelectItem>
              <SelectItem value="paused">Pausadas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredGoals && filteredGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Target}
            title="Nenhuma meta encontrada"
            description="Comece criando sua primeira meta de estudo"
            action={
              <Link href="/goals/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Meta
                </Button>
              </Link>
            }
          />
        )}
      </PageContent>
    </PageLayout>
  );
}
