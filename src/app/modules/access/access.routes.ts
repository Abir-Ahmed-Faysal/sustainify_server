import { Router } from "express";
import { accessController } from "./access.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { checkOptionalAuth } from "../../middleware/checkOptionalAuth";
import { Role } from "../../../generated/prisma";

const router = Router();

/**
 * Get all ideas pursued and paid for by the authenticated user
 * GET /api/v1/access/my
 * Route must come BEFORE parameterized routes to avoid conflicts
 */
router.get(
    "/my",
    checkAuth(Role.MEMBER, Role.ADMIN),
    accessController.getMyPaidPursuedIdeas
);

/**
 * Check if the authenticated user has accessed a specific idea
 * GET /api/v1/access/:ideaId
 * Uses optional auth - if user is not authenticated, returns false (no access)
 */
router.get(
    "/:ideaId",
    checkOptionalAuth,
    accessController.checkMyAccess
);

export const accessRoutes = router;
