import { Router } from "express";
import { authCheck } from "../../middleware/authCheck";
import { Role } from "../../../generated/prisma/enums";
import { statsController } from "./stats.controller";



const router = Router()


router.get('/', authCheck(Role.SUPER_ADMIN, Role.ADMIN, Role.DOCTOR, Role.PATIENT), statsController.getDashboardStatsData)



export const statsRoutes = router