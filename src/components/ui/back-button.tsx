"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface BackButtonProps {
  /**
   * URL para voltar. Se não fornecido, usa router.back()
   */
  href?: string;
  /**
   * Texto do botão. Padrão: "Voltar"
   */
  label?: string;
  /**
   * Variante do botão
   */
  variant?: "default" | "outline" | "ghost" | "link";
  /**
   * Classe CSS adicional
   */
  className?: string;
}

export function BackButton({
  href,
  label = "Voltar",
  variant = "ghost",
  className
}: BackButtonProps) {
  const router = useRouter();

  if (href) {
    return (
      <Button
        variant={variant}
        className={className}
        asChild
      >
        <Link href={href}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {label}
        </Link>
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      onClick={() => router.back()}
      className={className}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}
