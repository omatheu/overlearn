import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { scheduledDate, estimatedTime } = body;

    const task = await prisma.task.update({
      where: { id },
      data: {
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        estimatedTime: estimatedTime ? parseInt(estimatedTime, 10) : null,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error);
    return NextResponse.json({ error: "Erro ao atualizar agendamento" }, { status: 500 });
  }
}
