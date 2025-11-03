'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarEventsImporter } from '@/components/calendar/calendar-events-importer';
import { CalendarEventMetadata } from '@/components/calendar/calendar-event-metadata';
import { Clock, Play, Pause, Square, Calendar, Timer } from 'lucide-react';
import { useCalendar, useWorkingHours, useScheduledEvents } from '@/services/calendar';
import { formatDuration, formatTimeRemaining } from '@/services/calendar/utils';

export function CalendarIntegration() {
  const {
    isWorkingNow,
    currentSession,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    getDailyOverview
  } = useCalendar();

  const { workingHours, getWorkingTimeRemaining } = useWorkingHours();
  const { getUpcomingEvents, getEventsForDate } = useScheduledEvents();

  const dailyOverview = getDailyOverview();
  const upcomingEvents = getUpcomingEvents(3);
  const todayEvents = getEventsForDate(new Date());
  const workingTimeRemaining = getWorkingTimeRemaining();

  const handleStartWork = () => {
    startSession('work');
  };

  const handleStartStudy = () => {
    startSession('study');
  };

  const handleStartPomodoro = () => {
    startSession('pomodoro');
  };

  const handleEndSession = () => {
    endSession();
  };

  const handlePauseSession = () => {
    pauseSession();
  };

  const handleResumeSession = () => {
    resumeSession();
  };

  return (
    <div className="space-y-4">
      <CalendarEventsImporter />

      {/* Status do Horário de Trabalho */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <CardTitle>Status do Horário</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant={isWorkingNow ? 'default' : 'secondary'}>
              {isWorkingNow ? 'Horário de Trabalho Ativo' : 'Fora do Horário'}
            </Badge>
            {isWorkingNow && (
              <span className="text-sm text-muted-foreground">
                {formatDuration(workingTimeRemaining)} restantes
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Horário: {workingHours.start} - {workingHours.end}
          </p>
        </CardContent>
      </Card>

      {/* Sessão Atual */}
      {currentSession ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              <CardTitle>Sessão Ativa</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{currentSession.type}</Badge>
                <span className="text-sm">
                  {formatDuration(Math.floor((Date.now() - currentSession.startTime.getTime()) / 60000))}
                </span>
              </div>
              
              <div className="flex gap-2">
                {currentSession.interrupted ? (
                  <Button onClick={handleResumeSession} size="sm">
                    <Play className="h-4 w-4 mr-1" />
                    Retomar
                  </Button>
                ) : (
                  <Button onClick={handlePauseSession} size="sm" variant="outline">
                    <Pause className="h-4 w-4 mr-1" />
                    Pausar
                  </Button>
                )}
                <Button onClick={handleEndSession} size="sm" variant="destructive">
                  <Square className="h-4 w-4 mr-1" />
                  Finalizar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              <CardTitle>Iniciar Sessão</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button onClick={handleStartWork} size="sm">
                Trabalho
              </Button>
              <Button onClick={handleStartStudy} size="sm" variant="outline">
                Estudo
              </Button>
              <Button onClick={handleStartPomodoro} size="sm" variant="outline">
                Pomodoro
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas do Dia */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <CardTitle>Overview do Dia</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatDuration(dailyOverview.focusTimeToday)}
              </div>
              <div className="text-sm text-muted-foreground">Tempo Focado</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {dailyOverview.sessionsToday?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Sessões</div>
            </div>
          </div>
          
          {dailyOverview.productivityScore > 0 && (
            <div className="mt-4 text-center">
              <div className="text-lg font-semibold">
                Produtividade: {dailyOverview.productivityScore}%
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Eventos Agendados */}
      {upcomingEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingEvents.map(event => (
                <div key={event.id} className="flex flex-col text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{event.type}</Badge>
                    <span className="flex-1">{event.title}</span>
                    <span className="text-muted-foreground">
                      {formatTimeRemaining(new Date(event.scheduledTime).getTime() - Date.now())}
                    </span>
                  </div>
                  <CalendarEventMetadata event={event} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Eventos de Hoje */}
      {todayEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Eventos de Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todayEvents.map(event => (
                <div key={event.id} className="flex flex-col text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant={event.completed ? 'secondary' : 'default'}>
                      {event.completed ? 'Concluído' : 'Pendente'}
                    </Badge>
                    <span className="flex-1">{event.title}</span>
                    <span className="text-muted-foreground">
                      {new Date(event.scheduledTime).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <CalendarEventMetadata event={event} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
