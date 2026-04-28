import { Router } from 'express';
import type { HealthCheckResponse } from '@attendance-tracker/shared-types';
import { APP_VERSION } from '@attendance-tracker/config';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  const response: HealthCheckResponse = {
    status: 'ok',
    service: 'notification-service',
    version: APP_VERSION,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
  res.json(response);
});
