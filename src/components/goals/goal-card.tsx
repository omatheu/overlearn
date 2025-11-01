"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, Calendar, FileText, BookOpen, ExternalLink } from "lucide-react";
import { StudyGoal } from "@/lib/hooks/useGoals";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GoalCardProps {
  goal: StudyGoal;
}

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

export function GoalCard({ goal }: GoalCardProps) {
  const progress = goal.progress || 0;
  const totalTasks = goal._count?.tasks || 0;
  const totalConcepts = goal._count?.concepts || 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{goal.title}</CardTitle>
            {goal.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {goal.description}
              </p>
            )}
          </div>
          <Target className="h-5 w-5 text-muted-foreground ml-2" />
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <Badge className={statusColors[goal.status as keyof typeof statusColors]}>
            {statusLabels[goal.status as keyof typeof statusLabels]}
          </Badge>
          {goal.targetDate && (
            <Badge variant="outline" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              {format(new Date(goal.targetDate), "dd/MM/yyyy", { locale: ptBR })}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-semibold">{totalTasks}</div>
                <div className="text-xs text-muted-foreground">Tarefas</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-semibold">{totalConcepts}</div>
                <div className="text-xs text-muted-foreground">Conceitos</div>
              </div>
            </div>
          </div>

          <Link href={`/goals/${goal.id}`}>
            <Button variant="outline" size="sm" className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Detalhes
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
