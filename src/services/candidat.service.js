import mongoose from 'mongoose';
import { CandidatModel } from '../models/candidat.model';
import { CounterModel } from '../models/counter.model';
import { ApiError } from '../utils/api-error';
const findCandidateFilter = (id) => {
    if (/^\d+$/.test(id)) {
        return { id: Number(id), est_supprime: false };
    }
    if (mongoose.isValidObjectId(id)) {
        return { _id: id, est_supprime: false };
    }
    throw new ApiError(400, 'Identifiant invalide');
};
const getNextCandidateId = async () => {
    const counter = await CounterModel.findOneAndUpdate({ key: 'candidate_id' }, { $inc: { seq: 1 } }, {
        upsert: true,
        returnDocument: 'after',
        setDefaultsOnInsert: true
    });
    return counter.seq;
};
export const createCandidate = async (payload) => {
    const candidate = await CandidatModel.create({
        ...payload,
        id: await getNextCandidateId()
    });
    return candidate;
};
export const getCandidateById = async (id) => {
    const candidate = await CandidatModel.findOne(findCandidateFilter(id));
    if (!candidate) {
        throw new ApiError(404, 'Candidat introuvable');
    }
    return candidate;
};
export const updateCandidatePartially = async (id, payload) => {
    const candidate = await CandidatModel.findOneAndUpdate(findCandidateFilter(id), { $set: payload }, {
        returnDocument: 'after',
        runValidators: false
    });
    if (!candidate) {
        throw new ApiError(404, 'Candidat introuvable');
    }
    return candidate;
};
export const softDeleteCandidate = async (id) => {
    const candidate = await CandidatModel.findOneAndUpdate(findCandidateFilter(id), { est_supprime: true }, { returnDocument: 'after' });
    if (!candidate) {
        throw new ApiError(404, 'Candidat introuvable');
    }
};
export const validateCandidateAsync = async (id) => {
    await new Promise((resolve) => {
        setTimeout(resolve, 2000);
    });
    const candidate = await CandidatModel.findOneAndUpdate(findCandidateFilter(id), { statut: 'interviewed' }, { returnDocument: 'after', runValidators: true });
    if (!candidate) {
        throw new ApiError(404, 'Candidat introuvable');
    }
    return candidate;
};
export const rejectCandidate = async (id) => {
    const candidate = await CandidatModel.findOneAndUpdate(findCandidateFilter(id), { statut: 'rejected' }, { returnDocument: 'after', runValidators: true });
    if (!candidate) {
        throw new ApiError(404, 'Candidat introuvable');
    }
    return candidate;
};
export const listCandidates = async ({ page = 1, limit = 10, statut, search }) => {
    const filters = {
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
