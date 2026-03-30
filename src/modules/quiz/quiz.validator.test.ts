import { describe, it, expect } from 'vitest';
import { QuestionType } from '@prisma/client';
import { validateAnswer } from './quiz.validator';

describe('validateAnswer', () => {
  describe('MCQ validation', () => {
    it('should return true for exact match', () => {
      const result = validateAnswer(QuestionType.MCQ, 'Option A', 'Option A');
      expect(result).toBe(true);
    });

    it('should return true when trimming whitespace', () => {
      const result = validateAnswer(QuestionType.MCQ, '  Option A  ', 'Option A');
      expect(result).toBe(true);
    });

    it('should return false for incorrect answer', () => {
      const result = validateAnswer(QuestionType.MCQ, 'Option B', 'Option A');
      expect(result).toBe(false);
    });

    it('should be case-sensitive', () => {
      const result = validateAnswer(QuestionType.MCQ, 'option a', 'Option A');
      expect(result).toBe(false);
    });
  });

  describe('FILL_BLANK validation', () => {
    it('should return true for exact match', () => {
      const result = validateAnswer(QuestionType.FILL_BLANK, '42', '42');
      expect(result).toBe(true);
    });

    it('should return true when trimming whitespace', () => {
      const result = validateAnswer(QuestionType.FILL_BLANK, '  42  ', '42');
      expect(result).toBe(true);
    });

    it('should return false for incorrect answer', () => {
      const result = validateAnswer(QuestionType.FILL_BLANK, '43', '42');
      expect(result).toBe(false);
    });

    it('should handle fraction answers', () => {
      const result = validateAnswer(QuestionType.FILL_BLANK, '1/2', '1/2');
      expect(result).toBe(true);
    });
  });

  describe('VISUAL_MCQ validation', () => {
    it('should return true for correct index', () => {
      const result = validateAnswer(QuestionType.VISUAL_MCQ, '2', '2');
      expect(result).toBe(true);
    });

    it('should return true when trimming whitespace', () => {
      const result = validateAnswer(QuestionType.VISUAL_MCQ, '  1  ', '1');
      expect(result).toBe(true);
    });

    it('should return false for incorrect index', () => {
      const result = validateAnswer(QuestionType.VISUAL_MCQ, '0', '3');
      expect(result).toBe(false);
    });
  });

  describe('CLOCK_READ validation', () => {
    it('should return true for exact match', () => {
      const result = validateAnswer(QuestionType.CLOCK_READ, '3:30', '3:30');
      expect(result).toBe(true);
    });

    it('should return true when trimming whitespace', () => {
      const result = validateAnswer(QuestionType.CLOCK_READ, '  3:30  ', '3:30');
      expect(result).toBe(true);
    });

    it('should return false for incorrect time', () => {
      const result = validateAnswer(QuestionType.CLOCK_READ, '3:45', '3:30');
      expect(result).toBe(false);
    });
  });

  describe('SORT_ORDER validation', () => {
    it('should return true for exact match', () => {
      const result = validateAnswer(QuestionType.SORT_ORDER, 'A,B,C', 'A,B,C');
      expect(result).toBe(true);
    });

    it('should return false for different order', () => {
      const result = validateAnswer(QuestionType.SORT_ORDER, 'B,A,C', 'A,B,C');
      expect(result).toBe(false);
    });

    it('should NOT trim whitespace (exact equality)', () => {
      const result = validateAnswer(QuestionType.SORT_ORDER, '  A,B,C  ', 'A,B,C');
      expect(result).toBe(false);
    });

    it('should be case-sensitive', () => {
      const result = validateAnswer(QuestionType.SORT_ORDER, 'a,b,c', 'A,B,C');
      expect(result).toBe(false);
    });
  });

  describe('MATCHING validation', () => {
    it('should return true for correct pairs in same order', () => {
      const userAnswer = 'A:1|B:2|C:3|D:4';
      const correctAnswer = 'A:1|B:2|C:3|D:4';
      const result = validateAnswer(QuestionType.MATCHING, userAnswer, correctAnswer);
      expect(result).toBe(true);
    });

    it('should return true for correct pairs in different order', () => {
      const userAnswer = 'B:2|A:1|D:4|C:3';
      const correctAnswer = 'A:1|B:2|C:3|D:4';
      const result = validateAnswer(QuestionType.MATCHING, userAnswer, correctAnswer);
      expect(result).toBe(true);
    });

    it('should return false for incorrect pairs', () => {
      const userAnswer = 'A:2|B:1|C:3|D:4';
      const correctAnswer = 'A:1|B:2|C:3|D:4';
      const result = validateAnswer(QuestionType.MATCHING, userAnswer, correctAnswer);
      expect(result).toBe(false);
    });

    it('should return false for missing pairs', () => {
      const userAnswer = 'A:1|B:2|C:3';
      const correctAnswer = 'A:1|B:2|C:3|D:4';
      const result = validateAnswer(QuestionType.MATCHING, userAnswer, correctAnswer);
      expect(result).toBe(false);
    });

    it('should handle whitespace in pairs', () => {
      const userAnswer = ' A : 1 | B : 2 | C : 3 | D : 4 ';
      const correctAnswer = 'A:1|B:2|C:3|D:4';
      const result = validateAnswer(QuestionType.MATCHING, userAnswer, correctAnswer);
      expect(result).toBe(true);
    });

    it('should return false for malformed pairs', () => {
      const userAnswer = 'A:1|B2|C:3|D:4';
      const correctAnswer = 'A:1|B:2|C:3|D:4';
      const result = validateAnswer(QuestionType.MATCHING, userAnswer, correctAnswer);
      expect(result).toBe(false);
    });

    it('should handle Arabic text in pairs', () => {
      const userAnswer = 'واحد:1|اثنان:2|ثلاثة:3|أربعة:4';
      const correctAnswer = 'واحد:1|اثنان:2|ثلاثة:3|أربعة:4';
      const result = validateAnswer(QuestionType.MATCHING, userAnswer, correctAnswer);
      expect(result).toBe(true);
    });
  });

  describe('Unrecognized question type', () => {
    it('should return false for unknown question type', () => {
      // @ts-expect-error Testing invalid question type
      const result = validateAnswer('UNKNOWN_TYPE', 'answer', 'answer');
      expect(result).toBe(false);
    });
  });
});
