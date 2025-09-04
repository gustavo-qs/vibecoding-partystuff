import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import { CONFIG } from './constants';

export const configureExpress = (app: express.Application) => {
  // Segurança
  app.use(helmet());
  app.use(compression());

  // CORS
  app.use(cors({
    origin: CONFIG.CORS_ORIGIN,
    credentials: true
  }));

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: CONFIG.RATE_LIMIT_WINDOW * 60 * 1000, // minutos
    max: CONFIG.RATE_LIMIT_MAX_REQUESTS, // requests por janela
    message: 'Too many requests from this IP, please try again later.'
  });
  app.use('/api/', limiter);

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });
};
