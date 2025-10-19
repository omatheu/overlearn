'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  ArrowLeft, 
  Plus, 
  Brain,
  Target,
  Lightbulb
} from 'lucide-react';
import { useCreateFlashcard } from '@/lib/hooks/useFlashcards';
import { useTasks } from '@/lib/hooks/useTasks';
import { useConcepts } from '@/lib/hooks/useConcepts';

const flashcardSchema = z.object({
  question: z.string().min(1, 'Pergunta é obrigatória').max(500, 'Pergunta muito longa'),
  answer: z.string().min(1, 'Resposta é obrigatória').max(1000, 'Resposta muito longa'),
  taskId: z.string().optional(),
  conceptId: z.string().optional(),
  source: z.enum(['manual', 'ai_generated'])
}).refine(data => data.taskId || data.conceptId, {
  message: 'Flashcard deve estar vinculado a uma task ou conceito',
  path: ['taskId']
});

type FlashcardFormData = z.infer<typeof flashcardSchema>;

export default function NewFlashcardPage() {
  const router = useRouter();
  const createFlashcard = useCreateFlashcard();
  const { data: tasks } = useTasks();
  const { data: concepts } = useConcepts();
  
  const [isCreating, setIsCreating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<FlashcardFormData>({
    resolver: zodResolver(flashcardSchema),
    defaultValues: {
      source: 'manual'
    }
  });

  const selectedTaskId = watch('taskId');
  const selectedConceptId = watch('conceptId');

  const onSubmit = async (data: FlashcardFormData) => {
    setIsCreating(true);
    try {
      await createFlashcard.mutateAsync(data);
      router.push('/flashcards');
    } catch (error) {
      console.error('Erro ao criar flashcard:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleTaskChange = (taskId: string) => {
    setValue('taskId', taskId);
    setValue('conceptId', ''); // Limpar conceito quando selecionar task
  };

  const handleConceptChange = (conceptId: string) => {
    setValue('conceptId', conceptId);
    setValue('taskId', ''); // Limpar task quando selecionar conceito
  };

  const selectedTask = tasks?.find(t => t.id === selectedTaskId);
  const selectedConcept = concepts?.find(c => c.id === selectedConceptId);

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Plus className="h-8 w-8" />
            Novo Flashcard
          </h1>
          <p className="text-muted-foreground">
            Crie flashcards para acelerar seu aprendizado
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Vinculação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Vinculação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taskId">Task (opcional)</Label>
                <Select onValueChange={handleTaskChange} value={selectedTaskId || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma task" />
                  </SelectTrigger>
                  <SelectContent>
                    {tasks?.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTask && (
                  <div className="mt-2">
                    <Badge variant="outline" className="gap-1">
                      <Target className="h-3 w-3" />
                      {selectedTask.title}
                    </Badge>
                    {selectedTask.concepts?.length > 0 && (
                      <div className="mt-1 text-sm text-muted-foreground">
                        Conceitos: {selectedTask.concepts.map((c: { concept: { name: string } }) => c.concept.name).join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="conceptId">Conceito (opcional)</Label>
                <Select onValueChange={handleConceptChange} value={selectedConceptId || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um conceito" />
                  </SelectTrigger>
                  <SelectContent>
                    {concepts?.map((concept) => (
                      <SelectItem key={concept.id} value={concept.id}>
                        {concept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedConcept && (
                  <div className="mt-2">
                    <Badge variant="outline" className="gap-1">
                      <Brain className="h-3 w-3" />
                      {selectedConcept.name}
                    </Badge>
                    {selectedConcept.description && (
                      <div className="mt-1 text-sm text-muted-foreground">
                        {selectedConcept.description}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {errors.taskId && (
              <p className="text-sm text-destructive">{errors.taskId.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Conteúdo do Flashcard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Conteúdo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">Pergunta *</Label>
              <Textarea
                id="question"
                placeholder="Ex: O que é Server-Side Rendering (SSR)?"
                className="min-h-[100px]"
                {...register('question')}
              />
              {errors.question && (
                <p className="text-sm text-destructive">{errors.question.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="answer">Resposta *</Label>
              <Textarea
                id="answer"
                placeholder="Ex: SSR é quando o HTML é gerado no servidor antes de enviar ao browser, melhorando SEO e performance inicial."
                className="min-h-[120px]"
                {...register('answer')}
              />
              {errors.answer && (
                <p className="text-sm text-destructive">{errors.answer.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dicas */}
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  Dicas para criar flashcards eficazes:
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• <strong>Perguntas claras:</strong> Use linguagem simples e direta</li>
                  <li>• <strong>Respostas concisas:</strong> Foque no essencial, evite textos longos</li>
                  <li>• <strong>Uma ideia por card:</strong> Cada flashcard deve abordar um conceito específico</li>
                  <li>• <strong>Contexto:</strong> Vincule a tasks ou conceitos para melhor organização</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => reset()}
          >
            Limpar
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/flashcards')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isCreating || createFlashcard.isPending}
            >
              {isCreating || createFlashcard.isPending ? (
                <>
                  <Brain className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Flashcard
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}