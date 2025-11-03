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

  describe('importEventsFromICS', () => {
    const toIcsDate = (date: Date): string =>
      date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');

    it('should parse future events and skip past ones by default', () => {
      const now = Date.now();
      const futureStart = new Date(now + 7 * 24 * 60 * 60 * 1000);
      const futureEnd = new Date(futureStart.getTime() + 60 * 60 * 1000);
      const pastStart = new Date(now - 7 * 24 * 60 * 60 * 1000);
      const pastEnd = new Date(pastStart.getTime() + 60 * 60 * 1000);
      [futureStart, futureEnd, pastStart, pastEnd].forEach(date => date.setUTCSeconds(0, 0));

      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        'UID:future-event@example.com',
        'SUMMARY:Future Planning Session',
        'DESCRIPTION:Discuss roadmap for the next quarter',
        `DTSTART:${toIcsDate(futureStart)}`,
        `DTEND:${toIcsDate(futureEnd)}`,
        'LOCATION:Google Meet',
        'CATEGORIES:Meeting',
        'END:VEVENT',
        'BEGIN:VEVENT',
        'UID:past-event@example.com',
        'SUMMARY:Past Alignment',
        `DTSTART:${toIcsDate(pastStart)}`,
        `DTEND:${toIcsDate(pastEnd)}`,
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\n');

      const events = CalendarService.importEventsFromICS(icsContent);

      expect(events).toHaveLength(1);
      expect(events[0].title).toBe('Future Planning Session');
      expect(events[0].type).toBe('meeting');
      expect(events[0].metadata).toMatchObject({
        source: 'ics',
        location: 'Google Meet',
        sourceUid: 'future-event@example.com'
      });
      expect(events[0].scheduledTime.toISOString()).toBe(futureStart.toISOString());
    });

    it('should respect skipPastEvents option', () => {
      const now = Date.now();
      const pastStart = new Date(now - 3 * 24 * 60 * 60 * 1000);
      const pastEnd = new Date(pastStart.getTime() + 90 * 60 * 1000);
      [pastStart, pastEnd].forEach(date => date.setUTCSeconds(0, 0));

      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        'UID:retrospective@example.com',
        'SUMMARY:Team Retrospective',
        `DTSTART:${toIcsDate(pastStart)}`,
        `DTEND:${toIcsDate(pastEnd)}`,
        'CATEGORIES:Workshop',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\n');

      const events = CalendarService.importEventsFromICS(icsContent, {
        skipPastEvents: false,
        defaultEventType: 'custom'
      });

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('custom');
      expect(events[0].metadata?.endTime).toBe(pastEnd.toISOString());
    });

    it('should map categories using provided type map', () => {
      const futureStart = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      const futureEnd = new Date(futureStart.getTime() + 30 * 60 * 1000);
      [futureStart, futureEnd].forEach(date => date.setUTCSeconds(0, 0));

      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        'UID:break@example.com',
        'SUMMARY:Quick Break',
        `DTSTART:${toIcsDate(futureStart)}`,
        `DTEND:${toIcsDate(futureEnd)}`,
        'CATEGORIES:Break',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\n');

      const events = CalendarService.importEventsFromICS(icsContent, {
        categoryTypeMap: { break: 'break' }
      });

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('break');
      expect(events[0].metadata?.isAllDay).toBeUndefined();
    });
  });
});
