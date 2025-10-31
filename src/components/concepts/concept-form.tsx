"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";
import { Concept, useCreateConcept, useUpdateConcept } from "@/lib/hooks/useConcepts";

interface ConceptFormProps {
  concept?: Concept;
  onSuccess?: () => void;
}

export function ConceptForm({ concept, onSuccess }: ConceptFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: concept?.name || "",
    description: concept?.description || "",
    category: concept?.category || "",
  });

  const createConcept = useCreateConcept();
  const updateConcept = useUpdateConcept();

  useEffect(() => {
    if (concept) {
      setFormData({
        name: concept.name,
        description: concept.description || "",
        category: concept.category || "",
      });
    }
  }, [concept]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (concept) {
        await updateConcept.mutateAsync({
          id: concept.id,
          name: formData.name,
          description: formData.description || undefined,
          category: formData.category || undefined,
        });
      } else {
        await createConcept.mutateAsync({
          name: formData.name,
          description: formData.description || undefined,
          category: formData.category || undefined,
        });
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/concepts");
      }
    } catch (error) {
      console.error("Erro ao salvar conceito:", error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isLoading = createConcept.isPending || updateConcept.isPending;
  const error = createConcept.error || updateConcept.error;

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{concept ? "Editar Conceito" : "Novo Conceito"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">
              Nome <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Ex: React Hooks, Algoritmos de Busca..."
              required
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Categoria</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => handleChange("category", e.target.value)}
              placeholder="Ex: Frontend, Backend, Algoritmos..."
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Descreva o conceito..."
              rows={4}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error instanceof Error ? error.message : "Erro ao salvar conceito"}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !formData.name.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
