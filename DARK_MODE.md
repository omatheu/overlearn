# 🌙 Dark Mode System

Sistema completo de Dark Mode/Light Mode com alternância suave e persistência local.

## 📋 Visão Geral

O sistema de temas do OverLearn oferece:
- ✅ **3 Modos**: Light, Dark e System (segue preferência do SO)
- ✅ **Persistência**: Salva escolha no localStorage
- ✅ **Transições Suaves**: Animações de 150ms entre temas
- ✅ **Type-Safe**: Totalmente tipado em TypeScript
- ✅ **SSR Safe**: Previne flash de conteúdo não estilizado
- ✅ **Acessível**: ARIA labels e keyboard navigation

---

## 🎯 Componentes

### 1. ThemeProvider

Context provider que gerencia o estado do tema globalmente.

**Localização:** `src/lib/hooks/useTheme.tsx`

```tsx
import { ThemeProvider } from '@/lib/hooks/useTheme';

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Nota:** O `suppressHydrationWarning` no `<html>` é necessário para evitar warnings quando o tema é aplicado no client-side.

### 2. useTheme Hook

Hook para acessar e controlar o tema em qualquer componente.

```tsx
import { useTheme } from '@/lib/hooks/useTheme';

function MyComponent() {
  const { theme, setTheme, actualTheme } = useTheme();

  return (
    <div>
      <p>Tema atual: {theme}</p>
      <p>Tema aplicado: {actualTheme}</p>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  );
}
```

**API:**
```typescript
interface ThemeContextType {
  theme: "light" | "dark" | "system";     // Tema selecionado pelo usuário
  setTheme: (theme: Theme) => void;       // Função para mudar o tema
  actualTheme: "light" | "dark";          // Tema realmente aplicado
}
```

### 3. ThemeToggle Component

Componente dropdown com 3 opções de tema.

**Localização:** `src/components/ui/theme-toggle.tsx`

```tsx
import { ThemeToggle } from '@/components/ui/theme-toggle';

function Header() {
  return (
    <header>
      <h1>Meu App</h1>
      <ThemeToggle />
    </header>
  );
}
```

**Variações:**

#### Dropdown Completo (Padrão)
```tsx
<ThemeToggle />
```
- Mostra Light, Dark e System
- Indica tema ativo com checkmark
- Ícones para cada opção

#### Toggle Simples
```tsx
import { SimpleThemeToggle } from '@/components/ui/theme-toggle';

<SimpleThemeToggle />
```
- Alterna apenas entre Light e Dark
- Sem opção System
- Mais minimalista

---

## 🎨 Estilos e Cores

### Transições Suaves

O CSS global aplica transições automáticas em todos os elementos:

```css
/* src/app/globals.css */
* {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

html {
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

### Variáveis de Cor

As cores são definidas em `src/app/globals.css`:

```css
:root {
  --background: oklch(1 0 0);        /* Branco */
  --foreground: oklch(0.145 0 0);    /* Preto */
  /* ... mais cores */
}

.dark {
  --background: oklch(0.145 0 0);    /* Preto */
  --foreground: oklch(0.985 0 0);    /* Branco */
  /* ... mais cores */
}
```

### Design Tokens Dark Mode

Ajustes específicos para dark mode em `src/styles/design-tokens.css`:

```css
.dark {
  /* Prioridades com fundos mais escuros */
  --color-priority-urgent-bg: oklch(0.25 0.1 27.325);
  --color-priority-high-bg: oklch(0.25 0.08 40);

  /* Sombras mais intensas */
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4);
}
```

---

## 💡 Como Usar

### Em Páginas

```tsx
'use client';

import { useTheme } from '@/lib/hooks/useTheme';

export default function MyPage() {
  const { actualTheme } = useTheme();

  return (
    <div>
      {actualTheme === 'dark' ? (
        <DarkModeContent />
      ) : (
        <LightModeContent />
      )}
    </div>
  );
}
```

### Estilos Condicionais

Use classes Tailwind com o prefixo `dark:`:

```tsx
<div className="bg-white dark:bg-gray-900">
  <h1 className="text-gray-900 dark:text-gray-100">
    Título
  </h1>
</div>
```

### Ícones que Mudam

```tsx
import { Sun, Moon } from 'lucide-react';

<div className="relative">
  {/* Ícone do sol (visível em light mode) */}
  <Sun className="h-5 w-5 rotate-0 scale-100 dark:-rotate-90 dark:scale-0 transition-transform" />

  {/* Ícone da lua (visível em dark mode) */}
  <Moon className="absolute h-5 w-5 rotate-90 scale-0 dark:rotate-0 dark:scale-100 transition-transform" />
</div>
```

---

## 🔧 Configuração Avançada

### Adicionar Novo Tema

1. Editar `useTheme.tsx`:
```tsx
type Theme = "light" | "dark" | "system" | "high-contrast";
```

2. Adicionar classe CSS:
```css
.high-contrast {
  --background: #000;
  --foreground: #fff;
  /* ... */
}
```

3. Atualizar ThemeToggle:
```tsx
<DropdownMenuItem onClick={() => setTheme("high-contrast")}>
  High Contrast
</DropdownMenuItem>
```

### Detectar Mudanças do Sistema

O hook já observa mudanças automáticas quando `theme === "system"`:

```tsx
useEffect(() => {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const handler = () => {
    if (theme === "system") {
      // Atualiza automaticamente
    }
  };

  mediaQuery.addEventListener("change", handler);
  return () => mediaQuery.removeEventListener("change", handler);
}, [theme]);
```

### Desabilitar Transições

Para desabilitar transições em elementos específicos:

```tsx
<div className="transition-none">
  Sem transição de tema
</div>
```

---

## ✅ Checklist de Implementação

Ao adicionar Dark Mode em novas páginas:

- [ ] Página usa `PageLayout` (já suporta dark mode)
- [ ] Cores usam variáveis CSS (`text-foreground`, `bg-background`)
- [ ] Evitar cores hardcoded (`text-black`, `bg-white`)
- [ ] Usar classes `dark:` do Tailwind quando necessário
- [ ] Testar com os 3 modos (Light, Dark, System)
- [ ] Verificar contraste de textos
- [ ] Testar transições suaves

---

## 🎯 Boas Práticas

### ✅ Fazer

```tsx
// Usar variáveis semânticas
<div className="bg-background text-foreground">

// Usar classes dark:
<div className="bg-white dark:bg-gray-900">

// Usar design tokens
<div style={{ color: 'var(--color-primary)' }}>
```

### ❌ Evitar

```tsx
// Cores hardcoded
<div className="bg-white text-black">

// Inline styles com cores fixas
<div style={{ backgroundColor: '#ffffff' }}>

// Assumir que é sempre light mode
{theme === 'light' && <Component />}
```

---

## 🐛 Troubleshooting

### Flash de Conteúdo Não Estilizado

**Problema:** Página pisca em branco ao carregar em dark mode.

**Solução:** Adicionar `suppressHydrationWarning` no `<html>`:
```tsx
<html lang="pt-BR" suppressHydrationWarning>
```

### Tema Não Persiste

**Problema:** Tema volta ao padrão após refresh.

**Solução:** Verificar se localStorage está disponível:
```tsx
if (typeof window !== 'undefined') {
  localStorage.setItem('theme', theme);
}
```

### Transições Muito Rápidas/Lentas

**Problema:** Animações não estão suaves.

**Solução:** Ajustar duração em `globals.css`:
```css
* {
  transition-duration: 200ms; /* Ajuste conforme necessário */
}
```

### Componente Não Atualiza

**Problema:** Componente não re-renderiza ao mudar tema.

**Solução:** Usar `useTheme()` hook:
```tsx
'use client';
import { useTheme } from '@/lib/hooks/useTheme';

function MyComponent() {
  const { actualTheme } = useTheme(); // Força re-render
  return <div>{actualTheme}</div>;
}
```

---

## 📊 Performance

- **Bundle Size**: +2KB (ThemeProvider + ThemeToggle)
- **Re-renders**: Apenas componentes que usam `useTheme()`
- **localStorage**: 1 write por mudança de tema
- **CSS**: Transições aplicadas via GPU (transform, opacity)

---

## 🎨 Exemplos Visuais

### Header com Theme Toggle

```tsx
<header className="border-b bg-background/95 backdrop-blur">
  <div className="container flex items-center justify-between py-4">
    <Logo />
    <ThemeToggle />
  </div>
</header>
```

### Card Adaptativo

```tsx
<Card className="bg-card hover:bg-accent/10 dark:hover:bg-accent/5">
  <CardHeader>
    <CardTitle className="text-foreground">
      Título
    </CardTitle>
  </CardHeader>
  <CardContent className="text-muted-foreground">
    Conteúdo
  </CardContent>
</Card>
```

### Badge com Cores Semânticas

```tsx
<Badge className="bg-primary text-primary-foreground">
  Status
</Badge>

<Badge className="bg-destructive text-destructive-foreground">
  Erro
</Badge>
```

---

## 📚 Recursos

- [Tailwind Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)
- [localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

---

**Status:** ✅ Implementado e Testado
**Versão:** 1.0.0
**Última Atualização:** 2025-01-11
