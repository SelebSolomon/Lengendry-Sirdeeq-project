import { prisma } from "../../lib/prisma.js";
import { CancelOrderReason, CreateOrderDto } from "./dto/order.dto.js";
import { orderResponse } from "./response/order.response.js";

import { ENV } from "../../config/env.config.js";
import Paystack from "@paystack/paystack-sdk";
const paystack = new Paystack(ENV.PAYSTACK_SECRET_KEY);

export const createOrderFromCart = async (dto: CreateOrderDto) => {
  const { userId, paymentMethod, shippingAddress } = dto;

  // Fetch cart with items and product details for snapshots
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: { select: { name: true, thumbnail: true } },
        },
      },
    },
  });

  if (!cart || !cart.items.length) return null;

  //   TODO
  // i will use a transaction here
  // Use a transaction: create order + clear cart atomically
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        userId,
        paymentMethod,
        totalPrice: cart.totalPrice,
        street: shippingAddress.street,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            nameSnapshot: item.product.name,
            imageSnapshot: item.product.thumbnail,
            quantity: item.quantity,
            price: item.priceSnapshot,
          })),
        },
      },
      select: orderResponse,
    });

    // Clear the cart
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    await tx.cart.update({
      where: { id: cart.id },
      data: { totalPrice: 0 },
    });

    return newOrder;
  });

  return order;
};

export const getMyOrders = async (userId: string) => {
  return prisma.order.findMany({
    where: { userId, isActive: true },
    select: orderResponse,
  });
};

export const getMySingleOrder = async (userId: string, orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { userId, id: orderId },
    select: orderResponse,
  });

  return order;
};

export const cancelOrder = async (
  userId: string,
  orderId: string,
  dto: CancelOrderReason,
) => {
  const existing = await prisma.order.findUnique({
    where: { id: orderId, userId },
  });
  if (!existing) return null;

  return prisma.order.update({
    where: { id: orderId },
    data: {
      shippingStatus: "canceled",
      canceledReason: dto.canceledReason,
      canceledAt: new Date(),
    },
    select: orderResponse,
  });
};

export const reorder = async (userId: string, orderId: string) => {
  const oldOrder = await prisma.order.findUnique({
    where: { id: orderId, userId },
    include: { items: true },
  });

  if (!oldOrder) return null;
  if (oldOrder.shippingStatus === "canceled") return "canceled";

  return prisma.order.create({
    data: {
      userId,
      totalPrice: oldOrder.totalPrice,
      paymentMethod: oldOrder.paymentMethod,
      street: oldOrder.street,
      city: oldOrder.city,
      postalCode: oldOrder.postalCode,
      country: oldOrder.country,
      items: {
        create: oldOrder.items.map((item) => ({
          productId: item.productId,
          nameSnapshot: item.nameSnapshot,
          imageSnapshot: item.imageSnapshot,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
    select: orderResponse,
  });
};

export const payForOrder = async (
  userId: string,
  orderId: string,
  paymentMethod: string,
) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId, userId },
    select: { ...orderResponse, paymentStatus: true },
  });

  if (!order) return null;
  if (order.paymentStatus === "paid") return "already_paid";

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  const result = await paystack.transaction.initialize({
    email: user!.email,
    amount: String(Math.round(order.totalPrice * 100)), // Paystack expects kobo as string
    channels: [paymentMethod],
    metadata: { orderId, userId },
  });

  return result.data;
};

export const updateShippingStatus = async (
  orderId: string,
  shippingStatus: string,
) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return null;
  if (order.shippingStatus === "canceled") return "canceled";

  return prisma.order.update({
    where: { id: orderId },
    data: {
      shippingStatus: shippingStatus as any,
      ...(shippingStatus === "delivered" && { deliveredAt: new Date() }),
    },
    select: orderResponse,
  });
};

export const refundOrder = async (orderId: string, reason: string) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return null;
  if (order.paymentStatus !== "paid") return "not_paid";

  // Trigger refund on Paystack using the stored transaction reference
  if (order.transactionId) {
    await paystack.refund.create({
      transaction: order.transactionId,
      amount: String(Math.round(order.totalPrice * 100)),
    });
  }

  return prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: "refunded",
      canceledReason: reason || "No reason provided",
      canceledAt: new Date(),
    },
    select: orderResponse,
  });
};

export const getAllOrders = async (userId: string, role: string) => {
  if (role === "admin") {
    return prisma.order.findMany({ select: orderResponse });
  }

  //  only orders that contain their products
  return prisma.order.findMany({
    where: {
      items: {
        some: {
          product: { vendorId: userId },
        },
      },
    },
    select: orderResponse,
  });
};
