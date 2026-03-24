import { Router } from "express";
import { adminController } from "./admin.controller";
import { checkAuth } from "../../middleware/checkAuth";

const router = Router();

// All admin routes are protected — only ADMIN can access
router.patch(
    "/users/:id/role",
    checkAuth("ADMIN"),
    adminController.updateUserRole
);

router.patch(
    "/users/:id/status",
    checkAuth("ADMIN"),
    adminController.toggleUserStatus
);

router.delete(
    "/users/:id",
    checkAuth("ADMIN"),
    adminController.deleteUser
);

export const adminRoutes = router;
