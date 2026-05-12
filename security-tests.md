# Tests de securite

## Phases du test

1. Préparation
   - Démarrer l'API en local avec `npm run dev` ou via Docker.
   - Vérifier que l'environnement contient les variables requises (`MONGO_URI`, `JWT_SECRET`, `AUTH_USERNAME`, `AUTH_PASSWORD`).
   - S'assurer que le backend est accessible sur `http://localhost:3000`.

2. Exécution
   - Injection NoSQL/SQL : envoyer des payloads malveillants vers `POST /api/candidates`.
   - Brute force : envoyer plusieurs tentatives de `POST /api/auth/login` avec des identifiants invalides.

3. Validation
   - Contrôler la réponse `400` ou `401` pour les injections / entrées invalides.
   - Contrôler la réponse `429` après dépassement du seuil sur la route d'authentification.
   - Vérifier que la route `/api/auth/login` fonctionne normalement avec des identifiants valides.

4. Rapport
   - Documenter les résultats de chaque scénario.
   - Noter les éventuelles erreurs ou comportements inattendus.

Exemple de charge malveillante a verifier sur `POST /api/candidates` :

```json
{
  "nom": { "$ne": null },
  "prenom": "Attacker",
  "email": "evil@example.com",
  "telephone": "+261341234567",
  "poste": "Tester",
  "annee_experience": 1,
  "competence": ["NoSQL"]
}
```

Resultat attendu : rejet en `400`, grace a la validation Zod stricte.

## Brute force authentification

Exemple :

```bash
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"wrong","password":"wrongpassword"}'
done
```

Resultat attendu : blocage `429` apres depassement du seuil.
