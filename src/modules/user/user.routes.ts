import { Router } from "express";
import { UserController } from "./user.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { updateProfileSchema } from "./user.schema";

const router = Router();
const userController = new UserController();

// All routes require authentication
router.use(authMiddleware);

// GET /api/v1/users/me - Get current user profile
router.get("/me", userController.getCurrentUser);

// PUT /api/v1/users/me - Update own profile
router.put("/me", validate(updateProfileSchema), userController.updateProfile);

export default router;
