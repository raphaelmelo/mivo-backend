# MIVO Backend Roadmap

## 🚀 Upcoming Features

### 🧠 Sistema de IA Enxuto (Lean AI Engine)
**Status**: Planned
**Objective**: Criar um sistema de recomendação e análise de estudantes usando stack leve (Node.js), sem infraestrutura complexa de ML.

#### Tech Stack
- **Runtime**: Node.js (Nativo)
- **Data Analysis**: `danfojs-node` (Pandas-like para JS)
- **Statistics**: `simple-statistics`
- **Rules Engine**: `json-rules-engine`

#### Architecture
1. **Student Analyzer Service**
   - Processamento de logs de atividades (`lesson_completions`)
   - Cálculo de métricas: Taxa de sucesso, Tempo médio, Consistência
   - Detecção de tendências (melhora/piora) usando regressão linear simples

2. **Recommendation Engine**
   - Sistema baseado em regras (Rule-based)
   - Regras de Progressão: Quando avançar para conteúdo mais difícil
   - Regras de Intervenção: Quando sugerir revisão ou conteúdo complementar
   - Regras de Engajamento: Badges e recompensas baseadas em comportamento

3. **Difficulty Calculator**
   - Ajuste dinâmico de dificuldade baseado no histórico do aluno
   - Escalas adaptativas usando percentis da base de usuários

#### Implementation Phases
- [x] **Phase 1: Foundation** ✅ *Completed: 2024-11-19*
  - Setup de bibliotecas
  - Estrutura de serviços (`src/services/ai`)
  - Coleta de métricas básicas
  - API endpoints:`/api/ai/metrics`, `/api/ai/consistency`, `/api/ai/trends`, `/api/ai/activity`, `/api/ai/stats`
  - Coleta de métricas básicas
- [x] **Phase 2: Intelligence** ✅ *Completed: 2024-11-19*
  - Implementação do `json-rules-engine`
  - Criação de 9 regras pedagógicas (2 progressão, 3 intervenção, 4 engajamento)
  - Endpoint de recomendação (`/api/ai/recommend/:userId`)
  - Sistema de priorização e filtragem de recomendações
- [x] **Phase 3: Analytics** ✅ *Completed: 2024-11-20*
  - Implementação do `AnalyticsEngine`
  - Dashboard de insights do aluno (endpoint `/api/ai/insights/:userId`)
  - Análise de eficácia das lições (`/api/ai/lesson-effectiveness`)
  - Métricas de dropout rate, completion rate, difficulty rating por lição
  - Identificação automática de lições que precisam de revisão

#### Data Strategy
- Utilizar PostgreSQL para armazenar eventos brutos
- Processamento on-demand (ou via cron jobs noturnos se escalar)
- Manter lógica "hardcoded" inteligente antes de tentar ML treinado
