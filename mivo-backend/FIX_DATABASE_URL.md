# 🔧 Problema: DATABASE_URL não configurada

## ❌ Erro Atual

```
TypeError: Cannot read properties of null (reading 'replace')
    at new Sequelize (/app/node_modules/sequelize/lib/sequelize.js:58:43)
```

**Causa:** A variável de ambiente `DATABASE_URL` não está configurada no Render.

## ✅ Solução

Você precisa adicionar a `DATABASE_URL` nas variáveis de ambiente do serviço `mivo-backend`.

### Passo 1: Obter a Connection String do PostgreSQL

1. No dashboard do Render, vá em **Databases** → **mivo-db**
2. Clique em **"Info"**
3. Copie o **"Internal Database URL"**
   - Formato: `postgresql://user:password@host:5432/database`

### Passo 2: Adicionar ao Web Service

1. Vá em **Services** → **mivo-backend**
2. Clique em **"Environment"** (menu lateral)
3. Clique em **"Add Environment Variable"**
4. Adicione:
   - **Key:** `DATABASE_URL`
   - **Value:** (cole a URL copiada no Passo 1)
5. Clique em **"Save Changes"**

O serviço irá reiniciar automaticamente.

### Passo 3: Verificar Deploy

Após salvar, o Render irá reiniciar o serviço. Aguarde ~1-2 minutos e teste:

```bash
curl https://mivo-backend.onrender.com/health
```

## 📋 Outras Variáveis Necessárias

Certifique-se que estas também estão configuradas:

| Variável | Valor | Status |
|----------|-------|--------|
| `DATABASE_URL` | postgresql://... | ❌ **FALTANDO** |
| `NODE_ENV` | production | ✅ |
| `PORT` | 3002 | ✅ |
| `JWT_SECRET` | (gerado) | ✅ |
| `JWT_EXPIRES_IN` | 7d | ✅ |
| `FRONTEND_URL` | http://localhost:5173 | ✅ |
| `ALLOWED_ORIGINS` | http://localhost:5173,... | ✅ |

---

**Após configurar a `DATABASE_URL`, o deploy deve funcionar!**
