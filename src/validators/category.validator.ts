import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters"),
  description: z.string().trim().min(10, "Description must be at least 10 characters").optional(),
  parentId: z.uuid("Invalid parent category ID").optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
