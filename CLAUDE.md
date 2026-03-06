# MIVO Backend - CLAUDE.md

## Project Overview

API REST para a plataforma de educacao gamificada para Product Managers MIVO. Gerencia autenticacao, licoes, badges, ligas, jornadas e comunidade.

## Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express 5
- **ORM**: Sequelize 6 + PostgreSQL
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Package manager**: npm

## Dev Commands

```bash
npm run dev              # nodemon + ts-node (hot reload)
npm run build            # tsc -> dist/
npm start                # node dist/server.js (producao)

# Database
npm run db:sync          # Sequelize sync (alter)
npm run db:sync:force    # Sequelize sync (force drop+recreate)
npm run db:seed:lessons  # Seed de licoes
npm run db:seed:posts    # Seed de posts da comunidade

# Scripts uteis
npm run kpi:report       # Relatorio de KPIs
```

## Estrutura

```
src/
  server.ts              # Entry point: Express, CORS, rotas, error handlers
  config/
    database.ts          # Sequelize instance (PostgreSQL via DATABASE_URL)
  models/
    index.ts             # Sync + associacoes entre modelos
    User.ts              # Usuario com gamificacao e onboarding
    Lesson.ts            # Licao
    Badge.ts / UserBadge.ts
    League.ts            # Liga (Bronze/Prata/Ouro/Platina)
    Journey.ts           # Jornada de aprendizado
    Post.ts / Comment.ts # Comunidade
    NPSResponse.ts       # Respostas NPS
    UserProgress.ts      # Progresso do usuario nas licoes
  routes/
    auth.ts              # /api/auth
    lessons.ts           # /api/lessons
    badges.ts            # /api/badges
    leagues.ts           # /api/leagues
    journeys.ts          # /api/journeys
    community.ts         # /api/community
  controllers/
    authController.ts
    lessonController.ts
    badgeController.ts
    leagueController.ts
    journeyController.ts
    communityController.ts
  middlewares/
    auth.ts              # authMiddleware: valida JWT, injeta req.userId
  services/
    badgeService.ts      # Logica de conquista de badges
    leagueService.ts     # Calculo de ligas e ranking
    streakService.ts     # Calculo de streaks diarios
    xpService.ts         # Calculo e progressao de XP/level
  seeds/                 # Seeds para banco de dados
  migrations/            # Migracoes manuais
  utils/                 # Utilitarios
```

## Variaveis de Ambiente

| Variavel | Descricao | Obrigatoria |
|----------|-----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string | Sim |
| `JWT_SECRET` | Segredo para assinar tokens JWT | Sim |
| `NODE_ENV` | `development` ou `production` | Nao (default: development) |
| `PORT` | Porta do servidor | Nao (default: 3000) |
| `JWT_EXPIRES_IN` | Expiracao do token | Nao (default: 7d) |
| `FRONTEND_URL` | URL do frontend para CORS | Nao |
| `ALLOWED_ORIGINS` | Origins permitidos (CSV, suporta wildcards) | Nao |
| `DB_SSL` | Forcar SSL no banco (`true`/`false`) | Nao |

Ver `.env.example` para referencia completa.

## Banco de Dados

- PostgreSQL via `DATABASE_URL`
- SSL automatico se URL contiver `render.com` ou `DB_SSL=true`
- Pool: max 5 conexoes, acquire 30s, idle 10s
- Sequelize sync no startup via `syncDatabase()` (alter, nao force)
- Logging de queries apenas em `development`

## Autenticacao

- JWT Bearer token no header `Authorization`
- `authMiddleware` injeta `req.userId` nas rotas protegidas
- Senhas com bcryptjs
- Login LinkedIn OAuth via `/api/auth/linkedin/*`
- Token invalido/expirado -> 401

## Rotas Principais

```
GET  /health                    # Health check
POST /api/auth/register         # Cadastro
POST /api/auth/login            # Login
GET  /api/auth/profile          # Perfil (autenticado)
PUT  /api/auth/onboarding       # Dados de onboarding (goal, currentLevel, etc.)

GET  /api/lessons               # Listar licoes
POST /api/lessons/:id/complete  # Completar licao (XP, streak, badges)

GET  /api/badges                # Badges do usuario
GET  /api/leagues               # Ranking da liga atual
GET  /api/journeys              # Jornadas de aprendizado

GET  /api/community/posts       # Posts da comunidade
POST /api/community/posts       # Criar post
POST /api/community/posts/:id/comments  # Comentar
```

## CORS

Origins permitidos configurados em `server.ts`:
- Defaults: `localhost:5173`, `localhost:3000`, `https://mivolabs.com`, `https://www.mivolabs.com`
- Sobreposicao via `ALLOWED_ORIGINS` (CSV, suporta wildcards com `*`)
- Requisicoes sem origin (Postman, mobile) sao permitidas

## Modelo de Usuario

Campos de gamificacao:
- `xp`, `level`, `streak`, `lastActiveDate`, `lessonsCompleted`
- `isPremium`, `premiumExpiresAt`
- `leagueId` (FK para leagues)

Campos de onboarding (perfil de PM):
- `goal`: `pleno | migrar | aprender`
- `currentLevel`: `junior | pleno | senior | iniciante`
- `dailyTimeCommitment`: `5 | 10 | 20` (minutos/dia)
- `productArea`: `b2c | b2b | marketplace | fintech | saas`
- `company`

## Servicos de Gamificacao

- **xpService**: calcula XP ganho por licao, detecta level up
- **streakService**: verifica e incrementa streak diario baseado em `lastActiveDate`
- **badgeService**: verifica e concede badges apos completar licao
- **leagueService**: calcula rank e tier (Bronze/Prata/Ouro/Platina) na liga do usuario

## Producao

- Docker via `Dockerfile`
- Deploy em Render ou Coolify (ver `render.yaml`, `DEPLOY_BACKEND.md`)
- Em producao, se pasta `../../build` existir, serve frontend estatico + SPA fallback
- `NODE_ENV=production` desativa logging de SQL e expoe mensagens de erro sanitizadas
- Producao: `https://mivolabs.com/api`

## Convencoes

- Controllers finos: recebem req/res, delegam logica para services/models
- Sempre usar `authMiddleware` em rotas que requerem autenticacao
- `req.userId` disponivel apos middleware (tipo `AuthRequest` de `middlewares/auth.ts`)
- Scripts utilitarios avulsos na raiz (add-column.ts, check-users.ts, etc.) - executar com `ts-node`
- Nao ha testes automatizados (apenas scripts manuais: `test-auth.sh`, `test-endpoints.sh`)
