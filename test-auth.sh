#!/bin/bash

# Teste de Registro
echo "🧪 Testando registro de usuário..."
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@mivo.com","password":"123456","name":"User One"}'

echo -e "\n\n"

# Teste de Login
echo "🧪 Testando login..."
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@mivo.com","password":"123456"}'

echo -e "\n"
