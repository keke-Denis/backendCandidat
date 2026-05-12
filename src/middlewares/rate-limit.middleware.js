import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
export const apiRateLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.NODE_ENV === 'development' ? 999999 : env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => env.NODE_ENV === 'development',
    message: {
        message: 'Trop de requetes, reessayez plus tard.'
    }
});
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: env.NODE_ENV === 'development' ? 999999 : 5,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => env.NODE_ENV === 'development',
    message: {
        message: "Trop de tentatives d'authentification, reessayez plus tard."
    }
});
