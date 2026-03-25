import { Router } from "express";
import { userController } from "./user.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma";

const router = Router();

// Admin: get all users (paginated, searchable)
router.get("/", checkAuth(Role.ADMIN), userController.getAllUsers);

// Admin or Member: get user by ID
router.get("/:id", checkAuth(Role.ADMIN, Role.MEMBER), userController.getUserById);

// Authenticated user: update own profile
router.patch(
    "/update-profile",
    checkAuth(Role.ADMIN, Role.MEMBER),
    userController.updateMyProfile
);

// Member: soft-delete own account
router.delete(
    "/delete-account",
    checkAuth(Role.MEMBER),
    userController.deleteMyAccount
);

export const userRoutes = router;
