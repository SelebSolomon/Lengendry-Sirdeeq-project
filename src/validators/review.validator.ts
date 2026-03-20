import z from "zod";

export const reviewSchema = z.object({
  productId: z.uuid("Invalid Product ID"),
  review: z
    .string()
    .min(3, "review must be above 3 characters")
    .max(100, "must not be above 100 characters thanks"),
  rating: z.number(),
});
