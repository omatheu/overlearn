"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, AlertCircle } from "lucide-react";
import { useTaskCalendar } from "@/lib/hooks/useTaskCalendar";
import { cn } from "@/lib/utils";

export function DailySchedule() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { loading, getTasksForDate } = useTaskCalendar();

  const dayTasks = getTasksForDate(selectedDate).sort((a, b) => {
    if (!a.scheduledDate) return 1;
    if (!b.scheduledDate) return -1;
    return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
  });

  const totalEstimatedTime = dayTasks.reduce(
    (total, task) => total + (task.estimatedTime || 0),
    0
  );

  const formatTime = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700";
      case "high":
        return "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700";
      case "medium":
        return "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700";
      case "low":
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600";
      default:
        return "bg-gray-100 dark:bg-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300";
      case "doing":
        return "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300";
      case "blocked":
        return "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
    }
  };

  const isToday = () => {
    const today = new Date();
    return (
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Agenda do Dia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <div className="text-muted-foreground">Carregando...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Agenda do Dia
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setSelectedDate(new Date())}
              variant="outline"
              size="sm"
              disabled={isToday()}
            >
              Hoje
            </Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {selectedDate.toLocaleDateString("pt-BR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </CardHeader>
      <CardContent>
        {dayTasks.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Nenhuma task agendada para este dia
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="text-sm">
                <span className="font-semibold">{dayTasks.length}</span> tasks
              </div>
              {totalEstimatedTime > 0 && (
                <div className="text-sm">
                  Tempo estimado: <span className="font-semibold">{formatDuration(totalEstimatedTime)}</span>
                </div>
              )}
            </div>

            {/* Tasks list */}
            <div className="space-y-3">
              {dayTasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all hover:shadow-md",
                    getPriorityColor(task.priority)
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{task.title}</h4>
                        <Badge variant="outline" className={getStatusColor(task.status)}>
                          {task.status === "todo" && "A Fazer"}
                          {task.status === "doing" && "Fazendo"}
                          {task.status === "done" && "Concluído"}
                          {task.status === "blocked" && "Bloqueado"}
                        </Badge>
                      </div>

                      {task.description && (
                        <p className="text-sm opacity-90">{task.description}</p>
                      )}

                      <div className="flex items-center gap-3 text-sm">
                        {task.scheduledDate && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(task.scheduledDate)}</span>
                          </div>
                        )}
                        {task.estimatedTime && (
                          <div className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            <span>{formatDuration(task.estimatedTime)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Badge variant="secondary" className="shrink-0">
                      {task.type === "work" && "Trabalho"}
                      {task.type === "study" && "Estudo"}
                      {task.type === "personal" && "Pessoal"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
