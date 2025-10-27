"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Home,
  BookOpen,
  ListTodo,
  BarChart3,
  Calendar,
  ArrowRight,
} from "lucide-react";

const navigationItems = [
  { href: "/", label: "Início", icon: Home, description: "Voltar para home" },
  {
    href: "/overview",
    label: "Visão Geral",
    icon: BarChart3,
    description: "Ver estatísticas",
  },
  {
    href: "/tasks",
    label: "Tarefas",
    icon: ListTodo,
    description: "Gerenciar tarefas",
  },
  {
    href: "/flashcards",
    label: "Flashcards",
    icon: BookOpen,
    description: "Estudar flashcards",
  },
  {
    href: "/calendar",
    label: "Calendário",
    icon: Calendar,
    description: "Ver calendário",
  },
];

export function Animated404() {
  const [mounted, setMounted] = useState(false);
  const [floatingNumbers, setFloatingNumbers] = useState<
    Array<{ id: number; left: number; delay: number }>
  >([]);

  useEffect(() => {
    setMounted(true);
    // Gerar números flutuantes animados
    const numbers = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
    }));
    setFloatingNumbers(numbers);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden flex items-center justify-center px-4">
      {/* Fundo animado com elementos flutuantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Círculos de fundo */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-300/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

        {/* Números flutuantes */}
        {floatingNumbers.map((num) => (
          <div
            key={num.id}
            className="absolute text-primary/10 font-bold text-6xl pointer-events-none"
            style={{
              left: `${num.left}%`,
              top: "0%",
              animation: `float ${6 + (num.id % 3)}s ease-in-out ${num.delay}s infinite`,
            }}
          >
            {Math.floor(Math.random() * 10)}
          </div>
        ))}
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
        {/* Números 404 animados */}
        <div className="relative h-32 flex items-center justify-center">
          <div className="text-9xl font-black bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent animate-pulse">
            404
          </div>
          <div
            className="absolute inset-0 text-9xl font-black opacity-0 animate-ping"
            style={{
              color: "rgba(var(--color-primary), 0.2)",
              animation: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
            }}
          >
            404
          </div>
        </div>

        {/* Mensagem principal */}
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Página não encontrada
          </h1>
          <p className="text-lg text-muted-foreground">
            Parece que você se perdeu em algum lugar do espaço... 🚀
          </p>
        </div>

        {/* Descrição com emoji */}
        <div className="flex flex-col items-center space-y-4">
          <p className="text-base text-muted-foreground max-w-md">
            A página que você está procurando não existe, mas temos muito
            conteúdo legal esperando por você!
          </p>
        </div>

        {/* Grade de navegação */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mt-12">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="group relative">
                <Button
                  asChild
                  variant="outline"
                  className="w-full h-auto py-6 flex flex-col items-center gap-2 transition-all duration-300 hover:border-primary hover:bg-primary/5"
                  style={{
                    animation: `slideUp 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <div className="flex flex-col items-center gap-2 w-full">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-sm font-semibold">{item.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  </div>
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Botão primário para home */}
        <div className="pt-6">
          <Button asChild size="lg" className="group gap-2">
            <Link href="/">
              <span>Voltar para Início</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {/* Footer com mensagem funny */}
        <p className="text-sm text-muted-foreground pt-8">
          Erro 404 •{" "}
          <span className="text-primary">
            A página existe em uma dimensão paralela
          </span>{" "}
          • {new Date().getFullYear()}
        </p>
      </div>

      {/* Estilos de animação */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(100px);
            opacity: 0;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
