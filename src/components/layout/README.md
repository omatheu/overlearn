# Layout Components

Componentes de layout reutilizáveis para padronizar a estrutura das páginas.

## Quick Start

```tsx
import { PageLayout, PageHeader, PageContent, Section } from '@/components/layout';
import { Grid, Stack } from '@/components/layout';
```

## PageLayout

Wrapper principal para todas as páginas da aplicação.

### Props

| Prop | Type | Default | Descrição |
|------|------|---------|-----------|
| `children` | `ReactNode` | - | Conteúdo da página |
| `maxWidth` | `"sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "full"` | `"xl"` | Largura máxima do container |
| `padding` | `boolean` | `true` | Adiciona padding padrão |
| `className` | `string` | - | Classes CSS adicionais |

### Exemplo

```tsx
export default function MyPage() {
  return (
    <PageLayout maxWidth="2xl">
      {/* Conteúdo */}
    </PageLayout>
  );
}
```

## PageHeader

Cabeçalho padrão com título, descrição e ação opcional.

### Props

| Prop | Type | Default | Descrição |
|------|------|---------|-----------|
| `title` | `string` | - | Título principal da página |
| `description` | `string` | - | Descrição opcional |
| `action` | `ReactNode` | - | Botão ou ação (ex: "Nova Task") |
| `badge` | `ReactNode` | - | Badge ao lado do título |
| `className` | `string` | - | Classes CSS adicionais |

### Exemplo

```tsx
<PageHeader
  title="Minhas Tarefas"
  description="Gerencie suas tasks e projetos"
  badge={<Badge>23 ativas</Badge>}
  action={
    <Button onClick={() => router.push('/tasks/new')}>
      <Plus className="mr-2 h-4 w-4" />
      Nova Task
    </Button>
  }
/>
```

## PageContent

Container para o conteúdo principal com espaçamento padrão.

### Exemplo

```tsx
<PageContent>
  <Section title="Seção 1">...</Section>
  <Section title="Seção 2">...</Section>
</PageContent>
```

## Section

Seção de conteúdo com título, descrição e ação opcional.

### Props

| Prop | Type | Default | Descrição |
|------|------|---------|-----------|
| `children` | `ReactNode` | - | Conteúdo da seção |
| `title` | `string` | - | Título da seção |
| `description` | `string` | - | Descrição opcional |
| `action` | `ReactNode` | - | Ação ou botão |
| `className` | `string` | - | Classes CSS adicionais |

### Exemplo

```tsx
<Section
  title="Tarefas Recentes"
  description="Últimas 5 tarefas atualizadas"
  action={
    <Button variant="outline" size="sm">
      Ver Todas
    </Button>
  }
>
  <Grid cols={{ default: 1, md: 2 }} gap={4}>
    {/* Cards */}
  </Grid>
</Section>
```

## Grid

Sistema de grid responsivo com breakpoints.

### Props

| Prop | Type | Default | Descrição |
|------|------|---------|-----------|
| `children` | `ReactNode` | - | Elementos do grid |
| `cols` | `object` | `{ default: 1 }` | Número de colunas por breakpoint |
| `gap` | `number` | `6` | Espaçamento entre itens (2, 3, 4, 6, 8, 10, 12) |
| `className` | `string` | - | Classes CSS adicionais |

### Exemplo

```tsx
<Grid
  cols={{
    default: 1,  // Mobile: 1 coluna
    md: 2,       // Tablet: 2 colunas
    lg: 3,       // Desktop: 3 colunas
    xl: 4        // Desktop large: 4 colunas
  }}
  gap={6}
>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</Grid>
```

## Stack

Layout flexbox para empilhar elementos vertical ou horizontalmente.

### Props

| Prop | Type | Default | Descrição |
|------|------|---------|-----------|
| `children` | `ReactNode` | - | Elementos a empilhar |
| `direction` | `"vertical" \| "horizontal"` | `"vertical"` | Direção do stack |
| `spacing` | `number` | `4` | Espaçamento entre itens (1, 2, 3, 4, 6, 8) |
| `align` | `"start" \| "center" \| "end" \| "stretch"` | `"stretch"` | Alinhamento dos itens |
| `justify` | `"start" \| "center" \| "end" \| "between" \| "around"` | `"start"` | Justificação dos itens |
| `className` | `string` | - | Classes CSS adicionais |

### Exemplo

```tsx
// Vertical stack
<Stack direction="vertical" spacing={4}>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
</Stack>

// Horizontal stack (botões)
<Stack direction="horizontal" spacing={2} align="center">
  <Button>Salvar</Button>
  <Button variant="outline">Cancelar</Button>
</Stack>
```

## Exemplo Completo

```tsx
import {
  PageLayout,
  PageHeader,
  PageContent,
  Section,
  Grid,
  Stack
} from '@/components/layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRight } from 'lucide-react';

export default function TasksPage() {
  return (
    <PageLayout maxWidth="xl">
      {/* Header */}
      <PageHeader
        title="Minhas Tarefas"
        description="Gerencie suas tasks e acompanhe seu progresso"
        action={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Task
          </Button>
        }
      />

      {/* Content */}
      <PageContent>
        {/* Seção 1: Tasks Urgentes */}
        <Section
          title="Tarefas Urgentes"
          description="Requerem atenção imediata"
        >
          <Grid cols={{ default: 1, md: 2, lg: 3 }} gap={6}>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Task 1</h3>
              <p className="text-sm text-muted-foreground">Descrição</p>
            </Card>
            {/* Mais cards */}
          </Grid>
        </Section>

        {/* Seção 2: Estatísticas */}
        <Section
          title="Estatísticas da Semana"
          action={
            <Button variant="ghost" size="sm">
              Ver Detalhes
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          }
        >
          <Grid cols={{ default: 2, md: 4 }} gap={4}>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold">23</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </Card>
            {/* Mais stats */}
          </Grid>
        </Section>
      </PageContent>
    </PageLayout>
  );
}
```

## Padrões de Uso

### Dashboard/Overview

```tsx
<PageLayout maxWidth="2xl">
  <PageHeader title="Overview" />
  <PageContent>
    <Grid cols={{ default: 1, lg: 2 }} gap={8}>
      <Section title="Estatísticas">...</Section>
      <Section title="Atividade Recente">...</Section>
    </Grid>
  </PageContent>
</PageLayout>
```

### Página de Listagem

```tsx
<PageLayout maxWidth="xl">
  <PageHeader
    title="Todas as Tasks"
    action={<Button>Nova Task</Button>}
  />
  <PageContent>
    <Section>
      <Grid cols={{ default: 1, md: 2, lg: 3 }} gap={6}>
        {/* Cards de tasks */}
      </Grid>
    </Section>
  </PageContent>
</PageLayout>
```

### Página de Detalhes

```tsx
<PageLayout maxWidth="lg">
  <PageHeader
    title={task.title}
    description={task.description}
    action={<Button variant="outline">Editar</Button>}
  />
  <PageContent>
    <Stack direction="vertical" spacing={6}>
      {/* Conteúdo detalhado */}
    </Stack>
  </PageContent>
</PageLayout>
```

## Tips & Best Practices

1. **Sempre use PageLayout** em todas as páginas para consistência
2. **PageHeader é obrigatório** - toda página deve ter título claro
3. **Prefira Grid ao invés de CSS Grid manual** para responsividade automática
4. **Use Section para organizar** conteúdo em blocos lógicos
5. **maxWidth="xl"** é o padrão recomendado para a maioria das páginas
6. **maxWidth="2xl"** para dashboards e páginas com muito conteúdo horizontal
7. **maxWidth="lg"** para formulários e páginas de detalhes
