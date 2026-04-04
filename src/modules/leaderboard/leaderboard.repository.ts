import { PrismaClient, Role, QuizCategory } from '@prisma/client';
import { prisma } from '../../config/database';
import { LeaderboardEntry, CurrentUserRank } from '../../types';

function getWeekStart(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun … 6=Sat
  const daysSinceSaturday = (dayOfWeek + 1) % 7;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - daysSinceSaturday);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

export class LeaderboardRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  // ─── Top students (main page) ───────────────────────────────────────────────

  async getTopStudents(limit = 10): Promise<LeaderboardEntry[]> {
    const students = await this.prisma.user.findMany({
      where: { role: Role.STUDENT, isVerified: true },
      select: {
        id: true,
        fullName: true,
        academicNumber: true,
        points: { select: { total: true } },
      },
      orderBy: { points: { total: 'desc' } },
      take: limit,
    });

    return students.map((s: any, i: number) => ({
      rank: i + 1,
      userId: s.id,
      fullName: s.fullName,
      academicNumber: s.academicNumber,
      points: s.points?.total || 0,
    }));
  }

  // ─── Full paginated leaderboard ─────────────────────────────────────────────

  async getFullLeaderboard(
    page: number,
    limit: number
  ): Promise<{ entries: LeaderboardEntry[]; total: number }> {
    const skip = (page - 1) * limit;

    const [students, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { role: Role.STUDENT, isVerified: true },
        select: {
          id: true,
          fullName: true,
          academicNumber: true,
          points: { select: { total: true } },
        },
        orderBy: { points: { total: 'desc' } },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where: { role: Role.STUDENT, isVerified: true } }),
    ]);

    const entries: LeaderboardEntry[] = students.map((s: any, i: number) => ({
      rank: skip + i + 1,
      userId: s.id,
      fullName: s.fullName,
      academicNumber: s.academicNumber,
      points: s.points?.total || 0,
    }));

    return { entries, total };
  }

  // ─── Weekly paginated leaderboard ──────────────────────────────────────────

  async getWeeklyLeaderboard(
    page: number,
    limit: number
  ): Promise<{ entries: LeaderboardEntry[]; total: number }> {
    const weekStart = getWeekStart();
    const skip = (page - 1) * limit;

    // Aggregate points from quiz + wheel sessions this week
    const [quizPoints, wheelPoints] = await Promise.all([
      this.prisma.quizSessionItem.groupBy({
        by: ['sessionId'],
        _sum: { pointsEarned: true },
        where: { session: { createdAt: { gte: weekStart } } },
      }),
      this.prisma.wheelSessionItem.groupBy({
        by: ['sessionId'],
        _sum: { pointsEarned: true },
        where: { session: { createdAt: { gte: weekStart } } },
      }),
    ]);

    // Map sessionId → userId for quiz sessions
    const quizSessionIds = quizPoints.map((r: any) => r.sessionId);
    const wheelSessionIds = wheelPoints.map((r: any) => r.sessionId);

    const [quizSessions, wheelSessions] = await Promise.all([
      quizSessionIds.length
        ? this.prisma.quizSession.findMany({
            where: { id: { in: quizSessionIds } },
            select: { id: true, userId: true },
          })
        : Promise.resolve([]),
      wheelSessionIds.length
        ? this.prisma.wheelSession.findMany({
            where: { id: { in: wheelSessionIds } },
            select: { id: true, userId: true },
          })
        : Promise.resolve([]),
    ]);

    // Accumulate per-user weekly points
    const userPoints = new Map<string, number>();

    for (const row of quizPoints) {
      const session = quizSessions.find((s: any) => s.id === row.sessionId);
      if (!session) continue;
      userPoints.set(session.userId, (userPoints.get(session.userId) || 0) + (row._sum.pointsEarned || 0));
    }
    for (const row of wheelPoints) {
      const session = wheelSessions.find((s: any) => s.id === row.sessionId);
      if (!session) continue;
      userPoints.set(session.userId, (userPoints.get(session.userId) || 0) + (row._sum.pointsEarned || 0));
    }

    if (userPoints.size === 0) return { entries: [], total: 0 };

    // Fetch user details for all active users
    const userIds = Array.from(userPoints.keys());
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds }, role: Role.STUDENT, isVerified: true },
      select: { id: true, fullName: true, academicNumber: true },
    });

    // Sort by weekly points desc
    const sorted = users
      .map((u: any) => ({ ...u, weeklyPoints: userPoints.get(u.id) || 0 }))
      .sort((a: any, b: any) => b.weeklyPoints - a.weeklyPoints);

    const total = sorted.length;
    const page_entries = sorted.slice(skip, skip + limit);

    const entries: LeaderboardEntry[] = page_entries.map((u: any, i: number) => ({
      rank: skip + i + 1,
      userId: u.id,
      fullName: u.fullName,
      academicNumber: u.academicNumber,
      points: u.weeklyPoints,
    }));

    return { entries, total };
  }

  // ─── User rank (global) ─────────────────────────────────────────────────────

  async getUserRank(userId: string): Promise<CurrentUserRank | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, isVerified: true, points: { select: { total: true } } },
    });

    if (!user || user.role !== Role.STUDENT || !user.isVerified) return null;

    const userPoints = user.points?.total || 0;
    const higherCount = await this.prisma.user.count({
      where: {
        role: Role.STUDENT,
        isVerified: true,
        points: { total: { gt: userPoints } },
      },
    });

    return { rank: higherCount + 1, points: userPoints };
  }

  // ─── User rank (weekly) ─────────────────────────────────────────────────────

  async getUserWeeklyRank(
    userId: string
  ): Promise<{ rank: number; weeklyTotal: number } | null> {
    const { entries } = await this.getWeeklyLeaderboard(1, 9999);
    const entry = entries.find((e) => e.userId === userId);
    if (!entry) return null;
    return { rank: entry.rank, weeklyTotal: entry.points };
  }

  // ─── Category breakdown ─────────────────────────────────────────────────────

  async getCategoryBreakdown(
    userId: string
  ): Promise<Array<{ category: QuizCategory; points: number }>> {
    const [quizItems, wheelItems] = await Promise.all([
      this.prisma.quizSessionItem.findMany({
        where: { session: { userId } },
        select: { pointsEarned: true, session: { select: { category: true } } },
      }),
      this.prisma.wheelSessionItem.findMany({
        where: { session: { userId } },
        select: { pointsEarned: true, category: true },
      }),
    ]);

    const map = new Map<QuizCategory, number>();

    for (const item of quizItems) {
      const cat = (item as any).session.category as QuizCategory;
      map.set(cat, (map.get(cat) || 0) + ((item as any).pointsEarned || 0));
    }
    for (const item of wheelItems) {
      const cat = (item as any).category as QuizCategory;
      map.set(cat, (map.get(cat) || 0) + ((item as any).pointsEarned || 0));
    }

    return Array.from(map.entries())
      .filter(([, pts]) => pts > 0)
      .map(([category, points]) => ({ category, points }))
      .sort((a, b) => b.points - a.points);
  }

  // ─── Points history (last N days) ──────────────────────────────────────────

  async getUserPointsHistory(
    userId: string,
    days = 7
  ): Promise<Array<{ date: string; total: number }>> {
    // Use week start (Saturday) as the starting point for the 7-day history
    const weekStart = getWeekStart();
    const since = new Date(weekStart);

    const [quizItems, wheelItems] = await Promise.all([
      this.prisma.quizSessionItem.findMany({
        where: { session: { userId, createdAt: { gte: since } } },
        select: { pointsEarned: true, session: { select: { createdAt: true } } },
      }),
      this.prisma.wheelSessionItem.findMany({
        where: { session: { userId, createdAt: { gte: since } } },
        select: { pointsEarned: true, session: { select: { createdAt: true } } },
      }),
    ]);

    const dayMap = new Map<string, number>();

    // Pre-fill all days from week start (Saturday) to today
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      dayMap.set(d.toISOString().split('T')[0], 0);
    }

    for (const item of quizItems) {
      const date = (item as any).session.createdAt.toISOString().split('T')[0];
      if (dayMap.has(date)) dayMap.set(date, (dayMap.get(date) || 0) + ((item as any).pointsEarned || 0));
    }
    for (const item of wheelItems) {
      const date = (item as any).session.createdAt.toISOString().split('T')[0];
      if (dayMap.has(date)) dayMap.set(date, (dayMap.get(date) || 0) + ((item as any).pointsEarned || 0));
    }

    return Array.from(dayMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, total]) => ({ date, total }));
  }

  // ─── Helpers for badge service ──────────────────────────────────────────────

  async getWeeklyTopUserId(): Promise<string | null> {
    const { entries } = await this.getWeeklyLeaderboard(1, 1);
    return entries[0]?.userId ?? null;
  }

  async getPointsLast24h(userId: string): Promise<number> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [q, w] = await Promise.all([
      this.prisma.quizSessionItem.aggregate({
        where: { session: { userId, createdAt: { gte: since } } },
        _sum: { pointsEarned: true },
      }),
      this.prisma.wheelSessionItem.aggregate({
        where: { session: { userId, createdAt: { gte: since } } },
        _sum: { pointsEarned: true },
      }),
    ]);
    return (q._sum.pointsEarned || 0) + (w._sum.pointsEarned || 0);
  }

  async getActiveDaysLast7(userId: string): Promise<number> {
    const history = await this.getUserPointsHistory(userId, 7);
    return history.filter((d) => d.total > 0).length;
  }

  async hasAnySession(userId: string): Promise<boolean> {
    const [q, w] = await Promise.all([
      this.prisma.quizSession.count({ where: { userId } }),
      this.prisma.wheelSession.count({ where: { userId } }),
    ]);
    return q + w > 0;
  }

  async getUserCreatedAt(userId: string): Promise<Date | null> {
    const u = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    });
    return u?.createdAt ?? null;
  }

  async getCategoryLeader(category: QuizCategory): Promise<string | null> {
    const items = await this.prisma.quizSessionItem.findMany({
      where: { session: { category } },
      select: { pointsEarned: true, session: { select: { userId: true } } },
    });
    const map = new Map<string, number>();
    for (const item of items) {
      const uid = (item as any).session.userId;
      map.set(uid, (map.get(uid) || 0) + ((item as any).pointsEarned || 0));
    }
    if (map.size === 0) return null;
    return [...map.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }
}
