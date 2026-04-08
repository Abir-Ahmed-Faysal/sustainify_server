import { Router } from "express";
import { userController } from "./user.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { userValidation } from "./user.validation";
import { Role } from "../../../generated/prisma";

const router = Router();

// Admin: get all users (paginated, searchable)
router.get("/", checkAuth(Role.ADMIN), userController.getAllUsers);

// Public: get limited user details for filters
router.get("/public", userController.getPublicUsers);

// Admin or Member: get user by ID
router.get("/:id", checkAuth(Role.ADMIN, Role.MEMBER), userController.getUserById);

// Authenticated user: update own profile
router.patch(
    "/update-profile",
    checkAuth(Role.ADMIN, Role.MEMBER),
    validateRequest(userValidation.updateProfileSchema),
    userController.updateMyProfile
);

// Admin: activate/deactivate user
router.patch(
    "/:id/toggle-status",
    checkAuth(Role.ADMIN),
    validateRequest(userValidation.toggleUserStatusSchema),
    userController.toggleUserStatus
);

export const userRoutes = router;
