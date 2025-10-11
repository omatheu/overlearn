export interface WorkingHours {
  start: string; // "09:00"
  end: string;   // "18:00"
  timezone: string;
  workDays: number[]; // [1,2,3,4,5] = Segunda a Sexta
}

export interface FocusSession {
  id: string;
  taskId?: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // minutos
  type: 'pomodoro' | 'study' | 'work';
  interrupted: boolean;
  metadata?: Record<string, unknown>;
}

export interface ScheduledEvent {
  id: string;
  title: string;
  type: 'flashcard' | 'break' | 'reminder' | 'custom';
  scheduledTime: Date;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    interval: number;
    endDate?: Date;
  };
  metadata?: Record<string, unknown>;
  completed?: boolean;
}

export interface DailyStats {
  date: Date;
  totalFocusTime: number; // minutos
  sessionsCompleted: number;
  tasksCompleted: number;
  flashcardsReviewed: number;
  breaksTaken: number;
  productivityScore?: number; // 0-100
}

export interface WeeklyStats {
  weekStart: Date;
  weekEnd: Date;
  totalFocusTime: number;
  averageSessionLength: number;
  tasksCompleted: number;
  flashcardsReviewed: number;
  workingDaysCount: number;
  productivityTrend: 'up' | 'down' | 'stable';
}

export interface CalendarConfig {
  workingHours: WorkingHours;
  pomodoroSettings: {
    workDuration: number; // minutos
    shortBreakDuration: number;
    longBreakDuration: number;
    sessionsUntilLongBreak: number;
  };
  notifications: {
    enabled: boolean;
    upcomingEventMinutes: number;
    breakReminders: boolean;
    focusSessionEnd: boolean;
  };
  autoTracking: {
    enabled: boolean;
    detectIdleTime: number; // minutos
    pauseOnIdle: boolean;
  };
}

export interface TimeSlot {
  start: Date;
  end: Date;
  type: 'work' | 'break' | 'focus' | 'idle';
  taskId?: string;
  sessionId?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'task' | 'flashcard' | 'break' | 'meeting' | 'custom';
  color?: string;
  metadata?: Record<string, unknown>;
}

export interface FocusMetrics {
  totalTimeToday: number;
  averageSessionLength: number;
  longestStreak: number;
  currentStreak: number;
  interruptionsCount: number;
  efficiencyScore: number; // 0-100
}

export interface CalendarState {
  currentSession: FocusSession | null;
  workingHours: WorkingHours;
  scheduledEvents: ScheduledEvent[];
  dailyStats: Record<string, DailyStats>;
  config: CalendarConfig;
  isTracking: boolean;
  lastActivity: Date;
}

// Tipos para hooks
export interface UseCalendarReturn {
  isWorkingNow: boolean;
  currentSession: FocusSession | null;
  startSession: (type: FocusSession['type'], taskId?: string) => void;
  endSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  getTimeUntilNextEvent: () => number;
  getDailyOverview: (date?: Date) => {
    tasksToday: unknown[];
    flashcardsDue: unknown[];
    focusTimeToday: number;
    upcomingEvents: ScheduledEvent[];
  };
}

export interface UseWorkingHoursReturn {
  workingHours: WorkingHours;
  setWorkingHours: (hours: WorkingHours) => void;
  isWithinWorkingHours: (date?: Date) => boolean;
  getWorkingTimeRemaining: () => number; // minutos
  getNextWorkingDay: () => Date;
}

export interface UseTimerTrackingReturn {
  currentSession: FocusSession | null;
  isTracking: boolean;
  elapsedTime: number; // segundos
  startTimer: (type: FocusSession['type'], taskId?: string) => void;
  stopTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
}

export interface UseScheduledEventsReturn {
  events: ScheduledEvent[];
  addEvent: (event: Omit<ScheduledEvent, 'id'>) => void;
  updateEvent: (id: string, updates: Partial<ScheduledEvent>) => void;
  deleteEvent: (id: string) => void;
  getUpcomingEvents: (limit?: number) => ScheduledEvent[];
  markEventCompleted: (id: string) => void;
  getEventsForDate: (date: Date) => ScheduledEvent[];
}
