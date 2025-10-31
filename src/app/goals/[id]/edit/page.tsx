"use client";

import { use } from "react";
import { PageLayout, PageHeader, PageContent } from "@/components/layout";
import { GoalForm } from "@/components/goals/goal-form";
import { Button } from "@/components/ui/button";
import { useGoal } from "@/lib/hooks/useGoals";
import { ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function EditGoalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: goal, isLoading, error } = useGoal(id);

  if (isLoading) {
    return (
      <PageLayout maxWidth="lg">
        <PageContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </PageContent>
      </PageLayout>
    );
  }

  if (error || !goal) {
    return (
      <PageLayout maxWidth="lg">
        <PageContent>
          <div className="text-center py-12">
            <p className="text-destructive">Meta não encontrada</p>
          </div>
        </PageContent>
      </PageLayout>
    );
  }

  return (
    <PageLayout maxWidth="lg">
      <div className="mb-6">
        <Link href={`/goals/${id}`}>
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para Meta
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Editar Meta"
        description="Atualize as informações da meta de estudo"
      />

      <PageContent>
        <GoalForm goal={goal} />
      </PageContent>
    </PageLayout>
  );
}
