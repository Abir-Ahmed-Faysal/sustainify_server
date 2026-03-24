import { Router } from "express";
import { doctorController } from "./doctor.controller";
import { validateRequest } from "../../middleware/validataionRequest";
import { DoctorValidation } from "./DoctorRequestValidation";


const router = Router()



router.get('/', doctorController.getAllDoctors)
router.get('/:id', doctorController.getDoctor)
router.patch('/:id', validateRequest(DoctorValidation.updateDoctorValidationSchema), doctorController.updateDoctor)
router.delete('/:id', doctorController.deleteDoctor)


export const doctorRoutes = router

