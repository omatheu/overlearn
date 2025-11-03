import { prisma } from "@/lib/db/prisma";
import { emailService } from "./email-service";

/**
 * Pomodoro Notifier
 * Creates notifications for Pomodoro timer events
 */

export type PomodoroEventType = "work_complete" | "break_complete";

interface PomodoroNotificationOptions {
  userProfileId: string;
  type: PomodoroEventType;
  duration: number; // minutes
  taskId?: string;
  taskTitle?: string;
}

class PomodoroNotifier {
  /**
   * Create a Pomodoro notification
   */
  public async createNotification(
    options: PomodoroNotificationOptions
  ): Promise<void> {
    try {
      // Get user preferences
      const prefs = await prisma.notificationPreferences.findUnique({
        where: { userProfileId: options.userProfileId },
      });

      // Check if Pomodoro notifications are enabled
      if (!prefs || !prefs.pomodoroEnabled) {
        console.log(
          "[PomodoroNotifier] Pomodoro notifications disabled for user"
        );
        return;
      }

      // Check quiet hours
      if (this.isQuietHours(prefs)) {
        console.log("[PomodoroNotifier] Skipping notification during quiet hours");
        return;
      }

      // Determine delivery method
      let deliveryMethod = "system";
      if (prefs.systemNotifications && prefs.emailNotifications) {
        deliveryMethod = "both";
      } else if (prefs.emailNotifications) {
        deliveryMethod = "email";
      } else if (prefs.systemNotifications) {
        deliveryMethod = "system";
      }

      // Generate notification content
      const { title, message } = this.generateNotificationContent(options);

      // Create notification in database
      await prisma.notification.create({
        data: {
          type:
            options.type === "work_complete"
              ? "pomodoro_complete"
              : "pomodoro_break_complete",
          title,
          message,
          deliveryMethod,
          userProfileId: options.userProfileId,
          taskId: options.taskId,
          metadata: JSON.stringify({
            duration: options.duration,
            taskTitle: options.taskTitle,
            eventType: options.type,
          }),
          sentAt: new Date(),
        },
      });

      console.log(
        `[PomodoroNotifier] Notification created: ${options.type} for user ${options.userProfileId}`
      );

      // Send email if needed
      if (
        (deliveryMethod === "email" || deliveryMethod === "both") &&
        prefs.email &&
        emailService.isReady()
      ) {
        await emailService.sendNotificationEmail(prefs.email, title, message);
      }
    } catch (error) {
      console.error("[PomodoroNotifier] Error creating notification:", error);
    }
  }

  /**
   * Generate notification title and message
   */
  private generateNotificationContent(
    options: PomodoroNotificationOptions
  ): { title: string; message: string } {
    if (options.type === "work_complete") {
      const title = "🎯 Work Session Complete!";
      const message = options.taskTitle
        ? `Great work on "${options.taskTitle}"! Time for a well-deserved break. 🧘`
        : `You completed a ${options.duration}-minute work session! Time to take a break. ☕`;

      return { title, message };
    } else {
      const title = "⏰ Break Complete!";
      const message = "Break's over! Ready to focus again? Let's get back to work! 💪";

      return { title, message };
    }
  }

  /**
   * Check if current time is within quiet hours
   */
  private isQuietHours(prefs: {
    quietHoursEnabled: boolean;
    quietHoursStart: string | null;
    quietHoursEnd: string | null;
  }): boolean {
    if (!prefs.quietHoursEnabled || !prefs.quietHoursStart || !prefs.quietHoursEnd) {
      return false;
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    const start = prefs.quietHoursStart;
    const end = prefs.quietHoursEnd;

    // Handle cases where quiet hours span midnight
    if (start > end) {
      return currentTime >= start || currentTime <= end;
    } else {
      return currentTime >= start && currentTime <= end;
    }
  }

  /**
   * Quick helper to notify work session complete
   */
  public async notifyWorkComplete(
    userProfileId: string,
    duration: number,
    taskId?: string,
    taskTitle?: string
  ): Promise<void> {
    await this.createNotification({
      userProfileId,
      type: "work_complete",
      duration,
      taskId,
      taskTitle,
    });
  }

  /**
   * Quick helper to notify break complete
   */
  public async notifyBreakComplete(
    userProfileId: string,
    duration: number
  ): Promise<void> {
    await this.createNotification({
      userProfileId,
      type: "break_complete",
      duration,
    });
  }
}

// Export singleton instance
export const pomodoroNotifier = new PomodoroNotifier();
