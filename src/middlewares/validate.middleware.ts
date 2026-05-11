import { NextFunction, Request, Response } from 'express';
import { ZodType } from 'zod';

export const validateBody =
  <T>(schema: ZodType<T>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        message: 'Validation echouee',
        details: result.error.issues.map((issue) => ({
          champ: issue.path.join('.'),
          message: issue.message
        }))
      });
      return;
    }

    req.body = result.data;
    next();
  };
