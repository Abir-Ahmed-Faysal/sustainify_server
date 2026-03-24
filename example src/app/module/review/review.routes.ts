import { Router } from "express";
import { authCheck } from "../../middleware/authCheck";
import { Role } from "../../../generated/prisma/enums";

const router = Router();


router.post('/', authCheck(Role.PATIENT))
router.get('/my-reviews', authCheck(Role.PATIENT))
router.patch('/:id', authCheck(Role.PATIENT))
router.delete('/:id', authCheck(Role.PATIENT))




export const reviewRoutes = router;