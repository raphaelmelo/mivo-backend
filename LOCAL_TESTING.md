# 🧪 Ambiente Local Conectado ao Banco Remoto

## ✅ Configuração Completa

### Backend Local
- **URL:** http://localhost:3002
- **Status:** ✅ Rodando
- **Database:** ✅ Conectado ao PostgreSQL do Render (remoto)
- **Health Check:** http://localhost:3002/health

### Frontend Local
- **URL:** http://localhost:3000
- **Status:** ✅ Rodando
- **API:** Conectado ao backend local (porta 3002)

---

## 🔧 Configuração Aplicada

### Backend (.env)
```bash
NODE_ENV=development
PORT=3002
DATABASE_URL=postgresql://mivo_db_user:...@dpg-d4ecbpadbo4c73dedm50-a.oregon-postgres.render.com/mivo_db?ssl=true
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend (.env.local)
```bash
VITE_API_URL=http://localhost:3002/api
```

---

## 🧪 Testar Aplicação

1. **Acesse:** http://localhost:3000
2. **Faça login:**
   - Email: `demo@mivo.app`
   - Senha: `demo123456`
3. **Teste as funcionalidades:**
   - Registro de novos usuários
   - Login/Logout
   - Onboarding
   - Navegação entre telas

---

## 📊 Dados Compartilhados

**Importante:** O ambiente local está usando o **mesmo banco de dados** que a produção no Render.

- ✅ Usuário demo existe no banco remoto
- ✅ Todas as tabelas já criadas
- ⚠️ Mudanças feitas localmente afetam produção

---

## 🔄 Comandos Úteis

```bash
# Backend (terminal 1)
cd mivo-backend
npm run dev

# Frontend (terminal 2)
cd mivo-frontend
npm run dev

# Testar health check
curl http://localhost:3002/health

# Testar login
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@mivo.app","password":"demo123456"}'
```

---

## 🌐 Ambientes Disponíveis

| Ambiente | Backend | Frontend | Database |
|----------|---------|----------|----------|
| **Local** | http://localhost:3002 | http://localhost:3000 | Render (remoto) |
| **Produção** | https://mivo-backend.onrender.com | https://mivo-frontend-9kufec154-raphaelmgs-projects.vercel.app | Render |

---

**🎯 Vantagens:** Desenvolvimento local com dados reais de produção, sem precisar popular banco local.
