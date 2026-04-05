import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';

export class AuthController {
  private service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  /**
   * POST /api/v1/auth/register
   */
  register = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.service.register(req.body);

    res.status(201).json(
      new ApiResponse(
        201,
        user,
        'تم إنشاء الحساب بنجاح. يرجى التحقق من بريدك الإلكتروني'
      )
    );
  });

  /**
   * POST /api/v1/auth/verify-email
   */
  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.service.verifyEmail(req.body);

    res.json(new ApiResponse(200, user, 'تم تفعيل الحساب بنجاح'));
  });

  /**
   * POST /api/v1/auth/login
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = await this.service.login(
      req.body
    );

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json(
      new ApiResponse(
        200,
        { user, accessToken },
        'تم تسجيل الدخول بنجاح'
      )
    );
  });

  /**
   * POST /api/v1/auth/refresh
   */
  refresh = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        error: 'رمز التحديث غير موجود',
      });
    }

    const accessToken = await this.service.refresh(refreshToken);

    res.json(new ApiResponse(200, { accessToken }, 'تم تحديث الرمز بنجاح'));
  });

  /**
   * POST /api/v1/auth/forgot-password
   */
  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    await this.service.forgotPassword(req.body);

    res.json(
      new ApiResponse(
        200,
        null,
        'إذا كان البريد الإلكتروني موجوداً، سيتم إرسال رمز إعادة التعيين'
      )
    );
  });

  /**
   * POST /api/v1/auth/reset-password
   */
  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    await this.service.resetPassword(req.body);

    res.json(new ApiResponse(200, null, 'تم تغيير كلمة المرور بنجاح'));
  });

  /**
   * POST /api/v1/auth/logout
   */
  logout = asyncHandler(async (_req: Request, res: Response) => {
    res.clearCookie('refreshToken');

    res.json(new ApiResponse(200, null, 'تم تسجيل الخروج بنجاح'));
  });
}
