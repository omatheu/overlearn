"use client";

import { useState, useEffect } from "react";
import { useUpdateProfile, UserProfile } from "@/lib/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";

interface ProfileFormProps {
  profile: UserProfile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    name: profile.name || "",
    email: profile.email || "",
    yearsOfExperience: profile.yearsOfExperience?.toString() || "",
    currentRole: profile.currentRole || "",
    professionalGoal: profile.professionalGoal || "",
    workHoursStart: profile.workHoursStart,
    workHoursEnd: profile.workHoursEnd,
    pomodoroMinutes: profile.pomodoroMinutes.toString(),
    breakMinutes: profile.breakMinutes.toString(),
  });

  const updateProfile = useUpdateProfile();

  useEffect(() => {
    setFormData({
      name: profile.name || "",
      email: profile.email || "",
      yearsOfExperience: profile.yearsOfExperience?.toString() || "",
      currentRole: profile.currentRole || "",
      professionalGoal: profile.professionalGoal || "",
      workHoursStart: profile.workHoursStart,
      workHoursEnd: profile.workHoursEnd,
      pomodoroMinutes: profile.pomodoroMinutes.toString(),
      breakMinutes: profile.breakMinutes.toString(),
    });
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateProfile.mutateAsync({
        name: formData.name || null,
        email: formData.email || null,
        yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : null,
        currentRole: formData.currentRole || null,
        professionalGoal: formData.professionalGoal || null,
        workHoursStart: formData.workHoursStart,
        workHoursEnd: formData.workHoursEnd,
        pomodoroMinutes: parseInt(formData.pomodoroMinutes),
        breakMinutes: parseInt(formData.breakMinutes),
      });
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Pessoais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>
            Configure suas informações básicas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Seu nome"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="seu@email.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Informações Profissionais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Profissionais</CardTitle>
          <CardDescription>
            Configure seu perfil profissional
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="yearsOfExperience">Anos de Experiência</Label>
              <Input
                id="yearsOfExperience"
                type="number"
                min="0"
                value={formData.yearsOfExperience}
                onChange={(e) => handleChange("yearsOfExperience", e.target.value)}
                placeholder="Ex: 3"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="currentRole">Cargo Atual</Label>
              <Select
                value={formData.currentRole}
                onValueChange={(value) => handleChange("currentRole", value)}
              >
                <SelectTrigger id="currentRole">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Júnior">Júnior</SelectItem>
                  <SelectItem value="Pleno">Pleno</SelectItem>
                  <SelectItem value="Sênior">Sênior</SelectItem>
                  <SelectItem value="Tech Lead">Tech Lead</SelectItem>
                  <SelectItem value="Arquiteto">Arquiteto</SelectItem>
                  <SelectItem value="CTO">CTO</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="professionalGoal">Meta Profissional</Label>
            <Textarea
              id="professionalGoal"
              value={formData.professionalGoal}
              onChange={(e) => handleChange("professionalGoal", e.target.value)}
              placeholder="Descreva sua meta profissional..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Trabalho */}
      <Card>
        <CardHeader>
          <CardTitle>Horário de Trabalho</CardTitle>
          <CardDescription>
            Configure seu horário de trabalho padrão
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="workHoursStart">Início</Label>
              <Input
                id="workHoursStart"
                type="time"
                value={formData.workHoursStart}
                onChange={(e) => handleChange("workHoursStart", e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="workHoursEnd">Fim</Label>
              <Input
                id="workHoursEnd"
                type="time"
                value={formData.workHoursEnd}
                onChange={(e) => handleChange("workHoursEnd", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Pomodoro */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Pomodoro</CardTitle>
          <CardDescription>
            Personalize os tempos do seu timer Pomodoro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="pomodoroMinutes">Duração do Pomodoro (min)</Label>
              <Input
                id="pomodoroMinutes"
                type="number"
                min="1"
                max="60"
                value={formData.pomodoroMinutes}
                onChange={(e) => handleChange("pomodoroMinutes", e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="breakMinutes">Duração do Intervalo (min)</Label>
              <Input
                id="breakMinutes"
                type="number"
                min="1"
                max="30"
                value={formData.breakMinutes}
                onChange={(e) => handleChange("breakMinutes", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={updateProfile.isPending} size="lg">
          {updateProfile.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>

      {updateProfile.isSuccess && (
        <div className="p-3 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-lg text-sm text-center">
          Perfil atualizado com sucesso!
        </div>
      )}

      {updateProfile.isError && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm text-center">
          Erro ao atualizar perfil. Tente novamente.
        </div>
      )}
    </form>
  );
}
