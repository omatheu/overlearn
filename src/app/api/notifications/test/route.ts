import { NextRequest, NextResponse } from "next/server";
import { notificationScheduler } from "@/lib/notifications";

/**
 * POST /api/notifications/test
 * Manually trigger notification checks (for testing/debugging)
 *
 * Body:
 *  - checkType: "milestones" | "deadlines"
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { checkType } = body;

    if (!checkType || !["milestones", "deadlines"].includes(checkType)) {
      return NextResponse.json(
        { error: "checkType must be 'milestones' or 'deadlines'" },
        { status: 400 }
      );
    }

    // Trigger the check
    await notificationScheduler.triggerCheck(checkType);

    return NextResponse.json({
      success: true,
      message: `${checkType} check completed`,
    });
  } catch (error) {
    console.error("[API] Error in test notification check:", error);
    return NextResponse.json(
      { error: "Failed to trigger notification check" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/notifications/test
 * Get scheduler status
 */
export async function GET() {
  try {
    const status = notificationScheduler.getStatus();

    return NextResponse.json({
      scheduler: {
        jobs: status,
        totalJobs: status.length,
      },
    });
  } catch (error) {
    console.error("[API] Error getting scheduler status:", error);
    return NextResponse.json(
      { error: "Failed to get scheduler status" },
      { status: 500 }
    );
  }
}
