import { Router } from "express";
import { userController } from "./user.controller";
import { validateRequest } from "../../middleware/validataionRequest";
import { UserValidation } from "./userRequest.validation";









const router = Router()

router.post("/create-doctor",
    //  authCheck(Role.SUPER_ADMIN, Role.ADMIN),
    validateRequest(UserValidation.createDoctorValidationZodSchema), userController.createDoctor)


router.post("/create-admin", validateRequest(UserValidation.createAdminValidationSchema), userController.createAdmin)


router.post("/create-super-admin", validateRequest(UserValidation.createAdminValidationSchema), userController.createSuperAdmin)
router.post("/create-super-admin", validateRequest(UserValidation.createAdminValidationSchema), userController.createSuperAdmin)





export const userRoutes = router