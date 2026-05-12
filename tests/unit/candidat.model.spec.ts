import { afterAll, afterEach, beforeAll, describe, expect, it } from '@jest/globals';
import { CandidatModel } from '../../src/models/candidat.model';
import {
  clearMemoryDatabase,
  connectMemoryDatabase,
  disconnectMemoryDatabase
} from '../utils/memory-db';
import { buildCandidatePayload } from '../fixtures/candidate.fixture';

beforeAll(async () => {
  await connectMemoryDatabase();
});

afterEach(async () => {
  await clearMemoryDatabase();
});

afterAll(async () => {
  await disconnectMemoryDatabase();
});

describe('candidat.model', () => {
  it('applique les valeurs par defaut', async () => {
    const candidat = await CandidatModel.create(buildCandidatePayload());

    expect(candidat.statut).toBe('pending');
    expect(candidat.est_supprime).toBe(false);
  });

  it("refuse un email duplique", async () => {
    await CandidatModel.create(buildCandidatePayload());

    await expect(CandidatModel.create(buildCandidatePayload())).rejects.toMatchObject({
      code: 11000
    });
  });
});
