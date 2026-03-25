import { Router } from "express";
import { paymentController } from "./payment.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma";

const router = Router();

router.post(
    "/create-checkout-session",
    checkAuth(Role.MEMBER, Role.ADMIN),
    paymentController.createCheckoutSession
);

router.post(
    "/webhook",
    paymentController.stripeWebhook
);

export const paymentRoutes = router;