import dotenv from 'dotenv';
import { z } from 'zod';
dotenv.config();
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    MONGO_URI: z.string().min(1, 'MONGO_URI est requis'),
    JWT_SECRET: z.string().min(10, 'JWT_SECRET doit contenir au moins 10 caracteres'),
    JWT_EXPIRES_IN: z.string().default('1h'),
    AUTH_USERNAME: z.string().default('admin@gmail.com'),
    AUTH_PASSWORD: z.string().default('admin123'),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100)
});
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    throw new Error(`Variables d'environnement invalides: ${parsedEnv.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ')}`);
}
export const env = parsedEnv.data;
