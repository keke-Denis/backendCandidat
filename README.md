# Backend Candidates API

API Node.js + Express + TypeScript + MongoDB pour la gestion des candidats.

## Fonctionnalites backend

- JWT obligatoire sur les routes `/api/candidates`
- Rate limiting global et renforce sur `/api/auth/login`
- Validation stricte Zod avec messages personnalises
- Soft delete sur la suppression
- Validation asynchrone a 2 secondes sur `POST /api/candidates/:id/validate`
- Logs structures avec Pino
- Liste paginee et filtrable pour supporter le frontend

## Endpoints

- `POST /api/auth/login`
- `GET /health`
- `GET /api/candidates`
- `POST /api/candidates`
- `GET /api/candidates/:id`
- `PUT /api/candidates/:id`
- `DELETE /api/candidates/:id`
- `POST /api/candidates/:id/validate`

## Base URL API

En local :

```text
http://localhost:3000
```

Base URL complete pour les routes metier :

```text
http://localhost:3000/api
```

## Entite Candidat

Structure retournee par l'API pour un candidat :

```json
{
  "id": 1,
  "nom": "Rakoto",
  "prenom": "Aina",
  "email": "aina.rakoto@example.com",
  "telephone": "+261341234567",
  "poste": "Backend Developer",
  "annee_experience": 4,
  "competence": ["Node.js", "TypeScript"],
  "statut": "non_valide",
  "fichier": "uploads\\candidates\\1710000000000-cv.pdf",
  "commentaire": "Profil solide",
  "est_supprime": false,
  "createdAt": "2026-05-12T10:00:00.000Z",
  "updatedAt": "2026-05-12T10:00:00.000Z"
}
```

Champs utiles pour le frontend :

- `id` : identifiant auto-incremente a utiliser dans les URLs
- `nom` : nom du candidat
- `prenom` : prenom du candidat
- `email` : email unique
- `telephone` : numero de telephone
- `poste` : poste vise
- `annee_experience` : nombre d'annees d'experience
- `competence` : tableau des competences
- `statut` : `non_valide` ou `valide`
- `fichier` : chemin du fichier upload
- `commentaire` : commentaire libre
- `createdAt` : date de creation
- `updatedAt` : date de mise a jour

## Authentification

Login :

```http
POST /api/auth/login
```

Body JSON :

```json
{
  "username": "admin",
  "password": "admin123"
}
```

Reponse :

```json
{
  "token": "jwt_token"
}
```

Pour toutes les routes `/api/candidates`, ajouter le header :

```http
Authorization: Bearer <token>
```

## URLs API Pour Le Frontend

### 1. Health Check

```http
GET /health
```

Reponse :

```json
{
  "status": "ok"
}
```

### 2. Login

```http
POST /api/auth/login
```

Content-Type :

```text
application/json
```

### 3. Liste Des Candidats

```http
GET /api/candidates
```

Query params disponibles :

- `page`
- `limit`
- `statut`
- `search`

Exemple :

```http
GET /api/candidates?page=1&limit=10&statut=non_valide&search=aina
```

Reponse :

```json
{
  "message": "Liste des candidats recuperee avec succes",
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 0,
      "totalPages": 1
    }
  }
}
```

### 4. Detail D'un Candidat

```http
GET /api/candidates/:id
```

Exemple :

```http
GET /api/candidates/1
```

### 5. Creation D'un Candidat

```http
POST /api/candidates
```

Content-Type :

```text
multipart/form-data
```

Champs a envoyer :

- `nom`
- `prenom`
- `email`
- `telephone`
- `poste`
- `annee_experience`
- `competence`
- `commentaire`
- `fichier` en type `File`

Exemple pour `competence` :

```text
Node.js,TypeScript,MongoDB
```

Reponse :

```json
{
  "message": "Candidat cree avec succes",
  "data": {
    "id": 1
  }
}
```

### 6. Mise A Jour D'un Candidat

```http
PUT /api/candidates/:id
```

Content-Type :

```text
multipart/form-data
```

Tous les champs sont optionnels sur la mise a jour, mais il faut en envoyer au moins un.

### 7. Suppression D'un Candidat

```http
DELETE /api/candidates/:id
```

Reponse :

```json
{
  "message": "Candidat supprime avec succes"
}
```

### 8. Validation D'un Candidat

```http
POST /api/candidates/:id/validate
```

Cette route met `statut` a `valide` apres environ 2 secondes.

Reponse :

```json
{
  "message": "Candidat valide avec succes",
  "data": {
    "id": 1,
    "statut": "valide"
  }
}
```

## Installation

```bash
npm install
npm run dev
```

Variables d'environnement :

```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/candidates_db
JWT_SECRET=super_secret_jwt_key
JWT_EXPIRES_IN=1h
AUTH_USERNAME=admin
AUTH_PASSWORD=admin123
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

## Docker

```bash
docker-compose up --build
```

## Strategie de tests backend

- Unitaires : services et modele Mongoose
- Integration : Supertest + MongoDB en memoire
- Charge : fichier `load-test.yml` pour Artillery
- Securite : scenarios documentes dans `security-tests.md`

## Commandes utiles

```bash
npm run lint
npm run typecheck
npm test
npm run test:unit
npm run test:integration
```

## CI/CD

- Husky pre-commit : lint, typecheck, tests relies aux fichiers modifies
- GitHub Actions : lint, typecheck, tests, couverture, blocage si seuil < 90%
