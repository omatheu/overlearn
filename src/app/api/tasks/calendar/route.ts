import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        scheduledDate: {
          not: null,
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        scheduledDate: true,
        estimatedTime: true,
        type: true,
        status: true,
        priority: true,
      },
      orderBy: {
        scheduledDate: "asc",
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Erro ao buscar tasks do calendário:", error);
    return NextResponse.json({ error: "Erro ao buscar tasks" }, { status: 500 });
  }
}
