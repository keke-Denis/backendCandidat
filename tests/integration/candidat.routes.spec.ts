import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  jest
} from '@jest/globals';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../../src/app';
import { env } from '../../src/config/env';
import {
  clearMemoryDatabase,
  connectMemoryDatabase,
  disconnectMemoryDatabase
} from '../utils/memory-db';
import { buildCandidatePayload } from '../fixtures/candidate.fixture';

const token = jwt.sign(
  {
    sub: 'test-user',
    username: 'tester'
  },
  env.JWT_SECRET,
  { expiresIn: '1h' }
);

const authHeader = {
  Authorization: `Bearer ${token}`
};

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

describe('candidate routes', () => {
  it('cree un candidat', async () => {
    const payload = buildCandidatePayload();
    const response = await request(app)
      .post('/api/candidates')
      .set(authHeader)
      .field('nom', payload.nom)
      .field('prenom', payload.prenom)
      .field('email', payload.email)
      .field('telephone', payload.telephone)
      .field('poste', payload.poste)
      .field('annee_experience', String(payload.annee_experience))
      .field('competence', payload.competence.join(','))
      .field('commentaire', payload.commentaire ?? '')
      .attach('fichier', Buffer.from('fake cv content'), 'cv.pdf');

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Candidat cree avec succes');
    expect(response.body.data.id).toBe(1);
    expect(response.body.data._id).toBeUndefined();
    expect(response.body.data.email).toBe('aina.rakoto@example.com');
    expect(response.body.data.fichier).toContain('uploads');
  });

  it('refuse une requete sans token', async () => {
    const response = await request(app).get('/api/candidates');

    expect(response.status).toBe(401);
  });

  it('retourne la liste paginee', async () => {
    await request(app).post('/api/candidates').set(authHeader).send(buildCandidatePayload());

    const response = await request(app).get('/api/candidates?page=1&limit=10').set(authHeader);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Liste des candidats recuperee avec succes');
    expect(response.body.data.pagination.total).toBe(1);
  });

  it('recupere un candidat par id', async () => {
    const created = await request(app)
      .post('/api/candidates')
      .set(authHeader)
      .send(buildCandidatePayload());

    const response = await request(app)
      .get(`/api/candidates/${created.body.data.id}`)
      .set(authHeader);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Candidat recupere avec succes');
    expect(response.body.data.id).toBe(created.body.data.id);
    expect(response.body.data._id).toBeUndefined();
  });

  it('met a jour partiellement un candidat', async () => {
    const created = await request(app)
      .post('/api/candidates')
      .set(authHeader)
      .send(buildCandidatePayload());

    const response = await request(app)
      .put(`/api/candidates/${created.body.data.id}`)
      .set(authHeader)
      .send({ poste: 'Engineering Manager' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Candidat mis a jour avec succes');
    expect(response.body.data.poste).toBe('Engineering Manager');
  });

  it('supprime logiquement un candidat', async () => {
    const created = await request(app)
      .post('/api/candidates')
      .set(authHeader)
      .send(buildCandidatePayload());

    const response = await request(app)
      .delete(`/api/candidates/${created.body.data.id}`)
      .set(authHeader);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Candidat supprime avec succes');
  });

  it('valide un candidat de facon asynchrone', async () => {
    const created = await request(app)
      .post('/api/candidates')
      .set(authHeader)
      .send(buildCandidatePayload());

    const response = await request(app)
      .post(`/api/candidates/${created.body.data.id}/validate`)
      .set(authHeader);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Candidat valide avec succes');
    expect(response.body.data.statut).toBe('valide');
  }, 30000);

  it('authentifie un utilisateur', async () => {
    const response = await request(app).post('/api/auth/login').send({
      username: env.AUTH_USERNAME,
      password: env.AUTH_PASSWORD
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  it("freine les tentatives d'authentification abusives", async () => {
    const attempts = Array.from({ length: 6 }, () =>
      request(app).post('/api/auth/login').send({
        username: 'wrong',
        password: 'wrongpassword'
      })
    );

    const responses = await Promise.all(attempts);
    expect(responses[responses.length - 1]?.status).toBe(429);
  });
});
