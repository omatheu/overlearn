"use client";

import { PageLayout, PageHeader, PageContent } from "@/components/layout";
import { GoalForm } from "@/components/goals/goal-form";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function NewGoalPage() {
  return (
    <PageLayout maxWidth="lg">
      <div className="mb-6">
        <Link href="/goals">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para Metas
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Nova Meta de Estudo"
        description="Defina uma nova meta de aprendizado"
      />

      <PageContent>
        <GoalForm />
      </PageContent>
    </PageLayout>
  );
}
