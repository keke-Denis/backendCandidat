export const buildCandidatePayload = (overrides = {}) => ({
    nom: 'Rakoto',
    prenom: 'Aina',
    email: 'aina.rakoto@example.com',
    telephone: '+261 34 12 345 67',
    poste: 'Backend Developer',
    annee_experience: 4,
    competence: ['Node.js', 'TypeScript'],
    commentaire: 'Profil solide',
    ...overrides
});
