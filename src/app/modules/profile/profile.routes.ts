import { Router } from "express";
import { profileController } from "./profile.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { profileValidation } from "./profileSchema";

const router = Router();



// Authenticated: update profile
router.patch(
    "/",
    checkAuth(),
    validateRequest(profileValidation.updateProfileZodSchema),
    profileController.updateProfile
);

export const profileRoutes = router;
