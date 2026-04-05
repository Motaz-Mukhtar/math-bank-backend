import { Request, Response } from 'express';
import { VideoCategoryService } from './videoCategory.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';

export class VideoCategoryController {
  private service: VideoCategoryService;

  constructor() {
    this.service = new VideoCategoryService();
  }

  /**
   * GET /api/v1/video-categories
   * Get all categories with nested videos
   */
  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const categories = await this.service.getAll();

    res.json(
      new ApiResponse(200, categories, 'تم جلب الفصول بنجاح')
    );
  });

  /**
   * GET /api/v1/video-categories/:id
   * Get single category with videos
   */
  getById = asyncHandler(async (req: Request, res: Response) => {
    const category = await this.service.getById(req.params.id);

    res.json(
      new ApiResponse(200, category, 'تم جلب الفصل بنجاح')
    );
  });

  /**
   * POST /api/v1/video-categories
   * Create new category (Admin only)
   */
  create = asyncHandler(async (req: Request, res: Response) => {
    const category = await this.service.create(req.body);

    res.status(201).json(
      new ApiResponse(201, category, 'تم إنشاء الفصل بنجاح')
    );
  });

  /**
   * PUT /api/v1/video-categories/:id
   * Update category (Admin only)
   */
  update = asyncHandler(async (req: Request, res: Response) => {
    const category = await this.service.update(req.params.id, req.body);

    res.json(
      new ApiResponse(200, category, 'تم تحديث الفصل بنجاح')
    );
  });

  /**
   * DELETE /api/v1/video-categories/:id
   * Delete category (Admin only)
   * Returns 409 if category has videos
   */
  delete = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.delete(req.params.id);

    res.json(
      new ApiResponse(200, null, result.message)
    );
  });
}
