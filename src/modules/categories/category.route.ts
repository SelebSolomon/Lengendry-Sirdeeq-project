import express from "express";
import * as categoryController from "./category.controller.js";
import * as authMiddleware from "../../middleware/auth.middleware.js";
import {
  validate,
  validateParams,
} from "../../middleware/validate.middleware.js";
import {
  categoryIdSchema,
  createCategorySchema,
} from "../../validators/category.validator.js";
import { uploadCategoryImage } from "../../lib/multer.js";

const router = express.Router();

router
  .route("/")
  .post(
    authMiddleware.protect,
    authMiddleware.restrictTo("admin"),
    uploadCategoryImage,
    validate(createCategorySchema),
    categoryController.createCategory,
  )
  .get(categoryController.getAllCategory);

router
  .route("/:id")
  .get(categoryController.getCategory)
  .patch(
    authMiddleware.protect,
    authMiddleware.restrictTo("admin"),
    validateParams(categoryIdSchema),
    uploadCategoryImage,
    categoryController.updateCategory,
  )
  .delete(
    authMiddleware.protect,
    authMiddleware.restrictTo("admin"),
    categoryController.deleteCategory,
  );

// router
// .route("/:id/products")
// .get(productController.getCategoryProducts);

// router.use("/:Categoryid/products", productRouter);
// module.exports = router;

export default router;
