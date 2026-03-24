import express from 'express';
import { authCheck } from '../../middleware/authCheck';
import { Role } from '../../../generated/prisma/enums';
import { scheduleController } from './schedule.controller';
import { validateRequest } from '../../middleware/validataionRequest';
import { createScheduleValidation, updateScheduleValidation } from './schedule.validation';


const router = express.Router()



router.get('/', authCheck(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR), scheduleController.getAllSchedule)

router.get('/:id', authCheck(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR), scheduleController.getScheduleById)

router.post('/', authCheck(Role.ADMIN, Role.SUPER_ADMIN), validateRequest(createScheduleValidation), scheduleController.createSchedule)

router.patch('/:id', authCheck(Role.SUPER_ADMIN, Role.ADMIN), validateRequest(updateScheduleValidation), scheduleController.updateSchedule)

router.delete('/:id', authCheck(Role.SUPER_ADMIN, Role.ADMIN,), scheduleController.deleteSchedule)

export const scheduleRoutes = router