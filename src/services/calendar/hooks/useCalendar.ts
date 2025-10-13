import { useAtom, useAtomValue } from 'jotai';
import { useCallback } from 'react';
import {
  currentSessionAtom,
  isWorkingNowAtom,
  startSessionAtom,
  endSessionAtom,
  pauseSessionAtom,
  resumeSessionAtom,
  scheduledEventsAtom,
  focusSessionsAtom
} from '../atoms';
import { CalendarService } from '../CalendarService';
import { UseCalendarReturn, FocusSession } from '../types';

export function useCalendar(): UseCalendarReturn {
  const [currentSession] = useAtom(currentSessionAtom);
  const isWorkingNow = useAtomValue(isWorkingNowAtom);
  // const upcomingEvents = useAtomValue(upcomingEventsAtom);
  // const timeUntilNextEvent = useAtomValue(timeUntilNextEventAtom);
  // const todayStats = useAtomValue(todayStatsAtom);
  const [events] = useAtom(scheduledEventsAtom);
  const [sessions] = useAtom(focusSessionsAtom);

  const [, startSession] = useAtom(startSessionAtom);
  const [, endSession] = useAtom(endSessionAtom);
  const [, pauseSession] = useAtom(pauseSessionAtom);
  const [, resumeSession] = useAtom(resumeSessionAtom);

  const handleStartSession = useCallback((
    type: FocusSession['type'], 
    taskId?: string
  ) => {
    startSession({ type, taskId });
  }, [startSession]);

  const handleEndSession = useCallback(() => {
    endSession();
  }, [endSession]);

  const handlePauseSession = useCallback(() => {
    pauseSession();
  }, [pauseSession]);

  const handleResumeSession = useCallback(() => {
    resumeSession();
  }, [resumeSession]);

  const getTimeUntilNextEvent = useCallback(() => {
    return CalendarService.getTimeUntilNextEvent(events);
  }, [events]);

  const getDailyOverview = useCallback((date: Date = new Date()) => {
    return CalendarService.generateDailyOverview(date, events, sessions);
  }, [events, sessions]);

  return {
    isWorkingNow,
    currentSession,
    startSession: handleStartSession,
    endSession: handleEndSession,
    pauseSession: handlePauseSession,
    resumeSession: handleResumeSession,
    getTimeUntilNextEvent,
    getDailyOverview
  };
}
