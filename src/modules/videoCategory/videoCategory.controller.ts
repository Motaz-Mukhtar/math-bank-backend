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
   * Get all categories with nested videos and pagination
   * Query params: page, limit, search
   */
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string | undefined;

    const result = await this.service.getAll(page, limit, search?.trim());

    res.json(
      new ApiResponse(200, result, 'تم جلب الفصول بنجاح')
    );
  });

  /**
   * GET /api/v1/video-categories/list/all
   * Get all categories without pagination (for dropdowns)
   */
  getAllNoPagination = asyncHandler(async (_req: Request, res: Response) => {
    const categories = await this.service.getAllNoPagination();

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
