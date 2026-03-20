import crypto from "crypto";
import { prisma } from "../../lib/prisma.js";
import { ENV } from "../../config/env.config.js";
import { PaystackChargeData } from "./dto/payment.dto.js";

export const verifyWebhookSignature = (
  rawBody: Buffer,
  signature: string,
): boolean => {
  const hash = crypto
    .createHmac("sha512", ENV.PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest("hex");

  return hash === signature;
};

export const handleChargeSuccess = async (data: PaystackChargeData) => {
  const { reference, metadata, amount } = data;
  const { orderId, userId } = metadata;

  // Prevent duplicate processing
  const existing = await prisma.payment.findUnique({ where: { reference } });
  if (existing) return;

  await prisma.$transaction(async (tx) => {
    await tx.payment.create({
      data: {
        orderId,
        userId,
        reference,
        amount: amount / 100, // convert back from kobo
        status: "success",
      },
    });

    await tx.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "paid",
        transactionId: reference,
        paidAt: new Date(),
      },
    });
  });
};
