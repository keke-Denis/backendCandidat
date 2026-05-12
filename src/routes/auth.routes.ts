import { Router } from 'express';
import { login } from '../controllers/auth.controller';
import { authRateLimiter } from '../middlewares/rate-limit.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { loginSchema } from '../validations/auth.validation';
import { asyncHandler } from '../utils/async-handler';

const authRouter = Router();

authRouter.post('/login', authRateLimiter, validateBody(loginSchema), asyncHandler(login));

export default authRouter;
