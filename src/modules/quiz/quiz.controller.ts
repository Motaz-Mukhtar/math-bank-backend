import { Request, Response } from 'express';
import { QuizService } from './quiz.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';

export class QuizController {
  private service: QuizService;

  constructor() {
    this.service = new QuizService();
  }

  /**
   * POST /api/v1/quiz/sessions
   * Start new quiz session with 10 questions
   */
  startSession = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const session = await this.service.startSession(userId, req.body);

    res.status(201).json(
      new ApiResponse(201, session, 'تم بدء جلسة الاختبار بنجاح')
    );
  });

  /**
   * GET /api/v1/quiz/sessions/:id/next
   * Get next unanswered question in session
   */
  getNextQuestion = asyncHandler(async (req: Request, res: Response) => {
    const sessionId = req.params.id;

    const question = await this.service.getNextQuestion(sessionId);

    res.json(
      new ApiResponse(200, question, 'تم الحصول على السؤال التالي بنجاح')
    );
  });

  /**
   * POST /api/v1/quiz/sessions/:id/answer
   * Submit answer for quiz question
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

  /**
   * POST /api/v1/quiz/sessions/:id/complete
   * Mark session as complete and get summary
   */
  completeSession = asyncHandler(async (req: Request, res: Response) => {
    const sessionId = req.params.id;

    const summary = await this.service.completeSession(sessionId);

    res.json(
      new ApiResponse(200, summary, 'تم إكمال الاختبار بنجاح')
    );
  });

  /**
   * GET /api/v1/quiz/sessions/history
   * Get user's quiz history
   */
  getHistory = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const history = await this.service.getUserHistory(userId);

    res.json(
      new ApiResponse(200, history, 'تم الحصول على سجل الاختبارات بنجاح')
    );
  });
}
