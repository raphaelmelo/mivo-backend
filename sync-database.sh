#!/bin/bash

# Script para sincronizar database do MIVO em produção
# Execute este script localmente para criar as tabelas no PostgreSQL do Render

echo "🔄 Sincronizando database do MIVO..."
echo ""
echo "⚠️  Você precisa da DATABASE_URL do Render"
echo "    Obtenha em: Dashboard → Databases → mivo-db → Info → Internal Database URL"
echo ""
read -p "Cole a DATABASE_URL aqui: " DATABASE_URL

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL não fornecida"
  exit 1
fi

echo ""
echo "📦 Instalando dependências temporariamente..."
cd "$(dirname "$0")/mivo-backend"

# Exportar a DATABASE_URL
export DATABASE_URL="$DATABASE_URL"

echo "🔧 Executando database sync..."
npm run db:sync

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Database sincronizado com sucesso!"
  echo ""
  echo "🎯 Próximo passo: Criar usuário demo"
  echo ""
  echo "Execute:"
  echo "curl -X POST https://mivo-backend.onrender.com/api/auth/register \\"
  echo "  -H \"Content-Type: application/json\" \\"
  echo "  -d '{\"name\":\"Demo User\",\"email\":\"demo@mivo.app\",\"password\":\"demo123456\"}'"
else
  echo ""
  echo "❌ Erro ao sincronizar database"
  echo "Verifique a DATABASE_URL e tente novamente"
  exit 1
fi
