#!/bin/bash

BASE_URL="http://localhost:3000"
echo "🧪 Testando Endpoints do MIVO Backend"
echo "======================================"
echo ""

# Health Check
echo "1️⃣ Health Check"
curl -s "$BASE_URL/health" | jq .
echo -e "\n"

# Registro de usuário
echo "2️⃣ Registro de novo usuário"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@mivo.com",
    "password": "senha123",
    "name": "Usuario Teste"
  }')
echo "$REGISTER_RESPONSE" | jq .
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token // empty')
echo -e "\n"

# Login
echo "3️⃣ Login de usuário"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@mivo.com",
    "password": "senha123"
  }')
echo "$LOGIN_RESPONSE" | jq .
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // empty')
echo "Token: $TOKEN"
echo -e "\n"

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ Falha ao obter token. Não é possível testar endpoints autenticados."
  exit 1
fi

# Perfil do usuário
echo "4️⃣ Perfil do usuário"
curl -s "$BASE_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "\n"

# Listar lições
echo "5️⃣ Listar todas as lições"
curl -s "$BASE_URL/api/lessons" \
  -H "Authorization: Bearer $TOKEN" | jq '.lessons[:3]'
echo -e "\n"

# Progresso do usuário
echo "6️⃣ Progresso do usuário"
curl -s "$BASE_URL/api/progress" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "\n"

# Badges do usuário
echo "7️⃣ Badges do usuário"
curl -s "$BASE_URL/api/badges/user" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "\n"

# Leaderboard
echo "8️⃣ Leaderboard"
curl -s "$BASE_URL/api/leaderboard" \
  -H "Authorization: Bearer $TOKEN" | jq '.leaderboard[:5]'
echo -e "\n"

echo "✅ Testes concluídos!"
