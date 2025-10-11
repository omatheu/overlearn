# 🐕 Husky Hooks - OverLearn

Este diretório contém os hooks do Git configurados com Husky para garantir qualidade de código.

## 📋 Hooks Configurados

### 🔍 `pre-commit`
- **Quando**: Antes de cada commit
- **O que faz**: Executa linting (`npm run lint`)
- **Objetivo**: Garantir que o código segue os padrões de estilo

### 🧪 `pre-push`
- **Quando**: Antes de cada push
- **O que faz**: Executa todos os testes (`npm test`)
- **Objetivo**: Garantir que não há regressões antes de enviar código

### 📝 `commit-msg`
- **Quando**: Durante o commit
- **O que faz**: Valida a mensagem de commit
- **Objetivo**: Garantir mensagens descritivas e consistentes

## 🚀 Como Funciona

### Fluxo Automático
1. **Você faz alterações** no código
2. **`git add .`** - adiciona arquivos ao staging
3. **`git commit -m "sua mensagem"`** - executa `pre-commit` e `commit-msg`
4. **`git push`** - executa `pre-push`

### Se Algo Falhar
- **Lint falha**: Commit é cancelado
- **Testes falham**: Push é cancelado
- **Mensagem inválida**: Commit é cancelado

## 🛠️ Comandos Úteis

### Pular hooks (use com cuidado!)
```bash
# Pular pre-commit
git commit --no-verify -m "mensagem"

# Pular pre-push
git push --no-verify
```

### Executar hooks manualmente
```bash
# Testar pre-commit
./.husky/pre-commit

# Testar pre-push
./.husky/pre-push

# Testar commit-msg
./.husky/commit-msg "sua mensagem aqui"
```

### Verificar configuração
```bash
# Ver todos os hooks configurados
ls -la .husky/

# Verificar se o Husky está funcionando
git config --get core.hooksPath
```

## 📊 Scripts Disponíveis

### No package.json
```json
{
  "scripts": {
    "prepare": "husky",           // Instala hooks
    "pre-commit": "npm run lint", // Executa lint
    "pre-push": "npm test"        // Executa testes
  }
}
```

### Comandos NPM
```bash
npm run prepare    # Instala/configura hooks
npm run pre-commit # Executa lint manualmente
npm run pre-push   # Executa testes manualmente
```

## 🔧 Configuração Avançada

### Adicionar Novo Hook
```bash
# Criar novo hook
npx husky add .husky/nome-do-hook "comando a executar"

# Tornar executável
chmod +x .husky/nome-do-hook
```

### Modificar Hook Existente
```bash
# Editar hook
nano .husky/pre-push

# Tornar executável novamente
chmod +x .husky/pre-push
```

### Remover Hook
```bash
# Remover arquivo
rm .husky/nome-do-hook

# Ou desabilitar temporariamente
mv .husky/nome-do-hook .husky/nome-do-hook.disabled
```

## 🐛 Troubleshooting

### Hook não executa
```bash
# Verificar permissões
ls -la .husky/

# Tornar executável
chmod +x .husky/pre-push

# Verificar configuração do Git
git config --get core.hooksPath
```

### Hook falha inesperadamente
```bash
# Executar manualmente para debug
./.husky/pre-push

# Ver logs detalhados
npm test -- --verbose
```

### Desabilitar temporariamente
```bash
# Renomear para desabilitar
mv .husky/pre-push .husky/pre-push.disabled

# Restaurar depois
mv .husky/pre-push.disabled .husky/pre-push
```

## 📈 Benefícios

- ✅ **Qualidade**: Código sempre lintado
- ✅ **Confiabilidade**: Testes sempre passando
- ✅ **Consistência**: Mensagens de commit padronizadas
- ✅ **Automação**: Sem necessidade de lembrar de executar comandos
- ✅ **Colaboração**: Padrões consistentes para toda a equipe

## 🔗 Links Úteis

- [Husky Documentation](https://typicode.github.io/husky/)
- [Git Hooks Documentation](https://git-scm.com/docs/githooks)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Desenvolvido para OverLearn** - Sistema de produtividade e aprendizado
