import { Router } from "express";
import { paymentController } from "./payment.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma";
import { validateRequest } from "../../middleware/validateRequest";
import { paymentValidation } from "./payment.validation";

const router = Router();

router.post(
    "/create-checkout-session",
    checkAuth(Role.MEMBER, Role.ADMIN),
    validateRequest(paymentValidation.createCheckoutSessionZodSchema),
    paymentController.createCheckoutSession
);

router.post(
    "/webhook",
    paymentController.stripeWebhook
);

export const paymentRoutes = router;