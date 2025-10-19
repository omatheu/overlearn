Ótima pergunta! Vou explicar a lógica completa do sistema de flashcards, desde o conceito até a implementação. 🧠

---

## 🎯 **Conceito Geral: O que é um Sistema de Flashcards?**

É uma ferramenta de **aprendizado ativo** baseada em:
1. **Perguntas e Respostas**: Você vê uma pergunta, tenta responder, depois vê a resposta real
2. **Repetição Espaçada**: Você revisa os cards em intervalos crescentes (1 dia, 6 dias, 15 dias, 1 mês...)
3. **Auto-avaliação**: Você mesmo diz "acertei fácil" ou "errei feio", e o sistema ajusta a próxima revisão

**Exemplo prático:**
```
Dia 1:  Você cria o flashcard "O que é SSR?"
Dia 2:  Sistema avisa: "Revise esse card!"
        Você acerta → Próxima revisão em 6 dias
Dia 8:  Sistema avisa novamente
        Você acerta de novo → Próxima revisão em 15 dias
Dia 23: Revisão de novo (intervalo aumenta)
```

---

## 🧠 **Algoritmo SM-2 (SuperMemo 2)**

É o coração do sistema. Ele decide **quando** você vai revisar cada card novamente.

### **Funcionamento:**

Cada flashcard tem 3 valores que evoluem:

1. **`easeFactor`** (Fator de Facilidade)
   - Começa em `2.5`
   - Aumenta se você acerta fácil
   - Diminui se você erra
   - Nunca fica abaixo de `1.3`

2. **`interval`** (Intervalo em dias)
   - Começa em `0`
   - 1ª revisão: 1 dia
   - 2ª revisão: 6 dias
   - 3ª+ revisão: `interval * easeFactor`

3. **`repetitions`** (Quantas vezes você acertou seguidas)
   - Começa em `0`
   - Aumenta a cada acerto
   - Reseta para `0` se você errar

---

## 📐 **Fórmula do SM-2:**

### **Entrada:**
- `quality`: nota que você dá (0-5)
  - 0-2 = Errou/Difícil → Reseta o card
  - 3 = Acertou com dificuldade
  - 4 = Acertou bem
  - 5 = Acertou fácil

### **Cálculo do novo `easeFactor`:**
```javascript
newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

// Exemplos:
// quality=5 → easeFactor aumenta (+0.1)
// quality=4 → easeFactor aumenta levemente (+0.0)
// quality=3 → easeFactor diminui (-0.14)
// quality=2 → easeFactor diminui muito (-0.32)
```

### **Cálculo do novo `interval`:**
```javascript
if (quality < 3) {
  // Errou → Reseta tudo
  interval = 1
  repetitions = 0
} else {
  // Acertou
  if (repetitions === 0) {
    interval = 1  // Primeira vez: 1 dia
  } else if (repetitions === 1) {
    interval = 6  // Segunda vez: 6 dias
  } else {
    interval = Math.round(interval * easeFactor)  // Multiplica pelo fator
  }
  repetitions += 1
}
```

### **Próxima data de revisão:**
```javascript
nextReview = hoje + interval dias
```

---

## 🗂️ **Estrutura de Dados (Banco)**

### **Tabela `Flashcard`:**
```prisma
model Flashcard {
  id          String   @id
  question    String   // "O que é SSR?"
  answer      String   // "Server-Side Rendering..."
  
  // Campos do SM-2:
  easeFactor  Float?   @default(2.5)
  interval    Int?     @default(0)
  repetitions Int?     @default(0)
  
  // Datas:
  nextReview  DateTime?  // Quando revisar próxima vez
  reviewedAt  DateTime?  // Última vez que revisou
  createdAt   DateTime   @default(now())
  
  // Relacionamentos:
  taskId        String
  userProfileId String
  task          Task
  userProfile   UserProfile
  reviews       FlashcardReview[]  // Histórico
}
```

### **Tabela `FlashcardReview` (Histórico):**
```prisma
model FlashcardReview {
  id           String   @id
  flashcardId  String
  quality      Int      // 0-5
  reviewedAt   DateTime @default(now())
  
  flashcard Flashcard @relation(...)
}
```

---

## 🔄 **Fluxo Completo do Sistema**

### **1. Criação do Flashcard:**
```
Usuário cria task: "Implementar SSR"
↓
Usuário clica: "Gerar Flashcards com IA"
↓
IA cria 5 perguntas relacionadas:
  - "O que é SSR?"
  - "Diferença entre SSR e CSR?"
  - etc.
↓
Salva no banco com:
  - easeFactor = 2.5
  - interval = 0
  - repetitions = 0
  - nextReview = null (ou hoje)
```

### **2. Sistema Identifica Cards Vencidos:**
```sql
-- Query para buscar cards vencidos:
SELECT * FROM Flashcard
WHERE nextReview IS NULL 
   OR nextReview <= NOW()
ORDER BY nextReview ASC;
```

**Lógica:**
- Se `nextReview` é `null` → nunca foi revisado → vencido
- Se `nextReview <= hoje` → já passou da data → vencido

### **3. Usuário Revisa:**
```
Overview mostra: "5 flashcards pendentes"
↓
Usuário clica: "Revisar Agora"
↓
Página mostra 1º card (só a pergunta)
↓
Usuário tenta responder mentalmente
↓
Clica: "Mostrar Resposta"
↓
Vê a resposta correta
↓
Avalia: "Acertei fácil" (quality=5)
↓
Sistema calcula próxima revisão (SM-2)
↓
Salva:
  - easeFactor = 2.6 (aumentou)
  - interval = 1 (primeira revisão)
  - repetitions = 1
  - nextReview = amanhã
  - reviewedAt = agora
↓
Mostra próximo card (repete o fluxo)
```

### **4. Evolução do Card ao Longo do Tempo:**

**Exemplo real de um card:**

```
📅 Dia 1 (Criação):
  question: "O que é SSR?"
  easeFactor: 2.5
  interval: 0
  repetitions: 0
  nextReview: null
  
📅 Dia 2 (1ª Revisão - Quality 4 "Bom"):
  easeFactor: 2.5 (não mudou muito)
  interval: 1
  repetitions: 1
  nextReview: Dia 3
  
📅 Dia 3 (2ª Revisão - Quality 5 "Fácil"):
  easeFactor: 2.6 (aumentou)
  interval: 6
  repetitions: 2
  nextReview: Dia 9
  
📅 Dia 9 (3ª Revisão - Quality 4 "Bom"):
  easeFactor: 2.6
  interval: 6 * 2.6 = 15.6 → 16 dias
  repetitions: 3
  nextReview: Dia 25
  
📅 Dia 25 (4ª Revisão - Quality 3 "Difícil"):
  easeFactor: 2.46 (diminuiu um pouco)
  interval: 16 * 2.46 = 39.36 → 39 dias
  repetitions: 4
  nextReview: Dia 64
  
📅 Dia 30 (Você erra - Quality 2):
  easeFactor: 2.14 (diminuiu mais)
  interval: 1 (RESETOU!)
  repetitions: 0 (RESETOU!)
  nextReview: Dia 31
```

**Observe:**
- Quando você **acerta fácil** → intervalos crescem rápido (1 → 6 → 16 → 39)
- Quando você **erra** → volta ao começo (interval = 1)
- O `easeFactor` **acumula histórico**: se você sempre acerta, fica alto (3.0+); se erra muito, fica baixo (1.3)

---

## 🔍 **Como o Sistema Decide Quais Cards Mostrar?**

### **Na página `/flashcards/review`:**

```typescript
// Hook busca cards vencidos:
const { data: flashcards } = useQuery({
  queryKey: ['flashcards', 'due'],
  queryFn: async () => {
    const res = await fetch('/api/flashcards?filter=due');
    return res.json();
  }
});
```

### **API retorna apenas cards onde:**
```typescript
where: {
  OR: [
    { nextReview: null },        // Nunca revisado
    { nextReview: { lte: now } } // Data já passou
  ]
}
```

### **Ordem de prioridade:**
```typescript
orderBy: {
  nextReview: 'asc'  // Mais antigos primeiro
}
```

**Exemplo:**
```
Cards no banco:
  Card A: nextReview = null       → PRIORIDADE 1 (nunca visto)
  Card B: nextReview = 2 dias atrás → PRIORIDADE 2 (muito atrasado)
  Card C: nextReview = ontem      → PRIORIDADE 3 (atrasado)
  Card D: nextReview = daqui 5 dias → NÃO APARECE (ainda não venceu)
```

---

## 🎨 **Interface: Como o Usuário Interage?**

### **Fluxo de 1 revisão:**

```
┌─────────────────────────────────────┐
│  📚 PERGUNTA                        │
│                                     │
│  "O que é Server-Side Rendering?"  │
│                                     │
│  [Mostrar Resposta]                │
└─────────────────────────────────────┘
         │
         │ Clica "Mostrar Resposta"
         ▼
┌─────────────────────────────────────┐
│  💡 RESPOSTA                        │
│                                     │
│  "É quando o HTML é gerado no      │
│   servidor antes de enviar ao      │
│   browser..."                       │
│                                     │
│  Como foi sua resposta?            │
│                                     │
│  [😰 Não lembrei]  [🤔 Difícil]   │
│  [😊 Bom]          [🎯 Fácil]     │
└─────────────────────────────────────┘
         │
         │ Clica "😊 Bom" (quality=4)
         ▼
┌─────────────────────────────────────┐
│  API: POST /flashcards/123/review   │
│  Body: { quality: 4 }               │
└─────────────────────────────────────┘
         │
         │ Calcula SM-2
         ▼
┌─────────────────────────────────────┐
│  Banco atualiza:                    │
│  - easeFactor: 2.5                  │
│  - interval: 1                      │
│  - repetitions: 1                   │
│  - nextReview: amanhã               │
│  - reviewedAt: agora                │
└─────────────────────────────────────┘
         │
         │ Próximo card
         ▼
┌─────────────────────────────────────┐
│  📚 PRÓXIMA PERGUNTA                │
│  "Diferença entre SSR e CSR?"      │
│  ...                                │
└─────────────────────────────────────┘
```

---

## 🧮 **Exemplo Numérico Completo:**

### **Card: "O que é useEffect?"**

**Estado Inicial:**
```javascript
{
  question: "O que é useEffect?",
  answer: "Hook do React para efeitos colaterais...",
  easeFactor: 2.5,
  interval: 0,
  repetitions: 0,
  nextReview: null
}
```

**1ª Revisão (Dia 1) - Quality 4:**
```javascript
// Cálculo:
newEaseFactor = 2.5 + (0.1 - (5-4) * (0.08 + (5-4) * 0.02))
              = 2.5 + (0.1 - 1 * 0.10)
              = 2.5 + 0.0
              = 2.5

newInterval = 1 (primeira repetição)
newRepetitions = 1
nextReview = hoje + 1 dia = Dia 2

// Estado atualizado:
{
  easeFactor: 2.5,
  interval: 1,
  repetitions: 1,
  nextReview: Dia 2
}
```

**2ª Revisão (Dia 2) - Quality 5:**
```javascript
// Cálculo:
newEaseFactor = 2.5 + (0.1 - (5-5) * ...)
              = 2.5 + 0.1
              = 2.6

newInterval = 6 (segunda repetição)
newRepetitions = 2
nextReview = Dia 2 + 6 dias = Dia 8

// Estado:
{
  easeFactor: 2.6,
  interval: 6,
  repetitions: 2,
  nextReview: Dia 8
}
```

**3ª Revisão (Dia 8) - Quality 4:**
```javascript
newEaseFactor = 2.6 + 0.0 = 2.6
newInterval = round(6 * 2.6) = 16 dias
newRepetitions = 3
nextReview = Dia 8 + 16 = Dia 24

// Estado:
{
  easeFactor: 2.6,
  interval: 16,
  repetitions: 3,
  nextReview: Dia 24
}
```

**4ª Revisão (Dia 24) - Quality 2 (ERROU!):**
```javascript
// quality < 3 → RESET!
newEaseFactor = 2.6 + (0.1 - (5-2) * (0.08 + (5-2) * 0.02))
              = 2.6 + (0.1 - 3 * 0.14)
              = 2.6 - 0.32
              = 2.28

newInterval = 1 (RESET!)
newRepetitions = 0 (RESET!)
nextReview = Dia 25

// Estado:
{
  easeFactor: 2.28, // Ficou mais baixo
  interval: 1,      // Voltou ao início
  repetitions: 0,   // Recomeçou
  nextReview: Dia 25
}
```

**Moral da história:**
- Acertou 3x seguidas → intervalo chegou a 16 dias
- Errou 1x → voltou para 1 dia
- Mas o `easeFactor` ficou baixo (2.28), então nos próximos ciclos vai crescer mais devagar

---

## 🎯 **Por Que Esse Sistema Funciona?**

1. **Otimiza o tempo**: você não revisa coisas que já sabe bem
2. **Foca no que é difícil**: cards que você erra aparecem mais vezes
3. **Memória de longo prazo**: revisões espaçadas fixam melhor do que revisar tudo todo dia
4. **Auto-adaptável**: o sistema aprende seu ritmo (via `easeFactor`)

---

## 📊 **Estatísticas que Você Pode Extrair:**

```typescript
// Quantos cards você sabe bem?
SELECT COUNT(*) FROM Flashcard 
WHERE repetitions >= 3 
  AND easeFactor >= 2.5;

// Quantos você precisa revisar hoje?
SELECT COUNT(*) FROM Flashcard
WHERE nextReview <= NOW();

// Taxa de retenção:
SELECT 
  AVG(CASE WHEN quality >= 3 THEN 1 ELSE 0 END) as retention_rate
FROM FlashcardReview
WHERE reviewedAt >= datetime('now', '-7 days');
```

---

## 🔮 **Integrações Futuras:**

- **Com Tasks**: flashcards vinculados a tasks te lembram dos conceitos
- **Com IA**: gerar perguntas automaticamente
- **Com Calendar**: agendar sessões de revisão
- **Com Pomodoro**: revisar cards durante breaks

---