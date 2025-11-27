# 🚀 Deploy Backend MIVO no Render

**Método Recomendado:** Dashboard Web (CLI v2.4.1 não suporta criação de serviços)

---

## 📋 Pré-requisitos

- [x] Conta no Render (https://render.com)
- [x] Código no GitHub: `https://github.com/raphaelmelo/Mivoapp.git`
- [x] Render CLI instalada (para gerenciamento posterior)

---

## 🗄️ Passo 1: Criar PostgreSQL Database

### 1.1 Acessar Dashboard

1. Acesse: https://dashboard.render.com
2. Clique em **"New +"** → **"PostgreSQL"**

### 1.2 Configurar Database

**Name:** `mivo-db`  
**Database:** `mivo_production`  
**User:** `mivo_user`  
**Region:** Oregon (US West)  
**PostgreSQL Version:** 16  
**Plan:** Free (90 dias grátis, depois $7/mês)

### 1.3 Criar Database

1. Clique em **"Create Database"**
2. Aguarde ~2 minutos para provisionar
3. **Copie a Connection String:**
   - Vá em **"Info"** → **"Internal Database URL"**
   - Formato: `postgresql://user:pass@host:5432/db`
   - **Guarde essa URL!** Você vai precisar no próximo passo

---

## 🌐 Passo 2: Criar Web Service

### 2.1 Novo Web Service

1. No dashboard, clique em **"New +"** → **"Web Service"**
2. Conectar repositório:
   - **Connect a repository:** Selecione `raphaelmelo/Mivoapp`
   - Se não aparecer, clique em **"Configure account"** e autorize o GitHub

### 2.2 Configurar Service

**Name:** `mivo-backend`  
**Region:** Oregon (US West)  
**Branch:** `main`  
**Root Directory:** `mivo-backend` ⚠️ **IMPORTANTE!**  
**Runtime:** Node  
**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

**Plan:** Free

### 2.3 Configurar Variáveis de Ambiente

Clique em **"Advanced"** → **"Add Environment Variable"**

Adicione as seguintes variáveis:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3002` |
| `DATABASE_URL` | `postgresql://...` (cole a URL do Passo 1.3) |
| `JWT_SECRET` | (clique em "Generate" ou use: `openssl rand -base64 32`) |
| `JWT_EXPIRES_IN` | `7d` |
| `FRONTEND_URL` | `http://localhost:5173` (atualizar depois) |
| `ALLOWED_ORIGINS` | `http://localhost:5173,https://mivo-app.vercel.app` |

**Para gerar JWT_SECRET localmente:**
```bash
openssl rand -base64 32
```

### 2.4 Health Check (Opcional mas Recomendado)

**Health Check Path:** `/health`

### 2.5 Criar Service

1. Clique em **"Create Web Service"**
2. Render irá:
   - Clonar repositório
   - Instalar dependências
   - Rodar build
   - Iniciar servidor
   - **Tempo estimado:** 3-5 minutos

---

## 🔍 Passo 3: Verificar Deploy

### 3.1 Acompanhar Logs

No dashboard do serviço, vá em **"Logs"** para ver o progresso:

```
==> Cloning from https://github.com/raphaelmelo/Mivoapp...
==> Running 'npm install && npm run build'
==> Build successful!
==> Starting service with 'npm start'
🚀 MIVO Backend running on port 3002
📍 Environment: production
```

### 3.2 Obter URL do Backend

Após deploy bem-sucedido:
1. No topo da página, copie a URL
2. Será algo como: `https://mivo-backend.onrender.com`
3. **Anote essa URL!** Você vai usar no frontend

### 3.3 Testar Health Check

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

## 🗄️ Passo 4: Sincronizar Database

Após o deploy, você precisa criar as tabelas no PostgreSQL.

### Opção A: Via Dashboard (Shell)

1. No serviço `mivo-backend`, vá em **"Shell"**
2. Execute:
```bash
npm run db:sync
```

### Opção B: Via CLI Local

```bash
# Conectar ao banco remoto
render psql mivo-db

# Dentro do psql, verificar se conectou
\dt

# Sair
\q
```

Depois, rodar sync remotamente:
```bash
render ssh mivo-backend
npm run db:sync
exit
```

### Opção C: Via Connection String Local

```bash
# Usar a connection string do banco
DATABASE_URL="postgresql://..." npm run db:sync
```

**⚠️ Atenção:** 
- Use `db:sync` em produção (cria tabelas sem dropar)
- Use `db:sync:force` apenas em desenvolvimento (dropa e recria)

---

## 🔐 Passo 5: Atualizar CORS (Após Deploy do Frontend)

Depois que o frontend estiver no Vercel, atualize as variáveis:

1. No dashboard do `mivo-backend`, vá em **"Environment"**
2. Edite:

```bash
FRONTEND_URL=https://mivo-app.vercel.app
ALLOWED_ORIGINS=https://mivo-app.vercel.app,https://mivo-app-*.vercel.app,http://localhost:5173
```

3. Clique em **"Save Changes"**
4. Serviço reiniciará automaticamente

---

## 📊 Gerenciamento via CLI

Agora que o serviço está criado, você pode gerenciá-lo via CLI:

### Ver Logs
```bash
render logs mivo-backend --tail
```

### Reiniciar Serviço
```bash
render restart mivo-backend
```

### SSH no Serviço
```bash
render ssh mivo-backend
```

### Conectar ao PostgreSQL
```bash
render psql mivo-db
```

### Forçar Novo Deploy
```bash
render services deploy mivo-backend
```

### Ver Status
```bash
render services list
```

---

## 🔧 Troubleshooting

### Build Falha: "Cannot find module"

**Causa:** Root directory incorreto

**Solução:**
1. Dashboard → `mivo-backend` → **"Settings"**
2. **Root Directory:** Certifique-se que está `mivo-backend`
3. Salvar e fazer redeploy

### Database Connection Error

**Sintoma:** Logs mostram `ECONNREFUSED` ou `authentication failed`

**Solução:**
1. Verificar se `DATABASE_URL` está correta
2. Testar conexão:
```bash
render psql mivo-db
```
3. Verificar se database está "Available" no dashboard

### Health Check Failing

**Sintoma:** Service fica "Unhealthy"

**Solução:**
1. Verificar logs: `render logs mivo-backend --tail`
2. Testar endpoint manualmente:
```bash
curl https://mivo-backend.onrender.com/health
```
3. Verificar se porta está correta (Render injeta `$PORT`)

### Service Suspende Após 15 Minutos

**Causa:** Plano Free hiberna após inatividade

**Solução:**
- Normal no plano Free
- Primeira requisição acorda o serviço (~30s)
- Para evitar: upgrade para plano Starter ($7/mês)

---

## 💰 Custos

| Recurso | Plan | Custo/mês |
|---------|------|-----------|
| Web Service | Free | **$0** |
| PostgreSQL | Free (90 dias) | **$0** |
| PostgreSQL | Starter (após 90 dias) | **$7** |
| **Total (primeiros 90 dias)** | | **$0** |
| **Total (após 90 dias)** | | **$7** |

---

## ✅ Checklist Final

- [ ] PostgreSQL database criado: `mivo-db`
- [ ] Web service criado: `mivo-backend`
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy bem-sucedido
- [ ] Health check respondendo: `https://mivo-backend.onrender.com/health`
- [ ] Database sincronizado (tabelas criadas)
- [ ] URL do backend anotada: `________________________`

---

## 📚 Próximos Passos

1. ✅ Backend deployado no Render
2. ⏭️ Atualizar `VITE_API_URL` no frontend com URL do backend
3. ⏭️ Deploy do frontend no Vercel
4. ⏭️ Atualizar `ALLOWED_ORIGINS` no backend com URL do Vercel
5. ⏭️ Testar fluxo completo (registro → login → onboarding)

---

## 🔗 URL do Backend

Após completar o deploy, sua URL será:

```
https://mivo-backend.onrender.com
```

Use essa URL para configurar o frontend:
```bash
VITE_API_URL=https://mivo-backend.onrender.com/api
```

---

## 📝 Comandos CLI Úteis

```bash
# Ver todos os serviços
render services list

# Logs em tempo real
render logs mivo-backend --tail --follow

# Reiniciar
render restart mivo-backend

# SSH
render ssh mivo-backend

# PostgreSQL
render psql mivo-db

# Abrir dashboard no navegador
render services open mivo-backend
```
