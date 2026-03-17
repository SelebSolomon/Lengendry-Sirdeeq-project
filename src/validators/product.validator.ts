import { z } from "zod";

export const productIdSchema = z.object({
  id: z.uuid("Invalid product ID"),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters"),
  price: z.coerce.number().positive("Price must be a positive number"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative").default(0),
  categoryId: z.uuid("Invalid category ID"),
}); 

export type CreateProductInput = z.infer<typeof createProductSchema>;
