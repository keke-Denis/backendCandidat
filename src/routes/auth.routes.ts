import { Router } from 'express';
import { login } from '../controllers/auth.controller';
import { authRateLimiter } from '../middlewares/rate-limit.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { loginSchema } from '../validations/auth.validation';

const authRouter = Router();

authRouter.post('/login', authRateLimiter, validateBody(loginSchema), login);

export default authRouter;
