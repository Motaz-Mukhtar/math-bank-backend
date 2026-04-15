import { Request, Response } from 'express';
import { VideoService } from './video.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';

export class VideoController {
  private service: VideoService;

  constructor() {
    this.service = new VideoService();
  }

  /**
   * GET /api/v1/videos
   * Get all videos with optional category filter, search, and pagination
   * Query params: categoryId, search, page, limit
   */
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const categoryId = req.query.categoryId as string | undefined;
    const search = req.query.search as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const filters: any = {};
    if (categoryId) filters.categoryId = categoryId;
    if (search?.trim()) filters.search = search.trim();

    const result = await this.service.getAll(
      Object.keys(filters).length > 0 ? filters : undefined,
      page,
      limit
    );

    // Cache for 3 minutes (videos don't change often)
    res.setHeader('Cache-Control', 'public, max-age=180');

    res.json(
      new ApiResponse(200, result, 'تم جلب الفيديوهات بنجاح')
    );
  });

  /**
   * GET /api/v1/videos/:id
   * Get single video
   */
  getById = asyncHandler(async (req: Request, res: Response) => {
    const video = await this.service.getById(req.params.id);

    // Cache for 5 minutes
    res.setHeader('Cache-Control', 'public, max-age=300');

    res.json(
      new ApiResponse(200, video, 'تم جلب الفيديو بنجاح')
    );
  });

  /**
   * POST /api/v1/videos
   * Create new video (Admin only)
   */
  create = asyncHandler(async (req: Request, res: Response) => {
    const video = await this.service.create(req.body);

    res.status(201).json(
      new ApiResponse(201, video, 'تم إنشاء الفيديو بنجاح')
    );
  });

  /**
   * PUT /api/v1/videos/:id
   * Update video (Admin only)
   */
  update = asyncHandler(async (req: Request, res: Response) => {
    const video = await this.service.update(req.params.id, req.body);

    res.json(
      new ApiResponse(200, video, 'تم تحديث الفيديو بنجاح')
    );
  });

  /**
   * DELETE /api/v1/videos/:id
   * Delete video (Admin only)
   */
  delete = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.delete(req.params.id);

    res.json(
      new ApiResponse(200, null, result.message)
    );
  });

  /**
   * PATCH /api/v1/videos/:id/move
   * Move video to different category (Admin only)
   */
  move = asyncHandler(async (req: Request, res: Response) => {
    const video = await this.service.moveToCategory(req.params.id, req.body);

    res.json(
      new ApiResponse(200, video, 'تم نقل الفيديو بنجاح')
    );
  });
}
