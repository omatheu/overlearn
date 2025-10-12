import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: boolean;
}

/**
 * Layout padrão para páginas da aplicação
 *
 * @example
 * ```tsx
 * <PageLayout maxWidth="xl">
 *   <PageHeader title="Tarefas" description="Gerencie suas tasks" />
 *   <PageContent>
 *     // Conteúdo
 *   </PageContent>
 * </PageLayout>
 * ```
 */
export function PageLayout({
  children,
  className,
  maxWidth = "xl",
  padding = true,
}: PageLayoutProps) {
  return (
    <div
      className={cn(
        "min-h-screen bg-background",
        padding && "py-6 sm:py-8 lg:py-10",
        className
      )}
    >
      <div
        className={cn(
          "mx-auto w-full",
          padding && "px-4 sm:px-6 lg:px-8",
          maxWidth === "sm" && "max-w-2xl",
          maxWidth === "md" && "max-w-4xl",
          maxWidth === "lg" && "max-w-5xl",
          maxWidth === "xl" && "max-w-6xl",
          maxWidth === "2xl" && "max-w-7xl",
          maxWidth === "full" && "max-w-full"
        )}
      >
        {children}
      </div>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  badge?: ReactNode;
  className?: string;
}

/**
 * Cabeçalho padrão de página com título, descrição e ação opcional
 */
export function PageHeader({
  title,
  description,
  action,
  badge,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-8 space-y-2", className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          {badge}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {description && (
        <p className="text-base text-muted-foreground max-w-3xl">
          {description}
        </p>
      )}
    </div>
  );
}

interface PageContentProps {
  children: ReactNode;
  className?: string;
}

/**
 * Container para o conteúdo principal da página
 */
export function PageContent({ children, className }: PageContentProps) {
  return <div className={cn("space-y-6", className)}>{children}</div>;
}

interface SectionProps {
  children: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Seção de conteúdo com título opcional
 */
export function Section({
  children,
  title,
  description,
  action,
  className,
}: SectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      {(title || description || action) && (
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            {title && (
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div>{children}</div>
    </section>
  );
}
