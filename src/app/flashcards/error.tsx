"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, BookOpen } from "lucide-react";
import Link from "next/link";

export default function FlashcardsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Flashcards error:", error);
  }, [error]);

  return (
    <div className="container max-w-2xl mx-auto p-6">
      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-destructive">
              Erro nos Flashcards
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Ocorreu um erro ao carregar ou processar os flashcards.
            </p>
            {error.message && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-xs font-mono text-muted-foreground break-words">
                  {error.message}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={reset} className="flex-1 gap-2">
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </Button>
            <Button variant="outline" asChild className="flex-1 gap-2">
              <Link href="/flashcards">
                <BookOpen className="h-4 w-4" />
                Ver todos flashcards
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
