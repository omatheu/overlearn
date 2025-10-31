"use client";

import { use } from "react";
import { PageLayout, PageHeader, PageContent } from "@/components/layout";
import { ConceptForm } from "@/components/concepts/concept-form";
import { Button } from "@/components/ui/button";
import { useConcept } from "@/lib/hooks/useConcepts";
import { ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function EditConceptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: concept, isLoading, error } = useConcept(id);

  if (isLoading) {
    return (
      <PageLayout maxWidth="lg">
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
      <PageLayout maxWidth="lg">
        <PageContent>
          <div className="text-center py-12">
            <p className="text-destructive">Conceito não encontrado</p>
          </div>
        </PageContent>
      </PageLayout>
    );
  }

  return (
    <PageLayout maxWidth="lg">
      <div className="mb-6">
        <Link href={`/concepts/${id}`}>
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para Conceito
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Editar Conceito"
        description="Atualize as informações do conceito"
      />

      <PageContent>
        <ConceptForm concept={concept} />
      </PageContent>
    </PageLayout>
  );
}
