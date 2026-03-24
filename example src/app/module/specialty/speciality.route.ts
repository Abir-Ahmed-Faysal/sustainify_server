import express from 'express';
import { specialtyController } from './speciality.controller';

import { authCheck } from '../../middleware/authCheck';
import { Role } from '../../../generated/prisma/enums';
import { multerUpload } from '../../config/multer.config';
import { validateRequest } from '../../middleware/validataionRequest';
import { specialtyValidation } from './specilty.res.validation';




const router = express.Router()



router.get("/",  specialtyController.getAllSpecialty)
router.post("/",
    //  authCheck(Role.SUPER_ADMIN, Role.ADMIN),
    multerUpload.single("file"),
     validateRequest(specialtyValidation),
    specialtyController.createSpecialty)
router.patch("/:id", authCheck(Role.SUPER_ADMIN, Role.ADMIN), specialtyController.updateSpecialty)
router.delete("/:id", authCheck(Role.SUPER_ADMIN, Role.ADMIN), specialtyController.deleteSpecialty)




export const SpecialtyRouter = router