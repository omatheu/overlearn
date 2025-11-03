import { useAtom } from 'jotai';
import { useCallback } from 'react';
import {
  scheduledEventsAtom,
  addScheduledEventAtom,
  updateScheduledEventAtom,
  deleteScheduledEventAtom,
  markEventCompletedAtom
} from '../atoms';
import { CalendarService } from '../CalendarService';
import { UseScheduledEventsReturn, ScheduledEvent, IcsImportOptions } from '../types';

export function useScheduledEvents(): UseScheduledEventsReturn {
  const [events] = useAtom(scheduledEventsAtom);
  const [, addEvent] = useAtom(addScheduledEventAtom);
  const [, updateEvent] = useAtom(updateScheduledEventAtom);
  const [, deleteEvent] = useAtom(deleteScheduledEventAtom);
  const [, markEventCompleted] = useAtom(markEventCompletedAtom);

  const handleAddEvent = useCallback((event: Omit<ScheduledEvent, 'id'>) => {
    addEvent(event);
  }, [addEvent]);

  const handleUpdateEvent = useCallback((id: string, updates: Partial<ScheduledEvent>) => {
    updateEvent({ id, updates });
  }, [updateEvent]);

  const handleDeleteEvent = useCallback((id: string) => {
    deleteEvent(id);
  }, [deleteEvent]);

  const handleMarkEventCompleted = useCallback((id: string) => {
    markEventCompleted(id);
  }, [markEventCompleted]);

  const getUpcomingEvents = useCallback((limit: number = 5) => {
    return CalendarService.getUpcomingEvents(events, 120).slice(0, limit);
  }, [events]);

  const getEventsForDate = useCallback((date: Date) => {
    return CalendarService.getEventsForDate(events, date);
  }, [events]);

  const importFromICS = useCallback((icsContent: string, options?: IcsImportOptions) => {
    const importedEvents = CalendarService.importEventsFromICS(icsContent, options);

    if (importedEvents.length === 0) {
      return [];
    }

    const existingSourceUids = new Set(
      events
        .map(event => {
          const uid = event.metadata?.sourceUid;
          return typeof uid === 'string' ? uid : null;
        })
        .filter((uid): uid is string => uid !== null)
    );

    const dedupedEvents = importedEvents.filter(event => {
      const sourceUid = typeof event.metadata?.sourceUid === 'string'
        ? event.metadata?.sourceUid
        : undefined;

      return !sourceUid || !existingSourceUids.has(sourceUid);
    });

    dedupedEvents.forEach(event => {
      addEvent({
        title: event.title,
        type: event.type,
        scheduledTime: event.scheduledTime,
        metadata: event.metadata,
        recurring: event.recurring,
        completed: event.completed
      });
    });

    return dedupedEvents;
  }, [addEvent, events]);

  // Memoizar eventos próximos para performance
  // const upcomingEvents = useMemo(() => {
  //   return getUpcomingEvents(5);
  // }, [getUpcomingEvents]);

  // Memoizar eventos de hoje
  // const todayEvents = useMemo(() => {
  //   return getEventsForDate(new Date());
  // }, [getEventsForDate]);

  return {
    events,
    addEvent: handleAddEvent,
    updateEvent: handleUpdateEvent,
    deleteEvent: handleDeleteEvent,
    getUpcomingEvents,
    markEventCompleted: handleMarkEventCompleted,
    getEventsForDate,
    importFromICS
  };
}
