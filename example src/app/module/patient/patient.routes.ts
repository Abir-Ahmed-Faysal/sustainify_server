import { Router } from "express";
import { validateRequest } from "../../middleware/validataionRequest";
import { patientValidation } from "./patient.validation";
import { authCheck } from "../../middleware/authCheck";
import { Role } from "../../../generated/prisma/enums";
import { patientController } from "./patient.controller";
import { multerUpload } from "../../config/multer.config";
import { transformPatientPayload } from "./patient.middleWare";



const router = Router()


router.patch('/update-my-profile', authCheck(Role.PATIENT), multerUpload.fields([{ name: "profilePhoto", maxCount: 1 }, { name: "medicalReports", maxCount: 5 }]),transformPatientPayload , validateRequest(patientValidation.updatePatientProfileZodSchema), patientController.updateMyProfile)



export const profileUpdateRoute = router