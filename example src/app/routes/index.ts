import express from 'express';
import { SpecialtyRouter } from '../module/specialty/speciality.route';
import { authRouter } from '../module/auth/auth.route';
import { userRoutes } from '../module/user/user.route';
import { doctorRoutes } from '../module/doctor/doctor.routes';
import { superAdminRoutes } from '../superAdmin/superAdmin.routes';
import { adminRoutes } from '../module/admin/admin.routes';
import { scheduleRoutes } from '../module/schedule/schedule.routes';
import { DoctorScheduleRoutes } from '../module/doctorSchedule/doctorSchedule.routes';
import { appointmentRoutes } from '../module/appointment/appointment.routes';
import { profileUpdateRoute } from '../module/patient/patient.routes';
import { prescriptionRoutes } from '../module/prescription/prescription.routes';
import { statsRoutes } from '../module/stats/stats.routes';
import { paymentRoutes } from '../module/payment/payment.routes';



const router = express.Router()


router.use("/auth", authRouter)
router.use("/user", userRoutes)
router.use("/specialty", SpecialtyRouter)
router.use("/doctors", doctorRoutes)
router.use("/admins", adminRoutes)
router.use("/super-admins", superAdminRoutes)
router.use('/schedules', scheduleRoutes)
router.use('/doctor-schedules', DoctorScheduleRoutes)
router.use('/appointments', appointmentRoutes)
router.use('/profile', profileUpdateRoute)
router.use('/prescription', prescriptionRoutes)
router.use('payment', paymentRoutes)
router.use('/stats', statsRoutes)


export const indexRoutes = router

