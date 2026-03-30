import { Request, Response } from 'express';
import { LeaderboardRepository } from './leaderboard.repository';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';

export class LeaderboardController {
  private repository: LeaderboardRepository;

  constructor() {
    this.repository = new LeaderboardRepository();
  }

  /**
   * GET /api/v1/leaderboard
   * Get top 10 students + current user rank
   */
  getLeaderboard = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    // Get top 10 students
    const topStudents = await this.repository.getTopStudents(10);

    // Get current user rank (null if not a STUDENT)
    let currentUser = null;
    if (userId) {
      currentUser = await this.repository.getUserRank(userId);
    }

    res.json(
      new ApiResponse(
        200,
        {
          topStudents,
          currentUser,
        },
        'تم جلب لوحة المتصدرين بنجاح'
      )
    );
  });
}
