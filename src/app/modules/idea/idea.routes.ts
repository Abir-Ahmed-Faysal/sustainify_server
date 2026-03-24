import { Router } from "express";
import { ideaController } from "./idea.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { ideaValidation } from "./ideaSchema";
import { Role } from "../../../generated/prisma";

const router = Router();

// Public: get all ideas
router.get("/", ideaController.getAllIdeas);

// Public: get single idea
router.get("/:id", ideaController.getIdeaById);

// Users can create ideas
router.post(
    "/",
    checkAuth(Role.MEMBER,Role.ADMIN),
    validateRequest(ideaValidation.createIdeaZodSchema),
    ideaController.createIdea
);

// Users and Admin can update ideas
router.patch(
    "/:id",
    checkAuth(Role.MEMBER,Role.ADMIN),
    validateRequest(ideaValidation.updateIdeaZodSchema),
    ideaController.updateIdea
);

// Users and Admin can delete ideas
router.delete(
    "/:id",
    checkAuth(Role.MEMBER,Role.ADMIN),
    ideaController.deleteIdea
);

export const ideaRoutes = router;
