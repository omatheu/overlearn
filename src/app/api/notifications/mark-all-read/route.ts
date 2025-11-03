import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * POST /api/notifications/mark-all-read
 * Mark all notifications as read for the user
 */
export async function POST() {
  try {
    // For now, we assume userProfileId = 1
    const userProfileId = "1";

    const result = await prisma.notification.updateMany({
      where: {
        userProfileId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({
      success: true,
      count: result.count,
    });
  } catch (error) {
    console.error("[API] Error marking all notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to mark all notifications as read" },
      { status: 500 }
    );
  }
}
