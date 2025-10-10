// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Provider } from 'jotai';

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="pt-BR">
      <body className={inter.className}>
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  );
}