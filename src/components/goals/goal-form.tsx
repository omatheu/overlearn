"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";
import { StudyGoal, useCreateGoal, useUpdateGoal } from "@/lib/hooks/useGoals";

interface GoalFormProps {
  goal?: StudyGoal;
  onSuccess?: () => void;
}

export function GoalForm({ goal, onSuccess }: GoalFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: goal?.title || "",
    description: goal?.description || "",
    targetDate: goal?.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : "",
    status: goal?.status || "active",
  });

  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title,
        description: goal.description || "",
        targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : "",
        status: goal.status,
      });
    }
  }, [goal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (goal) {
        await updateGoal.mutateAsync({
          id: goal.id,
          title: formData.title,
          description: formData.description || undefined,
          targetDate: formData.targetDate || undefined,
          status: formData.status,
        });
      } else {
        await createGoal.mutateAsync({
          title: formData.title,
          description: formData.description || undefined,
          targetDate: formData.targetDate || undefined,
          status: formData.status,
        });
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/goals");
      }
    } catch (error) {
      console.error("Erro ao salvar meta:", error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isLoading = createGoal.isPending || updateGoal.isPending;
  const error = createGoal.error || updateGoal.error;

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{goal ? "Editar Meta" : "Nova Meta de Estudo"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">
              Título <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Ex: Dominar React Hooks"
              required
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Descreva sua meta de estudo..."
              rows={4}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="targetDate">Data Alvo</Label>
              <Input
                id="targetDate"
                type="date"
                value={formData.targetDate}
                onChange={(e) => handleChange("targetDate", e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
                disabled={isLoading}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="paused">Pausada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error instanceof Error ? error.message : "Erro ao salvar meta"}
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
            <Button type="submit" disabled={isLoading || !formData.title.trim()}>
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
