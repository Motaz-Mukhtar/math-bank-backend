import { describe, it, expect } from 'vitest';
import { QuestionType, QuizLevel } from '@prisma/client';
import { getDefaultPoints } from './points';

describe('getDefaultPoints', () => {
  describe('Requirement 13.1: Base point values for each combination', () => {
    it('should return a valid point value for all level × questionType combinations', () => {
      const levels = Object.values(QuizLevel);
      const questionTypes = Object.values(QuestionType);

      levels.forEach(level => {
        questionTypes.forEach(questionType => {
          const points = getDefaultPoints(level, questionType);
          expect(points).toBeGreaterThan(0);
          expect(Number.isInteger(points)).toBe(true);
        });
      });
    });
  });

  describe('Requirement 13.2: EASY + MCQ = 5 points', () => {
    it('should return 5 points for EASY MCQ questions', () => {
      const points = getDefaultPoints(QuizLevel.EASY, QuestionType.MCQ);
      expect(points).toBe(5);
    });
  });

  describe('Requirement 13.3: EASY + MATCHING = 8 points', () => {
    it('should return 8 points for EASY MATCHING questions', () => {
      const points = getDefaultPoints(QuizLevel.EASY, QuestionType.MATCHING);
      expect(points).toBe(8);
    });
  });

  describe('Requirement 13.4: MEDIUM + SORT_ORDER = 14 points', () => {
    it('should return 14 points for MEDIUM SORT_ORDER questions', () => {
      const points = getDefaultPoints(QuizLevel.MEDIUM, QuestionType.SORT_ORDER);
      expect(points).toBe(14);
    });
  });

  describe('Requirement 13.5: HARD + FILL_BLANK = 18 points', () => {
    it('should return 18 points for HARD FILL_BLANK questions', () => {
      const points = getDefaultPoints(QuizLevel.HARD, QuestionType.FILL_BLANK);
      expect(points).toBe(18);
    });
  });

  describe('Point progression validation', () => {
    it('should have increasing points as difficulty increases for each question type', () => {
      const questionTypes = Object.values(QuestionType);

      questionTypes.forEach(questionType => {
        const easyPoints = getDefaultPoints(QuizLevel.EASY, questionType);
        const mediumPoints = getDefaultPoints(QuizLevel.MEDIUM, questionType);
        const hardPoints = getDefaultPoints(QuizLevel.HARD, questionType);

        expect(mediumPoints).toBeGreaterThan(easyPoints);
        expect(hardPoints).toBeGreaterThan(mediumPoints);
      });
    });
  });

  describe('Question type complexity validation', () => {
    it('should have MCQ as the lowest points for EASY level', () => {
      const questionTypes = Object.values(QuestionType);
      const mcqPoints = getDefaultPoints(QuizLevel.EASY, QuestionType.MCQ);

      questionTypes.forEach(questionType => {
        const points = getDefaultPoints(QuizLevel.EASY, questionType);
        expect(points).toBeGreaterThanOrEqual(mcqPoints);
      });
    });

    it('should have SORT_ORDER as one of the highest points for each level', () => {
      const sortOrderEasy = getDefaultPoints(QuizLevel.EASY, QuestionType.SORT_ORDER);
      const sortOrderMedium = getDefaultPoints(QuizLevel.MEDIUM, QuestionType.SORT_ORDER);
      const sortOrderHard = getDefaultPoints(QuizLevel.HARD, QuestionType.SORT_ORDER);

      // SORT_ORDER should be among the highest for each level
      expect(sortOrderEasy).toBeGreaterThanOrEqual(7);
      expect(sortOrderMedium).toBeGreaterThanOrEqual(13);
      expect(sortOrderHard).toBeGreaterThanOrEqual(18);
    });
  });
});
