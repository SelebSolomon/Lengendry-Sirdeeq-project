import express from "express";
import * as authMiddleware from "../../middleware/auth.middleware.js";
import * as orderController from "./order.controller.js";
import {
  validate,
  validateParams,
} from "../../middleware/validate.middleware.js";
import {
  cancelOrderSchema,
  createOrderSchema,
  OrderIdSchema,
  payForOrderSchema,
  refundOrderSchema,
  updateShippingStatusSchema,
} from "../../validators/order.validator.js";

const router = express.Router();

router.use(authMiddleware.protect);
router
  .route("/")
  .post(validate(createOrderSchema), orderController.createOrderFromCart);
router.route("/my-orders").get(orderController.getMyOrders);

router
  .route("/:orderId/pay")
  .post(
    validateParams(OrderIdSchema),
    validate(payForOrderSchema),
    orderController.payForOrder,
  );
router
  .route("/:orderId")
  .get(validateParams(OrderIdSchema), orderController.getMySingleOrder);
router
  .route("/:orderId/cancel")
  .patch(
    validate(cancelOrderSchema),
    validateParams(OrderIdSchema),
    orderController.cancelOrder,
  );
router
  .route("/:orderId/reorder")
  .post(validateParams(OrderIdSchema), orderController.reorder);


  /////////////////// ADMINS AND VENDORS ////////////////
  router.get("/all", authMiddleware.restrictTo("admin", "vendor"), orderController.getAllOrders);
  router.patch(
    "/:orderId/refund",
    authMiddleware.restrictTo("admin"),
    validateParams(OrderIdSchema),
    validate(refundOrderSchema),
    orderController.refundOrder,
  );
  router.patch(
    "/:orderId/shipping-status",
    authMiddleware.restrictTo("admin", "vendor"),
    validateParams(OrderIdSchema),
    validate(updateShippingStatusSchema),
    orderController.updateShippingStatus,
  );
export default router;
