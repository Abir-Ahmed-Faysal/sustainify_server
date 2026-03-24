import express from 'express';
import { authController } from './auth.controller';
import { authCheck } from '../../middleware/authCheck';
import { Role } from '../../../generated/prisma/enums';
import { validateRequest } from '../../middleware/validataionRequest';
import { ILoginZodSchema } from './authReq.validation';
const router = express.Router()


router.post("/register", authController.registerPatient)
router.post('/login',validateRequest(ILoginZodSchema), authController.login)
router.get('/me', authCheck(Role.ADMIN, Role.DOCTOR, Role.PATIENT, Role.SUPER_ADMIN), authController.getMe)
router.post('/refresh-token', authCheck(Role.ADMIN, Role.DOCTOR, Role.PATIENT, Role.SUPER_ADMIN), authController.getNewToken)
router.post('/change-password', authCheck(Role.ADMIN, Role.DOCTOR, Role.PATIENT, Role.SUPER_ADMIN), authController.changePassword)


router.post('/verify-email', authController.verifyEmail)
router.post('/forgot-password', authController.forgetPassword)
router.post('/reset-password', authController.resetPassword)

router.post('/logout', authCheck(Role.ADMIN, Role.DOCTOR, Role.PATIENT, Role.SUPER_ADMIN), authController.logout)
router.get('/login/google', authController.googleAuth)
router.get('/google/success', authController.googleLoginSuccess)
router.get('/oauth/error', authController.handlerAuthError)



export const authRouter = router
