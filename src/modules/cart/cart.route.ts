import express from "express";

import * as cartController from "./cart.controller.js";
import * as authMiddleware from "../../middleware/auth.middleware.js";
import {
  validate,
  validateParams,
} from "../../middleware/validate.middleware.js";
import {
  cartItemIdSchema,
  createCartSchema,
} from "../../validators/cart.validator.js";
const router = express.Router();

router.use(authMiddleware.protect);
router
  .route("/")
  .post(validate(createCartSchema), cartController.addToCart)
  .get(cartController.getCart)
  .delete( cartController.clearCart)

router
  .route("/:itemId")
  .patch(validateParams(cartItemIdSchema), cartController.updateCart)
  .delete(cartController.removeItem);

export default router;
