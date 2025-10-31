"use client";

import { use } from "react";
import { PageLayout, PageContent } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useGoal, useDeleteGoal } from "@/lib/hooks/useGoals";
import { ChevronLeft, Pencil, Trash2, Loader2, FileText, BookOpen, Clock, Calendar, Target } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: goal, isLoading, error } = useGoal(id);
  const deleteGoal = useDeleteGoal();

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja deletar esta meta? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      await deleteGoal.mutateAsync(id);
      router.push("/goals");
    } catch (error) {
      console.error("Erro ao deletar meta:", error);
    }
  };

  if (isLoading) {
    return (
      <PageLayout maxWidth="xl">
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
      <PageLayout maxWidth="xl">
        <PageContent>
          <div className="text-center py-12">
            <p className="text-destructive">Meta não encontrada</p>
          </div>
        </PageContent>
      </PageLayout>
    );
  }

  const progress = goal.progress || 0;
  const totalTasks = goal._count?.tasks || 0;
  const totalConcepts = goal._count?.concepts || 0;
  const totalStudyTime = goal.totalStudyTime || 0;

  const statusColors = {
    active: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
    completed: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
    paused: "bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-400"
  };

  const statusLabels = {
    active: "Ativa",
    completed: "Concluída",
    paused: "Pausada"
  };

  return (
    <PageLayout maxWidth="xl">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/goals">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para Metas
          </Button>
        </Link>

        <div className="flex gap-2">
          <Link href={`/goals/${id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteGoal.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Deletar
          </Button>
        </div>
      </div>

      <PageContent>
        <Card className="mb-6">
          <CardHeader>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Target className="h-6 w-6 text-primary mt-1" />
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-3">{goal.title}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={statusColors[goal.status as keyof typeof statusColors]}>
                      {statusLabels[goal.status as keyof typeof statusLabels]}
                    </Badge>
                    {goal.targetDate && (
                      <Badge variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(goal.targetDate), "dd/MM/yyyy", { locale: ptBR })}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Progresso</span>
                  <span className="font-semibold">{progress}%</span>
                </div>
                <Progress value={progress} className="h-3" />
                <p className="text-xs text-muted-foreground mt-2">
                  {goal.completedTasks} de {goal.totalTasks} tarefas concluídas
                </p>
              </div>
            </div>
          </CardHeader>

          {goal.description && (
            <CardContent>
              <h3 className="font-semibold mb-2">Descrição</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {goal.description}
              </p>
            </CardContent>
          )}
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{totalTasks}</div>
                  <div className="text-sm text-muted-foreground">Tarefas</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{totalConcepts}</div>
                  <div className="text-sm text-muted-foreground">Conceitos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}m
                  </div>
                  <div className="text-sm text-muted-foreground">Tempo Total</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {goal.tasks && goal.tasks.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Tarefas Relacionadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {goal.tasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    className="block"
                  >
                    <div className="p-3 border rounded-lg hover:bg-accent transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{task.title}</span>
                        <Badge variant="outline">{task.status}</Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {goal.concepts && goal.concepts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Conceitos Relacionados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {goal.concepts.map((concept) => (
                  <Link key={concept.id} href={`/concepts/${concept.id}`}>
                    <Badge variant="secondary" className="hover:bg-secondary/80 cursor-pointer">
                      {concept.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </PageContent>
    </PageLayout>
  );
}
