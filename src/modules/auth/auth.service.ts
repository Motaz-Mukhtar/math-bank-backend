import bcrypt from 'bcryptjs';
import { AuthRepository } from './auth.repository';
import {
  RegisterDto,
  VerifyEmailDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './auth.schema';
import { ApiError } from '../../utils/ApiError';
import { SafeUser } from '../../types';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../services/token.service';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../../services/email.service';

const SALT_ROUNDS = 12;
const VERIFY_CODE_TTL_MINUTES = 15;
const RESET_CODE_TTL_MINUTES = 15;

export class AuthService {
  private repository: AuthRepository;

  constructor() {
    this.repository = new AuthRepository();
  }

  /**
   * Generate 6-digit verification code
   */
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Convert User to SafeUser (exclude sensitive fields)
   */
  private toSafeUser(user: any): SafeUser {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      academicNumber: user.academicNumber,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };
  }

  /**
   * Register new user
   */
  async register(dto: RegisterDto): Promise<SafeUser> {
    // Check if email already exists
    const existingUser = await this.repository.findByEmail(dto.email);
    if (existingUser) {
      throw new ApiError(409, 'البريد الإلكتروني مستخدم بالفعل');
    }

    // If parent and childAcademicNumber provided, verify the child exists
    let childId: string | undefined;
    if (dto.role === 'PARENT' && dto.childAcademicNumber) {
      const child = await this.repository.findByAcademicNumber(dto.childAcademicNumber);
      if (!child) {
        throw new ApiError(404, 'الرقم الأكاديمي غير موجود');
      }
      if (child.role !== 'STUDENT') {
        throw new ApiError(400, 'الرقم الأكاديمي يجب أن يكون لطالب');
      }
      childId = child.id;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    // Generate verification code
    const verifyCode = this.generateCode();
    const verifyCodeExp = new Date(
      Date.now() + VERIFY_CODE_TTL_MINUTES * 60 * 1000
    );

    // Create user (and link if parent with childId)
    const user = await this.repository.createUser({
      fullName: dto.fullName.trim(),
      email: dto.email.toLowerCase().trim(),
      phone: dto.phone?.trim(),
      passwordHash,
      role: dto.role,
      verifyCode,
      verifyCodeExp,
    }, childId);

    // Send verification email (don't await - fire and forget)
    sendVerificationEmail(user.email, verifyCode).catch((err) =>
      console.error('Failed to send verification email:', err)
    );

    return this.toSafeUser(user);
  }

  /**
   * Verify email with code
   */
  async verifyEmail(dto: VerifyEmailDto): Promise<SafeUser> {
    const user = await this.repository.findByEmail(
      dto.email.toLowerCase().trim()
    );

    if (!user) {
      throw new ApiError(404, 'المستخدم غير موجود');
    }

    if (user.isVerified) {
      throw new ApiError(400, 'الحساب مفعّل بالفعل');
    }

    if (!user.verifyCode || !user.verifyCodeExp) {
      throw new ApiError(400, 'رمز التحقق غير موجود');
    }

    if (user.verifyCode !== dto.code) {
      throw new ApiError(400, 'رمز التحقق غير صحيح');
    }

    if (new Date() > user.verifyCodeExp) {
      throw new ApiError(400, 'رمز التحقق منتهي الصلاحية');
    }

    // Mark as verified
    await this.repository.markVerified(user.id);

    return this.toSafeUser({ ...user, isVerified: true });
  }

  /**
   * Login user
   */
  async login(
    dto: LoginDto
  ): Promise<{ user: SafeUser; accessToken: string; refreshToken: string }> {
    const user = await this.repository.findByEmail(
      dto.email.toLowerCase().trim()
    );

    if (!user) {
      throw new ApiError(401, 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new ApiError(401, 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    // Check if verified
    if (!user.isVerified) {
      throw new ApiError(403, 'يرجى تفعيل حسابك أولاً');
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    return {
      user: this.toSafeUser(user),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Forgot password - send reset code
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.repository.findByEmail(
      dto.email.toLowerCase().trim()
    );

    if (!user) {
      // Don't reveal if email exists
      return;
    }

    // Generate reset code
    const resetCode = this.generateCode();
    const resetCodeExp = new Date(
      Date.now() + RESET_CODE_TTL_MINUTES * 60 * 1000
    );

    // Update user with reset code
    await this.repository.updateResetCode(user.id, resetCode, resetCodeExp);

    // Send reset email (don't await - fire and forget)
    sendPasswordResetEmail(user.email, resetCode).catch((err) =>
      console.error('Failed to send password reset email:', err)
    );
  }

  /**
   * Reset password with code
   */
  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const user = await this.repository.findByEmail(
      dto.email.toLowerCase().trim()
    );

    if (!user) {
      throw new ApiError(404, 'المستخدم غير موجود');
    }

    if (!user.resetCode || !user.resetCodeExp) {
      throw new ApiError(400, 'رمز إعادة التعيين غير موجود');
    }

    if (user.resetCode !== dto.code) {
      throw new ApiError(400, 'رمز إعادة التعيين غير صحيح');
    }

    if (new Date() > user.resetCodeExp) {
      throw new ApiError(400, 'رمز إعادة التعيين منتهي الصلاحية');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);

    // Update password and clear reset code
    await this.repository.updatePassword(user.id, passwordHash);
  }

  /**
   * Refresh access token
   */
  async refresh(refreshToken: string): Promise<string> {
    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      throw new ApiError(401, 'رمز التحديث غير صالح أو منتهي الصلاحية');
    }

    const user = await this.repository.findById(payload.userId);

    if (!user) {
      throw new ApiError(404, 'المستخدم غير موجود');
    }

    if (!user.isVerified) {
      throw new ApiError(403, 'الحساب غير مفعّل');
    }

    // Generate new access token
    return generateAccessToken(user.id, user.role);
  }
}
