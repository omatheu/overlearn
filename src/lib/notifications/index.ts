/**
 * Notification System
 * Central export point for all notification services
 */

export { emailService } from "./email-service";
export { pomodoroNotifier } from "./pomodoro-notifier";
export { studyGoalTracker } from "./study-goal-tracker";
export { notificationScheduler } from "./scheduler";

// Re-export types
export type { PomodoroEventType } from "./pomodoro-notifier";
