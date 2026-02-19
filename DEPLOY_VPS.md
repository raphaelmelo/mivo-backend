# Deploying MIVO on VPS

This guide explains how to deploy the full MIVO stack (Frontend, Backend, Database) using Docker Compose.

## Prerequisites

- Docker and Docker Compose installed on the VPS.
- `mivo-backend` and `mivo-frontend` repositories cloned into the same parent directory.

## Setup

1. Create a `docker-compose.yml` file in the parent directory (same level as `mivo-backend` and `mivo-frontend` folders).
2. Paste the following content into it:

```yaml
version: "3.8"

services:
  # Database Service
  postgres:
    image: postgres:15-alpine
    container_name: mivo-db
    environment:
      - POSTGRES_DB=mivo_db
      - POSTGRES_USER=mivo_user
      - POSTGRES_PASSWORD=mivo_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432" # Optional: Expose if you want to connect via local tools
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U mivo_user -d mivo_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  # Backend Service
  backend:
    build:
      context: ./mivo-backend
      dockerfile: Dockerfile
    container_name: mivo-backend
    ports:
      - "5173:5173"
    environment:
      - NODE_ENV=production
      - PORT=5173
      - DATABASE_URL=postgresql://mivo_user:mivo_password@postgres:5432/mivo_db
      - JWT_SECRET=mivo_secret_key_change_me_in_prod
      - FRONTEND_URL=http://localhost
      - DB_SSL=false # Important for local docker connection
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  # Frontend Service (Nginx)
  frontend:
    build:
      context: ./mivo-frontend
      dockerfile: Dockerfile
      args:
        - VITE_API_URL=/api
    container_name: mivo-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

## Running

Run the following command in the directory containing `docker-compose.yml`:

```bash
docker-compose up -d --build
```

- Frontend will be available at `http://your-vps-ip` (Port 80)
- Backend API at `http://your-vps-ip:5173`
