'use server';

import prisma from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type TaskFormData = {
  title: string;
  description?: string;
  status: 'todo' | 'doing' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  conceptIds?: string[];
  scheduledDate?: string;
  estimatedTime?: number;
};

export async function createTask(data: TaskFormData) {
  try {
    // Get the user profile (for now, we'll use the first one)
    const profile = await prisma.userProfile.findFirst();

    if (!profile) {
      throw new Error('User profile not found');
    }

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
        estimatedTime: data.estimatedTime,
        userProfileId: profile.id,
        concepts: data.conceptIds?.length ? {
          create: data.conceptIds.map((conceptId) => ({
            concept: {
              connect: { id: conceptId }
            }
          }))
        } : undefined
      },
      include: {
        concepts: {
          include: {
            concept: true
          }
        }
      }
    });

    revalidatePath('/tasks');
    revalidatePath('/');
    return { success: true, task };
  } catch (error) {
    console.error('Error creating task:', error);
    return { success: false, error: 'Failed to create task' };
  }
}

export async function updateTask(id: string, data: TaskFormData) {
  try {
    // Delete existing concept connections
    await prisma.taskConcept.deleteMany({
      where: { taskId: id }
    });

    const task = await prisma.task.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
        estimatedTime: data.estimatedTime,
        concepts: data.conceptIds?.length ? {
          create: data.conceptIds.map((conceptId) => ({
            concept: {
              connect: { id: conceptId }
            }
          }))
        } : undefined
      },
      include: {
        concepts: {
          include: {
            concept: true
          }
        }
      }
    });

    revalidatePath('/tasks');
    revalidatePath(`/tasks/${id}`);
    revalidatePath('/');
    return { success: true, task };
  } catch (error) {
    console.error('Error updating task:', error);
    return { success: false, error: 'Failed to update task' };
  }
}

export async function deleteTask(id: string) {
  try {
    await prisma.task.delete({
      where: { id }
    });

    revalidatePath('/tasks');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error deleting task:', error);
    return { success: false, error: 'Failed to delete task' };
  }
}

export async function toggleTaskStatus(id: string) {
  try {
    const task = await prisma.task.findUnique({
      where: { id }
    });

    if (!task) {
      throw new Error('Task not found');
    }

    const statusFlow: Record<string, 'todo' | 'doing' | 'done' | 'blocked'> = {
      todo: 'doing',
      doing: 'done',
      done: 'todo',
      blocked: 'todo'
    };

    const newStatus = statusFlow[task.status] || 'todo';

    await prisma.task.update({
      where: { id },
      data: {
        status: newStatus,
        completedAt: newStatus === 'done' ? new Date() : null
      }
    });

    revalidatePath('/tasks');
    revalidatePath(`/tasks/${id}`);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error toggling task status:', error);
    return { success: false, error: 'Failed to toggle task status' };
  }
}

export async function deleteTaskAction(formData: FormData) {
  const id = formData.get('id') as string;
  await deleteTask(id);
  redirect('/tasks');
}
