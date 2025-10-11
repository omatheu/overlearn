import { WorkingHours, ScheduledEvent, DailyStats, FocusSession } from './types';

/**
 * Converte string de horário (HH:MM) para minutos desde meia-noite
 */
export function timeStringToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Converte minutos desde meia-noite para string de horário (HH:MM)
 */
export function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Verifica se uma data está dentro do horário de trabalho
 */
export function isWithinWorkingHours(
  workingHours: WorkingHours,
  date: Date = new Date()
): boolean {
  const currentDay = date.getDay();
  if (!workingHours.workDays.includes(currentDay)) {
    return false;
  }

  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  const startMinutes = timeStringToMinutes(workingHours.start);
  const endMinutes = timeStringToMinutes(workingHours.end);

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

/**
 * Calcula quantos minutos restam até o fim do horário de trabalho
 */
export function getWorkingTimeRemaining(
  workingHours: WorkingHours,
  date: Date = new Date()
): number {
  if (!isWithinWorkingHours(workingHours, date)) {
    return 0;
  }

  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  const endMinutes = timeStringToMinutes(workingHours.end);
  
  return Math.max(0, endMinutes - currentMinutes);
}

/**
 * Retorna a próxima data de trabalho
 */
export function getNextWorkingDay(workingHours: WorkingHours, fromDate: Date = new Date()): Date {
  const nextDate = new Date(fromDate);
  nextDate.setDate(nextDate.getDate() + 1);
  
  while (!workingHours.workDays.includes(nextDate.getDay())) {
    nextDate.setDate(nextDate.getDate() + 1);
  }
  
  return nextDate;
}

/**
 * Calcula o tempo até o próximo evento agendado
 */
export function getTimeUntilNextEvent(events: ScheduledEvent[]): number {
  const now = new Date();
  const upcomingEvents = events
    .filter(e => !e.completed && new Date(e.scheduledTime) > now)
    .sort((a, b) => 
      new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
    );

  if (upcomingEvents.length === 0) return -1;
  
  return new Date(upcomingEvents[0].scheduledTime).getTime() - now.getTime();
}

/**
 * Filtra eventos agendados para uma data específica
 */
export function getEventsForDate(events: ScheduledEvent[], date: Date): ScheduledEvent[] {
  const dateStr = date.toISOString().split('T')[0];
  
  return events.filter(event => {
    const eventDate = new Date(event.scheduledTime).toISOString().split('T')[0];
    return eventDate === dateStr;
  });
}

/**
 * Retorna eventos próximos (dentro de X minutos)
 */
export function getUpcomingEvents(events: ScheduledEvent[], minutesAhead: number = 60): ScheduledEvent[] {
  const now = new Date();
  const futureTime = new Date(now.getTime() + minutesAhead * 60000);
  
  return events
    .filter(e => !e.completed)
    .filter(e => {
      const eventTime = new Date(e.scheduledTime);
      return eventTime > now && eventTime <= futureTime;
    })
    .sort((a, b) => 
      new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
    );
}

/**
 * Calcula estatísticas de uma sessão de foco
 */
export function calculateSessionStats(session: FocusSession): {
  duration: number;
  efficiency: number;
  interruptions: number;
} {
  const duration = session.endTime 
    ? Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 60000)
    : Math.floor((new Date().getTime() - session.startTime.getTime()) / 60000);
  
  return {
    duration,
    efficiency: session.interrupted ? Math.max(0, 100 - (session.metadata?.interruptions || 0) * 10) : 100,
    interruptions: session.metadata?.interruptions || 0
  };
}

/**
 * Agrupa sessões por dia
 */
export function groupSessionsByDay(sessions: FocusSession[]): Record<string, FocusSession[]> {
  return sessions.reduce((acc, session) => {
    const dateKey = session.startTime.toISOString().split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(session);
    return acc;
  }, {} as Record<string, FocusSession[]>);
}

/**
 * Calcula estatísticas diárias baseadas nas sessões
 */
export function calculateDailyStats(
  sessions: FocusSession[],
  date: Date = new Date()
): DailyStats {
  const dateKey = date.toISOString().split('T')[0];
  const daySessions = sessions.filter(s => 
    s.startTime.toISOString().split('T')[0] === dateKey
  );

  const totalFocusTime = daySessions.reduce((total, session) => {
    const stats = calculateSessionStats(session);
    return total + stats.duration;
  }, 0);

  const sessionsCompleted = daySessions.filter(s => s.endTime).length;
  const interruptionsCount = daySessions.reduce((total, session) => {
    return total + (session.metadata?.interruptions || 0);
  }, 0);

  const productivityScore = sessionsCompleted > 0 
    ? Math.max(0, Math.min(100, 100 - (interruptionsCount * 5)))
    : 0;

  return {
    date,
    totalFocusTime,
    sessionsCompleted,
    tasksCompleted: 0, // Será calculado pelo sistema de tasks
    flashcardsReviewed: 0, // Será calculado pelo sistema de flashcards
    breaksTaken: daySessions.filter(s => s.type === 'break').length,
    productivityScore
  };
}

/**
 * Formata duração em minutos para string legível
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Formata tempo restante para string legível
 */
export function formatTimeRemaining(milliseconds: number): string {
  if (milliseconds <= 0) return '0m';
  
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  
  if (minutes < 60) {
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Verifica se uma data é hoje
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

/**
 * Verifica se uma data é amanhã
 */
export function isTomorrow(date: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
}

/**
 * Retorna a data de início da semana (segunda-feira)
 */
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajusta para segunda-feira
  return new Date(d.setDate(diff));
}

/**
 * Retorna a data de fim da semana (domingo)
 */
export function getWeekEnd(date: Date = new Date()): Date {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return weekEnd;
}

/**
 * Gera ID único para eventos/sessões
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Valida configuração de horário de trabalho
 */
export function validateWorkingHours(workingHours: WorkingHours): string[] {
  const errors: string[] = [];
  
  if (!workingHours.start || !workingHours.end) {
    errors.push('Horário de início e fim são obrigatórios');
  }
  
  if (workingHours.start && workingHours.end) {
    const startMinutes = timeStringToMinutes(workingHours.start);
    const endMinutes = timeStringToMinutes(workingHours.end);
    
    if (startMinutes >= endMinutes) {
      errors.push('Horário de início deve ser anterior ao horário de fim');
    }
  }
  
  if (!workingHours.workDays || workingHours.workDays.length === 0) {
    errors.push('Pelo menos um dia de trabalho deve ser selecionado');
  }
  
  if (workingHours.workDays.some(day => day < 0 || day > 6)) {
    errors.push('Dias de trabalho devem estar entre 0 (domingo) e 6 (sábado)');
  }
  
  return errors;
}
