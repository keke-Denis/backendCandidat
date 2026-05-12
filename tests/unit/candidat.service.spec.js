import { afterAll, afterEach, beforeAll, describe, expect, it, jest } from '@jest/globals';
import { CandidatModel } from '../../src/models/candidat.model';
import { createCandidate, getCandidateById, listCandidates, rejectCandidate, softDeleteCandidate, updateCandidatePartially, validateCandidateAsync } from '../../src/services/candidat.service';
import { clearMemoryDatabase, connectMemoryDatabase, disconnectMemoryDatabase } from '../utils/memory-db';
import { buildCandidatePayload } from '../fixtures/candidate.fixture';
beforeAll(async () => {
    await connectMemoryDatabase();
});
afterEach(async () => {
    jest.restoreAllMocks();
    await clearMemoryDatabase();
});
afterAll(async () => {
    await disconnectMemoryDatabase();
});
describe('candidat.service', () => {
    it('cree un candidat', async () => {
        const candidat = await createCandidate(buildCandidatePayload());
        const serialized = candidat.toJSON();
        expect(candidat.id).toBe(1);
        expect(serialized._id).toBeUndefined();
        expect(candidat.nom).toBe('Rakoto');
        expect(candidat.statut).toBe('pending');
    });
    it('retourne un candidat par id', async () => {
        const created = await CandidatModel.create(buildCandidatePayload());
        const candidat = await getCandidateById(String(created._id));
        expect(String(candidat._id)).toBe(String(created._id));
    });
    it('retourne un candidat par id auto-incremente', async () => {
        const created = await createCandidate(buildCandidatePayload());
        const candidat = await getCandidateById(String(created.id));
        expect(candidat.id).toBe(created.id);
    });
    it('met a jour partiellement un candidat', async () => {
        const created = await createCandidate(buildCandidatePayload());
        const updated = await updateCandidatePartially(String(created.id), {
            poste: 'Tech Lead'
        });
        expect(updated.poste).toBe('Tech Lead');
    });
    it('supprime logiquement un candidat', async () => {
        const created = await createCandidate(buildCandidatePayload());
        await softDeleteCandidate(String(created.id));
        const deleted = await CandidatModel.findById(created._id);
        expect(deleted?.est_supprime).toBe(true);
    });
    it('valide un candidat apres delai asynchrone', async () => {
        const created = await createCandidate(buildCandidatePayload());
        const validated = await validateCandidateAsync(String(created.id));
        expect(validated.statut).toBe('interviewed');
    }, 30000);
    it('refuse un candidat', async () => {
        const created = await createCandidate(buildCandidatePayload());
        const rejected = await rejectCandidate(String(created.id));
        expect(rejected.statut).toBe('rejected');
    });
    it('liste les candidats avec pagination', async () => {
        await createCandidate(buildCandidatePayload());
        await createCandidate(buildCandidatePayload({
            email: 'second@example.com',
            nom: 'Randria',
            prenom: 'Tiana'
        }));
        const result = await listCandidates({ page: 1, limit: 1 });
        expect(result.items).toHaveLength(1);
        expect(result.pagination.total).toBe(2);
    });
});
