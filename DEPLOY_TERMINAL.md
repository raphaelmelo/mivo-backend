# 🚀 Deploy MIVO Backend - Comandos Executados

## ✅ Passos Completados via Terminal

### 1. Inicialização do Repositório Git
```bash
cd /Users/raphaelmelogois/mivo
git init
git branch -m main
```

### 2. Criação do .gitignore
```bash
# Criado .gitignore com:
# - node_modules/
# - .env files
# - build outputs
# - OS files (.DS_Store)
```

### 3. Commit Inicial
```bash
git add .
git commit -m "feat: initial commit - MIVO backend with Render deployment config"
# ✅ 24 files changed, 3712 insertions(+)
```

### 4. Criação do Repositório GitHub
```bash
gh repo create mivo-backend --public --source=. --remote=origin --push
# ✅ Created repository raphaelmelo/mivo-backend
# ✅ Pushed to https://github.com/raphaelmelo/mivo-backend
```

---

## 🎯 Próximo Passo: Deploy no Render (Manual via Dashboard)

### Repositório Criado
**URL:** https://github.com/raphaelmelo/mivo-backend

**Arquivos incluídos:**
- ✅ `render.yaml` - Configuração de infraestrutura
- ✅ `DEPLOY_BACKEND.md` - Documentação completa
- ✅ Todo código do backend (src/, package.json, etc.)

---

## 📋 Instruções para Deploy Manual

### Passo 1: Criar PostgreSQL Database

1. Acesse: https://dashboard.render.com
2. Faça login (se necessário)
3. Clique em **"New +"** → **"PostgreSQL"**
4. Configure:
   - **Name:** `mivo-db`
   - **Database:** `mivo_production`
   - **User:** `mivo_user`
   - **Region:** Oregon (US West)
   - **Plan:** Free
5. Clique em **"Create Database"**
6. **IMPORTANTE:** Após criação, vá em **"Info"** e copie o **"Internal Database URL"**
   - Formato: `postgresql://user:pass@host:5432/db`
   - **Guarde essa URL!**

---

### Passo 2: Criar Web Service

1. No dashboard, clique em **"New +"** → **"Web Service"**
2. Clique em **"Connect a repository"**
3. Selecione: **`raphaelmelo/mivo-backend`**
4. Configure:

| Campo | Valor |
|-------|-------|
| **Name** | `mivo-backend` |
| **Region** | Oregon (US West) |
| **Branch** | `main` |
| **Root Directory** | `mivo-backend` ⚠️ **CRÍTICO!** |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | Free |

5. Clique em **"Advanced"** para adicionar variáveis de ambiente

---

### Passo 3: Configurar Variáveis de Ambiente

Clique em **"Add Environment Variable"** e adicione:

| Key | Value | Observação |
|-----|-------|------------|
| `NODE_ENV` | `production` | |
| `PORT` | `3002` | |
| `DATABASE_URL` | `postgresql://...` | Cole a URL do Passo 1 |
| `JWT_SECRET` | (gerar) | Clique em "Generate" ou use comando abaixo |
| `JWT_EXPIRES_IN` | `7d` | |
| `FRONTEND_URL` | `http://localhost:5173` | Atualizar depois |
| `ALLOWED_ORIGINS` | `http://localhost:5173,https://mivo-app.vercel.app` | |

**Para gerar JWT_SECRET localmente:**
```bash
openssl rand -base64 32
```

---

### Passo 4: Criar Service

1. Clique em **"Create Web Service"**
2. Aguarde o deploy (~3-5 minutos)
3. Acompanhe os logs na tela

---

### Passo 5: Obter URL do Backend

Após deploy bem-sucedido:
1. No topo da página, você verá a URL
2. Será algo como: `https://mivo-backend.onrender.com`
3. **Anote essa URL!**

---

### Passo 6: Sincronizar Database (via CLI)

```bash
# SSH no serviço
render ssh mivo-backend

# Dentro do shell remoto
npm run db:sync

# Sair
exit
```

**Ou via psql:**
```bash
# Conectar ao banco
render psql mivo-db

# Verificar conexão
\dt

# Sair
\q
```

---

### Passo 7: Testar Health Check

```bash
curl https://mivo-backend.onrender.com/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "message": "MIVO Backend API is running",
  "timestamp": "2025-11-18T19:00:00.000Z",
  "environment": "production"
}
```

---

## 🔍 Verificar Deploy via CLI

Após criar o serviço no dashboard, você pode gerenciá-lo via CLI:

```bash
# Listar serviços
render services list

# Ver logs em tempo real
render logs mivo-backend --tail --follow

# Ver status
render services list -o json | grep mivo-backend

# SSH no serviço
render ssh mivo-backend

# Conectar ao PostgreSQL
render psql mivo-db
```

---

## ✅ Checklist

- [x] Repositório Git inicializado
- [x] Código commitado
- [x] Repositório GitHub criado: `raphaelmelo/mivo-backend`
- [x] Código enviado para GitHub
- [x] `render.yaml` incluído no repositório
- [ ] PostgreSQL database criado no Render
- [ ] Web service criado no Render
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy bem-sucedido
- [ ] Database sincronizado
- [ ] Health check testado
- [ ] URL do backend anotada

---

## 📝 Resumo

**Repositório GitHub:** https://github.com/raphaelmelo/mivo-backend

**Próximo passo:** Acesse https://dashboard.render.com e siga os passos acima para criar:
1. PostgreSQL database (`mivo-db`)
2. Web service (`mivo-backend`)

**Depois do deploy:**
- URL do backend: `https://mivo-backend.onrender.com`
- Use essa URL no frontend: `VITE_API_URL=https://mivo-backend.onrender.com/api`
