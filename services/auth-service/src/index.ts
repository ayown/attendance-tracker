import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { SERVICE_PORTS, APP_VERSION } from '@attendance-tracker/config';
import { healthRouter } from './routes/health.routes.js';
import { authRouter } from './routes/auth.routes.js';

const app = express();
const PORT = SERVICE_PORTS.AUTH;

app.use(helmet());
app.use(cors({ origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/health', healthRouter);
app.use('/api/auth', authRouter);

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
);

app.listen(PORT, () => {
  console.info(`[auth-service] running on port ${PORT} — v${APP_VERSION}`);
});

export default app;
