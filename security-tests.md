# Tests de securite

## Injection "SQL" / NoSQL via API

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
