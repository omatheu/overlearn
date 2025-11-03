import { schedule, ScheduledTask } from "node-cron";
import { studyGoalTracker } from "./study-goal-tracker";
import { emailService } from "./email-service";

/**
 * Notification Scheduler
 * Manages cron jobs for periodic notification checks
 */

class NotificationScheduler {
  private jobs: Map<string, ScheduledTask> = new Map();
  private isInitialized: boolean = false;

  /**
   * Initialize and start all scheduled jobs
   */
  public initialize(): void {
    if (this.isInitialized) {
      console.warn("[NotificationScheduler] Already initialized");
      return;
    }

    console.log("[NotificationScheduler] Initializing notification scheduler...");

    // Test email connection on startup
    this.testEmailConnection();

    // Schedule study goal milestone checks (every 6 hours)
    this.scheduleJob(
      "study-goal-milestones",
      "0 */6 * * *", // At minute 0 past every 6th hour
      async () => {
        console.log("[Cron] Running study goal milestone check...");
        await studyGoalTracker.checkMilestones();
      }
    );

    // Schedule study goal deadline checks (daily at 9:00 AM)
    this.scheduleJob(
      "study-goal-deadlines",
      "0 9 * * *", // At 09:00 every day
      async () => {
        console.log("[Cron] Running study goal deadline check...");
        await studyGoalTracker.checkDeadlines();
      }
    );

    // Schedule cleanup of old read notifications (daily at 3:00 AM)
    this.scheduleJob(
      "cleanup-old-notifications",
      "0 3 * * *", // At 03:00 every day
      async () => {
        console.log("[Cron] Cleaning up old notifications...");
        await this.cleanupOldNotifications();
      }
    );

    // Run initial checks
    this.runInitialChecks();

    this.isInitialized = true;
    console.log(
      `[NotificationScheduler] Initialized with ${this.jobs.size} scheduled jobs`
    );
  }

  /**
   * Schedule a cron job
   */
  private scheduleJob(
    name: string,
    cronExpression: string,
    task: () => Promise<void>
  ): void {
    try {
      const job = schedule(
        cronExpression,
        async () => {
          try {
            await task();
          } catch (error) {
            console.error(`[Cron] Error in job "${name}":`, error);
          }
        },
        {
          timezone: process.env.TZ || "America/Sao_Paulo",
        }
      );

      job.start();

      this.jobs.set(name, job);
      console.log(
        `[NotificationScheduler] Scheduled job "${name}" with cron: ${cronExpression}`
      );
    } catch (error) {
      console.error(`[NotificationScheduler] Failed to schedule job "${name}":`, error);
    }
  }

  /**
   * Run initial checks on startup
   */
  private async runInitialChecks(): Promise<void> {
    console.log("[NotificationScheduler] Running initial checks...");

    try {
      // Run study goal checks on startup
      await studyGoalTracker.checkMilestones();
      await studyGoalTracker.checkDeadlines();

      console.log("[NotificationScheduler] Initial checks completed");
    } catch (error) {
      console.error("[NotificationScheduler] Error in initial checks:", error);
    }
  }

  /**
   * Test email connection
   */
  private async testEmailConnection(): Promise<void> {
    if (emailService.isReady()) {
      const isConnected = await emailService.testConnection();
      if (isConnected) {
        console.log("[NotificationScheduler] Email service is ready");
      } else {
        console.warn(
          "[NotificationScheduler] Email service connection test failed"
        );
      }
    } else {
      console.log(
        "[NotificationScheduler] Email service not configured (this is optional)"
      );
    }
  }

  /**
   * Cleanup old read notifications (older than 30 days)
   */
  private async cleanupOldNotifications(): Promise<void> {
    try {
      const { prisma } = await import("@/lib/db/prisma");

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await prisma.notification.deleteMany({
        where: {
          isRead: true,
          createdAt: {
            lt: thirtyDaysAgo,
          },
        },
      });

      console.log(
        `[NotificationScheduler] Cleaned up ${result.count} old notifications`
      );
    } catch (error) {
      console.error(
        "[NotificationScheduler] Error cleaning up notifications:",
        error
      );
    }
  }

  /**
   * Stop a specific job
   */
  public stopJob(name: string): void {
    const job = this.jobs.get(name);
    if (job) {
      job.stop();
      this.jobs.delete(name);
      console.log(`[NotificationScheduler] Stopped job "${name}"`);
    }
  }

  /**
   * Stop all scheduled jobs
   */
  public stopAll(): void {
    console.log("[NotificationScheduler] Stopping all scheduled jobs...");

    for (const [name, job] of this.jobs.entries()) {
      job.stop();
      console.log(`[NotificationScheduler] Stopped job "${name}"`);
    }

    this.jobs.clear();
    this.isInitialized = false;

    console.log("[NotificationScheduler] All jobs stopped");
  }

  /**
   * Get status of all jobs
   */
  public getStatus(): { name: string; running: boolean }[] {
    return Array.from(this.jobs.entries()).map(([name, job]) => ({
      name,
      running: job !== undefined,
    }));
  }

  /**
   * Manually trigger a specific check (for testing/admin purposes)
   */
  public async triggerCheck(checkType: "milestones" | "deadlines"): Promise<void> {
    console.log(`[NotificationScheduler] Manually triggering ${checkType} check...`);

    try {
      if (checkType === "milestones") {
        await studyGoalTracker.checkMilestones();
      } else if (checkType === "deadlines") {
        await studyGoalTracker.checkDeadlines();
      }

      console.log(`[NotificationScheduler] ${checkType} check completed`);
    } catch (error) {
      console.error(
        `[NotificationScheduler] Error in manual ${checkType} check:`,
        error
      );
      throw error;
    }
  }
}

// Export singleton instance
export const notificationScheduler = new NotificationScheduler();

// Auto-initialize in production (not in development to avoid double initialization)
if (process.env.NODE_ENV === "production") {
  notificationScheduler.initialize();
}
