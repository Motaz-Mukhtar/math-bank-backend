import { Request, Response } from 'express';
import { Role, QuizCategory } from '@prisma/client';
import { LeaderboardRepository } from './leaderboard.repository';
import { computeBadgesForLeaderboard, computeBadgesForUser } from './badge.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';

const CATEGORY_LABELS: Record<QuizCategory, string> = {
  ADDITION: 'الجمع',
  SUBTRACTION: 'الطرح',
  MULTIPLICATION: 'الضرب',
  DIVISION: 'القسمة',
  COMPARISON: 'المقارنة',
  GEOMETRY: 'الهندسة',
  FRACTIONS: 'الكسور',
  MEASUREMENT: 'القياس',
  TIME: 'الوقت',
  PLACE_VALUE: 'القيمة المكانية',
  PATTERNS: 'الأنماط',
  DATA: 'البيانات',
};

export class LeaderboardController {
  private repository: LeaderboardRepository;

  constructor() {
    this.repository = new LeaderboardRepository();
  }

  /**
   * GET /api/v1/leaderboard/top?limit=8
   * Fast endpoint for main page — top N students + current user rank, no badges.
   */
  getTop = asyncHandler(async (req: Request, res: Response) => {
    const limit = Math.min(Number(req.query.limit) || 8, 20);
    const userId = req.user?.userId;

    const [topStudents, currentUser] = await Promise.all([
      this.repository.getTopStudents(limit),
      userId ? this.repository.getUserRank(userId) : Promise.resolve(null),
    ]);

    res.json(
      new ApiResponse(200, { topStudents, currentUser }, 'تم جلب لوحة المتصدرين بنجاح')
    );
  });

  /**
   * GET /api/v1/leaderboard?page&limit&period
   * Full paginated leaderboard with badges for the dedicated page.
   */
  getLeaderboard = asyncHandler(async (req: Request, res: Response) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const period = req.query.period === 'weekly' ? 'weekly' : 'all';
    const userId = req.user?.userId;

    const { entries, total } =
      period === 'weekly'
        ? await this.repository.getWeeklyLeaderboard(page, limit)
        : await this.repository.getFullLeaderboard(page, limit);

    const badgeMap = await computeBadgesForLeaderboard(entries, this.repository);

    const enriched = entries.map((e) => ({
      ...e,
      badges: badgeMap.get(e.userId) || [],
    }));

    const totalPages = Math.ceil(total / limit);

    let currentUser = null;
    if (userId) {
      const [global, weekly] = await Promise.all([
        this.repository.getUserRank(userId),
        this.repository.getUserWeeklyRank(userId),
      ]);
      if (global) {
        currentUser = {
          rank: global.rank,
          total: global.points,
          weeklyRank: weekly?.rank ?? null,
          weeklyTotal: weekly?.weeklyTotal ?? 0,
        };
      }
    }

    res.json(
      new ApiResponse(
        200,
        {
          entries: enriched,
          meta: { page, limit, total, totalPages },
          period,
          currentUser,
        },
        'تم جلب لوحة المتصدرين بنجاح'
      )
    );
  });

  /**
   * GET /api/v1/leaderboard/me/stats
   * Personal stats for the dedicated page top card. Student only.
   */
  getMyStats = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const [global, weekly, breakdown, history, badges] = await Promise.all([
      this.repository.getUserRank(userId),
      this.repository.getUserWeeklyRank(userId),
      this.repository.getCategoryBreakdown(userId),
      this.repository.getUserPointsHistory(userId, 7),
      computeBadgesForUser(userId, this.repository),
    ]);

    if (!global) throw new ApiError(404, 'لم يتم العثور على بيانات الطالب');

    // Find the student ranked just above
    const { entries: aboveEntries } = await this.repository.getFullLeaderboard(
      Math.max(1, global.rank - 1),
      1
    );
    const above = aboveEntries.find((e) => e.rank === global.rank - 1);

    const categoryBreakdown = breakdown.map((b) => ({
      category: b.category,
      labelAr: CATEGORY_LABELS[b.category] || b.category,
      points: b.points,
    }));

    res.json(
      new ApiResponse(
        200,
        {
          rank: global.rank,
          total: global.points,
          weeklyRank: weekly?.rank ?? null,
          weeklyTotal: weekly?.weeklyTotal ?? 0,
          nextRankGap: above ? above.points - global.points : 0,
          nextRankName: above?.fullName ?? null,
          pointsHistory: history,
          categoryBreakdown,
          badges,
        },
        'تم جلب إحصائياتك بنجاح'
      )
    );
  });

  /**
   * GET /api/v1/leaderboard/users/:userId/categories
   * Public category breakdown for any student (used by expandable rows).
   */
  getUserCategories = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const breakdown = await this.repository.getCategoryBreakdown(userId);

    const result = breakdown.map((b) => ({
      category: b.category,
      labelAr: CATEGORY_LABELS[b.category] || b.category,
      points: b.points,
    }));

    res.json(new ApiResponse(200, result, 'تم جلب تفاصيل الفئات بنجاح'));
  });
}
