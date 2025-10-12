# 🎨 OverLearn Design System

Sistema de design consistente para a aplicação OverLearn.

## 📋 Índice

- [Cores](#cores)
- [Tipografia](#tipografia)
- [Espaçamento](#espaçamento)
- [Componentes de Layout](#componentes-de-layout)
- [Componentes UI](#componentes-ui)
- [Boas Práticas](#boas-práticas)

---

## 🎨 Cores

### Cores Base

As cores base são definidas em `src/app/globals.css`:

- **Background**: Fundo principal da aplicação
- **Foreground**: Texto principal
- **Primary**: Cor primária da marca
- **Secondary**: Cor secundária
- **Muted**: Elementos menos importantes
- **Accent**: Destaques e hover states
- **Destructive**: Ações destrutivas (delete, error)
- **Border**: Bordas de elementos

### Cores Semânticas

Definidas em `src/styles/design-tokens.css`:

```css
--color-success: /* Verde para sucesso */
--color-warning: /* Amarelo para avisos */
--color-error: /* Vermelho para erros */
--color-info: /* Azul para informações */
```

### Cores de Prioridade (Tasks)

```tsx
import { PriorityBadge } from '@/components/ui/priority-badge';

<PriorityBadge priority="urgent" />  {/* Vermelho */}
<PriorityBadge priority="high" />    {/* Laranja */}
<PriorityBadge priority="medium" />  {/* Azul */}
<PriorityBadge priority="low" />     {/* Cinza */}
```

### Cores de Status (Tasks)

```tsx
import { StatusBadge } from '@/components/ui/status-badge';

<StatusBadge status="todo" />     {/* Cinza */}
<StatusBadge status="doing" />    {/* Azul */}
<StatusBadge status="done" />     {/* Verde */}
<StatusBadge status="blocked" />  {/* Vermelho */}
```

---

## 📝 Tipografia

### Font Families

```css
--font-display: var(--font-geist-sans);  /* Títulos e headings */
--font-body: var(--font-geist-sans);     /* Corpo de texto */
--font-code: var(--font-geist-mono);     /* Código e monospace */
```

### Font Sizes

| Token | Tamanho | Uso |
|-------|---------|-----|
| `text-xs` | 12px | Labels pequenas, badges |
| `text-sm` | 14px | Texto secundário, descrições |
| `text-base` | 16px | Texto padrão do corpo |
| `text-lg` | 18px | Texto destacado |
| `text-xl` | 20px | Subtítulos |
| `text-2xl` | 24px | Títulos de seções |
| `text-3xl` | 30px | Títulos de páginas |
| `text-4xl` | 36px | Títulos grandes |
| `text-5xl` | 48px | Hero text |

### Exemplo de Uso

```tsx
<h1 className="text-3xl font-bold">Título da Página</h1>
<p className="text-base text-muted-foreground">Descrição da página</p>
<span className="text-sm text-muted-foreground">Texto secundário</span>
```

### Font Weights

| Token | Peso | Uso |
|-------|------|-----|
| `font-light` | 300 | Texto leve (raro) |
| `font-normal` | 400 | Texto padrão |
| `font-medium` | 500 | Ênfase leve |
| `font-semibold` | 600 | Subtítulos, labels |
| `font-bold` | 700 | Títulos, destaques |

---

## 📏 Espaçamento

### Scale de Espaçamento

Use múltiplos de 4px para consistência:

| Token | Valor | Uso |
|-------|-------|-----|
| `space-1` | 4px | Espaçamento mínimo |
| `space-2` | 8px | Espaço entre elementos inline |
| `space-3` | 12px | Espaço pequeno |
| `space-4` | 16px | Espaço padrão |
| `space-6` | 24px | Espaço médio |
| `space-8` | 32px | Espaço grande |
| `space-12` | 48px | Separação de seções |
| `space-16` | 64px | Espaço muito grande |

### Exemplo de Uso

```tsx
<div className="space-y-6">  {/* 24px entre elementos verticais */}
  <Card className="p-6">     {/* 24px de padding interno */}
    <h2 className="mb-4">Título</h2>  {/* 16px de margem inferior */}
    <p className="mb-2">Parágrafo</p> {/* 8px de margem inferior */}
  </Card>
</div>
```

---

## 🏗️ Componentes de Layout

### PageLayout

Wrapper principal para páginas:

```tsx
import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';

<PageLayout maxWidth="xl">
  <PageHeader
    title="Minhas Tarefas"
    description="Gerencie suas tasks e projetos"
    action={<Button>Nova Task</Button>}
  />
  <PageContent>
    {/* Conteúdo da página */}
  </PageContent>
</PageLayout>
```

**Props de PageLayout:**
- `maxWidth`: `"sm" | "md" | "lg" | "xl" | "2xl" | "full"` (default: `"xl"`)
- `padding`: `boolean` (default: `true`)

### Section

Para separar seções dentro de uma página:

```tsx
import { Section } from '@/components/layout/page-layout';

<Section
  title="Tarefas Recentes"
  description="Últimas 5 tarefas atualizadas"
  action={<Button variant="outline">Ver Todas</Button>}
>
  {/* Conteúdo da seção */}
</Section>
```

### Grid

Sistema de grid responsivo:

```tsx
import { Grid } from '@/components/layout/grid';

<Grid cols={{ default: 1, md: 2, lg: 3 }} gap={6}>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</Grid>
```

**Props:**
- `cols`: Objeto com breakpoints (`default`, `sm`, `md`, `lg`, `xl`, `2xl`)
- `gap`: Espaçamento entre itens (`2, 3, 4, 6, 8, 10, 12`)

### Stack

Layout flexbox vertical ou horizontal:

```tsx
import { Stack } from '@/components/layout/grid';

<Stack direction="horizontal" spacing={4} align="center">
  <Button>Ação 1</Button>
  <Button>Ação 2</Button>
</Stack>
```

**Props:**
- `direction`: `"vertical" | "horizontal"`
- `spacing`: `1 | 2 | 3 | 4 | 6 | 8`
- `align`: `"start" | "center" | "end" | "stretch"`
- `justify`: `"start" | "center" | "end" | "between" | "around"`

---

## 🧩 Componentes UI

### EmptyState

Para estados vazios:

```tsx
import { EmptyState } from '@/components/ui/empty-state';
import { Calendar, Plus } from 'lucide-react';

<EmptyState
  icon={Calendar}
  title="Nenhuma task agendada"
  description="Comece agendando sua primeira task no calendário"
  action={{
    label: "Nova Task",
    onClick: () => router.push('/tasks/new'),
    icon: Plus
  }}
/>
```

### Badges

Use badges para indicar status, prioridades e metadados:

```tsx
import { PriorityBadge } from '@/components/ui/priority-badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';

<PriorityBadge priority="high" showIcon />
<StatusBadge status="doing" showIcon />
<Badge variant="outline">Custom Badge</Badge>
```

---

## ✅ Boas Práticas

### 1. **Hierarquia Visual**

```tsx
// ✅ Bom
<PageLayout>
  <PageHeader title="Título Principal" description="Subtítulo" />
  <Section title="Seção">
    <Card>
      <h3 className="text-xl font-semibold">Card Title</h3>
      <p className="text-sm text-muted-foreground">Descrição</p>
    </Card>
  </Section>
</PageLayout>

// ❌ Ruim - sem hierarquia clara
<div>
  <h1>Título</h1>
  <h2>Outro título</h2>
  <div>Conteúdo</div>
</div>
```

### 2. **Espaçamento Consistente**

```tsx
// ✅ Bom - usa múltiplos de 4
<div className="space-y-6">
  <Card className="p-6">
    <h2 className="mb-4">Título</h2>
  </Card>
</div>

// ❌ Ruim - valores aleatórios
<div className="space-y-5">
  <Card className="p-7">
    <h2 className="mb-3">Título</h2>
  </Card>
</div>
```

### 3. **Cores Semânticas**

```tsx
// ✅ Bom - usa badges com cores semânticas
<PriorityBadge priority="urgent" />
<StatusBadge status="done" />

// ❌ Ruim - cores hardcoded
<span className="bg-red-500 text-white">Urgente</span>
```

### 4. **Responsividade**

```tsx
// ✅ Bom - usa Grid responsivo
<Grid cols={{ default: 1, md: 2, lg: 3 }} gap={6}>
  <Card>...</Card>
</Grid>

// ❌ Ruim - layout fixo
<div className="grid grid-cols-3 gap-6">
  <Card>...</Card>
</div>
```

### 5. **Dark Mode**

Sempre use variáveis CSS ao invés de cores hardcoded:

```tsx
// ✅ Bom - usa variáveis CSS
<div className="bg-background text-foreground border-border">

// ❌ Ruim - cores hardcoded
<div className="bg-white text-black border-gray-300">
```

---

## 📐 Breakpoints

| Breakpoint | Tamanho | Uso |
|-----------|---------|-----|
| `sm` | 640px | Mobile landscape, tablet portrait |
| `md` | 768px | Tablet landscape |
| `lg` | 1024px | Desktop small |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Desktop large |

---

## 🎭 Animações

Use as variáveis de duração para animações consistentes:

```css
--duration-fast: 150ms;    /* Hover, micro-interactions */
--duration-normal: 250ms;  /* Transitions padrão */
--duration-slow: 350ms;    /* Animações mais complexas */
```

```tsx
<button className="transition-colors duration-[var(--duration-normal)]">
  Hover me
</button>
```

---

## 🔗 Recursos

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Components](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)
- [shadcn/ui](https://ui.shadcn.com/)

---

## 📝 Exemplo Completo

```tsx
import { PageLayout, PageHeader, PageContent, Section } from '@/components/layout/page-layout';
import { Grid } from '@/components/layout/grid';
import { Card } from '@/components/ui/card';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Plus, Calendar } from 'lucide-react';

export default function TasksPage() {
  const tasks = [...]; // seus dados

  return (
    <PageLayout maxWidth="xl">
      <PageHeader
        title="Minhas Tarefas"
        description="Gerencie suas tasks e acompanhe seu progresso"
        action={
          <Button onClick={() => router.push('/tasks/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Task
          </Button>
        }
      />

      <PageContent>
        <Section title="Tarefas Urgentes">
          {tasks.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Nenhuma tarefa urgente"
              description="Você está em dia!"
            />
          ) : (
            <Grid cols={{ default: 1, md: 2, lg: 3 }} gap={6}>
              {tasks.map((task) => (
                <Card key={task.id} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold">{task.title}</h3>
                    <PriorityBadge priority={task.priority} />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {task.description}
                  </p>
                  <StatusBadge status={task.status} />
                </Card>
              ))}
            </Grid>
          )}
        </Section>
      </PageContent>
    </PageLayout>
  );
}
```

---

**Última atualização:** 2025-01-11
**Versão:** 1.0.0
