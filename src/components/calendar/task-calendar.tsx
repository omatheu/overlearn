"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import { useTaskCalendar } from "@/lib/hooks/useTaskCalendar";
import { cn } from "@/lib/utils";

const DAYS_OF_WEEK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export function TaskCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { loading, getTasksForDate } = useTaskCalendar();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const getDayTasks = (day: number) => {
    const date = new Date(year, month, day);
    return getTasksForDate(date);
  };

  const renderCalendarDays = () => {
    const days: React.ReactElement[] = [];

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="min-h-24 p-2 border border-border/50 bg-muted/20" />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayTasks = getDayTasks(day);
      const isCurrentDay = isToday(day);

      days.push(
        <div
          key={day}
          className={cn(
            "min-h-24 p-2 border border-border hover:bg-accent/50 transition-colors",
            isCurrentDay && "bg-primary/10 border-primary"
          )}
        >
          <div className="flex items-center justify-between mb-1">
            <span
              className={cn(
                "text-sm font-medium",
                isCurrentDay && "text-primary font-bold"
              )}
            >
              {day}
            </span>
            {dayTasks.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {dayTasks.length}
              </Badge>
            )}
          </div>

          <div className="space-y-1">
            {dayTasks.slice(0, 3).map((task) => (
              <div
                key={task.id}
                className={cn(
                  "text-xs p-1.5 rounded truncate",
                  task.priority === "urgent" && "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300",
                  task.priority === "high" && "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300",
                  task.priority === "medium" && "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300",
                  task.priority === "low" && "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                )}
                title={task.title}
              >
                <div className="flex items-center gap-1">
                  {task.scheduledDate && (
                    <Clock className="h-3 w-3 shrink-0" />
                  )}
                  <span className="truncate">{task.title}</span>
                </div>
              </div>
            ))}
            {dayTasks.length > 3 && (
              <div className="text-xs text-muted-foreground pl-1">
                +{dayTasks.length - 3} mais
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendário de Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="text-muted-foreground">Carregando calendário...</div>
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
            <Calendar className="h-5 w-5" />
            Calendário de Tasks
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button onClick={goToToday} variant="outline" size="sm">
              Hoje
            </Button>
            <Button onClick={previousMonth} variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-[160px] text-center font-semibold">
              {MONTHS[month]} {year}
            </div>
            <Button onClick={nextMonth} variant="ghost" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-0">
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-semibold p-2 border border-border bg-muted"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-0">
            {renderCalendarDays()}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-100 dark:bg-red-950 border border-red-300 dark:border-red-700" />
              <span>Urgente</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-orange-100 dark:bg-orange-950 border border-orange-300 dark:border-orange-700" />
              <span>Alta</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-blue-100 dark:bg-blue-950 border border-blue-300 dark:border-blue-700" />
              <span>Média</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600" />
              <span>Baixa</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
