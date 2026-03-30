import { QuestionType } from '@prisma/client';

/**
 * Validates a user's answer against the correct answer based on question type.
 * 
 * @param questionType - The type of question being validated
 * @param userAnswer - The answer submitted by the user
 * @param correctAnswer - The correct answer stored in the database
 * @returns true if the answer is correct, false otherwise
 */
export function validateAnswer(
  questionType: QuestionType,
  userAnswer: string,
  correctAnswer: string
): boolean {
  switch (questionType) {
    case QuestionType.MCQ:
      return userAnswer.trim() === correctAnswer.trim();

    case QuestionType.FILL_BLANK:
      return userAnswer.trim() === correctAnswer.trim();

    case QuestionType.VISUAL_MCQ:
      return userAnswer.trim() === correctAnswer.trim();

    case QuestionType.CLOCK_READ:
      return userAnswer.trim() === correctAnswer.trim();

    case QuestionType.SORT_ORDER:
      return userAnswer === correctAnswer;

    case QuestionType.MATCHING:
      return validateMatchingAnswer(userAnswer, correctAnswer);

    default:
      return false;
  }
}

/**
 * Validates a MATCHING question answer by parsing pipe-separated pairs,
 * sorting by left value, and comparing for equality.
 * 
 * @param userAnswer - The user's answer in format "left1:right1|left2:right2|..."
 * @param correctAnswer - The correct answer in the same format
 * @returns true if the sorted pairs match, false otherwise
 */
function validateMatchingAnswer(userAnswer: string, correctAnswer: string): boolean {
  try {
    // Parse user answer
    const userPairs = userAnswer.split('|').map(pair => {
      const [left, right] = pair.split(':');
      return { left: left?.trim() || '', right: right?.trim() || '' };
    });

    // Parse correct answer
    const correctPairs = correctAnswer.split('|').map(pair => {
      const [left, right] = pair.split(':');
      return { left: left?.trim() || '', right: right?.trim() || '' };
    });

    // Sort both arrays by left value
    const sortedUserPairs = userPairs.sort((a, b) => a.left.localeCompare(b.left));
    const sortedCorrectPairs = correctPairs.sort((a, b) => a.left.localeCompare(b.left));

    // Check if lengths match
    if (sortedUserPairs.length !== sortedCorrectPairs.length) {
      return false;
    }

    // Compare each pair
    return sortedUserPairs.every((userPair, index) => {
      const correctPair = sortedCorrectPairs[index];
      return userPair.left === correctPair.left && userPair.right === correctPair.right;
    });
  } catch (error) {
    // If parsing fails, return false
    return false;
  }
}
