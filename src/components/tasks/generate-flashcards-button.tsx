'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Brain, 
  Sparkles, 
  Loader2, 
  AlertCircle,
  DollarSign,
  Clock
} from 'lucide-react';
import { useGenerateFlashcards, useEstimateFlashcardCost } from '@/lib/hooks/useAIFlashcards';
import { FlashcardGenerationRequest } from '@/lib/ai/types';
import { useCreateFlashcard } from '@/lib/hooks/useFlashcards';
import { useRouter } from 'next/navigation';

interface GenerateFlashcardsButtonProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    concepts: Array<{
      concept: {
        id: string;
        name: string;
      };
    }>;
  };
}

export function GenerateFlashcardsButton({ task }: GenerateFlashcardsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    topic: task.title,
    difficulty: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    count: 3,
    userContext: task.description || '',
    preferences: {
      includeExamples: true,
      focusOnPractical: true,
      preferShortAnswers: false
    }
  });
  
  const generateMutation = useGenerateFlashcards();
  const estimateMutation = useEstimateFlashcardCost();
  const createFlashcardMutation = useCreateFlashcard();
  const router = useRouter();

  const handleGenerate = async () => {
    try {
      const request: FlashcardGenerationRequest = {
        taskId: task.id,
        topic: formData.topic,
        difficulty: formData.difficulty,
        count: formData.count,
        userContext: formData.userContext,
        preferences: formData.preferences
      };

      const result = await generateMutation.mutateAsync(request);
      
      // Criar flashcards no banco de dados
      for (const flashcard of result.flashcards) {
        await createFlashcardMutation.mutateAsync({
          question: flashcard.question,
          answer: flashcard.answer,
          taskId: task.id,
          source: 'ai_generated'
        });
      }

      // Fechar modal e redirecionar
      setIsOpen(false);
      router.push('/flashcards');
      
    } catch (error) {
      console.error('Erro ao gerar flashcards:', error);
    }
  };

  const handleEstimateCost = async () => {
    try {
      await estimateMutation.mutateAsync({
        topic: formData.topic,
        difficulty: formData.difficulty,
        count: formData.count
      });
    } catch (error) {
      console.error('Erro ao estimar custo:', error);
    }
  };

  const difficultyLabels = {
    beginner: 'Iniciante',
    intermediate: 'Intermediário', 
    advanced: 'Avançado'
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Brain className="h-4 w-4" />
          Gerar Flashcards
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Gerar Flashcards com IA
          </DialogTitle>
          <DialogDescription>
            Use IA para gerar flashcards baseados nesta task: <strong>{task.title}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações da Task */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Task Selecionada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">{task.title}</p>
              {task.description && (
                <p className="text-sm text-muted-foreground">{task.description}</p>
              )}
              {task.concepts.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {task.concepts.map((tc) => (
                    <Badge key={tc.concept.id} variant="outline" className="text-xs">
                      {tc.concept.name}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configurações */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Tópico</Label>
              <Input
                id="topic"
                value={formData.topic}
                onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                placeholder="Tópico dos flashcards"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="difficulty">Dificuldade</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => 
                  setFormData(prev => ({ ...prev, difficulty: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">{difficultyLabels.beginner}</SelectItem>
                  <SelectItem value="intermediate">{difficultyLabels.intermediate}</SelectItem>
                  <SelectItem value="advanced">{difficultyLabels.advanced}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="count">Quantidade de Flashcards</Label>
            <Input
              id="count"
              type="number"
              min="1"
              max="10"
              value={formData.count}
              onChange={(e) => setFormData(prev => ({ ...prev, count: parseInt(e.target.value) || 1 }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">Contexto Adicional (Opcional)</Label>
            <Textarea
              id="context"
              value={formData.userContext}
              onChange={(e) => setFormData(prev => ({ ...prev, userContext: e.target.value }))}
              placeholder="Adicione contexto específico para personalizar os flashcards..."
              rows={3}
            />
          </div>

          {/* Preferências */}
          <div className="space-y-3">
            <Label>Preferências</Label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.preferences.includeExamples}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, includeExamples: e.target.checked }
                  }))}
                />
                <span className="text-sm">Incluir exemplos práticos</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.preferences.focusOnPractical}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, focusOnPractical: e.target.checked }
                  }))}
                />
                <span className="text-sm">Focar em aplicações práticas</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.preferences.preferShortAnswers}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, preferShortAnswers: e.target.checked }
                  }))}
                />
                <span className="text-sm">Preferir respostas curtas</span>
              </label>
            </div>
          </div>

          {/* Estimativa de Custo */}
          {estimateMutation.data && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4" />
                  <span>Custo estimado: ${estimateMutation.data.estimatedCost.toFixed(4)}</span>
                  <Clock className="h-4 w-4 ml-2" />
                  <span>Tempo estimado: ~{formData.count * 2} segundos</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status da Geração */}
          {generateMutation.isPending && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Gerando flashcards com IA...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {generateMutation.isError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>Erro: {generateMutation.error?.message}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ações */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleEstimateCost}
              disabled={estimateMutation.isPending}
            >
              {estimateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <DollarSign className="h-4 w-4 mr-2" />
              )}
              Estimar Custo
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending || !formData.topic.trim()}
                className="gap-2"
              >
                {generateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Gerar Flashcards
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
