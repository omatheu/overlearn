"use client";

import { PageLayout, PageHeader, PageContent } from "@/components/layout";
import { ProfileForm } from "@/components/profile/profile-form";
import { TechStackManager } from "@/components/profile/tech-stack-manager";
import { useProfile } from "@/lib/hooks/useProfile";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { data: profile, isLoading, error } = useProfile();

  if (isLoading) {
    return (
      <PageLayout maxWidth="xl">
        <PageHeader
          title="Perfil"
          description="Gerencie suas informações e preferências"
        />
        <PageContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </PageContent>
      </PageLayout>
    );
  }

  if (error || !profile) {
    return (
      <PageLayout maxWidth="xl">
        <PageHeader
          title="Perfil"
          description="Gerencie suas informações e preferências"
        />
        <PageContent>
          <div className="text-center py-12">
            <p className="text-destructive">
              Erro ao carregar perfil. Tente novamente.
            </p>
          </div>
        </PageContent>
      </PageLayout>
    );
  }

  return (
    <PageLayout maxWidth="xl">
      <PageHeader
        title="Perfil"
        description="Gerencie suas informações e preferências"
      />

      <PageContent>
        <div className="space-y-8">
          {/* Profile Form */}
          <ProfileForm profile={profile} />

          {/* Tech Stack Manager */}
          <TechStackManager />
        </div>
      </PageContent>
    </PageLayout>
  );
}
