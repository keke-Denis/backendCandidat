import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../utils/api-error';

export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body as { username: string; password: string };

  if (username !== env.AUTH_USERNAME || password !== env.AUTH_PASSWORD) {
    throw new ApiError(401, 'Identifiants invalides');
  }

  const token = jwt.sign(
    {
      sub: 'backend-user',
      username
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] }
  );

  res.status(200).json({
    token
  });
};
