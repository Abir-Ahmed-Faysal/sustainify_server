import express from 'express';
import { authCheck } from '../../middleware/authCheck';
import { Role } from '../../../generated/prisma/enums';
import { doctorScheduleController } from './doctorSchedule.controller';
import { validateRequest } from '../../middleware/validataionRequest';
import { createDoctorScheduleValidationSchema, updateDoctorScheduleSchema } from './doctorSchedule.validation';



const router = express.Router()


router.get(
  "/",
  authCheck(Role.ADMIN, Role.SUPER_ADMIN),
  doctorScheduleController.getAllDoctorSchedules
);

router.get(
  "/my-doctor-schedules",
  authCheck(Role.DOCTOR),
  doctorScheduleController.getMyDoctorSchedules
);

router.get(
  "/:doctorId/schedules/:scheduleId",
  authCheck(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR),
  doctorScheduleController.getDoctorScheduleById
);

router.post(
  "/create-my-doctor-schedule",
  authCheck(Role.DOCTOR),validateRequest(createDoctorScheduleValidationSchema),
  doctorScheduleController.createMyDoctorSchedule
);

router.patch(
  "/update-my-doctor-schedule",
  authCheck(Role.DOCTOR),validateRequest(updateDoctorScheduleSchema),
  doctorScheduleController.updateMyDoctorSchedule
);

router.delete(
  "/delete-my-doctor-schedule/:id",
  authCheck(Role.DOCTOR),
  doctorScheduleController.deleteMyDoctorSchedule
);




export const DoctorScheduleRoutes = router