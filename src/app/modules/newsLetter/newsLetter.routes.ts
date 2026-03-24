import { Router } from "express";
import { newsLetterController } from "./newsLetter.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { newsLetterValidation } from "./newsLetter.validation";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma";

const router = Router();

router.post(
  "/subscribe",
  validateRequest(newsLetterValidation.subscribeZodSchema),
  newsLetterController.subscribe
);

router.get(
  "/",
  checkAuth(Role.ADMIN),
  newsLetterController.getAllSubscribers
);

export const newsLetterRoutes = router;
