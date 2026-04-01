import { Router } from "express";
import { BlogController } from "./blog.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma";
import { validateRequest } from "../../middleware/validateRequest";
import { BlogValidation } from "./blog.validation";

const router = Router();

// Public: get all blogs
router.get("/", BlogController.getAllBlogs);

// Public: get single blog by ID
router.get("/:id", BlogController.getBlogById);

// Public: get single blog by slug
router.get("/slug/:slug", BlogController.getBlogBySlug);

// Admin: create blog
router.post(
  "/",
  checkAuth(Role.ADMIN),
  validateRequest(BlogValidation.createBlog),
  BlogController.createBlog
);

// Admin: update blog
router.patch(
  "/:id",
  checkAuth(Role.ADMIN),
  validateRequest(BlogValidation.updateBlog),
  BlogController.updateBlog
);

// Admin: delete blog
router.delete("/:id", checkAuth(Role.ADMIN), BlogController.deleteBlog);

export const blogRoutes = router;
