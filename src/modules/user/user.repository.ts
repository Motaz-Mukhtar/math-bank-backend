import { prisma } from '../../config/database';
import type { UpdateProfileInput } from "./user.schema";
import { Role } from "@prisma/client";

export class UserRepository {
  async findById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        phone: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        academicNumber: true,
        points: {
          select: {
            id: true,
            total: true,
          },
        },
      },
    });
  }

  async updateProfile(userId: string, data: UpdateProfileInput) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        fullName: data.fullName,
        phone: data.phone,
      },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        phone: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        points: {
          select: {
            id: true,
            total: true,
          },
        },
      },
    });
  }

  /**
   * Get user's rank in leaderboard (for STUDENT role only)
   */
  async getUserRank(userId: string): Promise<number | null> {
    // Get all students ordered by points
    const students = await prisma.user.findMany({
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

    // Find user's position
    const index = students.findIndex((student: any) => student.id === userId);
    return index === -1 ? null : index + 1;
  }
}
