import { UserRepository } from "./user.repository";
import { ApiError } from "../../utils/ApiError";
import type { UpdateProfileInput } from "./user.schema";
import { Role } from "@prisma/client";

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getCurrentUser(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new ApiError(404, "المستخدم غير موجود");
    }

    // Get rank for students
    let rank: number | null = null;
    if (user.role === Role.STUDENT) {
      rank = await this.userRepository.getUserRank(userId);
    }

    // Format response
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      phone: user.phone,
      isEmailVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      academicNumber: user.academicNumber,
      profile: user.points ? {
        id: user.points.id,
        points: user.points.total,
        rank: rank,
      } : null,
    };
  }

  async updateProfile(userId: string, data: UpdateProfileInput) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new ApiError(404, "المستخدم غير موجود");
    }

    const updatedUser = await this.userRepository.updateProfile(userId, data);

    // Get rank for students
    let rank: number | null = null;
    if (updatedUser.role === Role.STUDENT) {
      rank = await this.userRepository.getUserRank(userId);
    }

    // Format response
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      fullName: updatedUser.fullName,
      phone: updatedUser.phone,
      isEmailVerified: updatedUser.isVerified,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      profile: updatedUser.points ? {
        id: updatedUser.points.id,
        points: updatedUser.points.total,
        rank: rank,
      } : null,
    };
  }
}
