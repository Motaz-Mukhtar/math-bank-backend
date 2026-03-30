import { PrismaClient, Role } from '@prisma/client';
import { prisma } from '../../config/database';
import { LeaderboardEntry, CurrentUserRank } from '../../types';

export class LeaderboardRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Get top students ordered by points
   * Returns array with rank, userId, fullName, academicNumber, points
   */
  async getTopStudents(limit: number = 10): Promise<LeaderboardEntry[]> {
    const students = await this.prisma.user.findMany({
      where: {
        role: Role.STUDENT,
        isVerified: true,
      },
      select: {
        id: true,
        fullName: true,
        academicNumber: true,
        points: {
          select: {
            total: true,
          },
        },
      },
      orderBy: {
        points: {
          total: 'desc',
        },
      },
      take: limit,
    });

    return students.map((student: any, index: any) => ({
      rank: index + 1,
      userId: student.id,
      fullName: student.fullName,
      academicNumber: student.academicNumber,
      points: student.points?.total || 0,
    }));
  }

  /**
   * Get rank and points for a specific student
   * Returns null if user is not a STUDENT or not found
   */
  async getUserRank(userId: string): Promise<CurrentUserRank | null> {
    // First check if user is a STUDENT
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        isVerified: true,
        points: {
          select: {
            total: true,
          },
        },
      },
    });

    if (!user || user.role !== Role.STUDENT || !user.isVerified) {
      return null;
    }

    const userPoints = user.points?.total || 0;

    // Count how many students have more points
    const higherRankedCount = await this.prisma.user.count({
      where: {
        role: Role.STUDENT,
        isVerified: true,
        points: {
          total: {
            gt: userPoints,
          },
        },
      },
    });

    return {
      rank: higherRankedCount + 1,
      points: userPoints,
    };
  }
}
