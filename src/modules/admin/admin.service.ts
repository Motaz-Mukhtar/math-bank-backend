import { AdminRepository } from './admin.repository';
import { UpdateUserDto, GetUsersQuery, ExportUsersQuery } from './admin.schema';
import { ApiError } from '../../utils/ApiError';
import { Role } from '@prisma/client';

export class AdminService {
  private repository: AdminRepository;

  constructor() {
    this.repository = new AdminRepository();
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    return this.repository.getDashboardStats();
  }

  /**
   * Get parent-child link statistics
   */
  async getLinkStats() {
    return this.repository.getLinkStats();
  }

  /**
   * Get registration chart data
   */
  async getRegistrationChart(days: number = 30) {
    if (days < 1 || days > 365) {
      throw new ApiError(400, 'عدد الأيام يجب أن يكون بين 1 و 365');
    }

    return this.repository.getRegistrationChart(days);
  }

  /**
   * Get top students by points
   */
  async getTopStudents(limit: number = 10) {
    if (limit < 1 || limit > 100) {
      throw new ApiError(400, 'الحد الأقصى يجب أن يكون بين 1 و 100');
    }

    return this.repository.getTopStudents(limit);
  }

  /**
   * Get points distribution
   */
  async getPointsDistribution() {
    return this.repository.getPointsDistribution();
  }

  /**
   * Get paginated users with filters
   */
  async getUsersPaginated(query: GetUsersQuery) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;

    if (page < 1) {
      throw new ApiError(400, 'رقم الصفحة يجب أن يكون أكبر من 0');
    }

    if (limit < 1 || limit > 100) {
      throw new ApiError(400, 'الحد الأقصى يجب أن يكون بين 1 و 100');
    }

    return this.repository.getUsersPaginated(
      page,
      limit,
      query.role,
      query.search
    );
  }

  /**
   * Update user
   */
  async updateUser(id: string, dto: UpdateUserDto) {
    const user = await this.repository.updateUser(id, dto);

    if (!user) {
      throw new ApiError(404, 'المستخدم غير موجود');
    }

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      academicNumber: user.academicNumber,
      points: user.points?.total || 0,
      isVerified: user.isVerified,
    };
  }

  /**
   * Delete user
   */
  async deleteUser(id: string) {
    try {
      await this.repository.deleteUser(id);
      return { message: 'تم حذف المستخدم بنجاح' };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new ApiError(404, 'المستخدم غير موجود');
      }
      throw error;
    }
  }

  /**
   * Export users for CSV
   */
  async exportUsers(query: ExportUsersQuery) {
    return this.repository.exportUsers(query.type);
  }
}
