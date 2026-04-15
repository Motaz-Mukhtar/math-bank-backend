import { Request, Response } from 'express';
import { VideoProgressService } from './videoProgress.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';

export class VideoProgressController {
  private service: VideoProgressService;

  constructor() {
    this.service = new VideoProgressService();
  }

  /**
   * POST /api/v1/videos/:id/progress
   * Update video progress for current user
   */
  updateProgress = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const videoId = req.params.id;

    const progress = await this.service.updateProgress(userId, videoId, req.body);

    res.json(
      new ApiResponse(
        200,
        progress,
        progress.isCompleted ? 'تم إكمال الفيديو بنجاح! 🎉' : 'تم تحديث التقدم'
      )
    );
  });

  /**
   * GET /api/v1/videos/:id/progress
   * Get progress for specific video
   */
  getProgress = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const videoId = req.params.id;

    const progress = await this.service.getProgress(userId, videoId);

    res.json(
      new ApiResponse(200, progress, 'تم جلب التقدم بنجاح')
    );
  });

  /**
   * GET /api/v1/videos/progress/all
   * Get all video progress for current user
   */
  getAllProgress = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const categoryId = req.query.categoryId as string | undefined;

    const progress = await this.service.getUserProgress(userId, categoryId);

    res.json(
      new ApiResponse(200, progress, 'تم جلب التقدم بنجاح')
    );
  });

  /**
   * GET /api/v1/videos/progress/stats
   * Get progress statistics for current user
   */
  getStats = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const stats = await this.service.getProgressStats(userId);

    res.json(
      new ApiResponse(200, stats, 'تم جلب الإحصائيات بنجاح')
    );
  });

  /**
   * GET /api/v1/videos/progress/recent
   * Get recently watched videos
   */
  getRecentlyWatched = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const limit = parseInt(req.query.limit as string) || 10;

    const progress = await this.service.getRecentlyWatched(userId, limit);

    res.json(
      new ApiResponse(200, progress, 'تم جلب الفيديوهات الأخيرة بنجاح')
    );
  });
}
