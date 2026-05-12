import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import authRouter from './routes/auth.routes';
import candidateRouter from './routes/candidat.routes';
import { logger } from './config/logger';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { apiRateLimiter } from './middlewares/rate-limit.middleware';
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use((req, _res, next) => {
    logger.info({
        method: req.method,
        path: req.originalUrl
    }, 'Requete entrante');
    next();
});
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});
app.use('/api', apiRateLimiter);
app.use('/api/auth', authRouter);
app.use('/api/candidates', candidateRouter);
app.use(notFoundHandler);
app.use(errorHandler);
export default app;
// --- IGNORE --- //
