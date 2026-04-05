import { PrismaClient, WheelSession, QuizCategory } from '@prisma/client';
import { prisma } from '../../config/database';

interface SaveWheelItemData {
  sessionId: string;
  questionId: string;
  category: QuizCategory;
  userAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
}

export class WheelRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Create new wheel session
   */
  async createSession(userId: string): Promise<WheelSession> {
    return this.prisma.wheelSession.create({
      data: {
        userId,
      },
    });
  }

  /**
   * Get wheel session by ID
   */
  async getSession(sessionId: string) {
    return this.prisma.wheelSession.findUnique({
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
   * Get IDs of questions already asked in this session
   */
  async getAskedQuestionIds(sessionId: string): Promise<string[]> {
    const items = await this.prisma.wheelSessionItem.findMany({
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
   * Save wheel session item (question + answer)
   * Also increments user's points total
   */
  async saveWheelItem(data: SaveWheelItemData): Promise<{ newTotal: number }> {
    return this.prisma.$transaction(async (tx) => {
      // Create wheel session item
      await tx.wheelSessionItem.create({
        data: {
          sessionId: data.sessionId,
          questionId: data.questionId,
          category: data.category,
          userAnswer: data.userAnswer,
          isCorrect: data.isCorrect,
          pointsEarned: data.pointsEarned,
        },
      });

      // Get session to find userId
      const session = await tx.wheelSession.findUnique({
        where: { id: data.sessionId },
        select: { userId: true },
      });

      if (!session) throw new Error('الجلسة غير موجودة');

      // Increment user's points
      const updatedPoints = await tx.points.update({
        where: { userId: session.userId },
        data: {
          total: {
            increment: data.pointsEarned,
          },
        },
      });

      return { newTotal: updatedPoints.total };
    });
  }

  /**
   * Get all questions for a specific category
   * Excludes questions already asked in this session
   */
  async getAvailableQuestions(sessionId: string, category: QuizCategory) {
    const askedQuestionIds = await this.getAskedQuestionIds(sessionId);

    return this.prisma.question.findMany({
      where: {
        category,
        id: {
          notIn: askedQuestionIds,
        },
      },
    });
  }
}
