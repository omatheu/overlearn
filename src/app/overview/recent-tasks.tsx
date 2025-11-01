// src/components/overview/recent-tasks.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import prisma from '@/lib/db/prisma';
import Link from 'next/link';

type TaskWithConcepts = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  concepts: Array<{
    id: string;
    concept: { name: string };
  }>;
};

async function getRecentTasks() {
  const profile = await prisma.userProfile.findFirst();
  
  if (!profile) return [];

  return await prisma.task.findMany({
    where: {
      userProfileId: profile.id,
    },
    include: {
      concepts: {
        include: {
          concept: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 5
  });
}

const statusIcons = {
  todo: Circle,
  doing: Clock,
  done: CheckCircle2,
  blocked: Circle
};

const statusColors = {
  todo: 'text-gray-400',
  doing: 'text-blue-500',
  done: 'text-green-500',
  blocked: 'text-red-500'
};

const priorityColors = {
  low: 'secondary',
  medium: 'default',
  high: 'destructive',
  urgent: 'destructive'
} as const;

export async function RecentTasks() {
  const tasks = await getRecentTasks();

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tasks Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhuma task ainda. Crie sua primeira!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tasks Recentes</CardTitle>
        <Link href="/tasks" className="text-sm text-blue-600 hover:underline">
          Ver todas
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {tasks.map((task: any) => {
            const StatusIcon = statusIcons[task.status as keyof typeof statusIcons];
            const statusColor = statusColors[task.status as keyof typeof statusColors];

            return (
              <div
                key={task.id}
                className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <StatusIcon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${statusColor}`} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">
                      {task.title}
                    </h4>
                    <Badge
                      variant={priorityColors[task.priority as keyof typeof priorityColors]}
                      className="text-xs"
                    >
                      {task.priority}
                    </Badge>
                  </div>
                  
                  {task.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {task.description}
                    </p>
                  )}
                  
                  {task.concepts.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {task.concepts.map((tc: any) => (
                        <Badge key={tc.id} variant="outline" className="text-xs">
                          {tc.concept.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}