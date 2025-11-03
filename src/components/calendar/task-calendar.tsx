"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import { useTaskCalendar } from "@/lib/hooks/useTaskCalendar";
import { cn } from "@/lib/utils";
import { useScheduledEvents } from "@/services/calendar";

const DAYS_OF_WEEK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export function TaskCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { loading, getTasksForDate } = useTaskCalendar();
  const { events: scheduledEvents } = useScheduledEvents();

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

  const normalizedEvents = useMemo(
    () =>
      scheduledEvents.map((event) => ({
        ...event,
        scheduledTime:
          event.scheduledTime instanceof Date
            ? event.scheduledTime
            : new Date(event.scheduledTime),
      })),
    [scheduledEvents]
  );

  const getDayEntries = (day: number) => {
    const date = new Date(year, month, day);

    const tasks = getTasksForDate(date).map((task) => ({
      id: `task-${task.id}`,
      title: task.title,
      scheduledTime: task.scheduledDate,
      priority: task.priority,
      kind: "task" as const,
    }));

    const events = normalizedEvents
      .filter((event) => {
        const scheduledTime = event.scheduledTime;
        if (!scheduledTime) return false;

        return (
          scheduledTime.getFullYear() === date.getFullYear() &&
          scheduledTime.getMonth() === date.getMonth() &&
          scheduledTime.getDate() === date.getDate()
        );
      })
      .map((event) => ({
        id: `event-${event.id}`,
        title: event.title,
        scheduledTime: event.scheduledTime,
        priority: null,
        kind: "event" as const,
      }));

    return [...tasks, ...events].sort((a, b) => {
      const aTime = a.scheduledTime
        ? new Date(a.scheduledTime).getTime()
        : Number.MAX_SAFE_INTEGER;
      const bTime = b.scheduledTime
        ? new Date(b.scheduledTime).getTime()
        : Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });
  };

  const getEntryStyle = (
    entry: ReturnType<typeof getDayEntries>[number]
  ): string => {
    if (entry.kind === "event") {
      return "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300";
    }

    switch (entry.priority) {
      case "urgent":
        return "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300";
      case "high":
        return "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300";
      case "medium":
        return "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300";
      case "low":
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
    }
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
      const dayEntries = getDayEntries(day);
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
            {dayEntries.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {dayEntries.length}
              </Badge>
            )}
          </div>

          <div className="space-y-1">
            {dayEntries.slice(0, 3).map((entry) => (
              <div
                key={entry.id}
                className={cn("text-xs p-1.5 rounded truncate", getEntryStyle(entry))}
                title={entry.title}
              >
                <div className="flex items-center gap-1">
                  {entry.scheduledTime && <Clock className="h-3 w-3 shrink-0" />}
                  <span className="truncate">
                    {entry.title}
                    {entry.kind === "event" && entry.scheduledTime
                      ? ` • ${entry.scheduledTime.toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}`
                      : ""}
                  </span>
                </div>
              </div>
            ))}
            {dayEntries.length > 3 && (
              <div className="text-xs text-muted-foreground pl-1">
                +{dayEntries.length - 3} mais
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
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-purple-100 dark:bg-purple-950 border border-purple-300 dark:border-purple-700" />
            <span>Evento</span>
          </div>
        </div>
        </div>
      </CardContent>
    </Card>
  );
}
