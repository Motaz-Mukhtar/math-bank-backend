import { Request, Response } from "express";
import { UserService } from "./user.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const user = await this.userService.getCurrentUser(userId);

    res.json(new ApiResponse(200, user, "تم جلب بيانات المستخدم بنجاح"));
  });

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const data = req.body;

    const updatedUser = await this.userService.updateProfile(userId, data);

    res.json(new ApiResponse(200, updatedUser, "تم تحديث الملف الشخصي بنجاح"));
  });
}
