import { z } from 'zod';

const competenceSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmedValue = value.trim();

    if (trimmedValue.startsWith('[')) {
      try {
        return JSON.parse(trimmedValue);
      } catch (_error) {
        return value;
      }
    }

    return trimmedValue
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  },
  z.array(z.string().trim().min(1, 'Une competence ne peut pas etre vide')).min(1, 'Au moins une competence est requise')
);

export const createCandidateSchema = z.object({
  nom: z
    .string({ error: 'Le nom est requis' })
    .trim()
    .min(2, 'Le nom doit contenir au moins 2 caracteres'),
  prenom: z
    .string({ error: 'Le prenom est requis' })
    .trim()
    .min(2, 'Le prenom doit contenir au moins 2 caracteres'),
  email: z
    .string({ error: "L'email est requis" })
    .trim()
    .email("Le format de l'email est invalide")
    .transform((value) => value.toLowerCase()),
  telephone: z
    .string({ error: 'Le telephone est requis' })
    .trim()
    .regex(/^\+?[0-9 ]{8,20}$/, 'Le format du telephone est invalide'),
  poste: z
    .string({ error: 'Le poste est requis' })
    .trim()
    .min(2, 'Le poste doit contenir au moins 2 caracteres'),
  annee_experience: z
    .coerce.number({ error: "L'annee d'experience est requise" })
    .min(0, "L'experience ne peut pas etre negative")
    .max(60, "L'experience ne peut pas depasser 60 ans"),
  competence: competenceSchema,
  fichier: z.string().trim().min(1, 'Le fichier est invalide').optional(),
  commentaire: z
    .string()
    .trim()
    .max(1000, 'Le commentaire ne doit pas depasser 1000 caracteres')
    .optional()
});

export const updateCandidateSchema = createCandidateSchema
  .partial()
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'Au moins un champ doit etre fourni pour la mise a jour'
  });

export const listCandidatesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  statut: z.enum(['valide', 'non_valide']).optional(),
  search: z.string().trim().optional()
});

export type CreateCandidatInput = z.infer<typeof createCandidateSchema>;
export type UpdateCandidatInput = z.infer<typeof updateCandidateSchema>;
export type ListCandidatesQuery = z.infer<typeof listCandidatesQuerySchema>;
