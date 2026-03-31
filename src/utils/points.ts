import { QuestionType, QuizLevel } from '@prisma/client';

/**
 * Base point values for each level × questionType combination
 * 
 * Point allocation strategy:
 * - EASY: 5-8 points (simpler question types get lower values)
 * - MEDIUM: 10-14 points (moderate complexity)
 * - HARD: 15-20 points (complex question types get higher values)
 * 
 * Complexity ranking by question type:
 * 1. MCQ - Simplest (select from 4 options)
 * 2. FILL_BLANK - Simple input
 * 3. VISUAL_MCQ - Visual recognition
 * 4. CLOCK_READ - Time reading skills
 * 5. MATCHING - Connect 4 pairs
 * 6. SORT_ORDER - Arrange items in order
 */
const POINT_VALUES: Record<QuizLevel, Record<QuestionType, number>> = {
  [QuizLevel.EASY]: {
    [QuestionType.MCQ]: 5,
    [QuestionType.FILL_BLANK]: 6,
    [QuestionType.VISUAL_MCQ]: 6,
    [QuestionType.CLOCK_READ]: 7,
    [QuestionType.MATCHING]: 8,
    [QuestionType.SORT_ORDER]: 8,
  },
  [QuizLevel.MEDIUM]: {
    [QuestionType.MCQ]: 10,
    [QuestionType.FILL_BLANK]: 11,
    [QuestionType.VISUAL_MCQ]: 12,
    [QuestionType.CLOCK_READ]: 13,
    [QuestionType.MATCHING]: 13,
    [QuestionType.SORT_ORDER]: 14,
  },
  [QuizLevel.HARD]: {
    [QuestionType.MCQ]: 15,
    [QuestionType.FILL_BLANK]: 18,
    [QuestionType.VISUAL_MCQ]: 17,
    [QuestionType.CLOCK_READ]: 18,
    [QuestionType.MATCHING]: 19,
    [QuestionType.SORT_ORDER]: 20,
  },
};

/**
 * Get the default point value for a question based on its level and type
 * 
 * @param level - The difficulty level (EASY, MEDIUM, HARD)
 * @param questionType - The type of question (MCQ, FILL_BLANK, etc.)
 * @returns The default point value for this combination
 * 
 * @example
 * getDefaultPoints(QuizLevel.EASY, QuestionType.MCQ) // returns 5
 * getDefaultPoints(QuizLevel.HARD, QuestionType.FILL_BLANK) // returns 18
 */
export function getDefaultPoints(level: QuizLevel, questionType: QuestionType): number {
  return POINT_VALUES[level][questionType];
}
