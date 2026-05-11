import mongoose from 'mongoose';
import { CandidatModel } from '../models/candidat.model';
import { CounterModel } from '../models/counter.model';
import {
  CreateCandidatInput,
  UpdateCandidatInput
} from '../validations/candidat.validation';
import { ApiError } from '../utils/api-error';

const findCandidateFilter = (id: string): Record<string, string | number | boolean> => {
  if (/^\d+$/.test(id)) {
    return { id: Number(id), est_supprime: false };
  }

  if (mongoose.isValidObjectId(id)) {
    return { _id: id, est_supprime: false };
  }

  throw new ApiError(400, 'Identifiant invalide');
};

const getNextCandidateId = async (): Promise<number> => {
  const counter = await CounterModel.findOneAndUpdate(
    { key: 'candidate_id' },
    { $inc: { seq: 1 } },
    {
      upsert: true,
      returnDocument: 'after',
      setDefaultsOnInsert: true
    }
  );

  return counter.seq;
};

export const createCandidate = async (
  payload: CreateCandidatInput
)=> {
  const candidate = await CandidatModel.create({
    ...payload,
    id: await getNextCandidateId()
  });
  return candidate;
};

export const getCandidateById = async (id: string) => {
  const candidate = await CandidatModel.findOne(findCandidateFilter(id));

  if (!candidate) {
    throw new ApiError(404, 'Candidat introuvable');
  }

  return candidate;
};

export const updateCandidatePartially = async (id: string, payload: UpdateCandidatInput) => {
  const candidate = await CandidatModel.findOneAndUpdate(
    findCandidateFilter(id),
    payload,
    {
      returnDocument: 'after',
      runValidators: true
    }
  );

  if (!candidate) {
    throw new ApiError(404, 'Candidat introuvable');
  }

  return candidate;
};

export const softDeleteCandidate = async (id: string): Promise<void> => {
  const candidate = await CandidatModel.findOneAndUpdate(
    findCandidateFilter(id),
    { est_supprime: true },
    { returnDocument: 'after' }
  );

  if (!candidate) {
    throw new ApiError(404, 'Candidat introuvable');
  }
};

export const validateCandidateAsync = async (id: string) => {
  await new Promise((resolve) => {
    setTimeout(resolve, 2000);
  });

  const candidate = await CandidatModel.findOneAndUpdate(
    findCandidateFilter(id),
    { statut: 'valide' },
    { returnDocument: 'after', runValidators: true }
  );

  if (!candidate) {
    throw new ApiError(404, 'Candidat introuvable');
  }

  return candidate;
};

export const listCandidates = async ({
  page = 1,
  limit = 10,
  statut,
  search
}: {
  page?: number;
  limit?: number;
  statut?: string;
  search?: string;
}) => {
  const filters: Record<string, unknown> = {
    est_supprime: false
  };

  if (statut) {
    filters.statut = statut;
  }

  if (search) {
    filters.$or = [
      { nom: { $regex: search, $options: 'i' } },
      { prenom: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { poste: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    CandidatModel.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit),
    CandidatModel.countDocuments(filters)
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1
    }
  };
};
