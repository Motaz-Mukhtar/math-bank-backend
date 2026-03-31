import { Request, Response } from 'express';
import { AdminService } from './admin.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';

export class AdminController {
  private service: AdminService;

  constructor() {
    this.service = new AdminService();
  }

  /**
   * GET /api/v1/admin/dashboard/stats
   * Get dashboard statistics
   */
  getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await this.service.getDashboardStats();

    res.json(
      new ApiResponse(200, stats, 'تم الحصول على إحصائيات لوحة التحكم بنجاح')
    );
  });

  /**
   * GET /api/v1/admin/dashboard/link-stats
   * Get parent-child link statistics
   */
  getLinkStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await this.service.getLinkStats();

    res.json(
      new ApiResponse(200, stats, 'تم الحصول على إحصائيات الروابط بنجاح')
    );
  });

  /**
   * GET /api/v1/admin/dashboard/registration-chart
   * Get registration chart data
   */
  getRegistrationChart = asyncHandler(async (req: Request, res: Response) => {
    const days = parseInt(req.query.days as string) || 30;

    const chartData = await this.service.getRegistrationChart(days);

    res.json(
      new ApiResponse(200, chartData, 'تم الحصول على بيانات الرسم البياني بنجاح')
    );
  });

  /**
   * GET /api/v1/admin/dashboard/top-students
   * Get top students by points
   */
  getTopStudents = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;

    const students = await this.service.getTopStudents(limit);

    res.json(
      new ApiResponse(200, students, 'تم الحصول على أفضل الطلاب بنجاح')
    );
  });

  /**
   * GET /api/v1/admin/dashboard/points-distribution
   * Get points distribution for histogram
   */
  getPointsDistribution = asyncHandler(async (req: Request, res: Response) => {
    const distribution = await this.service.getPointsDistribution();

    res.json(
      new ApiResponse(200, distribution, 'تم الحصول على توزيع النقاط بنجاح')
    );
  });

  /**
   * GET /api/v1/admin/users
   * Get paginated users with filters
   */
  getUsers = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.getUsersPaginated(req.query as any);

    res.json(
      new ApiResponse(200, result, 'تم الحصول على قائمة المستخدمين بنجاح')
    );
  });

  /**
   * PUT /api/v1/admin/users/:id
   * Update user
   */
  updateUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id;

    const user = await this.service.updateUser(userId, req.body);

    res.json(
      new ApiResponse(200, user, 'تم تحديث المستخدم بنجاح')
    );
  });

  /**
   * DELETE /api/v1/admin/users/:id
   * Delete user
   */
  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id;

    const result = await this.service.deleteUser(userId);

    res.json(
      new ApiResponse(200, result, 'تم حذف المستخدم بنجاح')
    );
  });

  /**
   * GET /api/v1/admin/users/export
   * Export users for CSV
   */
  exportUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await this.service.exportUsers(req.query as any);

    res.json(
      new ApiResponse(200, users, 'تم تصدير المستخدمين بنجاح')
    );
  });

  // ─── Question Management ─────────────────────────────────────────────────────

  /**
   * POST /api/v1/admin/questions
   * Create new question
   */
  createQuestion = asyncHandler(async (req: Request, res: Response) => {
    const question = await this.service.createQuestion(req.body);

    res.status(201).json(
      new ApiResponse(201, question, 'تم إنشاء السؤال بنجاح')
    );
  });

  /**
   * PUT /api/v1/admin/questions/:id
   * Update existing question
   */
  updateQuestion = asyncHandler(async (req: Request, res: Response) => {
    const questionId = req.params.id;

    const question = await this.service.updateQuestion(questionId, req.body);

    res.json(
      new ApiResponse(200, question, 'تم تحديث السؤال بنجاح')
    );
  });

  /**
   * GET /api/v1/admin/questions
   * Get paginated questions with filters
   */
  getQuestions = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.getQuestionsPaginated(req.query as any);

    res.json(
      new ApiResponse(200, result, 'تم الحصول على قائمة الأسئلة بنجاح')
    );
  });

  /**
   * DELETE /api/v1/admin/questions/:id
   * Delete question
   */
  deleteQuestion = asyncHandler(async (req: Request, res: Response) => {
    const questionId = req.params.id;

    const result = await this.service.deleteQuestion(questionId);

    res.json(
      new ApiResponse(200, result, 'تم حذف السؤال بنجاح')
    );
  });
}
