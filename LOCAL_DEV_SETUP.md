# 🧪 Ambiente Local de Desenvolvimento - MIVO

## ✅ Configuração Completa

### PostgreSQL Local
- **Database:** `mivo_dev`
- **URL:** `postgresql://raphaelmelogois@localhost:5432/mivo_dev`
- **Status:** ✅ Criado e sincronizado

### Backend Local
- **URL:** http://localhost:3002
- **Database:** PostgreSQL local (mivo_dev)
- **Comando:** `cd mivo-backend && npm run dev`

### Frontend Local
- **URL:** http://localhost:3000
- **API:** Backend local (http://localhost:3002)
- **Comando:** `cd mivo-frontend && npm run dev`

---

## 👤 Usuário Demo Local

**Email:** `demo@local.dev`  
**Senha:** `demo123`

---

## 📁 Arquivos de Configuração

### Backend (.env)
```bash
NODE_ENV=development
PORT=3002
DATABASE_URL=postgresql://raphaelmelogois@localhost:5432/mivo_dev
JWT_SECRET=dev-secret-key-local
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Frontend (.env.local)
```bash
VITE_API_URL=http://localhost:3002
```

---

## 🚀 Como Usar

### 1. Iniciar Backend
```bash
cd mivo-backend
npm run dev
```

### 2. Iniciar Frontend (novo terminal)
```bash
cd mivo-frontend
npm run dev
```

### 3. Acessar Aplicação
- Abra: http://localhost:3000
- Faça login com `demo@local.dev` / `demo123`

---

## 🔄 Comandos Úteis

```bash
# Sincronizar database
cd mivo-backend
npm run db:sync

# Resetar database (apaga tudo)
npm run db:sync:force

# Conectar ao PostgreSQL
psql mivo_dev

# Ver tabelas
psql mivo_dev -c "\dt"

# Ver usuários
psql mivo_dev -c "SELECT id, email, name FROM users;"
```

---

## 🌐 Ambientes

| Ambiente | Backend | Frontend | Database |
|----------|---------|----------|----------|
| **Local** | http://localhost:3002 | http://localhost:3000 | PostgreSQL local (mivo_dev) |
| **Produção** | https://mivo-backend.onrender.com | https://mivo-frontend-9kufec154-raphaelmgs-projects.vercel.app | Render PostgreSQL |

---

## ✅ Vantagens do Ambiente Local

- ✅ Dados isolados (não afeta produção)
- ✅ Desenvolvimento rápido (sem latência de rede)
- ✅ Pode resetar database quando quiser
- ✅ Testes sem risco
- ✅ Offline-friendly

---

**🎯 Agora você pode desenvolver localmente sem afetar a produção!**
