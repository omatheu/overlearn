"use client";

import { PageLayout, PageHeader, PageContent } from "@/components/layout";
import { ConceptForm } from "@/components/concepts/concept-form";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function NewConceptPage() {
  return (
    <PageLayout maxWidth="lg">
      <div className="mb-6">
        <Link href="/concepts">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para Conceitos
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Novo Conceito"
        description="Crie um novo conceito de estudo"
      />

      <PageContent>
        <ConceptForm />
      </PageContent>
    </PageLayout>
  );
}
