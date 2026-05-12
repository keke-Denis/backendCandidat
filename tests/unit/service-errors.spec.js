import { afterAll, afterEach, beforeAll, describe, expect, it } from '@jest/globals';
import { clearMemoryDatabase, connectMemoryDatabase, disconnectMemoryDatabase } from '../utils/memory-db';
import { getCandidateById, softDeleteCandidate, updateCandidatePartially, validateCandidateAsync } from '../../src/services/candidat.service';
beforeAll(async () => {
    await connectMemoryDatabase();
});
afterEach(async () => {
    await clearMemoryDatabase();
});
afterAll(async () => {
    await disconnectMemoryDatabase();
});
describe('service error branches', () => {
    it('rejette un identifiant invalide', async () => {
        await expect(getCandidateById('invalid-id')).rejects.toMatchObject({
            statusCode: 400
        });
    });
    it('retourne 404 si candidat absent a la lecture', async () => {
        await expect(getCandidateById('507f1f77bcf86cd799439011')).rejects.toMatchObject({
            statusCode: 404
        });
    });
    it('retourne 404 si candidat absent a la mise a jour', async () => {
        await expect(updateCandidatePartially('507f1f77bcf86cd799439011', { poste: 'Lead' })).rejects.toMatchObject({
            statusCode: 404
        });
    });
    it('retourne 404 si candidat absent a la suppression', async () => {
        await expect(softDeleteCandidate('507f1f77bcf86cd799439011')).rejects.toMatchObject({
            statusCode: 404
        });
    });
    it('retourne 404 si candidat absent a la validation', async () => {
        await expect(validateCandidateAsync('507f1f77bcf86cd799439011')).rejects.toMatchObject({
            statusCode: 404
        });
    }, 30000);
});
