import { Router } from "express";
import { categoryController } from "./category.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { categoryValidation } from "./categorySchema";
import { Role } from "../../../generated/prisma";

const router = Router();

// Public: get all categories
router.get("/", categoryController.getAllCategories);

// Admin only: create category
router.post(
    "/",
    checkAuth(Role.ADMIN),
    validateRequest(categoryValidation.createCategoryZodSchema),
    categoryController.createCategory
);

// Admin only: update category
router.patch(
    "/:id",
    checkAuth(Role.ADMIN),
    validateRequest(categoryValidation.updateCategoryZodSchema),
    categoryController.updateCategory
);

// Admin only: delete category
router.delete(
    "/:id",
    checkAuth(Role.ADMIN),
    categoryController.deleteCategory
);

export const categoryRoutes = router;
