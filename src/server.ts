import express, { Express, Request, Response } from 'express';
import { syncDatabase } from './models';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3002;
const isProduction = process.env.NODE_ENV === 'production';

// Configuração de CORS para deployment separado
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean);

// Função para verificar se origin é permitida (suporta wildcards)
const isOriginAllowed = (origin: string): boolean => {
  return allowedOrigins.some(allowed => {
    if (allowed.includes('*')) {
      // Converte wildcard para regex
      const pattern = allowed.replace(/\*/g, '.*');
      return new RegExp(`^${pattern}$`).test(origin);
    }
    return allowed === origin;
  });
};

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origin (Postman, apps mobile, etc)
    if (!origin) return callback(null, true);

    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      // Não retorna erro, apenas nega o acesso
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import lessonRoutes from './routes/lessons';

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/lessons', lessonRoutes);

// Health check route
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'MIVO Backend API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Em produção, serve arquivos estáticos do frontend
if (isProduction) {
  const frontendPath = path.join(__dirname, '../../build');
  app.use(express.static(frontendPath));

  // Todas as rotas que não sejam /api ou /health servem o index.html (SPA routing)
  app.get('*', (req: Request, res: Response) => {
    if (!req.path.startsWith('/api') && req.path !== '/health') {
      res.sendFile(path.join(frontendPath, 'index.html'));
    }
  });
} else {
  // Em desenvolvimento, apenas mostra info da API
  app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      message: 'Welcome to MIVO API 🚀',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        auth: '/api/auth',
        lessons: '/api/lessons',
        users: '/api/users'
      }
    });
  });
}

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: any) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
const startServer = async () => {
  try {
    await syncDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 MIVO Backend running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
