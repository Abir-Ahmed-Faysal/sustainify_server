import { Router } from "express";
import { userController } from "./user.controller";
import { checkAuth } from "../../middleware/checkAuth";

const router = Router();

// Admin: get all users (paginated, searchable)
router.get("/", checkAuth("ADMIN"), userController.getAllUsers);

// Admin or Member: get user by ID
router.get("/:id", checkAuth("ADMIN", "MEMBER"), userController.getUserById);

// Authenticated user: update own profile
router.patch(
    "/update-profile",
    checkAuth("ADMIN", "MEMBER"),
    userController.updateMyProfile
);

// Member: soft-delete own account
router.delete(
    "/delete-account",
    checkAuth("MEMBER"),
    userController.deleteMyAccount
);

export const userRoutes = router;
