import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { userRoutes } from "../modules/user/user.routes";
import { adminRoutes } from "../modules/admin/admin.routes";
import { categoryRoutes } from "../modules/category/category.routes";
import { profileRoutes } from "../modules/profile/profile.routes";
import { ideaRoutes } from "../modules/idea/idea.routes";

const router = Router()

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/admin', adminRoutes)
router.use('/categories', categoryRoutes)
router.use('/profile', profileRoutes)
router.use('/ideas', ideaRoutes)



export const indexRoutes = router