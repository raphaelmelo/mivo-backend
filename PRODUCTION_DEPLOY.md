# Deploy de Produção - Lições Dinâmicas

## 1. Push do Código Backend

```bash
cd /Users/raphaelmelogois/mivo
git push origin main
```

Isso vai disparar o deploy automático no Render.

## 2. Migração do Banco de Dados (Render)

Acesse o Render Dashboard → seu serviço backend → Shell

Execute os seguintes comandos SQL:

```sql
-- Adicionar coluna lessonsCompleted
ALTER TABLE users ADD COLUMN "lessonsCompleted" INTEGER NOT NULL DEFAULT 0;
```

## 3. Seed das Lições (Render Shell)

No mesmo Shell do Render, execute:

```bash
npm run seed
```

Ou manualmente:

```bash
node -r ts-node/register scripts/seed-lessons.ts
```

Isso vai inserir as 25 lições no banco de produção.

## 4. Deploy do Frontend

O frontend está em repositório separado. Você precisa:

1. Ir para o diretório do frontend
2. Fazer commit da mudança em `lessonService.ts`
3. Push para disparar deploy no Vercel

```bash
cd mivo-frontend
git add src/services/lessonService.ts
git commit -m "fix: update lesson service endpoints to use /api prefix"
git push origin main
```

## 5. Verificação

Após os deploys:

1. Acesse a URL de produção
2. Faça login
3. Vá para "Learn"
4. Verifique se as 25 lições aparecem
5. Teste completar uma lição

## Notas Importantes

- O backend já tem CORS configurado para aceitar requisições do frontend Vercel
- As lições estão marcadas como `isPublished: true` por padrão
- O endpoint `/api/lessons` requer autenticação (token JWT)
