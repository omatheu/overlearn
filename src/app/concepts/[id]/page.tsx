"use client";

import { use } from "react";
import { PageLayout, PageContent } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useConcept, useDeleteConcept } from "@/lib/hooks/useConcepts";
import { ResourceManager } from "@/components/resources/resource-manager";
import { ChevronLeft, Pencil, Trash2, Loader2, FileText, Zap, BookOpen, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ConceptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: concept, isLoading, error } = useConcept(id);
  const deleteConcept = useDeleteConcept();

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja deletar este conceito? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      await deleteConcept.mutateAsync(id);
      router.push("/concepts");
    } catch (error) {
      console.error("Erro ao deletar conceito:", error);
    }
  };

  if (isLoading) {
    return (
      <PageLayout maxWidth="xl">
        <PageContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </PageContent>
      </PageLayout>
    );
  }

  if (error || !concept) {
    return (
      <PageLayout maxWidth="xl">
        <PageContent>
          <div className="text-center py-12">
            <p className="text-destructive">Conceito não encontrado</p>
          </div>
        </PageContent>
      </PageLayout>
    );
  }

  const taskCount = concept._count?.tasks || 0;
  const flashcardCount = concept._count?.flashcards || 0;
  const resourceCount = concept._count?.resources || 0;
  const totalStudyTime = concept.totalStudyTime || 0;

  return (
    <PageLayout maxWidth="xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/concepts">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para Conceitos
          </Button>
        </Link>

        <div className="flex gap-2">
          <Link href={`/concepts/${id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteConcept.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Deletar
          </Button>
        </div>
      </div>

      <PageContent>
        {/* Main Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="space-y-4">
              <CardTitle className="text-2xl">{concept.name}</CardTitle>
              <div className="flex flex-wrap gap-2">
                {concept.category && (
                  <Badge variant="outline">{concept.category}</Badge>
                )}
                {concept.studyGoal && (
                  <Badge variant="secondary">
                    Meta: {concept.studyGoal.title}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          {concept.description && (
            <CardContent>
              <h3 className="font-semibold mb-2">Descrição</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {concept.description}
              </p>
            </CardContent>
          )}
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{taskCount}</div>
                  <div className="text-sm text-muted-foreground">Tarefas</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Zap className="h-8 w-8 text-yellow-500" />
                <div>
                  <div className="text-2xl font-bold">{flashcardCount}</div>
                  <div className="text-sm text-muted-foreground">Flashcards</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{resourceCount}</div>
                  <div className="text-sm text-muted-foreground">Recursos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}m
                  </div>
                  <div className="text-sm text-muted-foreground">Tempo Total</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Related Tasks */}
        {concept.tasks && concept.tasks.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Tarefas Relacionadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {concept.tasks.map((tc) => (
                  <Link
                    key={tc.task.id}
                    href={`/tasks/${tc.task.id}`}
                    className="block"
                  >
                    <div className="p-3 border rounded-lg hover:bg-accent transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{tc.task.title}</span>
                        <div className="flex gap-2">
                          <Badge variant="outline">{tc.task.status}</Badge>
                          <Badge variant="outline">{tc.task.priority}</Badge>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Related Flashcards */}
        {concept.flashcards && concept.flashcards.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Flashcards Relacionados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {concept.flashcards.slice(0, 5).map((flashcard) => (
                  <div
                    key={flashcard.id}
                    className="p-3 border rounded-lg"
                  >
                    <p className="text-sm font-medium">{flashcard.question}</p>
                  </div>
                ))}
                {concept.flashcards.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center pt-2">
                    + {concept.flashcards.length - 5} flashcards
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resources */}
        <ResourceManager conceptId={id} />
      </PageContent>
    </PageLayout>
  );
}
