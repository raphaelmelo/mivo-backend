# Política de Segurança

## 🔒 Práticas de Segurança

### Nunca Commitar:
- ❌ Arquivos `.env` com credenciais reais
- ❌ Senhas, tokens, API keys
- ❌ Certificados SSL privados
- ❌ Credenciais de banco de dados
- ❌ Chaves SSH privadas

### Sempre Usar:
- ✅ `.env.example` como template
- ✅ Variáveis de ambiente para secrets
- ✅ GitHub Secrets para CI/CD
- ✅ Branches de feature para desenvolvimento
- ✅ Pull Requests para merge na main

## 🛡️ Proteções Implementadas

### Git Hooks
- **pre-commit**: Impede commits diretos na main/master
- **pre-commit**: Detecta arquivos .env
- **pre-commit**: Alerta sobre credenciais expostas
- **pre-push**: Verifica node_modules e .env

### .gitignore
Configurado para ignorar:
- Arquivos de ambiente (.env*)
- Dependencies (node_modules)
- Build outputs
- Credenciais e secrets

## 📢 Reportar Vulnerabilidades

Se encontrar uma vulnerabilidade de segurança, **não abra uma issue pública**.
Entre em contato diretamente com a equipe.
