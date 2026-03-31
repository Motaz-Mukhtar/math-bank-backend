import { PrismaClient, Role, QuestionType, QuizCategory, QuizLevel } from '@prisma/client';
import { prisma } from '../../config/database';
import { UpdateUserDto, CreateQuestionDto, UpdateQuestionDto } from './admin.schema';

export class AdminRepository {
  public prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    // Total accounts (exclude admin accounts)
    const totalAccounts = await this.prisma.user.count({
      where: {
        role: {
          not: Role.ADMIN,
        },
      },
    });

    // Total students
    const totalStudents = await this.prisma.user.count({
      where: { role: Role.STUDENT },
    });

    // Total parents
    const totalParents = await this.prisma.user.count({
      where: { role: Role.PARENT },
    });

    // Linked students (students who have at least one parent link)
    const linkedStudents = await this.prisma.user.count({
      where: {
        role: Role.STUDENT,
        childLinks: {
          some: {},
        },
      },
    });

    // Registered this week (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const registeredThisWeek = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: oneWeekAgo,
        },
        role: { not: Role.ADMIN }
      },
    });

    // Highest points
    const topStudent = await this.prisma.points.findFirst({
      orderBy: {
        total: 'desc',
      },
    });

    const highestPoints = topStudent?.total || 0;

    // Average points
    const pointsAggregate = await this.prisma.points.aggregate({
      _avg: {
        total: true,
      },
    });

    const avgPoints = Math.round(pointsAggregate._avg.total || 0);

    return {
      totalAccounts,
      totalStudents,
      totalParents,
      linkedStudents,
      registeredThisWeek,
      highestPoints,
      avgPoints,
    };
  }

  /**
   * Get parent-child link statistics
   */
  async getLinkStats() {
    // Total links
    const totalLinks = await this.prisma.parentChild.count();

    // Linked parents (parents who have at least one child link)
    const linkedParents = await this.prisma.user.count({
      where: {
        role: Role.PARENT,
        parentLinks: {
          some: {},
        },
      },
    });

    // Linked students (students who have at least one parent link)
    const linkedStudents = await this.prisma.user.count({
      where: {
        role: Role.STUDENT,
        childLinks: {
          some: {},
        },
      },
    });

    // Linking rate (percentage of students with parent links)
    const totalStudents = await this.prisma.user.count({
      where: { role: Role.STUDENT },
    });

    const linkingRate = totalStudents > 0 
      ? Math.round((linkedStudents / totalStudents) * 100) 
      : 0;

    return {
      totalLinks,
      linkedParents,
      linkedStudents,
      linkingRate,
    };
  }

  /**
   * Get registration chart data for the past N days
   */
  async getRegistrationChart(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Get all users registered in the past N days
    const users = await this.prisma.user.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
        role: true,
      },
    });

    // Group by date
    const chartData: { [key: string]: { students: number; parents: number } } = {};

    // Initialize all dates with 0
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      chartData[dateStr] = { students: 0, parents: 0 };
    }

    // Count users by date and role
    users.forEach((user: any) => {
      const dateStr = user.createdAt.toISOString().split('T')[0];
      if (chartData[dateStr]) {
        if (user.role === Role.STUDENT) {
          chartData[dateStr].students++;
        } else if (user.role === Role.PARENT) {
          chartData[dateStr].parents++;
        }
      }
    });

    // Convert to array and sort by date
    return Object.entries(chartData)
      .map(([date, counts]) => ({
        date,
        students: counts.students,
        parents: counts.parents,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get top students by points
   */
  async getTopStudents(limit: number = 10) {
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
      take: limit,
    });

    return students.map((student: any) => ({
      id: student.id,
      fullName: student.fullName,
      academicNumber: student.academicNumber,
      total: student.points?.total || 0,
    }));
  }

  /**
   * Get points distribution for histogram
   */
  async getPointsDistribution() {
    const allPoints = await this.prisma.points.findMany({
      select: {
        total: true,
      },
    });

    // Define ranges
    const ranges = [
      { range: '0-50', min: 0, max: 50 },
      { range: '51-100', min: 51, max: 100 },
      { range: '101-200', min: 101, max: 200 },
      { range: '201-500', min: 201, max: 500 },
      { range: '501+', min: 501, max: Infinity },
    ];

    // Count points in each range
    const distribution = ranges.map((r) => ({
      range: r.range,
      count: allPoints.filter(
        (p: any) => p.total >= r.min && p.total <= r.max
      ).length,
    }));

    return distribution;
  }

  /**
   * Get paginated users with optional filters
   */
  async getUsersPaginated(
    page: number,
    limit: number,
    role?: Role,
    search?: string
  ) {
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
        { academicNumber: { contains: search } },
      ];
    }

    // Get total count
    const total = await this.prisma.user.count({ where });

    // Get users
    const users = await this.prisma.user.findMany({
      where: {
        role: { not: Role.ADMIN },
        ...where
      },
      skip,
      take: limit,
      include: {
        points: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      users: users.map((user: any) => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        academicNumber: user.academicNumber,
        points: user.points?.total || 0,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update user
   */
  async updateUser(id: string, dto: UpdateUserDto) {
    // Get user to check role
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    // Update user
    const updates: any = {};

    if (dto.fullName !== undefined) {
      updates.fullName = dto.fullName;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updates,
      include: {
        points: true,
      },
    });

    // Update points if provided and user is STUDENT
    if (dto.points !== undefined && user.role === Role.STUDENT) {
      await this.prisma.points.update({
        where: { userId: id },
        data: {
          total: dto.points,
        },
      });
    }

    return updatedUser;
  }

  /**
   * Delete user (hard delete, cascade handles related records)
   */
  async deleteUser(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Export users for CSV generation
   */
  async exportUsers(type: 'students' | 'parents' | 'all') {
    const where: any = {};

    if (type === 'students') {
      where.role = Role.STUDENT;
    } else if (type === 'parents') {
      where.role = Role.PARENT;
    }

    const users = await this.prisma.user.findMany({
      where,
      include: {
        points: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users.map((user: any) => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      academicNumber: user.academicNumber,
      points: user.points?.total || 0,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    }));
  }

  // ─── Question Management ─────────────────────────────────────────────────────

  /**
   * Create new question
   * Prisma automatically serializes options to JSON
   */
  async createQuestion(dto: CreateQuestionDto) {
    return this.prisma.question.create({
      data: {
        text: dto.text,
        questionType: dto.questionType,
        options: dto.options as any,
        answer: dto.answer,
        category: dto.category,
        level: dto.level,
        points: dto.points,
      },
    });
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
   * Update existing question
   * Prisma automatically serializes options to JSON
   */
  async updateQuestion(id: string, dto: UpdateQuestionDto) {
    const updateData: any = {};

    if (dto.text !== undefined) updateData.text = dto.text;
    if (dto.questionType !== undefined) updateData.questionType = dto.questionType;
    if (dto.options !== undefined) updateData.options = dto.options;
    if (dto.answer !== undefined) updateData.answer = dto.answer;
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.level !== undefined) updateData.level = dto.level;
    if (dto.points !== undefined) updateData.points = dto.points;

    return this.prisma.question.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Get paginated questions with optional filters
   * Prisma automatically parses options from JSON
   */
  async getQuestionsPaginated(
    page: number,
    limit: number,
    questionType?: QuestionType,
    category?: QuizCategory,
    level?: QuizLevel
  ) {
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (questionType) {
      where.questionType = questionType;
    }

    if (category) {
      where.category = category;
    }

    if (level) {
      where.level = level;
    }

    // Get total count
    const total = await this.prisma.question.count({ where });

    // Get questions
    const questions = await this.prisma.question.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      questions,
      total,
    };
  }

  /**
   * Delete question
   */
  async deleteQuestion(id: string) {
    return this.prisma.question.delete({
      where: { id },
    });
  }
}
