import { 
  WorkingHours, 
  FocusSession, 
  ScheduledEvent, 
  DailyStats, 
  CalendarConfig,
  FocusMetrics,
  WeeklyStats
} from './types';
import {
  isWithinWorkingHours,
  getWorkingTimeRemaining,
  getNextWorkingDay,
  getTimeUntilNextEvent,
  getEventsForDate,
  getUpcomingEvents,
  calculateSessionStats,
  groupSessionsByDay,
  getWeekStart,
  getWeekEnd,
  generateId,
  validateWorkingHours
} from './utils';

export class CalendarService {
  /**
   * Verifica se está dentro do horário de trabalho
   */
  static isWithinWorkingHours(
    workingHours: WorkingHours,
    now: Date = new Date()
  ): boolean {
    return isWithinWorkingHours(workingHours, now);
  }

  /**
   * Calcula tempo restante até o fim do horário de trabalho
   */
  static getWorkingTimeRemaining(
    workingHours: WorkingHours,
    now: Date = new Date()
  ): number {
    return getWorkingTimeRemaining(workingHours, now);
  }

  /**
   * Retorna a próxima data de trabalho
   */
  static getNextWorkingDay(
    workingHours: WorkingHours,
    fromDate: Date = new Date()
  ): Date {
    return getNextWorkingDay(workingHours, fromDate);
  }

  /**
   * Calcula tempo até próximo evento agendado
   */
  static getTimeUntilNextEvent(events: ScheduledEvent[]): number {
    return getTimeUntilNextEvent(events);
  }

  /**
   * Retorna eventos para uma data específica
   */
  static getEventsForDate(events: ScheduledEvent[], date: Date): ScheduledEvent[] {
    return getEventsForDate(events, date);
  }

  /**
   * Retorna eventos próximos (dentro de X minutos)
   */
  static getUpcomingEvents(
    events: ScheduledEvent[], 
    minutesAhead: number = 60
  ): ScheduledEvent[] {
    return getUpcomingEvents(events, minutesAhead);
  }

  /**
   * Registra uma sessão de foco
   */
  static recordFocusSession(session: FocusSession): void {
    // Esta função será chamada pelos atoms do Jotai
    // A persistência é feita automaticamente via atomWithStorage
    console.log('Focus session recorded:', session);
  }

  /**
   * Gera overview diário
   */
  static generateDailyOverview(
    date: Date = new Date(),
    events: ScheduledEvent[] = [],
    sessions: FocusSession[] = []
  ): {
    tasksToday: unknown[];
    flashcardsDue: unknown[];
    focusTimeToday: number;
    upcomingEvents: ScheduledEvent[];
    eventsToday: ScheduledEvent[];
    sessionsToday: FocusSession[];
    productivityScore: number;
  } {
    const eventsToday = this.getEventsForDate(events, date);
    const sessionsToday = sessions.filter(s => 
      s.startTime.toISOString().split('T')[0] === date.toISOString().split('T')[0]
    );
    
    const focusTimeToday = sessionsToday.reduce((total, session) => {
      const stats = calculateSessionStats(session);
      return total + stats.duration;
    }, 0);

    const upcomingEvents = this.getUpcomingEvents(events, 120); // Próximas 2 horas

    const interruptionsCount = sessionsToday.reduce((total, session) => {
      return total + (session.metadata?.interruptions || 0);
    }, 0);

    const productivityScore = sessionsToday.length > 0 
      ? Math.max(0, Math.min(100, 100 - (interruptionsCount * 5)))
      : 0;

    return {
      tasksToday: [], // Será integrado com o sistema de tasks
      flashcardsDue: [], // Será integrado com o sistema de flashcards
      focusTimeToday,
      upcomingEvents,
      eventsToday,
      sessionsToday,
      productivityScore
    };
  }

  /**
   * Calcula métricas de foco
   */
  static calculateFocusMetrics(sessions: FocusSession[]): FocusMetrics {
    const today = new Date();
    const todaySessions = sessions.filter(s => 
      s.startTime.toISOString().split('T')[0] === today.toISOString().split('T')[0]
    );

    const totalTimeToday = todaySessions.reduce((total, session) => {
      const stats = calculateSessionStats(session);
      return total + stats.duration;
    }, 0);

    const completedSessions = sessions.filter(s => s.endTime);
    const averageSessionLength = completedSessions.length > 0
      ? completedSessions.reduce((total, session) => total + session.duration, 0) / completedSessions.length
      : 0;

    const interruptionsCount = sessions.reduce((total, session) => {
      return total + (session.metadata?.interruptions || 0);
    }, 0);

    // Calcular streak atual
    const sortedSessions = sessions
      .filter(s => s.endTime)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const sessionsByDay = groupSessionsByDay(sortedSessions);
    const sortedDays = Object.keys(sessionsByDay).sort().reverse();

    for (const day of sortedDays) {
      if (sessionsByDay[day].length > 0) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
        
        if (currentStreak === 0) {
          currentStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
        if (currentStreak > 0) break;
      }
    }

    const efficiencyScore = sessions.length > 0
      ? Math.max(0, Math.min(100, 100 - (interruptionsCount / sessions.length) * 20))
      : 0;

    return {
      totalTimeToday,
      averageSessionLength,
      longestStreak,
      currentStreak,
      interruptionsCount,
      efficiencyScore
    };
  }

  /**
   * Calcula estatísticas semanais
   */
  static calculateWeeklyStats(
    sessions: FocusSession[],
    date: Date = new Date()
  ): WeeklyStats {
    const weekStart = getWeekStart(date);
    const weekEnd = getWeekEnd(date);
    
    const weekSessions = sessions.filter(session => {
      const sessionDate = session.startTime;
      return sessionDate >= weekStart && sessionDate <= weekEnd;
    });

    const completedSessions = weekSessions.filter(s => s.endTime);
    const totalFocusTime = completedSessions.reduce((total, session) => {
      return total + session.duration;
    }, 0);

    const averageSessionLength = completedSessions.length > 0
      ? totalFocusTime / completedSessions.length
      : 0;

    // Calcular dias úteis da semana
    const workingDaysCount = Math.ceil((weekEnd.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Calcular tendência de produtividade (simplificado)
    const midWeek = new Date(weekStart.getTime() + (weekEnd.getTime() - weekStart.getTime()) / 2);
    const firstHalfSessions = weekSessions.filter(s => s.startTime <= midWeek);
    const secondHalfSessions = weekSessions.filter(s => s.startTime > midWeek);

    const firstHalfTime = firstHalfSessions.reduce((total, s) => total + (s.duration || 0), 0);
    const secondHalfTime = secondHalfSessions.reduce((total, s) => total + (s.duration || 0), 0);

    let productivityTrend: 'up' | 'down' | 'stable' = 'stable';
    if (secondHalfTime > firstHalfTime * 1.1) {
      productivityTrend = 'up';
    } else if (secondHalfTime < firstHalfTime * 0.9) {
      productivityTrend = 'down';
    }

    return {
      weekStart,
      weekEnd,
      totalFocusTime,
      averageSessionLength,
      tasksCompleted: 0, // Será integrado com o sistema de tasks
      flashcardsReviewed: 0, // Será integrado com o sistema de flashcards
      workingDaysCount,
      productivityTrend
    };
  }

  /**
   * Agenda um evento recorrente
   */
  static scheduleRecurringEvent(
    baseEvent: Omit<ScheduledEvent, 'id'>,
    frequency: 'daily' | 'weekly' | 'monthly',
    interval: number = 1,
    endDate?: Date
  ): ScheduledEvent[] {
    const events: ScheduledEvent[] = [];
    const currentDate = new Date(baseEvent.scheduledTime);
    const maxDate = endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 ano

    while (currentDate <= maxDate) {
      const event: ScheduledEvent = {
        ...baseEvent,
        id: generateId(),
        scheduledTime: new Date(currentDate),
        recurring: {
          frequency,
          interval,
          endDate
        }
      };

      events.push(event);

      // Calcular próxima data
      switch (frequency) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + interval);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + (7 * interval));
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + interval);
          break;
      }
    }

    return events;
  }

  /**
   * Valida configuração do calendário
   */
  static validateConfig(config: CalendarConfig): string[] {
    const errors: string[] = [];
    
    // Validar horário de trabalho
    const workingHoursErrors = validateWorkingHours(config.workingHours);
    errors.push(...workingHoursErrors);

    // Validar configurações do pomodoro
    if (config.pomodoroSettings.workDuration <= 0) {
      errors.push('Duração da sessão de trabalho deve ser maior que 0');
    }

    if (config.pomodoroSettings.shortBreakDuration <= 0) {
      errors.push('Duração da pausa curta deve ser maior que 0');
    }

    if (config.pomodoroSettings.longBreakDuration <= 0) {
      errors.push('Duração da pausa longa deve ser maior que 0');
    }

    if (config.pomodoroSettings.sessionsUntilLongBreak <= 0) {
      errors.push('Número de sessões até pausa longa deve ser maior que 0');
    }

    // Validar configurações de notificação
    if (config.notifications.upcomingEventMinutes < 0) {
      errors.push('Minutos para notificação de evento deve ser maior ou igual a 0');
    }

    // Validar configurações de auto-tracking
    if (config.autoTracking.detectIdleTime <= 0) {
      errors.push('Tempo de detecção de inatividade deve ser maior que 0');
    }

    return errors;
  }

  /**
   * Formata estatísticas para exibição
   */
  static formatStatsForDisplay(stats: DailyStats): {
    focusTime: string;
    sessions: string;
    productivity: string;
  } {
    return {
      focusTime: formatDuration(stats.totalFocusTime),
      sessions: `${stats.sessionsCompleted} sessões`,
      productivity: `${stats.productivityScore || 0}%`
    };
  }

  /**
   * Detecta padrões de produtividade
   */
  static detectProductivityPatterns(sessions: FocusSession[]): {
    bestTimeOfDay: string;
    mostProductiveDay: string;
    averageSessionLength: number;
    recommendations: string[];
  } {
    const sessionsByHour: Record<number, FocusSession[]> = {};
    const sessionsByDay: Record<number, FocusSession[]> = {};

    sessions.forEach(session => {
      const hour = session.startTime.getHours();
      const day = session.startTime.getDay();

      if (!sessionsByHour[hour]) sessionsByHour[hour] = [];
      if (!sessionsByDay[day]) sessionsByDay[day] = [];

      sessionsByHour[hour].push(session);
      sessionsByDay[day].push(session);
    });

    // Encontrar melhor horário do dia
    let bestHour = 9;
    let maxHourProductivity = 0;

    Object.entries(sessionsByHour).forEach(([hour, hourSessions]) => {
      const totalTime = hourSessions.reduce((total, s) => total + s.duration, 0);
      if (totalTime > maxHourProductivity) {
        maxHourProductivity = totalTime;
        bestHour = parseInt(hour);
      }
    });

    // Encontrar dia mais produtivo
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    let bestDay = 1;
    let maxDayProductivity = 0;

    Object.entries(sessionsByDay).forEach(([day, daySessions]) => {
      const totalTime = daySessions.reduce((total, s) => total + s.duration, 0);
      if (totalTime > maxDayProductivity) {
        maxDayProductivity = totalTime;
        bestDay = parseInt(day);
      }
    });

    const averageSessionLength = sessions.length > 0
      ? sessions.reduce((total, s) => total + s.duration, 0) / sessions.length
      : 0;

    const recommendations: string[] = [];
    
    if (bestHour >= 9 && bestHour <= 11) {
      recommendations.push('Você é mais produtivo pela manhã. Agende tarefas importantes neste período.');
    } else if (bestHour >= 14 && bestHour <= 16) {
      recommendations.push('Você é mais produtivo à tarde. Reserve este horário para trabalhos complexos.');
    }

    if (averageSessionLength < 20) {
      recommendations.push('Considere aumentar a duração das sessões para melhorar o foco.');
    } else if (averageSessionLength > 60) {
      recommendations.push('Sessões muito longas podem causar fadiga. Considere pausas mais frequentes.');
    }

    return {
      bestTimeOfDay: `${bestHour}:00`,
      mostProductiveDay: dayNames[bestDay],
      averageSessionLength,
      recommendations
    };
  }
}
