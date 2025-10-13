import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { 
  WorkingHours, 
  FocusSession, 
  ScheduledEvent, 
  DailyStats, 
  CalendarConfig 
} from './types';

// Configuração padrão do calendário
const defaultWorkingHours: WorkingHours = {
  start: '09:00',
  end: '18:00',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  workDays: [1, 2, 3, 4, 5] // Segunda a Sexta
};

const defaultCalendarConfig: CalendarConfig = {
  workingHours: defaultWorkingHours,
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
};

// Atoms de configuração (persistidos no localStorage)
export const workingHoursAtom = atomWithStorage<WorkingHours>(
  'calendar.workingHours',
  defaultWorkingHours
);

export const calendarConfigAtom = atomWithStorage<CalendarConfig>(
  'calendar.config',
  defaultCalendarConfig
);

// Atoms de estado da sessão atual
export const currentSessionAtom = atom<FocusSession | null>(null);

export const isTrackingAtom = atom<boolean>(false);

export const lastActivityAtom = atom<Date>(new Date());

// Atoms de eventos agendados
export const scheduledEventsAtom = atomWithStorage<ScheduledEvent[]>(
  'calendar.scheduledEvents',
  []
);

// Atoms de estatísticas
export const dailyStatsAtom = atomWithStorage<Record<string, DailyStats>>(
  'calendar.dailyStats',
  {}
);

export const focusSessionsAtom = atomWithStorage<FocusSession[]>(
  'calendar.focusSessions',
  []
);

// Atoms derivados
export const isWorkingNowAtom = atom((get) => {
  const workingHours = get(workingHoursAtom);
  const now = new Date();
  const currentDay = now.getDay();
  
  if (!workingHours.workDays.includes(currentDay)) {
    return false;
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = parseInt(workingHours.start.split(':')[0]) * 60 + parseInt(workingHours.start.split(':')[1]);
  const endMinutes = parseInt(workingHours.end.split(':')[0]) * 60 + parseInt(workingHours.end.split(':')[1]);

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
});

export const todayStatsAtom = atom((get) => {
  const dailyStats = get(dailyStatsAtom);
  const today = new Date().toISOString().split('T')[0];
  return dailyStats[today] || {
    date: new Date(),
    totalFocusTime: 0,
    sessionsCompleted: 0,
    tasksCompleted: 0,
    flashcardsReviewed: 0,
    breaksTaken: 0,
    productivityScore: 0
  };
});

export const upcomingEventsAtom = atom((get) => {
  const events = get(scheduledEventsAtom);
  const now = new Date();
  
  return events
    .filter(e => !e.completed && new Date(e.scheduledTime) > now)
    .sort((a, b) => 
      new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
    )
    .slice(0, 5); // Próximos 5 eventos
});

export const timeUntilNextEventAtom = atom((get) => {
  const upcomingEvents = get(upcomingEventsAtom);
  
  if (upcomingEvents.length === 0) return -1;
  
  const now = new Date();
  return new Date(upcomingEvents[0].scheduledTime).getTime() - now.getTime();
});

export const currentSessionDurationAtom = atom((get) => {
  const currentSession = get(currentSessionAtom);
  
  if (!currentSession) return 0;
  
  const now = new Date();
  return Math.floor((now.getTime() - currentSession.startTime.getTime()) / 1000);
});

export const workingTimeRemainingAtom = atom((get) => {
  const workingHours = get(workingHoursAtom);
  const isWorkingNow = get(isWorkingNowAtom);
  
  if (!isWorkingNow) return 0;
  
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const endMinutes = parseInt(workingHours.end.split(':')[0]) * 60 + parseInt(workingHours.end.split(':')[1]);
  
  return Math.max(0, endMinutes - currentMinutes);
});

// Atoms de ações (write-only)
export const startSessionAtom = atom(
  null,
  (get, set, { type, taskId }: { type: FocusSession['type']; taskId?: string }) => {
    const currentSession = get(currentSessionAtom);
    
    if (currentSession) {
      // Finalizar sessão atual se existir
      set(endSessionAtom);
    }
    
    const newSession: FocusSession = {
      id: crypto.randomUUID(),
      taskId,
      startTime: new Date(),
      duration: 0,
      type,
      interrupted: false
    };
    
    set(currentSessionAtom, newSession);
    set(isTrackingAtom, true);
    set(lastActivityAtom, new Date());
  }
);

export const endSessionAtom = atom(
  null,
  (get, set) => {
    const currentSession = get(currentSessionAtom);
    
    if (!currentSession) return;
    
    const endedSession: FocusSession = {
      ...currentSession,
      endTime: new Date(),
      duration: Math.floor(
        (new Date().getTime() - currentSession.startTime.getTime()) / 60000
      )
    };
    
    // Adicionar à lista de sessões
    const focusSessions = get(focusSessionsAtom);
    set(focusSessionsAtom, [...focusSessions, endedSession]);
    
    // Atualizar estatísticas do dia
    const today = new Date().toISOString().split('T')[0];
    const dailyStats = get(dailyStatsAtom);
    const todayStats = dailyStats[today] || {
      date: new Date(),
      totalFocusTime: 0,
      sessionsCompleted: 0,
      tasksCompleted: 0,
      flashcardsReviewed: 0,
      breaksTaken: 0,
      productivityScore: 0
    };
    
    todayStats.totalFocusTime += endedSession.duration;
    todayStats.sessionsCompleted += 1;

    // Note: FocusSession type doesn't include 'break', so this condition is removed
    
    set(dailyStatsAtom, {
      ...dailyStats,
      [today]: todayStats
    });
    
    // Limpar sessão atual
    set(currentSessionAtom, null);
    set(isTrackingAtom, false);
  }
);

export const pauseSessionAtom = atom(
  null,
  (get, set) => {
    const currentSession = get(currentSessionAtom);
    
    if (!currentSession) return;
    
    const currentInterruptions = currentSession.metadata?.interruptions;
    const interruptionCount = typeof currentInterruptions === 'number' ? currentInterruptions : 0;

    const pausedSession: FocusSession = {
      ...currentSession,
      interrupted: true,
      metadata: {
        ...currentSession.metadata,
        pausedAt: new Date().toISOString(),
        interruptions: interruptionCount + 1
      }
    };
    
    set(currentSessionAtom, pausedSession);
    set(isTrackingAtom, false);
  }
);

export const resumeSessionAtom = atom(
  null,
  (get, set) => {
    const currentSession = get(currentSessionAtom);
    
    if (!currentSession) return;
    
    const resumedSession: FocusSession = {
      ...currentSession,
      metadata: {
        ...currentSession.metadata,
        resumedAt: new Date().toISOString()
      }
    };
    
    set(currentSessionAtom, resumedSession);
    set(isTrackingAtom, true);
    set(lastActivityAtom, new Date());
  }
);

export const addScheduledEventAtom = atom(
  null,
  (get, set, event: Omit<ScheduledEvent, 'id'>) => {
    const events = get(scheduledEventsAtom);
    const newEvent: ScheduledEvent = {
      ...event,
      id: crypto.randomUUID()
    };
    
    set(scheduledEventsAtom, [...events, newEvent]);
  }
);

export const updateScheduledEventAtom = atom(
  null,
  (get, set, { id, updates }: { id: string; updates: Partial<ScheduledEvent> }) => {
    const events = get(scheduledEventsAtom);
    const updatedEvents = events.map(event => 
      event.id === id ? { ...event, ...updates } : event
    );
    
    set(scheduledEventsAtom, updatedEvents);
  }
);

export const deleteScheduledEventAtom = atom(
  null,
  (get, set, id: string) => {
    const events = get(scheduledEventsAtom);
    const filteredEvents = events.filter(event => event.id !== id);
    
    set(scheduledEventsAtom, filteredEvents);
  }
);

export const markEventCompletedAtom = atom(
  null,
  (get, set, id: string) => {
    const events = get(scheduledEventsAtom);
    const updatedEvents = events.map(event => 
      event.id === id ? { ...event, completed: true } : event
    );
    
    set(scheduledEventsAtom, updatedEvents);
  }
);
