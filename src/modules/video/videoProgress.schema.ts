import { z } from 'zod';

/**
 * Schema for updating video progress
 */
export const updateProgressSchema = z.object({
  watchedDuration: z.number().int().min(0).describe('Watched duration in seconds'),
  totalDuration: z.number().int().min(1).describe('Total video duration in seconds'),
  progressPercent: z.number().int().min(0).max(100).describe('Progress percentage (0-100)'),
});

export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;