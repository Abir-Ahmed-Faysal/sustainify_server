import { Router } from "express";
import { authController } from "./auth.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { authValidation } from "./auth.validation";

const router = Router();

router.post(
    "/register",
    validateRequest(authValidation.registerValidationSchema),
    authController.register
);
router.post(
    "/login",
    validateRequest(authValidation.loginValidationSchema),
    authController.login
);
router.get("/me", checkAuth(), authController.getMe);
router.post("/refresh-token", checkAuth(), authController.refreshToken);

export const authRoutes = router;