import { Request, Response } from 'express';
import { logger } from '../config/logger';
import {
  createCandidate,
  getCandidateById,
  listCandidates,
  softDeleteCandidate,
  updateCandidatePartially,
  validateCandidateAsync
} from '../services/candidat.service';
import { listCandidatesQuerySchema } from '../validations/candidat.validation';

const getRouteId = (value: string | string[]): string => {
  return Array.isArray(value) ? value[0] : value;
};

export const creerCandidat = async (req: Request, res: Response): Promise<void> => {
  const candidat = await createCandidate(req.body);
  logger.info({ candidateId: candidat.id, user: req.user?.username }, 'Candidat cree');
  res.status(201).json({
    message: 'Candidat cree avec succes',
    data: candidat
  });
};

export const listerCandidats = async (req: Request, res: Response): Promise<void> => {
  const query = listCandidatesQuerySchema.parse(req.query);
  const result = await listCandidates(query);
  res.status(200).json({
    message: 'Liste des candidats recuperee avec succes',
    data: result
  });
};

export const recupererCandidat = async (req: Request, res: Response): Promise<void> => {
  const candidat = await getCandidateById(getRouteId(req.params.id));
  res.status(200).json({
    message: 'Candidat recupere avec succes',
    data: candidat
  });
};

export const mettreAJourPartiel = async (req: Request, res: Response): Promise<void> => {
  const candidat = await updateCandidatePartially(getRouteId(req.params.id), req.body);
  logger.info(
    { candidateId: candidat.id, user: req.user?.username },
    'Candidat mis a jour'
  );
  res.status(200).json({
    message: 'Candidat mis a jour avec succes',
    data: candidat
  });
};

export const suppressionDouce = async (req: Request, res: Response): Promise<void> => {
  const candidateId = getRouteId(req.params.id);
  await softDeleteCandidate(candidateId);
  logger.info({ candidateId, user: req.user?.username }, 'Candidat supprime');
  res.status(200).json({
    message: 'Candidat supprime avec succes'
  });
};

export const validerCandidat = async (req: Request, res: Response): Promise<void> => {
  const candidat = await validateCandidateAsync(getRouteId(req.params.id));
  logger.info(
    { candidateId: candidat.id, user: req.user?.username },
    'Candidat valide apres verification asynchrone'
  );
  res.status(200).json({
    message: 'Candidat valide avec succes',
    data: candidat
  });
};
