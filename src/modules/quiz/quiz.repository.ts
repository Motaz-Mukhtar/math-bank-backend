import { PrismaClient, QuizSession, QuizCategory, QuizLevel } from '@prisma/client';
import { prisma } from '../../config/database';

interface CreateSessionData {
  userId: string;
  category: QuizCategory;
  level: QuizLevel;
}

interface SaveQuizItemData {
  sessionId: string;
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
}

export class QuizRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Create new quiz session
   */
  async createSession(data: CreateSessionData): Promise<QuizSession> {
    return this.prisma.quizSession.create({
      data: {
        userId: data.userId,
        category: data.category,
        level: data.level,
      },
    });
  }

  /**
   * Get quiz session by ID with all items and questions
   */
  async getSession(sessionId: string) {
    return this.prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: {
        items: {
          include: {
            question: true,
          },
        },
      },
    });
  }

  /**
   * Get random questions for a specific category and level
   * Limited to specified count
   * Note: Prisma automatically parses the 'options' field from JSON to object
   */
  async getRandomQuestions(
    category: QuizCategory,
    level: QuizLevel,
    limit: number
  ) {
    // Get all questions matching criteria
    const allQuestions = await this.prisma.question.findMany({
      where: {
        category,
        level,
      },
    });

    // Shuffle and take first 'limit' questions
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  }

  /**
   * Get IDs of questions already answered in this session
   */
  async getAnsweredQuestionIds(sessionId: string): Promise<string[]> {
    const items = await this.prisma.quizSessionItem.findMany({
      where: { sessionId },
      select: { questionId: true },
    });

    return items.map((item) => item.questionId);
  }

  /**
   * Get question by ID
   */
  async getQuestionById(id: string) {
    return this.prisma.question.findUnique({
      where: { id },
    });
  }

  /**
   * Save quiz session item (question + answer)
   * Also increments session totalScore and user's points
   */
  async saveQuizItem(data: SaveQuizItemData): Promise<{ newTotal: number; sessionScore: number }> {
    return this.prisma.$transaction(async (tx) => {
      // Create quiz session item
      await tx.quizSessionItem.create({
        data: {
          sessionId: data.sessionId,
          questionId: data.questionId,
          userAnswer: data.userAnswer,
          isCorrect: data.isCorrect,
          pointsEarned: data.pointsEarned,
        },
      });

      // Update session totalScore
      const updatedSession = await tx.quizSession.update({
        where: { id: data.sessionId },
        data: {
          totalScore: {
            increment: data.pointsEarned,
          },
        },
      });

      // Get session to find userId
      const session = await tx.quizSession.findUnique({
        where: { id: data.sessionId },
        select: { userId: true },
      });

      if (!session) {
        throw new Error('Session not found');
      }

      // Increment user's points
      const updatedPoints = await tx.points.update({
        where: { userId: session.userId },
        data: {
          total: {
            increment: data.pointsEarned,
          },
        },
      });

      return {
        newTotal: updatedPoints.total,
        sessionScore: updatedSession.totalScore,
      };
    });
  }

  /**
   * Mark session as complete
   */
  async completeSession(sessionId: string) {
    return this.prisma.quizSession.update({
      where: { id: sessionId },
      data: {
        isComplete: true,
        completedAt: new Date(),
      },
      include: {
        items: true,
      },
    });
  }

  /**
   * Get user's quiz session history
   * Returns completed sessions ordered by completion date
   */
  async getUserHistory(userId: string, limit: number = 10) {
    return this.prisma.quizSession.findMany({
      where: {
        userId,
        isComplete: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: limit,
      include: {
        items: true,
      },
    });
  }
}
