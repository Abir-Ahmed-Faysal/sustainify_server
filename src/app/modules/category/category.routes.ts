import { Router } from "express";
import { categoryController } from "./category.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { categoryValidation } from "./categorySchema";

const router = Router();

// Public: get all categories
router.get("/", categoryController.getAllCategories);

// Admin only: create category
router.post(
    "/",
    checkAuth("ADMIN"),
    validateRequest(categoryValidation.createCategoryZodSchema),
    categoryController.createCategory
);

// Admin only: update category
router.patch(
    "/:id",
    checkAuth("ADMIN"),
    validateRequest(categoryValidation.updateCategoryZodSchema),
    categoryController.updateCategory
);

// Admin only: delete category
router.delete(
    "/:id",
    checkAuth("ADMIN"),
    categoryController.deleteCategory
);

export const categoryRoutes = router;
