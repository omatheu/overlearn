"use client";

import { useState } from "react";
import { Sparkles, Loader2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCreateFlashcard } from "@/lib/hooks/useFlashcards";

interface GeneratedFlashcard {
  question: string;
  answer: string;
}

interface GenerateFlashcardsDialogProps {
  taskId?: string;
  conceptId?: string;
  defaultTopic?: string;
}

export function GenerateFlashcardsDialog({
  taskId,
  conceptId,
  defaultTopic = "",
}: GenerateFlashcardsDialogProps) {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState(defaultTopic);
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [count, setCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFlashcards, setGeneratedFlashcards] = useState<GeneratedFlashcard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [savedFlashcards, setSavedFlashcards] = useState<Set<number>>(new Set());

  const createFlashcard = useCreateFlashcard();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Digite um tópico para gerar flashcards");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedFlashcards([]);
    setSavedFlashcards(new Set());

    try {
      const response = await fetch("/api/ai/flashcards/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          difficulty,
          count,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao gerar flashcards");
      }

      const data = await response.json();
      setGeneratedFlashcards(data.flashcards);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar flashcards");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveFlashcard = async (index: number) => {
    const flashcard = generatedFlashcards[index];

    try {
      await createFlashcard.mutateAsync({
        question: flashcard.question,
        answer: flashcard.answer,
        taskId,
        conceptId,
        source: "ai_generated",
      });

      setSavedFlashcards((prev) => new Set(prev).add(index));
    } catch (err) {
      console.error("Erro ao salvar flashcard:", err);
    }
  };

  const handleSaveAll = async () => {
    const unsavedIndexes = generatedFlashcards
      .map((_, index) => index)
      .filter((index) => !savedFlashcards.has(index));

    for (const index of unsavedIndexes) {
      await handleSaveFlashcard(index);
    }
  };

  const handleClose = () => {
    setOpen(false);
    // Reset state after dialog closes
    setTimeout(() => {
      setTopic(defaultTopic);
      setDifficulty("intermediate");
      setCount(5);
      setGeneratedFlashcards([]);
      setError(null);
      setSavedFlashcards(new Set());
    }, 200);
  };

  const allSaved = generatedFlashcards.length > 0 && savedFlashcards.size === generatedFlashcards.length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Sparkles className="h-4 w-4 mr-2" />
          Gerar com IA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Gerar Flashcards com IA
          </DialogTitle>
          <DialogDescription>
            Use IA para gerar flashcards automaticamente sobre qualquer tópico
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Form */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="topic">Tópico</Label>
              <Input
                id="topic"
                placeholder="Ex: React Hooks, Algoritmos de ordenação, SQL Joins..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="difficulty">Dificuldade</Label>
                <Select
                  value={difficulty}
                  onValueChange={(value: "beginner" | "intermediate" | "advanced") =>
                    setDifficulty(value)
                  }
                  disabled={isGenerating}
                >
                  <SelectTrigger id="difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Iniciante</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="count">Quantidade</Label>
                <Input
                  id="count"
                  type="number"
                  min={1}
                  max={10}
                  value={count}
                  onChange={(e) => setCount(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                  disabled={isGenerating}
                />
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar Flashcards
                </>
              )}
            </Button>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Generated Flashcards */}
          {generatedFlashcards.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  Flashcards Gerados ({savedFlashcards.size}/{generatedFlashcards.length} salvos)
                </h3>
                {!allSaved && (
                  <Button
                    size="sm"
                    onClick={handleSaveAll}
                    disabled={createFlashcard.isPending}
                  >
                    {createFlashcard.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Salvar Todos
                  </Button>
                )}
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {generatedFlashcards.map((flashcard, index) => {
                  const isSaved = savedFlashcards.has(index);

                  return (
                    <Card key={index} className={isSaved ? "bg-green-50/50 dark:bg-green-950/20" : ""}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  Pergunta
                                </Badge>
                                {isSaved && (
                                  <Badge className="text-xs bg-green-600">
                                    <Check className="h-3 w-3 mr-1" />
                                    Salvo
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm font-medium">{flashcard.question}</p>
                            </div>
                            <div>
                              <Badge variant="outline" className="text-xs mb-1">
                                Resposta
                              </Badge>
                              <p className="text-sm text-muted-foreground">
                                {flashcard.answer}
                              </p>
                            </div>
                          </div>

                          <Button
                            size="sm"
                            variant={isSaved ? "ghost" : "default"}
                            onClick={() => handleSaveFlashcard(index)}
                            disabled={isSaved || createFlashcard.isPending}
                          >
                            {isSaved ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
          >
            {allSaved ? "Concluir" : "Fechar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
