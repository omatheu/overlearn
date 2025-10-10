// src/components/overview/quick-actions.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, BookOpen, Clock, Target } from 'lucide-react';
import Link from 'next/link';

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/tasks/new">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <Plus className="h-5 w-5" />
              <span className="text-sm">Nova Task</span>
            </Button>
          </Link>

          <Link href="/flashcards/review">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <BookOpen className="h-5 w-5" />
              <span className="text-sm">Revisar</span>
            </Button>
          </Link>

          <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
            <Clock className="h-5 w-5" />
            <span className="text-sm">Pomodoro</span>
          </Button>

          <Link href="/profile">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <Target className="h-5 w-5" />
              <span className="text-sm">Metas</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}