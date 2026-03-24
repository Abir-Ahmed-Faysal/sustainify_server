import express from 'express';
import { authCheck } from '../../middleware/authCheck';
import { Role } from '../../../generated/prisma/enums';
import { AppointmentController } from './appointment.controller';
import { validateRequest } from '../../middleware/validataionRequest';
import { createAppointmentPayload, updateAppointmentPayload } from './appointment.validation';



const router = express.Router()

router.get(
  "/all-appointments",
  authCheck(Role.ADMIN, Role.SUPER_ADMIN),
  AppointmentController.getAllAppointments
);

router.get(
  "/my-appointments",
  authCheck(Role.DOCTOR, Role.PATIENT),
  AppointmentController.getMyAppointments
);

router.get(
  "/my-single-appointment/:id",
  authCheck(Role.PATIENT, Role.DOCTOR),
  AppointmentController.getMySingleAppointment
);

router.post(
  "/book-appointment",
  authCheck(Role.PATIENT),validateRequest(createAppointmentPayload),
  AppointmentController.bookAppointment
);
router.post(
  "/book-appointment-with-pay-later",
  authCheck(Role.PATIENT),validateRequest(createAppointmentPayload),
  AppointmentController.bookAppointment
);
router.post(
  "/initiate-payment/:id",
  authCheck(Role.PATIENT),
  AppointmentController.initiatePayment
);

router.patch(
  "/change-appointment/:id",
  authCheck(Role.DOCTOR, Role.PATIENT, Role.ADMIN, Role.SUPER_ADMIN),validateRequest(updateAppointmentPayload),
  AppointmentController.changeAppointmentStatus
);


export const appointmentRoutes= router