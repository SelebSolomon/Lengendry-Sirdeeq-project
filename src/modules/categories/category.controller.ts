import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catch-async.js";
import AppError from "../../utils/app-error.js";
import { response } from "../../utils/response.util.js";
import { deleteImage, uploadImage } from "../../lib/cloudinary.js";
import * as categoryService from "./category.service.js";

export const createCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const dto: Record<string, unknown> = { ...req.body };

    console.log("the image is logged right here", req.file);
    if (req.file) {
      try {
        const uploaded = await uploadImage(req.file, "categories");
        dto.image = uploaded.secure_url;
        dto.imagePublicId = uploaded.public_id;
      } catch {
        return next(new AppError("Image upload failed, please try again", 502));
      }
    }

    const category = await categoryService.createCategory(dto as any);
    if (!category) return next(new AppError("Parent category not found", 404));

    response(res, 201, category);
  },
);

export const getAllCategory = catchAsync(
  async (_req: Request, res: Response, next: NextFunction) => {
    const categories = await categoryService.getAllCategories();
    if (!categories.length)
      return next(new AppError("No categories found", 404));
    response(res, 200, categories);
  },
);

export const getCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    const category = await categoryService.getCategory(id);
    if (!category) return next(new AppError("Category not found", 404));

    response(res, 200, category);
  },
);

export const updateCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    const existing = await categoryService.getCategoryForUpdate(id);
    if (!existing) return next(new AppError("Category not found", 404));

    const allowedFields = ["name", "description", "parentId"];
    const dto: Record<string, unknown> = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedFields.includes(key)),
    );

    // Allow explicitly removing parent by passing parentId: null
    if (req.body.parentId === null) dto.parentId = null;

    if (req.file) {
      try {
        // Delete old image from Cloudinary if exists
        if (existing.imagePublicId) await deleteImage(existing.imagePublicId);
        const uploaded = await uploadImage(req.file, "categories");
        dto.image = uploaded.secure_url;
        dto.imagePublicId = uploaded.public_id;
      } catch {
        return next(new AppError("Image upload failed, please try again", 502));
      }
    }

    const category = await categoryService.updateCategory(id, dto as any);
    response(res, 200, category);
  },
);

export const deleteCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    const category = await categoryService.getCategoryForDelete(id);
    if (!category) return next(new AppError("Category not found", 404));

    const hasChildren = await categoryService.hasChildCategories(id);
    if (hasChildren)
      return next(
        new AppError(
          "Cannot delete category with child categories. Remove or reassign them first.",
          400,
        ),
      );

    if (category.imagePublicId) {
      try {
        await deleteImage(category.imagePublicId);
      } catch {
        return next(new AppError("Failed to delete category image", 502));
      }
    }

    await categoryService.deleteCategory(id);

    response(res, 204, "Category deleted successfully");
  },
);
