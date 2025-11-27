# Seed de Lições do MIVO - Instruções

## Status Atual

✅ **Completo** (11/25 lições):
- 5 Concept Builder (01-05) ✅
- 5 Real-World Challenge (01-05) ✅  
- 1 Decision Maker (01) ✅

🔄 **Restantes** (14/25 lições):
- 4 Decision Maker (02-05)
- 5 Peer Review (01-05)
- 5 Community Quest (01-05)

## Estrutura de Diretórios

```
mivo-backend/lessons-seed/
├── concept-builder/         (5 lições ✅)
├── real-world-challenge/    (5 lições ✅)
├── decision-maker/          (1 lição ✅, 4 pendentes)
├── peer-review/             (5 pendentes)
└── community-quest/         (5 pendentes)
```

## Como Importar no Banco

### Opção 1: Script Node.js (Recomendado)

Criar `scripts/seed-lessons.ts`:

```typescript
import Lesson from '../src/models/Lesson';
import fs from 'fs';
import path from 'path';

async function seedLessons() {
  const seedDir = path.join(__dirname, '../lessons-seed');
  const types = ['concept-builder', 'real-world-challenge', 'decision-maker', 'peer-review', 'community-quest'];
  
  for (const type of types) {
    const typeDir = path.join(seedDir, type);
    const files = fs.readdirSync(typeDir).filter(f => f.endsWith('.json'));
    
    for (const file of files) {
      const filePath = path.join(typeDir, file);
      const lessonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      await Lesson.create(lessonData);
      console.log(`✅ Created: ${lessonData.title}`);
    }
  }
  
  console.log('🎉 Seed completed!');
}

seedLessons();
```

Rodar:
```bash
cd mivo-backend
npx ts-node scripts/seed-lessons.ts
```

### Opção 2: SQL Direto

Converter JSONs para INSERT statements:

```bash
cd mivo-backend/lessons-seed
for file in */*.json; do
  echo "INSERT INTO lessons (title, description, type, difficulty, \"xpReward\", content, \"estimatedMinutes\", \"isPremium\", \"order\", \"isPublished\") VALUES ("
  # ... processar JSON
done
```

## Lições Completas e Testadas

### Concept Builder (5/5) ✅

1. **Product Discovery Fundamentals** - Beginner, 10 XP
2. **RICE Framework** - Beginner, 12 XP
3. **North Star Metric** - Intermediate, 15 XP
4. **OKRs Basics** - Intermediate, 15 XP
5. **User Story Mapping** - Advanced, 15 XP

### Real-World Challenge (5/5) ✅

1. **CEO Urgency: Competitor Feature** - Intermediate, 18 XP
2. **Bugs vs Features** - Beginner, 15 XP
3. **Fraud vs Conversion** - Advanced, 20 XP
4. **Pivot Decision** - Advanced, 20 XP
5. **Incomplete Launch** - Intermediate, 18 XP

### Decision Maker (1/5) ✅

1. **Sprint Planning with Conflicts** - Intermediate, 25 XP

## Próximos Passos

Para completar o seed (14 lições restantes), continue criando:

### Decision Maker (4 pendentes):
- 02-quarterly-roadmap.json
- 03-crisis-critical-bug.json
- 04-new-market-entry.json
- 05-team-restructure.json

### Peer Review (5 pendentes):
- 01-overloaded-roadmap.json
- 02-prd-no-metrics.json
- 03-bad-okrs.json
- 04-user-story-no-context.json
- 05-gtm-strategy.json

### Community Quest (5 pendentes):
- 01-review-system-marketplace.json
- 02-onboarding-saas.json
- 03-recommendation-ecommerce.json
- 04-gamification-fintech.json
- 05-platform-migration-b2b.json

## Formato das Lições

Cada JSON segue o schema do model `Lesson.ts`:

```json
{
  "title": "string",
  "description": "string",
  "type": "concept_builder|decision_maker|real_world_challenge|peer_review|community_quest",
  "difficulty": "beginner|intermediate|advanced",
  "xpReward": number,
  "estimatedMinutes": number,
  "isPremium": boolean,
  "order": number,
  "isPublished": boolean,
  "content": { ... } // Estrutura específica por tipo
}
```

## Validação

Antes de importar, validar:

```typescript
// Verificar JSON válido
JSON.parse(fs.readFileSync('lesson.json', 'utf-8'));

// Verificar schema
const lesson = await Lesson.build(lessonData);
await lesson.validate();
```

## Total de XP por Tipo

- Concept Builder: 67 XP (5 lições)
- Real-World Challenge: 91 XP (5 lições)
- Decision Maker: 25 XP (1 lição, ~140 XP quando completo)
- Total Atual: 183 XP
- Total Final: ~450 XP (25 lições)

## Aprovação de Conteúdo

✅ 11 lições criadas com:
- Conteúdo educacional detalhado
- Expert feedback de empresas reais (iFood, Nubank, Sequoia)
- Cenários realistas baseados em casos do mercado
- Feedback contextual e educativo
- Progressão de dificuldade adequada

Próximo: Criar 14 lições restantes seguindo mesma qualidade.
