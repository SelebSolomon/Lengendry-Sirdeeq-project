import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catch-async.js";
import AppError from "../../utils/app-error.js";
import { response } from "../../utils/response.util.js";
import { uploadImage } from "../../lib/cloudinary.js";
import * as categoryService from "./category.service.js";

export const createCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const dto: Record<string, unknown> = { ...req.body };

    // Upload image if provided
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
  async (req: Request, res: Response, next: NextFunction) => {
    const category = categoryService.getAllCategories();

    response(res, 200, category);
  },
);

export const getCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    const category = await categoryService.getCategory(id);

    if (category) {
      return next(new AppError("No category was found", 404));
    }

    return category;
  },
);

export const updateCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {},
);
