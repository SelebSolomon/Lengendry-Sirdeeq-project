import catchAsync from "../../utils/catch-async.js";
import { Request, Response, NextFunction } from "express";
import AppError from "../../utils/app-error.js";
import { response } from "../../utils/response.util.js";
import * as orderService from "./order.service.js";

export const createOrderFromCart = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { shippingAddress, paymentMethod } = req.body;

    const order = await orderService.createOrderFromCart({
      userId: req.user!.id,
      paymentMethod,
      shippingAddress,
    });

    if (!order) return next(new AppError("Your cart is empty", 400));

    response(res, 201, order);
  },
);

export const payForOrder = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const orderId = req.params.orderId as string;
    const { paymentMethod } = req.body;

    const result = await orderService.payForOrder(
      req.user!.id,
      orderId,
      paymentMethod,
    );
    if (!result) return next(new AppError("Order not found", 404));
    if (result === "already_paid") {
      return next(new AppError("Order is already paid", 400));
    }
    response(res, 200, result);
  },
);

export const getMyOrders = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const orders = await orderService.getMyOrders(req.user!.id);
    if (!orders.length) {
      return next(new AppError("No orders found", 404));
    }

    response(res, 200, orders);
  },
);

export const getMySingleOrder = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const orderId = req.params.orderId as string;

    const order = await orderService.getMySingleOrder(req.user!.id, orderId);
    if (!order) return next(new AppError("Order not found", 404));

    response(res, 200, order);
  },
);

export const cancelOrder = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const orderId = req.params.orderId as string;
    const dto = req.body;
    const order = await orderService.cancelOrder(req.user!.id, orderId, dto);
    if (!order) return next(new AppError("Order not found", 404));

    response(res, 200, order);
  },
);

export const reorder = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const orderId = req.params.orderId as string;

    const result = await orderService.reorder(req.user!.id, orderId);
    if (!result) return next(new AppError("Order not found", 404));
    if (result === "canceled")
      return next(new AppError("Cannot reorder a canceled order", 400));

    response(res, 201, result);
  },
);

/////// ADMINS AND VENDORS TO HANDLE THERE ORDERS //////

export const refundOrder = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const orderId = req.params.orderId as string;
    const { reason } = req.body;

    const result = await orderService.refundOrder(orderId, reason);
    if (!result) return next(new AppError("Order not found", 404));
    if (result === "not_paid") return next(new AppError("Only paid orders can be refunded", 400));

    response(res, 200, result);
  },
);

export const updateShippingStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const orderId = req.params.orderId as string;
    const { shippingStatus } = req.body;

    const result = await orderService.updateShippingStatus(orderId, shippingStatus);
    if (!result) return next(new AppError("Order not found", 404));
    if (result === "canceled") return next(new AppError("Cannot change shipping for a canceled order", 400));

    response(res, 200, result);
  },
);

export const getAllOrders = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const orders = await orderService.getAllOrders(req.user!.id, req.user!.role);
    if (!orders.length) return next(new AppError("No orders found", 404));

    response(res, 200, orders);
  },
);
