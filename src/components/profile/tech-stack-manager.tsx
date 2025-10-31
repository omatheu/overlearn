"use client";

import { useState } from "react";
import {
  useTechStack,
  useAddTechStack,
  useDeleteTechStack,
  TechStack,
} from "@/lib/hooks/useProfile";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus, Trash2, Code2 } from "lucide-react";

const CATEGORIES = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "database", label: "Database" },
  { value: "devops", label: "DevOps" },
  { value: "mobile", label: "Mobile" },
  { value: "other", label: "Outro" },
];

const PROFICIENCY_LEVELS = [
  { value: "learning", label: "Aprendendo", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  { value: "intermediate", label: "Intermediário", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400" },
  { value: "advanced", label: "Avançado", color: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400" },
  { value: "expert", label: "Expert", color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" },
];

export function TechStackManager() {
  const { data: techStack, isLoading } = useTechStack();
  const addTech = useAddTechStack();
  const deleteTech = useDeleteTechStack();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    technology: "",
    category: "",
    proficiencyLevel: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.technology || !formData.category || !formData.proficiencyLevel) {
      return;
    }

    try {
      await addTech.mutateAsync(formData);
      setFormData({
        technology: "",
        category: "",
        proficiencyLevel: "",
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro ao adicionar tecnologia:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover esta tecnologia?")) {
      return;
    }

    try {
      await deleteTech.mutateAsync(id);
    } catch (error) {
      console.error("Erro ao remover tecnologia:", error);
    }
  };

  const getProficiencyInfo = (level: string) => {
    return PROFICIENCY_LEVELS.find((p) => p.value === level) || PROFICIENCY_LEVELS[0];
  };

  const getCategoryLabel = (category: string) => {
    return CATEGORIES.find((c) => c.value === category)?.label || category;
  };

  const groupedByCategory = techStack?.reduce((acc, tech) => {
    if (!acc[tech.category]) {
      acc[tech.category] = [];
    }
    acc[tech.category].push(tech);
    return acc;
  }, {} as Record<string, TechStack[]>);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Stack Tecnológica</CardTitle>
            <CardDescription>
              Gerencie as tecnologias que você conhece ou está aprendendo
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Tecnologia
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Tecnologia</DialogTitle>
                <DialogDescription>
                  Adicione uma nova tecnologia ao seu stack
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="technology">Tecnologia</Label>
                    <Input
                      id="technology"
                      value={formData.technology}
                      onChange={(e) =>
                        setFormData({ ...formData, technology: e.target.value })
                      }
                      placeholder="Ex: React, Node.js, PostgreSQL..."
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                      required
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="proficiencyLevel">Nível de Proficiência</Label>
                    <Select
                      value={formData.proficiencyLevel}
                      onValueChange={(value) =>
                        setFormData({ ...formData, proficiencyLevel: value })
                      }
                      required
                    >
                      <SelectTrigger id="proficiencyLevel">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {PROFICIENCY_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter className="mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={addTech.isPending}>
                    {addTech.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adicionando...
                      </>
                    ) : (
                      "Adicionar"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {!techStack || techStack.length === 0 ? (
          <div className="text-center py-8">
            <Code2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Nenhuma tecnologia adicionada ainda
            </p>
            <Button onClick={() => setIsDialogOpen(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeira Tecnologia
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByCategory || {}).map(([category, techs]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase">
                  {getCategoryLabel(category)}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {techs.map((tech) => {
                    const proficiency = getProficiencyInfo(tech.proficiencyLevel);
                    return (
                      <div
                        key={tech.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{tech.technology}</div>
                          <Badge
                            variant="outline"
                            className={`mt-1 text-xs ${proficiency.color}`}
                          >
                            {proficiency.label}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(tech.id)}
                          disabled={deleteTech.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {addTech.isError && (
          <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            {addTech.error instanceof Error ? addTech.error.message : "Erro ao adicionar tecnologia"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
