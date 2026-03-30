import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from './auth.controller';
import { validate } from '../../middleware/validate.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import {
  registerSchema,
  verifyEmailSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.schema';

const router = Router();
const controller = new AuthController();

// Rate limiter: 5 requests per minute per IP
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: {
    success: false,
    statusCode: 429,
    error: 'عدد كبير جداً من المحاولات. يرجى المحاولة لاحقاً',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to all auth routes
router.use(authLimiter);

// Public routes
router.post('/register', validate(registerSchema), controller.register);
router.post('/verify-email', validate(verifyEmailSchema), controller.verifyEmail);
router.post('/login', validate(loginSchema), controller.login);
router.post('/refresh', controller.refresh);
router.post('/forgot-password', validate(forgotPasswordSchema), controller.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), controller.resetPassword);

// Protected routes
router.post('/logout', authMiddleware, controller.logout);

export default router;
