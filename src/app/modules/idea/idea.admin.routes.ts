import { Router } from "express";
import { ideaAdminController } from "./idea.admin.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma";
import { validateRequest } from "../../middleware/validateRequest";
import { ideaValidation } from "./ideaSchema";

/**
 * ADMIN ROUTES: Specialized endpoint routing for admin-only operations
 * 
 * Base path: /api/ideas/admin
 * All routes require Role.ADMIN authentication via checkAuth middleware
 */
const router = Router();

// ✅ List all ideas (admin view) - GET /admin/ideas
router.get(
  "/",
  checkAuth(Role.ADMIN),
  ideaAdminController.getAllIdeasAdmin
);

// ✅ Get single idea details - GET /admin/ideas/:id
router.get(
  "/:id",
  checkAuth(Role.ADMIN),
  ideaAdminController.getIdeaByIdAdmin
);

// ✅ Change idea status - PATCH /admin/ideas/:id/status
router.patch(
  "/:id/status",
  checkAuth(Role.ADMIN),
  validateRequest(ideaValidation.updateIdeaStatusByAdmin),
  ideaAdminController.changeIdeaStatus
);

// ✅ Toggle featured status - PATCH /admin/ideas/:id/featured
router.patch(
  "/:id/featured",
  checkAuth(Role.ADMIN),
  validateRequest(ideaValidation.toggleIsFeatured),
  ideaAdminController.toggleIdeaFeatured
);

// ✅ Update idea - PATCH /admin/ideas/:id
router.patch(
  "/:id",
  checkAuth(Role.ADMIN),
  validateRequest(ideaValidation.updateIdeaZodSchema),
  ideaAdminController.updateIdeaAsAdmin
);

// ✅ Delete idea - DELETE /admin/ideas/:id
router.delete(
  "/:id",
  checkAuth(Role.ADMIN),
  ideaAdminController.deleteIdeaAsAdmin
);

export const ideaAdminRoutes = router;
