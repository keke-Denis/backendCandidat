import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { authentifierJWT } from '../../src/middlewares/auth.middleware';
import { errorHandler, notFoundHandler } from '../../src/middlewares/error.middleware';
import { validateBody } from '../../src/middlewares/validate.middleware';
import { ApiError } from '../../src/utils/api-error';
import { asyncHandler } from '../../src/utils/async-handler';
import { createCandidateSchema } from '../../src/validations/candidat.validation';

const createResponseMock = () => {
  const res: {
    status: ReturnType<typeof jest.fn>;
    json: ReturnType<typeof jest.fn>;
    send: ReturnType<typeof jest.fn>;
  } = {
    status: jest.fn(),
    json: jest.fn(),
    send: jest.fn()
  };

  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  res.send.mockReturnValue(res);

  return res;
};

describe('middlewares', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('refuse une requete sans token', () => {
    const req = { headers: {} };
    const res = createResponseMock();
    const next = jest.fn();

    authentifierJWT(req as never, res as never, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('refuse un token invalide', () => {
    const req = { headers: { authorization: 'Bearer invalid' } };
    const res = createResponseMock();
    const next = jest.fn();

    authentifierJWT(req as never, res as never, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('accepte un token valide', () => {
    const verifySpy = jest
      .spyOn(require('jsonwebtoken'), 'verify')
      .mockReturnValue({ sub: '1', username: 'admin' });
    const req = { headers: { authorization: 'Bearer valid-token' } } as {
      headers: { authorization: string };
      user?: { sub: string; username: string };
    };
    const res = createResponseMock();
    const next = jest.fn();

    authentifierJWT(req as never, res as never, next);

    expect(verifySpy).toHaveBeenCalled();
    expect(req.user?.username).toBe('admin');
    expect(next).toHaveBeenCalled();
  });

  it('valide un body conforme', () => {
    const middleware = validateBody(createCandidateSchema);
    const req = {
      body: {
        nom: 'Rakoto',
        prenom: 'Aina',
        email: 'aina@example.com',
        telephone: '+261341234567',
        poste: 'Backend Developer',
        annee_experience: '3',
        competence: 'Node.js,TypeScript'
      }
    };
    const res = createResponseMock();
    const next = jest.fn();

    middleware(req as never, res as never, next);

    expect(next).toHaveBeenCalled();
    expect(req.body.annee_experience).toBe(3);
    expect(req.body.competence).toEqual(['Node.js', 'TypeScript']);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('rejette un body invalide', () => {
    const middleware = validateBody(createCandidateSchema);
    const req = { body: { nom: 'A' } };
    const res = createResponseMock();
    const next = jest.fn();

    middleware(req as never, res as never, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('retourne une 404 sur route inconnue', () => {
    const req = { method: 'GET', originalUrl: '/missing' };
    const res = createResponseMock();

    notFoundHandler(req as never, res as never);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('gere une ApiError', () => {
    const req = { method: 'POST', originalUrl: '/api/candidates' };
    const res = createResponseMock();

    errorHandler(new ApiError(409, 'Conflit'), req as never, res as never, jest.fn());

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Conflit',
      details: undefined
    });
  });

  it('gere une ZodError', () => {
    const req = { method: 'POST', originalUrl: '/api/candidates' };
    const res = createResponseMock();
    const zodError = new ZodError([
      {
        code: 'custom',
        path: ['nom'],
        message: 'Nom invalide'
      }
    ]);

    errorHandler(zodError, req as never, res as never, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('gere un CastError Mongoose', () => {
    const req = { method: 'GET', originalUrl: '/api/candidates/invalid' };
    const res = createResponseMock();
    const castError = new mongoose.Error.CastError('ObjectId', 'invalid', '_id');

    errorHandler(castError, req as never, res as never, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('gere une ValidationError Mongoose', () => {
    const req = { method: 'POST', originalUrl: '/api/candidates' };
    const res = createResponseMock();
    const validationError = new mongoose.Error.ValidationError();
    validationError.addError(
      'email',
      new mongoose.Error.ValidatorError({
        path: 'email',
        message: 'Email invalide'
      })
    );

    errorHandler(validationError, req as never, res as never, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('gere une erreur de duplication Mongo', () => {
    const req = { method: 'POST', originalUrl: '/api/candidates' };
    const res = createResponseMock();

    errorHandler({ code: 11000 }, req as never, res as never, jest.fn());

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('gere une erreur inconnue', () => {
    const req = { method: 'GET', originalUrl: '/api/fail' };
    const res = createResponseMock();

    errorHandler(new Error('Boom'), req as never, res as never, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('propage les erreurs avec asyncHandler', async () => {
    const next = jest.fn();
    const wrapped = asyncHandler(async () => {
      throw new Error('async failure');
    });

    wrapped({} as never, {} as never, next);
    await new Promise((resolve) => setImmediate(resolve));

    expect(next).toHaveBeenCalled();
  });
});
