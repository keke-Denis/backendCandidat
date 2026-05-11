import { NextFunction, Request, Response } from 'express';

export const prepareCandidateBody = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (req.file) {
    req.body.fichier = req.file.path;
  }

  next();
};
