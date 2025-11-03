import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/notifications
 * List all notifications for the user
 * Query params:
 *  - unread: boolean (filter unread only)
 *  - limit: number (default 50)
 *  - offset: number (default 0)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const unreadOnly = searchParams.get("unread") === "true";
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // For now, we assume userProfileId = 1 (single user system)
    // TODO: Replace with actual user authentication
    const userProfileId = "1";

    const where: any = { userProfileId };

    if (unreadOnly) {
      where.isRead = false;
    }

    // Get notifications
    const notifications = await prisma.notification.findMany({
      where,
      include: {
        task: {
          select: {
            id: true,
            title: true,
          },
        },
        studyGoal: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    // Get total count
    const totalCount = await prisma.notification.count({ where });

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userProfileId,
        isRead: false,
      },
    });

    return NextResponse.json({
      notifications,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
      unreadCount,
    });
  } catch (error) {
    console.error("[API] Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications
 * Create a new notification (for testing or manual creation)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      type,
      title,
      message,
      deliveryMethod = "system",
      studyGoalId,
      taskId,
      metadata,
    } = body;

    // Validation
    if (!type || !title || !message) {
      return NextResponse.json(
        { error: "type, title, and message are required" },
        { status: 400 }
      );
    }

    // For now, we assume userProfileId = 1
    const userProfileId = "1";

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        message,
        deliveryMethod,
        userProfileId,
        studyGoalId,
        taskId,
        metadata: metadata ? JSON.stringify(metadata) : null,
        sentAt: new Date(),
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
          },
        },
        studyGoal: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error("[API] Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}
