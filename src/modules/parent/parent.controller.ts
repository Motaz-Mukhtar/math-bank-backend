import { Request, Response } from 'express';
import { ParentService } from './parent.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';

export class ParentController {
  private service: ParentService;

  constructor() {
    this.service = new ParentService();
  }

  /**
   * POST /api/v1/parent/link
   * Link a child to parent account
   */
  linkChild = asyncHandler(async (req: Request, res: Response) => {
    const parentId = req.user!.userId;

    const result = await this.service.linkChild(parentId, req.body);

    res.status(201).json(
      new ApiResponse(201, result, 'تم ربط الطالب بنجاح')
    );
  });

  /**
   * GET /api/v1/parent/children
   * Get all children linked to parent
   */
  getChildren = asyncHandler(async (req: Request, res: Response) => {
    const parentId = req.user!.userId;

    const children = await this.service.getChildren(parentId);

    res.json(
      new ApiResponse(200, children, 'تم الحصول على قائمة الأطفال بنجاح')
    );
  });

  /**
   * GET /api/v1/parent/children/:id/progress
   * Get child's progress details
   */
  getChildProgress = asyncHandler(async (req: Request, res: Response) => {
    const parentId = req.user!.userId;
    const childId = req.params.id;

    const progress = await this.service.getChildProgress(parentId, childId);

    res.json(
      new ApiResponse(200, progress, 'تم الحصول على تقدم الطالب بنجاح')
    );
  });
}
