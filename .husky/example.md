# 🐕 Exemplo de Uso dos Hooks Husky

## 📋 Fluxo Completo de Desenvolvimento

### 1. Fazer Alterações
```bash
# Editar arquivos
vim src/services/calendar/CalendarService.ts

# Adicionar ao staging
git add .
```

### 2. Commit (executa pre-commit)
```bash
# Commit com mensagem válida
git commit -m "feat: adicionar validação de horário de trabalho"

# ✅ Resultado esperado:
# 🔍 Executando lint antes do commit...
# ✅ Lint passou! Prosseguindo com o commit...
# 📝 Validando mensagem de commit...
# ✅ Mensagem de commit válida!
# [main abc1234] feat: adicionar validação de horário de trabalho
```

### 3. Push (executa pre-push)
```bash
# Push para repositório remoto
git push origin main

# ✅ Resultado esperado:
# 🧪 Executando testes antes do push...
# PASS src/services/calendar/__tests__/CalendarService.test.ts
# ✅ Todos os testes passaram! Prosseguindo com o push...
# Enumerating objects: 5, done.
# Counting objects: 100% (5/5), done.
```

## ❌ Cenários de Falha

### Lint Falha
```bash
git commit -m "feat: adicionar funcionalidade"

# ❌ Resultado:
# 🔍 Executando lint antes do commit...
# error: 'variable' is assigned a value but never used
# ❌ Lint falhou! Commit cancelado.
# 💡 Execute 'npm run lint' localmente para ver os erros.
```

### Testes Falham
```bash
git push origin main

# ❌ Resultado:
# 🧪 Executando testes antes do push...
# FAIL src/services/calendar/__tests__/CalendarService.test.ts
# ❌ Testes falharam! Push cancelado.
# 💡 Execute 'npm test' localmente para ver os erros.
```

### Mensagem de Commit Inválida
```bash
git commit -m "fix"

# ❌ Resultado:
# 📝 Validando mensagem de commit...
# ❌ Mensagem de commit deve ter pelo menos 10 caracteres!
# 💡 Exemplo: 'feat: adicionar módulo calendar'
```

## 🛠️ Comandos de Debug

### Executar Hooks Manualmente
```bash
# Testar pre-commit
./.husky/pre-commit

# Testar pre-push
./.husky/pre-push

# Testar commit-msg
./.husky/commit-msg "feat: exemplo de mensagem"
```

### Pular Hooks (emergência)
```bash
# Pular pre-commit
git commit --no-verify -m "hotfix: correção urgente"

# Pular pre-push
git push --no-verify
```

### Verificar Configuração
```bash
# Ver hooks configurados
ls -la .husky/

# Verificar configuração do Git
git config --get core.hooksPath

# Deve retornar: .husky
```

## 📊 Benefícios Observados

### ✅ Qualidade de Código
- Código sempre lintado
- Padrões consistentes
- Menos bugs em produção

### ✅ Confiabilidade
- Testes sempre passando
- Sem regressões
- Deploy seguro

### ✅ Colaboração
- Padrões uniformes
- Mensagens descritivas
- Fluxo previsível

## 🔧 Personalização

### Adicionar Novo Hook
```bash
# Criar hook para build
npx husky add .husky/pre-merge "npm run build"

# Tornar executável
chmod +x .husky/pre-merge
```

### Modificar Hook Existente
```bash
# Editar pre-push
nano .husky/pre-push

# Adicionar mais verificações
echo "npm run type-check" >> .husky/pre-push
```

### Desabilitar Hook Temporariamente
```bash
# Renomear para desabilitar
mv .husky/pre-push .husky/pre-push.disabled

# Restaurar depois
mv .husky/pre-push.disabled .husky/pre-push
```

## 📈 Métricas de Sucesso

### Antes do Husky
- ❌ Commits com código não-lintado
- ❌ Pushes com testes falhando
- ❌ Mensagens de commit inconsistentes
- ❌ Bugs em produção

### Depois do Husky
- ✅ 100% dos commits lintados
- ✅ 100% dos pushes testados
- ✅ Mensagens padronizadas
- ✅ Zero bugs relacionados a qualidade

---

**Desenvolvido para OverLearn** - Sistema de produtividade e aprendizado
