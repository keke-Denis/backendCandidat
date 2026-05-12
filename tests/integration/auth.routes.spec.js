import { describe, expect, it } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app';
import { env } from '../../src/config/env';
describe('auth routes - security', () => {
    it("rejette une tentative d'injection SQL sur l'authentification", async () => {
        const response = await request(app).post('/api/auth/login').send({
            username: "' OR '1'='1",
            password: "' OR '1'='1"
        });
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Identifiants invalides');
    });
    it('authentifie un utilisateur valide', async () => {
        const response = await request(app).post('/api/auth/login').send({
            username: env.AUTH_USERNAME,
            password: env.AUTH_PASSWORD
        });
        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();
    });
    it("freine les tentatives d'authentification abusives", async () => {
        const attempts = Array.from({ length: 6 }, () => request(app).post('/api/auth/login').send({
            username: 'wrong@example.com',
            password: 'wrongpassword'
        }));
        const responses = await Promise.all(attempts);
        expect(responses[responses.length - 1]?.status).toBe(429);
        expect(responses[responses.length - 1]?.body.message).toBe("Trop de tentatives d'authentification, reessayez plus tard.");
    });
});
