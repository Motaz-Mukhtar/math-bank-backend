import { PrismaClient, Role } from '@prisma/client';
import { prisma } from '../../config/database';

export class ParentRepository {
  public prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        points: true,
      },
    });
  }

  /**
   * Check if parent-child link already exists
   */
  async linkExists(parentId: string, childId: string): Promise<boolean> {
    const link = await this.prisma.parentChild.findUnique({
      where: {
        parentId_childId: {
          parentId,
          childId,
        },
      },
    });

    return link !== null;
  }

  /**
   * Create parent-child link
   */
  async createLink(parentId: string, childId: string) {
    return this.prisma.parentChild.create({
      data: {
        parentId,
        childId,
      },
    });
  }

  /**
   * Get all children linked to a parent
   */
  async getLinksByParent(parentId: string) {
    return this.prisma.parentChild.findMany({
      where: { parentId },
      include: {
        child: {
          include: {
            points: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get specific parent-child link
   */
  async getLink(parentId: string, childId: string) {
    return this.prisma.parentChild.findUnique({
      where: {
        parentId_childId: {
          parentId,
          childId,
        },
      },
    });
  }

  /**
   * Get child's quiz session history
   */
  async getChildQuizHistory(childId: string, limit: number = 10) {
    return this.prisma.quizSession.findMany({
      where: {
        userId: childId,
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

  /**
   * Get child's rank in leaderboard
   */
  async getChildRank(childId: string): Promise<number | null> {
    // Get all students ordered by points
    const students = await this.prisma.user.findMany({
      where: {
        role: Role.STUDENT,
      },
      include: {
        points: true,
      },
      orderBy: {
        points: {
          total: 'desc',
        },
      },
    });

    // Find child's position
    const index = students.findIndex((student: any) => student.id === childId);
    return index === -1 ? null : index + 1;
  }
}
