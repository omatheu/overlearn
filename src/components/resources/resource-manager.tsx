"use client";

import { useState } from "react";
import { useResources, useAddResource, useUpdateResource, useDeleteResource } from "@/lib/hooks/useResources";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, ExternalLink, Trash2, BookOpen } from "lucide-react";

interface ResourceManagerProps {
  conceptId: string;
}

const RESOURCE_TYPES = [
  { value: "video", label: "Vídeo", icon: "🎥" },
  { value: "article", label: "Artigo", icon: "📄" },
  { value: "documentation", label: "Documentação", icon: "📚" },
  { value: "course", label: "Curso", icon: "🎓" },
];

export function ResourceManager({ conceptId }: ResourceManagerProps) {
  const { data: resources, isLoading } = useResources(conceptId);
  const addResource = useAddResource();
  const updateResource = useUpdateResource();
  const deleteResource = useDeleteResource();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    url: "",
    title: "",
    type: "article",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.url.trim()) return;

    try {
      await addResource.mutateAsync({
        url: formData.url,
        title: formData.title || undefined,
        type: formData.type,
        conceptId,
      });
      setFormData({ url: "", title: "", type: "article" });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro ao adicionar recurso:", error);
    }
  };

  const handleToggleRead = async (id: string, currentStatus: boolean) => {
    try {
      await updateResource.mutateAsync({
        id,
        isRead: !currentStatus,
      });
    } catch (error) {
      console.error("Erro ao atualizar recurso:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este recurso?")) return;

    try {
      await deleteResource.mutateAsync(id);
    } catch (error) {
      console.error("Erro ao remover recurso:", error);
    }
  };

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
          <CardTitle>Recursos de Aprendizado</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Recurso</DialogTitle>
                <DialogDescription>
                  Adicione um link para um recurso de aprendizado
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="url">URL *</Label>
                    <Input
                      id="url"
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://..."
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="title">Título (opcional)</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Nome do recurso"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RESOURCE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={addResource.isPending}>
                    {addResource.isPending ? (
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
        {!resources || resources.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Nenhum recurso adicionado ainda</p>
            <Button onClick={() => setIsDialogOpen(true)} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Recurso
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {resources.map((resource) => {
              const typeInfo = RESOURCE_TYPES.find((t) => t.value === resource.type);
              return (
                <div
                  key={resource.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{typeInfo?.icon}</span>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:underline truncate"
                      >
                        {resource.title || resource.url}
                        <ExternalLink className="h-3 w-3 inline ml-1" />
                      </a>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{resource.url}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Badge
                      variant={resource.isRead ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleToggleRead(resource.id, resource.isRead)}
                    >
                      {resource.isRead ? "Lido" : "Não lido"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(resource.id)}
                      disabled={deleteResource.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
