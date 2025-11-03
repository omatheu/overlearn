'use client';

import { useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarEventMetadata } from '@/components/calendar/calendar-event-metadata';
import { useScheduledEvents } from '@/services/calendar';
import { CalendarIcon, Check } from 'lucide-react';

interface ScheduledEventsPanelProps {
  limit?: number;
  title?: string;
  emptyMessage?: string;
}

export function ScheduledEventsPanel({
  limit = 5,
  title = 'Eventos Agendados',
  emptyMessage = 'Nenhum evento agendado para os próximos dias.'
}: ScheduledEventsPanelProps) {
  const { events, markEventCompleted } = useScheduledEvents();

  const upcomingEvents = useMemo(() => {
    const now = Date.now();

    return events
      .map(event => {
        const scheduledTime = event.scheduledTime instanceof Date
          ? event.scheduledTime
          : new Date(event.scheduledTime);

        return { ...event, scheduledTime };
      })
      .filter(event => event.scheduledTime.getTime() >= now)
      .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime())
      .slice(0, limit);
  }, [events, limit]);

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {upcomingEvents.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-6">
            {emptyMessage}
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.map(event => (
              <div key={event.id} className="flex flex-col gap-2 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={event.completed ? 'secondary' : 'outline'}>
                        {event.type}
                      </Badge>
                      <span className="font-medium">{event.title}</span>
                    </div>
                    <div className="text-muted-foreground">
                      {formatDateTime(event.scheduledTime)}
                    </div>
                  </div>
                  {!event.completed && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => markEventCompleted(event.id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Concluir
                    </Button>
                  )}
                </div>
                <CalendarEventMetadata event={event} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

