# 🔐 Guia de Segurança - MIVO Backend

## Proteções Implementadas

### 1. Git Hooks Automáticos
Os hooks a seguir estão configurados localmente:

#### Pre-commit
- ❌ Bloqueia commits diretos em `main` ou `master`
- ❌ Impede commit de arquivos `.env`
- ⚠️ Alerta sobre credenciais expostas no código
- ✅ Requer estar em uma branch válida

#### Pre-push
- ❌ Impede push de `node_modules`
- ❌ Impede push de arquivos `.env`

### 2. .gitignore Reforçado
Ignora automaticamente:
- Todos os arquivos `.env*`
- `node_modules/`
- Certificados e chaves (`.pem`, `.key`, `.cert`)
- Backups (`.bak`, `.backup`)
- Arquivos de IDE

### 3. Workflow Recomendado

#### Para desenvolver uma nova feature:
```bash
# 1. Criar branch de feature
git checkout -b feature/nome-da-feature

# 2. Fazer alterações e commitar
git add .
git commit -m "feat: descrição"

# 3. Push da branch
git push origin feature/nome-da-feature

# 4. Abrir Pull Request no GitHub
# NÃO fazer merge direto na main!
```

#### Configurar ambiente local:
```bash
# 1. Copiar template
cp .env.example .env

# 2. Editar com suas credenciais locais
nano .env

# 3. NUNCA commitar o .env!
```

## ⚠️ O Que NUNCA Fazer

1. ❌ Commitar diretamente na `main`
2. ❌ Fazer push de arquivos `.env`
3. ❌ Incluir senhas ou tokens no código
4. ❌ Desabilitar git hooks
5. ❌ Usar `--force` sem necessidade

## ✅ Boas Práticas

1. ✅ Sempre trabalhar em branches de feature
2. ✅ Usar `.env.example` para documentar variáveis
3. ✅ Revisar código antes de commitar
4. ✅ Fazer pull requests para mudanças importantes
5. ✅ Manter credenciais em variáveis de ambiente

## 🆘 Se Você Commitou Credenciais

Se acidentalmente commitou credenciais:

```bash
# 1. IMEDIATAMENTE trocar as credenciais expostas
# 2. Remover do histórico (cuidado!)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# 3. Force push (só se necessário e coordenado com a equipe)
git push origin --force --all
```

## 📞 Suporte

Dúvidas sobre segurança? Contate a equipe de desenvolvimento.
