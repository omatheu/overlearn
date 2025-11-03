import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/notifications/preferences
 * Get user notification preferences
 */
export async function GET() {
  try {
    // For now, we assume userProfileId = 1
    const userProfileId = "1";

    let preferences = await prisma.notificationPreferences.findUnique({
      where: { userProfileId },
    });

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await prisma.notificationPreferences.create({
        data: {
          userProfileId,
          pomodoroEnabled: true,
          studyGoalEnabled: true,
          taskDeadlineEnabled: true,
          systemNotifications: true,
          emailNotifications: false,
          quietHoursEnabled: false,
        },
      });
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("[API] Error fetching notification preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification preferences" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notifications/preferences
 * Update user notification preferences
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // For now, we assume userProfileId = 1
    const userProfileId = "1";

    const {
      pomodoroEnabled,
      studyGoalEnabled,
      taskDeadlineEnabled,
      systemNotifications,
      emailNotifications,
      email,
      quietHoursEnabled,
      quietHoursStart,
      quietHoursEnd,
    } = body;

    // Update or create preferences
    const preferences = await prisma.notificationPreferences.upsert({
      where: { userProfileId },
      update: {
        ...(pomodoroEnabled !== undefined && { pomodoroEnabled }),
        ...(studyGoalEnabled !== undefined && { studyGoalEnabled }),
        ...(taskDeadlineEnabled !== undefined && { taskDeadlineEnabled }),
        ...(systemNotifications !== undefined && { systemNotifications }),
        ...(emailNotifications !== undefined && { emailNotifications }),
        ...(email !== undefined && { email }),
        ...(quietHoursEnabled !== undefined && { quietHoursEnabled }),
        ...(quietHoursStart !== undefined && { quietHoursStart }),
        ...(quietHoursEnd !== undefined && { quietHoursEnd }),
      },
      create: {
        userProfileId,
        pomodoroEnabled: pomodoroEnabled ?? true,
        studyGoalEnabled: studyGoalEnabled ?? true,
        taskDeadlineEnabled: taskDeadlineEnabled ?? true,
        systemNotifications: systemNotifications ?? true,
        emailNotifications: emailNotifications ?? false,
        email,
        quietHoursEnabled: quietHoursEnabled ?? false,
        quietHoursStart,
        quietHoursEnd,
      },
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("[API] Error updating notification preferences:", error);
    return NextResponse.json(
      { error: "Failed to update notification preferences" },
      { status: 500 }
    );
  }
}
