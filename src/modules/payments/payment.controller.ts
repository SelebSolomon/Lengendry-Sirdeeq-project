import { Request, Response, NextFunction } from "express";
import catchAsync from "../../utils/catch-async.js";
import AppError from "../../utils/app-error.js";
import * as paymentService from "./payment.service.js";
import { PaystackWebhookEvent } from "./dto/payment.dto.js";

export const webhook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const signature = req.headers["x-paystack-signature"] as string;

    if (!signature) return next(new AppError("No signature provided", 400));

    const isValid = paymentService.verifyWebhookSignature(req.body, signature);
    if (!isValid) return next(new AppError("Invalid signature", 401));

    const event: PaystackWebhookEvent = JSON.parse(req.body.toString());

    if (event.event === "charge.success") {
      await paymentService.handleChargeSuccess(event.data);
    }

    res.status(200).json({ received: true });
  },
);
