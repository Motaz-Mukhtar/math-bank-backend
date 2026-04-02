import { z } from 'zod';

export const linkChildSchema = z.object({
  academicNumber: z
    .string()
    .regex(/^std-\d{10}$/, 'الرقم الأكاديمي غير صالح — يجب أن يكون بصيغة std-XXXXXXXXXX'),
});

export type LinkChildDto = z.infer<typeof linkChildSchema>;
