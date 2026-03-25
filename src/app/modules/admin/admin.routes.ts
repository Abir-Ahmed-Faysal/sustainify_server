import { Router } from "express";
import { adminController } from "./admin.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma";

const router = Router();

// All admin routes are protected — only ADMIN can access
router.patch(
    "/users/:id/role",
    checkAuth(Role.ADMIN),
    adminController.updateUserRole
);

router.patch(
    "/users/:id/status",
    checkAuth(Role.ADMIN),
    adminController.toggleUserStatus
);

router.delete(
    "/users/:id",
    checkAuth(Role.ADMIN),
    adminController.deleteUser
);

export const adminRoutes = router;
