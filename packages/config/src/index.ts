export const SERVICE_PORTS = {
  AUTH: parseInt(process.env['AUTH_SERVICE_PORT'] ?? '3001'),
  USER: parseInt(process.env['USER_SERVICE_PORT'] ?? '3002'),
  ATTENDANCE: parseInt(process.env['ATTENDANCE_SERVICE_PORT'] ?? '3003'),
  SCHEDULE: parseInt(process.env['SCHEDULE_SERVICE_PORT'] ?? '3004'),
  NOTIFICATION: parseInt(process.env['NOTIFICATION_SERVICE_PORT'] ?? '3005'),
  WEB: parseInt(process.env['WEB_PORT'] ?? '3000'),
} as const;

export const SERVICE_URLS = {
  AUTH: process.env['AUTH_SERVICE_URL'] ?? `http://localhost:${SERVICE_PORTS.AUTH}`,
  USER: process.env['USER_SERVICE_URL'] ?? `http://localhost:${SERVICE_PORTS.USER}`,
  ATTENDANCE:
    process.env['ATTENDANCE_SERVICE_URL'] ?? `http://localhost:${SERVICE_PORTS.ATTENDANCE}`,
  SCHEDULE: process.env['SCHEDULE_SERVICE_URL'] ?? `http://localhost:${SERVICE_PORTS.SCHEDULE}`,
  NOTIFICATION:
    process.env['NOTIFICATION_SERVICE_URL'] ?? `http://localhost:${SERVICE_PORTS.NOTIFICATION}`,
} as const;

export const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  QR_CODE_EXPIRY: 30,
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const APP_VERSION = '1.0.0';
