-- Script SQL para criar tabelas do MIVO
-- Execute este script no Render Dashboard → Databases → mivo-db → Query

-- Criar tabela leagues
CREATE TABLE IF NOT EXISTS leagues (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  "minXp" INTEGER NOT NULL DEFAULT 0,
  "maxXp" INTEGER,
  icon VARCHAR(255),
  color VARCHAR(50),
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Criar tabela users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  streak INTEGER NOT NULL DEFAULT 0,
  "lastActiveDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "isPremium" BOOLEAN NOT NULL DEFAULT FALSE,
  "premiumExpiresAt" TIMESTAMP WITH TIME ZONE,
  "leagueId" INTEGER REFERENCES leagues(id),
  goal VARCHAR(20) CHECK (goal IN ('pleno', 'migrar', 'aprender')),
  "currentLevel" VARCHAR(20) CHECK ("currentLevel" IN ('junior', 'pleno', 'senior', 'iniciante')),
  "dailyTimeCommitment" VARCHAR(5) CHECK ("dailyTimeCommitment" IN ('5', '10', '20')),
  company VARCHAR(100),
  "productArea" VARCHAR(20) CHECK ("productArea" IN ('b2c', 'b2b', 'marketplace', 'fintech', 'saas')),
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Criar índices para users
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_league_id_idx ON users("leagueId");
CREATE INDEX IF NOT EXISTS users_company_idx ON users(company);

-- Criar tabela lessons
CREATE TABLE IF NOT EXISTS lessons (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('concept_builder', 'decision_maker', 'real_world_challenge', 'peer_review', 'community_quest')),
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  "xpReward" INTEGER NOT NULL DEFAULT 10,
  content JSONB NOT NULL,
  "estimatedMinutes" INTEGER NOT NULL DEFAULT 5,
  "isPremium" BOOLEAN NOT NULL DEFAULT FALSE,
  "order" INTEGER NOT NULL DEFAULT 0,
  "isPublished" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Criar índices para lessons
CREATE INDEX IF NOT EXISTS lessons_type_idx ON lessons(type);
CREATE INDEX IF NOT EXISTS lessons_difficulty_idx ON lessons(difficulty);
CREATE INDEX IF NOT EXISTS lessons_order_idx ON lessons("order");

-- Criar tabela badges
CREATE TABLE IF NOT EXISTS badges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(255),
  category VARCHAR(50),
  "requiredXp" INTEGER,
  "requiredStreak" INTEGER,
  "requiredLessons" INTEGER,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Criar tabela user_badges
CREATE TABLE IF NOT EXISTS user_badges (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "badgeId" INTEGER NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  "earnedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE("userId", "badgeId")
);

-- Criar índices para user_badges
CREATE INDEX IF NOT EXISTS user_badges_user_id_idx ON user_badges("userId");
CREATE INDEX IF NOT EXISTS user_badges_badge_id_idx ON user_badges("badgeId");

-- Criar tabela user_progress
CREATE TABLE IF NOT EXISTS user_progress (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "lessonId" INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  "isCompleted" BOOLEAN NOT NULL DEFAULT FALSE,
  "completedAt" TIMESTAMP WITH TIME ZONE,
  score INTEGER,
  "timeSpent" INTEGER,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE("userId", "lessonId")
);

-- Criar índices para user_progress
CREATE INDEX IF NOT EXISTS user_progress_user_id_idx ON user_progress("userId");
CREATE INDEX IF NOT EXISTS user_progress_lesson_id_idx ON user_progress("lessonId");
CREATE INDEX IF NOT EXISTS user_progress_completed_idx ON user_progress("isCompleted");

-- Verificar tabelas criadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
