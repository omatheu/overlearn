import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * Health Check Endpoint
 * Used by Docker healthcheck and monitoring systems
 */
export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        database: "connected",
        version: process.env.npm_package_version || "unknown",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
