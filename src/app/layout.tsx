// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";
import { Provider } from "jotai";
import { ThemeProvider } from "@/lib/hooks/useTheme";
import { QueryProvider } from "@/components/providers/query-provider";
import { Header } from "@/components/layout/header";

export const metadata: Metadata = {
  title: "OverLearn - Aprendizado Proativo",
  description: "Assistente de aprendizado para desenvolvedores",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <QueryProvider>
            <Provider>
              <Suspense fallback={<div className="h-16" />}>
                <Header />
              </Suspense>
              {children}
            </Provider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
