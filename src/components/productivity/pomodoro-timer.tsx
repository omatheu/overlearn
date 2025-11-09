"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Play, Pause, RotateCcw, Clock, CheckSquare } from "lucide-react";
import { useCreateSession } from "@/lib/hooks/useSessions";
import { useProfile } from "@/lib/hooks/useProfile";
import { useTasks } from "@/lib/hooks/useTasks";
import { useTauri } from "@/lib/tauri";
import { useNotificationPreferences } from "@/lib/hooks/useNotificationPreferences";

type TimerMode = "work" | "break";

export function PomodoroTimer() {
  const { data: profile } = useProfile();
  const { data: tasks } = useTasks();
  const createSession = useCreateSession();
  const { isTauri, commands } = useTauri();
  const { preferences } = useNotificationPreferences();

  const [mode, setMode] = useState<TimerMode>("work");
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [completedMinutes, setCompletedMinutes] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const [sessionData, setSessionData] = useState({
    type: "study",
    focusScore: 7,
    notes: ""
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalSeconds = mode === "work"
    ? (profile?.pomodoroMinutes || 25) * 60
    : (profile?.breakMinutes || 5) * 60;

  const currentSeconds = minutes * 60 + seconds;
  const progress = ((totalSeconds - currentSeconds) / totalSeconds) * 100;

  const handleTimerComplete = async () => {
    setIsActive(false);
    setIsPaused(false);

    const duration = mode === "work"
      ? (profile?.pomodoroMinutes || 25)
      : (profile?.breakMinutes || 5);

    // Send notifications if preferences allow
    if (preferences?.pomodoroEnabled) {
      try {
        // Get task title if available
        const taskTitle = selectedTask?.title;

        // 1. Native system notification (if in Tauri and enabled)
        if (isTauri && preferences.systemNotifications) {
          await commands.notifyPomodoroComplete(mode, duration, taskTitle);
        }

        // 2. Backend notification (database + email if enabled)
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: mode === "work" ? "pomodoro_work_complete" : "pomodoro_break_complete",
            title: mode === "work"
              ? "🎯 Sessão de Trabalho Concluída!"
              : "☕ Intervalo Concluído!",
            message: mode === "work"
              ? `Parabéns! Você completou ${duration} minutos de foco${taskTitle ? ` em "${taskTitle}"` : ""}.`
              : `Intervalo de ${duration} minutos finalizado. Hora de voltar ao trabalho!`,
            taskId: selectedTaskId || undefined,
            metadata: JSON.stringify({
              duration,
              mode,
              taskTitle
            })
          })
        });
      } catch (error) {
        console.error("Erro ao enviar notificação de Pomodoro:", error);
      }
    }

    if (mode === "work") {
      setCompletedMinutes(duration);
      setShowSaveDialog(true);
    } else {
      resetTimer();
    }
  };

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            handleTimerComplete();
            return;
          }
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, isPaused, minutes, seconds]);

  const startTimer = () => {
    if (!isActive) {
      setIsActive(true);
      setIsPaused(false);
    }
  };

  const pauseTimer = () => {
    setIsPaused(!isPaused);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    const initialMinutes = mode === "work"
      ? (profile?.pomodoroMinutes || 25)
      : (profile?.breakMinutes || 5);
    setMinutes(initialMinutes);
    setSeconds(0);
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsActive(false);
    setIsPaused(false);
    const initialMinutes = newMode === "work"
      ? (profile?.pomodoroMinutes || 25)
      : (profile?.breakMinutes || 5);
    setMinutes(initialMinutes);
    setSeconds(0);
  };

  const handleSaveSession = async () => {
    try {
      await createSession.mutateAsync({
        type: sessionData.type,
        duration: completedMinutes,
        notes: sessionData.notes || undefined,
        focusScore: sessionData.focusScore,
        taskId: selectedTaskId || undefined
      });
      setShowSaveDialog(false);
      setSessionData({ type: "study", focusScore: 7, notes: "" });
      setSelectedTaskId(null);
      resetTimer();
    } catch (error) {
      console.error("Erro ao salvar sessão:", error);
    }
  };

  const formatTime = (mins: number, secs: number) => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Memoize filtered tasks to avoid re-filtering on every render
  const activeTasks = useMemo(
    () => tasks?.filter(task => task.status !== 'done') || [],
    [tasks]
  );

  // Memoize selected task lookup
  const selectedTask = useMemo(
    () => tasks?.find(task => task.id === selectedTaskId),
    [tasks, selectedTaskId]
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timer Pomodoro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 mb-4">
            <Label htmlFor="task-select" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Tarefa (opcional)
            </Label>
            <Select
              value={selectedTaskId || "none"}
              onValueChange={(value) => setSelectedTaskId(value === "none" ? null : value)}
              disabled={isActive}
            >
              <SelectTrigger id="task-select">
                <SelectValue placeholder="Nenhuma tarefa selecionada" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma tarefa</SelectItem>
                {activeTasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTask && (
              <p className="text-sm text-muted-foreground">
                {selectedTask.description || "Sem descrição"}
              </p>
            )}
          </div>

          <div className="flex justify-center gap-2 mb-4">
            <Button
              variant={mode === "work" ? "default" : "outline"}
              size="sm"
              onClick={() => switchMode("work")}
              disabled={isActive}
            >
              Trabalho
            </Button>
            <Button
              variant={mode === "break" ? "default" : "outline"}
              size="sm"
              onClick={() => switchMode("break")}
              disabled={isActive}
            >
              Intervalo
            </Button>
          </div>

          <div className="text-center">
            <div className="text-6xl font-bold mb-4 font-mono">
              {formatTime(minutes, seconds)}
            </div>
            <Progress value={progress} className="h-2 mb-6" />
          </div>

          <div className="flex justify-center gap-2">
            {!isActive ? (
              <Button onClick={startTimer} size="lg">
                <Play className="h-4 w-4 mr-2" />
                Iniciar
              </Button>
            ) : (
              <Button onClick={pauseTimer} variant="secondary" size="lg">
                <Pause className="h-4 w-4 mr-2" />
                {isPaused ? "Retomar" : "Pausar"}
              </Button>
            )}
            <Button onClick={resetTimer} variant="outline" size="lg">
              <RotateCcw className="h-4 w-4 mr-2" />
              Resetar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar Sessão de Estudo</DialogTitle>
            <DialogDescription>
              Parabéns! Você completou {completedMinutes} minutos de foco.
              {selectedTask && (
                <span className="block mt-2 font-medium">
                  Tarefa: {selectedTask.title}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Tipo de Sessão</Label>
              <Select
                value={sessionData.type}
                onValueChange={(value) => setSessionData({ ...sessionData, type: value })}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="study">Estudo</SelectItem>
                  <SelectItem value="work">Trabalho</SelectItem>
                  <SelectItem value="review">Revisão</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="focusScore">Nível de Foco (1-10)</Label>
              <Input
                id="focusScore"
                type="number"
                min="1"
                max="10"
                value={sessionData.focusScore}
                onChange={(e) => setSessionData({ ...sessionData, focusScore: parseInt(e.target.value) })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={sessionData.notes}
                onChange={(e) => setSessionData({ ...sessionData, notes: e.target.value })}
                placeholder="O que você aprendeu ou trabalhou?"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowSaveDialog(false);
              resetTimer();
            }}>
              Pular
            </Button>
            <Button onClick={handleSaveSession} disabled={createSession.isPending}>
              {createSession.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
