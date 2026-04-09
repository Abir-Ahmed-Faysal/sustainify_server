import { Router } from "express";
import { ideaController } from "./idea.controller";
import { accessController } from "../access/access.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { checkOptionalAuth } from "../../middleware/checkOptionalAuth";
import { Role } from "../../../generated/prisma";
import { validateRequest } from "../../middleware/validateRequest";
import { ideaValidation } from "./ideaSchema";

const router = Router();

// Public: get all ideas
router.get("/", checkOptionalAuth, ideaController.getAllIdeas);

// ✅ NEW: Admin only - get ALL ideas (including all statuses except drafts)
router.get("/admin/all", checkAuth(Role.ADMIN), ideaController.getAdminAllIdeas);

// ✅ NEW: AI Search - public endpoint with ranking
router.get("/search/suggestions", checkOptionalAuth, ideaController.searchIdeas);

// ✅ NEW: AI Recommendations - authenticated or public (popular ideas)
router.get("/recommendations/personalized", checkOptionalAuth, ideaController.getRecommendations);

router.get("/my-ideas", checkAuth(Role.ADMIN, Role.MEMBER), ideaController.getMyIdeas);

router.get("/my-purchased-ideas", checkAuth(Role.ADMIN, Role.MEMBER), accessController.getMyPaidPursuedIdeas);

router.get("/my-Idea/:id", checkAuth(Role.ADMIN, Role.MEMBER), ideaController.getMyIdeaById);

// Public: get single idea
router.get("/:id", checkOptionalAuth, ideaController.getIdeaById);

// Users can create ideas
router.post(
    "/",
    checkAuth(Role.MEMBER, Role.ADMIN),
    validateRequest(ideaValidation.createIdeaZodSchema),
    ideaController.createIdea
);

// Users and Admin can update ideas
router.patch(
    "/:id",
    checkAuth(Role.MEMBER, Role.ADMIN),
    validateRequest(ideaValidation.updateIdeaZodSchema),
    ideaController.updateIdea
);

router.patch('/status/:id', checkAuth(Role.ADMIN, Role.MEMBER), validateRequest(ideaValidation.updateIdeaStatus), ideaController.updateIdeaStatus)

router.patch('/status/admin/:id', checkAuth(Role.ADMIN), validateRequest(ideaValidation.updateIdeaStatusByAdmin), ideaController.updateIdeaStatusByAdmin)

router.patch('/toggle-isFeatured/:id', checkAuth(Role.ADMIN), validateRequest(ideaValidation.toggleIsFeatured), ideaController.toggleIsFeatured)

// Users and Admin can delete ideas
router.delete(
    "/:id",
    checkAuth(Role.MEMBER, Role.ADMIN),
    ideaController.deleteIdea
);

export const ideaRoutes = router;
