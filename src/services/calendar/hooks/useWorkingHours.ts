import { useAtom } from 'jotai';
import { useCallback, useMemo } from 'react';
import { workingHoursAtom } from '../atoms';
import { CalendarService } from '../CalendarService';
import { UseWorkingHoursReturn, WorkingHours } from '../types';

export function useWorkingHours(): UseWorkingHoursReturn {
  const [workingHours, setWorkingHours] = useAtom(workingHoursAtom);

  const isWithinWorkingHours = useCallback((date: Date = new Date()) => {
    return CalendarService.isWithinWorkingHours(workingHours, date);
  }, [workingHours]);

  const getWorkingTimeRemaining = useCallback(() => {
    return CalendarService.getWorkingTimeRemaining(workingHours);
  }, [workingHours]);

  const getNextWorkingDay = useCallback(() => {
    return CalendarService.getNextWorkingDay(workingHours);
  }, [workingHours]);

  const handleSetWorkingHours = useCallback((hours: WorkingHours) => {
    // Validar antes de definir
    const errors = CalendarService.validateConfig({ 
      workingHours: hours,
      pomodoroSettings: {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        sessionsUntilLongBreak: 4
      },
      notifications: {
        enabled: true,
        upcomingEventMinutes: 5,
        breakReminders: true,
        focusSessionEnd: true
      },
      autoTracking: {
        enabled: true,
        detectIdleTime: 5,
        pauseOnIdle: true
      }
    });

    if (errors.length === 0) {
      setWorkingHours(hours);
    } else {
      console.warn('Invalid working hours:', errors);
    }
  }, [setWorkingHours]);

  return {
    workingHours,
    setWorkingHours: handleSetWorkingHours,
    isWithinWorkingHours,
    getWorkingTimeRemaining,
    getNextWorkingDay
  };
}
