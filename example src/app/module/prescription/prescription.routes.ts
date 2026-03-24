import { Router } from "express";
import { authCheck } from "../../middleware/authCheck";
import { Role } from "../../../generated/prisma/enums";
import { prescriptionController } from "./prescription.controller";

const router = Router()



router.get('/', authCheck(Role.SUPER_ADMIN, Role.ADMIN), prescriptionController.getAllPrescriptions)


router.get('/my-prescription', authCheck(Role.PATIENT), prescriptionController.getMyPrescriptions)

router.post('/', authCheck(Role.DOCTOR), prescriptionController.createPrescription)


router.patch('/:id', authCheck(Role.DOCTOR), prescriptionController.updatePrescription)

router.delete('/:id', authCheck(Role.DOCTOR), prescriptionController.deletePrescription)


export const prescriptionRoutes = router