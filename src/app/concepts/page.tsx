"use client";

import { useState } from "react";
import { PageLayout, PageHeader, PageContent } from "@/components/layout";
import { ConceptCard } from "@/components/concepts/concept-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { useConcepts } from "@/lib/hooks/useConcepts";
import { Plus, Search, Loader2, BookOpen } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ConceptsPage() {
  const router = useRouter();
  const { data: concepts, isLoading, error } = useConcepts();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConcepts = concepts?.filter((concept) => {
    const query = searchQuery.toLowerCase();
    return (
      concept.name.toLowerCase().includes(query) ||
      concept.description?.toLowerCase().includes(query) ||
      concept.category?.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <PageLayout maxWidth="xl">
        <PageHeader title="Conceitos" description="Gerencie os conceitos de estudo" />
        <PageContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </PageContent>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout maxWidth="xl">
        <PageHeader title="Conceitos" description="Gerencie os conceitos de estudo" />
        <PageContent>
          <div className="text-center py-12">
            <p className="text-destructive">Erro ao carregar conceitos</p>
          </div>
        </PageContent>
      </PageLayout>
    );
  }

  return (
    <PageLayout maxWidth="xl">
      <PageHeader
        title="Conceitos"
        description="Gerencie os conceitos de estudo"
        action={
          <Link href="/concepts/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Conceito
            </Button>
          </Link>
        }
      />

      <PageContent>
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conceitos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Concepts Grid */}
        {filteredConcepts && filteredConcepts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConcepts.map((concept) => (
              <ConceptCard key={concept.id} concept={concept} />
            ))}
          </div>
        ) : searchQuery ? (
          <EmptyState
            icon={Search}
            title="Nenhum conceito encontrado"
            description={`Não encontramos conceitos com "${searchQuery}"`}
          />
        ) : (
          <EmptyState
            icon={BookOpen}
            title="Nenhum conceito cadastrado"
            description="Comece criando seu primeiro conceito de estudo"
            action={{
              label: "Criar Primeiro Conceito",
              onClick: () => router.push("/concepts/new"),
              icon: Plus
            }}
          />
        )}
      </PageContent>
    </PageLayout>
  );
}
