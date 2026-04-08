import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { userRoutes } from "../modules/user/user.routes";
import { adminRoutes } from "../modules/admin/admin.routes";
import { categoryRoutes } from "../modules/category/category.routes";
import { profileRoutes } from "../modules/profile/profile.routes";
import { ideaRoutes } from "../modules/idea/idea.routes";
import { ideaAdminRoutes } from "../modules/idea/idea.admin.routes";
import { voteRoutes } from "../modules/vote/vote.routes";
import { commentRoutes } from "../modules/comment/comment.routes";
import { favouriteRoutes } from "../modules/favourite/favourite.routes";
import { newsLetterRoutes } from "../modules/newsLetter/newsLetter.routes";
import { paymentRoutes } from "../modules/payment/payment.routes";
import { accessRoutes } from "../modules/access/access.routes";
import { statsRoutes } from "../modules/stats/stats.routes";
import { blogRoutes } from "../modules/blog/blog.routes";
import contactRouter from "../modules/contact/contact.routes";

const router = Router()

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/admin', adminRoutes)
router.use('/categories', categoryRoutes)
router.use('/profile', profileRoutes)
router.use('/ideas', ideaRoutes)
router.use('/ideas/admin', ideaAdminRoutes)
router.use('/votes', voteRoutes)
router.use('/comments', commentRoutes)
router.use('/favourites', favouriteRoutes)
router.use('/newsletters', newsLetterRoutes)
router.use('/payment', paymentRoutes)
router.use('/access', accessRoutes)
router.use("/stats",statsRoutes)
router.use("/blogs", blogRoutes);
router.use("/contact", contactRouter);




export const indexRoutes = router