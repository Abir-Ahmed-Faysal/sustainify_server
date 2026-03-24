import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { userRoutes } from "../modules/user/user.routes";
import { adminRoutes } from "../modules/admin/admin.routes";
import { categoryRoutes } from "../modules/category/category.routes";
import { profileRoutes } from "../modules/profile/profile.routes";
import { ideaRoutes } from "../modules/idea/idea.routes";
import { voteRoutes } from "../modules/vote/vote.routes";

const router = Router()

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/admin', adminRoutes)
router.use('/categories', categoryRoutes)
router.use('/profile', profileRoutes)
router.use('/ideas', ideaRoutes)
router.use('/votes', voteRoutes)



export const indexRoutes = router