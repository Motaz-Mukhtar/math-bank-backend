import { PrismaClient, User, Role } from '@prisma/client';
import { prisma } from '../../config/database';
import { findUniqueAcademicNumber } from '../../services/academic.service';

interface CreateUserData {
  fullName: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: Role;
  verifyCode: string;
  verifyCodeExp: Date;
}

export class AuthRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Find user by email - returns full user including passwordHash for internal use
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find user by academic number
   */
  async findByAcademicNumber(academicNumber: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { academicNumber },
    });
  }

  /**
   * Find user by ID - returns full user
   */
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Create user with atomic transaction
   * - Generates academic number if STUDENT
   * - Creates Points record if STUDENT
   * - Creates ParentChild link if PARENT and childId provided
   */
  async createUser(data: CreateUserData, childId?: string): Promise<User> {
    return this.prisma.$transaction(async (tx) => {
      // Generate academic number if STUDENT
      let academicNumber: string | undefined;
      if (data.role === Role.STUDENT) {
        academicNumber = await findUniqueAcademicNumber(tx as PrismaClient);
      }

      // Create user
      const user = await tx.user.create({
        data: {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          passwordHash: data.passwordHash,
          role: data.role,
          academicNumber,
          verifyCode: data.verifyCode,
          verifyCodeExp: data.verifyCodeExp,
        },
      });

      // Create Points record if STUDENT
      if (data.role === Role.STUDENT) {
        await tx.points.create({
          data: {
            userId: user.id,
            total: 0,
          },
        });
      }

      // Create ParentChild link if PARENT and childId provided
      if (data.role === Role.PARENT && childId) {
        await tx.parentChild.create({
          data: {
            parentId: user.id,
            childId: childId,
          },
        });
      }

      return user;
    });
  }

  /**
   * Update verification code and expiry
   */
  async updateVerifyCode(
    userId: string,
    code: string,
    exp: Date
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        verifyCode: code,
        verifyCodeExp: exp,
      },
    });
  }

  /**
   * Mark user as verified and clear verification code
   */
  async markVerified(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isVerified: true,
        verifyCode: null,
        verifyCodeExp: null,
      },
    });
  }

  /**
   * Update password reset code and expiry
   */
  async updateResetCode(
    userId: string,
    code: string,
    exp: Date
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        resetCode: code,
        resetCodeExp: exp,
      },
    });
  }

  /**
   * Update password and clear reset code
   */
  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        resetCode: null,
        resetCodeExp: null,
      },
    });
  }
}
