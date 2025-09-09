import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import { CONFIG } from './constants';
import { logWithContext } from '../utils/logger';
import { httpLogger } from '../middleware/http-logger';

export const configureExpress = (app: express.Application) => {
  logWithContext.info('🔧 Configuring Express middlewares...');

  // Segurança - Configurado para permitir CORS
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", CONFIG.CORS_ORIGIN],
      },
    },
  }));
  logWithContext.debug('🛡️ Helmet security middleware configured with CORS support');

  app.use(compression());
  logWithContext.debug('🗜️ Compression middleware configured');

  // CORS - Configurado para desenvolvimento
  const corsOptions = {
    origin: function (origin: string | undefined, callback: Function) {
      // Permitir requests sem origin (como mobile apps, curl requests)
      if (!origin) return callback(null, true);

      // Permitir localhost em qualquer porta para desenvolvimento
      if (origin.match(/^http:\/\/localhost:\d+$/)) {
        return callback(null, true);
      }

      // Permitir a origem configurada
      if (origin === CONFIG.CORS_ORIGIN) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  };

  app.use(cors(corsOptions));
  logWithContext.debug('🌐 CORS middleware configured', {
    origin: 'localhost:* and ' + CONFIG.CORS_ORIGIN,
    credentials: true,
    allowedMethods: corsOptions.methods
  });

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: CONFIG.RATE_LIMIT_WINDOW * 60 * 1000, // minutos
    max: CONFIG.RATE_LIMIT_MAX_REQUESTS, // requests por janela
    message: 'Too many requests from this IP, please try again later.'
  });
  app.use('/api/', limiter);
  logWithContext.debug('⚡ Rate limiting configured', {
    windowMs: CONFIG.RATE_LIMIT_WINDOW * 60 * 1000,
    maxRequests: CONFIG.RATE_LIMIT_MAX_REQUESTS
  });

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  logWithContext.debug('📝 JSON body parser configured', {
    limit: '10mb'
  });

  app.use(express.urlencoded({ extended: true }));
  logWithContext.debug('📝 URL-encoded body parser configured', {
    extended: true
  });

  // HTTP Request/Response Logger
  app.use('/api', httpLogger);
  logWithContext.debug('📋 HTTP request/response logger configured for /api routes');

  // Health check
  app.get('/health', (req, res) => {
    const healthData = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: CONFIG.NODE_ENV,
      version: '1.0.0'
    };

    logWithContext.debug('💓 Health check requested', {
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    res.status(200).json(healthData);
  });

  logWithContext.info('✅ Express configuration completed');
};
