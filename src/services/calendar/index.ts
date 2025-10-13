// Core service
export { CalendarService } from './CalendarService';

// Types
export type {
  WorkingHours,
  FocusSession,
  ScheduledEvent,
  DailyStats,
  WeeklyStats,
  CalendarConfig,
  TimeSlot,
  CalendarEvent,
  FocusMetrics,
  CalendarState,
  UseCalendarReturn,
  UseWorkingHoursReturn,
  UseTimerTrackingReturn,
  UseScheduledEventsReturn
} from './types';

// Utils
export {
  timeStringToMinutes,
  minutesToTimeString,
  isWithinWorkingHours,
  getWorkingTimeRemaining,
  getNextWorkingDay,
  getTimeUntilNextEvent,
  getEventsForDate,
  getUpcomingEvents,
  calculateSessionStats,
  groupSessionsByDay,
  calculateDailyStats,
  formatDuration,
  formatTimeRemaining,
  isToday,
  isTomorrow,
  getWeekStart,
  getWeekEnd,
  generateId,
  validateWorkingHours
} from './utils';

// Atoms
export {
  workingHoursAtom,
  calendarConfigAtom,
  currentSessionAtom,
  isTrackingAtom,
  lastActivityAtom,
  scheduledEventsAtom,
  dailyStatsAtom,
  focusSessionsAtom,
  isWorkingNowAtom,
  todayStatsAtom,
  upcomingEventsAtom,
  timeUntilNextEventAtom,
  currentSessionDurationAtom,
  workingTimeRemainingAtom,
  startSessionAtom,
  endSessionAtom,
  pauseSessionAtom,
  resumeSessionAtom,
  addScheduledEventAtom,
  updateScheduledEventAtom,
  deleteScheduledEventAtom,
  markEventCompletedAtom
} from './atoms';

// Hooks
export { useCalendar } from './hooks/useCalendar';
export { useWorkingHours } from './hooks/useWorkingHours';
export { useTimerTracking } from './hooks/useTimerTracking';
export { useScheduledEvents } from './hooks/useScheduledEvents';
