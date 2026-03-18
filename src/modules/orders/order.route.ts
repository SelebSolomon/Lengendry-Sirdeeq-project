import express from "express";
import * as authMiddleware from "../../middleware/auth.middleware.js";
import * as orderController from "./order.controller.js";

const router = express.Router();

router.use(authMiddleware.protect);
router.route("/").post(orderController.createOrderFromCart);
// router.route("/my-orders").get(orderController.getMyOrders);

// router.route("/:orderId/pay").post(orderController.payForOrder);
// router.route("/:orderId").get(orderController.getMySingleOrder);
// router.route("/:orderId/cancel").patch(orderController.cancelOrder);
// router.route("/:orderId/reorder").post(orderController.reorder);

export default router;
