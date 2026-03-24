import { Router } from "express";
import { commentController } from "./comment.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma";
import { validateRequest } from "../../middleware/validateRequest";
import { commentValidation } from "./comment.validation";

const router = Router();

router.post(
  "/",
  checkAuth(Role.MEMBER, Role.ADMIN),
  validateRequest(commentValidation.createCommentSchema),
  commentController.createComment
);

router.get(
  "/idea/:ideaId",
  commentController.getCommentsByIdea
);

router.patch(
  "/:id",
  checkAuth(Role.MEMBER, Role.ADMIN),
  validateRequest(commentValidation.updateCommentSchema),
  commentController.updateComment
);

router.delete(
  "/:id",
  checkAuth(Role.MEMBER, Role.ADMIN),
  commentController.deleteComment
);

export const commentRoutes = router;
