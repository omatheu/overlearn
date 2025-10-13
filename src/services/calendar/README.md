# 📅 Módulo Calendar - OverLearn

O módulo Calendar é um serviço centralizado para gerenciamento de tempo, sessões de foco e eventos agendados no OverLearn.

## 🚀 Funcionalidades

- ✅ **Horário de trabalho configurável** (início/fim do expediente)
- ✅ **Tracking de tempo** (pomodoro, sessões de estudo/foco)
- ✅ **Eventos agendados** (lembretes, revisões de flashcards)
- ✅ **Detecção de contexto** (está no horário de trabalho? quanto tempo focado hoje?)
- ✅ **Histórico temporal** (estatísticas de uso, progresso diário/semanal)
- ✅ **Notificações baseadas em tempo** (pausas, lembretes proativos)

## 📁 Estrutura

```
src/services/calendar/
├── index.ts                 # Exports principais
├── CalendarService.ts       # Core do serviço
├── types.ts                 # Tipos TypeScript
├── utils.ts                 # Funções auxiliares
├── atoms.ts                 # Atoms Jotai para state management
├── hooks/                   # Hooks customizados
│   ├── useCalendar.ts
│   ├── useWorkingHours.ts
│   ├── useTimerTracking.ts
│   └── useScheduledEvents.ts
└── __tests__/              # Testes
    └── CalendarService.test.ts
```

## 🎯 Uso Básico

### 1. Hook Principal - useCalendar

```tsx
import { useCalendar } from '@/services/calendar';

function MyComponent() {
  const {
    isWorkingNow,
    currentSession,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    getDailyOverview
  } = useCalendar();

  const handleStartWork = () => {
    startSession('work');
  };

  return (
    <div>
      {isWorkingNow && <Badge>Horário de trabalho ativo</Badge>}
      {currentSession ? (
        <div>
          <p>Sessão ativa: {currentSession.type}</p>
          <button onClick={endSession}>Finalizar</button>
        </div>
      ) : (
        <button onClick={handleStartWork}>Iniciar Trabalho</button>
      )}
    </div>
  );
}
```

### 2. Hook de Horário de Trabalho

```tsx
import { useWorkingHours } from '@/services/calendar';

function WorkingHoursConfig() {
  const {
    workingHours,
    setWorkingHours,
    isWithinWorkingHours,
    getWorkingTimeRemaining
  } = useWorkingHours();

  const updateHours = () => {
    setWorkingHours({
      start: '08:00',
      end: '17:00',
      timezone: 'America/Sao_Paulo',
      workDays: [1, 2, 3, 4, 5]
    });
  };

  return (
    <div>
      <p>Horário atual: {workingHours.start} - {workingHours.end}</p>
      <p>Dentro do horário: {isWithinWorkingHours() ? 'Sim' : 'Não'}</p>
      <p>Tempo restante: {getWorkingTimeRemaining()} minutos</p>
    </div>
  );
}
```

### 3. Hook de Eventos Agendados

```tsx
import { useScheduledEvents } from '@/services/calendar';

function EventManager() {
  const {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    getUpcomingEvents,
    markEventCompleted
  } = useScheduledEvents();

  const addNewEvent = () => {
    addEvent({
      title: 'Revisar flashcards',
      type: 'flashcard',
      scheduledTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
      metadata: { priority: 'high' }
    });
  };

  return (
    <div>
      <button onClick={addNewEvent}>Adicionar Evento</button>
      {getUpcomingEvents(5).map(event => (
        <div key={event.id}>
          <p>{event.title}</p>
          <p>{event.scheduledTime.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
```

## 🔧 CalendarService - Métodos Principais

### Verificações de Horário

```typescript
import { CalendarService } from '@/services/calendar';

// Verificar se está no horário de trabalho
const isWorking = CalendarService.isWithinWorkingHours(workingHours);

// Calcular tempo restante
const remaining = CalendarService.getWorkingTimeRemaining(workingHours);

// Próximo dia de trabalho
const nextDay = CalendarService.getNextWorkingDay(workingHours);
```

### Gerenciamento de Eventos

```typescript
// Tempo até próximo evento
const timeUntil = CalendarService.getTimeUntilNextEvent(events);

// Eventos para uma data específica
const todayEvents = CalendarService.getEventsForDate(events, new Date());

// Eventos próximos (próximas 2 horas)
const upcoming = CalendarService.getUpcomingEvents(events, 120);
```

### Estatísticas e Métricas

```typescript
// Overview diário
const overview = CalendarService.generateDailyOverview(
  new Date(),
  events,
  sessions
);

// Métricas de foco
const metrics = CalendarService.calculateFocusMetrics(sessions);

// Estatísticas semanais
const weeklyStats = CalendarService.calculateWeeklyStats(sessions);

// Padrões de produtividade
const patterns = CalendarService.detectProductivityPatterns(sessions);
```

## 🎨 Integração com UI

### Exemplo de Integração com Overview Diário

```tsx
// components/overview/calendar-integration.tsx
import { useCalendar, useWorkingHours, useScheduledEvents } from '@/services/calendar';

export function CalendarIntegration() {
  const { isWorkingNow, currentSession, startSession, endSession } = useCalendar();
  const { workingHours, getWorkingTimeRemaining } = useWorkingHours();
  const { getUpcomingEvents } = useScheduledEvents();

  return (
    <div className="space-y-4">
      {/* Status do horário */}
      <Card>
        <Badge variant={isWorkingNow ? 'default' : 'secondary'}>
          {isWorkingNow ? 'Horário de Trabalho Ativo' : 'Fora do Horário'}
        </Badge>
      </Card>

      {/* Controles de sessão */}
      {currentSession ? (
        <div>
          <p>Sessão ativa: {currentSession.type}</p>
          <button onClick={endSession}>Finalizar</button>
        </div>
      ) : (
        <div>
          <button onClick={() => startSession('work')}>Iniciar Trabalho</button>
          <button onClick={() => startSession('study')}>Iniciar Estudo</button>
        </div>
      )}

      {/* Eventos próximos */}
      {getUpcomingEvents(3).map(event => (
        <div key={event.id}>
          <p>{event.title}</p>
          <p>{event.scheduledTime.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
```

## 📊 Tipos Principais

### WorkingHours
```typescript
interface WorkingHours {
  start: string;        // "09:00"
  end: string;          // "18:00"
  timezone: string;    // "America/Sao_Paulo"
  workDays: number[];  // [1,2,3,4,5] = Segunda a Sexta
}
```

### FocusSession
```typescript
interface FocusSession {
  id: string;
  taskId?: string;
  startTime: Date;
  endTime?: Date;
  duration: number;     // minutos
  type: 'pomodoro' | 'study' | 'work';
  interrupted: boolean;
  metadata?: Record<string, any>;
}
```

### ScheduledEvent
```typescript
interface ScheduledEvent {
  id: string;
  title: string;
  type: 'flashcard' | 'break' | 'reminder' | 'custom';
  scheduledTime: Date;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    interval: number;
    endDate?: Date;
  };
  metadata?: Record<string, any>;
  completed?: boolean;
}
```

## 🧪 Testes

Execute os testes do módulo:

```bash
npm test src/services/calendar
```

## 🔄 State Management com Jotai

O módulo usa Jotai para gerenciamento de estado global:

- **Atoms de configuração**: `workingHoursAtom`, `calendarConfigAtom`
- **Atoms de estado**: `currentSessionAtom`, `isTrackingAtom`
- **Atoms de dados**: `scheduledEventsAtom`, `dailyStatsAtom`
- **Atoms derivados**: `isWorkingNowAtom`, `upcomingEventsAtom`

## 🚀 Próximos Passos

1. **Integrar com sistema de tasks** - conectar sessões com tarefas específicas
2. **Integrar com sistema de flashcards** - agendar revisões automáticas
3. **Adicionar notificações** - implementar lembretes proativos
4. **Preparar para Electron** - notificações nativas
5. **Analytics avançados** - métricas de produtividade detalhadas

## 📝 Notas de Desenvolvimento

- O módulo é totalmente tipado com TypeScript
- Usa `atomWithStorage` para persistência automática
- Hooks são otimizados com `useCallback` e `useMemo`
- Testes cobrem funcionalidades críticas de horário
- Arquitetura modular permite fácil extensão

---

**Desenvolvido para OverLearn** - Sistema de produtividade e aprendizado
