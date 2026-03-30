import { Request, Response } from 'express';
import { WheelService } from './wheel.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';

export class WheelController {
  private service: WheelService;

  constructor() {
    this.service = new WheelService();
  }

  /**
   * POST /api/v1/wheel/sessions
   * Start new wheel session
   */
  startSession = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const session = await this.service.startSession(userId);

    res.status(201).json(
      new ApiResponse(201, session, 'تم بدء جلسة العجلة بنجاح')
    );
  });

  /**
   * POST /api/v1/wheel/sessions/:id/spin
   * Spin wheel and get random question from category
   */
  spin = asyncHandler(async (req: Request, res: Response) => {
    const sessionId = req.params.id;

    const question = await this.service.spin(sessionId, req.body);

    res.json(
      new ApiResponse(200, question, 'تم الحصول على السؤال بنجاح')
    );
  });

  /**
   * POST /api/v1/wheel/sessions/:id/answer
   * Submit answer for wheel question
   */
  submitAnswer = asyncHandler(async (req: Request, res: Response) => {
    const sessionId = req.params.id;

    const result = await this.service.submitAnswer(sessionId, req.body);

    res.json(
      new ApiResponse(
        200,
        result,
        result.isCorrect ? 'إجابة صحيحة! 🎉' : 'إجابة خاطئة'
      )
    );
  });
}
