import { Router } from "express";
import { DoctorValidation } from "./superAdmin.RequestValidation";
import { adminController } from "./superAdmin.controller";
import { validateRequest } from "../middleware/validataionRequest";
import { authCheck } from "../middleware/authCheck";
import { Role } from "../../generated/prisma/enums";


const router = Router()



router.get('/', adminController.getAllAdmins)
router.get('/:id', adminController.getAdmin)
router.patch('/:id', authCheck(Role.SUPER_ADMIN), validateRequest(DoctorValidation.updateDoctorValidationSchema), adminController.updateAdmin)
router.delete('/:id', authCheck(Role.SUPER_ADMIN), adminController.deleteAdmin)


export const superAdminRoutes = router

