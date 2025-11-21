# 🚀 MIVO App - Roadmap Geral

## 📖 Visão Geral
**MIVO** é uma plataforma educacional gamificada para ensinar **Product Management** através de lições interativas, desafios práticos e sistema de recompensas.

**Status Atual:** ✅ MVP em produção com AI Engine completo

---

## 🏗️ Arquitetura Atual

### Stack Tecnológico
- **Frontend:** React 18, TypeScript, Vite, Zustand, Tailwind CSS v4, Radix UI
- **Backend:** Node.js, Express, TypeScript, Sequelize ORM
- **Database:** PostgreSQL (Render - Free 90 dias)
- **Auth:** JWT com refresh tokens
- **Deploy:** Vercel (Frontend) + Render (Backend)

### Infraestrutura
```
┌─────────────────────────────────────┐
│  Frontend (Vercel)                  │
│  - React 18 + TypeScript            │
│  - Zustand (State Management)       │
│  - Tailwind CSS v4                  │
│  - PWA Support                      │
└──────────────┬──────────────────────┘
               │ HTTPS/JWT
┌──────────────▼──────────────────────┐
│  Backend (Render)                   │
│  - Express + TypeScript             │
│  - Sequelize ORM                    │
│  - Lean AI Engine                   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  PostgreSQL (Render)                │
│  - 6 Tables                         │
│  - Gamification Data                │
│  - AI Metrics                       │
└─────────────────────────────────────┘
```

---

## ✅ Funcionalidades Implementadas

### 🔐 Autenticação & Onboarding
- [x] Sistema de registro e login (JWT)
- [x] Refresh token automático
- [x] Proteção de rotas
- [x] Fluxo de onboarding em 3 etapas:
  - **Página 1:** Objetivo do usuário (pleno, migrar, aprender)
  - **Página 2:** Nível atual (júnior, pleno, sênior, iniciante)
  - **Página 3:** Preferências (tempo diário, empresa, área de produto)
- [x] Persistência de estado (localStorage via Zustand)
- [x] Design pixel-perfect redesignado (Nov 2024)

### 📚 Sistema de Lições
- [x] 5 tipos de lições interativas:
  - **Concept Builder:** Cartões de conceitos com quiz
  - **Decision Maker:** Escolhas com consequências
  - **Real World Challenge:** Cenários práticos
  - **Peer Review:** Avaliação de casos reais
  - **Community Quest:** Desafios colaborativos
- [x] Sistema de XP e recompensas
- [x] Tracking de progresso (UserProgress)

### 🎮 Gamificação
- [x] Sistema de XP e níveis
- [x] Streaks (dias consecutivos)
- [x] Ligas competitivas (tabela `leagues`)
- [x] Badges e conquistas (tabelas `badges`, `user_badges`)
- [x] Sistema Premium (controle de acesso)

### 🧠 Lean AI Engine (100% Completo)
- [x] **Phase 1: Foundation** *(Concluído: 19/11/2024)*
  - MetricsCollector e StudentAnalyzer
  - 5 endpoints de métricas (`/api/ai/metrics`, `/consistency`, `/trends`, `/activity`, `/stats`)
  - Análise de completion rate, tempo médio, consistência
  - Detecção de tendências (linear regression)

- [x] **Phase 2: Intelligence** *(Concluído: 19/11/2024)*
  - Rule-based recommendation engine (`json-rules-engine`)
  - 9 regras pedagógicas (2 progressão, 3 intervenção, 4 engajamento)
  - Endpoint `/api/ai/recommend/:userId`
  - Sistema de priorização de recomendações

- [x] **Phase 3: Analytics** *(Concluído: 20/11/2024)*
  - AnalyticsEngine completo
  - Dashboard de insights (`/api/ai/insights/:userId`)
  - Análise de eficácia de lições (`/api/ai/lesson-effectiveness`)
  - Métricas de dropout rate, completion rate, difficulty rating
  - Identificação automática de lições problemáticas

### 🌐 UI/UX
- [x] Design mobile-first responsivo
- [x] Componentes Radix UI (acessibilidade)
- [x] Bottom navigation bar
- [x] 5 telas principais (Home, Learn, Leagues, Community, Profile)
- [x] Loading states e feedback visual
- [x] Validação em tempo real (formulários)
- [x] PWA configurado

---

## 🎯 Próximas Features Planejadas

### 📊 Analytics & Dashboard (Prioridade Alta)
- [ ] Dashboard do estudante com visualizações de:
  - Progresso semanal/mensal
  - Gráficos de XP ao longo do tempo
  - Mapa de calor de atividades
  - Comparação com outros usuários da mesma liga
- [ ] Integrar insights do AI Engine no frontend
- [ ] Notificações baseadas em recomendações da AI

### 🎓 Conteúdo & Lições
- [ ] Criar lições iniciais de Product Management:
  - Módulo 1: Fundamentos de PM
  - Módulo 2: Discovery e Research
  - Módulo 3: Priorização e Roadmap
  - Módulo 4: Métricas e Analytics
  - Módulo 5: Liderança e Stakeholders
- [ ] Sistema de pré-requisitos (árvore de conhecimento)
- [ ] Difficulty Calculator dinâmico (ajuste adaptativo)
- [ ] Conteúdo premium exclusivo
- [ ] **Refatoração Crítica:** Atualizar `DecisionMakerLesson.tsx` para suportar conteúdo dinâmico (atualmente hardcoded para a lição de Sprint Planning), permitindo que as novas lições JSON funcionem corretamente.

### 🏆 Gamificação Avançada
- [ ] Sistema de conquistas (achievements) mais robusto
- [ ] Torneios semanais
- [ ] Ranking global e por empresa
- [ ] Recompensas físicas para top performers
- [ ] Social sharing (compartilhar conquistas)

### 👥 Community Features
- [ ] Fórum de discussão
- [ ] Grupos de estudo
- [ ] Mentoria peer-to-peer
- [ ] Sistema de upvote/downvote em respostas
- [ ] Perfis públicos de usuários

### 🤖 AI Enhancements
- [ ] Chatbot de mentoria (GPT-4 integration)
- [ ] Predição de dropout de estudantes
- [ ] Geração automática de lições baseadas em performance
- [ ] Sugestões personalizadas de conteúdo externo
- [ ] Análise de cohort (turmas/empresas)

### 💳 Monetização
- [ ] Sistema de pagamento (Stripe)
- [ ] Planos Premium (mensal/anual)
- [ ] Trial gratuito de 7 dias
- [ ] Planos corporativos (B2B)
- [ ] Marketplace de conteúdo (criadores externos)

### 🔔 Engagement
- [ ] Push notifications (web + mobile)
- [ ] Email marketing (onboarding, re-engagement)
- [ ] Daily challenges
- [ ] Reminder para manter streak
- [ ] Celebração de marcos (100 lições, 30 dias de streak)

### 📱 Mobile Native
- [ ] App iOS (React Native ou Flutter)
- [ ] App Android (React Native ou Flutter)
- [ ] Offline-first experience
- [ ] Sincronização automática

### 🛠️ DevOps & Performance
- [ ] CI/CD completo (GitHub Actions)
- [ ] Testes automatizados (Jest + Cypress)
- [ ] Monitoring e logging (Sentry, DataDog)
- [ ] Redis cache para métricas da AI
- [ ] Cron jobs para cálculo de métricas noturno
- [ ] CDN para assets estáticos

---

## 📅 Timeline Sugerida

### Q1 2025 (Jan-Mar)
- ✅ **Concluído:** AI Engine completo
- 🎯 **Próximo:** Criar 20 lições iniciais (Módulos 1-2)
- 🎯 **Próximo:** Dashboard de analytics no frontend
- 🎯 **Próximo:** Sistema de pagamento (Premium)

### Q2 2025 (Abr-Jun)
- Completar Módulos 3-5 (mais 30 lições)
- Community features básicas (fórum)
- Mobile apps (MVP)
- Marketing e aquisição de usuários

### Q3 2025 (Jul-Set)
- AI chatbot de mentoria
- Planos corporativos (B2B)
- Torneios e competições
- Escalar infraestrutura

### Q4 2025 (Out-Dez)
- Marketplace de conteúdo
- Internacionalização (i18n)
- Advanced analytics
- Preparar para Series A

---

## 🔗 Links Importantes

### Produção
- **Frontend:** https://mivo-frontend-9kufec154-raphaelmgs-projects.vercel.app
- **Backend:** https://mivo-backend.onrender.com
- **Health Check:** https://mivo-backend.onrender.com/health

### Dashboards
- **Vercel:** https://vercel.com/raphaelmgs-projects/mivo-frontend
- **Render:** https://dashboard.render.com/web/srv-d4ecb8idbo4c73dedfu0

### Desenvolvimento Local
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3002
- **Database:** PostgreSQL local (`mivo_dev`)

### Credenciais Demo
- **Produção:** `demo@mivo.app` / `demo123456`
- **Local:** `demo@local.dev` / `demo123`

---

## 📊 Métricas de Sucesso

### Curto Prazo (3 meses)
- 100 usuários ativos
- 50% completion rate do onboarding
- 30% retention rate (D7)
- 5 lições por usuário (média)

### Médio Prazo (6 meses)
- 1.000 usuários ativos
- 10% conversão para Premium
- 50% retention rate (D30)
- NPS > 40

### Longo Prazo (12 meses)
- 10.000 usuários ativos
- $10k MRR
- 60% retention rate (D90)
- NPS > 60
- Parcerias com 5+ empresas (B2B)

---

## 🚦 Próximos Passos Imediatos

### Esta Semana
1. ✅ AI Engine completo
2. 🎯 Criar primeira lição real de Product Management
3. 🎯 Integrar insights da AI no frontend (dashboard básico)

### Este Mês
1. Criar pelo menos 10 lições completas
2. Implementar sistema de pagamento
3. Lançar beta privado (20-50 usuários)
4. Coletar feedback e iterar

---

## 📝 Notas Técnicas

### Database Schema
6 tabelas principais:
- `users` - Usuários e perfis
- `lessons` - Conteúdo educacional
- `user_progress` - Tracking de progresso
- `leagues` - Sistema de ligas
- `badges` - Conquistas disponíveis
- `user_badges` - Badges conquistadas pelos usuários

### Endpoints API Principais
- **Auth:** `/api/auth/register`, `/login`, `/profile`
- **Lessons:** `/api/lessons` (CRUD)
- **Progress:** `/api/progress` (tracking)
- **AI:** `/api/ai/metrics`, `/recommend`, `/insights`, `/lesson-effectiveness`

### Ambiente
- **Production:** Vercel + Render + PostgreSQL (Render)
- **Development:** Local (frontend: 3000, backend: 3002, PostgreSQL local)

---

**🎯 Objetivo Final:** Tornar o MIVO a principal plataforma de aprendizado de Product Management no Brasil, com gamificação inteligente e AI personalizada.

**🚀 Status:** MVP funcional em produção | AI Engine 100% completo | Pronto para criação de conteúdo
