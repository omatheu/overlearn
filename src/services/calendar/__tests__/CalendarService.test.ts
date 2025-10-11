import { CalendarService } from '../CalendarService';
import { formatDuration } from '../utils';
import { WorkingHours, FocusSession, ScheduledEvent } from '../types';

describe('CalendarService', () => {
  const mockWorkingHours: WorkingHours = {
    start: '09:00',
    end: '18:00',
    timezone: 'America/Sao_Paulo',
    workDays: [1, 2, 3, 4, 5] // Segunda a Sexta
  };

  describe('isWithinWorkingHours', () => {
    it('should return true for working hours on work days', () => {
      const mondayMorning = new Date('2024-01-15T10:00:00'); // Segunda-feira 10:00
      expect(CalendarService.isWithinWorkingHours(mockWorkingHours, mondayMorning)).toBe(true);
    });

    it('should return false for non-working hours', () => {
      const mondayEvening = new Date('2024-01-15T20:00:00'); // Segunda-feira 20:00
      expect(CalendarService.isWithinWorkingHours(mockWorkingHours, mondayEvening)).toBe(false);
    });

    it('should return false for weekends', () => {
      const saturdayMorning = new Date('2024-01-13T10:00:00'); // Sábado 10:00
      expect(CalendarService.isWithinWorkingHours(mockWorkingHours, saturdayMorning)).toBe(false);
    });
  });

  describe('getWorkingTimeRemaining', () => {
    it('should calculate remaining working time correctly', () => {
      const mondayAfternoon = new Date('2024-01-15T14:00:00'); // Segunda-feira 14:00
      const remaining = CalendarService.getWorkingTimeRemaining(mockWorkingHours, mondayAfternoon);
      expect(remaining).toBe(240); // 4 horas = 240 minutos
    });

    it('should return 0 for non-working hours', () => {
      const mondayEvening = new Date('2024-01-15T20:00:00'); // Segunda-feira 20:00
      const remaining = CalendarService.getWorkingTimeRemaining(mockWorkingHours, mondayEvening);
      expect(remaining).toBe(0);
    });
  });

  describe('getTimeUntilNextEvent', () => {
    it('should return -1 when no upcoming events', () => {
      const events: ScheduledEvent[] = [];
      const timeUntil = CalendarService.getTimeUntilNextEvent(events);
      expect(timeUntil).toBe(-1);
    });

    it('should return time until next event', () => {
      const now = new Date();
      const futureTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hora no futuro
      
      const events: ScheduledEvent[] = [
        {
          id: '1',
          title: 'Test Event',
          type: 'reminder',
          scheduledTime: futureTime,
          completed: false
        }
      ];

      const timeUntil = CalendarService.getTimeUntilNextEvent(events);
      expect(timeUntil).toBeGreaterThan(0);
      expect(timeUntil).toBeLessThan(61 * 60 * 1000); // Menos de 61 minutos
    });
  });

  describe('validateConfig', () => {
    it('should validate working hours correctly', () => {
      const validConfig = {
        workingHours: mockWorkingHours,
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

      const errors = CalendarService.validateConfig(validConfig);
      expect(errors).toHaveLength(0);
    });

    it('should detect invalid working hours', () => {
      const invalidConfig = {
        workingHours: {
          start: '18:00',
          end: '09:00', // Fim antes do início
          timezone: 'America/Sao_Paulo',
          workDays: [1, 2, 3, 4, 5]
        },
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

      const errors = CalendarService.validateConfig(invalidConfig);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('início deve ser anterior');
    });
  });

  describe('detectProductivityPatterns', () => {
    it('should detect productivity patterns', () => {
      const sessions: FocusSession[] = [
        {
          id: '1',
          startTime: new Date('2024-01-15T09:00:00'),
          endTime: new Date('2024-01-15T09:30:00'),
          duration: 30,
          type: 'work',
          interrupted: false
        },
        {
          id: '2',
          startTime: new Date('2024-01-15T10:00:00'),
          endTime: new Date('2024-01-15T10:45:00'),
          duration: 45,
          type: 'work',
          interrupted: false
        }
      ];

      const patterns = CalendarService.detectProductivityPatterns(sessions);
      
      expect(patterns.bestTimeOfDay).toBeDefined();
      expect(patterns.mostProductiveDay).toBeDefined();
      expect(patterns.averageSessionLength).toBe(37.5);
      expect(patterns.recommendations).toBeInstanceOf(Array);
    });
  });

  describe('formatDuration', () => {
    it('should format duration correctly', () => {
      expect(formatDuration(30)).toBe('30m');
      expect(formatDuration(60)).toBe('1h');
      expect(formatDuration(90)).toBe('1h 30m');
    });
  });

  describe('generateDailyOverview', () => {
    it('should generate overview with basic structure', () => {
      const overview = CalendarService.generateDailyOverview();
      
      expect(overview).toHaveProperty('tasksToday');
      expect(overview).toHaveProperty('flashcardsDue');
      expect(overview).toHaveProperty('focusTimeToday');
      expect(overview).toHaveProperty('upcomingEvents');
      expect(overview).toHaveProperty('eventsToday');
      expect(overview).toHaveProperty('sessionsToday');
      expect(overview).toHaveProperty('productivityScore');
    });
  });
});