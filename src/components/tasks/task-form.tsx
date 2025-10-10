'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, X } from 'lucide-react';
import { createTask, updateTask, type TaskFormData } from '@/app/tasks/actions';
import { Badge } from '@/components/ui/badge';

type Concept = {
  id: string;
  name: string;
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'doing' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  concepts: {
    concept: Concept;
  }[];
};

type TaskFormProps = {
  task?: Task;
  concepts: Concept[];
};

export function TaskForm({ task, concepts }: TaskFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<TaskFormData>({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    conceptIds: task?.concepts.map((c) => c.concept.id) || [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('O título é obrigatório');
      return;
    }

    startTransition(async () => {
      const result = task
        ? await updateTask(task.id, formData)
        : await createTask(formData);

      if (result.success) {
        router.push('/tasks');
        router.refresh();
      } else {
        setError(result.error || 'Erro ao salvar task');
      }
    });
  };

  const toggleConcept = (conceptId: string) => {
    setFormData((prev) => ({
      ...prev,
      conceptIds: prev.conceptIds?.includes(conceptId)
        ? prev.conceptIds.filter((id) => id !== conceptId)
        : [...(prev.conceptIds || []), conceptId],
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{task ? 'Editar Task' : 'Nova Task'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Título <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Ex: Implementar autenticação JWT"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Descreva a task em detalhes..."
              rows={4}
            />
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'todo' | 'doing' | 'done' | 'blocked') =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">A Fazer</SelectItem>
                  <SelectItem value="doing">Fazendo</SelectItem>
                  <SelectItem value="done">Concluído</SelectItem>
                  <SelectItem value="blocked">Bloqueado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Concepts */}
          {concepts.length > 0 && (
            <div className="space-y-2">
              <Label>Conceitos Relacionados</Label>
              <div className="flex flex-wrap gap-2">
                {concepts.map((concept) => {
                  const isSelected = formData.conceptIds?.includes(concept.id);
                  return (
                    <Badge
                      key={concept.id}
                      variant={isSelected ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => toggleConcept(concept.id)}
                    >
                      {concept.name}
                      {isSelected && <X className="ml-1 h-3 w-3" />}
                    </Badge>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Clique para adicionar/remover conceitos
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {task ? 'Atualizar Task' : 'Criar Task'}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
