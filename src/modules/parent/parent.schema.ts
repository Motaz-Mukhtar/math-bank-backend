import { z } from 'zod';

export const linkChildSchema = z.object({
  childEmail: z.string().email('البريد الإلكتروني غير صالح'),
});

export type LinkChildDto = z.infer<typeof linkChildSchema>;
