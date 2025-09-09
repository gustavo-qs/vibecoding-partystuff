import { Request, Response, NextFunction } from 'express';
import { logWithContext } from '../utils/logger';

export const httpLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Log da requisição
  logWithContext.http(`📨 ${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    headers: {
      'content-type': req.get('content-type'),
      'authorization': req.get('authorization') ? '[PRESENT]' : '[NOT PRESENT]'
    },
    body: req.method !== 'GET' ? req.body : undefined
  });

  // Capturar a resposta
  const originalSend = res.send;
  const originalJson = res.json;

  let responseBody: any;

  // Override do método send
  res.send = function(body: any) {
    responseBody = body;
    return originalSend.call(this, body);
  };

  // Override do método json
  res.json = function(body: any) {
    responseBody = body;
    return originalJson.call(this, body);
  };

  // Quando a resposta terminar
  res.on('finish', () => {
    const duration = Date.now() - start;

    logWithContext.http(`📤 ${req.method} ${req.originalUrl} - ${res.statusCode}`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      responseSize: res.get('Content-Length'),
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      responseBody: responseBody
    });

    // Log adicional para erros
    if (res.statusCode >= 400) {
      logWithContext.warn(`⚠️ HTTP Error Response`, {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        error: responseBody
      });
    }

    // Log para respostas de sucesso importantes
    if (res.statusCode >= 200 && res.statusCode < 300) {
      logWithContext.debug(`✅ HTTP Success Response`, {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`
      });
    }
  });

  next();
};
