import { z } from 'zod';
import { Role } from '@prisma/client';

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, 'الاسم الكامل يجب أن يكون حرفين على الأقل')
    .max(100, 'الاسم الكامل طويل جداً'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  phone: z.string().optional(),
  password: z
    .string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .max(100, 'كلمة المرور طويلة جداً'),
  role: z.enum([Role.STUDENT, Role.PARENT], {
    errorMap: () => ({ message: 'نوع الحساب غير صالح' }),
  }),
  childAcademicNumber: z.string().optional(),
});

export const verifyEmailSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  code: z
    .string()
    .length(6, 'رمز التحقق يجب أن يكون 6 أرقام')
    .regex(/^\d+$/, 'رمز التحقق يجب أن يحتوي على أرقام فقط'),
});

export const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  code: z
    .string()
    .length(6, 'رمز إعادة التعيين يجب أن يكون 6 أرقام')
    .regex(/^\d+$/, 'رمز إعادة التعيين يجب أن يحتوي على أرقام فقط'),
  newPassword: z
    .string()
    .min(8, 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل')
    .max(100, 'كلمة المرور الجديدة طويلة جداً'),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
