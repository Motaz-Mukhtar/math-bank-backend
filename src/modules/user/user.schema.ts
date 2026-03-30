import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(1, "الاسم الكامل مطلوب").max(100, "الاسم طويل جداً").optional(),
    phone: z.string().regex(/^\+?[0-9]{10,15}$/, "رقم الهاتف غير صحيح").optional(),
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];
