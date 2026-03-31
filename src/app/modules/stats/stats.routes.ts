import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma";
import { statsController } from "./stats.controller";

const router= Router()


router.get('/',checkAuth(Role.MEMBER,Role.ADMIN),statsController.getDashboardStatsData)




export const statsRoutes=router