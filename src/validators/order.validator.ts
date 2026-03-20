import { z } from "zod";

const shippingAddressSchema = z.object({
  street: z.string().trim().min(1, "Street is required"),
  city: z.string().trim().min(1, "City is required"),
  postalCode: z.string().trim().min(1, "Postal code is required"),
  country: z.string().trim().min(1, "Country is required"),
});

export const createOrderSchema = z.object({
  paymentMethod: z.enum(["card", "paypal", "crypto", "cash"], {
    error: "Invalid payment method",
  }),
  shippingAddress: shippingAddressSchema,
});

export const cancelOrderSchema = z.object({
  canceledReason: z.string().min(4, "Not less than 3 characters ").trim(),
});

export const OrderIdSchema = z.object({
  orderId: z.uuid("Invalid product ID"),
});

export const payForOrderSchema = z.object({
  paymentMethod: z.enum(["card", "paypal", "crypto", "cash"], {
    error: "Invalid payment method",
  }),
});

export const updateShippingStatusSchema = z.object({
  shippingStatus: z.enum(["pending", "shipped", "delivered", "canceled"], {
    error: "Invalid shipping status",
  }),
});

export const refundOrderSchema = z.object({
  reason: z.string().trim().min(4, "Reason must be at least 4 characters").optional(),
});
