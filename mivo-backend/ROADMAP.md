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
- [ ] **Phase 1: Foundation**
  - Setup de bibliotecas
  - Estrutura de serviços (`src/services/ai`)
  - Coleta de métricas básicas
- [ ] **Phase 2: Intelligence**
  - Implementação do `json-rules-engine`
  - Criação das primeiras regras pedagógicas
  - Endpoint de recomendação (`/api/ai/recommend`)
- [ ] **Phase 3: Analytics**
  - Dashboard de insights do aluno
  - Análise de eficácia das lições (quais causam mais desistência?)

#### Data Strategy
- Utilizar PostgreSQL para armazenar eventos brutos
- Processamento on-demand (ou via cron jobs noturnos se escalar)
- Manter lógica "hardcoded" inteligente antes de tentar ML treinado
