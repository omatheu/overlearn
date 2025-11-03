import { prisma } from "@/lib/db/prisma";
import { emailService } from "./email-service";

/**
 * Study Goal Milestone Tracker
 * Monitors study goal progress and sends notifications for milestones
 */

interface MilestoneEvent {
  goalId: string;
  goalTitle: string;
  milestone: 25 | 50 | 75 | 100;
  progress: number;
}

interface DeadlineEvent {
  goalId: string;
  goalTitle: string;
  daysRemaining: number;
  targetDate: Date;
}

class StudyGoalTracker {
  /**
   * Calculate progress for a study goal based on completed tasks
   */
  private async calculateGoalProgress(
    goalId: string
  ): Promise<number | null> {
    try {
      const goal = await prisma.studyGoal.findUnique({
        where: { id: goalId },
        include: {
          tasks: true,
        },
      });

      if (!goal || goal.tasks.length === 0) {
        return null;
      }

      const completedTasks = goal.tasks.filter(
        (task) => task.status === "done"
      ).length;
      const totalTasks = goal.tasks.length;

      return Math.round((completedTasks / totalTasks) * 100);
    } catch (error) {
      console.error("[StudyGoalTracker] Error calculating progress:", error);
      return null;
    }
  }

  /**
   * Check if a milestone notification should be sent
   */
  private async shouldNotifyMilestone(
    goalId: string,
    milestone: number
  ): Promise<boolean> {
    // Check if we already sent a notification for this milestone
    const existingNotification = await prisma.notification.findFirst({
      where: {
        studyGoalId: goalId,
        type: "study_goal_milestone",
        metadata: {
          contains: `"milestone":${milestone}`,
        },
      },
    });

    return !existingNotification;
  }

  /**
   * Create a milestone notification
   */
  private async createMilestoneNotification(
    event: MilestoneEvent,
    userProfileId: string,
    deliveryMethod: string
  ): Promise<void> {
    const milestoneEmojis: Record<number, string> = {
      25: "🌱",
      50: "🚀",
      75: "⭐",
      100: "🎉",
    };

    const emoji = milestoneEmojis[event.milestone] || "📊";
    const title = `${emoji} Study Goal Milestone: ${event.milestone}%`;
    const message =
      event.milestone === 100
        ? `Congratulations! You've completed "${event.goalTitle}"! 🎊`
        : `You're ${event.milestone}% through "${event.goalTitle}"! Keep going! 💪`;

    await prisma.notification.create({
      data: {
        type: "study_goal_milestone",
        title,
        message,
        deliveryMethod,
        studyGoalId: event.goalId,
        userProfileId,
        metadata: JSON.stringify({
          milestone: event.milestone,
          progress: event.progress,
          goalTitle: event.goalTitle,
        }),
        sentAt: new Date(),
      },
    });

    console.log(
      `[StudyGoalTracker] Milestone notification created: ${event.milestone}% for goal ${event.goalId}`
    );
  }

  /**
   * Create a deadline notification
   */
  private async createDeadlineNotification(
    event: DeadlineEvent,
    userProfileId: string,
    deliveryMethod: string
  ): Promise<void> {
    const title = "⏰ Study Goal Deadline Approaching";
    const message = `You have ${event.daysRemaining} day${event.daysRemaining > 1 ? "s" : ""} left to complete "${event.goalTitle}"!`;

    await prisma.notification.create({
      data: {
        type: "study_goal_deadline",
        title,
        message,
        deliveryMethod,
        studyGoalId: event.goalId,
        userProfileId,
        metadata: JSON.stringify({
          daysRemaining: event.daysRemaining,
          targetDate: event.targetDate.toISOString(),
          goalTitle: event.goalTitle,
        }),
        sentAt: new Date(),
      },
    });

    console.log(
      `[StudyGoalTracker] Deadline notification created: ${event.daysRemaining} days for goal ${event.goalId}`
    );
  }

  /**
   * Check all active study goals for milestones
   */
  public async checkMilestones(): Promise<void> {
    try {
      console.log("[StudyGoalTracker] Checking study goal milestones...");

      // Get all active study goals
      const activeGoals = await prisma.studyGoal.findMany({
        where: {
          status: "active",
        },
        include: {
          userProfile: {
            include: {
              notificationPreferences: true,
            },
          },
        },
      });

      for (const goal of activeGoals) {
        // Check if notifications are enabled for this user
        const prefs = goal.userProfile.notificationPreferences;
        if (!prefs || !prefs.studyGoalEnabled) {
          continue;
        }

        const progress = await this.calculateGoalProgress(goal.id);
        if (progress === null) {
          continue;
        }

        // Check for milestones (25%, 50%, 75%, 100%)
        const milestones = [25, 50, 75, 100];
        for (const milestone of milestones) {
          if (
            progress >= milestone &&
            (await this.shouldNotifyMilestone(goal.id, milestone))
          ) {
            const event: MilestoneEvent = {
              goalId: goal.id,
              goalTitle: goal.title,
              milestone: milestone as 25 | 50 | 75 | 100,
              progress,
            };

            // Determine delivery method
            let deliveryMethod = "system";
            if (prefs.systemNotifications && prefs.emailNotifications) {
              deliveryMethod = "both";
            } else if (prefs.emailNotifications) {
              deliveryMethod = "email";
            }

            // Create notification
            await this.createMilestoneNotification(
              event,
              goal.userProfileId,
              deliveryMethod
            );

            // Send email if needed
            if (
              (deliveryMethod === "email" || deliveryMethod === "both") &&
              prefs.email &&
              emailService.isReady()
            ) {
              const emoji = ["🌱", "🚀", "⭐", "🎉"][milestones.indexOf(milestone)];
              await emailService.sendNotificationEmail(
                prefs.email,
                `${emoji} Study Goal Milestone: ${milestone}%`,
                event.milestone === 100
                  ? `Congratulations! You've completed "${event.goalTitle}"!`
                  : `You're ${event.milestone}% through "${event.goalTitle}"! Keep going!`
              );
            }
          }
        }
      }

      console.log("[StudyGoalTracker] Milestone check completed");
    } catch (error) {
      console.error("[StudyGoalTracker] Error checking milestones:", error);
    }
  }

  /**
   * Check all study goals for approaching deadlines
   */
  public async checkDeadlines(): Promise<void> {
    try {
      console.log("[StudyGoalTracker] Checking study goal deadlines...");

      const now = new Date();
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      // Get active goals with deadlines in the next 3 days
      const approachingGoals = await prisma.studyGoal.findMany({
        where: {
          status: "active",
          targetDate: {
            lte: threeDaysFromNow,
            gte: now,
          },
        },
        include: {
          userProfile: {
            include: {
              notificationPreferences: true,
            },
          },
        },
      });

      for (const goal of approachingGoals) {
        const prefs = goal.userProfile.notificationPreferences;
        if (!prefs || !prefs.studyGoalEnabled || !goal.targetDate) {
          continue;
        }

        const daysRemaining = Math.ceil(
          (goal.targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Check if we already sent a notification for this deadline
        const existingNotification = await prisma.notification.findFirst({
          where: {
            studyGoalId: goal.id,
            type: "study_goal_deadline",
            metadata: {
              contains: `"daysRemaining":${daysRemaining}`,
            },
          },
        });

        if (existingNotification) {
          continue;
        }

        const event: DeadlineEvent = {
          goalId: goal.id,
          goalTitle: goal.title,
          daysRemaining,
          targetDate: goal.targetDate,
        };

        // Determine delivery method
        let deliveryMethod = "system";
        if (prefs.systemNotifications && prefs.emailNotifications) {
          deliveryMethod = "both";
        } else if (prefs.emailNotifications) {
          deliveryMethod = "email";
        }

        // Create notification
        await this.createDeadlineNotification(
          event,
          goal.userProfileId,
          deliveryMethod
        );

        // Send email if needed
        if (
          (deliveryMethod === "email" || deliveryMethod === "both") &&
          prefs.email &&
          emailService.isReady()
        ) {
          await emailService.sendNotificationEmail(
            prefs.email,
            "⏰ Study Goal Deadline Approaching",
            `You have ${daysRemaining} day${daysRemaining > 1 ? "s" : ""} left to complete "${event.goalTitle}"!`
          );
        }
      }

      console.log("[StudyGoalTracker] Deadline check completed");
    } catch (error) {
      console.error("[StudyGoalTracker] Error checking deadlines:", error);
    }
  }
}

// Export singleton instance
export const studyGoalTracker = new StudyGoalTracker();
