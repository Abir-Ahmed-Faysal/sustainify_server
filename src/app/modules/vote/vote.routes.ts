import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma";
import { voteController } from "./vote.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { voteValidation } from "./vote.validation";

const router = Router();

router.post(
  "/",
  checkAuth(Role.MEMBER, Role.ADMIN),
  validateRequest(voteValidation.voteZodSchema),
  voteController.toggleVote
);

export const voteRoutes = router;
