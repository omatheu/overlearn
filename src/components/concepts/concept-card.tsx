"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Zap, ExternalLink } from "lucide-react";
import { Concept } from "@/lib/hooks/useConcepts";

interface ConceptCardProps {
  concept: Concept;
}

export function ConceptCard({ concept }: ConceptCardProps) {
  const taskCount = concept._count?.tasks || 0;
  const flashcardCount = concept._count?.flashcards || 0;
  const resourceCount = concept._count?.resources || 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{concept.name}</CardTitle>
            {concept.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {concept.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {concept.category && (
            <Badge variant="outline">{concept.category}</Badge>
          )}
          {concept.studyGoal && (
            <Badge variant="secondary" className="text-xs">
              Meta: {concept.studyGoal.title}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-semibold">{taskCount}</div>
              <div className="text-xs text-muted-foreground">Tarefas</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-semibold">{flashcardCount}</div>
              <div className="text-xs text-muted-foreground">Flashcards</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-semibold">{resourceCount}</div>
              <div className="text-xs text-muted-foreground">Recursos</div>
            </div>
          </div>
        </div>

        <Link href={`/concepts/${concept.id}`}>
          <Button variant="outline" size="sm" className="w-full">
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver Detalhes
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
