import { z } from 'zod';

export const loginSchema = z.object({
  username: z
    .string({ error: 'Le nom utilisateur est requis' })
    .trim()
    .min(3, 'Le nom utilisateur doit contenir au moins 3 caracteres'),
  password: z
    .string({ error: 'Le mot de passe est requis' })
    .min(6, 'Le mot de passe doit contenir au moins 6 caracteres')
});

export type LoginInput = z.infer<typeof loginSchema>;
