import z from "zod";

export const cartItemIdSchema = z.object({
  itemId: z.uuid("Invalid Item ID"),
});

export const createCartSchema = z.object({
  productId: z.uuid("Invalid Product ID"),
  quantity: z.number(),
});
