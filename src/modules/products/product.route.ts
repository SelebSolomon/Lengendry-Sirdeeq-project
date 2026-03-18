import { uploadProductImages } from "../../lib/multer.js";

import express from "express";
import * as productController from "./product.controller.js";
import * as authMiddleware from "../../middleware/auth.middleware.js";
import {
  validate,
  validateParams,
} from "../../middleware/validate.middleware.js";
import {
  createProductSchema,
  productIdSchema,
} from "../../validators/product.validator.js";
import { checkProductOwnership } from "../../middleware/checkProductOwnership.middleware.js";

const router = express.Router({ mergeParams: true });
router
  .route("/")
  .get(productController.getAllProducts)
  .post(
    authMiddleware.protect,
    authMiddleware.restrictTo("admin", "vendor"),
    uploadProductImages,
    validate(createProductSchema),
    productController.postProduct,
  );


router
  .route("/:id")
  .get(validateParams(productIdSchema), productController.getOne)
  .patch(
    authMiddleware.protect,
    authMiddleware.restrictTo("admin", "vendor"),
    validateParams(productIdSchema),
    checkProductOwnership,
    uploadProductImages,
    productController.updateProduct,
  )
  .delete(
    authMiddleware.protect,
    authMiddleware.restrictTo("admin", "vendor"),
    validateParams(productIdSchema),
    checkProductOwnership,
    productController.deleteProduct,
  );

export default router;
