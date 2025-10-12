import { PageLayout, PageHeader, PageContent } from "@/components/layout";
import { EmptyState } from "@/components/ui/empty-state";
import { User } from "lucide-react";

export default function ProfilePage() {
  return (
    <PageLayout maxWidth="xl">
      <PageHeader
        title="Perfil"
        description="Gerencie suas informações e preferências"
      />

      <PageContent>
        <EmptyState
          icon={User}
          title="Página em Desenvolvimento"
          description="O gerenciamento de perfil estará disponível em breve"
        />
      </PageContent>
    </PageLayout>
  );
}
